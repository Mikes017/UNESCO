# 🎬 VERIFIED — Guía de producción del video promocional (Rotato)

> Documento de trabajo. Objetivo: un promo de **75 segundos** que explique en qué
> consiste la app, cómo se juega y por qué importa, montado en Rotato con mockup
> 3D de teléfono.
>
> Orden de trabajo: **§1 preparar → §2 grabar (una sola partida) → §3 lista de
> capturas → §4 guion → §5 montaje en Rotato → §6 copy → §7 checklist**.

---

## 0. Antes de empezar

| Cosa | Detalle |
|---|---|
| **Rotato** | Hay versión **web en [app.rotato.app](https://app.rotato.app/)** que corre desde Linux — ver §0.1 antes de decidir. La app nativa es solo macOS. |
| **Grabador (Linux)** | OBS Studio (recomendado, permite fijar región exacta) · o el grabador de GNOME `Ctrl+Alt+Shift+R` · o Kooha |
| **Grabador (Mac)** | Rotato Screen Recorder (gratis, del mismo autor — se integra directo) |
| **Duración objetivo** | 75 s · formato 16:9 (1920×1080) para YouTube/presentación + un recorte 9:16 para redes |
| **Idioma** | Graba **todo en español**. Si necesitas versión EN, regraba solo las tomas con texto legible (ver §7). |

### 0.1 ¿Rotato web o Rotato para Mac?

Rotato tiene dos versiones y **la web sí corre en Linux**:

| | Rotato web (`app.rotato.app`) | Rotato para Mac |
|---|---|---|
| Plataforma | Cualquier navegador | Solo macOS |
| Estado | **Beta — sin paridad completa** | Producto principal |
| Mirroring del iPhone por USB | ❌ | ✔ (irrelevante aquí: tu app corre en navegador) |
| Simulación de lente DSLR | ❌ | ✔ |
| Lo que necesita esta guía | **verificar** ↓ | ✔ |

Ninguna fuente publica la lista exacta de lo que falta en la beta web. Así que
antes de montar las 18 tomas, haz esta **prueba de 5 minutos**:

1. Abre `app.rotato.app`
2. Arrastra **un** clip de video sobre el mockup
3. Crea **dos keyframes de cámara** en el timeline

Si esas dos cosas funcionan, toda la §5 te sirve tal cual desde Linux. Si la web
solo acepta imágenes fijas, necesitas Mac o el Anexo del final.

**Dispositivo a elegir en Rotato: un Android (Pixel), no un iPhone.**
La app ya dibuja su propia barra de estado arriba y la barra de navegación
`◁ ○ ▢` abajo — que es lenguaje visual Android. Con un iPhone chocaría contra el
Dynamic Island y se vería como error. Con un Pixel, todo lee como nativo.

---

## 1. Preparar la app para grabar

### 1.1 Levantar la app

```bash
cd ~/Documents/UNESCO
npm run dev
# → http://localhost:5173/UNESCO/
```

### 1.2 Fijar el viewport exacto

El "teléfono" de la app mide **392 × 852 px** — casi idéntico a un Pixel/iPhone
15 Pro (393×852). Grabar a esa medida exacta te da un mockup perfecto sin escalar.

1. Abre Chrome → `F12` → icono de **Toggle device toolbar** (`Ctrl+Shift+M`)
2. Elige **Responsive** y escribe a mano: **392 × 852**
3. En el menú de tres puntos del device toolbar → **Add device pixel ratio** → ponlo en **3**
   → tu grabación saldrá a **1176 × 2556 px**, resolución de sobra para Rotato
4. Zoom del navegador al **100 %** (si no, el DPR miente)

### 1.3 Quitar el marco propio de la app (importante)

La app dibuja su propio borde redondeado de 36 px y una sombra tipo carcasa. Si
lo dejas, Rotato le añade **un segundo marco encima** y se ve mal. Pega esto en
la consola de DevTools antes de grabar (es solo visual, no toca el código):

```js
const s = document.createElement('style');
s.textContent = 'div[style*="852px"]{border-radius:0!important;box-shadow:none!important}';
document.head.appendChild(s);
```

> Se usa `!important` desde una hoja de estilo a propósito: la app re-renderiza
> cada segundo y sobrescribiría un estilo inline. Para revertir, recarga la página.

Si prefieres no tocar nada, dime y te agrego un flag `?rec=1` en el código que
haga esto solo — así queda reproducible y no dependes de la consola.

### 1.4 Región de grabación

En OBS: fuente **Captura de ventana** → recorta a los 392×852 (×3 = 1176×2556)
del contenido. Verifica que **no entre** ni un pixel del fondo `#0b0d12` de la
página ni de la barra del navegador. Graba a **60 fps** — Rotato interpola mejor
y los movimientos de cámara quedan sedosos.

---

## 2. Orden de captura: todo en UNA sola partida

La app no tiene guardado, así que si te sales pierdes el progreso. Estos son los
desbloqueos reales del código, para que planees una sola corrida:

| Se desbloquea | Requisito |
|---|---|
| **WhatsUp** | disponible desde el inicio |
| **Bitácora** 📓 | después de **2 decisiones** sobre casos |
| **Noticias** 🗞️ | después de **4 decisiones** |
| **Cadenas + Verificador** | a partir de **nivel 2 = 60 XP** |
| Nivel 3 🕵️ | 150 XP · Nivel 4 🛡️ 280 XP · Nivel 5 🏆 450 XP |

**Cómo subir a nivel 2 rápido** (para llegar a las cadenas): reportar bien un
fake da buen XP, dar like a un post legítimo da +8, y responder bien en el chat
+10/+15. Los primeros casos salen en este orden: `c1` (falso) → `c2` (real) →
`c3` (falso) → `c4` (real). Reporta los falsos, dale like a los reales.

**Corrida recomendada, grabando sin cortar:**

1. Recarga limpia → **splash** → **lock** → **home + tutorial de Beto**
2. Tour del Home completo (5 burbujas) → cae en **WhatsUp**
3. Vuelve al **Home**, entra a **Instagrama**
4. Caso `c1`: toca el **nombre del autor** → perfil → cierra
5. Caso `c1`: toca la **imagen** → hoja con fecha de subida + búsqueda inversa
6. Caso `c1`: **⋯ → reportar → elegir tipo de engaño**
7. Dale like a `c2` (legítimo) → ya vas por nivel 2
8. Abre **Bitácora** (ya desbloqueada) → mapa de frentes + fuentes
9. Vuelve a **WhatsUp**, espera la **cadena** → **Verificador de 3 pasos**
10. Espera la segunda cadena hasta que salga el **Piolín 🐤**
11. Deja vencer una pregunta de la familia a propósito → **Consecuencia**

Luego, en pasadas sueltas, cazas: crisis/Protocolo Alto y pantalla Final.

---

## 3. Lista de capturas

Nómbralas exactamente así — el guion de §4 las referencia por ID.

| ID | Pantalla | Tipo | Dur. | Qué debe verse |
|---|---|---|---|---|
| `C01` | Splash | video | 3 s | Logo 🛡️ + "Detecta. Verifica. Protege." + crédito UNESCO abajo |
| `C02` | Lock screen | video | 4 s | Notificación de Tía Carmen con el fake del banco central |
| `C03` | Home | video | 5 s | Las 2 barras (infodemia / credibilidad del Arquitecto) + grid de apps |
| `C04` | Tutorial Home | video | 4 s | Una burbuja de Beto con el halo verde sobre las barras |
| `C05` | Feed Instagrama | video | 6 s | Scroll lento, que se lea el handle y la **fecha de subida** del post |
| `C06` | Perfil del autor | video | 5 s | Perfil de `n0ticias24_oficial` — bio, seguidores, botón reportar |
| `C07` | Hoja de imagen | video | 5 s | 📅 Subido + búsqueda inversa + detector de IA |
| `C08` | Menú de reporte | video | 5 s | Los 8 tipos de engaño (contexto, impostor, fabricado…) |
| `C09` | WhatsUp — cadena | video | 5 s | Burbuja ámbar "🔗 Cadena reenviada" + botón "🔎 Verificar con Beto" |
| `C10` | **Verificador** | video | 10 s | Los 3 pasos: La fuente → La intención → La acción, con la barra de progreso |
| `C11` | Verificador — error | video | 4 s | La tarjeta roja "⚠️ Ojo con eso" con la lección |
| `C12` | Piolín 🐤 | video | 5 s | Beto frenándote: "verificar no es desconfiar de TODO" |
| `C13` | Bitácora | video | 6 s | Mapa de frentes / constelación + rango + lecciones de campo |
| `C14` | Bitácora — fuentes | **foto** | — | El recuadro "📚 Fuentes de Beto" con las citas APA |
| `C15` | Consecuencia | video | 4 s | La tarjeta de qué le pasó al familiar |
| `C16` | Crisis / Protocolo | video | 4 s | El teléfono con el resplandor **rojo** alrededor |
| `C17` | Final | video | 4 s | Pantalla de final (idealmente el legendario 🥇) |
| `C18` | Feed limpio | **foto** | — | Para el plano final estático con el logo |

**Regla de oro al grabar:** deja **1 segundo quieto al inicio y al final** de cada
toma. Rotato necesita ese margen para entrar y salir del movimiento de cámara sin
que se vea un tirón.

---

## 4. Guion del video (75 s)

### ACTO 1 — El problema (0:00 – 0:14)

| Tiempo | Toma | Cámara en Rotato | Texto en pantalla |
|---|---|---|---|
| 0:00–0:04 | `C01` | Teléfono lejos y ligeramente girado, **push-in** lento hasta frente | — |
| 0:04–0:09 | `C02` | Inclinación suave a la izquierda, cámara baja | *"Cada día tu familia recibe algo falso."* |
| 0:09–0:14 | `C02` (cont.) | Zoom cerrado a la notificación | *"¿Y si aprender a detectarlo fuera un juego?"* |

### ACTO 2 — El método (0:14 – 0:50)

| Tiempo | Toma | Cámara en Rotato | Texto en pantalla |
|---|---|---|---|
| 0:14–0:19 | `C03` | **Órbita** de 30° alrededor del teléfono | *"VERIFIED"* (logo) |
| 0:19–0:23 | `C04` | Estático, ligero flotar | *"Beto te enseña, no te sermonea."* |
| 0:23–0:29 | `C05` | Teléfono inclinado, **paneo vertical** acompañando el scroll | *"Un feed. Unos posts verdaderos, otros no."* |
| 0:29–0:34 | `C06` + `C07` | **Dos teléfonos** en escena, uno detrás del otro | *"Revisa la cuenta. Revisa la imagen. Revisa la fecha."* |
| 0:34–0:39 | `C08` | Push-in al menú | *"No basta con reportar: hay que saber QUÉ tipo de engaño es."* |
| 0:39–0:44 | `C09` | Rotación rápida de entrada | *"Y entonces llega la cadena al grupo familiar."* |
| 0:44–0:50 | `C10` | **Frente, quieto** — que se lea | *"Fuente → Intención → Acción."* |

> `C10` es el plano héroe del video. No le pongas movimiento de cámara: aquí el
> espectador tiene que **leer**. Todo lo demás puede girar; este no.

### ACTO 3 — El giro y el impacto (0:50 – 1:15)

| Tiempo | Toma | Cámara en Rotato | Texto en pantalla |
|---|---|---|---|
| 0:50–0:55 | `C12` | Inclinación juguetona, más luz | *"Pero no todo es un engaño."* |
| 0:55–0:58 | `C12` (cont.) | — | *"Verificar no es desconfiar de todo."* |
| 0:58–1:03 | `C15` + `C16` | Corte rápido, cámara nerviosa | *"Si tardas, deciden solas. Y hay consecuencias."* |
| 1:03–1:09 | `C13` + `C14` | Órbita lenta, cámara alta | *"Basado en el marco MIL de la UNESCO."* |
| 1:09–1:15 | `C18` estático | Teléfono al centro, fondo degradado | **Logo + "Detecta. Verifica. Protege."** + URL |

---

## 5. Montaje en Rotato, paso a paso

> Los nombres de los paneles cambian un poco entre versiones de Rotato. Van
> descritos por función; si no ves el rótulo exacto, busca el panel que hace eso.

### 5.1 Configuración del proyecto (una sola vez)

1. **Nuevo proyecto** → elige el mockup **Pixel / Android** (no iPhone, ver §1)
2. Panel de **pantalla / screen**: arrastra tu `C01.mp4` encima del dispositivo
3. **Background**: degradado oscuro. Sugerencia que combina con la paleta de la app:
   `#0f172a → #1e1b4b → #0f2e22` (los mismos colores del splash)
4. **Sombra**: suave, difusa, desplazada abajo. Sin sombra el teléfono flota raro
5. **Reflejo / glare de pantalla**: bájalo al mínimo. La app tiene mucho texto pequeño y el brillo se lo come
6. **Lienzo / canvas**: 1920×1080

### 5.2 Receta por toma

Repite esto para cada `Cxx`:

1. Arrastra el clip a la pantalla del dispositivo
2. Ve al **inicio** del timeline → coloca la cámara donde arranca el plano → **crea keyframe**
3. Ve al **final** → mueve la cámara al destino → **keyframe**
4. En la curva de animación elige **ease-in-out** (nunca lineal: se ve robótico)
5. Exporta esa toma sola y pásala a tu editor de video

### 5.3 Los movimientos que vas a usar

| Movimiento | Cómo armarlo | Para qué tomas |
|---|---|---|
| **Push-in** | keyframe lejos → keyframe cerca, sin rotar | `C01`, `C08` |
| **Órbita** | rota el escenario ~30° en Y entre los dos keyframes | `C03`, `C13` |
| **Inclinación** | rotación pequeña en X + Z, muy sutil | `C02`, `C12` |
| **Frente fijo** | los dos keyframes iguales, solo un flotar levemente | `C10` ← el héroe |
| **Dos dispositivos** | duplica el device en la escena, escalona en profundidad | `C06`+`C07` |

Si Rotato trae **presets de animación** listos, úsalos como punto de partida y
bájales la intensidad — casi todos vienen demasiado agresivos para un promo donde
hay que leer texto.

### 5.4 Exportación

- **MP4 H.264**, 1920×1080, 60 fps → para el corte final
- **MOV con canal alfa (transparente)** → si vas a componer el teléfono sobre otro
  fondo o sobre las tarjetas de texto en tu editor. Es la opción más flexible.
- Si algo se ve pixelado, revisa que el DPR de §1.2 estuviera en 3

---

## 6. Copy listo para pegar

**Textos en pantalla** (en orden de aparición):

```
Cada día tu familia recibe algo falso.
¿Y si aprender a detectarlo fuera un juego?
Beto te enseña, no te sermonea.
Un feed. Unos posts verdaderos, otros no.
Revisa la cuenta. Revisa la imagen. Revisa la fecha.
No basta con reportar: hay que saber QUÉ tipo de engaño es.
Y entonces llega la cadena al grupo familiar.
Fuente → Intención → Acción.
Pero no todo es un engaño.
Verificar no es desconfiar de todo.
Si tardas, deciden solas. Y hay consecuencias.
Basado en el marco MIL de la UNESCO.
VERIFIED · Detecta. Verifica. Protege.
```

**Descripción para YouTube / redes:**

> VERIFIED es un juego de alfabetización mediática donde aprendes a desenmascarar
> la desinformación… combatiéndola. Revisas perfiles, haces búsqueda inversa,
> detectas imágenes generadas por IA y proteges a tu familia de las cadenas de
> WhatsUp — con un árbol de verificación de tres pasos: fuente, intención, acción.
> Basado en el marco de Alfabetización Mediática e Informacional (MIL) de la
> UNESCO y en la teoría de inoculación.

**Sobre el crédito UNESCO:** el texto correcto es *"basado en el marco MIL de la
UNESCO"*, nunca *"avalado por"* ni *"en colaboración con"*. La app ya lo maneja
bien en la Bitácora (con las citas en APA); el video debe mantener esa misma
precisión.

**Música:** algo con tensión que resuelva en esperanza. El giro musical debe caer
en el minuto **0:50**, justo con el Piolín 🐤 — ahí es donde el video pasa de
"esto da miedo" a "esto se puede aprender". Usa una librería libre de regalías.

---

## 7. Checklist final

**Antes de grabar**
- [ ] Viewport en 392×852, DPR 3, zoom del navegador al 100 %
- [ ] Snippet de §1.3 pegado (sin doble marco)
- [ ] Idioma en español, confirmado en el selector
- [ ] OBS a 60 fps, región recortada sin fondo del navegador
- [ ] Notificaciones del sistema silenciadas

**Al grabar**
- [ ] 1 s quieto al inicio y al final de cada toma
- [ ] Movimientos de dedo/cursor lentos — a velocidad normal se ven nerviosos
- [ ] Las 18 capturas de §3, con sus nombres `C01`…`C18`

**En Rotato**
- [ ] Mockup Android, no iPhone
- [ ] Glare de pantalla al mínimo
- [ ] `C10` sin movimiento de cámara
- [ ] Todas las curvas en ease-in-out

**Antes de publicar**
- [ ] El texto se lee en un celular (haz la prueba en pantalla chica)
- [ ] El crédito UNESCO dice "basado en", no "avalado por"
- [ ] Recorte 9:16 hecho para redes
- [ ] Versión EN: solo hay que regrabar las tomas con texto legible
      (`C01`, `C02`, `C05`, `C08`, `C10`, `C12`, `C13`) — las demás sirven igual

---

## Anexo — Si la beta web no alcanza y no tienes Mac

Primero agota la ruta fácil: la **prueba de 5 minutos de §0.1**. Si Rotato web
acepta video y keyframes de cámara, no necesitas nada de este anexo.

Si no alcanza, se puede aproximar el montaje 3D desde Linux:

- **Blender** — importa la grabación como textura sobre un plano, añade un modelo
  de teléfono y anima la cámara. Es más trabajo, pero da control total y los
  mismos movimientos de §5.3.
- **Kdenlive / DaVinci Resolve** (ambos corren en Linux) — con transformaciones 3D
  básicas y una imagen PNG de marco de teléfono. No queda tan pulido, pero para
  75 segundos con cortes rápidos aguanta bien.
- **Plan B honesto** — un promo plano, sin mockup 3D, con buenas transiciones y
  tipografía cuidada. Para un jurado, la claridad del mensaje pesa más que el
  brillo del mockup.
