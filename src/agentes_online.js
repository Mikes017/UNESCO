// ============================================================================
//  VERIFIED · CLIENTE ONLINE — FASE 2
// ----------------------------------------------------------------------------
//  Conecta el juego al proxy (Cloudflare Worker → Gemini). Reemplaza el stub
//  llamarProxy() de la Fase 1 con el fetch real, timeout y manejo de errores.
//  Mantiene INTACTO el contrato: todo pasa por validarReaccion() en agentes.js,
//  así que la pedagogía sigue blindada aunque el LLM alucine.
//
//  Uso desde el juego:
//    import { pedirReaccion, puente, alertaDe } from "./agentes.js";
//    import { activarLLM } from "./agentes_online.js";
//    activarLLM();                       // enciende el puente (intenta LLM)
//    const { reaccion, fuente, alerta } = await pedirReaccion(ctx);
//    if (alerta) mostrarAlerta(alerta);  // "sin señal / se agotaron créditos"
// ============================================================================

import { puente, construirPrompt, construirPromptClasificacion, construirPromptCasos, validarCasoGenerado, validarReaccion } from "./agentes.js";

// 👉 PON AQUÍ la URL de tu Worker tras `wrangler deploy`
export const PROXY_URL = "https://verified-proxy.miguelgrnova.workers.dev";

// Con Flash-Lite las respuestas llegan en ~1 s. Dejamos un tope amplio (redes
// móviles lentas) sin llegar a congelar el juego si algo se atora.
const TIMEOUT_MS = 12000;

// Tras una caída volvemos a intentar, esperando cada vez un poco más.
const RECONEXION_BASE_MS = 15000;
const RECONEXION_MAX_MS = 120000;
const RECONEXION_TOKENS_MS = 60000; // la cuota gratuita se libera por minuto

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

let fallosSeguidos = 0;
let temporizadorReconexion = null;

// Re-arma el puente pasado un rato. No gastamos una llamada extra en sondear:
// la siguiente reacción del juego hace de prueba. Si vuelve a fallar, cae otra
// vez y esperamos más. Así una caída deja de ser definitiva.
function programarReconexion(motivo) {
  if (temporizadorReconexion) return;
  fallosSeguidos++;
  const espera = motivo === "tokens"
    ? RECONEXION_TOKENS_MS
    : Math.min(RECONEXION_BASE_MS * 2 ** (fallosSeguidos - 1), RECONEXION_MAX_MS);
  temporizadorReconexion = setTimeout(() => {
    temporizadorReconexion = null;
    if (!puente.online && puente.motivo !== "manual") activarLLM();
  }, espera);
}

// Marca el fallo, programa la reconexión y arma el error que espera agentes.js.
function fallo(motivo) {
  programarReconexion(motivo);
  const e = new Error(motivo);
  e.motivo = motivo;
  return e;
}

// fetch con límite de tiempo (para no dejar al usuario esperando)
async function fetchConTimeout(url, opciones, ms) {
  const ctrl = new AbortController();
  let expiro = false;
  const id = setTimeout(() => { expiro = true; ctrl.abort(); }, ms);
  try {
    return await fetch(url, { ...opciones, signal: ctrl.signal });
  } catch (e) {
    e.expiro = expiro; // distingue "se acabó el tiempo" de "se cayó la red"
    throw e;
  } finally {
    clearTimeout(id);
  }
}

// Envía un cuerpo al proxy y devuelve el JSON crudo (lo valida agentes.js).
// Lanza errores con .motivo para que pedirReaccion() sepa qué alerta mostrar.
async function pedirAlProxy(cuerpo) {
  let res;
  for (let intento = 0; ; intento++) {
    try {
      res = await fetchConTimeout(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      }, TIMEOUT_MS);
      break;
    } catch (e) {
      // Un tropiezo instantáneo de red merece un reintento rápido. Si expiró el
      // tiempo, no insistimos: duplicaría la espera y congelaría el juego.
      if (e.expiro || intento >= 1) throw fallo("red");
      await esperar(600);
    }
  }
  if (res.status === 429) throw fallo("tokens");
  if (!res.ok) throw fallo("red");
  fallosSeguidos = 0; // conexión sana: reinicia el backoff
  return await res.json();
}

