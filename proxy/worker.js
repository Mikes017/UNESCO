// ============================================================================
//  VERIFIED · PROXY (Cloudflare Worker) — FASE 2
// ----------------------------------------------------------------------------
//  Este Worker es el intermediario seguro entre el juego (navegador) y Gemini.
//  ¿Por qué existe? Porque una API key NO puede vivir en el código del navegador
//  (cualquiera la roba del "ver código fuente" y te vacía la cuenta). El juego
//  llama a ESTE Worker; el Worker guarda la key en secreto y llama a Gemini.
//
//  Además el Worker:
//    · Fuerza el esquema (pide a Gemini responder en JSON con etiquetas válidas).
//    · Modera entrada y salida (nada dañino entra o sale — es app juvenil).
//    · Limita el rate por IP (evita abuso porque la URL es pública).
//    · Devuelve códigos claros para que el juego sepa cuándo caer a offline:
//        200 → reacción JSON válida
//        429 → "tokens"  (agotados / rate) → el juego apaga el puente y avisa
//        502 → "red"     (error de Gemini) → fallback offline
//
//  DESPLIEGUE (una vez):
//    1. npm i -g wrangler   &&   wrangler login
//    2. wrangler secret put GEMINI_API_KEY      (pega tu key gratis de AI Studio)
//    3. wrangler deploy
//    4. copia la URL del Worker → ponla en agentes_online.js (PROXY_URL)
//
//  wrangler.toml mínimo:
//    name = "verified-proxy"
//    main = "worker.js"
//    compatibility_date = "2026-07-01"
// ============================================================================

