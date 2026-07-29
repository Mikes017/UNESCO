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

import { puente, construirPrompt, construirPromptClasificacion, validarReaccion } from "./agentes.js";

// 👉 PON AQUÍ la URL de tu Worker tras `wrangler deploy`
export const PROXY_URL = "https://verified-proxy.miguelgrnova.workers.dev";

const TIMEOUT_MS = 6000; // si Gemini tarda más, caemos a offline sin congelar el juego

// fetch con límite de tiempo (para no dejar al usuario esperando)
async function fetchConTimeout(url, opciones, ms) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opciones, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

// La llamada real al proxy. Devuelve el objeto crudo (lo valida agentes.js).
// Lanza errores con .motivo para que pedirReaccion() sepa qué alerta mostrar.
async function llamarProxyReal(ctx) {
  const { system, user } = construirPrompt(ctx);
  let res;
  try {
    res = await fetchConTimeout(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, user, textoUsuario: ctx.textoUsuario || null }),
    }, TIMEOUT_MS);
  } catch (e) {
    const err = new Error("timeout/red"); err.motivo = "red"; throw err; // abort o red caída
  }
  if (res.status === 429) { const e = new Error("tokens"); e.motivo = "tokens"; throw e; }
  if (!res.ok) { const e = new Error("proxy"); e.motivo = "red"; throw e; }
  return await res.json();
}

// Clasificación de texto libre vía LLM (Fase 4). Devuelve { categoria }.
async function clasificarProxyReal(texto, ctx) {
  const { system, user } = construirPromptClasificacion(texto, ctx);
  let res;
  try {
    res = await fetchConTimeout(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, user, textoUsuario: texto, modo: "clasificar" }),
    }, TIMEOUT_MS);
  } catch (e) {
    const err = new Error("timeout/red"); err.motivo = "red"; throw err;
  }
  if (res.status === 429) { const e = new Error("tokens"); e.motivo = "tokens"; throw e; }
  if (!res.ok) { const e = new Error("proxy"); e.motivo = "red"; throw e; }
  return await res.json(); // { categoria: "..." }
}

// Enciende el puente y engancha la implementación real.
// (agentes.js llama internamente a puente.impl si existe; ver nota abajo.)
export function activarLLM() {
  puente.online = true;
  puente.impl = llamarProxyReal;          // reacciones de NPC
  puente.implClasificar = clasificarProxyReal; // clasificación de texto libre
}

export function desactivarLLM(motivo = "manual") {
  puente.online = false;
  puente.motivo = motivo;
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
