// ============================================================================
//  VERIFIED · SISTEMA DE AGENTES NPC — FASE 1: contrato + banco offline
// ----------------------------------------------------------------------------
//  Este módulo define el "contrato" que TODA reacción de un NPC debe cumplir,
//  venga de un LLM (Fase 2) o del banco offline (esta fase). Un solo esquema,
//  dos fuentes: el juego no nota la diferencia y su maquinaria pedagógica
//  (Radiografía del Engaño, diagnóstico, Bitácora, misiones MIL) funciona igual.
//
//  PRINCIPIO RECTOR (la garantía pedagógica):
//    · El LLM/banco se encarga de la EXPRESIÓN (diálogo vivo y variado).
//    · El motor del juego se encarga de la EVALUACIÓN y el PROGRESO
//      (qué cuenta como aprendizaje, cuándo se desbloquea un concepto).
//    · Ningún mensaje entra al juego sin pasar validarReaccion(): si sus
//      etiquetas no están en el vocabulario controlado, se rechaza. Así, aun
//      con texto generado libremente, los conceptos MIL quedan anclados.
// ============================================================================


// ----------------------------------------------------------------------------
//  1) VOCABULARIOS CONTROLADOS (enums)
//  Alineados con las claves que ya usa verified_v4.jsx. El LLM DEBE elegir de
//  estas listas; el banco offline ya las respeta. Cualquier valor fuera de
//  aquí se considera inválido y dispara el fallback.
// ----------------------------------------------------------------------------

// Los 7 tipos de First Draft (+ odio, que añadimos para la Misión 3)
export const TIPOS_FD = [
  "contexto",   // contexto falso: dato/foto real, historia mentirosa
  "impostor",   // se disfraza de fuente confiable
  "fabricado",  // inventado 100%
  "manipulado", // real pero editado (incluye IA: voz, deepfake)
  "conexion",   // titular no cuadra con el contenido (clickbait)
  "satira",     // parodia declarada, sin intención de engañar
  "enganoso",   // datos a medias para vender/convencer
  "odio",       // ataque a personas por lo que SON
];

// Las 8 P (motivaciones) de First Draft
export const MOTIVACIONES_8P = [
  "periodismo_pobre",
  "parodia",
  "provocar",
  "pasion",
  "partidismo",
  "lucro",
  "influencia_politica",
  "propaganda",
];

// Técnicas emocionales / de manipulación (base: Debunking Handbook + bots)
export const TECNICAS = [
  "urgencia",        // "¡antes de que lo borren!"
  "miedo",           // pánico
  "autoridad_falsa", // bata blanca, "expertos dicen"
  "conspiracion",    // "¿por qué nadie lo dice?"
  "prueba_social",   // "todos lo comparten"
  "indignacion",     // provocar coraje
  "empatia",         // apelar al corazón (usable para bien o mal)
  "ninguna",         // contenido neutro/informativo
];

// Competencias MIL de la UNESCO (1–9)
export const MISIONES_MIL = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Bando: de qué lado juega el mensaje
export const BANDOS = ["desinfo", "etico", "neutral", "duda"];

// Efecto sobre el NPC/comunidad (lo consume el motor para mover estado)
export const EFECTOS = ["cae", "duda", "apoya", "inmune", "neutral", "panico"];


// ----------------------------------------------------------------------------
//  2) EL ESQUEMA (el contrato)
//  Toda reacción — LLM u offline — es un objeto con esta forma exacta.
// ----------------------------------------------------------------------------
/**
 * @typedef {Object} Reaccion
 * @property {string}      mensaje          Texto natural que ve el usuario (1–2 líneas).
 * @property {string}      npc              id del personaje que reacciona.
 * @property {string}      bando            Uno de BANDOS.
 * @property {string|null} tipo_firstdraft  Uno de TIPOS_FD, o null si no aplica.
 * @property {string|null} motivacion_8p    Una de MOTIVACIONES_8P, o null.
 * @property {string|null} tecnica          Una de TECNICAS, o null.
 * @property {number|null} mil              Misión MIL (1–9) que toca, o null.
 * @property {string}      efecto           Uno de EFECTOS.
 */

// Validador: NINGÚN mensaje entra al juego sin pasar por aquí.
// Es el candado pedagógico: garantiza que las etiquetas sean del vocabulario
// controlado. Si algo viene mal (típico de una respuesta LLM ruidosa), se
// sanea a valores seguros o se rechaza para caer al banco offline.
export function validarReaccion(r) {
  if (!r || typeof r.mensaje !== "string" || !r.mensaje.trim()) return null;
  const enONull = (v, lista) => (v == null ? null : lista.includes(v) ? v : undefined);
  const tipo = enONull(r.tipo_firstdraft, TIPOS_FD);
  const motiv = enONull(r.motivacion_8p, MOTIVACIONES_8P);
  const tec = enONull(r.tecnica, TECNICAS);
  const mil = r.mil == null ? null : MISIONES_MIL.includes(r.mil) ? r.mil : undefined;
  const bando = BANDOS.includes(r.bando) ? r.bando : undefined;
  const efecto = EFECTOS.includes(r.efecto) ? r.efecto : "neutral";
  // undefined = etiqueta fuera de vocabulario => reacción inválida => fallback
  if ([tipo, motiv, tec, mil, bando].includes(undefined)) return null;
  return {
    mensaje: r.mensaje.trim().slice(0, 240), // recorte de seguridad
    npc: r.npc || "desconocido",
    bando, tipo_firstdraft: tipo, motivacion_8p: motiv,
    tecnica: tec, mil, efecto,
  };
}


