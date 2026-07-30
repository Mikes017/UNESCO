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
//  2 bis) CANDADO DE IDIOMA
//  El prompt pide el idioma en mayúsculas y repetido, pero un modelo pequeño
//  se despista de vez en cuando: los perfiles de los personajes están en
//  español y el esquema JSON también, así que en la versión en inglés el
//  español tira fuerte. Una sola frase en el idioma equivocado rompe la
//  ilusión de estar en el chat de tu familia.
//
//  Aquí NO traducimos: detectamos y descartamos. Lo descartado cae al banco
//  offline, que está escrito a mano en los dos idiomas — humano y con el mismo
//  tono coloquial. Vale más una línea del banco que una línea en otro idioma.
//
//  La detección es a propósito CONSERVADORA: pide al menos dos marcas claras
//  del idioma contrario y que le ganen a las del idioma pedido. Así un "😭😭",
//  un "ok mijo" o un nombre propio nunca se descartan por error.
// ----------------------------------------------------------------------------

// Palabras frecuentes que solo existen (o solo pesan) en uno de los dos idiomas.
// Fuera quedan las ambiguas entre español e inglés: "no", "me", "a", "son", "he".
const MARCAS_ES = ["que", "qué", "de", "la", "el", "los", "las", "un", "una", "por", "para", "con",
  "esto", "eso", "esta", "está", "están", "pero", "muy", "más", "ya", "aquí", "ahí", "mira", "oye",
  "gracias", "cómo", "cuando", "cuándo", "porque", "tú", "te", "se", "lo", "le", "les", "nos", "hay",
  "mijo", "mija", "primo", "prima", "vecina", "vecino", "sí", "todos", "también", "nada", "bien",
  "está", "soy", "eres", "somos", "tiene", "tienen", "dice", "dicen", "vamos", "hijo", "familia"];
const MARCAS_EN = ["the", "and", "you", "your", "that", "this", "is", "are", "was", "were", "it",
  "im", "dont", "doesnt", "cant", "what", "but", "with", "for", "my", "we", "they", "just", "know",
  "really", "thanks", "honey", "sweetie", "kiddo", "please", "look", "hey", "yeah", "about", "there",
  "here", "very", "everyone", "something", "because", "should", "would", "could", "did", "does"];

// Cuenta cuántas marcas de cada lista aparecen como PALABRA COMPLETA.
function marcasDe(palabras, lista) {
  let n = 0;
  for (const p of palabras) if (lista.includes(p)) n++;
  return n;
}

/**
 * ¿El texto está claramente en un idioma distinto al pedido?
 * @param {string} texto  El mensaje generado por el LLM.
 * @param {string} lang   Idioma pedido ("es" | "en"). Por defecto "en".
 * @returns {boolean}     true SOLO si hay evidencia clara de lo contrario.
 */
