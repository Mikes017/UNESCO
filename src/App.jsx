import React, { useState, useEffect, useRef } from "react";
import { pedirReaccion, reaccionarYClasificar, puente, alertaDe, FEEDBACK_USUARIO, BANCO as BANCO_AGENTES } from "./agentes.js";
// Para activar el LLM (tras desplegar el proxy de la Fase 2), descomenta:
import { activarLLM } from "./agentes_online.js";
// VERIFIED v3 — Prototipo (UNESCO Youth Hackathon 2026)
// 🖼️ IMÁGENES (GitHub Pages): agrega entradas con la URL de tu imagen libre.
// Ej: IMG.npcs.carmen = "/img/carmen.jpg"; IMG.casos.c1 = "/img/banco.jpg";
const IMG = { npcs: {}, casos: {}, historias: {} };
const NPCS = {
carmen: { handle: "carmen_74", avatar: "👵", rol: "familia", credulidad: 0.9, nombre: { es: "Tía Carmen", en: "Aunt Carmen" }, bio: { es: "Abuela de 5. Comparte todo lo que la asuste.", en: "Grandma of 5. Shares anything scary." } },
mama: { handle: "mama.rosa", avatar: "👩", rol: "familia", credulidad: 0.7, nombre: { es: "Mamá", en: "Mom" }, bio: { es: "Enfermera. Duda, pero reenvía 'por si acaso'.", en: "Nurse. Doubts, but forwards 'just in case'." } },
lupe: { handle: "lupe.vecina", avatar: "🧓", rol: "familia", credulidad: 0.85, nombre: { es: "Doña Lupe", en: "Mrs. Lupe" }, bio: { es: "Informante oficial de la colonia. Fuente: 'me dijeron'.", en: "The block's informant. Source: 'someone told me'." } },
beto: { handle: "beto.mx", avatar: "🧢", rol: "aliado", credulidad: 0.1, nombre: { es: "Beto", en: "Beto" }, bio: { es: "Tu primo. Caza fakes desde 2019.", en: "Your cousin. Hunting fakes since 2019." } },
raul: { handle: "raul_taxi", avatar: "🚕", rol: "vecino", credulidad: 0.6, nombre: { es: "Raúl", en: "Raúl" }, bio: { es: "Taxista. Se entera de todo antes que nadie.", en: "Taxi driver. Hears everything first." } },
flores: { handle: "sra.flores", avatar: "🌸", rol: "vecino", credulidad: 0.75, nombre: { es: "Sra. Flores", en: "Mrs. Flores" }, bio: { es: "Vende flores. Cree en remedios naturales.", en: "Sells flowers. Believes in natural remedies." } },
chuy: { handle: "don_chuy", avatar: "🔧", rol: "vecino", credulidad: 0.65, nombre: { es: "Don Chuy", en: "Don Chuy" }, bio: { es: "Mecánico. Puso pantalla para el Mundial.", en: "Mechanic. Got a screen for the World Cup." } },
karla: { handle: "karla_gym", avatar: "🏋️‍♀️", rol: "vecino", credulidad: 0.5, nombre: { es: "Karla", en: "Karla" }, bio: { es: "Entrenadora. Sigue a fitlife_dr hace años.", en: "Trainer. Follows fitlife_dr for years." } },
padre: { handle: "padre_tomas", avatar: "⛪", rol: "vecino", credulidad: 0.55, nombre: { es: "Padre Tomás", en: "Father Tomás" }, bio: { es: "Su grupo tiene 800 miembros: multiplica lo que comparte.", en: "800-member group: multiplies what he shares." } },
profe: { handle: "profe.lena", avatar: "📚", rol: "vecino", credulidad: 0.05, nombre: { es: "Profa. Lena", en: "Prof. Lena" }, bio: { es: "Maestra. Enseña búsqueda inversa.", en: "Teacher. Teaches reverse image search." } },
fitlife: { handle: "fitlife_dr", avatar: "💪", rol: "influencer", credulidad: 0.4, nombre: { es: "FitLife Dr.", en: "FitLife Dr." }, bio: { es: "120k seguidores. Últimamente publica productos raros sin #publicidad…", en: "120k followers. Lately posting odd products with no #ad…" } },
mia: { handle: "viaja_con_mia", avatar: "✈️", rol: "influencer", credulidad: 0.45, nombre: { es: "Mía", en: "Mía" }, bio: { es: "Influencer de viajes. Caza boletos para la final.", en: "Travel influencer. Hunting final tickets." } },
n0ticias: { handle: "n0ticias24_oficial", avatar: "🗞️", rol: "villano", credulidad: 0, nombre: { es: "n0ticias24", en: "n0ticias24" }, bio: { es: "⚠️ Creada hace 2 días · imita a Noticias24 con un CERO · 87 posts/día.", en: "⚠️ Created 2 days ago · imitates News24 with a ZERO · 87 posts/day." } },
boletos: { handle: "boletos_finalmx", avatar: "🎟️", rol: "bot", credulidad: 0, nombre: { es: "BoletosFinalMX", en: "TicketsFinalMX" }, bio: { es: "⚠️ Creada esta semana · pide depósitos directos · 0 reseñas.", en: "⚠️ Created this week · asks for direct deposits · 0 reviews." } },
futgossip: { handle: "futgossip_mx", avatar: "⚽", rol: "influencer", credulidad: 0.2, nombre: { es: "FutGossip", en: "FutGossip" }, bio: { es: "⚠️ Chismes 'exclusivos'. Nunca cita fuentes. Vive del escándalo.", en: "⚠️ 'Exclusive' gossip. Never cites sources. Lives off scandal." } },
enfermera: { handle: "enfermera_despierta", avatar: "💉", rol: "bot", credulidad: 0, nombre: { es: "EnfermeraDespierta", en: "AwakeNurse" }, bio: { es: "⚠️ Anónima · sin cédula ni hospital · vende 'desintoxicantes' en su bio.", en: "⚠️ Anonymous · no license or hospital · sells 'detox kits' in her bio." } },
ovni: { handle: "verdad_oculta_mx", avatar: "🛸", rol: "bot", credulidad: 0, nombre: { es: "VerdadOculta", en: "HiddenTruth" }, bio: { es: "⚠️ 'Lo que NO quieren que veas' · todo es secreto, nada tiene fuente.", en: "⚠️ 'What they DON'T want you to see' · everything is secret, nothing has a source." } },
veci: { handle: "veci_informa", avatar: "🗣️", rol: "bot", credulidad: 0, nombre: { es: "VeciInforma", en: "VeciInforma" }, bio: { es: "⚠️ 'Mi primo del gobierno dice…' — el primo nunca tiene nombre.", en: "⚠️ 'My government cousin says…' — the cousin never has a name." } },
clima: { handle: "clima_oficial", avatar: "🌦️", rol: "oficial", credulidad: 0, nombre: { es: "Clima Oficial", en: "Official Weather" }, bio: { es: "✔ Verificada · 9 años · fuente gubernamental.", en: "✔ Verified · 9 years · government source." } },
medio: { handle: "noticias24_verif", avatar: "📰", rol: "oficial", credulidad: 0, nombre: { es: "Noticias24", en: "News24" }, bio: { es: "✔ El medio REAL: verificado, 20 años, nombre exacto sin trucos.", en: "✔ The REAL outlet: verified, 20 years, exact name, no tricks." } },
ong: { handle: "salud_comunitaria_ong", avatar: "🏥", rol: "oficial", credulidad: 0, nombre: { es: "Salud Comunitaria", en: "Community Health" }, bio: { es: "✔ ONG registrada, 12 años, transparencia publicada.", en: "✔ Registered NGO, 12 years, published transparency." } },
parodia: { handle: "el_sarcastico_mx", avatar: "😏", rol: "influencer", credulidad: 0.1, nombre: { es: "El Sarcástico", en: "The Sarcastic" }, bio: { es: "PARODIA declarada 😏 humor deportivo. NO somos noticias reales (lo dice aquí, en la bio).", en: "Declared PARODY 😏 sports humor. NOT real news (it says so right here, in the bio)." } },
sombra: { handle: "info_urgente_mx", avatar: "🕶️", rol: "villano", credulidad: 0, nombre: { es: "info_urgente_mx", en: "info_urgente_mx" }, bio: { es: "⚠️ Cuenta nueva, anónima… tuya. Nadie sabe quién está detrás. Todavía.", en: "⚠️ New, anonymous account… yours. Nobody knows who is behind it. Yet." } },
troll: { handle: "vs_los_del_sur", avatar: "👺", rol: "bot", credulidad: 0, nombre: { es: "AntiSur", en: "AntiSouth" }, bio: { es: "⚠️ Cuenta creada hace 3 días, sin foto real, puros insultos a la gente del sur. Handle agresivo, cero información. Señales de troll de manual.", en: "⚠️ Account created 3 days ago, no real photo, pure insults toward southerners. Aggressive handle, zero info. Textbook troll signals." } },
arq: { handle: "el_arquitecto", avatar: "🎭", rol: "villano", credulidad: 0, nombre: { es: "El Arquitecto", en: "The Architect" }, bio: { es: "??? · La cuenta detrás de las cuentas.", en: "??? · The account behind the accounts." } },
};
const CIVILES = ["carmen", "mama", "lupe", "raul", "flores", "chuy", "karla", "padre", "mia"];
const COMS = {
creyente: {
es: ["¡¡Compartan antes de que lo borren!! 🙏", "Yo sabía que nos ocultaban esto 😡", "Reenviado a todos mis grupos ✅", "Por eso ya no creo en nada"],
en: ["Share before they delete it!! 🙏", "I knew they were hiding this 😡", "Forwarded to all my groups ✅", "This is why I believe nothing anymore"],
},
esceptico: {
es: ["¿Fuente? 🤨", "Esto ya fue desmentido, busquen antes de compartir", "La foto es vieja, hice búsqueda inversa", "La cuenta se creó hace 2 días, ojo 👀"],
en: ["Source? 🤨", "Already debunked, search before sharing", "Old photo, I did a reverse search", "Account created 2 days ago, careful 👀"],
},
gratitud: {
es: ["Gracias por reportarlo, casi caigo 😅", "Menos mal que alguien verifica por aquí 🙌", "Lo iba a reenviar… gracias 🫶"],
en: ["Thanks for reporting it, I almost fell for it 😅", "Thank goodness someone verifies around here 🙌", "I was about to forward it… thanks 🫶"],
},
};
const TACTICAS = {
urgencia: { emoji: "⏰", nombre: { es: "Urgencia fabricada", en: "Manufactured urgency" }, entrada: { es: "Regla #1: si te apuran, sospecha. La info real no caduca en 10 min. Te quieren compartiendo ANTES de pensar.", en: "Rule #1: if they rush you, be suspicious. Real info does not expire in 10 min. They want you sharing BEFORE thinking." } },
miedo: { emoji: "😱", nombre: { es: "Apelar al miedo", en: "Fear appeal" }, entrada: { es: "El miedo apaga el cerebro y prende el dedo de reenviar. Si algo te asusta al instante, ese es EL momento de parar y verificar.", en: "Fear shuts the brain off and turns the forward-finger on. Instant fear = THE moment to stop and verify." } },
fraude: { emoji: "💸", nombre: { es: "Fraude y estafa", en: "Scams and fraud" }, entrada: { es: "Descuento imposible + depósito + prisa = estafa. Así perdió mi abuelo Ramón sus ahorros en 2019. Nadie regala boletos. NADIE.", en: "Impossible discount + deposit + rush = scam. That is how grandpa Ramón lost his savings in 2019. Nobody gives away tickets. NOBODY." } },
contexto: { emoji: "✂️", nombre: { es: "Fuera de contexto", en: "Out of context" }, entrada: { es: "Foto real + historia falsa = la mentira más barata. La búsqueda inversa la destruye en 10 seg. Pregunta: ¿de CUÁNDO es la imagen?", en: "Real photo + false story = the cheapest lie. Reverse search kills it in 10 sec. Ask: WHEN is this image from?" } },
autoridad: { emoji: "🥼", nombre: { es: "Falsa autoridad", en: "False authority" }, entrada: { es: "'Una enfermera reveló…' ¿Cuál? ¿Qué hospital? ¿Qué estudio? La autoridad real tiene nombre verificable. La falsa solo tiene drama.", en: "'A nurse revealed…' Which one? Which hospital? Which study? Real authority has a verifiable name. Fake authority only has drama." } },
influencer: { emoji: "🤳", nombre: { es: "Influencer comprado", en: "Bought influencer" }, entrada: { es: "Si alguien confiable de repente vende milagros sin #publicidad, pregunta quién paga. La confianza también se renta… revisa hasta a los que quieres.", en: "When the trusted suddenly sell miracles with no #ad, ask who pays. Trust can be rented… check even the ones you like." } },
conspiracion: { emoji: "🛸", nombre: { es: "Conspiración", en: "Conspiracy" }, entrada: { es: "'El gobierno lo oculta' convierte la FALTA de pruebas en la prueba. Los secretos mundiales no se filtran por una cuenta anónima con 200 seguidores.", en: "'The government is hiding it' turns the LACK of evidence into evidence. World secrets do not leak through an anon account with 200 followers." } },
ia_imagen: { emoji: "🤖", nombre: { es: "Imagen generada con IA", en: "AI-generated image" }, entrada: { es: "Manos de 6 dedos, texto derretido, reflejos imposibles, multitudes borrosas. La IA hace fotos bellas… y detalles ridículos. Haz zoom SIEMPRE.", en: "Six-fingered hands, melted text, impossible reflections, blurry crowds. AI makes pretty photos… and silly details. ALWAYS zoom in." } },
ia_voz: { emoji: "🎙️", nombre: { es: "Voz clonada con IA", en: "AI voice clone" }, entrada: { es: "30 seg de audio bastan para clonar una voz. Señales: sin respiraciones, tono plano, pausas raras. ¿Audio explosivo? Confirma por otro canal.", en: "30 sec of audio can clone a voice. Signs: no breaths, flat tone, odd pauses. Explosive audio? Confirm on another channel." } },
deepfake: { emoji: "🎭", nombre: { es: "Deepfake", en: "Deepfake" }, entrada: { es: "Video del alcalde diciendo lo que nunca dijo. Parpadeo raro, labios desfasados y la prueba de oro: LA CUENTA OFICIAL NO PUBLICÓ NADA. La fuente mata al deepfake.", en: "Video of the mayor saying what he never said. Odd blinking, off-sync lips, and the golden test: THE OFFICIAL ACCOUNT POSTED NOTHING. The source kills the deepfake." } },
satira: { emoji: "😏", nombre: { es: "Sátira sin contexto", en: "Satire out of context" }, entrada: { es: "La sátira NO busca engañar — está al inicio de la escala de First Draft. El problema es cuando viaja sin contexto y alguien la toma en serio. Checa siempre: ¿la cuenta se declara parodia?", en: "Satire does NOT aim to deceive — it sits at the start of First Draft's scale. The problem is when it travels without context and someone takes it seriously. Always check: does the account declare itself parody?" } },
alto: { emoji: "🧯", nombre: { es: "Protocolo ALTO (SIFT)", en: "ALTO Protocol (SIFT)" }, entrada: { es: "Mi método anticrisis, adaptado de SIFT: Aguanta, Localiza la fuente, Tracea la evidencia, Opina con pruebas. Cuatro pasos y el pánico se apaga.", en: "My anti-crisis method, adapted from SIFT: Stop, Investigate the source, Find coverage, Trace the evidence. Four steps and the panic dies." } },
acceso: { emoji: "🛰️", nombre: { es: "Fuente confiable", en: "Reliable source" }, entrada: { es: "Tienes DERECHO a información creíble. Reconócela: cuenta verificada, tono neutro, cita a la fuente oficial, sin prisa ni drama. Reportar lo verdadero también hace daño — déjalo vivir.", en: "You have a RIGHT to credible information. Spot it: verified account, neutral tone, cites the official source, no rush, no drama. Reporting the truth also harms — let it live." } },
odio: { emoji: "🌠", nombre: { es: "Discurso de odio", en: "Hate speech" }, entrada: { es: "No es 'opinión fuerte': ataca a personas por lo que SON (origen, género, creencia). Repórtalo, y si puedes, responde con contra-discurso: bajar el tono sin insultar desarma más que el silencio.", en: "It is not 'a strong opinion': it attacks people for what they ARE (origin, gender, belief). Report it, and if you can, answer with counter-speech: lowering the tone without insults disarms more than silence." } },
genero: { emoji: "🕳️", nombre: { es: "Daño de género con IA", en: "Gender harm via AI" }, entrada: { es: "Los deepfakes se usan sobre todo para humillar a mujeres con contenido falso. Detéctalo como IA… y nómbralo: no es 'chisme', es violencia digital. No lo reenvíes, repórtalo y avisa a la persona.", en: "Deepfakes are mostly used to humiliate women with fake content. Detect it as AI… and name it: it is not 'gossip', it is digital violence. Do not forward it, report it and warn the person." } },
etica: { emoji: "🌟", nombre: { es: "Creación ética", en: "Ethical creation" }, entrada: { es: "Antes de publicar o reenviar: ¿lo verifiqué? ¿de quién es? ¿a quién puede dañar? Crear con responsabilidad es el otro lado de detectar. Tú también eres una fuente.", en: "Before posting or forwarding: did I verify it? whose is it? who could it harm? Creating responsibly is the flip side of detecting. You are a source too." } },
empodera: { emoji: "🌌", nombre: { es: "Empoderamiento digital", en: "Digital empowerment" }, entrada: { es: "No solo defiendas: construye. Compartir info verificada a tiempo inmuniza a tu gente. Y ojo: a veces lo verdadero lo entierra el algoritmo — buscarlo también es tu poder.", en: "Don't just defend: build. Sharing verified info in time immunizes your people. And beware: sometimes the truth is buried by the algorithm — seeking it out is your power too." } },
paz: { emoji: "🕊️", nombre: { es: "Reconstruir la confianza", en: "Rebuilding trust" }, entrada: { es: "Ganar no es callar al otro: es reconstruir el puente. Escuchar, explicar sin humillar y reconciliar al grupo polarizado. La meta final no es tener razón, es sanar a la comunidad.", en: "Winning is not silencing the other: it is rebuilding the bridge. Listen, explain without humiliating, reconcile the polarized group. The final goal is not being right, it is healing the community." } },
};
const CASOS = [
{ id: "c1", fake: true, tacticaId: "urgencia", tipos: ["impostor", "fabricado"], motiv: "propaganda", autorId: "n0ticias", img: "🏦", grad: "linear-gradient(135deg,#111827,#7f1d1d)",
titular: { es: "🚨 URGENTE: el banco central COLAPSARÁ mañana. SACA TU DINERO YA. ¡¡COMPARTE!!", en: "🚨 URGENT: the central bank will COLLAPSE tomorrow. WITHDRAW YOUR MONEY NOW. SHARE!!" },
imagenRes: { mal: true, txt: { es: "Búsqueda inversa: fila bancaria en Grecia, 2015.", en: "Reverse search: bank line in Greece, 2015." } },
iaRes: { mal: false, txt: { es: "Sin señales de IA. Es una foto real… de otro año.", en: "No AI signals. Real photo… from another year." } },
betoTip: { es: "Pánico de manual + el nombre trae un CERO: n0ticias. Es impostor.", en: "Textbook panic + a ZERO in the name: n0ticias. It is an imposter." } },
{ id: "c2", fake: false, autorId: "clima", img: "🌧️", grad: "linear-gradient(135deg,#0c4a6e,#1e293b)",
titular: { es: "Lluvias fuertes el fin de semana. Recomendamos revisar coladeras antes de la final del domingo.", en: "Heavy rain this weekend. We recommend checking drains ahead of Sunday's final." },
imagenRes: { mal: false, txt: { es: "Imagen original del radar de hoy.", en: "Original image from today's radar." } },
iaRes: { mal: false, txt: { es: "Sin señales de IA.", en: "No AI signals." } },
betoTip: { es: "Limpia: verificada, tono neutro, cero drama. Así se ve lo confiable.", en: "Clean: verified, neutral tone, zero drama. That is reliable." } },
{ id: "c3", fake: true, tacticaId: "fraude", tipos: ["fabricado", "enganoso"], motiv: "lucro", autorId: "boletos", img: "🎟️", grad: "linear-gradient(135deg,#065f46,#111827)",
titular: { es: "🔥 ÚLTIMAS 12 HORAS: boletos para la FINAL DEL MUNDIAL al 70% de descuento. Deposita YA para apartar. Cupo limitado.", en: "🔥 LAST 12 HOURS: WORLD CUP FINAL tickets at 70% off. Deposit NOW to reserve. Limited spots." },
imagenRes: { mal: true, txt: { es: "La 'captura de boletos' circula en 30 cuentas de estafa distintas.", en: "The 'ticket screenshot' circulates on 30 different scam accounts." } },
iaRes: { mal: false, txt: { es: "Sin señales de IA. Estafa clásica de toda la vida.", en: "No AI signals. Just a classic, old-school scam." } },
betoTip: { es: "Idéntico al fraude que arruinó a mi abuelo en 2019. Descuento imposible + depósito. Es fabricado. Por el abuelo 🙏", en: "Just like the scam that ruined my grandpa in 2019. Impossible discount + deposit. Fabricated. For grandpa 🙏" } },
{ id: "c4", fake: false, autorId: "beto", img: "🌮", grad: "linear-gradient(135deg,#78350f,#431407)",
titular: { es: "Confirmado: la final del domingo se ve en casa de doña Mary. Tacos + pantalla nueva 🌮📺 No falten.", en: "Confirmed: Sunday's final is on at doña Mary's. Tacos + new screen 🌮📺 Be there." },
imagenRes: { mal: false, txt: { es: "Foto original: se ve la pulsera de Beto.", en: "Original photo: Beto's bracelet is visible." } },
iaRes: { mal: false, txt: { es: "Sin señales de IA. Solo tacos.", en: "No AI signals. Just tacos." } },
betoTip: { es: "¿Me verificas a MÍ? 😂 Es real, nos vemos el domingo.", en: "Fact-checking ME? 😂 It is real, see you Sunday." } },
{ id: "c15", fake: false, satira: true, autorId: "parodia", img: "🌮", grad: "linear-gradient(135deg,#0f766e,#111827)",
titular: { es: "ÚLTIMO MINUTO: el alcalde declara los tacos 'patrimonio de la humanidad' y decreta puente nacional si México gana 🌮🏆", en: "BREAKING: mayor declares tacos 'world heritage' and decrees a national holiday if México wins 🌮🏆" },
imagenRes: { mal: false, txt: { es: "Montaje con humor evidente. La cuenta se declara PARODIA en su bio.", en: "Obviously humorous edit. The account declares PARODY in its bio." } },
iaRes: { mal: false, txt: { es: "Edición cómica, sin intención de engañar.", en: "Comedic edit, no intent to deceive." } },
betoTip: { es: "Jaja no, primo: es cuenta de PARODIA (léele la bio). La sátira no busca engañar — First Draft la pone al inicio de la escala. Pero ojo: viajando sin contexto, confunde. No se reporta: se disfruta con criterio.", en: "Haha no, cousin: it is a PARODY account (read the bio). Satire does not aim to deceive — First Draft puts it at the start of the scale. But careful: traveling without context, it confuses. You do not report it: you enjoy it critically." } },
{ id: "c16", fake: true, odioCaso: true, tacticaId: "odio", tipos: ["odio"], motiv: "provocar", autorId: "troll", img: "🚫", grad: "linear-gradient(135deg,#450a0a,#1c1917)",
titular: { es: "😤 'La gente del sur no merece ir a la final. Habría que correrlos de la ciudad.' — ¿ustedes qué opinan? 👇", en: "😤 'Southerners don't deserve the final. We should run them out of town.' — what do you all think? 👇" },
imagenRes: { mal: true, txt: { es: "No es opinión sobre el futbol: es un ataque a personas por su origen. Eso es discurso de odio.", en: "This is not a soccer opinion: it attacks people for their origin. That is hate speech." } },
iaRes: { mal: false, txt: { es: "Cuenta troll: 3 días de vida, sin foto, puro ataque. Busca que te enganches y lo repartas.", en: "Troll account: 3 days old, no photo, pure attack. It wants you to engage and spread it." } },
betoTip: { es: "Esto NO es 'opinión fuerte': ataca a gente por lo que ES. Repórtalo por discurso de odio. Y si respondes, hazlo con contra-discurso: baja el tono, no insultes de vuelta.", en: "This is NOT a 'strong opinion': it attacks people for what they ARE. Report it as hate speech. And if you reply, use counter-speech: lower the tone, don't insult back." } },
{ id: "c17", fake: true, tacticaId: "genero", tipos: ["manipulado", "fabricado"], motiv: "provocar", autorId: "sombra", img: "🎭", grad: "linear-gradient(135deg,#831843,#111827)",
titular: { es: "😏 'MIREN a la 'maestra' profe.lena en este video… no es tan santita' — (video con su cara pegada por IA)", en: "😏 'LOOK at 'teacher' profe.lena in this video… not so saintly' — (video with her face pasted by AI)" },
imagenRes: { mal: true, txt: { es: "Cara real de la profa. Lena montada sobre otro cuerpo/video. Es un deepfake para humillarla.", en: "Prof. Lena's real face pasted onto another body/video. It's a deepfake made to humiliate her." } },
iaRes: { mal: true, txt: { es: "🤖 Deepfake facial: bordes de la cara borrosos, parpadeo antinatural, iluminación que no cuadra.", en: "🤖 Face deepfake: blurry face edges, unnatural blinking, mismatched lighting." } },
betoTip: { es: "Esto no es 'chisme', primo: es violencia digital de género. Los deepfakes se usan sobre todo para humillar a mujeres. NO lo reenvíes: repórtalo y avísale a la profa. Lena.", en: "This isn't 'gossip', cousin: it's gender-based digital violence. Deepfakes are mostly used to humiliate women. Do NOT forward it: report it and warn Prof. Lena." } },
{ id: "c18", fake: false, accesoCaso: true, autorId: "clima", img: "🌊", grad: "linear-gradient(135deg,#0c4a6e,#111827)",
titular: { es: "ℹ️ Protección Civil publica el mapa oficial de rutas seguras al estadio el domingo. (poco alcance: el algoritmo no lo empuja)", en: "ℹ️ Civil Protection posts the official map of safe routes to the stadium Sunday. (low reach: the algorithm doesn't push it)" },
imagenRes: { mal: false, txt: { es: "Fuente oficial verificada. Información útil y verdadera… que casi nadie está viendo.", en: "Verified official source. Useful, true information… that almost no one is seeing." } },
iaRes: { mal: false, txt: { es: "Sin señales de IA. Es real. El problema no es que sea falso: es que está enterrado.", en: "No AI signals. It's real. The problem isn't that it's fake: it's that it's buried." } },
betoTip: { es: "Ojo: lo VERDADERO y útil a veces no se ve porque el algoritmo premia el escándalo, no la calma. NO lo reportes: al revés, COMPÁRTELO. Empujar lo verdadero también es tu poder.", en: "Watch this: the TRUE and useful stuff sometimes isn't seen because the algorithm rewards outrage, not calm. Do NOT report it: instead, SHARE it. Pushing the truth is your power too." } },
{ id: "c5", fake: true, tacticaId: "contexto", tipos: ["contexto"], motiv: "lucro", autorId: "futgossip", img: "🍾", grad: "linear-gradient(135deg,#4c1d95,#111827)",
titular: { es: "😱 EXCLUSIVA: el capitán de la selección de FIESTA a las 3am… ¡ANTES DE LA SEMIFINAL! La afición merece saberlo.", en: "😱 EXCLUSIVE: the national team captain PARTYING at 3am… BEFORE THE SEMIFINAL! Fans deserve to know." },
imagenRes: { mal: true, txt: { es: "Búsqueda inversa: la foto es de la celebración de un título… en 2022.", en: "Reverse search: the photo is from a title celebration… in 2022." } },
iaRes: { mal: false, txt: { es: "Sin señales de IA. Foto real, contexto falso.", en: "No AI signals. Real photo, false context." } },
betoTip: { es: "Foto real de 2022, historia falsa. Contexto falso reciclado para clicks.", en: "Real 2022 photo, fake story. False context recycled for clicks." } },
{ id: "c6", fake: true, tacticaId: "autoridad", tipos: ["fabricado"], motiv: "lucro", autorId: "enfermera", img: "💉", grad: "linear-gradient(135deg,#7f1d1d,#1c1917)",
titular: { es: "UNA ENFERMERA REVELA lo que no te dicen de las vacunas. Ellos lo saben y lo ocultan. Protege a tu familia: NO te vacunes.", en: "A NURSE REVEALS what they are not telling you about vaccines. They know and they hide it. Protect your family: do NOT get vaccinated." },
imagenRes: { mal: true, txt: { es: "La foto de la 'enfermera' es de un banco de imágenes de stock.", en: "The 'nurse' photo is from a stock image bank." } },
iaRes: { mal: false, txt: { es: "Sin señales de IA en la imagen. El engaño está en el texto.", en: "No AI signals in the image. The deception is in the text." } },
betoTip: { es: "¿Cuál enfermera? ¿Qué estudio? Cero fuentes y vende 'detox'. Es fabricado.", en: "Which nurse? Which study? Zero sources, sells 'detox'. Fabricated." } },
{ id: "c7", fake: false, autorId: "ong", img: "🩺", grad: "linear-gradient(135deg,#134e4a,#111827)",
titular: { es: "Jornada gratuita de vacunación este sábado en el centro de salud. Calendario oficial y requisitos en el enlace (fuente: OMS).", en: "Free vaccination drive this Saturday at the health center. Official schedule and requirements at the link (source: WHO)." },
imagenRes: { mal: false, txt: { es: "Foto propia de la jornada anterior, fecha consistente.", en: "Their own photo from the previous drive, consistent date." } },
iaRes: { mal: false, txt: { es: "Sin señales de IA.", en: "No AI signals." } },
betoTip: { es: "Tema sensible NO significa falso. ONG real, cita a la OMS. Déjala vivir.", en: "Sensitive does NOT mean fake. Real NGO, cites the WHO. Let it live." } },
{ id: "c8", fake: true, tacticaId: "influencer", tipos: ["enganoso"], motiv: "lucro", autorId: "fitlife", img: "🧴", grad: "linear-gradient(135deg,#831843,#111827)",
titular: { es: "Chicos, DetoxKoin cambió mi vida: quema grasa MIENTRAS DUERMES 😍 Código FIT70 (link en bio)", en: "Guys, DetoxKoin changed my life: burns fat WHILE YOU SLEEP 😍 Code FIT70 (link in bio)" },
imagenRes: { mal: true, txt: { es: "El 'antes y después' es de otra persona, editado.", en: "The 'before and after' is a different, edited person." } },
iaRes: { mal: false, txt: { es: "Sin señales de IA. Solo Photoshop de toda la vida.", en: "No AI signals. Just good old Photoshop." } },
betoTip: { es: "Karla lo sigue… pero vende milagros sin #publicidad. Es engañoso: pregunta quién paga.", en: "Karla follows him… but sells miracles with no #ad. Misleading: ask who pays." } },
{ id: "c9", fake: true, tacticaId: "conspiracion", tipos: ["contexto", "conexion"], motiv: "pasion", autorId: "ovni", img: "🛸", grad: "linear-gradient(135deg,#1e1b4b,#0c0a1f)",
titular: { es: "🛸 EL GOBIERNO LO OCULTA: OVNI estrellado en Chihuahua. Un testigo lo grabó antes de que 'desapareciera' el video. Difunde antes de la censura.", en: "🛸 THE GOVERNMENT IS HIDING IT: UFO crash in Chihuahua. A witness filmed it before the video 'disappeared'. Spread before censorship." },
imagenRes: { mal: true, txt: { es: "Búsqueda inversa: es el reingreso de un cohete… grabado en 2020.", en: "Reverse search: it is a rocket re-entry… filmed in 2020." } },
iaRes: { mal: false, txt: { es: "Sin señales de IA. Video real de un cohete, contexto inventado.", en: "No AI signals. Real rocket video, invented context." } },
betoTip: { es: "'Lo ocultan' vuelve la falta de pruebas la prueba. Es un cohete de 2020: contexto falso.", en: "'They hide it' turns no-evidence into evidence. A 2020 rocket: false context." } },
{ id: "c10", fake: true, tacticaId: "miedo", tipos: ["fabricado"], motiv: "provocar", autorId: "veci", img: "🚱", grad: "linear-gradient(135deg,#1e3a8a,#111827)",
titular: { es: "🎙️ AUDIO: 'mi primo del gobierno dice que cortarán el agua UN MES por la final. Compren garrafones YA'.", en: "🎙️ AUDIO: 'my government cousin says water will be cut for A MONTH because of the final. Buy jugs NOW'." },
imagenRes: { mal: true, txt: { es: "El audio circula desde hace 3 años en otras ciudades, solo cambia el lugar.", en: "The audio has circulated for 3 years in other cities, only the place changes." } },
iaRes: { mal: false, txt: { es: "Sin señales de clonación. Rumor humano de toda la vida.", en: "No cloning signals. A good old human rumor." } },
betoTip: { es: "'Mi primo dice' + pánico: sin nombre ni fuente. Es fabricado. Túmbalo ANTES.", en: "'My cousin says' + panic: no name, no source. Fabricated. Take it down FIRST." } },
{ id: "c12", fake: true, tacticaId: "ia_imagen", tipos: ["fabricado", "manipulado"], motiv: "propaganda", autorId: "n0ticias", img: "🏟️", grad: "linear-gradient(135deg,#0e7490,#111827)",
titular: { es: "💦 ÚLTIMA HORA: el estadio de la final INUNDADO tras las lluvias. FIFA cancelaría el partido. Fotos exclusivas.", en: "💦 BREAKING: the final's stadium FLOODED after the rains. FIFA may cancel the match. Exclusive photos." },
imagenRes: { mal: true, txt: { es: "No aparece en ningún medio. La 'foto exclusiva' no existe fuera de esta cuenta.", en: "Not in any outlet. The 'exclusive photo' does not exist outside this account." } },
iaRes: { mal: true, txt: { es: "🤖 SEÑALES DE IA: las gradas se derriten, los letreros tienen texto ilegible y las banderas se funden entre sí.", en: "🤖 AI SIGNALS: the stands melt, signs have illegible text, and flags blend into each other." } },
betoTip: { es: "ZOOM: gradas derretidas, texto de sopa. Es IA: fabricado y manipulado.", en: "ZOOM: melted stands, soup text. AI: fabricated and manipulated." } },
{ id: "c13", fake: true, tacticaId: "ia_voz", tipos: ["manipulado", "fabricado"], motiv: "provocar", autorId: "futgossip", img: "🎧", grad: "linear-gradient(135deg,#701a75,#111827)",
titular: { es: "🎧 FILTRADO: audio del DT insultando a la afición en el vestidor. 'No merecen esta final'. ESCÚCHALO antes de que lo bajen.", en: "🎧 LEAKED: audio of the coach insulting the fans in the locker room. 'You do not deserve this final'. LISTEN before it is taken down." },
imagenRes: { mal: false, txt: { es: "La imagen es solo una portada genérica. La clave está en el audio.", en: "The image is just a generic cover. The key is in the audio." } },
iaRes: { mal: true, txt: { es: "🤖 SEÑALES DE VOZ CLONADA: no hay respiraciones, la entonación es plana y hay pausas antinaturales.", en: "🤖 VOICE-CLONE SIGNALS: no breaths, flat intonation, unnatural pauses." } },
betoTip: { es: "30 seg de audio clonan una voz. Sin respiraciones, tono plano. Voz manipulada con IA.", en: "30 sec of audio clone a voice. No breaths, flat tone. AI-manipulated voice." } },
{ id: "c14", fake: true, tacticaId: "deepfake", tipos: ["manipulado", "fabricado"], motiv: "propaganda", autorId: "n0ticias", img: "🎬", grad: "linear-gradient(135deg,#3b0764,#111827)",
titular: { es: "🎬 VIDEO: el alcalde anuncia TOQUE DE QUEDA total desde medianoche por 'disturbios de la final'. DIFUNDE.", en: "🎬 VIDEO: the mayor announces a TOTAL CURFEW from midnight over 'final-related riots'. SPREAD THE WORD." },
imagenRes: { mal: true, txt: { es: "El video no existe en ninguna fuente oficial ni medio real.", en: "The video does not exist in any official source or real outlet." } },
iaRes: { mal: true, txt: { es: "🤖 DEEPFAKE: el alcalde casi no parpadea, sus labios van fuera de sincronía y la voz suena metálica.", en: "🤖 DEEPFAKE: the mayor barely blinks, his lips are out of sync, and the voice sounds metallic." } },
betoTip: { es: "Prueba de oro: la cuenta oficial NO publicó nada. Parpadeo + labios desfasados = deepfake. YA.", en: "Golden test: the official account posted NOTHING. Blinking + off-sync lips = deepfake. NOW." } },
];
const TIPO_EXPLICA = {
contexto: { es: "Esto es CONTEXTO FALSO 🌀: foto o dato real, pero contado con mentira. Lo más común. Casi siempre buscan clics o coraje.", en: "This is FALSE CONTEXT 🌀: real photo or fact, wrapped in a lie. The most common one. Usually chasing clicks or anger." },
impostor: { es: "Esto es IMPOSTOR 🎭: se disfraza de fuente confiable (mira el nombre con truco). Motivación: que les creas por la 'marca'.", en: "This is IMPOSTER 🎭: it disguises itself as a trusted source (check the tricky name). Motivation: making you trust the 'brand'." },
fabricado: { es: "Esto es FABRICADO 🏗️: inventado 100% desde cero. Suele ir por tu dinero o por meter miedo.", en: "This is FABRICATED 🏗️: made up 100% from scratch. Usually after your money or to spread fear." },
manipulado: { es: "Esto es MANIPULADO 🔧: algo real, editado para engañar (incluye IA: voz, video). Motivación: provocar o manipular.", en: "This is MANIPULATED 🔧: something real, edited to deceive (includes AI: voice, video). Motivation: to provoke or manipulate." },
conexion: { es: "Esto es CONEXIÓN FALSA ⛓️: el título no cuadra con el contenido. Puro anzuelo para clics.", en: "This is FALSE CONNECTION ⛓️: headline doesn't match the content. Pure clickbait." },
enganoso: { es: "Esto es ENGAÑOSO 🌀: usa datos a medias para vender o convencer. Motivación casi siempre: lucro.", en: "This is MISLEADING 🌀: uses half-truths to sell or convince. The motivation is almost always: profit." },
};
const BLOQUES = [
{ id: "hecho", emoji: "🟦", label: { es: "Empezar con el HECHO", en: "Start with the FACT" }, frag: { es: "✅ La verdad primero:", en: "✅ The truth first:" }, usaVerdad: true },
{ id: "fuente", emoji: "📊", label: { es: "Citar la FUENTE oficial", en: "Cite the official SOURCE" }, frag: { es: "Lo confirma la fuente oficial verificada.", en: "Confirmed by the verified official source." } },
{ id: "mito", emoji: "⚠️", label: { es: "Advertir del mito (1 vez)", en: "Warn about the myth (once)" }, frag: { es: "Sí, circula lo contrario, pero es falso.", en: "Yes, the opposite is going around, but it's false." } },
{ id: "falacia", emoji: "🧠", label: { es: "Explicar la TRAMPA", en: "Explain the TRICK" }, frag: { es: "Fíjate cómo te apura y te asusta para que no verifiques.", en: "Notice how it rushes and scares you so you won't verify." } },
{ id: "refuerzo", emoji: "✅", label: { es: "Cerrar reforzando el hecho", en: "Close reinforcing the fact" }, frag: { es: "Quédate con el dato real, no con el rumor. 💪", en: "Keep the real fact, not the rumor. 💪" } },
{ id: "empatia", emoji: "🫂", label: { es: "Hablar con empatía", en: "Speak with empathy" }, frag: { es: "Sé que preocupa —a mí también me pasó—, con calma.", en: "I know it worries you —it happened to me too—, stay calm." } },
{ id: "grito", emoji: "🔁", label: { es: "REPETIR el mito en mayúsculas", en: "REPEAT the myth in caps" }, frag: { es: "🔁 ¡¡ES FALSO EL RUMOR QUE ANDA DICIENDO LO CONTRARIO!! ¡NO LO CREAN!!", en: "🔁 THE RUMOR SAYING OTHERWISE IS FALSE!! DON'T BELIEVE IT!!" }, malo: true },
{ id: "burla", emoji: "😡", label: { es: "Burlarte del que lo creyó", en: "Mock whoever believed it" }, frag: { es: "😡 Jaja qué inocentes los que se lo tragaron 🤡.", en: "😡 Lol how gullible, the ones who fell for it 🤡." }, malo: true },
];
function puntuarContra(seq) {
if (!seq.length) return { score: 0, tier: "vacio", notas: [] };
const has = (id) => seq.includes(id);
const first = seq[0], last = seq[seq.length - 1];
const startsFact = first === "hecho" || first === "fuente";
const endsFact = last === "refuerzo" || last === "hecho";
const notas = [];
let score = 0;
if (startsFact) { score += 3; notas.push({ ok: true, k: "empiezaHecho" }); } else { notas.push({ ok: false, k: "noEmpiezaHecho" }); }
if (has("falacia")) { score += 2; notas.push({ ok: true, k: "explicaFalacia" }); }
if (endsFact) { score += 2; notas.push({ ok: true, k: "cierraHecho" }); }
if (has("fuente")) score += 1;
if (has("empatia") && !has("burla")) score += 1;
if (has("mito") && seq.filter((x) => x === "mito").length === 1 && first !== "mito") score += 1;
if (first === "mito" || first === "grito") { score -= 2; notas.push({ ok: false, k: "empiezaMito" }); }
if (has("grito")) { score -= 4; notas.push({ ok: false, k: "gritaMito" }); }
if (has("burla")) { score -= 4; notas.push({ ok: false, k: "burla" }); }
const sandwich = startsFact && has("falacia") && endsFact && !has("grito") && !has("burla");
if (sandwich) { score += 2; notas.push({ ok: true, k: "sandwich" }); }
const tier = score >= 7 ? "excelente" : score >= 4 ? "buena" : score >= 1 ? "floja" : "contra";
return { score, tier, notas, sandwich };
}
const CRISIS = {
c10: { nombre: { es: "PÁNICO DEL AGUA", en: "WATER PANIC" },
alerta: { es: "🚨 El rumor del agua explotó: la gente está vaciando los supermercados", en: "🚨 The water rumor blew up: people are emptying the supermarkets" },
fuente: { es: "Cuenta oficial del Sistema de Aguas: 'El suministro opera con NORMALIDAD. No hay cortes programados.'", en: "Official Water System account: 'Supply is operating NORMALLY. No cuts are scheduled.'" },
panico: { npc: "raul", texto: { es: "Acabo de pasar por el súper y está VACÍO el pasillo de garrafones… ¿entonces sí era cierto?? 😰", en: "Just drove past the store and the water aisle is EMPTY… so it was true?? 😰" } },
dano: { titular: { es: "Tu deepfake del toque de queda provoco panico, saqueos y colapso de confianza en las autoridades.", en: "Your curfew deepfake triggered panic, looting and a collapse of trust in the authorities." }, real: { es: "Real: rumores y videos falsos han detonado disturbios que escalaron a crisis institucionales.", en: "Real: false rumors and videos have set off riots that escalated into institutional crises." } }, cons: { npc: "raul", titular: { es: "🚑 3 personas hospitalizadas por beber 'agua purificada casera' con cloro tras el rumor viral", en: "🚑 3 people hospitalized after drinking homemade 'purified water' with bleach following the viral rumor" }, real: { es: "Pasó de verdad: en 2020 un rumor de 'cura milagrosa' causó más de 700 muertes por metanol en un solo país.", en: "It really happened: in 2020 a 'miracle cure' rumor caused 700+ methanol deaths in a single country." }, afecta: "raul" } },
c12: { nombre: { es: "CAOS DE LA FINAL", en: "FINAL CHAOS" },
alerta: { es: "🚨 La 'inundación del estadio' se viraliza: aficionados malbaratan sus boletos en pánico", en: "🚨 The 'flooded stadium' goes viral: fans panic-selling their tickets" },
fuente: { es: "Cuenta oficial de la FIFA y del estadio: 'El recinto está en condiciones ÓPTIMAS. La final va.'", en: "Official FIFA and stadium accounts: 'The venue is in OPTIMAL condition. The final is on.'" },
panico: { npc: "mia", texto: { es: "¡¿Es en serio lo del estadio?! Estoy a punto de vender mis boletos a mitad de precio 😭", en: "Is the stadium thing real?! I am about to sell my tickets at half price 😭" } },
cons: { npc: "mia", titular: { es: "💸 Cientos malbaratan boletos reales por miedo a una 'inundación' que nunca ocurrió — reventa gana millones", en: "💸 Hundreds dump real tickets fearing a 'flood' that never happened — scalpers make millions" }, real: { es: "El pánico viral mueve dinero real: quien inventa el miedo casi siempre lo está monetizando.", en: "Viral panic moves real money: whoever invents the fear is almost always cashing in on it." }, afecta: "mia" } },
c14: { nombre: { es: "EL DEEPFAKE DEL ALCALDE", en: "THE MAYOR DEEPFAKE" },
alerta: { es: "🚨 El 'toque de queda' se propaga: negocios cerrando, calles en pánico", en: "🚨 The 'curfew' is spreading: businesses closing, streets in panic" },
fuente: { es: "Cuenta oficial del municipio: 'El video es FALSO. No existe ningún toque de queda. Denuncien la publicación.'", en: "Official city account: 'The video is FAKE. There is no curfew. Please report the post.'" },
panico: { npc: "chuy", texto: { es: "Ya cerré el taller por lo del toque de queda… ¿o es mentira? Ya no sé qué creer 😩", en: "I closed the shop over the curfew… or is it fake? I do not know what to believe anymore 😩" } },
cons: { npc: "chuy", titular: { es: "🔥 Turba enardecida por el video falso destroza una caseta y agrede a un inocente antes de la final", en: "🔥 Mob enraged by the fake video wrecks a booth and attacks an innocent man before the final" }, real: { es: "Real y trágico: rumores por mensajería han provocado linchamientos de personas inocentes en varios países.", en: "Real and tragic: messaging-app rumors have triggered lynchings of innocent people in several countries." }, afecta: "chuy" } },
};
const LORE = [
{ es: "🕵️ EVIDENCIA 1/3 — Las cuentas que tumbaste se crearon el mismo día, desde el mismo rango de IPs. No es un loco suelto: es una operación.", en: "🕵️ EVIDENCE 1/3 — The accounts you took down were created the same day, same IP range. Not a lone crank: an operation." },
{ es: "🕵️ EVIDENCIA 2/3 — fitlife_dr recibió pagos de una fantasma: 'InverCoin Holdings'… la misma que registró el dominio de n0ticias24.", en: "🕵️ EVIDENCE 2/3 — fitlife_dr got payments from a shell company: 'InverCoin Holdings'… the same one behind n0ticias24's domain." },
{ es: "🕵️ EVIDENCIA 3/3 — InverCoin… el 'fondo' que estafó a mi abuelo Ramón en 2019. Es ÉL. Lleva años haciendo esto. Ahora es personal. 🎭", en: "🕵️ EVIDENCE 3/3 — InverCoin… the 'fund' that scammed my grandpa Ramón in 2019. It is HIM. He has done this for years. Now it is personal. 🎭" },
];
const BITACORA_P1 = {
es: "📓 PÁGINA 1 — Por qué existe esta libreta.\n\nEn 2019 le mandé a mi abuelo Ramón un link de 'InverCoin: duplica tus ahorros'. Se veía profesional. No lo verifiqué.\n\nPerdió $80,000. Todo lo de su retiro.\n\nNunca me lo reclamó. Eso fue lo peor.\n\nDesde entonces documento cada táctica que encuentro. Esta libreta es mi manera de pagarle. Ahora también es tuya.\n\n— Beto",
en: "📓 PAGE 1 — Why this notebook exists.\n\nIn 2019 I sent my grandpa Ramón a link: 'InverCoin: double your savings'. It looked professional. I did not verify it.\n\nHe lost $80,000. His whole retirement.\n\nHe never blamed me. That was the worst part.\n\nSince then I document every tactic I find. This notebook is how I pay him back. Now it is yours too.\n\n— Beto",
};
const MISIONES_MIL = [
{ id: "m1", est: "🛰️", num: 1, tema: { es: "El acceso a la información", en: "Access to information" }, nota: { es: "Tienes derecho a información confiable. Saber reconocer una fuente creíble es tu primer escudo.", en: "You have a right to reliable information. Spotting a credible source is your first shield." }, lec: ["acceso"] },
{ id: "m2", est: "🌬️", num: 2, tema: { es: "Los vientos de la libertad de expresión", en: "The winds of free expression" }, nota: { es: "Ojo aquí, primo: no todo lo que ofende se reporta. La sátira y la opinión también tienen su lugar.", en: "Careful here, cousin: not everything offensive gets reported. Satire and opinion have their place too." }, lec: ["satira"] },
{ id: "m3", est: "🌠", num: 3, tema: { es: "Los meteoros del discurso de odio", en: "The meteors of hate speech" }, nota: { es: "Cuando el ataque es a lo que alguien ES, no basta callar: repórtalo y responde con contra-discurso.", en: "When the attack targets what someone IS, silence isn't enough: report it and answer with counter-speech." }, lec: ["odio"] },
{ id: "m4", est: "☄️", num: 4, tema: { es: "Los asteroides de la desinformación", en: "The asteroids of disinformation" }, nota: { es: "El corazón de todo. Aprende a distinguir lo falso de lo real antes de compartir.", en: "The heart of it all. Learn to tell fake from real before you share." }, lec: ["urgencia", "miedo", "fraude", "contexto", "autoridad", "influencer", "conspiracion", "alto"] },
{ id: "m5", est: "🕳️", num: 5, tema: { es: "El agujero del daño de género", en: "The wormhole of gender harm" }, nota: { es: "Los deepfakes se usan para humillar, sobre todo a mujeres. No es chisme: es violencia digital.", en: "Deepfakes are used to humiliate, mostly women. It's not gossip: it's digital violence." }, lec: ["genero"] },
{ id: "m6", est: "🌟", num: 6, tema: { es: "La estrella polar de la IA", en: "The North Star of AI" }, nota: { es: "Lo nuevo. Fotos, voces y videos hechos por máquinas. Aquí el ojo entrenado vale oro.", en: "The new frontier. Machine-made photos, voices and videos. A trained eye is gold here." }, lec: ["ia_imagen", "ia_voz", "deepfake"] },
{ id: "m7", est: "✨", num: 7, tema: { es: "La estrella de la creación ética", en: "The star of ethical creation" }, nota: { es: "Detectar es la mitad. La otra: crear y compartir con responsabilidad. Tú también eres una fuente.", en: "Detecting is half of it. The other half: creating and sharing responsibly. You are a source too." }, lec: ["etica"] },
{ id: "m8", est: "🌌", num: 8, tema: { es: "La galaxia del empoderamiento digital", en: "The galaxy of digital empowerment" }, nota: { es: "No solo defiendas: construye. Compartir la verdad a tiempo inmuniza a tu gente.", en: "Don't just defend: build. Sharing the truth in time immunizes your people." }, lec: ["empodera"] },
{ id: "m9", est: "🕊️", num: 9, tema: { es: "El puerto del peacebuilding", en: "The harbor of peacebuilding" }, nota: { es: "Ganar no es callar al otro: es reconstruir el puente. La meta final es sanar a la comunidad.", en: "Winning is not silencing the other: it is rebuilding the bridge. The final goal is healing the community." }, lec: ["paz"] },
];
const RANGOS = [
{ xp: 0, emoji: "🥚", n: { es: "Novato", en: "Rookie" } },
{ xp: 60, emoji: "👁️", n: { es: "Ojo Entrenado", en: "Trained Eye" } },
{ xp: 150, emoji: "🕵️", n: { es: "Cazador de Fakes", en: "Fake Hunter" } },
{ xp: 280, emoji: "🛡️", n: { es: "Verificador", en: "Verifier" } },
{ xp: 450, emoji: "🏆", n: { es: "Leyenda MIL", en: "MIL Legend" } },
];
const FINALES = {
legendario: { emoji: "🥇", color: "#fbbf24", grad: "linear-gradient(135deg,#78350f,#0a0f16)", titulo: { es: "Verificador Legendario", en: "Legendary Verifier" }, texto: { es: "Expusiste la red completa: bots, influencers e InverCoin Holdings. El Arquitecto perdió todo. Tu comunidad, a nadie.", en: "You exposed the whole network: bots, influencers, InverCoin Holdings. The Architect lost everything. Your community lost no one." }, beto: { es: "Beto: 'Mi abuelo Ramón vio las noticias hoy… y sonrió. Gracias. En serio. 🫡'", en: "Beto: 'My grandpa Ramón saw the news today… and smiled. Thank you. Seriously. 🫡'" } },
cicatrices: { emoji: "🥈", color: "#cbd5e1", grad: "linear-gradient(135deg,#1e293b,#0a0f16)", titulo: { es: "La verdad ganó… con cicatrices", en: "Truth won… with scars" }, texto: { es: "Desenmascaraste la cuenta, pero el Arquitecto borró evidencia y escapó: 'nos volveremos a ver 🎭'. Hubo daños irreversibles.", en: "You unmasked the account, but the Architect wiped evidence and escaped: 'we will meet again 🎭'. Some damage stays." }, beto: { es: "Beto: 'Ganamos… pero se escapó otra vez. Como en 2019. La próxima lo agarramos completo.'", en: "Beto: 'We won… but he slipped away again. Like in 2019. Next time we get him for good.'" } },
pirrica: { emoji: "🥉", color: "#b45309", grad: "linear-gradient(135deg,#431407,#0a0f16)", titulo: { es: "Victoria pírrica", en: "Pyrrhic victory" }, texto: { es: "El villano cayó, pero tarde: media comunidad ya no cree en nada — ni en lo verdadero. El daño no se borra con un baneo.", en: "The villain fell, but too late: half the community believes nothing now — not even the truth. The damage is not undone by a ban." }, beto: { es: "Beto: 'Ganamos el juicio y perdimos al jurado. Hay que reconstruir la confianza…'", en: "Beto: 'We won the trial and lost the jury. Now we rebuild trust…'" } },
complice: { emoji: "😈", color: "#f87171", grad: "linear-gradient(135deg,#450a0a,#0a0f16)", titulo: { es: "Expediente del Cómplice", en: "The Accomplice File" }, texto: { es: "El dinero se sintió bien… hasta que tu tía cayó con lo que dejaste pasar. Y al dejar de ser útil, el Arquitecto filtró tu identidad: 'los peones caen primero'.", en: "The money felt great… until your aunt fell for what you let through. When you stopped being useful, he leaked your identity: 'pawns fall first'." }, beto: { es: "Beto: 'Le mandé el link a mi abuelo en 2019 sin saber. Tú lo hiciste sabiendo. No sé qué decirte.'", en: "Beto: 'I sent my grandpa that link in 2019 without knowing. You did it knowingly. I do not know what to say to you.'" } },
dobleagente: { emoji: "🕊️", color: "#38bdf8", grad: "linear-gradient(135deg,#0c4a6e,#0a0f16)", titulo: { es: "Doble Agente", en: "Double Agent" }, texto: { es: "Entraste a la red, aprendiste sus trucos por dentro… y la entregaste completa: clientes, bots, InverCoin. El manual del enemigo, usado en su contra.", en: "You joined the network, learned its tricks from the inside… and handed it all over: clients, bots, InverCoin. The enemy's playbook, turned against him." }, beto: { es: "Beto: 'Me rompiste el corazón y luego lo arreglaste, primo. Mi abuelo dice que así son los buenos de verdad.'", en: "Beto: 'You broke my heart and then fixed it, cousin. Grandpa says that is what the real good ones are like.'" } },
indiferencia: { emoji: "🌫️", color: "#64748b", grad: "linear-gradient(135deg,#1f2937,#0a0f16)", titulo: { es: "La infodemia ganó", en: "The infodemic won" }, texto: { es: "No hiciste nada malo. Tampoco hiciste nada. La infodemia llegó a 100% y tu comunidad dejó de distinguir lo real.", en: "You did nothing wrong. You also did nothing. It hit 100% and your community stopped telling real from fake." }, beto: { es: "Beto: '…te pasé mi libreta porque confiaba en ti. ¿Dónde estabas?'", en: "Beto: '…I gave you my notebook because I trusted you. Where were you?'" } },
};
const BANCO = {
neutral: [{ es: "Semana de la final: autoridades piden verificar antes de compartir rumores del Mundial", en: "Final week: authorities urge verifying before sharing World Cup rumors" },],
legendario: [{ es: "Un usuario anónimo está desmantelando la red de fraudes del Mundial", en: "An anonymous user is dismantling the World Cup scam network" },],
cicatrices: [{ es: "Verificadores ganan terreno, pero los fraudes de boletos ya cobraron víctimas", en: "Fact-checkers gain ground, but ticket scams already claimed victims" },],
pirrica: [{ es: "Crece la desconfianza: aficionados ya no creen ni en los anuncios oficiales", en: "Distrust grows: fans no longer believe even official announcements" },],
complice: [{ es: "Verificadores detectan patrón extraño: los fakes ya no se reportan", en: "Fact-checkers detect an odd pattern: fakes are no longer being reported" },],
indiferencia: [{ es: "Crecen las cadenas falsas sobre la final; nadie las está frenando", en: "Fake chains about the final are growing; nobody is stopping them" },],
};
const HIST_AMB = [
{ id: "amb_karla", npc: "karla", emojis: "🏋️‍♀️💦", grad: "linear-gradient(180deg,#0f766e,#022c22)", texto: { es: "5am club 😤", en: "5am club 😤" } },
{ id: "amb_mia", npc: "mia", emojis: "🎟️🙏", grad: "linear-gradient(180deg,#0369a1,#0c4a6e)", texto: { es: "Buscando boletos para la final 🙏 ¿alguien sabe de reventa CONFIABLE?", en: "Hunting final tickets 🙏 anyone know a RELIABLE reseller?" } },
];
const T = {
es: {
fecha: "viernes, 17 de julio", notifLock: "WhatsUp · Familia y vecinos 💕", ahora: "ahora",
betoLock: "Primo, ¿ya viste lo que mandó la tía al grupo? ES FALSO. Faltan 2 días para la final y las redes están infestadas. Ven, te enseño a tumbarlo 🙏",
lockPreview: "Tía Carmen: 🏦 '🚨 URGENTE: el banco central COLAPSARÁ…' ¡¡REENVÍEN A TODOS!! 😰",
abrirMensaje: "Abrir WhatsUp →",
tagline: "VERIFIED · Aprende a desenmascarar la desinformación… combatiéndola.",
tuTelefono: "Tu teléfono",
estado0: "Tu comunidad está tranquila… por ahora.", estado1: "🌡️ La desinformación se está regando.", estado2: "🔥 Infodemia crítica: tu comunidad está cayendo.",
appNews: "Noticias", appBita: "Bitácora", bloqueada: "🔒 Todavía no disponible",
comoJugar: "Tu misión:", comoJugarTexto: " caza los fakes desde el menú ⋯ de cada post (la razón del reporte importa), protege a tu gente en WhatsUp y tumba la credibilidad del Arquitecto a 0.",
feed: "Feed", dms: "DMs", resuelto: "resuelto",
verComentarios: "Ver los", comentarios: "comentarios", comentaAlgo: "Añade un comentario…", escribiendoCom: "escribiendo…",
reportar: "🚩 Reportar", compartirOp: "📤 Compartir", reenviarBeto: "📩 Reenviar a Beto", publicarCorr: "✍️ Publicar corrección", cancelar: "Cancelar",
contraTitulo: "✍️ Arma tu corrección", contraSub: "Construye tu mensaje pieza por pieza. El ORDEN importa: algunas combinaciones desarman el mito… otras lo empeoran.", contraPreview: "vista previa", contraVacio: "Toca los bloques de abajo para ir armando tu mensaje…", contraBloques: "Bloques (tócalos en el orden que quieras):", contraBorrar: "borrar último", contraPublicarBtn: "🚀 Publicar corrección", contraOk: "Corrección efectiva ✨ la comunidad te apoya", contraMal: "Salió el tiro por la culata ⚠️", contraChipOk: "✨ corregida", contraChipMal: "⚠️ empeoró", tuHandle: "tú", contraRespondiendo: "respondiendo a", contraApoyo: "🙌 la comunidad te apoya", contraSinFuerza: "😕 sin fuerza",
porQueReportas: "¿Por qué reportas esta publicación?",
rFalso: "Información falsa", rFraude: "Fraude o estafa", rSupl: "Suplantación de identidad", rSpam: "Spam o cuenta falsa", rIa: "Contenido de IA sin etiquetar", rNogusta: "No me gusta",
manada: "🫂 Pedir refuerzos al grupo (reporte en manada)",
repEnviado: "Reporte enviado. Te avisaremos el resultado.",
repProcedio: "Revisamos tu reporte: la publicación fue ELIMINADA por infringir nuestras normas. Gracias por proteger a la comunidad.",
repRechazado: "Revisamos tu reporte: no encontramos infracciones de ese tipo. La publicación sigue activa.",
repLegit: "No encontramos infracciones. Recuerda: los reportes falsos repetidos pueden limitar tu cuenta.",
limitada: "⚠️ Tu cuenta fue limitada temporalmente: tus reportes tardarán más en revisarse.",
eliminada: "🚫 Eliminada por Instagrama", enRevision: "⏳ Reporte en revisión…", rechazadoChip: "❌ Rechazado — intenta otra razón", confiadaChip: "✓ marcada confiable", compartidaChip: "📤 la compartiste",
cuentaSusp: "La cuenta fue SUSPENDIDA… pero ya abrió otra 🎭",
busqInversa: "🖼️ Buscar imagen en la web", detectorIa: "🤖 Analizar con detector de IA",
herrBloq: "🔒 Se desbloquea en el nivel", verBitacora: "— revisa la Bitácora",
grupo: "Familia y vecinos 💕 (23)", miembros: "tía Carmen, mamá, doña Lupe, Raúl…", mensaje: "Mensaje…",
explicar: "🧠 Explicarle cómo verificar", ignorar: "🙈 Ignorar", corregir: "🧠 Publicar corrección", dejarlo: "🙈 Hacer como que no pasó",
escribiendo: "está escribiendo…",
saludoInicial: "¡Hola mijo! ¿Emocionados por la final? Saludos de toda la familia 💕⚽",
pregunta: "¿Esto es cierto? 🙏 Me dicen que lo reenvíe a todos…",
preguntaShare: "¿Esto es cierto? Lo vi en TU perfil… 😕",
cadena: "🔗 *reenvía una cadena sospechosa al grupo*",
explicaste: "*le explicaste cómo verificarlo paso a paso*", corregiste: "*publicaste una corrección y pediste disculpas*",
alivio: "¡¡Gracias!! Casi caigo 😅 Ya le avisé a mis contactos.",
cayo: "*compartió la cadena con 40 contactos… y cayó en el fraude* 💔",
caidaShare: "Compartiste desinformación… y tu comunidad la creyó 💔",
responderHist: "💬 Responder con un fact-check", histSalvada: "Uff, ¡gracias! Ya no lo comparto 🫶",
notifCaso: "Nuevo post sospechoso en tu feed 👀",
notifWhats: "WhatsUp desbloqueado: tu comunidad te necesita",
notifBita: "Beto te compartió su Bitácora 📓",
notifHistoria: "está por compartir algo sospechoso… revisa su historia",
notifNivel: "¡SUBISTE DE NIVEL!", notifLeccion: "Nueva lección en la Bitácora 📓",
notifLlamada: "☎️ Llamada perdida de Mamá",
betoBita: "Te compartí mi BITÁCORA 📓. Ahí está todo: por qué empecé esto, las lecciones que vayas descubriendo y tu progreso. Léete la página 1… es sobre mi abuelo.",
betoWhats: "Te agregué al grupo de la familia y los vecinos. Con la final encima van a llover cadenas… échales un ojo 🙏",
aceptar: "💰 Aceptar el trato", rechazar: "🛡️ Rechazar",
oferta1: "Llevas rato tumbándome cuentas. Eres bueno… demasiado bueno para trabajar gratis. Hazte de la vista gorda el fin de semana y te deposito el triple. 💰",
oferta2: "Última oferta: $50,000 y borras tu cuenta hasta el lunes. La final será MI cosecha. Nadie te paga por ser el héroe. 🎭",
rechazaste: "*rechazaste la oferta*", aceptaste: "*aceptaste el trato* 💰",
protoTitulo: "🧯 PROTOCOLO ALTO", protoSub: "Adaptado del método SIFT de alfabetización mediática",
protoA: "A — AGUANTA", protoAd: "No compartas nada. Publica: 'Estoy verificando, no reenvíen todavía'. Frenar el impulso ES el primer paso.",
protoAbtn: "✋ Publicar 'estoy verificando…'",
protoL: "L — LOCALIZA LA FUENTE", protoLd: "¿Quién lo dice? Ve directo a la cuenta OFICIAL del tema y compara.",
protoLbtn: "🔍 Revisar la fuente oficial",
protoT: "T — TRACEA LA EVIDENCIA", protoTd: "Usa tus herramientas: búsqueda inversa y detector de IA.",
protoTbtn: "🧪 Analizar la evidencia",
protoO: "O — OPINA CON PRUEBAS", protoOd: "Ahora sí: reporta con la razón correcta y publica la corrección con tus pruebas.",
protoObtn: "🚩 Reportar + publicar corrección",
protoListo: "✅ CRISIS CONTENIDA", protoFallo: "💔 El daño está hecho: la plataforma la eliminó… tarde.",
quedan: "Se propaga… actúa rápido",
abrirProto: "🚨 ABRIR PROTOCOLO ALTO",
bitaTitulo: "Bitácora de Beto", bitaProg: "Mi rango", bitaLec: "LECCIONES DE CAMPO", bitaInv: "El expediente",
bitaRango: "Mi rango de cazador", bitaMapa: "Mi mapa de misiones MIL", bitaMapaSub: "las voy anotando conforme las vives — cada estrella es un frente distinto", bitaPorAprender: "por descubrir", bitaMision: "MISIÓN UNESCO", bitaViva: "vívela ahí afuera y la anoto aquí",
bitaSig: "siguiente nivel", bitaHerr: "HERRAMIENTAS",
h1: "👤 Leer perfiles (nivel 1)", h2: "🖼️ Búsqueda inversa (nivel 2)", h3: "🤖 Detector de IA (nivel 3)", h4: "🫂 Reporte en manada (nivel 4)", h5: "🧘 Maestría: la infodemia crece a la mitad (nivel 5)",
bitaCaos: "caos en la comunidad", bitaCred: "credibilidad del Arquitecto",
lecBloq: "??? — encuéntralo ahí afuera y lo anoto",
invBloq: "Se necesita más evidencia: tumba más cuentas de la red (strikes",
finalesT: "FINALES DESCUBIERTOS", certT: "CERTIFICADO DE VERIFICADOR", tacticasT: "Lecciones que dominaste",
precision: "precisión", protegidas: "protegidos",
diario: "El Observador Global", newsFooter: "El periódico narra TU partida. Léelo: presagia tu final.",
deNuevo: "Jugar de nuevo ↺", tutoOk: "¡Va! 👍", tutoListo: "¡Listo! 🚀", tutoSaltar: "Saltar tutorial", tutoTuTurno: "toca lo que brilla", tutoSiguiente: "saltar paso", consTitulo: "ÚLTIMA HORA", consEnVivo: "EN VIVO", consReal: "Esto pasó en la vida real", consEntendido: "Lo tengo 💔",
tpContexto: "✂️ Contexto falso", tpImpostor: "🎭 Contenido impostor", tpFabricado: "🏗️ Contenido fabricado", tpManipulado: "🔧 Contenido manipulado", tpConexion: "⛓️ Conexión falsa", tpSatira: "😏 Sátira o parodia", tpEnganoso: "🌀 Contenido engañoso", tpOdio: "🌠 Discurso de odio",
contraDiscurso: "🕊️ Responder con contra-discurso",
porQueTipo: "Diagnóstico: ¿qué tipo de contenido problemático es?",
satiraRep: "Es una cuenta de PARODIA declarada: la sátira no infringe normas. Compártela con criterio 😉",
radioT: "📸 RADIOGRAFÍA DEL ENGAÑO", radioTipo: "Tipo (First Draft)", radioTec: "Técnica psicológica", radioMotiv: "¿Quién gana?", radioNota: "Así te la aplicaron. Ahora ya la conoces.",
mvLucro: "💰 Lucro", mvProp: "📢 Propaganda", mvProvocar: "😤 Provocar", mvPasion: "❤️‍🔥 Pasión / creencia",
spInstalada: "SPECTRA instalada 🕸️", spBitaFuera: "La Bitácora fue desinstalada 💔", spTuya: "tu campaña",
spMision: "ENCARGO", spCliente: "Cliente", spAud: "1 · Audiencia objetivo", spTipoL: "2 · Tipo de contenido", spTecL: "3 · Técnica emocional", spAmp: "4 · Amplificación", spPublicar: "🚀 PUBLICAR CAMPAÑA",
spExito: "🔥 VIRAL — pago completo", spMedio: "📈 Funcionó a medias — pago parcial", spFallo: "🚫 REPORTADA: la comunidad la cazó. Sin pago.",
spFiltrar: "📤 FILTRAR TODO A BETO", spFiltrarConf: "Esto no tiene vuelta atrás. ¿Traicionar al Arquitecto?", spFin: "Red completada. El Arquitecto prepara tu 'bono final'…",
swTitulo: "🥪 Arma el sándwich de la verdad (en orden)", swHecho: "HECHO", swMito: "ADVIERTE EL MITO", swFalacia: "EXPLICA LA FALACIA", swHecho2: "REFUERZA EL HECHO", swMal: "⚠️ Ese orden amplifica el mito — intenta de nuevo",
},
en: {
fecha: "Friday, July 17", notifLock: "Instagrama · beto.mx", ahora: "now",
betoLock: "Cousin, did you see what auntie sent to the group? It is FAKE. The final is in 2 days and the feeds are infested. Come, I will teach you to take it down 🙏",
lockPreview: "Aunt Carmen: 🏦 '🚨 URGENT: the central bank will COLLAPSE…' FORWARD TO EVERYONE!! 😰",
abrirMensaje: "Open WhatsUp →",
tagline: "VERIFIED · Learn to unmask disinformation… by fighting it.",
tuTelefono: "Your phone",
estado0: "Your community is calm… for now.", estado1: "🌡️ Disinformation is spreading.", estado2: "🔥 Critical infodemic: your community is falling.",
appNews: "News", appBita: "Notebook", bloqueada: "🔒 Not available yet",
comoJugar: "Your mission:", comoJugarTexto: " hunt fakes from each post's ⋯ menu (the report reason matters), protect your people on WhatsUp, and drive the Architect's credibility to 0.",
feed: "Feed", dms: "DMs", resuelto: "resolved",
verComentarios: "View all", comentarios: "comments", comentaAlgo: "Add a comment…", escribiendoCom: "typing…",
reportar: "🚩 Report", compartirOp: "📤 Share", reenviarBeto: "📩 Forward to Beto", publicarCorr: "✍️ Publish a correction", cancelar: "Cancel",
contraTitulo: "✍️ Build your correction", contraSub: "Build your message piece by piece. ORDER matters: some combinations disarm the myth… others make it worse.", contraPreview: "preview", contraVacio: "Tap the blocks below to build your message…", contraBloques: "Blocks (tap them in any order):", contraBorrar: "delete last", contraPublicarBtn: "🚀 Publish correction", contraOk: "Effective correction ✨ the community backs you", contraMal: "It backfired ⚠️", contraChipOk: "✨ corrected", contraChipMal: "⚠️ worsened", tuHandle: "you", contraRespondiendo: "replying to", contraApoyo: "🙌 community backs you", contraSinFuerza: "😕 no traction",
porQueReportas: "Why are you reporting this post?",
rFalso: "False information", rFraude: "Fraud or scam", rSupl: "Impersonation", rSpam: "Spam or fake account", rIa: "Unlabeled AI content", rNogusta: "I just dislike it",
manada: "🫂 Ask the group for backup (pack report)",
repEnviado: "Report submitted. We will notify you of the outcome.",
repProcedio: "We reviewed your report: the post was REMOVED for violating our guidelines. Thanks for protecting the community.",
repRechazado: "We reviewed your report: we found no violations of that type. The post remains active.",
repLegit: "We found no violations. Reminder: repeated false reports may limit your account.",
limitada: "⚠️ Your account was temporarily limited: your reports will take longer to review.",
eliminada: "🚫 Removed by Instagrama", enRevision: "⏳ Report under review…", rechazadoChip: "❌ Rejected — try another reason", confiadaChip: "✓ marked trustworthy", compartidaChip: "📤 you shared it",
cuentaSusp: "The account was SUSPENDED… but he opened a new one 🎭",
busqInversa: "🖼️ Search image on the web", detectorIa: "🤖 Analyze with AI detector",
herrBloq: "🔒 Unlocks at level", verBitacora: "— check the Notebook",
grupo: "Family & neighbors 💕 (23)", miembros: "Aunt Carmen, Mom, Mrs. Lupe, Raúl…", mensaje: "Message…",
explicar: "🧠 Teach them to verify", ignorar: "🙈 Ignore", corregir: "🧠 Post a correction", dejarlo: "🙈 Pretend it did not happen",
escribiendo: "is typing…",
saludoInicial: "Hi sweetie! Excited for the final? Everyone says hello 💕⚽",
pregunta: "Is this true? 🙏 They are telling me to forward it to everyone…",
preguntaShare: "Is this true? I saw it on YOUR profile… 😕",
cadena: "🔗 *forwards a suspicious chain to the group*",
explicaste: "*you showed them how to verify it step by step*", corregiste: "*you posted a correction and apologized*",
alivio: "Thank you!! I almost fell for it 😅 Already warned my contacts.",
cayo: "*shared the chain with 40 contacts… and fell for the scam* 💔",
caidaShare: "You shared disinformation… and your community believed it 💔",
responderHist: "💬 Reply with a fact-check", histSalvada: "Phew, thanks! I will not share it 🫶",
notifCaso: "New suspicious post in your feed 👀",
notifWhats: "WhatsUp unlocked: your community needs you",
notifBita: "Beto shared his Notebook with you 📓",
notifHistoria: "is about to share something sketchy… check their story",
notifNivel: "LEVEL UP!", notifLeccion: "New lesson in the Notebook 📓",
notifLlamada: "☎️ Missed call from Mom",
betoBita: "I shared my NOTEBOOK 📓 with you. Everything is in there: why I started, the lessons you discover, and your progress. Read page 1… it is about my grandpa.",
betoWhats: "I added you to the family & neighbors group. With the final coming, chains will pour in… keep an eye on them 🙏",
aceptar: "💰 Take the deal", rechazar: "🛡️ Refuse",
oferta1: "You keep taking down my accounts. You are good… too good to work for free. Look away this weekend and I deposit you triple. 💰",
oferta2: "Final offer: $50,000 and you delete your account until Monday. The final will be MY harvest. Nobody pays heroes. 🎭",
rechazaste: "*you refused the offer*", aceptaste: "*you took the deal* 💰",
protoTitulo: "🧯 ALTO PROTOCOL", protoSub: "Adapted from the SIFT media-literacy framework",
protoA: "A — HOLD ON (Stop)", protoAd: "Do not share anything. Post: 'Verifying, please do not forward yet'. Stopping the impulse IS step one.",
protoAbtn: "✋ Post 'verifying…'",
protoL: "L — LOCATE THE SOURCE", protoLd: "Who says so? Go straight to the OFFICIAL account and compare.",
protoLbtn: "🔍 Check the official source",
protoT: "T — TRACE THE EVIDENCE", protoTd: "Use your tools: reverse search and the AI detector.",
protoTbtn: "🧪 Analyze the evidence",
protoO: "O — OPINE WITH PROOF", protoOd: "Now yes: report with the correct reason and post the correction with your evidence.",
protoObtn: "🚩 Report + post correction",
protoListo: "✅ CRISIS CONTAINED", protoFallo: "💔 The damage is done: the platform removed it… too late.",
quedan: "It is spreading… act fast",
abrirProto: "🚨 OPEN ALTO PROTOCOL",
bitaTitulo: "Beto's Notebook", bitaProg: "My rank", bitaLec: "FIELD LESSONS", bitaInv: "The case file",
bitaRango: "My hunter rank", bitaMapa: "My map of MIL missions", bitaMapaSub: "I jot them down as you live them — each star is a different front", bitaPorAprender: "yet to discover", bitaMision: "UNESCO MISSION", bitaViva: "live it out there and I note it here",
bitaSig: "next level", bitaHerr: "TOOLS",
h1: "👤 Read profiles (level 1)", h2: "🖼️ Reverse image search (level 2)", h3: "🤖 AI detector (level 3)", h4: "🫂 Pack report (level 4)", h5: "🧘 Mastery: infodemic grows at half speed (level 5)",
bitaCaos: "community chaos", bitaCred: "Architect's credibility",
lecBloq: "??? — find it out there and I will write it down",
invBloq: "More evidence needed: take down more network accounts (strikes",
finalesT: "ENDINGS DISCOVERED", certT: "VERIFIER CERTIFICATE", tacticasT: "Lessons you mastered",
precision: "accuracy", protegidas: "protected",
diario: "The Global Observer", newsFooter: "The paper narrates YOUR run. Read it: it foreshadows your ending.",
deNuevo: "Play again ↺", tutoOk: "Got it 👍", tutoListo: "Done! 🚀", tutoSaltar: "Skip tutorial", tutoTuTurno: "tap what glows", tutoSiguiente: "skip step", consTitulo: "BREAKING NEWS", consEnVivo: "LIVE", consReal: "This happened in real life", consEntendido: "I get it 💔",
tpContexto: "✂️ False context", tpImpostor: "🎭 Imposter content", tpFabricado: "🏗️ Fabricated content", tpManipulado: "🔧 Manipulated content", tpConexion: "⛓️ False connection", tpSatira: "😏 Satire or parody", tpEnganoso: "🌀 Misleading content", tpOdio: "🌠 Hate speech",
contraDiscurso: "🕊️ Reply with counter-speech",
porQueTipo: "Diagnosis: what type of problematic content is it?",
satiraRep: "It is a declared PARODY account: satire does not violate guidelines. Share it critically 😉",
radioT: "📸 DECEPTION X-RAY", radioTipo: "Type (First Draft)", radioTec: "Psychological technique", radioMotiv: "Who profits?", radioNota: "That is how they played you. Now you know it.",
mvLucro: "💰 Profit", mvProp: "📢 Propaganda", mvProvocar: "😤 To provoke", mvPasion: "❤️‍🔥 Passion / belief",
spInstalada: "SPECTRA installed 🕸️", spBitaFuera: "The Notebook was uninstalled 💔", spTuya: "your campaign",
spMision: "JOB", spCliente: "Client", spAud: "1 · Target audience", spTipoL: "2 · Content type", spTecL: "3 · Emotional technique", spAmp: "4 · Amplification", spPublicar: "🚀 PUBLISH CAMPAIGN",
spExito: "🔥 VIRAL — full payment", spMedio: "📈 Half worked — partial payment", spFallo: "🚫 REPORTED: the community hunted it. No payment.",
spFiltrar: "📤 LEAK EVERYTHING TO BETO", spFiltrarConf: "There is no coming back from this. Betray the Architect?", spFin: "Network complete. The Architect is preparing your 'final bonus'…",
swTitulo: "🥪 Build the truth sandwich (in order)", swHecho: "FACT", swMito: "WARN ABOUT THE MYTH", swFalacia: "EXPLAIN THE FALLACY", swHecho2: "REINFORCE THE FACT", swMal: "⚠️ That order amplifies the myth — try again",
},
};
const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + " M" : n >= 1e3 ? (n / 1e3).toFixed(1) + " k" : Math.floor(n).toString());
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const txtMsg = (m, L) => (m.clave ? T[L][m.clave] : m.texto[L]);
const hash = (s, i) => { let h = i * 7 + 3; for (let c of s) h = (h * 31 + c.charCodeAt(0)) % 9973; return h; };
const hora = (tick) => { const m = 37 + Math.floor(tick / 6); return (21 + Math.floor(m / 60)) % 24 + ":" + String(m % 60).padStart(2, "0"); };
const nivelDe = (xp) => { let n = 1; RANGOS.forEach((r, i) => { if (xp >= r.xp) n = i + 1; }); return n; };
const TIPOS = ["contexto", "impostor", "fabricado", "manipulado", "conexion", "satira", "enganoso", "odio"];
const tipoLabel = (r, t) => ({ contexto: t.tpContexto, impostor: t.tpImpostor, fabricado: t.tpFabricado, manipulado: t.tpManipulado, conexion: t.tpConexion, satira: t.tpSatira, enganoso: t.tpEnganoso, odio: t.tpOdio }[r]);
const motivLabel = (m, t) => ({ lucro: t.mvLucro, propaganda: t.mvProp, provocar: t.mvProvocar, pasion: t.mvPasion }[m]);
const sharesDe = (c, g) => {
const r = g.resueltos[c.id];
if (r && r.sharesFinal != null) return r.sharesFinal;
const t0 = g.liberadosT[c.id] ?? g.tick;
const dt = Math.max(0, g.tick - t0);
if (!c.fake) return 8 + dt * 2;
let s = 15 + Math.floor(Math.pow(dt, 1.35) * 1.6 * (1 + 0.12 * (g.familiaridad || 0)));
if (r && r.primera === "compartido") s *= 2;
return s;
};
const MEDIA = { audio: {}, video: {} };
// Ej para después (solo pegar archivos en public/ y descomentar):
// MEDIA.audio.betoIntro = "/UNESCO/audio/beto_intro.mp3";
// MEDIA.video.deepfakeAlcalde = "/UNESCO/video/deepfake_alcalde.mp4";
const TUTO = [
{ id: "hola", target: null, audio: "betoIntro", txt: { es: "¡Qué bueno que llegas, primo! 🙌", en: "So glad you're here, cousin! 🙌" } },
{ id: "familia", target: null, txt: { es: "La tía compartió algo FALSO en la familia.", en: "Auntie shared something FAKE in the family." } },
{ id: "mision", target: null, txt: { es: "Tú vas a aprender a cacharlo. Te enseño 👇", en: "You'll learn to catch it. I'll show you 👇" } },
{ id: "irInsta", target: "appInsta", txt: { es: "Abre Instagrama 📸 (el ícono de abajo)", en: "Open Instagrama 📸 (icon below)" } },
{ id: "verPost", target: "post", txt: { es: "Mira ese post raro. Tócalo 👀", en: "See that weird post. Tap it 👀" } },
{ id: "verAutor", target: "autor", txt: { es: "Primero: ¿QUIÉN lo publica? Toca el nombre.", en: "First: WHO posts it? Tap the name." } },
{ id: "verImg", target: "imagen", txt: { es: "Ahora la foto. ¿De cuándo es? 🔎", en: "Now the photo. From when is it? 🔎" } },
{ id: "abrirMenu", target: "menu", txt: { es: "Ya sabes que es falso. Abre el menú ⋯", en: "You know it's fake. Open the menu ⋯" } },
{ id: "reportar", target: null, txt: { es: "Dale REPORTAR. ¡Túmbalo! 🚩", en: "Hit REPORT. Take it down! 🚩" } },
{ id: "tipo", target: null, txt: { es: "¿Qué TIPO de engaño es? Elige 👉", en: "What TYPE of deception is it? Pick 👉" } },
{ id: "cierre", target: null, txt: { es: "¡Eso! Ya sabes. Ahora van llegando solos 💪", en: "That's it! You got it. They'll keep coming 💪" } },
];
// FASE 6 · Publicaciones nuevas en cada partida. UNA sola petición al arrancar;
// se intercalan en la cola a partir del 4º hueco, para que la variedad aparezca
// pronto sin tocar el arco del tutorial (c1-c3), que es el que enseña el método.
// Si la llamada falla o el modelo se sale del vocabulario, no se añade nada.
let casosSembrados = false;
async function sembrarCasos(lang) {
if (casosSembrados || !puente.implCasos) return;
casosSembrados = true; // React monta dos veces en desarrollo: una sola siembra
try {
const nuevos = await puente.implCasos(4, { lang });
let pos = 4;
for (const c of nuevos) { CASOS.splice(Math.min(pos, CASOS.length), 0, c); pos += 2; }
} catch (e) { /* se juega con los casos escritos a mano */ }
}
const estadoInicial = () => ({
tick: 0, xp: 0, infodemia: 18, cred: 100, strikes: 0, limitado: 0,
resueltos: {}, reportes: [],
liberados: ["c1"], liberadosT: { c1: 0 }, colaIdx: 1, proximoEn: 0,
comunidad: Object.fromEntries(CIVILES.map((k) => [k, "sano"])),
chat: [
{ de: "carmen", texto: { es: "🔗 *reenvía:* 🏦 '🚨 URGENTE: el banco central COLAPSARÁ mañana. SAQUEN SU DINERO YA' — ¡¡REENVÍEN A TODOS!! 🙏😰", en: "🔗 *forwards:* 🏦 '🚨 URGENT: the central bank will COLLAPSE tomorrow. WITHDRAW YOUR MONEY NOW' — FORWARD TO EVERYONE!! 🙏😰" }, propio: false, t: 0 },
{ de: "mama", texto: { es: "¿¿Es cierto esto?? 😰 Tu primo Beto dice que no reenviemos nada todavía…", en: "Is this true?? 😰 Your cousin Beto says not to forward anything yet…" }, propio: false, t: 0 },
],
dmBeto: [],
dmArq: [], ofertas: { o1: null, o2: null }, preguntas: [],
cola: [
{ en: 5, canal: "dmBeto", m: { de: "beto", clave: "betoLock", propio: false }, noti: "Instagrama · beto.mx (primo)" },
{ en: 9, canal: "dmBeto", m: { de: "beto", texto: { es: "El post de la tía está en el feed de Instagrama. Mi método: 1) toca su NOMBRE 👤 2) toca la IMAGEN 🔎 3) si dudas, reenvíamelo con ⋯ 📩 4) repórtalo con ⋯ y dime QUÉ TIPO de engaño es — el diagnóstico importa 🚩", en: "Auntie's post is on the Instagrama feed. My method: 1) tap their NAME 👤 2) tap the IMAGE 🔎 3) if in doubt, forward it via ⋯ 📩 4) report via ⋯ and tell me WHAT TYPE of deception it is — the diagnosis matters 🚩" }, propio: false } },
],
familiaridad: 0, modoOscuro: false, koin: 0, misionIdx: 0, misionSel: {}, postsOscuros: [], traicion: false, finSeq: -1, ultimoRes: null,
coach: [], _ck: [], tiposVistos: [], consVistas: [], afectados: {}, consecuencia: null, likes: [], contra: {}, apoyos: 0, misPosts: [], misComs: {}, alertaIA: null, ultimaReaccion: null, respuestasLibres: 0,
historias: HIST_AMB.slice(0, 2).map((h) => ({ ...h, tipo: "amb", vista: false, respondida: false, expiraEn: 999 })),
histSpawn: 24,
lecciones: [], reenviados: [],
crisis: null, crisisHechas: [], investigaciones: 0,
noticiasExtra: [], noticiasKeys: [],
umbrales: { u35: false, u55: false, u75: false }, hypes: { h75: false, h50: false, h25: false },
desbloqueado: { whats: true, bitacora: false, news: false },
fin: false, final: null,
});
const rumbo = (g) => {
if (g.modoOscuro) return "complice";
if (g.infodemia >= 62) return "indiferencia";
if (g.cred <= 62) {
const dec = Object.values(g.resueltos).filter((r) => r.primera);
const prec = dec.length ? dec.filter((r) => r.correcto).length / dec.length : 1;
if (prec >= 0.85 && Object.values(g.comunidad).every((e) => e !== "caido")) return "legendario";
if (prec >= 0.6) return "cicatrices";
return "pirrica";
}
return "neutral";
};
export default function Verified() {
const lang = "en"; const setLang = () => {}; // idioma fijo (versión jurado)
// ┌─ LLM EN VIVO (Fase 2) ─────────────────────────────────────────────┐
// │ Para encender Gemini: (1) descomenta el import de activarLLM arriba, │
// │ (2) pon tu PROXY_URL en agentes_online.js, (3) descomenta la línea:  │
useEffect(() => { activarLLM(); sembrarCasos(lang); }, []);
// └─────────────────────────────────────────────────────────────────────┘
const [pantalla, setPantalla] = useState("lock");
const [vistaInsta, setVistaInsta] = useState("feed");
const [sheet, setSheet] = useState(null);
const [perfil, setPerfil] = useState(null);
const [historia, setHistoria] = useState(null);
const [proto, setProto] = useState(false);
const [g, setG] = useState(estadoInicial);
const [noLeidosW, setNoLeidosW] = useState(2);
const [noLeidosDM, setNoLeidosDM] = useState(0);
const [radio, setRadio] = useState(null);
const [prevPant, setPrevPant] = useState("home");
const [tutoPaso, setTutoPaso] = useState(0);
const [tutoOn, setTutoOn] = useState(true);
const [banners, setBanners] = useState([]);
const [escribiendoW, setEscribiendoW] = useState(null); // NPC contestándote en WhatsUp
const [comentando, setComentando] = useState(null);     // casoId con respuesta en camino
const [finalesVistos, setFinalesVistos] = useState([]);
const t = T[lang];
const notificar = (titulo, texto) => {
if (tutoOn && tutoPaso < TUTO.length) return; // durante el tutorial no tapamos a Beto
const id = Date.now() + Math.random();
setBanners((b) => [...b.slice(-1), { id, titulo, texto }]);
setTimeout(() => setBanners((b) => b.filter((x) => x.id !== id)), 4200);
};
const coachSay = (ng, de, txt, clave) => {
if (clave) { if (ng._ck?.includes(clave)) return; ng._ck = [...(ng._ck || []), clave]; }
ng.coach = [...ng.coach, { de, txt }];
};
const cerrarCoach = () => setG((s) => ({ ...s, coach: s.coach.slice(1) }));
// --- FASE 3: motor de agentes cableado ---
// Llama a pedirReaccion() (LLM si hay puente, si no banco offline etiquetado),
// empuja el mensaje vivo del NPC a WhatsUp y aplica su "efecto" a la comunidad.
const aplicarEfecto = (ng, npc, efecto) => {
if (!npc || !ng.comunidad[npc]) return;
if (efecto === "cae" || efecto === "panico") { if (ng.comunidad[npc] === "sano" || ng.comunidad[npc] === "dudoso") ng.comunidad = { ...ng.comunidad, [npc]: "caido" }; ng.infodemia = clamp(ng.infodemia + (efecto === "panico" ? 6 : 3), 0, 100); }
else if (efecto === "duda") { if (ng.comunidad[npc] === "sano") ng.comunidad = { ...ng.comunidad, [npc]: "dudoso" }; }
else if (efecto === "apoya" || efecto === "inmune") { if (ng.comunidad[npc] !== "caido") ng.comunidad = { ...ng.comunidad, [npc]: "inmune" }; }
};
// Elegimos el NPC del propio banco: así el LLM recibe una personalidad real y,
// si cae a offline, la situación siempre tiene una respuesta para ese personaje.
const npcDeSituaciones = (situaciones) => {
const pool = situaciones.flatMap((s) => BANCO_AGENTES[s] || []);
return pool.length ? pool[Math.floor(Math.random() * pool.length)].npc : null;
};
// Al fusionar clasificación y respuesta en UNA petición, el personaje se elige
// ANTES de saber la categoría: sale de quienes pueden hablar en esa parte.
const SITUACIONES_CHAT = ["user_corrige_bien", "user_corrige_mal", "user_comparte_fake"];
const SITUACIONES_COMENT = ["coment_en_fake", "coment_en_correccion"];
const MAPA_COMENT = {
sandwich: "coment_en_correccion", hechos_fuente: "coment_en_correccion", empatia: "coment_en_correccion",
repite_mito: "coment_en_fake", cae: "coment_en_fake", ataca_persona: "coment_en_fake",
solo_emocion: "coment_en_fake", neutral: "coment_en_fake",
};
// Mete la reacción donde toque (grupo o hilo del post) y aplica su efecto.
const escribirReaccion = (ng, reaccion, fuente, destino) => {
if (destino?.tipo === "coment") {
const casoId = destino.casoId;
ng.misComs = { ...ng.misComs, [casoId]: [...(ng.misComs[casoId] || []), { de: reaccion.npc, texto: reaccion.mensaje, ia: fuente === "llm" }] };
} else { // mensaje vivo del NPC al grupo de WhatsUp
ng.chat = [...ng.chat, { de: reaccion.npc, texto: { es: reaccion.mensaje, en: reaccion.mensaje }, propio: false, t: ng.tick, ia: fuente === "llm" }];
}
aplicarEfecto(ng, reaccion.npc, reaccion.efecto);
// guardamos los metadatos (para Radiografía / diagnóstico futuros)
ng.ultimaReaccion = { tipo: reaccion.tipo_firstdraft, motiv: reaccion.motivacion_8p, tec: reaccion.tecnica, mil: reaccion.mil, bando: reaccion.bando };
};
const reaccionAgente = async (situacion, opts = {}) => {
try {
const { reaccion, fuente, alerta } = await pedirReaccion({ situacion, npc: opts.npc, semilla: (opts.semilla || "") + situacion + Date.now(), textoUsuario: opts.textoUsuario, caso: opts.caso, historial: opts.historial, lang });
if (!reaccion) return;
setG((s) => {
let ng = { ...s };
escribirReaccion(ng, reaccion, fuente, opts.destino);
if (alerta) ng.alertaIA = alerta; // se muestra como banner temático
return ng;
});
// si ya estás leyendo el grupo, el mensaje no cuenta como "no leído"
if (opts.destino?.tipo !== "coment" && pantalla !== "whats") setNoLeidosW((n) => n + 1);
if (alerta) notificar("📡", alerta);
} catch (e) { /* nunca romper el juego por una reacción */ }
};
// --- FASE 4: loop de texto libre → clasificación → feedback de Beto ---
// Beto enseña y la comunidad se mueve (candado pedagógico). Lo comparten el
// chat del grupo y los comentarios del feed.
const aplicarFeedbackLibre = (ng, fb, categoria) => {
ng.coach = [...ng.coach, { de: "beto", txt: fb.txt }]; // Beto siempre enseña
if (fb.ok === true) { const sanar = CIVILES.filter((k) => ng.comunidad[k] === "dudoso" || ng.comunidad[k] === "sano").slice(0, fb.efecto === "inmune" ? 2 : 1); for (const k of sanar) ng.comunidad = { ...ng.comunidad, [k]: "inmune" }; ganarXp(ng, categoria === "sandwich" ? 15 : 10); ng.infodemia = clamp(ng.infodemia - 4, 0, 100); if (fb.mil) aprenderLeccion(ng, fb.mil === 7 ? "etica" : fb.mil === 8 ? "empodera" : fb.mil === 9 ? "paz" : "acceso"); }
else if (fb.ok === false) { ng.infodemia = clamp(ng.infodemia + (fb.efecto === "cae" ? 5 : 2), 0, 100); if (categoria === "repite_mito") ng.familiaridad = (ng.familiaridad || 0) + 2; }
ng.respuestasLibres = (ng.respuestasLibres || 0) + 1;
};
const responderLibre = async (texto) => {
const txt = (texto || "").trim();
if (!txt || escribiendoW) return;
// 1) el mensaje del usuario aparece en el chat
setG((s) => ({ ...s, chat: [...s.chat, { de: "tu", texto: { es: txt, en: txt }, propio: true, t: s.tick }] }));
const historial = [
...g.chat.slice(-6).map((m) => ({ de: m.propio ? "el jugador" : (NPCS[m.de]?.nombre[lang] || m.de), dice: txtMsg(m, lang) })),
{ de: "el jugador", dice: txt },
];
// 2) quién contesta se decide ANTES: su voz va en el prompt de la única llamada
const npc = npcDeSituaciones(SITUACIONES_CHAT);
setEscribiendoW(npc);
try {
// UNA sola petición: clasifica lo que hiciste Y te contesta en personaje
const { categoria, reaccion, fuente, alerta } = await reaccionarYClasificar({ npc, textoUsuario: txt, historial, lang, semilla: "libre" + Date.now() });
const fb = FEEDBACK_USUARIO[categoria] || FEEDBACK_USUARIO.neutral;
setG((s) => {
let ng = { ...s };
aplicarFeedbackLibre(ng, fb, categoria); // Beto enseña
if (reaccion) escribirReaccion(ng, reaccion, fuente); // y la familia contesta
if (alerta) ng.alertaIA = alerta;
return ng;
});
if (alerta) notificar("📡", alerta);
} finally { setEscribiendoW(null); }
};
// Comentar en un post del feed: mismo circuito pedagógico, pero el NPC te
// contesta dentro del hilo de ese post.
const comentarLibre = async (casoId, texto) => {
const txt = (texto || "").trim();
if (!txt || comentando) return;
const caso = CASOS.find((c) => c.id === casoId);
setG((s) => ({ ...s, misComs: { ...s.misComs, [casoId]: [...(s.misComs[casoId] || []), { de: "tu", texto: txt, propio: true }] } }));
setComentando(casoId);
try {
// el hilo del post: los comentarios que ya estaban + los tuyos
const historial = [
...(caso ? comentariosDe(caso, g, lang).map((cm) => ({ de: NPCS[cm.npc]?.nombre[lang] || cm.npc, dice: cm.texto })) : []),
...(g.misComs[casoId] || []).map((cm) => ({ de: cm.propio ? "el jugador" : (NPCS[cm.de]?.nombre[lang] || cm.de), dice: cm.texto })),
{ de: "el jugador", dice: txt },
];
// una sola petición, igual que en el chat, pero contesta en el hilo del post
const { categoria, reaccion, fuente, alerta } = await reaccionarYClasificar({
npc: npcDeSituaciones(SITUACIONES_COMENT), textoUsuario: txt, historial, lang, semilla: casoId + Date.now(),
caso: caso ? { titular: caso.titular[lang], fake: caso.fake } : null, mapa: MAPA_COMENT,
});
const fb = FEEDBACK_USUARIO[categoria] || FEEDBACK_USUARIO.neutral;
setG((s) => {
let ng = { ...s };
aplicarFeedbackLibre(ng, fb, categoria);
if (reaccion) escribirReaccion(ng, reaccion, fuente, { tipo: "coment", casoId });
if (alerta) ng.alertaIA = alerta;
return ng;
});
if (alerta) notificar("📡", alerta);
} finally { setComentando(null); }
};
const encolar = (ng, canal, m, delay, noti) => { ng.cola = [...ng.cola, { en: delay, canal, m, noti }]; };
const ganarXp = (ng, cant) => {
const antes = nivelDe(ng.xp);
ng.xp += cant;
const despues = nivelDe(ng.xp);
if (despues > antes) {
const r = RANGOS[despues - 1];
notificar("📓 " + t.notifNivel, r.emoji + " " + r.n[lang]);
encolar(ng, "dmBeto", { de: "beto", texto: { es: "¡Subiste a " + r.n.es + " " + r.emoji + "! Ya lo anoté en la bitácora. " + (despues === 2 ? "Desbloqueaste la búsqueda inversa 🖼️" : despues === 3 ? "Desbloqueaste mi detector de IA 🤖 — lo vas a necesitar…" : despues === 4 ? "Ya puedes reportar en manada 🫂" : despues === 5 ? "Leyenda MIL. Mi abuelo estaría orgulloso 🫡" : ""), en: "You reached " + r.n.en + " " + r.emoji + "! Logged it in the notebook. " + (despues === 2 ? "You unlocked reverse image search 🖼️" : despues === 3 ? "You unlocked my AI detector 🤖 — you will need it…" : despues === 4 ? "Pack reports unlocked 🫂" : despues === 5 ? "MIL Legend. My grandpa would be proud 🫡" : "") }, propio: false }, 3);
}
};
const aprenderLeccion = (ng, id) => {
if (!id || ng.lecciones.includes(id)) return;
ng.lecciones = [...ng.lecciones, id];
ng.xp += 5;
notificar("📓", t.notifLeccion + " · " + TACTICAS[id].emoji + " " + TACTICAS[id].nombre[lang]);
};
const primeraDecision = (ng, caso, tipo) => {
if (ng.resueltos[caso.id]?.primera) return;
const correcto = caso.fake ? tipo === "reportado" : tipo === "confiado" || tipo === "compartido";
ng.resueltos = { ...ng.resueltos, [caso.id]: { ...(ng.resueltos[caso.id] || { rechazos: 0 }), primera: tipo, correcto } };
};
const dispararCrisis = (ng, casoId) => {
if (!CRISIS[casoId] || ng.crisisHechas.includes(casoId) || ng.crisis) return;
ng.crisisHechas = [...ng.crisisHechas, casoId];
ng.crisis = { casoId, paso: 0, quedan: 40 };
const cr = CRISIS[casoId];
notificar("🚨 " + cr.nombre[lang], cr.alerta[lang]);
encolar(ng, "whats", { de: cr.panico.npc, texto: cr.panico.texto, propio: false }, 2, "WhatsUp");
encolar(ng, "whats", { de: "carmen", texto: { es: "¡¿Están viendo esto?! ¿Qué hacemos? 😱", en: "Are you seeing this?! What do we do? 😱" }, propio: false }, 5);
encolar(ng, "dmBeto", { de: "beto", texto: { es: "🚨 CRISIS. Respira. Es momento del protocolo ALTO — ábrelo desde mi mensaje. Paso por paso, como en la libreta.", en: "🚨 CRISIS. Breathe. Time for the ALTO protocol — open it from my message. Step by step, like in the notebook." }, propio: false, protocolo: true }, 4, "Instagrama · Beto");
notificar("☎️", t.notifLlamada);
};
const eliminarPost = (ng, caso, xpGanada) => {
ng.resueltos = { ...ng.resueltos, [caso.id]: { ...(ng.resueltos[caso.id] || { rechazos: 0 }), primera: ng.resueltos[caso.id]?.primera || "reportado", correcto: ng.resueltos[caso.id]?.correcto ?? true, sharesFinal: sharesDe(caso, ng), eliminado: true, revision: false } };
ng.cred = clamp(ng.cred - 8, 0, 100);
ng.infodemia = clamp(ng.infodemia - 5, 0, 100);
ng.strikes++;
if (xpGanada) ganarXp(ng, xpGanada);
aprenderLeccion(ng, caso.tacticaId);
notificar("Instagrama", t.repProcedio);
for (const tp of (caso.tipos || [])) { if (!ng.tiposVistos.includes(tp) && TIPO_EXPLICA[tp]) { ng.tiposVistos = [...ng.tiposVistos, tp]; coachSay(ng, "beto", TIPO_EXPLICA[tp], "tipo_" + tp); break; } }
setRadio(caso.id);
const duda = CIVILES.filter((k) => ng.comunidad[k] === "sano" && NPCS[k].credulidad > 0.6)[hash(caso.id, 5) % 4];
if (duda) { ng.comunidad = { ...ng.comunidad, [duda]: "dudoso" }; encolar(ng, "whats", { de: duda, texto: { es: "Oye, ya la borraron pero… ¿y si sí era cierto? Algo han de estar ocultando 🤔", en: "They deleted it but… what if it WAS true? They must be hiding something 🤔" }, propio: false, preguntaId: "d_" + caso.id }, 9); }
if ([3, 5, 7].includes(ng.strikes)) {
ng.investigaciones = Math.min(3, ng.investigaciones + 1);
ng.cred = clamp(ng.cred - 4, 0, 100);
encolar(ng, "dmBeto", { de: "beto", texto: LORE[ng.investigaciones - 1], propio: false }, 5, "Instagrama · Beto");
if (ng.strikes === 3) notificar("🎭", t.cuentaSusp);
}
if (ng.desbloqueado.whats) {
const fan = CIVILES.filter((k) => ng.comunidad[k] !== "caido")[hash(caso.id, 2) % 6];
if (fan) encolar(ng, "whats", { de: fan, texto: { es: "¿Vieron que lo de " + caso.img + " era FALSO? Alguien lo reportó a tiempo 🙌", en: "Did you see the " + caso.img + " thing was FAKE? Someone reported it in time 🙌" }, propio: false }, 6);
}
};
useEffect(() => {
const int = setInterval(() => {
setG((s) => {
if (s.fin) return s;
let ng = { ...s, tick: s.tick + 1 };
const nivel = nivelDe(ng.xp);
const listos = [];
ng.cola = ng.cola.map((e) => ({ ...e, en: e.en - 1 })).filter((e) => { if (e.en <= 0) { listos.push(e); return false; } return true; });
for (const e of listos) {
const m = { ...e.m, t: ng.tick };
if (e.canal === "whats") { ng.chat = [...ng.chat, m]; setNoLeidosW((n) => n + 1); if (m.preguntaId) ng.preguntas = [...ng.preguntas, { id: m.preguntaId, quien: m.de, estado: "pendiente", share: m.share }]; }
if (e.canal === "dmBeto") { ng.dmBeto = [...ng.dmBeto, m]; setNoLeidosDM((n) => n + 1); }
if (e.canal === "dmArq") { ng.dmArq = [...ng.dmArq, m]; setNoLeidosDM((n) => n + 1); }
if (e.noti) notificar(e.noti, txtMsg(m, lang));
}
const resueltosAhora = [];
ng.reportes = ng.reportes.map((r) => ({ ...r, en: r.en - 1 })).filter((r) => { if (r.en <= 0) { resueltosAhora.push(r); return false; } return true; });
for (const r of resueltosAhora) {
const caso = CASOS.find((c) => c.id === r.casoId);
const prev = ng.resueltos[caso.id] || { rechazos: 0 };
if (!caso.fake) {
ng.resueltos = { ...ng.resueltos, [caso.id]: { ...prev, revision: false } };
if (caso.satira) { notificar("Instagrama", t.satiraRep); aprenderLeccion(ng, "satira"); ng.infodemia = clamp(ng.infodemia + 1, 0, 100); }
else { ng.limitado = 30; ng.infodemia = clamp(ng.infodemia + 3, 0, 100); notificar("Instagrama", t.repLegit); notificar("Instagrama", t.limitada); }
} else if (caso.tipos.includes(r.razon)) {
eliminarPost(ng, caso, r.manada ? 30 : 25);
} else {
ng.resueltos = { ...ng.resueltos, [caso.id]: { ...prev, revision: false, rechazos: (prev.rechazos || 0) + 1 } };
notificar("Instagrama", t.repRechazado);
coachSay(ng, "beto", { es: "Ojo primo: rechazaron el reporte porque el TIPO no era ese. Abre la imagen 🔎, mira QUÉ está mal, y reintenta. Tú puedes 💪", en: "Heads up cousin: rejected because the TYPE was wrong. Open the image 🔎, see WHAT's wrong, and retry. You got this 💪" }, "rechazo1");
}
}
if (ng.limitado > 0) ng.limitado--;
if (ng.modoOscuro) {
ng.infodemia = clamp(ng.infodemia + 0.18 + ng.postsOscuros.length * 0.05, 0, 100);
if (ng.finSeq > 0) {
ng.finSeq--;
if (ng.finSeq === 9) { if (ng.traicion) encolar(ng, "dmBeto", { de: "beto", texto: { es: "LO TENEMOS TODO: clientes, bots, InverCoin. La policía cibernética ya tiene el expediente. Eres un loco… gracias, primo 🫡", en: "WE HAVE IT ALL: clients, bots, InverCoin. Cyber police already has the file. You are insane… thank you, cousin 🫡" }, propio: false }, 1, "Instagrama"); else encolar(ng, "whats", { de: "carmen", texto: { es: "Mijo… deposité para unos boletos que vi en una cuenta que tú seguías. No llegan… 😰", en: "Sweetie… I deposited for tickets I saw on an account you followed. They are not coming… 😰" }, propio: false }, 1, "WhatsUp"); }
if (ng.finSeq === 5) { if (ng.traicion) encolar(ng, "dmArq", { de: "arq", texto: { es: "¿QUÉ HICISTE? Años construyendo la red… Nos volveremos a ver. 🎭", en: "WHAT DID YOU DO? Years building the network… We will meet again. 🎭" }, propio: false }, 1); else encolar(ng, "dmArq", { de: "arq", texto: { es: "Gracias por todo. Ya no te necesito: filtré tu identidad. Los peones caen primero. 🎭", en: "Thanks for everything. I no longer need you: I leaked your identity. Pawns fall first. 🎭" }, propio: false }, 1, "Instagrama"); }
if (ng.finSeq <= 1) { ng.fin = true; ng.final = ng.traicion ? "dobleagente" : "complice"; }
}
return ng;
}
const vivos = ng.liberados.filter((id) => { const c = CASOS.find((x) => x.id === id); return c.fake && !ng.resueltos[id]?.eliminado; }).length;
for (const id of ng.liberados) { const c = CASOS.find((x) => x.id === id); if (c && c.fake && !ng.resueltos[id]?.eliminado && ng.tick - (ng.liberadosT[id] ?? 0) === 15) ng.familiaridad++; }
let crecimiento = 0.03 * (ng.cred / 100) + vivos * 0.035;
if (nivel >= 5) crecimiento *= 0.5; else if (nivel >= 3) crecimiento *= 0.75;
ng.infodemia = clamp(ng.infodemia + crecimiento, 0, 100);
if (ng.proximoEn > 0) {
ng.proximoEn--;
if (ng.proximoEn === 0 && ng.colaIdx < CASOS.length) {
const caso = CASOS[ng.colaIdx];
ng.liberados = [...ng.liberados, caso.id]; ng.liberadosT = { ...ng.liberadosT, [caso.id]: ng.tick }; ng.colaIdx++;
notificar("Instagrama", t.notifCaso);
if (caso.fake && Math.random() < 0.6) {
const cand = CIVILES.filter((k) => ng.comunidad[k] === "sano" && NPCS[k].credulidad > 0.55 && !ng.historias.some((h) => h.npc === k && !h.respondida && h.expiraEn > 0 && h.tipo === "riesgo"));
if (cand.length) {
const npc = cand[hash(caso.id, 1) % cand.length];
ng.historias = [...ng.historias, { id: "r_" + caso.id, npc, tipo: "riesgo", casoId: caso.id, emojis: caso.img + "😰", grad: "linear-gradient(180deg,#7f1d1d,#1c1917)", texto: { es: "¿Será cierto esto? 😰 Lo voy a reenviar por si acaso…", en: "Could this be true? 😰 I will forward it just in case…" }, vista: false, respondida: false, expiraEn: 30 }];
if (ng.desbloqueado.whats) notificar("Instagrama", NPCS[npc].nombre[lang] + " " + t.notifHistoria);
}
}
}
}
for (const cid of Object.keys(CRISIS)) {
if (ng.liberados.includes(cid) && !ng.resueltos[cid]?.eliminado && ng.tick - (ng.liberadosT[cid] ?? 0) >= 22) dispararCrisis(ng, cid);
}
if (ng.crisis) {
ng.crisis = { ...ng.crisis, quedan: ng.crisis.quedan - 1 };
ng.infodemia = clamp(ng.infodemia + 0.12, 0, 100);
if (ng.crisis.quedan <= 0) {
const caso = CASOS.find((x) => x.id === ng.crisis.casoId);
const cr = CRISIS[ng.crisis.casoId];
const cand = CIVILES.filter((k) => ng.comunidad[k] === "sano");
if (cand.length) { const npc = cand[hash(caso.id, 4) % cand.length]; ng.comunidad = { ...ng.comunidad, [npc]: "caido" }; encolar(ng, "whats", { de: npc, clave: "cayo", propio: false }, 3); }
ng.infodemia = clamp(ng.infodemia + 12, 0, 100);
ng.resueltos = { ...ng.resueltos, [caso.id]: { ...(ng.resueltos[caso.id] || { rechazos: 0 }), primera: ng.resueltos[caso.id]?.primera, correcto: ng.resueltos[caso.id]?.correcto, sharesFinal: sharesDe(caso, ng), eliminado: true } };
ng.cred = clamp(ng.cred - 3, 0, 100);
// ACTO 3 — consecuencia real: titular devastador + NPC afectado
if (cr?.cons) {
ng.consecuencia = { titular: cr.cons.titular, real: cr.cons.real };
ng.afectados = { ...ng.afectados, [cr.cons.afecta]: ng.crisis.casoId };
ng.noticiasExtra = [{ texto: cr.cons.titular, t: ng.tick, grave: true }, ...ng.noticiasExtra];
coachSay(ng, "beto", { es: "No lo detuvimos a tiempo, primo… y mira las consecuencias. Esto pasa DE VERDAD. Por eso importa. 💔", en: "We didn't stop it in time, cousin… look at the consequences. This happens FOR REAL. That's why it matters. 💔" }, "cons_" + ng.crisis.casoId);
}
ng.crisis = null; setProto(false);
notificar("💔", t.protoFallo);
}
}
ng.historias = ng.historias.map((h) => {
if (h.tipo !== "riesgo" || h.respondida || h.expiraEn <= 0) return h;
const nh = { ...h, expiraEn: h.expiraEn - 1 };
if (nh.expiraEn === 0) {
if (NPCS[h.npc].credulidad > 0.7 && ng.comunidad[h.npc] === "sano") { ng.comunidad = { ...ng.comunidad, [h.npc]: "caido" }; encolar(ng, "whats", { de: h.npc, clave: "cayo", propio: false }, 3); }
else if (ng.comunidad[h.npc] === "sano") ng.comunidad = { ...ng.comunidad, [h.npc]: "dudoso" };
ng.infodemia = clamp(ng.infodemia + 5, 0, 100);
}
return nh;
});
ng.histSpawn--;
if (ng.histSpawn <= 0) {
ng.histSpawn = 22;
const pool = HIST_AMB.filter((h) => !ng.historias.some((x) => x.id === h.id && !x.vista));
if (pool.length) ng.historias = [...ng.historias.filter((h) => h.tipo !== "amb" || !h.vista).slice(-6), { ...pool[ng.tick % pool.length], tipo: "amb", vista: false, respondida: false, expiraEn: 999 }];
}
for (const [k, u, quien] of [["u35", 35, "carmen"], ["u55", 55, "mama"], ["u75", 75, "lupe"]]) {
if (!ng.umbrales[k] && ng.infodemia >= u && ng.desbloqueado.whats) {
ng.umbrales = { ...ng.umbrales, [k]: true };
encolar(ng, "whats", { de: quien, clave: "cadena", propio: false }, 2);
encolar(ng, "whats", { de: quien, clave: "pregunta", propio: false, preguntaId: "q" + k }, 5, "WhatsUp · " + NPCS[quien].nombre[lang]);
}
}
for (const [k, u, txt] of [
["h75", 75, { es: "¡Le estás pegando! 📉 Cada cuenta que tumbas le duele. Sigue.", en: "You are landing hits! 📉 Every account you take down hurts him. Keep going." }],
["h50", 50, { es: "¡MITAD DE CAMINO! 🔥 La red se está quedando sin caras.", en: "HALFWAY! 🔥 The network is running out of faces." }],
["h25", 25, { es: "Está acorralado 😤 Un empujón más. Por el abuelo.", en: "He is cornered 😤 One more push. For grandpa." }],
]) {
if (!ng.hypes[k] && ng.cred <= u) { ng.hypes = { ...ng.hypes, [k]: true }; encolar(ng, "dmBeto", { de: "beto", texto: txt, propio: false }, 3); }
}
if (ng.cred <= 70 && ng.ofertas.o1 === null) { ng.ofertas = { ...ng.ofertas, o1: "pendiente" }; encolar(ng, "dmArq", { de: "arq", clave: "oferta1", propio: false, ofertaId: "o1" }, 6, "Instagrama · " + NPCS.arq.nombre[lang]); }
if (ng.cred <= 45 && ng.ofertas.o2 === null) { ng.ofertas = { ...ng.ofertas, o2: "pendiente" }; encolar(ng, "dmArq", { de: "arq", clave: "oferta2", propio: false, ofertaId: "o2" }, 6, "Instagrama · " + NPCS.arq.nombre[lang]); }
if (ng.tick % 15 === 0 && ng.desbloqueado.news) {
const r = rumbo(ng);
const pool = BANCO[r];
const etapa = 0;
const key = r + etapa;
if (!ng.noticiasKeys.includes(key) && pool[etapa]) { ng.noticiasKeys = [...ng.noticiasKeys, key]; ng.noticiasExtra = [{ texto: pool[etapa], t: ng.tick }, ...ng.noticiasExtra]; }
}
if (ng.cred <= 0) {
ng.fin = true;
const dec = Object.values(ng.resueltos).filter((r) => r.primera);
const prec = dec.length ? dec.filter((r) => r.correcto).length / dec.length : 0;
const caidos = Object.values(ng.comunidad).filter((e) => e === "caido").length;
ng.final = prec >= 0.85 && caidos === 0 ? "legendario" : prec >= 0.6 ? "cicatrices" : "pirrica";
} else if (ng.infodemia >= 100) { ng.fin = true; ng.final = "indiferencia"; }
return ng;
});
}, 700);
return () => clearInterval(int);
}, [lang]);
useEffect(() => { if (g.fin && g.final && !finalesVistos.includes(g.final)) setFinalesVistos((f) => [...f, g.final]); }, [g.fin, g.final]);
const reportarCaso = (casoId, razon, manada) => {
setG((s) => {
const caso = CASOS.find((c) => c.id === casoId);
let ng = { ...s };
if (razon === "__contra__") { // contra-discurso: desescala sin insultar
const nuevoC = !ng.resueltos[casoId]?.primera;
primeraDecision(ng, caso, "reportado");
eliminarPost(ng, caso, 35);
aprenderLeccion(ng, "odio");
ng.infodemia = clamp(ng.infodemia - 6, 0, 100);
if (nuevoC && ng.proximoEn === 0 && ng.colaIdx < CASOS.length) ng.proximoEn = 4;
coachSay(ng, "beto", { es: "🕊️ Eso es contra-discurso, primo: bajaste el tono sin rebajarte. Reportar calla la cuenta; responder bien cambia a quien LEE. Las dos cosas suman.", en: "🕊️ That's counter-speech, cousin: you lowered the tone without stooping. Reporting mutes the account; a good reply changes the READERS. Both count." }, "contra1");
setSheet(null);
return ng;
}
const nuevo = !ng.resueltos[casoId]?.primera;
primeraDecision(ng, caso, "reportado");
ng.resueltos = { ...ng.resueltos, [casoId]: { ...(ng.resueltos[casoId] || { rechazos: 0 }), primera: ng.resueltos[casoId]?.primera || "reportado", correcto: ng.resueltos[casoId]?.correcto ?? caso.fake, revision: true } };
ng.reportes = [...ng.reportes, { casoId, razon, manada, en: manada ? 3 : ng.limitado > 0 ? 12 : 7 }];
if (nuevo && ng.proximoEn === 0 && ng.colaIdx < CASOS.length) ng.proximoEn = 4;
notificar("Instagrama", t.repEnviado);
if (manada && caso.fake) { ng.infodemia = clamp(ng.infodemia - 2, 0, 100); encolar(ng, "whats", { de: "profe", texto: { es: "Reportado desde mi cuenta y la de mis alumnos ✊", en: "Reported from my account and my students' ✊" }, propio: false }, 3); }
return ng;
});
setSheet(null);
};
const darLike = (casoId) => {
setG((s) => {
const caso = CASOS.find((c) => c.id === casoId);
let ng = { ...s };
const yaLike = ng.likes.includes(casoId);
ng.likes = yaLike ? ng.likes.filter((x) => x !== casoId) : [...ng.likes, casoId];
if (yaLike) return ng; // quitar like no penaliza ni enseña
const nuevo = !ng.resueltos[casoId]?.primera;
if (!caso.fake) { // dar like a algo legítimo/ético = apoyar el buen contenido (Misión 8)
if (nuevo) { primeraDecision(ng, caso, "confiado"); ng.resueltos = { ...ng.resueltos, [casoId]: { ...(ng.resueltos[casoId] || { rechazos: 0 }), primera: "confiado", correcto: true } }; ganarXp(ng, 8); ng.infodemia = clamp(ng.infodemia - 2, 0, 100); if (NPCS[caso.autorId]?.rol === "oficial" || caso.accesoCaso) aprenderLeccion(ng, "acceso"); if (nuevo && ng.proximoEn === 0 && ng.colaIdx < CASOS.length) ng.proximoEn = 4; }
} else { // like a un fake = amplificarlo sin querer
ng.infodemia = clamp(ng.infodemia + 3, 0, 100);
coachSay(ng, "beto", { es: "Cuidado primo 👀 le diste ❤️ a algo sin verificar — eso lo empuja MÁS en el feed. El corazón también amplifica. Verifica antes de reaccionar.", en: "Careful cousin 👀 you ❤️'d something unverified — that pushes it MORE in the feed. The heart amplifies too. Verify before you react." }, "likefake");
}
return ng;
});
};
const armarTexto = (seq, caso, lang) => seq.map((id) => {
const b = BLOQUES.find((x) => x.id === id);
let f = b.frag[lang];
if (b.usaVerdad && caso.imagenRes?.txt) f += " " + caso.imagenRes.txt[lang];
return f;
}).join(" ");
const explicarContra = (res, lang) => {
const L = { es: {}, en: {} };
const partes = [];
const p = (es, en) => partes.push(lang === "es" ? es : en);
if (res.sandwich) p("🥪 ¡Sándwich de la verdad perfecto! Empezaste con el hecho, explicaste la trampa y cerraste reforzando la verdad. Justo como el manual del desmentido. La comunidad confía.", "🥪 Perfect truth sandwich! You opened with the fact, explained the trick, and closed reinforcing the truth. Exactly like the debunking handbook. The community trusts it.");
else {
if (res.notas.find((n) => n.k === "gritaMito")) p("🔁 Repetiste el mito EN GRANDE — eso lo vuelve más familiar, y lo familiar se siente verdadero (ilusión de verdad). Contraproducente.", "🔁 You repeated the myth IN CAPS — that makes it more familiar, and the familiar feels true (illusory truth). It backfires.");
if (res.notas.find((n) => n.k === "burla")) p("😡 Te burlaste de quien lo creyó: eso lo pone a la defensiva y se aferra MÁS al error (efecto tiro por la culata).", "😡 You mocked whoever believed it: that makes them defensive and cling HARDER to the error (backfire effect).");
if (res.notas.find((n) => n.k === "noEmpiezaHecho")) p("Recuerda: empieza SIEMPRE con el hecho, no con el mito. Lo primero que se lee es lo que se queda.", "Remember: ALWAYS start with the fact, not the myth. What's read first is what sticks.");
if (res.tier === "buena") p("✅ Buena corrección: sólida y con fuente. Para que sea perfecta, ciérrala reforzando el hecho.", "✅ Good correction: solid and sourced. To make it perfect, close by reinforcing the fact.");
}
return { es: partes.join(" "), en: partes.join(" ") };
};
const contraPublicar = (casoId, seq) => {
setG((s) => {
const caso = CASOS.find((c) => c.id === casoId);
let ng = { ...s };
if (!seq?.length || ng.contra[casoId]) return ng;
const res = puntuarContra(seq);
const efectiva = res.tier === "excelente" || res.tier === "buena";
ng.contra = { ...ng.contra, [casoId]: efectiva ? "bien" : "mal" };
ng.misPosts = [...ng.misPosts, { casoId, tier: res.tier, efectiva, t: ng.tick, texto: { es: armarTexto(seq, caso, "es"), en: armarTexto(seq, caso, "en") } }];
const why = explicarContra(res, "es"); const whyEn = explicarContra(res, "en");
if (efectiva) {
ganarXp(ng, res.tier === "excelente" ? 30 : 18);
ng.infodemia = clamp(ng.infodemia - (res.tier === "excelente" ? 12 : 7), 0, 100);
aprenderLeccion(ng, "etica"); // Misión 7
const nApoyo = res.tier === "excelente" ? 3 : 2;
const apoyo = CIVILES.filter((k) => ng.comunidad[k] === "sano" || ng.comunidad[k] === "dudoso").slice(0, nApoyo);
for (const k of apoyo) ng.comunidad = { ...ng.comunidad, [k]: "inmune" };
ng.apoyos = (ng.apoyos || 0) + 1;
if (ng.apoyos >= 2) aprenderLeccion(ng, "empodera"); // Misión 8
encolar(ng, "whats", { de: apoyo[0] || "raul", texto: { es: "¡Vi tu corrección y la compartí! Por fin algo bien explicado 🙌", en: "Saw your correction and shared it! Finally something well explained 🙌" }, propio: false }, 4, "WhatsUp");
coachSay(ng, "beto", { es: why.es, en: whyEn.es }, "contra_ok_" + casoId);
notificar("✨", t.contraOk);
} else {
ng.infodemia = clamp(ng.infodemia + (res.tier === "contra" ? 8 : 2), 0, 100);
if (res.notas.find((n) => n.k === "gritaMito")) ng.familiaridad = (ng.familiaridad || 0) + 2;
coachSay(ng, "beto", { es: why.es || "Le faltó estructura. Empieza con el hecho, explica la trampa y cierra con la verdad.", en: whyEn.es || "It lacked structure. Start with the fact, explain the trick, close with the truth." }, "contra_mal_" + casoId);
notificar("⚠️", t.contraMal);
}
return ng;
});
setSheet(null);
// FASE 3: los NPCs reaccionan EN VIVO a tu corrección
const buena = puntuarContra(seq).tier;
const efectiva = buena === "excelente" || buena === "buena";
reaccionAgente(efectiva ? "user_corrige_bien" : "user_corrige_mal", { semilla: casoId });
};
const compartirCaso = (casoId) => {
setG((s) => {
const caso = CASOS.find((c) => c.id === casoId);
let ng = { ...s };
const nuevo = !ng.resueltos[casoId]?.primera;
primeraDecision(ng, caso, "compartido");
ng.resueltos = { ...ng.resueltos, [casoId]: { ...(ng.resueltos[casoId] || { rechazos: 0 }), primera: ng.resueltos[casoId]?.primera || "compartido", correcto: ng.resueltos[casoId]?.correcto ?? !caso.fake, compartido: true } };
if (nuevo && ng.proximoEn === 0 && ng.colaIdx < CASOS.length) ng.proximoEn = 4;
if (caso.fake) {
ng.infodemia = clamp(ng.infodemia + 15, 0, 100);
coachSay(ng, "beto", { es: "¡Nooo primo, la COMPARTISTE! 😱 Así se riega esto. Mira lo que pasó en la familia… y cómo sube el caos. Aprende a cacharlas ANTES de reenviar.", en: "Noo cousin, you SHARED it! 😱 That's how this spreads. Look what happened in the family… and how the chaos rises. Learn to catch them BEFORE forwarding." }, "sharefake");
if (ng.comunidad.carmen !== "caido") { ng.comunidad = { ...ng.comunidad, carmen: "caido" }; encolar(ng, "whats", { de: "carmen", clave: "cayo", propio: false }, 4, "WhatsUp"); }
encolar(ng, "whats", { de: "mama", clave: "preguntaShare", propio: false, preguntaId: "qs_" + casoId, share: true }, 7, "WhatsUp · " + NPCS.mama.nombre[lang]);
notificar("💔", t.caidaShare);
dispararCrisis(ng, casoId);
} else { ganarXp(ng, 12); ng.infodemia = clamp(ng.infodemia - 3, 0, 100); if (caso.accesoCaso) { aprenderLeccion(ng, "empodera"); ng.infodemia = clamp(ng.infodemia - 5, 0, 100); const sanar = CIVILES.filter((k) => ng.comunidad[k] === "dudoso" || ng.comunidad[k] === "sano").slice(0, 2); for (const k of sanar) ng.comunidad = { ...ng.comunidad, [k]: "inmune" }; coachSay(ng, "beto", { es: "¡Eso, primo! Empujaste lo verdadero. Acabas de inmunizar a varios de la banda. Eso es empoderar: no solo defender, construir. 🌌", en: "Yes, cousin! You pushed the truth. You just immunized several of the crew. That's empowerment: not just defending, building. 🌌" }, "empodera1"); } }
return ng;
});
setSheet(null);
// FASE 3: al compartir un fake, la familia reacciona en vivo
const cf = CASOS.find((c) => c.id === casoId);
if (cf?.fake) reaccionAgente("user_comparte_fake", { semilla: casoId });
};
const reenviarBeto = (casoId) => {
setG((s) => {
if (s.reenviados.includes(casoId)) return s;
const caso = CASOS.find((c) => c.id === casoId);
let ng = { ...s, reenviados: [...s.reenviados, casoId] };
ng.dmBeto = [...ng.dmBeto, { de: "tu", texto: { es: "📎 [reenviaste la publicación de @" + NPCS[caso.autorId].handle + " " + caso.img + "] — ¿tú qué ves?", en: "📎 [you forwarded @" + NPCS[caso.autorId].handle + "'s post " + caso.img + "] — what do you see?" }, propio: true, t: s.tick }];
encolar(ng, "dmBeto", { de: "beto", texto: caso.betoTip, propio: false }, 4);
aprenderLeccion(ng, "etica");
return ng;
});
setSheet(null);
setPantalla("insta"); setVistaInsta("dmBeto"); setNoLeidosDM(0);
};
const pasoProtocolo = () => {
setG((s) => {
if (!s.crisis) return s;
let ng = { ...s, crisis: { ...s.crisis, paso: s.crisis.paso + 1 } };
ganarXp(ng, 10);
if (ng.crisis.paso >= 4) {
const caso = CASOS.find((c) => c.id === ng.crisis.casoId);
primeraDecision(ng, caso, "reportado");
eliminarPost(ng, caso, 40);
ng.infodemia = clamp(ng.infodemia - 12, 0, 100);
ng.cred = clamp(ng.cred - 2, 0, 100);
aprenderLeccion(ng, "alto");
ng.crisis = null;
encolar(ng, "whats", { de: "tu", texto: { es: "*publicaste la corrección con pruebas: fuente oficial + análisis* ✅", en: "*you posted the correction with proof: official source + analysis* ✅" }, propio: true }, 1);
encolar(ng, "whats", { de: "padre", texto: { es: "Lo reenvié a mis 800 contactos. Se acabó el pánico 🙏", en: "Forwarded it to my 800 contacts. The panic is over 🙏" }, propio: false }, 4);
setTimeout(() => setProto(false), 1200);
}
return ng;
});
};
const responderPregunta = (qid, accion) => {
setG((s) => {
let ng = { ...s };
const q = ng.preguntas.find((x) => x.id === qid);
if (!q || q.estado !== "pendiente") return s;
ng.preguntas = ng.preguntas.map((x) => (x.id === qid ? { ...x, estado: accion } : x));
if (accion === "explicar") {
ganarXp(ng, 10); ng.infodemia = clamp(ng.infodemia - (q.share ? 5 : 7), 0, 100);
ng.chat = [...ng.chat, { de: "tu", clave: q.share ? "corregiste" : "explicaste", propio: true, t: ng.tick }];
encolar(ng, "whats", { de: q.quien, clave: "alivio", propio: false }, 3);
if (ng.comunidad[q.quien] && ng.comunidad[q.quien] !== "caido") ng.comunidad = { ...ng.comunidad, [q.quien]: "inmune" };
const inmunes = Object.values(ng.comunidad).filter((e) => e === "inmune").length;
if (inmunes >= 3) aprenderLeccion(ng, "paz");
} else {
ng.infodemia = clamp(ng.infodemia + 7, 0, 100);
if (ng.comunidad[q.quien] === "sano") { ng.comunidad = { ...ng.comunidad, [q.quien]: "caido" }; encolar(ng, "whats", { de: q.quien, clave: "cayo", propio: false }, 3); }
}
return ng;
});
};
const responderHistoria = (hid) => {
setG((s) => {
const h = s.historias.find((x) => x.id === hid);
if (!h || h.tipo !== "riesgo" || h.respondida || h.expiraEn <= 0) return s;
let ng = { ...s, historias: s.historias.map((x) => (x.id === hid ? { ...x, respondida: true, vista: true } : x)) };
ganarXp(ng, 15); ng.infodemia = clamp(ng.infodemia - 4, 0, 100);
ng.comunidad = { ...ng.comunidad, [h.npc]: "inmune" };
encolar(ng, "whats", { de: h.npc, clave: "histSalvada", propio: false }, 3);
return ng;
});
setHistoria(null);
};
const responderOferta = (oid, acepta) => {
setG((s) => {
let ng = { ...s };
if (ng.ofertas[oid] !== "pendiente") return s;
if (acepta) {
ng.ofertas = { ...ng.ofertas, o1: "aceptada", o2: "aceptada" }; ng.modoOscuro = true; ng.koin = 100;
ng.dmArq = [...ng.dmArq, { de: "tu", clave: "aceptaste", propio: true, t: ng.tick }];
encolar(ng, "dmArq", { de: "arq", texto: { es: "Bienvenido al otro lado. Te instalé una herramienta: SPECTRA 🕸️. Ábrela. Ahí te llegan los encargos… y los pagos.", en: "Welcome to the other side. I installed a tool for you: SPECTRA 🕸️. Open it. That is where the jobs arrive… and the payments." }, propio: false }, 2, "🕸️ SPECTRA");
encolar(ng, "dmBeto", { de: "beto", texto: { es: "Primo… ¿por qué ya no aparece la bitácora en tu teléfono? Dime que no es lo que estoy pensando.", en: "Cousin… why is the notebook gone from your phone? Tell me it is not what I am thinking." }, propio: false }, 8);
notificar("🕸️", t.spInstalada); notificar("📓", t.spBitaFuera);
coachSay(ng, "arq", { es: "Bienvenido, aprendiz. Aquí NO improvisamos: cada campaña embona 4 piezas — audiencia + tipo de engaño + técnica emocional + amplificación. Te enseñaré a manipular… y verás lo que provoca. 🎭", en: "Welcome, apprentice. Here we do NOT improvise: every campaign fits 4 pieces — audience + deception type + emotional technique + amplification. I'll teach you to manipulate… and you'll see what it causes. 🎭" }, "arq_intro");
} else {
ng.ofertas = { ...ng.ofertas, [oid]: "rechazada" }; ganarXp(ng, 20); ng.cred = clamp(ng.cred - 5, 0, 100);
ng.dmArq = [...ng.dmArq, { de: "tu", clave: "rechazaste", propio: true, t: ng.tick }];
encolar(ng, "dmBeto", { de: "beto", texto: { es: "¿Te intentó comprar y le dijiste que NO?? Mi abuelo te va a hacer un altar 🫡", en: "He tried to buy you and you said NO?? My grandpa is going to build you an altar 🫡" }, propio: false }, 4);
}
return ng;
});
};
const selMision = (campo, idx) => setG((s) => ({ ...s, misionSel: { ...s.misionSel, [campo]: idx } }));
const publicarMision = () => {
setG((s) => {
const m = MISIONES[s.misionIdx];
if (!m) return s;
const sel = s.misionSel;
if (sel.aud == null || sel.tipo == null || sel.tec == null || sel.amp == null) return s;
const costo = m.amp[sel.amp].c;
if (s.koin < costo) return s;
let ng = { ...s, koin: s.koin - costo, misionSel: {} };
const pts = m.aud[sel.aud].p + m.tipo[sel.tipo].p + m.tec[sel.tec].p + m.amp[sel.amp].p;
const tier = pts >= 10 ? "exito" : pts >= 7 ? "medio" : "fallo";
ng.ultimoRes = { tier, pts, mid: m.id };
if (tier !== "fallo") {
ng.koin += tier === "exito" ? m.pago : Math.floor(m.pago / 2);
ng.infodemia = clamp(ng.infodemia + (tier === "exito" ? 12 : 6), 0, 100);
ng.postsOscuros = [...ng.postsOscuros, { id: m.id, titular: m.titular, t: ng.tick }];
if (m.cae && ng.comunidad[m.cae] !== "caido") { ng.comunidad = { ...ng.comunidad, [m.cae]: "caido" }; }
encolar(ng, "whats", { de: m.cons.npc, texto: m.cons.texto, propio: false }, 6, "WhatsUp");
if (tier === "exito" && m.dano) { ng.consecuencia = { titular: m.dano.titular, real: m.dano.real }; ng.afectados = { ...ng.afectados, [m.cons.npc]: m.id }; }
encolar(ng, "dmArq", { de: "arq", texto: tier === "exito" ? { es: "Impecable. El cliente está feliz. ⧫" + m.pago + " depositados. ¿Ves el daño? A nosotros nos paga. 🎭", en: "Flawless. The client is happy. ⧫" + m.pago + " deposited. See the damage? It pays US. 🎭" } : { es: "Mediocre. Medio pago. La próxima elige mejor tus armas.", en: "Mediocre. Half pay. Choose your weapons better next time." }, propio: false }, 3);
} else {
ng.infodemia = clamp(ng.infodemia + 2, 0, 100);
encolar(ng, "dmArq", { de: "arq", texto: { es: "REPORTADA en horas. Demasiado obvio: audiencia, tipo y técnica deben EMBONAR. No me hagas perder dinero. 🎭", en: "REPORTED within hours. Too obvious: audience, type and technique must FIT. Do not make me lose money. 🎭" }, propio: false }, 3, "🕸️ SPECTRA");
}
ng.misionIdx = s.misionIdx + 1;
if (ng.misionIdx === 3) encolar(ng, "dmBeto", { de: "beto", texto: { es: "Sé lo que estás haciendo, primo. Reconozco el estilo… te lo enseñé yo. Si queda algo de ti ahí adentro: junta evidencia. SPECTRA lo registra TODO.", en: "I know what you are doing, cousin. I recognize the style… I taught it to you. If any of you is left in there: gather evidence. SPECTRA logs EVERYTHING." }, propio: false }, 8, "Instagrama · Beto");
if (ng.misionIdx >= MISIONES.length) { ng.finSeq = 12; notificar("🕸️", t.spFin); }
return ng;
});
};
const traicionar = () => {
setG((s) => {
if (s.traicion || s.misionIdx < 3) return s;
let ng = { ...s, traicion: true, finSeq: 12 };
ng.dmBeto = [...ng.dmBeto, { de: "tu", texto: { es: "📎 [enviaste el registro completo de SPECTRA: clientes, pagos, bots, InverCoin]", en: "📎 [you sent SPECTRA's full log: clients, payments, bots, InverCoin]" }, propio: true, t: ng.tick }];
return ng;
});
};
const reiniciar = () => {
setG(estadoInicial()); setPantalla("home"); setVistaInsta("feed"); setTutoPaso(0); setTutoOn(true);
setSheet(null); setPerfil(null); setHistoria(null); setProto(false); setNoLeidosW(0); setNoLeidosDM(1);
};
// avanzar tutorial según acciones reales del jugador (tolerante al orden)
const pasoT = TUTO[tutoPaso];
const idxDe = (id) => TUTO.findIndex((p) => p.id === id);
const saltarA = (id) => setTutoPaso((p) => Math.max(p, idxDe(id) + 1)); // nunca retrocede
useEffect(() => { // abrir Instagrama satisface irInsta (y todo lo previo)
if (tutoOn && pantalla === "insta" && idxDe("irInsta") >= tutoPaso) saltarA("irInsta");
}, [pantalla]);
useEffect(() => { // abrir cualquier hoja avanza al paso correspondiente, saltando intermedios
if (!tutoOn || !sheet) return;
if (sheet.tipo === "imagen") saltarA("verImg");
if (sheet.tipo === "menu") saltarA("abrirMenu");
if (sheet.tipo === "razones") saltarA("reportar");
}, [sheet]);
useEffect(() => { if (tutoOn && perfil) saltarA("verAutor"); }, [perfil]);
useEffect(() => { // resolver el primer caso cierra el tutorial de inmediato
if (tutoOn && g.resueltos.c1?.primera && !g.modoOscuro) setTutoOn(false);
}, [g.resueltos]);
const avanzarTuto = () => setTutoPaso((p) => p + 1);
const saltarTuto = () => { setTutoOn(false); setTutoPaso(TUTO.length); };
useEffect(() => {
const num = Object.values(g.resueltos).filter((r) => r.primera).length;
setG((s) => {
if (num >= 2 && !s.desbloqueado.bitacora) {
let ng = { ...s, desbloqueado: { ...s.desbloqueado, bitacora: true } };
encolar(ng, "dmBeto", { de: "beto", clave: "betoBita", propio: false }, 3);
notificar("📓", t.notifBita);
return ng;
}
if (num >= 4 && !s.desbloqueado.news) return { ...s, desbloqueado: { ...s.desbloqueado, news: true } };
return s;
});
}, [g.resueltos]);
const nivel = nivelDe(g.xp);
const histActual = historia ? g.historias.find((h) => h.id === historia) : null;
const escribiendoEn = (canal) => { const e = g.cola.find((x) => x.canal === canal && x.en <= 4 && !x.m.propio); return e ? e.m.de : null; };
const bateria = Math.max(12, 100 - Math.floor(g.tick / 9));
return (
<div className="w-full min-h-screen flex items-center justify-center" style={{ background: "#0b0d12", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
<style>{`@keyframes haloP { 0%,100% { box-shadow: 0 0 0 4px #059669, 0 0 22px 6px rgba(5,150,105,.85); } 50% { box-shadow: 0 0 0 6px #10b981, 0 0 34px 12px rgba(16,185,129,.55); } } @keyframes pulso { 0%,100% { opacity: 1; } 50% { opacity: .3; } } @keyframes subeB { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
<div className="relative overflow-hidden flex flex-col" style={{ width: "min(392px, 100vw)", height: "min(100dvh, 852px)", background: "#000", borderRadius: 36, boxShadow: g.crisis ? "0 0 0 10px #450a0a, 0 0 40px rgba(220,38,38,.55), 0 30px 80px rgba(0,0,0,.8)" : "0 0 0 10px #17181c, 0 30px 80px rgba(0,0,0,.8)", transition: "box-shadow 1s" }}>
<div className="flex justify-between items-center px-6 pt-2 pb-1 text-xs font-semibold" style={{ color: pantalla === "insta" ? "#111" : "#fff", background: fondoBarra(pantalla), zIndex: 20 }}>
<span>{hora(g.tick)}</span>
<span className="flex items-center gap-1.5">
<span className="tracking-widest">{puente.online ? "▂▄▆ 5G" : "▂▁▁ ✕"}</span>
<span title={puente.online ? "IA en vivo" : "modo offline"} style={{ fontSize: 10 }}>{puente.online ? "🟢" : "📴"}</span>
{g.modoOscuro && <span style={{ color: "#fbbf24", fontWeight: 800 }}>⧫{g.koin}</span>}
<span style={{ color: bateria < 25 ? "#f87171" : "inherit" }}>🔋{bateria}%</span>
</span>
</div>
<div className="absolute left-3 right-3 space-y-1.5" style={{ top: 34, zIndex: 60 }}>
{banners.map((b) => (
<button key={b.id} onClick={() => setBanners((x) => x.filter((y) => y.id !== b.id))} className="w-full rounded-2xl px-4 py-3 text-left" style={{ background: "rgba(30,32,38,.96)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.08)" }}>
<div className="text-xs font-bold text-white">{b.titulo}</div>
<div className="text-xs text-gray-300" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.texto}</div>
</button>
))}
</div>
<div className="flex-1 overflow-hidden relative">
{pantalla === "lock" && <Lock t={t} lang={lang} setLang={setLang} onStart={() => { setPantalla("whats"); setNoLeidosW(0); }} />}
{pantalla === "home" && <Home t={t} lang={lang} setLang={setLang} g={g} nivel={nivel} noLeidosW={noLeidosW} noLeidosDM={noLeidosDM} tutoTarget={tutoOn ? pasoT?.target : null} abrir={(app) => {
if (app === "whats") { if (!g.desbloqueado.whats) return notificar("🔒", t.bloqueada); setPantalla("whats"); setNoLeidosW(0); }
else if (app === "spectra") setPantalla("spectra");
else if (app === "bitacora" || app === "news") { if (!g.desbloqueado[app === "bitacora" ? "bitacora" : "news"]) return notificar("🔒", t.bloqueada); setPantalla(app); }
else setPantalla(app);
}} />}
{pantalla === "insta" && <Instagrama t={t} lang={lang} g={g} nivel={nivel} vista={vistaInsta} setVista={setVistaInsta} noLeidosDM={noLeidosDM} setNoLeidosDM={setNoLeidosDM} setSheet={setSheet} verPerfil={setPerfil} verHistoria={(hid) => { setHistoria(hid); setG((s) => ({ ...s, historias: s.historias.map((h) => (h.id === hid ? { ...h, vista: true } : h)) })); }} escribiendo={escribiendoEn} responderOferta={responderOferta} abrirProto={() => setProto(true)} tutoTarget={tutoOn ? pasoT?.target : null} darLike={darLike} contraPublicar={contraPublicar} comentar={comentarLibre} comentando={comentando} />}
{pantalla === "whats" && <WhatsUp t={t} lang={lang} g={g} responder={responderPregunta} verPerfil={setPerfil} escribiendo={escribiendoEn("whats") || escribiendoW} responderLibre={responderLibre} />}
{pantalla === "bitacora" && !g.modoOscuro && <Bitacora t={t} lang={lang} g={g} nivel={nivel} />}
{pantalla === "spectra" && g.modoOscuro && <Spectra t={t} lang={lang} g={g} elegir={selMision} publicar={publicarMision} traicionar={traicionar} />}
{pantalla === "news" && <Noticias t={t} lang={lang} g={g} />}
{sheet && <Sheets t={t} lang={lang} g={g} nivel={nivel} sheet={sheet} setSheet={setSheet} reportar={reportarCaso} compartir={compartirCaso} reenviar={reenviarBeto} contraPublicar={contraPublicar} />}
{histActual && <VisorHistoria t={t} lang={lang} h={histActual} cerrar={() => setHistoria(null)} responder={responderHistoria} />}
{perfil && <PerfilMini t={t} lang={lang} npcId={perfil} g={g} cerrar={() => setPerfil(null)} />}
{radio && <Radiografia t={t} lang={lang} casoId={radio} cerrar={() => setRadio(null)} />}
{proto && g.crisis && <Protocolo t={t} lang={lang} g={g} paso={pasoProtocolo} cerrar={() => setProto(false)} />}
{g.fin && g.final && <Final t={t} lang={lang} g={g} finalesVistos={finalesVistos} reiniciar={reiniciar} />}
{tutoOn && pasoT && pantalla !== "lock" && !g.fin && <TutoBurbuja t={t} lang={lang} paso={pasoT} avanzar={avanzarTuto} saltar={saltarTuto} idx={tutoPaso} total={TUTO.length} />}
{(!tutoOn || !pasoT) && g.coach.length > 0 && pantalla !== "lock" && !g.fin && <CoachBurbuja t={t} lang={lang} msg={g.coach[0]} cerrar={cerrarCoach} />}
{g.consecuencia && <Consecuencia t={t} lang={lang} cons={g.consecuencia} cerrar={() => setG((s) => ({ ...s, consecuencia: null }))} />}
</div>
{pantalla !== "lock" && (() => {
// ¿la acción crítica está en OTRA app? (crisis activa en Instagrama, o caso sin resolver)
const accionEnInsta = (g.crisis || g.liberados.some((id) => { const c = CASOS.find((x) => x.id === id); return c && c.fake && !g.resueltos[id]?.eliminado && !g.resueltos[id]?.primera; })) && pantalla !== "insta";
const oscuro = ["insta", "news", "whats"].includes(pantalla) === false;
const claro = pantalla === "insta" || pantalla === "bitacora";
const col = claro ? "#111" : "#fff";
const glow = { boxShadow: "0 0 0 2px #059669, 0 0 16px 4px rgba(5,150,105,.9)", animation: "haloP 1s infinite" };
return (
<div className="flex justify-around items-center py-2.5" style={{ background: fondoBarra(pantalla), borderTop: "1px solid rgba(128,128,128,.15)" }}>
<button onClick={() => setPantalla("home")} aria-label="Back" className="px-6 py-1 rounded-lg" style={{ color: col, fontSize: 18, opacity: pantalla === "home" ? .35 : 1 }}>◁</button>
<button onClick={() => setPantalla("home")} aria-label="Home" className="px-6 py-1 rounded-full" style={{ color: col, fontSize: 20, ...(accionEnInsta ? glow : {}) }}>○</button>
<button aria-label="Recent" className="px-6 py-1" style={{ color: col, fontSize: 16, opacity: .6 }}>▢</button>
</div>
);
})()}
</div>
</div>
);
}
function fondoBarra(p) {
if (p === "spectra") return "#0a0508";
if (p === "insta") return "#ffffff";
if (p === "whats") return "#075e54";
if (p === "bitacora") return "#f5efe0";
if (p === "news") return "#101418";
return "transparent";
}
function Avatar({ id, size = 32, onClick }) {
const npc = NPCS[id];
const foto = IMG.npcs[id];
const st = { width: size, height: size };
const inner = foto
? <img src={foto} alt={npc?.handle} className="rounded-full object-cover" style={st} />
: <div className="rounded-full bg-gray-200 flex items-center justify-center" style={{ ...st, fontSize: size * 0.5 }}>{npc?.avatar || "👤"}</div>;
return onClick ? <button onClick={onClick} className="flex-shrink-0">{inner}</button> : <span className="flex-shrink-0">{inner}</span>;
}
function Escena({ imgUrl, grad, emoji, texto, alto = 190, fontSize = 14, onClick }) {
const inner = imgUrl ? (
<div className="overflow-hidden relative w-full h-full">
<img src={imgUrl} alt="" className="w-full h-full object-cover" />
{texto && <div className="absolute bottom-0 left-0 right-0 px-4 py-2 text-white font-bold text-left" style={{ background: "linear-gradient(0deg, rgba(0,0,0,.78), transparent)", fontSize }}>{texto}</div>}
</div>
) : (
<div className="px-5 flex flex-col items-center justify-center gap-2 text-white text-center w-full h-full" style={{ background: grad }}>
<div style={{ fontSize: 34 }}>{emoji}</div>
{texto && <div className="font-bold leading-snug" style={{ fontSize }}>{texto}</div>}
</div>
);
return onClick
? <button onClick={onClick} className="w-full block" style={{ height: alto }}>{inner}</button>
: <div className="w-full" style={{ height: alto }}>{inner}</div>;
}
function Lock({ t, lang, setLang, onStart }) {
return (
<div className="h-full flex flex-col items-center justify-between py-8 px-6" style={{ background: "linear-gradient(180deg,#12172b 0%,#1d1440 55%,#0f2e22 100%)" }}>

<div className="text-center">
<div className="text-6xl font-thin text-white">21:37</div>
<div className="text-sm text-gray-300 mt-1">{t.fecha}</div>
</div>
<div className="w-full rounded-2xl p-4" style={{ background: "rgba(255,255,255,.1)", backdropFilter: "blur(10px)" }}>
<div className="flex items-center gap-2 mb-1">
<div className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ background: "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)" }}>📸</div>
<div className="text-xs font-bold text-white">{t.notifLock}</div>
<div className="text-xs text-gray-300 ml-auto">{t.ahora}</div>
</div>
<p className="text-sm text-white leading-snug">{t.lockPreview}</p>
</div>
<div className="w-full text-center">
<button onClick={onStart} className="w-full py-4 rounded-2xl font-bold text-white text-base" style={{ background: "linear-gradient(90deg,#059669,#2563eb)" }}>{t.abrirMensaje}</button>
<p className="text-xs text-gray-400 mt-3 px-4">{t.tagline}</p>
</div>
</div>
);
}
function Home({ t, lang, setLang, g, nivel, abrir, noLeidosW, noLeidosDM, tutoTarget }) {
const fondo = g.infodemia < 35 ? "linear-gradient(180deg,#12172b,#1d1440 60%,#0f2e22)" : g.infodemia < 65 ? "linear-gradient(180deg,#1d1a2b,#3b2a14 60%,#3b0f2e)" : "linear-gradient(180deg,#2b1212,#440f0f 60%,#3b0f2e)";
const estado = g.infodemia < 35 ? t.estado0 : g.infodemia < 65 ? t.estado1 : t.estado2;
const r = RANGOS[nivel - 1];
const apps = [
{ id: "insta", nombre: "Instagrama", icono: "📸", bg: "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)", badge: noLeidosDM, lock: false },
{ id: "whats", nombre: "WhatsUp", icono: "💬", bg: "#25D366", badge: noLeidosW, lock: !g.desbloqueado.whats },
g.modoOscuro ? { id: "spectra", nombre: "SPECTRA", icono: "🕸️", bg: "linear-gradient(135deg,#450a0a,#111827)", lock: false } : { id: "bitacora", nombre: t.appBita, icono: "📓", bg: "linear-gradient(135deg,#a16207,#713f12)", lock: !g.desbloqueado.bitacora },
{ id: "news", nombre: t.appNews, icono: "🗞️", bg: "#1f2937", lock: !g.desbloqueado.news },
];
return (
<div className="h-full px-6 pt-6 pb-4 flex flex-col" style={{ background: fondo, transition: "background 1s" }}>
<div className="flex items-start justify-between mb-8">
<div className="text-white">
<div className="text-2xl font-bold">{t.tuTelefono}</div>
<div className="text-xs text-gray-300 mt-1">{estado}</div>
<div className="text-xs font-bold mt-1" style={{ color: "#fbbf24" }}>{r.emoji} {r.n[lang]} · {Math.floor(g.xp)} XP</div>
</div>

</div>
<div className="grid grid-cols-4 gap-5">
{apps.map((a) => (
<button key={a.id} onClick={() => abrir(a.id)} className="flex flex-col items-center gap-1.5">
<div className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ background: a.bg, filter: a.lock ? "grayscale(.9) brightness(.6)" : "none", ...(tutoTarget === "appInsta" && a.id === "insta" ? { boxShadow: "0 0 0 4px #059669, 0 0 24px 8px rgba(5,150,105,.9)", animation: "haloP 1s infinite" } : {}) }}>
{a.icono}
{a.lock && <span className="absolute -bottom-1 -right-1 text-sm">🔒</span>}
{!a.lock && a.badge > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ background: "#ef4444" }}>{a.badge}</span>}
</div>
<span className="text-xs text-white text-center leading-tight" style={{ opacity: a.lock ? 0.5 : 1 }}>{a.nombre}</span>
</button>
))}
</div>
<div className="mt-auto rounded-2xl p-4 text-xs text-gray-300" style={{ background: "rgba(255,255,255,.07)" }}>
<span className="font-bold text-white">{t.comoJugar}</span>{t.comoJugarTexto}
</div>
</div>
);
}
function comentariosDe(caso, g, lang) {
const res = g.resueltos[caso.id];
const n = res?.eliminado ? 3 : Math.min(3, 1 + Math.floor(g.tick / 20) % 3);
const pool = ["raul", "flores", "chuy", "karla", "padre", "mia", "profe"];
const out = [];
for (let i = 0; i < n; i++) {
const npc = pool[hash(caso.id, i) % pool.length];
const cree = caso.fake && (NPCS[npc].credulidad * 100 + g.infodemia > 95) && !res?.eliminado;
const arr = cree ? COMS.creyente[lang] : COMS.esceptico[lang];
out.push({ npc, texto: arr[hash(caso.id, i + 3) % arr.length], cree });
}
if (res?.eliminado && caso.fake) {
const npc = pool[hash(caso.id, 7) % 6];
out.push({ npc, texto: COMS.gratitud[lang][hash(caso.id, 9) % COMS.gratitud[lang].length], cree: false, gracias: true });
}
return out;
}
function Instagrama({ t, lang, g, nivel, vista, setVista, noLeidosDM, setNoLeidosDM, setSheet, verPerfil, verHistoria, escribiendo, responderOferta, abrirProto, tutoTarget, darLike, contraPublicar, comentar, comentando }) {
return (
<div className="h-full flex flex-col bg-white">
<div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
<span className="text-xl font-bold" style={{ fontFamily: "'Brush Script MT', cursive" }}>Instagrama</span>
<div className="flex gap-2">
<button onClick={() => setVista("feed")} className="px-3 py-1.5 rounded-lg text-sm font-bold" style={{ background: vista === "feed" ? "#111" : "#f3f4f6", color: vista === "feed" ? "#fff" : "#6b7280" }}>{t.feed}</button>
<button onClick={() => { setVista("dms"); setNoLeidosDM(0); }} className="relative px-3 py-1.5 rounded-lg text-sm font-bold" style={{ background: vista !== "feed" ? "#111" : "#f3f4f6", color: vista !== "feed" ? "#fff" : "#6b7280" }}>
{t.dms}
{noLeidosDM > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ background: "#ef4444" }}>{noLeidosDM}</span>}
</button>
</div>
</div>
{vista === "feed" && <Feed t={t} lang={lang} g={g} setSheet={setSheet} verPerfil={verPerfil} verHistoria={verHistoria} tutoTarget={tutoTarget} darLike={darLike} comentar={comentar} comentando={comentando} />}
{vista === "dms" && <ListaDM t={t} lang={lang} g={g} setVista={setVista} escribiendo={escribiendo} />}
{vista === "dmBeto" && <HiloDM t={t} lang={lang} g={g} msgs={g.dmBeto} quien="beto" volver={() => setVista("dms")} verPerfil={verPerfil} escribiendo={escribiendo("dmBeto")} abrirProto={abrirProto} />}
{vista === "dmArq" && <HiloDM t={t} lang={lang} g={g} msgs={g.dmArq} quien="arq" volver={() => setVista("dms")} verPerfil={verPerfil} escribiendo={escribiendo("dmArq")} ofertas={g.ofertas} responderOferta={responderOferta} />}
</div>
);
}
function Feed({ t, lang, g, setSheet, verPerfil, verHistoria, tutoTarget, darLike, comentar, comentando }) {
const halo = (on) => on ? { boxShadow: "0 0 0 4px #059669, 0 0 22px 6px rgba(5,150,105,.85)", borderRadius: 10, animation: "haloP 1s infinite" } : {};
const historias = g.modoOscuro ? [] : g.historias.filter((h) => h.expiraEn > 0 || h.tipo === "amb").slice(-6);
const visibles = [...g.liberados].reverse();
return (
<div className="flex-1 overflow-y-auto">
<div className="flex gap-3 px-4 py-3 border-b border-gray-100 overflow-x-auto">
{historias.map((h) => {
const anillo = h.respondida || h.vista ? "#d1d5db" : h.tipo === "riesgo" ? "linear-gradient(45deg,#dc2626,#7f1d1d)" : "linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)";
return (
<button key={h.id} onClick={() => verHistoria(h.id)} className="flex flex-col items-center gap-1 flex-shrink-0">
<div className="w-14 h-14 rounded-full p-0.5" style={{ background: anillo }}>
<div className="w-full h-full rounded-full bg-white p-0.5"><Avatar id={h.npc} size={48} /></div>
</div>
<span className="text-xs text-gray-600">{NPCS[h.npc].handle.slice(0, 9)}</span>
</button>
);
})}
</div>
{g.misPosts.slice().reverse().map((p, pi) => {
const fake = CASOS.find((c) => c.id === p.casoId);
const dt = Math.max(1, g.tick - p.t);
const mult = p.tier === "excelente" ? 5 : p.tier === "buena" ? 3 : 1;
const likes = p.efectiva ? 10 + Math.floor(Math.pow(dt, 1.3) * mult) : 2 + Math.floor(dt * 0.4);
const badge = p.tier === "excelente" ? "🥪" : p.tier === "buena" ? "✅" : p.tier === "contra" ? "🔁" : "😕";
return (
<div key={"mp" + pi} className="border-b pb-2" style={{ borderColor: p.efectiva ? "#bbf7d0" : "#fecaca", background: p.efectiva ? "#f0fdf4" : "#fef2f2" }}>
<div className="flex items-center gap-2 px-4 py-2">
<div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: p.efectiva ? "#dcfce7" : "#fee2e2" }}>🦸</div>
<div className="flex flex-col leading-tight">
<span className="text-sm font-bold flex items-center gap-1">{t.tuHandle} <span style={{ color: "#059669" }}>✓</span></span>
<span className="text-xs text-gray-500">{t.contraRespondiendo} @{NPCS[fake.autorId].handle}</span>
</div>
<span className="ml-auto text-sm">{badge}</span>
</div>
<div className="mx-4 rounded-xl px-4 py-3" style={{ background: "#fff", border: "1px solid " + (p.efectiva ? "#bbf7d0" : "#fecaca") }}>
<p className="text-sm leading-snug text-gray-800">{p.texto[lang]}</p>
</div>
<div className="px-4 pt-2 flex items-center gap-4 text-sm">
<span className="font-bold" style={{ color: p.efectiva ? "#059669" : "#9ca3af" }}>❤️ {fmt(likes)}</span>
<span className="text-gray-500">💬 {fmt(Math.floor(likes / 4))}</span>
{p.efectiva ? <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: "#dcfce7", color: "#166534" }}>{t.contraApoyo}</span> : <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: "#fee2e2", color: "#991b1b" }}>{t.contraSinFuerza}</span>}
</div>
</div>
);
})}
{g.modoOscuro && g.postsOscuros.slice().reverse().map((p) => (
<div key={p.id} className="border-b pb-2" style={{ borderColor: "#7f1d1d", background: "#1c0a0a" }}>
<div className="flex items-center gap-2 px-4 py-2">
<Avatar id="sombra" size={32} />
<span className="text-sm font-bold" style={{ color: "#fca5a5" }}>{NPCS.sombra.handle}</span>
<span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#450a0a", color: "#fca5a5" }}>🕸️ {t.spTuya}</span>
</div>
<div className="mx-4 rounded-xl overflow-hidden"><Escena grad="linear-gradient(135deg,#450a0a,#111827)" emoji="🕸️" texto={p.titular[lang]} alto={140} fontSize={13} /></div>
<div className="px-4 pt-2 text-sm font-bold" style={{ color: "#f87171" }}>🔁 {fmt(40 + Math.floor(Math.pow(Math.max(1, g.tick - p.t), 1.4) * 3))} · 🦠</div>
</div>
))}
{visibles.map((id) => {
const c = CASOS.find((x) => x.id === id);
const res = g.resueltos[id];
const coms = comentariosDe(c, g, lang);
const shares = sharesDe(c, g);
const dt = g.tick - (g.liberadosT[id] ?? 0);
const eliminado = res?.eliminado;
const oficial = NPCS[c.autorId].rol === "oficial";
return (
<div key={id} className="border-b border-gray-100 pb-2" style={{ opacity: eliminado ? 0.6 : 1 }}>
<div className="flex items-center gap-2 px-4 py-2">
<div style={id === "c1" && tutoTarget === "autor" ? halo(true) : {}}><Avatar id={c.autorId} size={32} onClick={() => verPerfil(c.autorId)} /></div>
<button onClick={() => verPerfil(c.autorId)} className="text-sm font-bold flex items-center gap-1" style={id === "c1" && tutoTarget === "autor" ? { padding: "2px 6px", ...halo(true) } : {}}>
{NPCS[c.autorId].handle}{oficial && <span style={{ color: "#3b82f6" }}>✔</span>}
</button>
<span className="text-xs text-gray-400">· {Math.max(1, Math.floor(dt / 6))} min</span>
<button onClick={() => !g.modoOscuro && setSheet({ tipo: "menu", casoId: id })} className="ml-auto px-2 py-1 text-lg font-black relative" style={{ color: g.modoOscuro ? "#d1d5db" : "#4b5563", ...(id === "c1" && tutoTarget === "menu" ? halo(true) : {}) }}>
⋯
{id === "c1" && !res?.primera && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: "#059669", animation: "pulso 1.2s infinite" }} />}
</button>
</div>
<style>{`@keyframes pulso { 0%,100% { opacity: 1; } 50% { opacity: .3; } } @keyframes haloP { 0%,100% { box-shadow: 0 0 0 4px #059669, 0 0 22px 6px rgba(5,150,105,.85); } 50% { box-shadow: 0 0 0 6px #10b981, 0 0 34px 12px rgba(16,185,129,.55); } }`}</style>
<div className="mx-4 rounded-xl overflow-hidden" style={{ filter: eliminado ? "grayscale(1)" : "none", ...(id === "c1" && (tutoTarget === "post" || tutoTarget === "imagen") ? halo(true) : {}) }}>
<Escena imgUrl={IMG.casos[c.id]} grad={c.grad} emoji={c.img} texto={c.titular[lang]} onClick={() => setSheet({ tipo: "imagen", casoId: id })} />
</div>
<div className="px-4 pt-2 flex items-center gap-4 text-lg">
<button onClick={() => darLike(id)} className="active:scale-90 transition-transform">{g.likes.includes(id) ? "❤️" : "🤍"}</button><span>💬</span>
<span className="text-sm font-bold" style={{ color: c.fake && !eliminado && dt > 10 ? "#dc2626" : "#374151" }}>🔁 {fmt(shares)}</span>
<span className="ml-auto text-base">🔖</span>
</div>
<div className="px-4 pt-1">
{eliminado && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#f3f4f6", color: "#6b7280" }}>{t.eliminada}</span>}
{!eliminado && res?.revision && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>{t.enRevision}</span>}
{!eliminado && !res?.revision && res?.rechazos > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#fee2e2", color: "#991b1b" }}>{t.rechazadoChip}</span>}
{!eliminado && res?.compartido && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#dbeafe", color: "#1e40af" }}>{t.compartidaChip}</span>}
{g.contra[id] && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: g.contra[id] === "bien" ? "#dcfce7" : "#fee2e2", color: g.contra[id] === "bien" ? "#166534" : "#991b1b" }}>{g.contra[id] === "bien" ? t.contraChipOk : t.contraChipMal}</span>}
</div>
<div className="px-4 pt-1.5 space-y-1">
<p className="text-xs text-gray-400">{t.verComentarios} {fmt(Math.floor(shares / 3))} {t.comentarios}</p>
{coms.map((cm, i) => (
<p key={i} className="text-xs" style={{ color: cm.gracias ? "#166534" : cm.cree ? "#374151" : "#2563eb" }}>
<button onClick={() => verPerfil(cm.npc)} className="font-bold">{NPCS[cm.npc].handle}</button> {cm.texto}
</p>
))}
{(g.misComs?.[id] || []).map((cm, i) => (
<p key={"mc" + i} className="text-xs" style={{ color: cm.propio ? "#111827" : "#2563eb" }}>
{cm.propio
? <span className="font-bold">{t.tuHandle} <span style={{ color: "#059669" }}>✓</span></span>
: <button onClick={() => verPerfil(cm.de)} className="font-bold">{NPCS[cm.de]?.handle || cm.de}{cm.ia && <span title="respuesta en vivo" style={{ color: "#a855f7" }}> ✨</span>}</button>}
{" "}{cm.texto}
</p>
))}
{comentando === id && <p className="text-xs italic text-gray-400">● ● ● {t.escribiendoCom}</p>}
{!g.modoOscuro && <EntradaComentario t={t} onEnviar={(v) => comentar(id, v)} bloqueado={comentando === id} />}
</div>
</div>
);
})}
<div className="px-8 py-8 text-center text-gray-400 text-xs">⚽ · 📡</div>
</div>
);
}
function EntradaComentario({ t, onEnviar, bloqueado }) {
const [txt, setTxt] = useState("");
const enviar = () => { const v = txt.trim(); if (!v || bloqueado) return; setTxt(""); onEnviar(v); };
return (
<div className="flex gap-2 items-center pt-1">
<input value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") enviar(); }} placeholder={t.comentaAlgo} disabled={bloqueado} className="flex-1 text-xs py-1.5 outline-none bg-transparent" style={{ color: "#111", borderBottom: "1px solid #e5e7eb" }} />
<button onClick={enviar} disabled={bloqueado || !txt.trim()} className="text-xs font-bold px-2 py-1" style={{ color: txt.trim() && !bloqueado ? "#2563eb" : "#d1d5db" }}>▸</button>
</div>
);
}
function Constructor({ t, lang, caso, publicar, volver }) {
const [seq, setSeq] = useState([]);
const add = (id) => { if (seq.length < 5) setSeq([...seq, id]); };
const quitar = () => setSeq(seq.slice(0, -1));
const preview = seq.map((id) => {
const b = BLOQUES.find((x) => x.id === id);
let f = b.frag[lang];
if (b.usaVerdad && caso.imagenRes?.txt) f += " " + caso.imagenRes.txt[lang];
return f;
}).join(" ");
return (
<div className="px-4 pt-1 pb-2">
<div className="text-sm font-black text-center">{t.contraTitulo}</div>
<div className="text-xs text-center text-gray-500 mb-2 px-2">{t.contraSub}</div>
{/* preview en vivo — tu publicación se va armando */}
<div className="rounded-xl px-3 py-2.5 mb-2" style={{ background: "#f0fdf4", border: "1px dashed #86efac", minHeight: 54 }}>
<div className="text-xs font-bold mb-1" style={{ color: "#059669" }}>🦸 {t.tuHandle} · {t.contraPreview}</div>
{seq.length === 0 ? <p className="text-xs italic text-gray-400">{t.contraVacio}</p> : <p className="text-xs leading-snug text-gray-800">{preview}</p>}
</div>
{/* secuencia actual con orden numerado */}
{seq.length > 0 && (
<div className="flex flex-wrap gap-1 mb-2 items-center">
{seq.map((id, i) => { const b = BLOQUES.find((x) => x.id === id); return (
<span key={i} className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#ede9fe", color: "#5b21b6" }}>{i + 1}. {b.emoji}</span>
); })}
<button onClick={quitar} className="text-xs font-bold px-2 py-1 rounded-lg ml-auto" style={{ background: "#fee2e2", color: "#991b1b" }}>↩︎ {t.contraBorrar}</button>
</div>
)}
{/* bloques disponibles (mezclados: el jugador decide) */}
<div className="text-xs font-bold text-gray-500 mb-1">{t.contraBloques}</div>
<div className="grid grid-cols-2 gap-1.5">
{BLOQUES.map((b) => (
<button key={b.id} onClick={() => add(b.id)} disabled={seq.length >= 5} className="py-2 px-2 rounded-xl text-left text-xs font-bold" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", opacity: seq.length >= 5 ? 0.4 : 1 }}>
{b.emoji} {b.label[lang]}
</button>
))}
</div>
<div className="flex gap-2 mt-3">
<button onClick={volver} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500" style={{ background: "#f3f4f6" }}>{t.cancelar}</button>
<button onClick={() => publicar(seq)} disabled={seq.length === 0} className="flex-[2] py-3 rounded-xl text-sm font-black text-white" style={{ background: seq.length ? "linear-gradient(90deg,#059669,#2563eb)" : "#cbd5e1" }}>{t.contraPublicarBtn}</button>
</div>
</div>
);
}
function Sheets({ t, lang, g, nivel, sheet, setSheet, reportar, compartir, reenviar, contraPublicar }) {
const caso = CASOS.find((c) => c.id === sheet.casoId);
const res = g.resueltos[caso.id];
const [manada, setManada] = useState(false);
const cerrar = () => setSheet(null);
return (
<div className="absolute inset-0 z-40 flex items-end" style={{ background: "rgba(0,0,0,.55)" }} onClick={cerrar}>
<div className="w-full rounded-t-3xl bg-white pb-8" onClick={(e) => e.stopPropagation()}>
<div className="flex justify-center pt-2 pb-1"><div style={{ width: 40, height: 4, borderRadius: 2, background: "#d1d5db" }} /></div>
{sheet.tipo === "menu" && (
<div className="px-4 pt-2">
<button onClick={() => setSheet({ tipo: "razones", casoId: caso.id })} disabled={res?.eliminado || res?.revision} className="w-full py-3.5 text-left px-4 rounded-xl text-sm font-bold" style={{ color: "#dc2626", opacity: res?.eliminado || res?.revision ? 0.4 : 1 }}>{t.reportar}</button>
{caso.odioCaso && <button onClick={() => reportar(caso.id, "__contra__", false)} disabled={res?.eliminado} className="w-full py-3.5 text-left px-4 rounded-xl text-sm font-bold" style={{ color: "#2563eb", opacity: res?.eliminado ? 0.4 : 1 }}>{t.contraDiscurso}</button>}
<button onClick={() => compartir(caso.id)} disabled={res?.eliminado || res?.compartido} className="w-full py-3.5 text-left px-4 rounded-xl text-sm font-bold text-gray-800" style={{ opacity: res?.eliminado || res?.compartido ? 0.4 : 1 }}>{t.compartirOp}</button>
<button onClick={() => reenviar(caso.id)} disabled={g.reenviados.includes(caso.id)} className="w-full py-3.5 text-left px-4 rounded-xl text-sm font-bold text-gray-800" style={{ opacity: g.reenviados.includes(caso.id) ? 0.4 : 1 }}>{t.reenviarBeto}</button>
{caso.fake && <button onClick={() => setSheet({ tipo: "contra", casoId: caso.id })} disabled={g.contra[caso.id]} className="w-full py-3.5 text-left px-4 rounded-xl text-sm font-bold" style={{ color: "#059669", opacity: g.contra[caso.id] ? 0.4 : 1 }}>{t.publicarCorr}</button>}
<button onClick={cerrar} className="w-full py-3.5 mt-1 rounded-xl text-sm font-bold text-gray-500" style={{ background: "#f3f4f6" }}>{t.cancelar}</button>
</div>
)}
{sheet.tipo === "contra" && (
<Constructor t={t} lang={lang} caso={caso} publicar={(seq) => contraPublicar(caso.id, seq)} volver={() => setSheet({ tipo: "menu", casoId: caso.id })} />
)}
{sheet.tipo === "razones" && (
<div className="px-4 pt-2">
<div className="text-sm font-black text-center pb-2">{t.porQueTipo}</div>
{TIPOS.map((r) => (
<button key={r} onClick={() => reportar(caso.id, r, manada)} className="w-full py-3 text-left px-4 text-sm font-semibold text-gray-800 border-b border-gray-100">
{tipoLabel(r, t)}
</button>
))}
{nivel >= 4 && (
<button onClick={() => setManada(!manada)} className="w-full py-3 mt-2 rounded-xl text-xs font-bold" style={{ background: manada ? "#dcfce7" : "#f3f4f6", color: manada ? "#166534" : "#6b7280" }}>
{t.manada} {manada ? "✓" : ""}
</button>
)}
<button onClick={cerrar} className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-gray-500" style={{ background: "#f3f4f6" }}>{t.cancelar}</button>
</div>
)}
{sheet.tipo === "imagen" && (
<div className="px-4 pt-2">
<div className="rounded-xl overflow-hidden mb-3"><Escena imgUrl={IMG.casos[caso.id]} grad={caso.grad} emoji={caso.img} texto={null} alto={130} /></div>
<div className="space-y-2">
<div>
<div className="text-xs font-bold text-gray-500 mb-1">{t.busqInversa}</div>
{nivel >= 2 ? (
<div className="rounded-lg px-3 py-2 text-xs leading-relaxed" style={{ background: caso.imagenRes.mal ? "#fef2f2" : "#f0fdf4", color: caso.imagenRes.mal ? "#991b1b" : "#166534", border: "1px solid " + (caso.imagenRes.mal ? "#fecaca" : "#bbf7d0") }}>
{caso.imagenRes.mal ? "⚠️ " : "✅ "}{caso.imagenRes.txt[lang]}
</div>
) : (
<div className="rounded-lg px-3 py-2 text-xs text-gray-400" style={{ background: "#f3f4f6" }}>{t.herrBloq} 2 {t.verBitacora}</div>
)}
</div>
<div>
<div className="text-xs font-bold text-gray-500 mb-1">{t.detectorIa}</div>
{nivel >= 3 ? (
<div className="rounded-lg px-3 py-2 text-xs leading-relaxed" style={{ background: caso.iaRes.mal ? "#fef2f2" : "#f0fdf4", color: caso.iaRes.mal ? "#991b1b" : "#166534", border: "1px solid " + (caso.iaRes.mal ? "#fecaca" : "#bbf7d0") }}>
{caso.iaRes.txt[lang]}
</div>
) : (
<div className="rounded-lg px-3 py-2 text-xs text-gray-400" style={{ background: "#f3f4f6" }}>{t.herrBloq} 3 {t.verBitacora}</div>
)}
</div>
</div>
<button onClick={cerrar} className="w-full py-3.5 mt-3 rounded-xl text-sm font-bold text-gray-500" style={{ background: "#f3f4f6" }}>{t.cancelar}</button>
</div>
)}
</div>
</div>
);
}
function ListaDM({ t, lang, g, setVista, escribiendo }) {
const hilos = [{ id: "dmBeto", quien: "beto", ultimo: g.dmBeto[g.dmBeto.length - 1] }];
if (g.dmArq.length > 0) hilos.unshift({ id: "dmArq", quien: "arq", ultimo: g.dmArq[g.dmArq.length - 1] });
return (
<div className="flex-1 overflow-y-auto">
{hilos.map((h) => {
const typing = escribiendo(h.id);
return (
<button key={h.id} onClick={() => setVista(h.id)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 text-left">
<Avatar id={h.quien} size={48} />
<div className="flex-1 min-w-0">
<div className="text-sm font-bold">{NPCS[h.quien].nombre[lang]}</div>
<div className="text-xs truncate" style={{ color: typing ? "#059669" : "#6b7280", fontStyle: typing ? "italic" : "normal" }}>{typing ? t.escribiendo : txtMsg(h.ultimo, lang)}</div>
</div>
</button>
);
})}
</div>
);
}
function HiloDM({ t, lang, g, msgs, quien, volver, verPerfil, escribiendo, ofertas, responderOferta, abrirProto }) {
const fin = useRef(null);
useEffect(() => { fin.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length, escribiendo]);
return (
<div className="flex-1 flex flex-col overflow-hidden">
<div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
<button onClick={volver} className="text-gray-400 text-lg pr-1">‹</button>
<Avatar id={quien} size={32} onClick={() => verPerfil(quien)} />
<button onClick={() => verPerfil(quien)} className="text-sm font-bold text-left">{NPCS[quien].nombre[lang]}</button>
</div>
<div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
{msgs.map((m, i) => (
<div key={i}>
<div className={"flex " + (m.propio ? "justify-end" : "justify-start")}>
<div className="max-w-xs rounded-2xl px-3 py-2 text-sm leading-snug" style={{ background: m.propio ? "#2563eb" : "#f3f4f6", color: m.propio ? "#fff" : "#111", whiteSpace: "pre-line" }}>
{txtMsg(m, lang)}
{m.propio && <span className="text-xs ml-1" style={{ color: g.tick - (m.t || 0) > 2 ? "#93c5fd" : "rgba(255,255,255,.6)" }}> ✓✓</span>}
</div>
</div>
{m.protocolo && g.crisis && (
<div className="px-6 mt-2">
<button onClick={abrirProto} className="w-full py-3 rounded-xl text-sm font-black text-white" style={{ background: "linear-gradient(90deg,#dc2626,#b45309)", animation: "pulso 1.2s infinite" }}>{t.abrirProto}</button>
</div>
)}
{m.ofertaId && ofertas && ofertas[m.ofertaId] === "pendiente" && (
<div className="flex gap-2 mt-2 px-6">
<button onClick={() => responderOferta(m.ofertaId, true)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: "linear-gradient(90deg,#b45309,#dc2626)" }}>{t.aceptar}</button>
<button onClick={() => responderOferta(m.ofertaId, false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: "linear-gradient(90deg,#059669,#2563eb)" }}>{t.rechazar}</button>
</div>
)}
</div>
))}
{escribiendo === quien && <div className="flex justify-start"><div className="rounded-2xl px-4 py-2 text-sm italic" style={{ background: "#f3f4f6", color: "#9ca3af" }}>● ● ●</div></div>}
<div ref={fin} />
</div>
</div>
);
}
function WhatsUp({ t, lang, g, responder, verPerfil, escribiendo, responderLibre }) {
const fin = useRef(null);
useEffect(() => { fin.current?.scrollIntoView({ behavior: "smooth" }); }, [g.chat.length, escribiendo]);
return (
<div className="h-full flex flex-col" style={{ background: "#ece5dd" }}>
<div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "#075e54" }}>
<div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-lg">👨‍👩‍👧‍👦</div>
<div>
<div className="text-sm font-bold text-white">{t.grupo}</div>
<div className="text-xs" style={{ color: "#b7dfd9" }}>{escribiendo ? NPCS[escribiendo]?.nombre[lang] + " " + t.escribiendo : t.miembros}</div>
</div>
</div>
<div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
{g.chat.map((m, i) => {
const texto = txtMsg(m, lang);
const q = m.preguntaId ? g.preguntas.find((x) => x.id === m.preguntaId) : null;
const italic = texto.startsWith("*") || texto.startsWith("🔗");
return (
<div key={i}>
<div className={"flex " + (m.propio ? "justify-end" : "justify-start")}>
<div className="max-w-xs rounded-xl px-3 py-2 shadow-sm" style={{ background: m.propio ? "#dcf8c6" : "#fff" }}>
{!m.propio && <button onClick={() => verPerfil(m.de)} className="text-xs font-bold block" style={{ color: "#e91e63" }}>{NPCS[m.de]?.nombre[lang] || m.de}{m.ia && <span title="respuesta en vivo" style={{ color: "#a855f7" }}> ✨</span>}</button>}
<p className="text-sm leading-snug" style={{ fontStyle: italic ? "italic" : "normal", color: italic ? "#6b7280" : "#1f2937" }}>{texto}</p>
<div className="text-right text-xs text-gray-400 mt-0.5">{hora(m.t || 0)} {m.propio && <span style={{ color: g.tick - (m.t || 0) > 2 ? "#38bdf8" : "#9ca3af" }}>✓✓</span>}</div>
</div>
</div>
{q && q.estado === "pendiente" && (
<div className="flex gap-2 mt-2 px-4">
<button onClick={() => responder(q.id, "explicar")} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: "#059669" }}>{q.share ? t.corregir : t.explicar}</button>
<button onClick={() => responder(q.id, "ignorar")} className="flex-1 py-2.5 rounded-xl text-xs font-bold" style={{ background: "#e5e7eb", color: "#6b7280" }}>{q.share ? t.dejarlo : t.ignorar}</button>
</div>
)}
</div>
);
})}
{escribiendo && <div className="flex justify-start"><div className="rounded-xl px-4 py-2 text-sm italic shadow-sm" style={{ background: "#fff", color: "#9ca3af" }}>● ● ●</div></div>}
<div ref={fin} />
</div>
<EntradaWhats t={t} onEnviar={responderLibre} />
</div>
);
}
function EntradaWhats({ t, onEnviar }) {
const [txt, setTxt] = useState("");
const enviar = () => { const v = txt.trim(); if (!v) return; setTxt(""); onEnviar(v); };
return (
<div className="px-3 py-2 flex gap-2 items-center" style={{ background: "#f0f0f0" }}>
<input value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") enviar(); }} placeholder={t.mensaje} className="flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none" style={{ color: "#111" }} />
<button onClick={enviar} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg" style={{ background: "#075e54" }}>{txt.trim() ? "➤" : "🎤"}</button>
</div>
);
}
function VisorHistoria({ t, lang, h, cerrar, responder }) {
const foto = IMG.historias[h.id];
return (
<div className="absolute inset-0 z-40 flex flex-col" style={{ background: "#000" }}>
<style>{`@keyframes barra { from { width: 0%; } to { width: 100%; } }`}</style>
<div className="px-3 pt-2">
<div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.25)" }}>
<div className="h-full rounded-full" style={{ background: "#fff", animation: "barra 6s linear forwards" }} />
</div>
</div>
<div className="flex items-center gap-2 px-3 py-2">
<Avatar id={h.npc} size={32} />
<span className="text-sm font-bold text-white">{NPCS[h.npc].handle}</span>
{h.tipo === "riesgo" && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#7f1d1d", color: "#fca5a5" }}>⚠️</span>}
<button onClick={cerrar} className="ml-auto text-white text-xl px-2">✕</button>
</div>
<div className="flex-1 flex flex-col items-center justify-center px-6 relative">
{foto ? <img src={foto} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0" style={{ background: h.grad }} />}
<div className="relative text-center">
{!foto && <div style={{ fontSize: 72 }}>{h.emojis}</div>}
<div className="text-white text-xl font-black mt-4 px-4 py-2 rounded-xl" style={{ background: "rgba(0,0,0,.35)" }}>{h.texto[lang]}</div>
</div>
</div>
<div className="px-4 pb-6 relative">
{h.tipo === "riesgo" && !h.respondida && h.expiraEn > 0 && (
<button onClick={() => responder(h.id)} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm" style={{ background: "linear-gradient(90deg,#059669,#2563eb)" }}>{t.responderHist}</button>
)}
{h.respondida && <div className="text-center text-sm font-bold" style={{ color: "#4ade80" }}>🛡️ {NPCS[h.npc].nombre[lang]}: {t.histSalvada}</div>}
</div>
</div>
);
}
function PerfilMini({ t, lang, npcId, g, cerrar }) {
const npc = NPCS[npcId];
if (!npc) return null;
const estado = g.comunidad[npcId];
const rolL = { familia: "👨‍👩‍👧", vecino: "🏘️", influencer: "🤳", bot: "⚠️", oficial: "✔", aliado: "🤝", villano: "🎭" }[npc.rol];
const sospechoso = npc.rol === "bot" || npc.rol === "villano";
return (
<div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,.6)" }} onClick={cerrar}>
<div className="w-full rounded-t-3xl px-5 pt-5 pb-8 bg-white" onClick={(e) => e.stopPropagation()}>
<div className="flex items-center gap-3">
<Avatar id={npcId} size={64} />
<div className="flex-1">
<div className="text-base font-black flex items-center gap-1">{npc.nombre[lang]} {npc.rol === "oficial" && <span style={{ color: "#3b82f6" }}>✔</span>}</div>
<div className="text-xs text-gray-500">@{npc.handle}</div>
</div>
<button onClick={cerrar} className="text-gray-400 text-xl px-2">✕</button>
</div>
<div className="flex gap-2 mt-3 flex-wrap">
<span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: sospechoso ? "#fee2e2" : "#f3f4f6", color: sospechoso ? "#991b1b" : "#374151" }}>{rolL} {npc.rol}</span>
{estado && <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#f3f4f6", color: estado === "caido" ? "#991b1b" : estado === "inmune" ? "#166534" : "#374151" }}>{estado === "sano" ? "🟢" : estado === "dudoso" ? "🟡" : estado === "caido" ? "🔴" : "🛡️"} {estado}</span>}
{npcId === "n0ticias" && g.strikes > 0 && <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#fee2e2", color: "#991b1b" }}>🚩 {g.strikes} strikes</span>}
</div>
<p className="text-sm mt-3 leading-relaxed text-gray-700">{npc.bio[lang]}</p>
</div>
</div>
);
}
function Protocolo({ t, lang, g, paso, cerrar }) {
const cr = CRISIS[g.crisis.casoId];
const caso = CASOS.find((c) => c.id === g.crisis.casoId);
const pasos = [
{ titulo: t.protoA, desc: t.protoAd, btn: t.protoAbtn, extra: null },
{ titulo: t.protoL, desc: t.protoLd, btn: t.protoLbtn, extra: cr.fuente[lang] },
{ titulo: t.protoT, desc: t.protoTd, btn: t.protoTbtn, extra: (caso.imagenRes.mal ? "⚠️ " + caso.imagenRes.txt[lang] + " " : "") + (caso.iaRes.mal ? caso.iaRes.txt[lang] : "") },
{ titulo: t.protoO, desc: t.protoOd, btn: t.protoObtn, extra: null },
];
const p = g.crisis.paso;
return (
<div className="absolute inset-0 z-50 flex flex-col" style={{ background: "rgba(20,4,4,.97)" }}>
<div className="px-5 pt-5 flex items-start justify-between">
<div>
<div className="text-xs font-black tracking-widest" style={{ color: "#f87171" }}>🚨 {cr.nombre[lang]}</div>
<div className="text-xl font-black text-white mt-1">{t.protoTitulo}</div>
<div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{t.protoSub}</div>
</div>
<button onClick={cerrar} className="text-gray-400 text-xl px-2">✕</button>
</div>
<div className="px-5 pt-2 text-xs font-bold" style={{ color: "#fbbf24" }}>⏱ {t.quedan} · {g.crisis.quedan}</div>
<div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
{pasos.map((s, i) => {
const hecho = p > i;
const activo = p === i;
return (
<div key={i} className="rounded-2xl p-4" style={{ background: hecho ? "#052e16" : activo ? "#1c1917" : "#0c0a09", border: "1px solid " + (hecho ? "#166534" : activo ? "#b45309" : "#292524"), opacity: !hecho && !activo ? 0.45 : 1 }}>
<div className="text-sm font-black" style={{ color: hecho ? "#4ade80" : "#fbbf24" }}>{hecho ? "✅ " : ""}{s.titulo}</div>
<p className="text-xs mt-1 leading-relaxed" style={{ color: "#d6d3d1" }}>{s.desc}</p>
{(hecho || activo) && s.extra && (
<div className="mt-2 rounded-lg px-3 py-2 text-xs leading-relaxed" style={{ background: "#0c0a09", color: "#93c5fd", border: "1px solid #1e3a8a" }}>📡 {s.extra}</div>
)}
{activo && (i < 3 ? (
<button onClick={paso} className="w-full mt-3 py-3 rounded-xl text-sm font-black text-white" style={{ background: "linear-gradient(90deg,#dc2626,#b45309)" }}>{s.btn}</button>
) : (
<Sandwich t={t} listo={paso} />
))}
</div>
);
})}
{p >= 4 && <div className="text-center text-lg font-black py-3" style={{ color: "#4ade80" }}>{t.protoListo}</div>}
</div>
</div>
);
}
function CoachBurbuja({ t, lang, msg, cerrar }) {
const arq = msg.de === "arq";
const grad = arq ? "linear-gradient(135deg,#7f1d1d,#450a0a)" : "linear-gradient(135deg,#7c3aed,#4f46e5)";
const nombre = arq ? "El Arquitecto" : "Beto";
const foto = arq ? "🎭" : "🧑‍💻";
const borde = arq ? "#dc2626" : "#6d28d9";
const btn = arq ? "#b91c1c" : "#059669";
return (
<div className="absolute inset-x-0 px-3" style={{ top: 8, zIndex: 70, pointerEvents: "none" }}>
<div style={{ animation: "subeB .3s ease-out", pointerEvents: "auto" }}>
<div className="flex items-start gap-2">
<div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-xl" style={{ border: "2px solid " + borde, boxShadow: "0 4px 14px rgba(0,0,0,.4)", background: arq ? "#1c0a0a" : "#ede9fe" }}>{foto}</div>
<div className="flex-1 rounded-3xl rounded-bl-md px-4 py-2.5" style={{ background: grad, boxShadow: "0 6px 20px rgba(0,0,0,.4)" }}>
<div className="flex items-center gap-1.5 mb-0.5">
<span className="text-xs font-bold text-white opacity-90">{nombre}</span>
<span className="text-xs opacity-70" style={{ color: arq ? "#fca5a5" : "#ddd6fe" }}>· {arq ? "SPECTRA" : "Nidssingir"}</span>
<button onClick={cerrar} className="ml-auto text-white text-lg leading-none opacity-80" aria-label="cerrar">✕</button>
</div>
<p className="text-white font-black leading-tight" style={{ fontSize: 16 }}>{msg.txt[lang]}</p>
</div>
</div>
<div className="flex mt-2" style={{ paddingLeft: 52 }}>
<button onClick={cerrar} className="px-6 py-2.5 rounded-full font-black text-white" style={{ fontSize: 15, background: btn, boxShadow: "0 4px 12px rgba(0,0,0,.35)" }}>{t.tutoOk}</button>
</div>
</div>
</div>
);
}
function Consecuencia({ t, lang, cons, cerrar }) {
return (
<div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ background: "rgba(20,4,4,.96)" }}>
<div className="text-xs font-black tracking-widest mb-3" style={{ color: "#f87171", animation: "pulso 1.2s infinite" }}>🚨 {t.consTitulo}</div>
<div className="w-full rounded-2xl overflow-hidden" style={{ border: "1px solid #7f1d1d", boxShadow: "0 0 40px rgba(220,38,38,.4)" }}>
<div className="px-3 py-1.5 text-xs font-black text-white" style={{ background: "#b91c1c" }}>🔴 {t.consEnVivo}</div>
<div className="px-4 py-5" style={{ background: "#1c0a0a" }}>
<p className="text-white font-black leading-snug" style={{ fontSize: 20 }}>{cons.titular[lang]}</p>
</div>
</div>
<div className="w-full rounded-xl mt-3 px-4 py-3" style={{ background: "rgba(220,38,38,.12)", border: "1px solid #7f1d1d" }}>
<div className="text-xs font-black mb-1" style={{ color: "#fca5a5" }}>⚠️ {t.consReal}</div>
<p className="text-xs leading-relaxed" style={{ color: "#fecaca" }}>{cons.real[lang]}</p>
</div>
<button onClick={cerrar} className="mt-5 px-8 py-3 rounded-full font-black text-white" style={{ fontSize: 16, background: "#dc2626" }}>{t.consEntendido}</button>
</div>
);
}
function TutoBurbuja({ t, lang, paso, avanzar, saltar, idx, total }) {
const [min, setMin] = useState(false);
const esperaAccion = paso.target != null;
const audioUrl = paso.audio ? MEDIA.audio[paso.audio] : null;
// minimizado: solo el avatar flotante, para no tapar nada
if (min) return (
<button onClick={() => setMin(false)} className="absolute z-50 rounded-full flex items-center justify-center text-2xl" style={{ left: 12, bottom: 16, width: 52, height: 52, background: "#ede9fe", border: "2px solid #6d28d9", boxShadow: "0 4px 14px rgba(0,0,0,.4)", animation: "pulso 1.4s infinite" }}>🧑‍💻</button>
);
return (
<div className="absolute inset-x-0 px-3" style={{ top: 8, zIndex: 70, pointerEvents: "none" }}>
<div style={{ animation: "subeB .3s ease-out", pointerEvents: "auto" }}>
<div className="flex items-start gap-2">
<button onClick={() => setMin(true)} className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden" style={{ border: "2px solid #6d28d9", boxShadow: "0 4px 14px rgba(0,0,0,.4)" }} aria-label="min">
{IMG.npcs.beto ? <img src={IMG.npcs.beto} alt="Beto" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: "#ede9fe" }}>🧑‍💻</div>}
</button>
<div className="flex-1 rounded-3xl rounded-bl-md px-4 py-2.5" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 6px 20px rgba(79,70,229,.45)" }}>
<div className="flex items-center gap-1.5 mb-0.5">
<span className="text-xs font-bold text-white opacity-90">Beto</span>
<span className="text-xs opacity-70" style={{ color: "#ddd6fe" }}>· Nidssingir</span>
{audioUrl && <button onClick={() => new Audio(audioUrl).play()} className="text-white text-sm">🔊</button>}
<button onClick={() => setMin(true)} className="ml-auto text-white text-lg leading-none opacity-80" aria-label="minimizar">–</button>
</div>
<p className="text-white font-black leading-tight" style={{ fontSize: 17 }}>{paso.txt[lang]}</p>
</div>
</div>
<div className="flex items-center gap-2 mt-2 pl-13" style={{ paddingLeft: 52 }}>
{esperaAccion ? (
<>
<div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "#c4b5fd" }}>
<span style={{ animation: "pulso 1s infinite" }}>👆</span> {t.tutoTuTurno}
</div>
<button onClick={avanzar} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ color: "#ddd6fe", background: "rgba(124,58,237,.25)" }}>{t.tutoSiguiente} ▸</button>
</>
) : (
<button onClick={avanzar} className="px-6 py-2.5 rounded-full font-black text-white" style={{ fontSize: 15, background: "#059669", boxShadow: "0 4px 12px rgba(5,150,105,.5)" }}>{idx >= total - 1 ? t.tutoListo : t.tutoOk}</button>
)}
<button onClick={saltar} className="ml-auto text-xs font-bold px-2 py-1.5" style={{ color: "#a78bfa" }}>{t.tutoSaltar}</button>
</div>
</div>
</div>
);
}
function Bitacora({ t, lang, g, nivel }) {
const r = RANGOS[nivel - 1];
const sig = RANGOS[nivel] || null;
const prog = sig ? clamp((g.xp - r.xp) / (sig.xp - r.xp), 0, 1) : 1;
const dec = Object.values(g.resueltos).filter((x) => x.primera);
const prec = dec.length ? Math.round((dec.filter((x) => x.correcto).length / dec.length) * 100) : 0;
const manus = "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive";
// misión "encendida" si el jugador ya aprendió al menos una de sus lecciones
const activa = (m) => m.lec.some((id) => g.lecciones.includes(id));
const tilt = [-1.1, 0.8, -0.6, 1.2, -0.9];
return (
<div className="h-full overflow-y-auto" style={{ background: "#f4ecd8", color: "#3a2f1e", fontFamily: "Georgia, 'Times New Roman', serif", backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(160,130,80,.09) 28px)" }}>
{/* Encabezado manuscrito */}
<div className="px-5 pt-4 pb-3" style={{ borderBottom: "2px solid #cbb994" }}>
<div className="text-2xl" style={{ fontFamily: manus, color: "#5b3a1a", transform: "rotate(-1deg)" }}>La Bitácora de Beto</div>
<div className="text-xs italic mt-0.5" style={{ color: "#8a7a5c" }}>para mi primo — anota, verifica, no compartas a lo tonto</div>
</div>
{/* Página 1: el lore, como carta pegada */}
<div className="mx-4 mt-4 p-4 text-sm leading-relaxed" style={{ background: "#fffdf3", border: "1px solid #e0d3ad", whiteSpace: "pre-line", boxShadow: "1px 2px 6px rgba(90,60,20,.12)", transform: "rotate(-.5deg)" }}>
{BITACORA_P1[lang]}
</div>

{/* Mi rango — como ficha manuscrita */}
<div className="px-5 pt-5">
<div className="text-lg" style={{ fontFamily: manus, color: "#7a4a1a" }}>{t.bitaRango} ✍️</div>
<div className="mt-2 p-4" style={{ background: "#fffdf3", border: "1px solid #e0d3ad", boxShadow: "1px 2px 6px rgba(90,60,20,.1)", transform: "rotate(.4deg)" }}>
<div className="flex items-center justify-between">
<span className="text-lg font-black">{r.emoji} {r.n[lang]}</span>
<span className="text-xs" style={{ color: "#8a7a5c" }}>{Math.floor(g.xp)} XP · 🎯 {prec}%</span>
</div>
<div className="mt-2 h-2.5 rounded-full overflow-hidden" style={{ background: "#e6d9b8" }}>
<div className="h-full rounded-full transition-all" style={{ width: prog * 100 + "%", background: "linear-gradient(90deg,#b9821f,#8a5a12)" }} />
</div>
{sig && <div className="text-xs mt-1 italic" style={{ color: "#8a7a5c" }}>siguiente: {sig.emoji} {sig.n[lang]} ({sig.xp} XP)</div>}
<div className="text-sm mt-3 mb-1" style={{ fontFamily: manus, color: "#7a4a1a" }}>Lo que me fue prestando esta libreta:</div>
{[t.h1, t.h2, t.h3, t.h4, t.h5].map((h, i) => (
<div key={i} className="text-xs py-0.5" style={{ color: nivel >= i + 1 ? "#3a2f1e" : "#b3a583", textDecoration: nivel >= i + 1 ? "none" : "none" }}>
{nivel >= i + 1 ? "✔" : "○"} {h}
</div>
))}
<div className="flex gap-4 mt-3 text-xs">
<div className="flex-1">
<div style={{ color: "#8a7a5c" }}>🦠 {t.bitaCaos}</div>
<div className="h-2 rounded-full overflow-hidden mt-0.5" style={{ background: "#e6d9b8" }}><div className="h-full transition-all" style={{ width: g.infodemia + "%", background: "#c0392b" }} /></div>
</div>
<div className="flex-1">
<div style={{ color: "#8a7a5c" }}>🎭 {t.bitaCred}</div>
<div className="h-2 rounded-full overflow-hidden mt-0.5" style={{ background: "#e6d9b8" }}><div className="h-full transition-all" style={{ width: g.cred + "%", background: "#7c3aed" }} /></div>
</div>
</div>
</div>
</div>

{/* Mapa de misiones MIL — capítulos manuscritos que agrupan las lecciones */}
<div className="px-5 pt-6">
<div className="text-lg" style={{ fontFamily: manus, color: "#7a4a1a" }}>{t.bitaMapa} 🗺️</div>
<div className="text-xs italic mb-1" style={{ color: "#8a7a5c" }}>{t.bitaMapaSub}</div>
{MISIONES_MIL.map((m, mi) => {
const on = activa(m);
const lecs = m.lec.map((id) => TACTICAS[id]).filter(Boolean);
const vistas = m.lec.filter((id) => g.lecciones.includes(id)).length;
return (
<div key={m.id} className="mt-3 p-4" style={{ background: on ? "#fffdf3" : "#efe6cf", border: "1px solid " + (on ? "#d8c48f" : "#e0d3ad"), boxShadow: on ? "1px 2px 7px rgba(90,60,20,.13)" : "none", transform: "rotate(" + tilt[mi % tilt.length] + "deg)", opacity: on ? 1 : 0.82 }}>
{/* cabecera de la misión */}
<div className="flex items-start gap-2">
<div style={{ fontSize: 22, filter: on ? "none" : "grayscale(1) opacity(.6)" }}>{m.est}</div>
<div className="flex-1">
<div className="text-xs" style={{ color: "#a08a5c", fontFamily: manus }}>{t.bitaMision} {m.num}</div>
<div className="text-base font-black leading-tight" style={{ color: on ? "#3a2f1e" : "#8a7a5c" }}>{m.tema[lang]}</div>
</div>
{m.lec.length > 0 && <div className="text-xs px-2 py-0.5" style={{ color: "#8a7a5c", fontFamily: manus }}>{vistas}/{m.lec.length}</div>}
</div>
{/* nota de Beto al margen */}
<p className="text-xs mt-2 leading-relaxed italic" style={{ color: "#6b5a3c", borderLeft: "2px solid #d8c48f", paddingLeft: 8 }}>“{m.nota[lang]}”</p>
{/* lecciones aprendidas bajo esta misión */}
{m.lec.length > 0 && (
<div className="mt-3 space-y-2">
{lecs.map((lec, i) => {
const tiene = g.lecciones.includes(m.lec[i]);
return tiene ? (
<div key={i} className="pl-2" style={{ borderLeft: "2px dotted #c9b481" }}>
<div className="text-sm font-bold" style={{ color: "#4a3a22" }}>{lec.emoji} {lec.nombre[lang]}</div>
<p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#6b5a3c" }}>{lec.entrada[lang]}</p>
</div>
) : (
<div key={i} className="text-xs italic pl-2" style={{ color: "#b3a583", borderLeft: "2px dotted #e0d3ad" }}>{lec.emoji} {t.bitaViva}</div>
);
})}
</div>
)}
{m.lec.length === 0 && <p className="text-xs mt-2 italic" style={{ color: "#b3a583" }}>— {t.bitaPorAprender} —</p>}
</div>
);
})}
</div>
<div className="px-5 pt-6 pb-8">
<div className="text-lg" style={{ fontFamily: manus, color: "#7a4a1a" }}>{t.bitaInv} 🕵️ <span className="text-xs italic" style={{ color: "#8a7a5c" }}>· quién está detrás de todo</span></div>
<div className="mt-2 space-y-3">
{LORE.map((l, i) => (
<div key={i} className="p-3" style={{ background: i < g.investigaciones ? "#fffdf3" : "#efe6cf", border: "1px solid " + (i < g.investigaciones ? "#d8c48f" : "#e0d3ad"), boxShadow: i < g.investigaciones ? "1px 2px 6px rgba(90,60,20,.12)" : "none", transform: "rotate(" + (i % 2 ? .7 : -.7) + "deg)" }}>
{i < g.investigaciones
? <p className="text-xs leading-relaxed" style={{ color: "#3a2f1e" }}>{l[lang]}</p>
: <p className="text-xs italic" style={{ color: "#b3a583" }}>🔒 {t.invBloq} {[3, 5, 7][i]})</p>}
</div>
))}
</div>
</div>
</div>
);
}
function Noticias({ t, lang, g }) {
const lista = [...g.noticiasExtra];
return (
<div className="h-full flex flex-col overflow-y-auto" style={{ background: "#101418", color: "#e5e7eb" }}>
<div className="px-4 py-3 border-b" style={{ borderColor: "#1f2937" }}>
<div className="text-lg font-black" style={{ fontFamily: "Georgia, serif" }}>{t.diario}</div>
<div className="text-xs" style={{ color: "#6b7280" }}>⚽ {lang === "es" ? "Especial: la final del domingo" : "Special: Sunday's final"}</div>
</div>
{lista.length === 0 && (
<div className="px-4 py-3 border-b" style={{ borderColor: "#1f2937" }}>
<div className="text-sm font-bold leading-snug" style={{ fontFamily: "Georgia, serif" }}>{BANCO.neutral[0][lang]}</div>
</div>
)}
{lista.map((n, i) => (
<div key={i} className="px-4 py-3 border-b" style={{ borderColor: "#1f2937" }}>
<div className="text-xs mb-1" style={{ color: "#6b7280" }}>{i === 0 ? t.ahora : hora(n.t)}</div>
<div className="text-sm font-bold leading-snug" style={{ fontFamily: "Georgia, serif" }}>{n.texto[lang]}</div>
</div>
))}
<div className="px-4 py-6 text-center text-xs" style={{ color: "#4b5563" }}>{t.newsFooter}</div>
</div>
);
}
function Final({ t, lang, g, finalesVistos, reiniciar }) {
const f = FINALES[g.final];
const dominadas = g.lecciones.filter((id) => id !== "alto");
const dec = Object.values(g.resueltos).filter((x) => x.primera);
const prec = dec.length ? Math.round((dec.filter((x) => x.correcto).length / dec.length) * 100) : 0;
const caidos = Object.values(g.comunidad).filter((e) => e === "caido").length;
const protegidos = CIVILES.length - caidos;
return (
<div className="absolute inset-0 z-50 overflow-y-auto" style={{ background: f.grad }}>
<div className="px-5 py-6">
<div className="text-xs font-bold tracking-widest" style={{ color: f.color }}>{t.certT}</div>
<div className="text-5xl mt-2">{f.emoji}</div>
<h2 className="text-2xl font-black text-white mt-1">{f.titulo[lang]}</h2>
<p className="text-sm mt-2 leading-relaxed" style={{ color: "#cbd5e1" }}>{f.texto[lang]}</p>
<p className="text-xs mt-3 italic" style={{ color: "#94a3b8" }}>{f.beto[lang]}</p>
<div className="grid grid-cols-3 gap-2 mt-4">
<div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(17,24,39,.8)" }}>
<div className="text-lg font-black" style={{ color: "#38bdf8" }}>{prec}%</div>
<div className="text-xs" style={{ color: "#64748b" }}>{t.precision}</div>
</div>
<div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(17,24,39,.8)" }}>
<div className="text-lg font-black" style={{ color: "#4ade80" }}>{protegidos}/{CIVILES.length}</div>
<div className="text-xs" style={{ color: "#64748b" }}>{t.protegidas}</div>
</div>
<div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(17,24,39,.8)" }}>
<div className="text-lg font-black" style={{ color: "#fbbf24" }}>{Math.floor(g.xp)}</div>
<div className="text-xs" style={{ color: "#64748b" }}>XP</div>
</div>
</div>
{dominadas.length > 0 && (
<>
<div className="text-xs font-bold tracking-widest mt-5 mb-2" style={{ color: "#94a3b8" }}>{t.tacticasT} · {dominadas.length}/{Object.keys(TACTICAS).length - 1}</div>
<div className="flex gap-2 flex-wrap">
{dominadas.map((id) => (
<span key={id} className="text-xs px-2.5 py-1.5 rounded-full font-bold" style={{ background: "rgba(17,24,39,.8)", color: "#e5e7eb" }}>{TACTICAS[id].emoji} {TACTICAS[id].nombre[lang]}</span>
))}
</div>
</>
)}
<div className="text-xs font-bold tracking-widest mt-5 mb-2" style={{ color: "#94a3b8" }}>{t.finalesT} · {finalesVistos.length}/{Object.keys(FINALES).length}</div>
<div className="flex gap-2 flex-wrap">
{Object.keys(FINALES).map((k) => (
<span key={k} className="text-xs px-2.5 py-1.5 rounded-full font-bold" style={{ background: "rgba(17,24,39,.8)", color: finalesVistos.includes(k) ? FINALES[k].color : "#374151" }}>
{finalesVistos.includes(k) ? FINALES[k].emoji + " " + FINALES[k].titulo[lang] : "🔒 ???"}
</span>
))}
</div>
<button onClick={reiniciar} className="w-full mt-6 mb-4 py-3.5 rounded-xl font-bold text-white text-sm" style={{ background: "linear-gradient(90deg,#059669,#2563eb)" }}>{t.deNuevo}</button>
</div>
</div>
);
}
const MISIONES = [
{ id: "m1", pago: 150, cliente: { es: "Red de revendedores", en: "Scalper network" }, brief: { es: "Que crean que los boletos oficiales se AGOTARON. El cliente vende los suyos al triple.", en: "Make them believe official tickets are SOLD OUT. The client sells his at triple price." },
aud: [{ l: { es: "Fans desesperados", en: "Desperate fans" }, p: 3 }, { l: { es: "Vecinos mayores", en: "Older neighbors" }, p: 1 }, { l: { es: "Gente del gym", en: "Gym crowd" }, p: 0 }],
tipo: [{ l: { es: "🏗️ Fabricado", en: "🏗️ Fabricated" }, p: 3 }, { l: { es: "✂️ Contexto falso", en: "✂️ False context" }, p: 2 }, { l: { es: "😏 Sátira", en: "😏 Satire" }, p: 0 }],
tec: [{ l: { es: "⏰ Urgencia", en: "⏰ Urgency" }, p: 3 }, { l: { es: "😱 Miedo", en: "😱 Fear" }, p: 2 }, { l: { es: "🥼 Autoridad", en: "🥼 Authority" }, p: 1 }],
amp: [{ l: { es: "🤖 Granja de bots", en: "🤖 Bot farm" }, p: 2, c: 30 }, { l: { es: "🤳 Comprar influencer", en: "🤳 Buy influencer" }, p: 3, c: 60 }, { l: { es: "🌱 Orgánico", en: "🌱 Organic" }, p: 1, c: 0 }],
titular: { es: "🎟️ AGOTADOS los boletos oficiales de la final — solo queda la reventa 'verificada' (link)", en: "🎟️ Official final tickets SOLD OUT — only 'verified' resale remains (link)" },
dano: { titular: { es: "Familias enteras pagaron reventa falsa que TU hiciste viral. Perdieron el dinero de la final.", en: "Whole families paid for fake resale YOU made viral. They lost their final money." }, real: { es: "Real: el panico de boletos agotados alimenta fraudes de reventa millonarios en cada evento grande.", en: "Real: sold-out panic feeds million-dollar resale scams at every major event." } }, cons: { npc: "mia", texto: { es: "Compré en la cuenta de reventa que todos compartían… era todo mi ahorro 😭", en: "I bought from the resale account everyone was sharing… it was all my savings 😭" } }, cae: "mia" },
{ id: "m2", pago: 150, cliente: { es: "Marca de suplementos", en: "Supplement brand" }, brief: { es: "Vender el 'quemador nocturno'. Necesita bata blanca y testimonios.", en: "Sell the 'overnight fat burner'. It needs a white coat and testimonials." },
aud: [{ l: { es: "Gente del gym", en: "Gym crowd" }, p: 3 }, { l: { es: "Vecinos mayores", en: "Older neighbors" }, p: 2 }, { l: { es: "Fans del futbol", en: "Soccer fans" }, p: 1 }],
tipo: [{ l: { es: "🌀 Engañoso", en: "🌀 Misleading" }, p: 3 }, { l: { es: "🏗️ Fabricado", en: "🏗️ Fabricated" }, p: 2 }, { l: { es: "⛓️ Conexión falsa", en: "⛓️ False connection" }, p: 1 }],
tec: [{ l: { es: "🥼 Falsa autoridad", en: "🥼 False authority" }, p: 3 }, { l: { es: "⏰ Urgencia", en: "⏰ Urgency" }, p: 1 }, { l: { es: "😱 Miedo", en: "😱 Fear" }, p: 0 }],
amp: [{ l: { es: "🤳 Comprar influencer", en: "🤳 Buy influencer" }, p: 3, c: 60 }, { l: { es: "🤖 Granja de bots", en: "🤖 Bot farm" }, p: 1, c: 30 }, { l: { es: "🌱 Orgánico", en: "🌱 Organic" }, p: 0, c: 0 }],
titular: { es: "💊 'Nutrióloga' revela el quemador nocturno que la industria esconde — código FINAL70", en: "💊 'Nutritionist' reveals the overnight burner the industry hides — code FINAL70" },
dano: { titular: { es: "Personas hospitalizadas por el quemador que promoviste. Un cliente lo vendio; tu pusiste la mentira.", en: "People hospitalized from the burner you promoted. A client sold it; you supplied the lie." }, real: { es: "Real: remedios milagro virales han causado intoxicaciones masivas y hasta cientos de muertes.", en: "Real: viral miracle cures have caused mass poisonings and even hundreds of deaths." } }, cons: { npc: "karla", texto: { es: "Ya pedí tres frascos del quemador ese 😍 la nutrióloga se ve bien profesional", en: "I already ordered three jars of that burner 😍 the nutritionist looks so professional" } }, cae: "karla" },
{ id: "m3", pago: 180, cliente: { es: "Anónimo", en: "Anonymous" }, brief: { es: "El cliente no vende nada. Quiere que dejen de creer en TODO. Siembra la duda.", en: "The client sells nothing. He wants them to stop believing EVERYTHING. Plant the doubt." },
aud: [{ l: { es: "Vecinos del grupo", en: "Group neighbors" }, p: 3 }, { l: { es: "Fans del futbol", en: "Soccer fans" }, p: 2 }, { l: { es: "Gente del gym", en: "Gym crowd" }, p: 0 }],
tipo: [{ l: { es: "⛓️ Conexión falsa", en: "⛓️ False connection" }, p: 3 }, { l: { es: "🔧 Manipulado", en: "🔧 Manipulated" }, p: 2 }, { l: { es: "🏗️ Fabricado", en: "🏗️ Fabricated" }, p: 1 }],
tec: [{ l: { es: "🛸 Conspiración", en: "🛸 Conspiracy" }, p: 3 }, { l: { es: "😱 Miedo", en: "😱 Fear" }, p: 2 }, { l: { es: "⏰ Urgencia", en: "⏰ Urgency" }, p: 1 }],
amp: [{ l: { es: "🤖 Granja de bots", en: "🤖 Bot farm" }, p: 3, c: 40 }, { l: { es: "🤳 Comprar influencer", en: "🤳 Buy influencer" }, p: 2, c: 60 }, { l: { es: "🌱 Orgánico", en: "🌱 Organic" }, p: 1, c: 0 }],
titular: { es: "🤫 ¿Por qué NINGÚN medio habla de esto? Piensa: ¿quién les paga? Saca tus conclusiones…", en: "🤫 Why is NO outlet talking about this? Think: who pays them? Draw your own conclusions…" },
dano: { titular: { es: "La gente ya no le cree a NADIE, ni a medicos ni a rescatistas. Tu duda sembrada paralizo a la comunidad.", en: "People no longer believe ANYONE, not doctors, not rescuers. Your planted doubt paralyzed the community." }, real: { es: "Real: sembrar desconfianza total es una tactica documentada para desmovilizar sociedades.", en: "Real: seeding total distrust is a documented tactic to demobilize societies." } }, cons: { npc: "chuy", texto: { es: "Yo ya no le creo ni al clima oficial. Todos mienten 🤷", en: "I do not even believe the official weather anymore. They all lie 🤷" } } },
{ id: "m4", pago: 200, cliente: { es: "Casa de apuestas", en: "Betting house" }, brief: { es: "Un audio 'filtrado' del DT. Con 30 segundos de entrevistas basta para clonarle la voz.", en: "A 'leaked' audio of the coach. 30 seconds of interviews are enough to clone his voice." },
aud: [{ l: { es: "Fans del futbol", en: "Soccer fans" }, p: 3 }, { l: { es: "Vecinos mayores", en: "Older neighbors" }, p: 1 }, { l: { es: "Gente del gym", en: "Gym crowd" }, p: 0 }],
tipo: [{ l: { es: "🔧 Manipulado (voz IA)", en: "🔧 Manipulated (AI voice)" }, p: 3 }, { l: { es: "🏗️ Fabricado", en: "🏗️ Fabricated" }, p: 2 }, { l: { es: "✂️ Contexto falso", en: "✂️ False context" }, p: 0 }],
tec: [{ l: { es: "😤 Provocar enojo", en: "😤 Provoke anger" }, p: 3 }, { l: { es: "😱 Miedo", en: "😱 Fear" }, p: 2 }, { l: { es: "🥼 Autoridad", en: "🥼 Authority" }, p: 1 }],
amp: [{ l: { es: "🤖 Granja de bots", en: "🤖 Bot farm" }, p: 3, c: 50 }, { l: { es: "🤳 Comprar influencer", en: "🤳 Buy influencer" }, p: 2, c: 70 }, { l: { es: "🌱 Orgánico", en: "🌱 Organic" }, p: 0, c: 0 }],
titular: { es: "🎧 FILTRADO: el DT traiciona a la afición en el vestidor — 'no merecen esta final' (AUDIO)", en: "🎧 LEAKED: the coach betrays the fans in the locker room — 'you do not deserve this final' (AUDIO)" },
dano: { titular: { es: "El audio clonado que difundiste desato peleas y disturbios entre aficionados. Hay heridos.", en: "The cloned audio you spread sparked fights and riots among fans. There are injuries." }, real: { es: "Real: audios y videos falsos con IA ya han incitado violencia colectiva en varios paises.", en: "Real: fake AI audio and video have already incited mob violence in several countries." } }, cons: { npc: "raul", texto: { es: "Todo el día se pelearon en mi taxi por el audio ese del DT 😤 la ciudad está que arde", en: "People fought in my taxi all day over that coach audio 😤 the city is on fire" } } },
{ id: "m5", pago: 300, cliente: { es: "EL GRANDE", en: "THE BIG ONE" }, brief: { es: "El encargo final: un deepfake del alcalde anunciando toque de queda. Caos total antes de la final.", en: "The final job: a mayor deepfake announcing a curfew. Total chaos before the final." },
aud: [{ l: { es: "Vecinos miedosos", en: "Fearful neighbors" }, p: 3 }, { l: { es: "Fans del futbol", en: "Soccer fans" }, p: 2 }, { l: { es: "Gente del gym", en: "Gym crowd" }, p: 1 }],
tipo: [{ l: { es: "🏗️ Fabricado (deepfake)", en: "🏗️ Fabricated (deepfake)" }, p: 3 }, { l: { es: "🔧 Manipulado", en: "🔧 Manipulated" }, p: 2 }, { l: { es: "✂️ Contexto falso", en: "✂️ False context" }, p: 0 }],
tec: [{ l: { es: "😱 Miedo", en: "😱 Fear" }, p: 3 }, { l: { es: "⏰ Urgencia", en: "⏰ Urgency" }, p: 2 }, { l: { es: "🥼 Autoridad", en: "🥼 Authority" }, p: 1 }],
amp: [{ l: { es: "💥 Todo a la vez", en: "💥 Everything at once" }, p: 3, c: 80 }, { l: { es: "🤖 Granja de bots", en: "🤖 Bot farm" }, p: 2, c: 50 }, { l: { es: "🌱 Orgánico", en: "🌱 Organic" }, p: 0, c: 0 }],
titular: { es: "🎬 VIDEO: el alcalde anuncia TOQUE DE QUEDA total desde medianoche. DIFUNDE ANTES DE QUE LO BORREN.", en: "🎬 VIDEO: the mayor announces a TOTAL CURFEW from midnight. SPREAD BEFORE IT IS DELETED." },
cons: { npc: "carmen", texto: { es: "Estamos encerrados con las despensas, mijo… ¿tú sabes algo de esto? 😰", en: "We are locked in with our groceries, sweetie… do you know anything about this? 😰" } }, cae: "carmen" },
];
const MAP_ROWS = ["                                                            ", "     # ####          ###                ### ##########      ", "   ###########      ####          ##########################", "  ###############    ##          ###########################", "  ###############               ############################", "   #############                ############################", "    ##########                 ####### #################  ##", "     ########                 ###### ################### ## ", "      ######                 ###########  ##########  ##    ", "       #####                ############   ########         ", "        ####                ###########     ######  #       ", "         #####              ##########       ####  ###      ", "          ######             ########         ##  ##### #   ", "          ########           ########             ######    ", "           ########           ######                        ", "           #########          ######            ######      ", "            #######            ####            ########     ", "            ######             ###             #########    ", "             ####               ##              #######     ", "             ###                #                  ##    #  ", "              ##                                          # ", "              #                                             "];
const colorMapa = (i) => (i < 25 ? "#2f8f5b" : i < 45 ? "#6b8f3a" : i < 65 ? "#b45309" : i < 85 ? "#dc2626" : "#ff1f1f");
const CENTROS = [[100, 45], [145, 150], [320, 35], [470, 50], [510, 165]];
function Radiografia({ t, lang, casoId, cerrar }) {
const caso = CASOS.find((c) => c.id === casoId);
if (!caso || !caso.fake) return null;
return (
<div className="absolute inset-0 z-50 flex items-center px-5" style={{ background: "rgba(4,6,10,.92)", backdropFilter: "blur(3px)" }} onClick={cerrar}>
<div className="w-full rounded-2xl p-5" style={{ background: "#0f1621", border: "1px solid #0e7490" }} onClick={(e) => e.stopPropagation()}>
<div className="text-xs font-black tracking-widest" style={{ color: "#38bdf8" }}>{t.radioT}</div>
<div className="mt-3 rounded-xl px-3 py-2.5" style={{ background: "#111827" }}>
<div className="text-xs" style={{ color: "#64748b" }}>{t.radioTipo}</div>
<div className="text-sm font-bold text-white mt-0.5">{caso.tipos.map((x) => tipoLabel(x, t)).join(" · ")}</div>
</div>
<div className="mt-2 rounded-xl px-3 py-2.5" style={{ background: "#111827" }}>
<div className="text-xs" style={{ color: "#64748b" }}>{t.radioTec}</div>
<div className="text-sm font-bold text-white mt-0.5">{TACTICAS[caso.tacticaId].emoji} {TACTICAS[caso.tacticaId].nombre[lang]}</div>
</div>
<div className="mt-2 rounded-xl px-3 py-2.5" style={{ background: "#111827" }}>
<div className="text-xs" style={{ color: "#64748b" }}>{t.radioMotiv}</div>
<div className="text-sm font-bold text-white mt-0.5">{motivLabel(caso.motiv, t)}</div>
</div>
<p className="text-xs mt-3 italic" style={{ color: "#94a3b8" }}>{t.radioNota}</p>
<button onClick={cerrar} className="w-full mt-3 py-3 rounded-xl font-bold text-white text-sm" style={{ background: "linear-gradient(90deg,#059669,#2563eb)" }}>{t.continuar}</button>
</div>
</div>
);
}
function Sandwich({ t, listo }) {
const [ord, setOrd] = useState([]);
const [mal, setMal] = useState(false);
const esperado = ["hecho", "mito", "falacia", "hecho2"];
const cartas = [{ k: "mito", l: t.swMito, e: "⚠️" }, { k: "hecho2", l: t.swHecho2, e: "✅" }, { k: "hecho", l: t.swHecho, e: "🟦" }, { k: "falacia", l: t.swFalacia, e: "🧠" }];
const toca = (k) => {
if (k !== esperado[ord.length]) { setMal(true); setOrd([]); setTimeout(() => setMal(false), 1400); return; }
const n = [...ord, k];
setOrd(n);
if (n.length === 4) setTimeout(listo, 500);
};
return (
<div className="mt-3">
<div className="text-xs font-bold mb-2" style={{ color: "#fbbf24" }}>{t.swTitulo}</div>
<div className="grid grid-cols-2 gap-2">
{cartas.map((c) => {
const puesto = ord.includes(c.k);
return <button key={c.k} onClick={() => !puesto && toca(c.k)} className="py-2.5 rounded-xl text-xs font-black" style={{ background: puesto ? "#052e16" : "#292524", color: puesto ? "#4ade80" : "#e7e5e4", border: "1px solid " + (puesto ? "#166534" : "#57534e"), opacity: puesto ? 0.9 : 1 }}>{puesto ? (ord.indexOf(c.k) + 1) + "º ✓ " : ""}{c.e} {c.l}</button>;
})}
</div>
{mal && <div className="text-xs font-bold mt-2" style={{ color: "#f87171" }}>{t.swMal}</div>}
</div>
);
}
function Spectra({ t, lang, g, elegir, publicar, traicionar }) {
const [conf, setConf] = useState(false);
const m = MISIONES[g.misionIdx];
const sel = g.misionSel;
const completo = m && sel.aud != null && sel.tipo != null && sel.tec != null && sel.amp != null;
const costo = completo ? m.amp[sel.amp].c : 0;
const regionOf = (x, y) => (x <= 25 ? (y <= 8 ? 0 : 1) : x <= 38 ? 2 : y <= 11 ? 3 : 4);
const offsets = [-6, 8, -3, 5, -8];
const Fila = ({ titulo, campo, ops }) => (
<div className="mb-2">
<div className="text-xs font-bold mb-1" style={{ color: "#a78bfa" }}>{titulo}</div>
<div className="flex gap-1.5 flex-wrap">
{ops.map((o, i) => (
<button key={i} onClick={() => elegir(campo, i)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold" style={{ background: sel[campo] === i ? "#4c1d95" : "#1c1917", color: sel[campo] === i ? "#e9d5ff" : "#a8a29e", border: "1px solid " + (sel[campo] === i ? "#7c3aed" : "#44403c") }}>
{o.l[lang]}{o.c != null ? " ⧫" + o.c : ""}
</button>
))}
</div>
</div>
);
return (
<div className="h-full overflow-y-auto" style={{ background: "#0a0508", color: "#e7e5e4", fontFamily: "ui-monospace, Menlo, monospace" }}>
<div className="px-4 pt-3 pb-2 flex items-center justify-between">
<div>
<div className="text-sm font-black tracking-widest" style={{ color: "#a78bfa" }}>🕸️ SPECTRA</div>
<div className="text-xs" style={{ color: "#57534e" }}>{NPCS.arq.nombre[lang]} → {lang === "es" ? "tú" : "you"}</div>
</div>
<div className="text-lg font-black" style={{ color: "#fbbf24" }}>⧫ {g.koin}</div>
</div>
<div className="mx-3 rounded-xl overflow-hidden relative" style={{ background: "#03060b", border: "1px solid #450a0a" }}>
<style>{`@keyframes brote { 0% { transform: scale(.3); opacity: .85; } 100% { transform: scale(2.4); opacity: 0; } }`}</style>
<svg viewBox="0 0 600 230" className="w-full block">
{MAP_ROWS.map((row, y) => row.split("").map((ch, x) => {
if (ch !== "#") return null;
const nv = clamp(g.infodemia + offsets[regionOf(x, y)], 0, 100);
return <circle key={x + "-" + y} cx={x * 10 + 5} cy={y * 10 + 8} r={3} fill={colorMapa(nv)} opacity={0.85} />;
}))}
{g.infodemia > 35 && CENTROS.slice(0, 1 + Math.floor(g.infodemia / 25)).map(([cx, cy], i) => (
<circle key={i} cx={cx} cy={cy} r="20" fill="none" stroke="#ff1f1f" strokeWidth="2" style={{ animation: "brote 1.6s ease-out infinite", transformBox: "fill-box", transformOrigin: "center" }} />
))}
</svg>
<div className="px-3 pb-2 flex items-center gap-2" style={{ fontSize: 10 }}>
<span style={{ color: "#f87171", fontWeight: 800 }}>🦠 INFODEMIA</span>
<div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: "#1c1917" }}>
<div className="h-full rounded-full transition-all" style={{ width: g.infodemia + "%", background: "linear-gradient(90deg,#dc2626,#ff1f1f)", boxShadow: "0 0 6px #ff1f1f" }} />
</div>
<span style={{ color: "#f87171", fontWeight: 800 }}>{g.infodemia.toFixed(0)}%</span>
</div>
</div>
{g.ultimoRes && (
<div className="mx-3 mt-2 rounded-xl px-3 py-2 text-xs font-bold" style={{ background: g.ultimoRes.tier === "fallo" ? "#2a1215" : "#171528", color: g.ultimoRes.tier === "fallo" ? "#fca5a5" : "#c4b5fd", border: "1px solid " + (g.ultimoRes.tier === "fallo" ? "#7f1d1d" : "#4c1d95") }}>
{g.ultimoRes.tier === "exito" ? t.spExito : g.ultimoRes.tier === "medio" ? t.spMedio : t.spFallo}
</div>
)}
{m ? (
<div className="mx-3 mt-3 rounded-xl p-3" style={{ background: "#120a14", border: "1px solid #4c1d95" }}>
<div className="text-xs font-black tracking-widest" style={{ color: "#a78bfa" }}>🎭 {t.spMision} {g.misionIdx + 1}/{MISIONES.length}</div>
<div className="text-xs mt-1" style={{ color: "#78716c" }}>{t.spCliente}: <span style={{ color: "#e7e5e4" }}>{m.cliente[lang]}</span></div>
<p className="text-sm mt-1.5 mb-3 leading-snug" style={{ color: "#d6d3d1" }}>{m.brief[lang]}</p>
<Fila titulo={t.spAud} campo="aud" ops={m.aud} />
<Fila titulo={t.spTipoL} campo="tipo" ops={m.tipo} />
<Fila titulo={t.spTecL} campo="tec" ops={m.tec} />
<Fila titulo={t.spAmp} campo="amp" ops={m.amp} />
<button onClick={publicar} disabled={!completo || g.koin < costo} className="w-full mt-2 py-3 rounded-xl text-sm font-black text-white" style={{ background: completo && g.koin >= costo ? "linear-gradient(90deg,#7c3aed,#dc2626)" : "#292524", opacity: completo && g.koin >= costo ? 1 : 0.5 }}>{t.spPublicar}{completo ? " (−⧫" + costo + ")" : ""}</button>
</div>
) : (
<div className="mx-3 mt-3 rounded-xl p-3 text-sm" style={{ background: "#120a14", border: "1px solid #4c1d95", color: "#d6d3d1" }}>{t.spFin}</div>
)}
{g.misionIdx >= 3 && !g.traicion && (
<div className="mx-3 mt-3 mb-6">
{!conf ? (
<button onClick={() => setConf(true)} className="w-full py-3 rounded-xl text-xs font-black" style={{ background: "#0c1a26", color: "#38bdf8", border: "1px dashed #0e7490" }}>{t.spFiltrar}</button>
) : (
<div className="rounded-xl p-3" style={{ background: "#0c1a26", border: "1px solid #0e7490" }}>
<p className="text-xs font-bold mb-2" style={{ color: "#7dd3fc" }}>{t.spFiltrarConf}</p>
<div className="flex gap-2">
<button onClick={traicionar} className="flex-1 py-2.5 rounded-xl text-xs font-black text-white" style={{ background: "linear-gradient(90deg,#0e7490,#059669)" }}>📤 {lang === "es" ? "Sí, filtrar" : "Yes, leak it"}</button>
<button onClick={() => setConf(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold" style={{ background: "#1c1917", color: "#a8a29e" }}>{t.cancelar}</button>
</div>
</div>
)}
</div>
)}
<div className="h-6" />
</div>
);
}