// ----------------------------------------------------------------------------
//  3) PERFILES DE PERSONAJE (agentes)
//  · voz: guía el TONO de las respuestas offline.
//  · credulidad (0–1): qué tan fácil cae ante un fake (lo usa el motor).
//  · systemPrompt: se usará en la FASE 2 para instruir al LLM. Ya lo dejamos
//    escrito para que el "sabor" de cada NPC sea idéntico online y offline.
// ----------------------------------------------------------------------------
export const PERFILES = {
  carmen: {
    nombre: "Tía Carmen", edad: 58, credulidad: 0.85,
    voz: "cariñosa, usa muchos emojis 🙏😰, reenvía sin verificar, dice 'mijo'",
    systemPrompt:
      "Eres Tía Carmen, 58 años. Cariñosa y confiada; crees en cadenas de WhatsApp y reenvías 'por si acaso'. Hablas con emojis (🙏😰❤️) y dices 'mijo'. Respondes en 1-2 líneas coloquiales de WhatsApp mexicano. NUNCA insultas ni usas lenguaje adulto.",
  },
  mama: {
    nombre: "Mamá", edad: 52, credulidad: 0.55,
    voz: "preocupona pero razonable, pregunta antes de creer",
    systemPrompt:
      "Eres la Mamá del jugador, 52 años. Preocupona pero sensata: cuando ves algo alarmante preguntas '¿es cierto esto?' antes de reenviar. Hablas cálido y directo, 1-2 líneas. Sin groserías.",
  },
  lupe: {
    nombre: "Doña Lupe", edad: 63, credulidad: 0.8,
    voz: "vecina mayor, devota, cree en remedios y advertencias",
    systemPrompt:
      "Eres Doña Lupe, vecina de 63 años, devota y confiada. Crees en remedios caseros y advertencias virales. Hablas con dichos y 'Diosito'. 1-2 líneas, sin groserías.",
  },
  raul: {
    nombre: "Raúl", edad: 40, credulidad: 0.5,
    voz: "taxista, práctico, cuenta lo que 've en la calle'",
    systemPrompt:
      "Eres Raúl, taxista de 40 años. Práctico, cuentas lo que 'ves en la calle'. Ni muy crédulo ni muy escéptico: te dejas llevar por lo que parece pasar afuera. 1-2 líneas coloquiales.",
  },
  flores: {
    nombre: "Sra. Flores", edad: 55, credulidad: 0.75,
    voz: "vende flores, cree en lo natural, desconfía de 'lo químico'",
    systemPrompt:
      "Eres la Sra. Flores, 55 años, vendes flores. Crees en remedios naturales y desconfías de 'lo químico' y de las autoridades. 1-2 líneas, tono amable pero terco. Sin groserías.",
  },
  chuy: {
    nombre: "Chuy", edad: 34, credulidad: 0.45,
    voz: "mecánico, medio conspiranoico, 'algo esconden'",
    systemPrompt:
      "Eres Chuy, mecánico de 34 años, medio conspiranoico: sueles pensar que 'algo esconden'. Desconfías de todo, hasta de lo verdadero. 1-2 líneas coloquiales, sin groserías.",
  },
  karla: {
    nombre: "Karla", edad: 27, credulidad: 0.6,
    voz: "fitness, sigue influencers, cree en 'lo que dijo la nutrióloga'",
    systemPrompt:
      "Eres Karla, 27 años, entusiasta del gym. Sigues influencers y crees en 'lo que dijo la nutrióloga'. Hablas con energía y emojis 💪✨. 1-2 líneas. Sin groserías.",
  },
  padre: {
    nombre: "Don Beto (papá)", edad: 60, credulidad: 0.65,
    voz: "reenvía a sus 800 contactos, buena fe, gran alcance",
    systemPrompt:
      "Eres el papá, 60 años, con un grupo de 800 contactos. De buena fe reenvías todo 'para que la gente sepa'. Tu alcance es enorme. 1-2 líneas, tono de tío buena onda. Sin groserías.",
  },
  mia: {
    nombre: "Mía", edad: 22, credulidad: 0.55,
    voz: "joven fan del futbol, ansiosa por boletos, impulsiva",
    systemPrompt:
      "Eres Mía, 22 años, súper fan del futbol y ansiosa por conseguir boletos para la final. Impulsiva, te ganan las emociones. Emojis 😭⚽. 1-2 líneas. Sin groserías.",
  },
  profe: {
    nombre: "Profa. Lena", edad: 45, credulidad: 0.1,
    voz: "maestra, escéptica sana, enseña a verificar, cita fuentes",
    systemPrompt:
      "Eres la Profa. Lena, maestra de 45 años. Escéptica sana: verificas antes de creer, pides fuente y enseñas búsqueda inversa. Calmada y pedagógica, nunca condescendiente. 1-2 líneas. Sin groserías.",
  },
  beto: {
    nombre: "Beto (primo)", edad: 24, credulidad: 0.05,
    voz: "primo mentor, cercano, cazador de fakes, motivador",
    systemPrompt:
      "Eres Beto, primo del jugador, 24 años, cazador de fakes desde que estafaron a tu abuelo. Cercano, motivador, explicas técnicas con claridad SIN humillar. 1-2 líneas. Sin groserías. IMPORTANTE: no inventes conceptos; usa solo las técnicas que el juego maneja.",
  },
  arq: {
    nombre: "El Arquitecto", edad: null, credulidad: 0,
    voz: "villano frío, mentor del lado oscuro, calculador",
    systemPrompt:
      "Eres 'El Arquitecto', un manipulador frío y elegante que recluta al jugador para el lado oscuro. Explicas técnicas de desinformación como un negocio ('siempre hay un cliente que paga'). Tono calculador, nunca vulgar. 1-2 líneas. No des instrucciones del mundo real para dañar; hablas SIEMPRE dentro de la ficción del juego.",
  },
};