// Reacciones de NPC.
async function llamarProxyReal(ctx) {
  const { system, user } = construirPrompt(ctx); // user ya lleva historial y caso
  return pedirAlProxy({ system, user, textoUsuario: ctx.textoUsuario || null });
}

// Clasificación de texto libre vía LLM (Fase 4). Devuelve { categoria }.
async function clasificarProxyReal(texto, ctx) {
  const { system, user } = construirPromptClasificacion(texto, ctx);
  return pedirAlProxy({ system, user, textoUsuario: texto, modo: "clasificar" });
}

// Fase 6: clasificación + reacción en UNA sola petición (la mitad de cuota).
async function combinadoProxyReal(ctx) {
  const { system, user } = construirPrompt(ctx, { conCategoria: true });
  return pedirAlProxy({ system, user, textoUsuario: ctx.textoUsuario || null, modo: "combinado" });
}

// Fase 6: una petición trae varias publicaciones nuevas para esta partida.
// Devuelve [] ante cualquier problema: el juego sigue con sus casos de siempre.
async function generarCasosProxy(n = 4, ctx = {}) {
  const { system, user } = construirPromptCasos(n, ctx);
  const cruda = await pedirAlProxy({ system, user, modo: "casos" });
  const lista = Array.isArray(cruda?.casos) ? cruda.casos : [];
  return lista.map((c, i) => validarCasoGenerado(c, i)).filter(Boolean);
}

// Enciende el puente y engancha la implementación real.
// (agentes.js llama internamente a puente.impl si existe; ver nota abajo.)
export function activarLLM() {
  puente.online = true;
  puente.motivo = null;
  puente.impl = llamarProxyReal;          // reacciones de NPC
  puente.implClasificar = clasificarProxyReal; // clasificación de texto libre
  puente.implCombinado = combinadoProxyReal;   // las dos de golpe (Fase 6)
  puente.implCasos = generarCasosProxy;        // publicaciones nuevas (Fase 6)
}

export function desactivarLLM(motivo = "manual") {
  puente.online = false;
  puente.motivo = motivo;
  if (motivo === "manual" && temporizadorReconexion) {
    clearTimeout(temporizadorReconexion); // apagado a propósito: no reconectar
    temporizadorReconexion = null;
  }
}

// --- Precarga: al iniciar sesión con red, pide por adelantado un lote de
// reacciones para las situaciones más probables, y las cachea. Así, si la red
// se cae a medio juego, hay respuestas "vivas" ya listas antes del banco fijo.
const cachePrecargada = new Map(); // situacion -> [reaccion, ...]

export async function precargar(situaciones = ["fake_en_grupo", "user_corrige_bien", "coment_en_fake"], porSituacion = 3) {
  if (!puente.online) return;
  for (const situacion of situaciones) {
    const lote = [];
    for (let i = 0; i < porSituacion; i++) {
      try {
        const crudo = await llamarProxyReal({ situacion, semilla: situacion + i });
        const val = validarReaccion(crudo);
        if (val) lote.push(val);
      } catch (e) {
        desactivarLLM(e.motivo || "red"); // si falla la precarga, apagamos el puente
        break;
      }
    }
    if (lote.length) cachePrecargada.set(situacion, lote);
  }
}

// Saca una reacción precargada (si hay) — la usa pedirReaccion como paso previo
// al banco fijo cuando el puente ya se cayó.
export function precargada(situacion) {
  const lote = cachePrecargada.get(situacion);
  if (lote && lote.length) return lote.shift();
  return null;
}