const MODELO = "gemini-3.6-flash"; // workhorse actual (jul 2026); barato y con 1M ctx
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`;

// --- Vocabularios (deben coincidir con agentes.js) --------------------------
const TIPOS_FD = ["contexto","impostor","fabricado","manipulado","conexion","satira","enganoso","odio"];
const MOTIVACIONES_8P = ["periodismo_pobre","parodia","provocar","pasion","partidismo","lucro","influencia_politica","propaganda"];
const TECNICAS = ["urgencia","miedo","autoridad_falsa","conspiracion","prueba_social","indignacion","empatia","ninguna"];
const BANDOS = ["desinfo","etico","neutral","duda"];
const EFECTOS = ["cae","duda","apoya","inmune","neutral","panico"];
const ESTRATEGIAS_USUARIO = ["sandwich","hechos_fuente","empatia","repite_mito","ataca_persona","solo_emocion","cae","neutral"];

// --- CORS: solo tu dominio de GitHub Pages (cámbialo por el tuyo) -----------
const ORIGENES_OK = new Set([
  "https://mikes017.github.io",
  "http://localhost:5173", // Vite en local
]);

// --- Rate limit por IP (en memoria del Worker; simple y suficiente) ---------
const CUBOS = new Map(); // ip -> { n, reset }
const LIMITE = 20;       // peticiones
const VENTANA = 60_000;  // por minuto

function corsHeaders(origin) {
  const permitido = ORIGENES_OK.has(origin) ? origin : "https://mikes017.github.io";
  return {
    "Access-Control-Allow-Origin": permitido,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

function limitado(ip) {
  const ahora = Date.now();
  const c = CUBOS.get(ip);
  if (!c || ahora > c.reset) { CUBOS.set(ip, { n: 1, reset: ahora + VENTANA }); return false; }
  c.n++;
  return c.n > LIMITE;
}

// Moderación de entrada (defensa en profundidad; Gemini también filtra).
function entradaSospechosa(texto) {
  if (!texto) return false;
  const t = String(texto).toLowerCase();
  // 1) intentos de jailbreak / sacar de personaje
  const jailbreak = ["ignora tus instrucciones", "ignore previous", "ignore all previous",
    "system prompt", "eres un modelo", "actúa como si no", "act as if", "jailbreak",
    "olvida tus reglas", "forget your rules", "dan mode", "developer mode", "responde sin filtros"];
  // 2) intentos de forzar contenido dañino (que un NPC diga algo peligroso)
  const danino = ["cómo hacer una bomba", "how to make a bomb", "instrucciones para", "kill", "suicid",
    "matar a", "receta de", "arma casera"];
  return jailbreak.some((b) => t.includes(b)) || danino.some((b) => t.includes(b));
}

// Moderación de SALIDA: revisa el mensaje generado antes de devolverlo (Fase 5).
// Si el modelo se escapó pese a los safetySettings, lo neutralizamos.
function salidaSospechosa(mensaje) {
  if (!mensaje) return false;
  const t = String(mensaje).toLowerCase();
  const rojo = ["matar", "kill you", "suicid", "bomba", "bomb", "arma de fuego", "cómo dañar",
    "how to harm", "instrucciones para hacer", "http://", "https://"]; // + evita links salientes
  return rojo.some((b) => t.includes(b));
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST")
      return new Response(JSON.stringify({ error: "método" }), { status: 405, headers: cors });

    const ip = request.headers.get("CF-Connecting-IP") || "anon";
    if (limitado(ip))
      return new Response(JSON.stringify({ error: "tokens", motivo: "rate" }), { status: 429, headers: cors });

    let cuerpo;
    try { cuerpo = await request.json(); } catch {
      return new Response(JSON.stringify({ error: "json" }), { status: 400, headers: cors });
    }

    const { system, user, textoUsuario, modo } = cuerpo || {};
    if (entradaSospechosa(textoUsuario) || entradaSospechosa(user)) {
      // no llamamos a Gemini: devolvemos algo neutro y seguro
      return new Response(JSON.stringify({
        mensaje: "…", bando: "neutral", tipo_firstdraft: null,
        motivacion_8p: null, tecnica: "ninguna", mil: null, efecto: "neutral",
      }), { status: 200, headers: cors });
    }

    // --- Llamada a Gemini con salida forzada a JSON del esquema -------------
    const payload = {
      systemInstruction: { parts: [{ text: system || "Eres un vecino en un chat." }] },
      contents: [{ role: "user", parts: [{ text: user || "" }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 1024,
        responseMimeType: "application/json", // Gemini devuelve JSON puro
      },
      safetySettings: [ // filtros de seguridad (app juvenil)
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    };

    let data;
    try {
      const r = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify(payload),
      });
      if (r.status === 429)
        return new Response(JSON.stringify({ error: "tokens", motivo: "tokens" }), { status: 429, headers: cors });
      if (!r.ok)
        return new Response(JSON.stringify({ error: "red", motivo: "red", detalle: r.status }), { status: 502, headers: cors });
      data = await r.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "red", motivo: "red" }), { status: 502, headers: cors });
    }

    // Si el modelo bloqueó por seguridad, no hay candidates → neutro seguro.
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!txt)
      return new Response(JSON.stringify({
        mensaje: "…", bando: "neutral", tipo_firstdraft: null,
        motivacion_8p: null, tecnica: "ninguna", mil: null, efecto: "neutral",
      }), { status: 200, headers: cors });

    // Parseo + saneo al esquema (el candado FINAL vive igual en el juego).
    let obj;
    try { obj = JSON.parse(txt); } catch {
      return new Response(JSON.stringify({ error: "red", motivo: "parse" }), { status: 502, headers: cors });
    }
    // Modo clasificación (Fase 4): devolver solo una categoría válida.
    if (modo === "clasificar") {
      const cat = ESTRATEGIAS_USUARIO.includes(obj?.categoria) ? obj.categoria : "neutral";
      return new Response(JSON.stringify({ categoria: cat }), { status: 200, headers: cors });
    }
    const limpio = sanear(obj);
    // Moderación de SALIDA (Fase 5): si el mensaje trae algo rojo, lo neutralizamos.
    if (salidaSospechosa(limpio.mensaje)) {
      limpio.mensaje = "…";
      limpio.bando = "neutral"; limpio.tipo_firstdraft = null;
      limpio.motivacion_8p = null; limpio.tecnica = "ninguna"; limpio.efecto = "neutral";
    }
    return new Response(JSON.stringify(limpio), { status: 200, headers: cors });
  },
};

// Saneo servidor: recorta y valida etiquetas. (El juego vuelve a validar; doble red.)
function sanear(o) {
  const enONull = (v, lista) => (v == null ? null : lista.includes(v) ? v : null);
  const mil = Number.isInteger(o?.mil) && o.mil >= 1 && o.mil <= 9 ? o.mil : null;
  return {
    mensaje: (typeof o?.mensaje === "string" ? o.mensaje : "…").slice(0, 240),
    bando: BANDOS.includes(o?.bando) ? o.bando : "neutral",
    tipo_firstdraft: enONull(o?.tipo_firstdraft, TIPOS_FD),
    motivacion_8p: enONull(o?.motivacion_8p, MOTIVACIONES_8P),
    tecnica: enONull(o?.tecnica, TECNICAS) || "ninguna",
    mil,
    efecto: EFECTOS.includes(o?.efecto) ? o.efecto : "neutral",
  };
}