// ----------------------------------------------------------------------------
//  4) BANCO OFFLINE ETIQUETADO
//  Cada entrada YA trae sus metadatos del esquema. Organizado por SITUACIÓN
//  (el contexto que dispara la reacción). Es el mismo juego, con respuestas
//  pre-escritas — NO un modo pobre: carga toda la carga pedagógica.
//
//  Situaciones cubiertas:
//   fake_en_grupo        · llegó un fake al grupo familiar
//   user_corrige_bien    · el usuario publicó una corrección efectiva
//   user_corrige_mal     · corrección contraproducente (mito se refuerza)
//   user_comparte_fake   · el usuario compartió un fake
//   user_reporta_bien    · el usuario tumbó/─reportó bien un fake
//   coment_en_fake       · comentarios bajo una publicación falsa
//   coment_en_correccion · comentarios bajo la corrección del usuario
//   lado_malo_victima    · el usuario (modo Arquitecto) publicó desinfo
// ----------------------------------------------------------------------------
export const BANCO = {

  fake_en_grupo: [
    { npc: "carmen", msg: { es: "¡Ay mijo, reenvíenlo por si acaso! 🙏😰 más vale prevenir", en: "Oh honey, forward it just in case! 🙏😰 better safe than sorry" }, bando: "desinfo", tipo_firstdraft: "fabricado", motivacion_8p: "propaganda", tecnica: "miedo", mil: 4, efecto: "cae" },
    { npc: "lupe", msg: { es: "Diosito, yo ya le avisé a todas mis comadres 😔", en: "Oh Lord, I already warned all my friends 😔" }, bando: "desinfo", tipo_firstdraft: "fabricado", motivacion_8p: "propaganda", tecnica: "prueba_social", mil: 4, efecto: "cae" },
    { npc: "mama", msg: { es: "¿Es cierto esto?? 😰 no reenvíen nada todavía, hay que checar", en: "Is this true?? 😰 don't forward anything yet, we should check" }, bando: "duda", tipo_firstdraft: null, motivacion_8p: null, tecnica: null, mil: 4, efecto: "duda" },
    { npc: "profe", msg: { es: "Antes de compartir: ¿quién lo publica y de cuándo es la foto? Yo no veo fuente 🔎", en: "Before sharing: who posts it and when is the photo from? I don't see a source 🔎" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "ninguna", mil: 1, efecto: "inmune" },
    { npc: "chuy", msg: { es: "Pos yo digo que algo esconden, ¿por qué si no lo taparían? 🤔", en: "I say they're hiding something, why else would they cover it up? 🤔" }, bando: "desinfo", tipo_firstdraft: "contexto", motivacion_8p: "propaganda", tecnica: "conspiracion", mil: 4, efecto: "cae" },
    { npc: "raul", msg: { es: "En la calle ya andan diciendo lo mismo, algo ha de haber…", en: "People on the street are saying the same thing, there must be something to it…" }, bando: "duda", tipo_firstdraft: null, motivacion_8p: null, tecnica: "prueba_social", mil: 4, efecto: "duda" },
  ],

  user_corrige_bien: [
    { npc: "mama", msg: { es: "¡Ah, con razón! Gracias por explicarlo bien, ya no lo reenvío 🙏", en: "Ah, that makes sense! Thanks for explaining it well, I won't forward it 🙏" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "ninguna", mil: 7, efecto: "inmune" },
    { npc: "profe", msg: { es: "Eso: hecho primero y con fuente. Así se desmiente 👏 lo comparto", en: "That's it: fact first and with a source. That's how you debunk it 👏 I'll share it" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "ninguna", mil: 8, efecto: "apoya" },
    { npc: "padre", msg: { es: "Ya lo mandé a mis 800 contactos, pero AHORA la versión correcta 🙌", en: "I already sent it to my 800 contacts, but NOW the correct version 🙌" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "ninguna", mil: 8, efecto: "apoya" },
    { npc: "raul", msg: { es: "Órale, tienes razón. Ya andaba yo creyéndomelo 😅 gracias", en: "Wow, you're right. I was starting to believe it 😅 thanks" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "ninguna", mil: 7, efecto: "inmune" },
    { npc: "carmen", msg: { es: "Ay mijo, qué bueno que me dijiste, ya casi lo reenvío ❤️", en: "Oh honey, good thing you told me, I almost forwarded it ❤️" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "empatia", mil: 9, efecto: "inmune" },
  ],

  user_corrige_mal: [
    { npc: "chuy", msg: { es: "¿Ya ves? Hasta tú lo repites, entonces algo de cierto ha de tener…", en: "See? Even you're repeating it, so there must be some truth to it…" }, bando: "desinfo", tipo_firstdraft: "contexto", motivacion_8p: "propaganda", tecnica: "conspiracion", mil: 4, efecto: "cae" },
    { npc: "carmen", msg: { es: "Uy con tanto grito ya me asusté más 😰 mejor lo reenvío", en: "Ugh with all that shouting I'm even more scared 😰 I'll just forward it" }, bando: "desinfo", tipo_firstdraft: "fabricado", motivacion_8p: "propaganda", tecnica: "miedo", mil: 4, efecto: "cae" },
    { npc: "flores", msg: { es: "No me gusta que te burles de la gente, uno cree de buena fe 😕", en: "I don't like that you mock people, we believe in good faith 😕" }, bando: "duda", tipo_firstdraft: null, motivacion_8p: null, tecnica: "indignacion", mil: 3, efecto: "duda" },
  ],

  user_comparte_fake: [
    { npc: "carmen", msg: { es: "¡Tú también lo viste! Entonces sí es cierto, ya lo mando 😱", en: "You saw it too! So it IS true, I'm sending it 😱" }, bando: "desinfo", tipo_firstdraft: "fabricado", motivacion_8p: "propaganda", tecnica: "prueba_social", mil: 4, efecto: "cae" },
    { npc: "mia", msg: { es: "¿En serio?? ya casi vendo mis boletos entonces 😭", en: "Really?? then I'm about to sell my tickets 😭" }, bando: "desinfo", tipo_firstdraft: "contexto", motivacion_8p: "lucro", tecnica: "urgencia", mil: 4, efecto: "cae" },
    { npc: "profe", msg: { es: "Ojo, hasta tú lo compartiste sin fuente… ¿lo verificaste? 🔎", en: "Hey, even you shared it without a source… did you verify it? 🔎" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "ninguna", mil: 7, efecto: "inmune" },
  ],

  user_reporta_bien: [
    { npc: "raul", msg: { es: "¿Viste que lo de ayer era FALSO? Alguien lo reportó a tiempo 🙌", en: "Did you see yesterday's was FAKE? Someone reported it in time 🙌" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "ninguna", mil: 4, efecto: "apoya" },
    { npc: "profe", msg: { es: "Bien hecho. Reportar el tipo correcto es lo que lo tumba ✔️", en: "Well done. Reporting the right type is what takes it down ✔️" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "ninguna", mil: 4, efecto: "apoya" },
  ],

  coment_en_fake: [
    { npc: "karla", msg: { es: "¡Yo ya lo pedí!! la nutrióloga se ve súper profesional 💪", en: "I already ordered it!! the nutritionist looks super professional 💪" }, bando: "desinfo", tipo_firstdraft: "enganoso", motivacion_8p: "lucro", tecnica: "autoridad_falsa", mil: 6, efecto: "cae" },
    { npc: "flores", msg: { es: "Claro, lo natural siempre es mejor, ¡a mí me consta!", en: "Of course, natural is always better, I can vouch for it!" }, bando: "desinfo", tipo_firstdraft: "enganoso", motivacion_8p: "lucro", tecnica: "autoridad_falsa", mil: 4, efecto: "cae" },
    { npc: "profe", msg: { es: "¿Dónde está el estudio? Cuenta sin fuente y vendiendo algo = ojo 🚩", en: "Where's the study? Account with no source and selling something = red flag 🚩" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "ninguna", mil: 1, efecto: "inmune" },
    { npc: "chuy", msg: { es: "Los medios no lo dicen porque les conviene callarlo 👀", en: "The media won't say it because it suits them to keep it quiet 👀" }, bando: "desinfo", tipo_firstdraft: "contexto", motivacion_8p: "propaganda", tecnica: "conspiracion", mil: 4, efecto: "cae" },
  ],

  coment_en_correccion: [
    { npc: "raul", msg: { es: "Gracias, ya con fuente sí se entiende 🙏 lo comparto", en: "Thanks, with a source it makes sense now 🙏 I'll share it" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "ninguna", mil: 8, efecto: "apoya" },
    { npc: "mama", msg: { es: "Qué bueno que alguien lo aclara sin pelear 💚", en: "Good that someone clears it up without fighting 💚" }, bando: "etico", tipo_firstdraft: null, motivacion_8p: null, tecnica: "empatia", mil: 9, efecto: "apoya" },
    { npc: "chuy", msg: { es: "Mmm no sé, sigo pensando que algo raro hay…", en: "Hmm I don't know, I still think something's off…" }, bando: "duda", tipo_firstdraft: null, motivacion_8p: null, tecnica: "conspiracion", mil: 4, efecto: "duda" },
  ],

  lado_malo_victima: [
    { npc: "carmen", msg: { es: "Mijo, deposité para eso que vi en tu cuenta y no llega… 😰", en: "Honey, I paid for that thing I saw on your account and it's not arriving… 😰" }, bando: "desinfo", tipo_firstdraft: "fabricado", motivacion_8p: "lucro", tecnica: "urgencia", mil: 4, efecto: "cae" },
    { npc: "mia", msg: { es: "Compré en la cuenta que compartiste… era todo mi ahorro 😭", en: "I bought from the account you shared… it was all my savings 😭" }, bando: "desinfo", tipo_firstdraft: "fabricado", motivacion_8p: "lucro", tecnica: "urgencia", mil: 4, efecto: "cae" },
    { npc: "raul", msg: { es: "Toda la ciudad anda peleada por ese audio que soltaste 😤", en: "The whole city is fighting over that audio you dropped 😤" }, bando: "desinfo", tipo_firstdraft: "manipulado", motivacion_8p: "provocar", tecnica: "indignacion", mil: 6, efecto: "panico" },
  ],
};


// ----------------------------------------------------------------------------
//  5) SELECTOR OFFLINE (determinista y reproducible)
//  Escoge una reacción etiquetada del banco según el contexto. Usa un hash
//  simple para variar sin repetir de inmediato, pero de forma reproducible.
// ----------------------------------------------------------------------------
function hash(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * @param {Object} ctx
 * @param {string} ctx.situacion  Clave de BANCO (p. ej. "user_corrige_bien").
 * @param {string} [ctx.npc]      Forzar un personaje específico.
 * @param {string} [ctx.semilla]  Para variar/reproducir (casoId + tick, etc.).
 * @param {string} [ctx.excluir]  Bando a excluir (p. ej. no querer "desinfo").
 * @returns {Reaccion|null}
 */
export function reaccionOffline(ctx = {}) {
  let pool = BANCO[ctx.situacion] || [];
  if (ctx.npc) pool = pool.filter((r) => r.npc === ctx.npc);
  if (ctx.excluir) pool = pool.filter((r) => r.bando !== ctx.excluir);
  if (!pool.length) return null;
  const idx = hash((ctx.semilla || "") + ctx.situacion) % pool.length;
  return validarReaccion(resolverIdioma(pool[idx], ctx.lang));
}

/**
 * Devuelve VARIAS reacciones distintas (p. ej. para poblar comentarios).
 * @returns {Reaccion[]}
 */
export function reaccionesOffline(ctx = {}, n = 2) {
  let pool = (BANCO[ctx.situacion] || []).slice();
  if (ctx.excluir) pool = pool.filter((r) => r.bando !== ctx.excluir);
  const out = [];
  const base = hash((ctx.semilla || "") + ctx.situacion);
  for (let i = 0; i < n && pool.length; i++) {
    const idx = (base + i) % pool.length;
    const r = validarReaccion(resolverIdioma(pool[idx], ctx.lang));
    if (r) out.push(r);
    pool.splice(idx, 1);
  }
  return out;
}

// Resuelve el campo bilingüe msg:{es,en} a un mensaje string en el idioma pedido.
function resolverIdioma(entry, lang = "en") {
  const msg = entry.msg ? (entry.msg[lang] || entry.msg.en || entry.msg.es) : entry.mensaje;
  return { ...entry, mensaje: msg };
}


// ----------------------------------------------------------------------------
//  6) PUNTO DE ENTRADA UNIFICADO (la costura para la FASE 2)
//  El juego SIEMPRE llama a pedirReaccion(). En Fase 1 solo usa el banco
//  offline. En Fase 2, si hay red y tokens, aquí se inserta la llamada al
//  proxy (Cloudflare Worker → Gemini Flash). El contrato es idéntico:
//  toda respuesta pasa por validarReaccion(); si falla, cae al banco.
// ----------------------------------------------------------------------------

// Estado del "puente" con el LLM. El juego lo pone en false cuando el proxy
// avisa "ya se acabaron los tokens" o cuando hay timeouts/red caída.
export const puente = { online: false, motivo: null, impl: null, implClasificar: null, implCombinado: null };

/**
 * @param {Object} ctx        Igual que reaccionOffline, + datos del caso.
 * @param {Object} [opts]
 * @param {boolean} [opts.preferirLLM=true]
 * @returns {Promise<{reaccion: Reaccion, fuente: "llm"|"offline", alerta?: string}>}
 */
export async function pedirReaccion(ctx = {}, opts = {}) {
  const preferir = opts.preferirLLM !== false;

  // ---- Camino LLM (se activa en FASE 2) --------------------------------
  // puente.impl lo engancha agentes_online.js (activarLLM). Si no está, usa el stub.
  if (preferir && puente.online) {
    try {
      const fn = puente.impl || llamarProxy;
      const cruda = await fn(ctx);                    // ← Fase 2: fetch al Worker
      const val = validarReaccion(cruda);            // candado pedagógico
      // El proxy no devuelve el personaje: le pusimos SU voz al prompt, así que
      // la respuesta es suya. Sin esto el juego lo mostraría como "desconocido".
      if (val && ctx.npc) val.npc = ctx.npc;
      if (val) return { reaccion: val, fuente: "llm" };
      // si el LLM devolvió etiquetas fuera de vocabulario, caemos al banco
    } catch (e) {
      // red caída / tokens agotados / timeout → apagamos el puente y avisamos
      puente.online = false;
      puente.motivo = e && e.motivo ? e.motivo : "red";
      return {
        reaccion: reaccionOffline(ctx),
        fuente: "offline",
        alerta: alertaDe(puente.motivo),
      };
    }
  }

  // ---- Camino offline (Fase 1: siempre; Fase 2: fallback) --------------
  return { reaccion: reaccionOffline(ctx), fuente: "offline" };
}

// Mensajes de alerta temáticos para cuando se cae el puente (la UI los muestra).
export function alertaDe(motivo) {
  if (motivo === "tokens")
    return "⚠️ Se agotaron los créditos de IA — pasamos a modo offline. El juego sigue con lo que ya sabes.";
  return "⚠️ Sin señal — modo offline activado. Como en una emergencia real: ahora dependes de tu criterio.";
}

// STUB de Fase 2: en Fase 1 nunca se llama (puente.online = false).
// En Fase 2 se reemplaza por un fetch al Cloudflare Worker que devuelve el
// JSON del esquema. Se deja aquí documentado para dejar lista la costura.
async function llamarProxy(_ctx) {
  // Ejemplo de la Fase 2:
  //   const res = await fetch(PROXY_URL, { method: "POST",
  //     body: JSON.stringify({ ctx: _ctx, perfil: PERFILES[_ctx.npc] }) });
  //   if (res.status === 429) { const e = new Error("tokens"); e.motivo = "tokens"; throw e; }
  //   if (!res.ok)            { const e = new Error("red");    e.motivo = "red";    throw e; }
  //   return await res.json(); // debe cumplir el esquema Reaccion
  const e = new Error("offline");
  e.motivo = "red";
  throw e;
}


// ----------------------------------------------------------------------------
//  7) AYUDA: construir el prompt del LLM (listo para la Fase 2)
//  Junta el perfil del NPC + el contexto + la EXIGENCIA de responder en el
//  esquema. Devolver esto al proxy garantiza etiquetas del vocabulario.
// ----------------------------------------------------------------------------
export function construirPrompt(ctx, opts = {}) {
  const p = PERFILES[ctx.npc] || {};
  const en = ctx.lang !== "es";
  // Modo combinado: además de reaccionar, el modelo clasifica lo que hizo el
  // jugador. Así una sola petición hace el trabajo de dos (ver sección 9).
  const pideCat = !!opts.conCategoria;
  const explicaCat = !pideCat ? "" : (en
    ? '\n\nALSO classify what the PLAYER did in the "categoria" field, judging ONLY their last message: ' +
      'sandwich = gives the fact, explains the trick and reinforces it, without repeating the myth or attacking. ' +
      "hechos_fuente = brings a checkable fact/source calmly. empatia = replies with empathy without attacking. " +
      "repite_mito = repeats or amplifies the myth. ataca_persona = insults or mocks whoever believed it. " +
      "solo_emocion = pure feeling with no facts. cae = sides with the fake. neutral = off-topic or empty. " +
      "Classify honestly: it is what the game uses to teach."
    : '\n\nADEMÁS clasifica lo que hizo EL JUGADOR en el campo "categoria", juzgando SOLO su último mensaje: ' +
      "sandwich = da el hecho, explica la trampa y refuerza, sin repetir el mito ni atacar. " +
      "hechos_fuente = aporta un dato/fuente verificable con calma. empatia = responde con empatía sin atacar. " +
      "repite_mito = repite o amplifica el mito. ataca_persona = insulta o se burla del que creyó. " +
      "solo_emocion = puro sentimiento sin datos. cae = le da la razón al fake. neutral = fuera de tema o vacío. " +
      "Clasifica con honestidad: es lo que el juego usa para enseñar.");
  const campoCat = pideCat ? '"categoria": <una de ' + JSON.stringify(ESTRATEGIAS_USUARIO) + ">, " : "";
  // El perfil del personaje está escrito en español: si solo pedimos inglés en
  // una línea suelta, el modelo se va al español. Por eso la regla de idioma va
  // en el idioma destino, en mayúsculas, y REPETIDA al final (lo último pesa más).
  const idioma = en
    ? 'LANGUAGE — write the "mensaje" field in ENGLISH ONLY. This is a Mexican family, so keep the warmth, the nicknames and the emojis, but say them in English ("honey", "sweetie", "kiddo" instead of "mijo"). Never write a sentence in Spanish.'
    : 'IDIOMA — escribe el campo "mensaje" en español mexicano coloquial.';
  const guia = en
    ? 'CONTEXT: "historial" is the conversation so far (yours and everyone else\'s) and "caso" is the post being discussed.\n' +
      "Reply DIRECTLY to the player's last message: pick up what they just said, don't change the subject, don't greet again and don't repeat what someone else already said. Sound like you have been in this chat for a while."
    : "CONTEXTO: en 'historial' viene la conversación tal como va (lo tuyo y lo de los demás) y en 'caso' la publicación de la que se habla.\n" +
      "Contesta DIRECTAMENTE al último mensaje del usuario: retoma lo que acaba de decir, sin cambiar de tema, sin saludar de nuevo y sin repetir lo que otro ya dijo en el historial. Habla como si llevaras rato en esa conversación.";
  return {
    system:
      (p.systemPrompt || "Eres un vecino en un chat.") +
      "\n\n" + idioma +
      "\n\n" + guia + explicaCat +
      "\n\nResponde SOLO con un JSON válido con esta forma exacta:\n" +
      "{ " + campoCat + '"mensaje": "<1-2 líneas>", "bando": "desinfo|etico|neutral|duda", ' +
      '"tipo_firstdraft": <uno de ' + JSON.stringify(TIPOS_FD) + " o null>, " +
      '"motivacion_8p": <una de ' + JSON.stringify(MOTIVACIONES_8P) + " o null>, " +
      '"tecnica": <una de ' + JSON.stringify(TECNICAS) + " o null>, " +
      '"mil": <1-9 o null>, "efecto": <uno de ' + JSON.stringify(EFECTOS) + "> }\n" +
      "No agregues texto fuera del JSON. Elige etiquetas SOLO de esas listas.\n\n" +
      idioma,
    user: JSON.stringify({
      situacion: ctx.situacion,
      publicacion_del_usuario: ctx.textoUsuario || null,
      caso: ctx.caso || null,
      historial: ctx.historial || null,
    }),
  };
}


// ============================================================================
//  8) FASE 4 · CLASIFICADOR DE TEXTO LIBRE
// ----------------------------------------------------------------------------
//  Cuando el usuario le RESPONDE a un NPC con texto libre, no lo calificamos
//  "al aire": lo CLASIFICAMOS contra categorías conocidas y Beto da feedback
//  determinista atado a los conceptos. Así el chat abierto regresa al currículo.
//
//  Igual que las reacciones: un solo vocabulario, dos fuentes (LLM u offline).
//  El LLM clasifica mejor; el heurístico offline es la red de seguridad.
// ============================================================================

// Vocabulario controlado de estrategias del USUARIO (lo que puede "hacer" al responder)
export const ESTRATEGIAS_USUARIO = [
  "sandwich",      // hecho + explica la trampa + refuerza, sin repetir mito ni atacar (óptimo)
  "hechos_fuente", // aporta dato/fuente verificable, con calma (bien)
  "empatia",       // responde con empatía, sin atacar (bien)
  "repite_mito",   // repite/amplifica el mito (contraproducente: ilusión de verdad)
  "ataca_persona", // insulta o se burla del que creyó (contraproducente: tiro por la culata)
  "solo_emocion",  // puro grito emocional sin datos (flojo)
  "cae",           // le da la razón al fake / lo valida (mal)
  "neutral",       // fuera de tema o vacío
];

export function validarClasificacion(cat) {
  return ESTRATEGIAS_USUARIO.includes(cat) ? cat : null; // candado: fuera de vocabulario => null
}

// --- Clasificador OFFLINE (heurístico por palabras/patrones, en español) ----
// Aproximado pero educativo. Cuando el LLM está online, él hace el trabajo fino.
export function clasificarOffline(texto) {
  const raw = String(texto || "");
  const t = raw.toLowerCase().trim();
  if (!t) return "neutral";
  const tiene = (arr) => arr.some((w) => t.includes(w));

  // Las listas llevan español e inglés: la versión del jurado corre en inglés,
  // y este heurístico es justo el que actúa cuando el LLM no está disponible.
  const insulto = tiene(["tonto", "tont", "inocent", "pendej", "estúpid", "estupid", "idiot", "🤡", "menso", "baboso", "ridícul", "ridicul", "burla", "se lo tragaron", "qué tontos",
    "stupid", "dumb", "moron", "clown", "gullible", "so naive", "ridiculous", "making fun"]);
  const fuente = tiene(["fuente", "oficial", "verific", "checa", "chequen", "según", "comprob", "evidencia", "el dato", "un dato", "enlace", "link", "busca", "búsqueda inversa", "protección civil", "no hay prueba",
    "source", "official", "verify", "verified", "check", "checked", "according to", "evidence", "proof", "denied", "debunk", "fact-check", "no proof", "reverse search"]);
  const explica = tiene(["porque", "en realidad", "lo que pasa", "la verdad es", "fíjate", "resulta que", "en realidad no", "de hecho",
    "because", "actually", "the truth is", "in fact", "turns out", "what happened is", "here is why", "here's why"]);
  const empatia = tiene(["entiendo", "sé que", "se que", "con calma", "tranquil", "no te preocupes", "a mí también", "a mi tambien", "sin miedo",
    "i understand", "i get why", "i get it", "i know it", "don't worry", "dont worry", "me too", "scared me too", "calm", "it's okay", "its okay"]);
  const daRazon = tiene(["es cierto", "sí pasa", "si pasa", "tiene razón", "compárt", "compart", "reenví", "reenvi", "yo también lo creo", "ha de ser cierto", "hay que avisar", "mejor prevenir",
    "it's true", "its true", "it is true", "share it", "forward it", "better safe", "take your money out", "everyone should", "you're right", "youre right"]);
  const grita = /[A-ZÁÉÍÓÚ]{4,}/.test(raw) && tiene(["falso", "mentira", "no crean", "es falso", "no lo crean",
    "false", "fake", "a lie", "don't believe", "dont believe"]);
  const soloEmocion = /[!¡]{2,}/.test(raw) && !fuente && !explica;

  if (insulto) return "ataca_persona";
  if (grita) return "repite_mito";
  if (daRazon && !fuente) return "cae";
  if (fuente && explica) return "sandwich";
  if (fuente) return "hechos_fuente";
  if (empatia) return "empatia";
  if (soloEmocion) return "solo_emocion";
  return "neutral";
}

// --- Feedback determinista de Beto por categoría (ATADO a los conceptos) -----
// Es el candado pedagógico #3: el texto libre siempre vuelve al currículo.
export const FEEDBACK_USUARIO = {
  sandwich: { ok: true, efecto: "inmune", mil: 7,
    txt: { es: "🥪 ¡Sándwich de la verdad! Diste el hecho y explicaste la trampa con fuente, sin repetir el mito ni atacar. Así se desarma. 👏", en: "🥪 Truth sandwich! You gave the fact and explained the trick with a source, without repeating the myth or attacking. That's how you disarm it. 👏" } },
  hechos_fuente: { ok: true, efecto: "inmune", mil: 8,
    txt: { es: "📊 Bien: aportaste algo verificable. Para que quede redondo, ciérralo reforzando el hecho.", en: "📊 Good: you brought something verifiable. To round it off, close by reinforcing the fact." } },
  empatia: { ok: true, efecto: "apoya", mil: 9,
    txt: { es: "🫂 Empatía sin atacar: bajas las defensas de la gente. Súmale un dato con fuente y es imparable.", en: "🫂 Empathy without attacking: you lower people's defenses. Add a sourced fact and it's unstoppable." } },
  repite_mito: { ok: false, efecto: "cae", mil: 4,
    txt: { es: "🔁 Ojo: repetiste el mito en grande. Eso lo vuelve más familiar, y lo familiar se siente verdadero (ilusión de verdad). Empieza SIEMPRE por el hecho.", en: "🔁 Careful: you repeated the myth loudly. That makes it more familiar, and the familiar feels true (illusory truth). ALWAYS start with the fact." } },
  ataca_persona: { ok: false, efecto: "cae", mil: 3,
    txt: { es: "😡 Atacaste a la persona: se pone a la defensiva y se aferra MÁS al error (efecto tiro por la culata). Corrige el dato, no humilles a la gente.", en: "😡 You attacked the person: they get defensive and cling HARDER to the error (backfire effect). Correct the fact, don't humiliate people." } },
  solo_emocion: { ok: false, efecto: "duda", mil: 4,
    txt: { es: "Puro sentimiento sin datos no convence, primo. Acompáñalo de una fuente que se pueda checar.", en: "Pure feeling with no facts doesn't convince, cousin. Back it with a checkable source." } },
  cae: { ok: false, efecto: "cae", mil: 4,
    txt: { es: "Cuidado: le diste la razón al rumor sin verificar. Antes de validar algo, checa quién lo dice y de cuándo es. 🔎", en: "Careful: you sided with the rumor without verifying. Before validating something, check who says it and when. 🔎" } },
  neutral: { ok: null, efecto: "neutral", mil: null,
    txt: { es: "No quedó claro tu punto. Recuerda la receta: hecho + fuente, sin repetir el mito ni atacar.", en: "Your point wasn't clear. Remember the recipe: fact + source, without repeating the myth or attacking." } },
};

// STUB de Fase 2 para clasificación (se reemplaza vía puente.implClasificar).
async function clasificarProxy(_texto, _ctx) {
  const e = new Error("offline"); e.motivo = "red"; throw e;
}

/**
 * Punto de entrada unificado de clasificación.
 * @returns {Promise<{categoria:string, fuente:"llm"|"offline", alerta?:string}>}
 */
export async function clasificar(texto, opts = {}) {
  const preferir = opts.preferirLLM !== false;
  if (preferir && puente.online) {
    try {
      const fn = puente.implClasificar || clasificarProxy;
      const cruda = await fn(texto, opts);         // { categoria }
      const cat = validarClasificacion(cruda && cruda.categoria);
      if (cat) return { categoria: cat, fuente: "llm" };
    } catch (e) {
      puente.online = false;
      puente.motivo = e && e.motivo ? e.motivo : "red";
      return { categoria: clasificarOffline(texto), fuente: "offline", alerta: alertaDe(puente.motivo) };
    }
  }
  return { categoria: clasificarOffline(texto), fuente: "offline" };
}

// ============================================================================
//  9) FASE 6 · UNA SOLA LLAMADA: clasificar al jugador + contestarle
// ----------------------------------------------------------------------------
//  Cada mensaje del jugador costaba DOS peticiones (clasificar, y luego pedir
//  la reacción). Con el tier gratuito eso es la mitad del presupuesto. Aquí se
//  juntan: el personaje se elige ANTES, su voz va en el system prompt, y el
//  modelo devuelve la categoría y la respuesta de golpe.
//  Los dos candados siguen intactos: validarClasificacion + validarReaccion.
// ============================================================================

// Qué situación del banco le toca a la familia según lo que hizo el jugador.
export const SITUACION_POR_CATEGORIA = {
  sandwich: "user_corrige_bien", hechos_fuente: "user_corrige_bien", empatia: "user_corrige_bien",
  repite_mito: "user_comparte_fake", cae: "user_comparte_fake",
  ataca_persona: "user_corrige_mal", solo_emocion: "user_corrige_mal", neutral: "user_corrige_mal",
};

/**
 * Clasifica al jugador y devuelve la reacción del NPC en UNA sola petición.
 * @param {Object} ctx  Igual que pedirReaccion + textoUsuario obligatorio.
 * @param {Object} [ctx.mapa]  categoria -> situacion (para el camino offline).
 * @returns {Promise<{categoria, reaccion, fuente, alerta?}>}
 */
export async function reaccionarYClasificar(ctx = {}, opts = {}) {
  const preferir = opts.preferirLLM !== false;
  const mapa = ctx.mapa || SITUACION_POR_CATEGORIA;
  const texto = ctx.textoUsuario || "";
  // Camino offline: heurístico + banco. Cuesta CERO peticiones.
  const offline = (alerta) => {
    const categoria = clasificarOffline(texto);
    const situacion = mapa[categoria] || ctx.situacion;
    // Sin forzar el npc: el banco elige a quien tenga línea escrita para esa
    // situación (si lo forzáramos, podría quedarse sin ninguna y no responder).
    const reaccion = reaccionOffline({ situacion, semilla: ctx.semilla, lang: ctx.lang });
    return { categoria, reaccion, fuente: "offline", ...(alerta ? { alerta } : {}) };
  };

  if (preferir && puente.online && puente.implCombinado) {
    try {
      const cruda = await puente.implCombinado(ctx);
      const categoria = validarClasificacion(cruda && cruda.categoria);
      const reaccion = validarReaccion(cruda);
      if (reaccion && ctx.npc) reaccion.npc = ctx.npc; // el proxy no devuelve el personaje
      // Si el modelo se salió del vocabulario en cualquiera de las dos, al banco.
      if (categoria && reaccion) return { categoria, reaccion, fuente: "llm" };
    } catch (e) {
      puente.online = false;
      puente.motivo = e && e.motivo ? e.motivo : "red";
      return offline(alertaDe(puente.motivo));
    }
  }
  return offline();
}

// ============================================================================
//  10) FASE 6 · PUBLICACIONES NUEVAS EN CADA PARTIDA
// ----------------------------------------------------------------------------
//  Una sola petición al arrancar trae varias publicaciones nuevas, etiquetadas
//  con el MISMO vocabulario (First Draft + 8P). Si la llamada falla o el modelo
//  se sale del vocabulario, simplemente no se añade nada y se juega con los
//  casos escritos a mano. Nunca puede romper la partida.
// ============================================================================
export const CUENTAS_FALSAS = ["n0ticias", "boletos", "enfermera", "ovni", "veci", "troll", "fitlife", "futgossip"];
export const CUENTAS_REALES = ["clima", "medio", "ong"];
export const TACTICAS_VALIDAS = ["urgencia", "miedo", "fraude", "contexto", "autoridad", "influencer", "conspiracion", "ia_imagen", "satira", "acceso", "odio"];

export function construirPromptCasos(n = 4, ctx = {}) {
  const en = ctx.lang !== "es";
  return {
    system:
      "Diseñas casos para VERIFIED, un juego de alfabetización mediática (UNESCO) para adolescentes, ambientado en un barrio mexicano durante un mundial de fútbol.\n" +
      "Cada caso es UNA publicación de redes sociales que el jugador deberá juzgar. Mézclalos: la mayoría desinformación, pero incluye 1 verdadera y aburrida (para que no baste con desconfiar de todo).\n" +
      "Reglas: nada de política real, ni personas reales, ni marcas reales, ni enfermedades graves tratadas a la ligera. Nada de links. Tono creíble, cotidiano, latinoamericano.\n" +
      "El campo 'beto' es la pista del primo experto: explica en 1 línea POR QUÉ engaña (o por qué es limpia), señalando la pista concreta.\n\n" +
      "Responde SOLO con un JSON válido: { \"casos\": [ {...} x" + n + " ] }, cada uno con esta forma exacta:\n" +
      '{ "titular_es": "<texto del post, máx 140>", "titular_en": "<same in English, max 140>", ' +
      '"fake": true|false, ' +
      '"tipos": <array de 1-2 de ' + JSON.stringify(TIPOS_FD) + ", [] si no es fake>, " +
      '"motiv": <una de ' + JSON.stringify(MOTIVACIONES_8P) + ", null si no es fake>, " +
      '"tactica": <una de ' + JSON.stringify(TACTICAS_VALIDAS) + ">, " +
      '"emoji": "<1 emoji que ilustre el tema>", ' +
      '"beto_es": "<pista, máx 120>", "beto_en": "<hint, max 120>" }\n' +
      "No repitas temas entre casos. No agregues texto fuera del JSON. Usa etiquetas SOLO de esas listas.",
    user: JSON.stringify({
      cuantos: n,
      idioma_principal: en ? "en" : "es",
      evitar_temas: ctx.evitar || [],
    }),
  };
}

// Convierte un caso crudo del modelo al formato del juego. Devuelve null si se
// salió del vocabulario: preferimos un caso menos a un caso inconsistente.
export function validarCasoGenerado(c, i = 0) {
  if (!c || typeof c.titular_es !== "string" || typeof c.titular_en !== "string") return null;
  const es = c.titular_es.trim().slice(0, 180);
  const en = c.titular_en.trim().slice(0, 180);
  if (!es || !en) return null;
  if (/https?:\/\//i.test(es + en)) return null; // sin links salientes
  const fake = c.fake === true;
  const tipos = Array.isArray(c.tipos) ? c.tipos.filter((x) => TIPOS_FD.includes(x)).slice(0, 2) : [];
  if (fake && !tipos.length) return null;        // un fake sin diagnóstico no enseña
  const motiv = MOTIVACIONES_8P.includes(c.motiv) ? c.motiv : null;
  if (fake && !motiv) return null;
  const tactica = TACTICAS_VALIDAS.includes(c.tactica) ? c.tactica : null;
  if (fake && !tactica) return null;
  const beS = typeof c.beto_es === "string" ? c.beto_es.trim().slice(0, 160) : "";
  const beE = typeof c.beto_en === "string" ? c.beto_en.trim().slice(0, 160) : "";
  if (!beS || !beE) return null;
  const cuentas = fake ? CUENTAS_FALSAS : CUENTAS_REALES;
  const emoji = typeof c.emoji === "string" && c.emoji.trim() ? c.emoji.trim().slice(0, 4) : (fake ? "📣" : "📰");
  return {
    id: "gen" + (i + 1),
    generado: true,
    fake,
    ...(fake ? { tacticaId: tactica, tipos, motiv } : {}),
    autorId: cuentas[hash("autor" + es + i) % cuentas.length],
    img: emoji,
    grad: GRADIENTES[hash("grad" + es + i) % GRADIENTES.length],
    titular: { es, en },
    imagenRes: { mal: fake, txt: fake
      ? { es: "Búsqueda inversa: la imagen ya circulaba antes, en otro contexto.", en: "Reverse search: the image was already circulating before, in another context." }
      : { es: "Imagen original, sin coincidencias previas.", en: "Original image, no earlier matches." } },
    iaRes: { mal: false, txt: { es: "Sin señales claras de IA.", en: "No clear AI signals." } },
    betoTip: { es: beS, en: beE },
  };
}

const GRADIENTES = [
  "linear-gradient(135deg,#111827,#7f1d1d)", "linear-gradient(135deg,#065f46,#111827)",
  "linear-gradient(135deg,#0c4a6e,#1e293b)", "linear-gradient(135deg,#4c1d95,#1e1b4b)",
  "linear-gradient(135deg,#7c2d12,#1c1917)", "linear-gradient(135deg,#831843,#111827)",
];

// Prompt para que el LLM clasifique (Fase 2). Devuelve SOLO la categoría.
export function construirPromptClasificacion(texto, ctx = {}) {
  return {
    system:
      "Eres un clasificador pedagógico de alfabetización mediática. Lee la RESPUESTA del usuario a un rumor/fake y clasifícala en UNA categoría.\n" +
      "Responde SOLO con JSON: { \"categoria\": <una de " + JSON.stringify(ESTRATEGIAS_USUARIO) + "> }\n" +
      "Guía: sandwich = da el hecho, explica la trampa y refuerza, sin repetir el mito ni atacar. " +
      "hechos_fuente = aporta dato/fuente con calma. empatia = responde con empatía sin atacar. " +
      "repite_mito = repite o amplifica el mito. ataca_persona = insulta o se burla. " +
      "solo_emocion = puro grito sin datos. cae = le da la razón al fake. neutral = fuera de tema o vacío.",
    user: JSON.stringify({ respuesta_usuario: String(texto || "").slice(0, 500), contexto: ctx.contexto || null }),
  };
}