export function idiomaEquivocado(texto, lang = "en") {
  const s = String(texto || "");
  if (!s.trim()) return false;
  // Apóstrofos fuera ("don't" → "dont") para que cuenten como una palabra.
  const palabras = s.toLowerCase().replace(/['’]/g, "").split(/[^a-záéíóúüñ]+/i).filter(Boolean);
  if (palabras.length < 3) return false; // demasiado corto para juzgarlo

  const es = marcasDe(palabras, MARCAS_ES) + (/[áéíóúñ¿¡]/i.test(s) ? 1 : 0);
  const en = marcasDe(palabras, MARCAS_EN);
  return lang === "es" ? en >= 2 && en > es : es >= 2 && es > en;
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
      // Candado de idioma: si contestó en el otro idioma, esta respuesta no
      // sirve aunque las etiquetas estén bien. Al banco, que sí está traducido.
      if (val && !idiomaEquivocado(val.mensaje, ctx.lang)) return { reaccion: val, fuente: "llm" };
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
    : 'IDIOMA — escribe el campo "mensaje" SOLO en ESPAÑOL mexicano coloquial, como se habla en el barrio: apodos ("mijo", "primo", "vecina"), diminutivos y emojis. Nunca escribas una frase en inglés.';
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
      if (categoria && reaccion) {
        if (!idiomaEquivocado(reaccion.mensaje, ctx.lang)) return { categoria, reaccion, fuente: "llm" };
        // Clasificó bien pero contestó en el idioma equivocado: la categoría es
        // una etiqueta (no tiene idioma) así que se queda, y la voz la pone el
        // banco. El jugador sigue recibiendo su lección, sin frases sueltas.
        const deBanco = reaccionOffline({ situacion: mapa[categoria] || ctx.situacion, semilla: ctx.semilla, lang: ctx.lang });
        if (deBanco) return { categoria, reaccion: deBanco, fuente: "offline" };
      }
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
//
//  COHERENCIA (esto es lo que arregla el "perfil que no cuadra con la noticia"):
//  el modelo NO elige quién publica. Elige un TEMA, y del tema se DEDUCE todo lo
//  demás: qué cuenta publicaría eso, qué técnica usa, qué tipo de First Draft es
//  y quién gana (la motivación). Si el modelo se sale de lo plausible para ese
//  tema, se AJUSTA al tema en vez de tirar el caso. Así el autor, la técnica, la
//  búsqueda inversa, el detector de IA y la Radiografía hablan todos de la MISMA
//  noticia.
// ============================================================================
export const CUENTAS_FALSAS = ["n0ticias", "boletos", "enfermera", "ovni", "veci", "troll", "fitlife", "futgossip"];
export const CUENTAS_REALES = ["clima", "medio", "ong"];

// Solo estas 4 motivaciones tienen etiqueta en la Radiografía del juego
// (motivLabel en App.jsx). Si dejáramos pasar las otras 4 de First Draft, el
// jugador vería el campo "¿quién gana?" vacío.
export const MOTIVS_JUEGO = ["lucro", "propaganda", "provocar", "pasion"];

// Técnicas que puede llevar un caso FALSO generado. Fuera quedan "satira",
// "acceso" (son de casos verdaderos) y "genero" (tema delicado: solo lo tratan
// los casos escritos a mano).
export const TACTICAS_FAKE = ["urgencia", "miedo", "fraude", "contexto", "autoridad", "influencer", "conspiracion", "ia_imagen", "ia_voz", "deepfake", "odio"];
export const TACTICAS_VALIDAS = TACTICAS_FAKE; // compat

// ---- El mapa de temas: el corazón de la coherencia ------------------------
//  fakes/reales · quién publicaría esa noticia (cuentas que ya existen en el juego)
//  tacticas     · técnicas plausibles para ese tema (la 1ª es la canónica)
//  motivs       · quién gana con ese tema (el 1º es el canónico)
//  claves       · palabras para deducir el tema del titular si el modelo falla
export const TEMAS = {
  boletos: {
    emoji: "🎟️", grad: "linear-gradient(135deg,#065f46,#111827)",
    fakes: ["boletos"], reales: ["medio"],
    tacticas: ["fraude", "urgencia"], motivs: ["lucro"],
    quien: { es: "una cuenta de reventa creada esta semana que pide depósitos directos", en: "a resale account created this week asking for direct deposits" },
    claves: ["boleto", "entrada para", "reventa", "revendedor", "deposita", "deposito", "transferencia", "aparta", "sorteo", "rifa", "cupo limitado",
      "ticket", "resale", "reseller", "deposit", "wire", "raffle", "giveaway", "limited spots"],
  },
  producto: {
    emoji: "🧴", grad: "linear-gradient(135deg,#831843,#111827)",
    fakes: ["fitlife"], reales: ["ong"],
    tacticas: ["influencer", "autoridad"], motivs: ["lucro"],
    quien: { es: "un influencer con 120k seguidores que vende productos sin poner #publicidad", en: "an influencer with 120k followers selling products without an #ad tag" },
    claves: ["quema grasa", "quemador", "suplement", "detox", "adelgaz", "crema", "milagro", "codigo", "cupon", "antes y despues", "gotas", "faja",
      "fat burn", "supplement", "weight loss", "miracle", "promo code", "before and after", "drops"],
  },
  salud: {
    emoji: "💉", grad: "linear-gradient(135deg,#7f1d1d,#1c1917)",
    fakes: ["enfermera"], reales: ["ong"],
    tacticas: ["autoridad", "miedo", "conspiracion"], motivs: ["lucro", "propaganda"],
    quien: { es: "una cuenta anónima que dice ser enfermera, sin cédula ni hospital", en: "an anonymous account claiming to be a nurse, with no license or hospital" },
    claves: ["vacun", "salud", "hospital", "enfermer", "medic", "doctor", "clinica", "jarabe", "pastilla", "remedio", "contagio", "brote", "sangre",
      "vaccine", "health", "nurse", "physician", "clinic", "pill", "remedy", "outbreak", "blood"],
  },
  futbol: {
    emoji: "⚽", grad: "linear-gradient(135deg,#4c1d95,#111827)",
    fakes: ["futgossip"], reales: ["medio"],
    tacticas: ["contexto", "ia_voz"], motivs: ["provocar", "lucro"],
    quien: { es: "una cuenta de chismes 'exclusivos' que nunca cita fuentes", en: "an 'exclusive gossip' account that never cites sources" },
    claves: ["seleccion", "jugador", "capitan", "futbolista", "entrenador", " dt ", "vestidor", "aficion", "fichaje", "arbitro", "alineacion", "penal",
      "national team", "player", "captain", "coach", "locker room", "fans", "referee", "lineup"],
  },
  clima: {
    emoji: "🌧️", grad: "linear-gradient(135deg,#0c4a6e,#1e293b)",
    fakes: ["n0ticias"], reales: ["clima"],
    tacticas: ["miedo", "urgencia", "ia_imagen"], motivs: ["propaganda", "provocar"],
    quien: { es: "una cuenta que imita a un medio real cambiándole una letra al nombre", en: "an account imitating a real outlet by swapping one letter of its name" },
    claves: ["lluvia", "tormenta", "inunda", "huracan", "granizo", "clima", "temblor", "sismo", "estadio", "cancela el partido", "alerta meteorologica",
      "rain", "storm", "flood", "hurricane", "hail", "weather", "earthquake", "stadium", "match cancel"],
  },
  servicios: {
    emoji: "🚱", grad: "linear-gradient(135deg,#1e3a8a,#111827)",
    fakes: ["veci"], reales: ["clima"],
    tacticas: ["miedo", "urgencia"], motivs: ["propaganda", "provocar"],
    quien: { es: "una cuenta de barrio que siempre cita a 'mi primo del gobierno', que nunca tiene nombre", en: "a neighborhood account always quoting 'my cousin in the government', who never has a name" },
    claves: ["agua", "garrafon", "apagon", "corte de luz", "cortan la", "gas", "transporte", "metro", "camion", "cierre de calles", "toque de queda", "desabasto", "gasolina",
      "water", "blackout", "power cut", "outage", "transit", "subway", "road closure", "curfew", "shortage", "gas station"],
  },
  conspira: {
    emoji: "🛸", grad: "linear-gradient(135deg,#1e1b4b,#0c0a1f)",
    fakes: ["ovni"], reales: ["medio"],
    tacticas: ["conspiracion"], motivs: ["pasion", "propaganda"],
    quien: { es: "una cuenta de 'lo que no quieren que veas', donde todo es secreto y nada tiene fuente", en: "a 'what they don't want you to see' account, where everything is secret and nothing is sourced" },
    claves: ["ocultan", "lo esconden", "secreto", "conspir", "ovni", "chip", "elite", "censur", "no quieren que", "antes de que lo borren", "despierten",
      "hiding it", "cover-up", "secret", "ufo", "they don't want", "wake up", "before they delete"],
  },
  odio: {
    emoji: "🚫", grad: "linear-gradient(135deg,#450a0a,#1c1917)",
    fakes: ["troll"], reales: ["medio"],
    tacticas: ["odio"], motivs: ["provocar"],
    quien: { es: "una cuenta troll de 3 días, sin foto, que solo ataca a un grupo de personas", en: "a 3-day-old troll account, no photo, that only attacks one group of people" },
    claves: ["no merecen", "correrlos", "fuera los", "esa gente", "los del sur", "migrant", "no deberian dejar entrar", "ni deberian",
      "don't deserve", "run them out", "kick them out", "those people", "southerners", "shouldn't be allowed"],
  },
  noticia: {
    emoji: "🗞️", grad: "linear-gradient(135deg,#111827,#7f1d1d)",
    fakes: ["n0ticias"], reales: ["medio"],
    tacticas: ["urgencia", "contexto", "ia_imagen", "deepfake"], motivs: ["propaganda", "provocar"],
    quien: { es: "una cuenta que imita a un medio real cambiándole una letra al nombre", en: "an account imitating a real outlet by swapping one letter of its name" },
    claves: ["ultima hora", "urgente", "exclusiva", "filtrado", "confirmado", "alcalde", "gobierno", "declara", "video del", "audio del", "comunicado",
      "breaking", "urgent", "exclusive", "leaked", "confirmed", "mayor", "government", "declares", "statement"],
  },
};

// Tipos de First Draft plausibles por técnica (el 1º es el canónico).
const TIPOS_POR_TACTICA = {
  fraude: ["fabricado", "enganoso"], influencer: ["enganoso", "conexion"], autoridad: ["fabricado", "enganoso"],
  urgencia: ["fabricado", "contexto"], miedo: ["fabricado", "contexto"],
  contexto: ["contexto", "conexion"], conspiracion: ["contexto", "conexion"],
  ia_imagen: ["manipulado", "fabricado"], ia_voz: ["manipulado", "fabricado"], deepfake: ["manipulado", "fabricado"],
  odio: ["odio"],
};

// Qué dice la búsqueda inversa según la técnica: la herramienta tiene que
// hablar del engaño concreto, no dar una frase comodín.
const IMAGEN_POR_TACTICA = {
  fraude: { es: "La 'captura' del pago circula idéntica en decenas de cuentas de estafa.", en: "The payment 'screenshot' circulates identically across dozens of scam accounts." },
  influencer: { es: "El 'antes y después' es de otra persona, y está editado.", en: "The 'before and after' is a different person, and it is edited." },
  autoridad: { es: "La foto del 'especialista' sale de un banco de imágenes de stock.", en: "The 'specialist' photo comes from a stock image bank." },
  contexto: { es: "Búsqueda inversa: la foto es real, pero es de otro año y de otro lugar.", en: "Reverse search: the photo is real, but from another year and another place." },
  conspiracion: { es: "Búsqueda inversa: es un video viejo de otro evento, reciclado con historia nueva.", en: "Reverse search: it is an old video of another event, recycled with a new story." },
  urgencia: { es: "El mismo aviso circula desde hace años: solo le cambian la fecha y el lugar.", en: "The same warning has circulated for years: only the date and place change." },
  miedo: { es: "El mismo aviso circula desde hace años en otras ciudades: solo cambia el lugar.", en: "The same warning has circulated for years in other cities: only the place changes." },
  ia_imagen: { es: "No aparece en ningún medio. La 'foto exclusiva' no existe fuera de esta cuenta.", en: "Not in any outlet. The 'exclusive photo' does not exist outside this account." },
  ia_voz: { es: "La imagen es una portada genérica. La clave está en el audio.", en: "The image is a generic cover. The key is in the audio." },
  deepfake: { es: "El video no existe en ninguna fuente oficial ni en ningún medio real.", en: "The video does not exist in any official source or real outlet." },
  odio: { es: "No es una opinión sobre el tema: ataca a personas por lo que SON. Eso es discurso de odio.", en: "This is not an opinion about the topic: it attacks people for what they ARE. That is hate speech." },
};

// Y qué dice el detector de IA. Solo las técnicas de IA dan positivo: si diera
// positivo en todo, el jugador aprendería a apretar el botón sin pensar.
const IA_POR_TACTICA = {
  ia_imagen: { mal: true, txt: { es: "🤖 SEÑALES DE IA: texto de los letreros ilegible, manos y multitudes derretidas, reflejos imposibles.", en: "🤖 AI SIGNALS: illegible sign text, melted hands and crowds, impossible reflections." } },
  ia_voz: { mal: true, txt: { es: "🤖 SEÑALES DE VOZ CLONADA: no hay respiraciones, la entonación es plana y las pausas son antinaturales.", en: "🤖 VOICE-CLONE SIGNALS: no breaths, flat intonation, unnatural pauses." } },
  deepfake: { mal: true, txt: { es: "🤖 DEEPFAKE: parpadeo antinatural, labios fuera de sincronía y bordes borrosos en la cara.", en: "🤖 DEEPFAKE: unnatural blinking, out-of-sync lips, blurry edges around the face." } },
};

// Señales de cada técnica en el propio texto del post. Sirven para no sortear la
// técnica al azar entre las del tema: un post que pide un depósito es "fraude", y
// uno que presume un video es "deepfake". Importa porque de la técnica salen la
// búsqueda inversa y el detector de IA: si un post que nunca menciona una imagen
// recibiera "ia_imagen", el detector daría positivo sobre una foto inexistente.
const SENALES_TACTICA = {
  fraude: ["deposit", "transferencia", "aparta", "aparto", "te lo guardo", "pago", "paga ", "clabe", "wire", "payment", "pay ", "hold it for you"],
  urgencia: ["urgente", "antes de que", "ultimas horas", "ultimos", "hoy mismo", "se acaba", "cupo", "corre", "ahora o nunca",
    "urgent", "before it", "last hours", "last ", "today only", "running out", "hurry"],
  miedo: ["cuidado", "peligro", "no salgan", "guarden", "abastez", "se va a acabar", "riesgo", "alerta",
    "careful", "danger", "do not go", "stock up", "will run out", "risk", "alert"],
  autoridad: ["soy enfermera", "soy doctor", "especialista", "como medico", "trabajo en el hospital",
    "i am a nurse", "i am a doctor", "specialist", "as a doctor", "i work at the hospital"],
  influencer: ["codigo", "cupon", "link en mi", "mi descuento", "confien en mi", "antes y despues",
    "promo code", "coupon", "link in my", "my discount", "trust me", "before and after"],
  contexto: ["miren la foto", "aqui la prueba", "esta foto", "la imagen lo prueba", "asi quedo",
    "look at the photo", "here is the proof", "this photo", "the image proves"],
  conspiracion: ["ocultan", "lo esconden", "no quieren que", "antes de que lo borren", "despierten", "la verdad que",
    "hiding", "cover up", "they don't want", "before they delete", "wake up", "the truth they"],
  ia_imagen: ["foto exclusiva", "miren como quedo", "imagenes del", "asi se ve", "fotos del",
    "exclusive photo", "look how it looks", "images of", "photos of"],
  ia_voz: ["audio", "grabacion", "se le oye", "nota de voz", "lo dijo en la llamada",
    "recording", "you can hear", "voice note", "said on the call"],
  deepfake: ["video", "se ve al", "aparece diciendo", "lo grabaron diciendo", "en el clip",
    "caught on video", "appears saying", "in the clip"],
  odio: ["no merecen", "esa gente", "fuera los", "correrlos", "no deberian",
    "don't deserve", "those people", "kick them out", "run them out", "shouldn't be"],
};

// minúsculas y sin acentos: así "vacunación" y "vacunacion" cuentan igual
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// De las técnicas plausibles para el tema, la que el propio texto delata. La
// canónica del tema (la 1ª) entra con un indicio de ventaja: es la apuesta segura,
// así que otra técnica solo se la quita si el texto la delata más. Y si el texto
// no delata nada, gana ella, que nunca promete una imagen ni un audio que el post
// no tenga.
function tacticaDelTexto(tema, texto) {
  const senales = (tac) => (SENALES_TACTICA[tac] || []).reduce((n, k) => n + (texto.includes(norm(k)) ? 1 : 0), 0);
  let mejor = tema.tacticas[0], mejorPts = senales(mejor) + 1;
  for (const tac of tema.tacticas.slice(1)) {
    const pts = senales(tac);
    if (pts > mejorPts) { mejor = tac; mejorPts = pts; }
  }
  return mejor;
}

// Deduce el tema. Manda el TITULAR, no la etiqueta del modelo: si el modelo dice
// "clima" pero el post vende quemagrasa, el post gana. Solo cuando el titular no
// dice nada claro se respeta lo que declaró el modelo; y si tampoco hay eso, el
// tema es "noticia" (el genérico, el único que no promete nada raro).
export function temaDeCaso(c) {
  const texto = " " + norm((c?.titular_es || "") + " ~ " + (c?.titular_en || "")) + " ";
  const puntos = (id) => TEMAS[id].claves.reduce((n, k) => n + (texto.includes(norm(k)) ? 1 : 0), 0);
  let mejor = null, mejorPts = 0;
  for (const id of Object.keys(TEMAS)) {
    const pts = puntos(id);
    if (pts > mejorPts) { mejor = id; mejorPts = pts; }
  }
  const declarado = c && TEMAS[c.tema] ? c.tema : null;
  // El titular solo desmiente al modelo cuando habla claro (2+ pistas), o cuando
  // el tema declarado no tiene NINGUNA pista en el texto. Un empate lo gana el
  // modelo: él sí sabe qué quiso escribir.
  if (declarado) {
    const suyos = puntos(declarado);
    if (suyos >= mejorPts) return declarado;
    if (mejorPts >= 2 || suyos === 0) return mejor;
    return declarado;
  }
  return mejor || "noticia";
}

export function construirPromptCasos(n = 4, ctx = {}) {
  const en = ctx.lang !== "es";
  const temas = Object.entries(TEMAS)
    .map(([id, tm]) => "· " + id + " → lo publicaría " + tm.quien.es + ". Técnicas: " + tm.tacticas.join(", ") + ".")
    .join("\n");
  return {
    system:
      "Diseñas casos para VERIFIED, un juego de alfabetización mediática (UNESCO) para adolescentes, ambientado en un barrio mexicano durante un mundial de fútbol.\n" +
      "Cada caso es UNA publicación de redes sociales que el jugador deberá juzgar. Mézclalos: la mayoría desinformación, pero incluye 1 verdadera y aburrida (para que no baste con desconfiar de todo).\n" +
      "Reglas: nada de política real, ni personas reales, ni marcas reales, ni enfermedades graves tratadas a la ligera. Nada de links. Tono creíble, cotidiano, latinoamericano.\n" +
      "El campo 'beto' es la pista del primo experto: explica en 1 línea POR QUÉ engaña (o por qué es limpia), señalando la pista concreta.\n\n" +
      "IMPORTANTÍSIMO — la cuenta que publica NO la eliges tú: la asigna el juego a partir del 'tema'. Elige el tema PRIMERO y escribe el post con la voz de esa cuenta, hablando de ESE asunto. Temas disponibles:\n" +
      temas + "\n" +
      "La 'tactica' y la 'motiv' tienen que ser las de ESE tema y ESE texto: si el post pide dinero es lucro, si siembra pánico es propaganda o provocar, si es 'creo en lo oculto' es pasion.\n\n" +
      "Responde SOLO con un JSON válido: { \"casos\": [ {...} x" + n + " ] }, cada uno con esta forma exacta:\n" +
      '{ "tema": <uno de ' + JSON.stringify(Object.keys(TEMAS)) + ">, " +
      '"titular_es": "<texto del post, máx 140>", "titular_en": "<same in English, max 140>", ' +
      '"fake": true|false, ' +
      '"tipos": <array de 1-2 de ' + JSON.stringify(TIPOS_FD) + ", [] si no es fake>, " +
      '"motiv": <una de ' + JSON.stringify(MOTIVS_JUEGO) + ", null si no es fake>, " +
      '"tactica": <una de ' + JSON.stringify(TACTICAS_FAKE) + ", null si no es fake>, " +
      '"emoji": "<1 emoji que ilustre el tema>", ' +
      '"beto_es": "<pista, máx 120>", "beto_en": "<hint, max 120>" }\n' +
      "No repitas temas entre casos. No agregues texto fuera del JSON. Usa etiquetas SOLO de esas listas.",
    user: JSON.stringify({
      cuantos: n,
      idioma_principal: en ? "en" : "es",
      temas_disponibles: Object.keys(TEMAS),
      evitar_temas: ctx.evitar || [],
    }),
  };
}

// Convierte un caso crudo del modelo al formato del juego. Devuelve null solo si
// falta el texto (sin titular no hay caso). Todo lo demás se AJUSTA al tema:
// preferimos un caso coherente a un caso menos.
export function validarCasoGenerado(c, i = 0) {
  if (!c || typeof c.titular_es !== "string" || typeof c.titular_en !== "string") return null;
  const es = c.titular_es.trim().slice(0, 180);
  const en = c.titular_en.trim().slice(0, 180);
  if (!es || !en) return null;
  if (/https?:\/\//i.test(es + en)) return null; // sin links salientes
  const beS = typeof c.beto_es === "string" ? c.beto_es.trim().slice(0, 160) : "";
  const beE = typeof c.beto_en === "string" ? c.beto_en.trim().slice(0, 160) : "";
  if (!beS || !beE) return null;

  const fake = c.fake === true;
  const temaId = temaDeCaso(c);
  const tema = TEMAS[temaId];
  const pick = (arr, sal) => arr[hash(sal + es + i) % arr.length];

  // 1) Técnica: la del modelo solo si es plausible PARA ESTE TEMA; si no, la que
  //    delata el propio texto (nunca una al azar: de la técnica salen la búsqueda
  //    inversa y el detector de IA, y tienen que hablar de ESTE post).
  const texto = " " + norm(es + " ~ " + en) + " ";
  const tactica = !fake ? null
    : (TACTICAS_FAKE.includes(c.tactica) && tema.tacticas.includes(c.tactica)) ? c.tactica
    : tacticaDelTexto(tema, texto);

  // 2) Tipos de First Draft: se conservan los del modelo que embonen con la
  //    técnica; si ninguno embona, los canónicos de la técnica. Esto importa
  //    doble porque el reporte solo procede si el jugador acierta el tipo.
  const plausibles = TIPOS_POR_TACTICA[tactica] || [];
  const delModelo = Array.isArray(c.tipos) ? c.tipos.filter((x) => plausibles.includes(x)) : [];
  const tipos = !fake ? [] : (delModelo.length ? delModelo.slice(0, 2) : plausibles.slice(0, 2));

  // 3) Autor: SIEMPRE la cuenta que publicaría este tema (nunca al azar).
  const cuentas = fake ? tema.fakes : (tema.reales.length ? tema.reales : CUENTAS_REALES);
  const autorId = pick(cuentas, "autor");
  // La cuenta que imita a un medio real es, por definición, contenido impostor.
  if (fake && autorId === "n0ticias" && !tipos.includes("impostor")) {
    if (tipos.length >= 2) tipos[1] = "impostor"; else tipos.push("impostor");
  }

  // 4) Motivación (el "¿quién gana?" de la Radiografía): la del modelo solo si
  //    el juego sabe dibujarla Y cuadra con el tema; si no, la canónica del tema.
  const motiv = !fake ? null
    : (MOTIVS_JUEGO.includes(c.motiv) && tema.motivs.includes(c.motiv)) ? c.motiv
    : tema.motivs[0];

  const emoji = typeof c.emoji === "string" && c.emoji.trim() ? c.emoji.trim().slice(0, 4) : tema.emoji;
  const ia = (fake && IA_POR_TACTICA[tactica]) || { mal: false, txt: { es: "Sin señales claras de IA.", en: "No clear AI signals." } };
  return {
    id: "gen" + (i + 1),
    generado: true,
    tema: temaId,
    fake,
    ...(fake ? { tacticaId: tactica, tipos, motiv } : {}),
    autorId,
    img: emoji,
    grad: tema.grad,
    titular: { es, en },
    imagenRes: fake
      ? { mal: true, txt: IMAGEN_POR_TACTICA[tactica] || IMAGEN_POR_TACTICA.contexto }
      : { mal: false, txt: { es: "Imagen original de la cuenta, sin coincidencias previas.", en: "The account's own original image, no earlier matches." } },
    iaRes: ia,
    betoTip: { es: beS, en: beE },
  };
}

// ============================================================================
//  11) FASE 6 · BETO CRITICA TU CONTRA-PUBLICACIÓN
// ----------------------------------------------------------------------------
//  El veredicto (puntuación, nivel, efectos) sigue siendo DETERMINISTA: lo
//  calcula el juego y el modelo no lo toca. Lo que aporta el LLM es la
//  explicación concreta de POR QUÉ ESE orden funcionó o falló en ESE caso,
//  que es donde de verdad se aprende. Una sola petición, solo al publicar.
// ============================================================================
export function construirPromptCritica(ctx = {}) {
  const en = ctx.lang !== "es";
  // Igual que en construirPrompt: el esquema JSON de abajo está escrito en
  // español, así que la regla de idioma va en el idioma destino y REPETIDA.
  const idioma = en
    ? "LANGUAGE — write every field in ENGLISH ONLY, casual and warm, like an older cousin. Never write a sentence in Spanish."
    : "IDIOMA — escribe todos los campos SOLO en ESPAÑOL mexicano coloquial, como un primo mayor. Nunca escribas una frase en inglés.";
  const base = en
    ? "You are Beto, the player's cousin: you have been hunting fake news since 2019 and you teach without lecturing. One short line per field.\n" +
      "The player built a correction out of blocks, in the order shown in \"orden\". The verdict in \"veredicto\" is ALREADY decided by the game: do not argue with it or change it — explain it.\n" +
      "Lean on the debunking handbook: open with the FACT (what is read first is what sticks), explain the TRICK, close REINFORCING the fact (truth sandwich); repeating the myth breeds the illusion of truth; mocking whoever believed it triggers the backfire effect.\n" +
      "Be specific about THIS post and THIS order — no generic advice."
    : "Eres Beto, el primo del jugador: cazas fakes desde 2019 y enseñas sin sermonear. Una línea corta por campo.\n" +
      "El jugador armó una corrección con bloques, en el orden que ves en 'orden'. El veredicto de 'veredicto' YA lo decidió el juego: no lo discutas ni lo cambies, explícalo.\n" +
      "Apóyate en el manual del desmentido: empezar por el HECHO (lo primero que se lee es lo que se queda), explicar la TRAMPA, cerrar REFORZANDO el hecho (sándwich de la verdad); repetir el mito genera la ilusión de verdad; burlarse del que creyó dispara el efecto tiro por la culata.\n" +
      "Sé concreto con ESTA publicación y ESTE orden, nada de consejos genéricos.";
  return {
    system:
      base + "\n\n" + idioma +
      "\n\nResponde SOLO con un JSON válido con esta forma exacta:\n" +
      '{ "acierto": "<1 línea sobre lo que SÍ funcionó, o null si no hubo nada>", ' +
      '"fallo": "<1 línea sobre el error principal, o null si no hubo>", ' +
      '"mejora": "<1 línea: el cambio concreto que lo mejoraría>" }\n' +
      "Sin links. Nada de texto fuera del JSON.\n\n" + idioma,
    user: JSON.stringify({
      publicacion_a_corregir: ctx.caso || null,
      orden: ctx.orden || [],
      texto_publicado: ctx.texto || "",
      veredicto: ctx.veredicto || null,
    }),
  };
}

// Deja pasar solo líneas cortas y sin links. Si no queda nada útil, null: el
// feedback determinista de Beto ya se mostró y basta.
export function validarCritica(c, lang = "en") {
  const linea = (v) => {
    if (typeof v !== "string") return null;
    const s = v.trim().slice(0, 220);
    if (!s || /https?:\/\//i.test(s)) return null;
    return idiomaEquivocado(s, lang) ? null : s; // línea en otro idioma: fuera
  };
  const acierto = linea(c?.acierto), fallo = linea(c?.fallo), mejora = linea(c?.mejora);
  if (!acierto && !fallo && !mejora) return null;
  return { acierto, fallo, mejora };
}

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
