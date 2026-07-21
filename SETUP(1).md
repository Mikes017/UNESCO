# SETUP — Desplegar VERIFIED en GitHub Pages (para Claude Code)

Hola Claude 👋 Eres un agente de terminal. Tu tarea es montar el juego **VERIFIED**
(un juego de alfabetización mediática hecho en React) en un proyecto Vite y dejarlo
listo para publicar en GitHub Pages. Sigue los pasos en orden. Detente y avisa al
usuario en los puntos marcados con 🛑 (necesitan info o una acción suya).

**Datos del usuario ya fijados:**
- Usuario de GitHub: `Mikes017`
- Nombre del repositorio: `UNESCO`
- URL final del juego: `https://Mikes017.github.io/UNESCO/`

---

## Contexto del proyecto

- Es una app de **React** de un solo componente (usa `useState`, `useEffect`, `useRef`).
- Usa **clases de Tailwind CSS** para todo el estilado (no CSS aparte).
- El código fuente está en el archivo `verified_v4.jsx` que el usuario tiene a la mano.
  - Su primera línea es: `import React, { useState, useEffect, useRef } from "react";`
  - Exporta por defecto: `export default function Verified() { ... }`
- El juego es grande (~140 KB). En Vite NO hay problema de tamaño (a diferencia de
  otros entornos). Debe correr completo.
- Tiene soporte para imágenes reales mediante un bloque `IMG` al inicio del archivo;
  por defecto está vacío (`const IMG = { npcs: {}, casos: {}, historias: {} };`) y usa
  emojis como respaldo, así que funciona aunque no haya imágenes todavía.

---

## 🛑 Antes de empezar — confirma esto con el usuario

1. Verifica que tiene instalados **Node.js** (v18+) y **Git**:
   ```bash
   node -v && npm -v && git --version
   ```
   Si algo falta, dile que lo instale antes de continuar.
2. Que coloque el archivo `verified_v4.jsx` en el directorio donde vas a trabajar
   (o dile la ruta donde está para que lo copies).

---

## Paso 1 — Crear el proyecto Vite

```bash
npm create vite@latest UNESCO -- --template react
cd UNESCO
npm install
```

## Paso 2 — Instalar y configurar Tailwind (v3)

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

Edita `tailwind.config.js` para que `content` sea:

```js
content: ["./index.html", "./src/**/*.{js,jsx}"],
```

Reemplaza TODO el contenido de `src/index.css` por exactamente esto:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Paso 3 — Colocar el juego

- Copia el archivo `verified_v4.jsx` del usuario a `src/App.jsx` (reemplaza el que
  generó Vite).
- Verifica que la PRIMERA línea de `src/App.jsx` sea:
  ```js
  import React, { useState, useEffect, useRef } from "react";
  ```
  Si el import está incompleto, complétalo.
- Asegúrate de que `src/main.jsx` quede así:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## Paso 4 — Configurar el `base` (CRÍTICO para GitHub Pages)

Edita `vite.config.js` y agrega la propiedad `base`. Si esto queda mal, la página
publicada sale EN BLANCO. Debe quedar EXACTAMENTE así:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/UNESCO/',
})
```

## Paso 5 — Agregar gh-pages y scripts

```bash
npm install -D gh-pages
```

En `package.json`, dentro de `"scripts"`, agrega `predeploy` y `deploy` (deja los que
ya existen):

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

## Paso 6 — Probar localmente ANTES de publicar

```bash
npm run build
```

- Si el build falla, LEE el error y arréglalo (lo más probable: un import faltante o
  una comilla suelta en `App.jsx`). No continúes hasta que `npm run build` termine sin
  errores.
- Opcional: `npm run preview` para ver el resultado del build en local.

## Paso 7 — 🛑 Crear el repo en GitHub

Pídele al usuario que:
1. Cree un repositorio **público** en GitHub llamado EXACTAMENTE `UNESCO`.
2. NO agregue README, .gitignore ni licencia (Vite ya trae `.gitignore`).
3. Te confirme cuando esté creado.

## Paso 8 — Subir el código

```bash
git init
git add .
git commit -m "VERIFIED: primera version en Vite"
git branch -M main
git remote add origin https://github.com/Mikes017/UNESCO.git
git push -u origin main
```

Si el push pide autenticación, avisa al usuario (quizá necesite un Personal Access
Token o tener configurado el CLI de GitHub / SSH).

## Paso 9 — Publicar en GitHub Pages

```bash
npm run deploy
```

Esto crea/actualiza la rama `gh-pages` con el juego compilado.

## Paso 10 — 🛑 Activar Pages en GitHub

Pídele al usuario que vaya a su repo en GitHub → **Settings** → **Pages** y configure:
- **Source:** Deploy from a branch
- **Branch:** `gh-pages`  ·  Carpeta: `/ (root)`
- Guardar.

En 1-2 minutos el juego estará vivo en:

```
https://Mikes017.github.io/UNESCO/
```

Dale ese enlace al usuario. Ese es el que usará en su reporte y video.

---

## Imágenes de uso libre (opcional, después)

El usuario meterá imágenes libres más adelante. Cuando quiera:
1. Crear la carpeta `public/img/` y poner ahí las imágenes.
2. En `src/App.jsx`, en el bloque `IMG` de arriba, agregar rutas CON el base path:
   ```js
   const IMG = { npcs: {}, casos: {}, historias: {} };
   IMG.npcs.carmen = "/UNESCO/img/carmen.jpg";
   IMG.casos.c3   = "/UNESCO/img/boletos.jpg";
   ```
   (Las claves de `npcs` y `casos` deben coincidir con los IDs que ya existen en el
   archivo; lo demás usa emojis automáticamente.)

## Actualizar el juego más adelante

Cada vez que haya cambios:

```bash
git add .
git commit -m "descripcion del cambio"
git push
npm run deploy
```

---

## Solución de problemas

- **Página en blanco al abrir el enlace:** el `base` en `vite.config.js` NO coincide
  con el nombre del repo. Debe ser `/UNESCO/` exacto (con diagonales). Corrige,
  `npm run deploy` de nuevo.
- **Las imágenes no cargan:** las rutas en `IMG` deben empezar con `/UNESCO/`.
- **`npm run build` falla:** revisa `src/App.jsx` — casi siempre es un import
  incompleto en la línea 1 o un carácter suelto. Lee el mensaje de error, señala la
  línea y corrígela.
- **El push falla por autenticación:** el usuario necesita configurar acceso (token,
  SSH o GitHub CLI). Avísale.
- **404 en el enlace:** GitHub Pages tarda 1-2 min tras el primer deploy; también
  verifica que en Settings → Pages la rama sea `gh-pages`.

---

## Resumen de lo que debes lograr

✅ Proyecto Vite + React + Tailwind funcionando
✅ `verified_v4.jsx` como `src/App.jsx`, `npm run build` sin errores
✅ `base: '/UNESCO/'` en `vite.config.js`
✅ Código en GitHub (rama `main`) y publicado (rama `gh-pages`)
✅ Enlace público funcionando: `https://Mikes017.github.io/UNESCO/`
