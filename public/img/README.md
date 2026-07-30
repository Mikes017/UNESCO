# 🖼️ Imágenes de VERIFIED — qué archivo va en cada lugar

Las rutas **ya están puestas en el código**. Aquí solo hay que dejar caer los
archivos con el nombre exacto de la tabla. No hay que editar nada en `src/`.

Mientras un archivo no exista, la app **no se rompe**: usa el emoji y el
degradado de color que ya trae. Se puede llenar de a poco, en cualquier orden.

## Reglas

| | |
|---|---|
| Formato | `.jpg` (obligatorio — las rutas lo esperan) |
| Perfiles `npcs/` | cuadrado, 400×400 px basta |
| Portadas `portadas/` | ancho, 1200×400 px |
| Publicaciones `casos/` | cuadrado, 1080×1080 px |
| Historias `historias/` | vertical, 1080×1920 px |
| Peso | comprimir a <150 kB cada una (son para móvil) |

## De dónde bajarlas (libres de uso, sin atribución obligatoria)

- **Pexels** — https://www.pexels.com · licencia Pexels, uso libre
- **Unsplash** — https://unsplash.com · licencia Unsplash, uso libre
- **Pixabay** — https://pixabay.com · contenido CC0
- **Wikimedia Commons** — https://commons.wikimedia.org · filtrar por CC0 / dominio público

> ⚠️ **Dos cuidados, que son parte del mensaje del juego:**
> 1. **Nada de personas reales identificables** en las cuentas falsas (`n0ticias`,
>    `boletos`, `enfermera`, `ovni`, `veci`, `troll`, `sombra`, `arq`). Usar siluetas,
>    objetos o rostros no reconocibles. Poner la cara de alguien real en una cuenta
>    de estafa es exactamente el daño que enseñamos a evitar.
> 2. **Nada de marcas ni logos reales**, ni de medios de comunicación reales.

## `public/img/npcs/` — fotos de perfil (25)

| Archivo | Cuenta | Qué buscar |
|---|---|---|
| `carmen.jpg` | Tía Carmen · @carmen_74 | señora mayor 70+ sonriendo, retrato cálido |
| `mama.jpg` | Mamá · @mama.rosa | mujer 45-55 con uniforme de enfermera, retrato |
| `lupe.jpg` | Doña Lupe · @lupe.vecina | señora mayor en la puerta de su casa |
| `beto.jpg` | Beto · @beto.mx | joven 20s con gorra frente a una laptop |
| `raul.jpg` | Raúl · @raul_taxi | taxista adulto junto a su coche |
| `flores.jpg` | Sra. Flores · @sra.flores | mujer adulta vendiendo flores en un mercado |
| `chuy.jpg` | Don Chuy · @don_chuy | mecánico adulto en su taller |
| `karla.jpg` | Karla · @karla_gym | entrenadora en un gimnasio |
| `padre.jpg` | Padre Tomás · @padre_tomas | sacerdote adulto, retrato sobrio |
| `profe.jpg` | Profa. Lena · @profe.lena | maestra en un aula con pizarrón |
| `fitlife.jpg` | FitLife Dr. · @fitlife_dr | hombre fitness con batido de proteína |
| `mia.jpg` | Mía · @viaja_con_mia | mujer joven viajera con maleta y pasaporte |
| `n0ticias.jpg` | n0ticias24 · @n0ticias24_oficial | logo/estudio de noticias genérico, sin marca real |
| `boletos.jpg` | BoletosFinalMX · @boletos_finalmx | boletos de estadio sobre una mesa |
| `futgossip.jpg` | FutGossip · @futgossip_mx | micrófono de prensa deportiva |
| `enfermera.jpg` | EnfermeraDespierta · @enfermera_despierta | silueta anónima con bata, sin rostro |
| `ovni.jpg` | VerdadOculta · @verdad_oculta_mx | cielo nocturno con luz extraña |
| `veci.jpg` | VeciInforma · @veci_informa | calle de barrio vacía al atardecer |
| `clima.jpg` | Clima Oficial · @clima_oficial | mapa meteorológico / satélite |
| `medio.jpg` | Noticias24 · @noticias24_verif | redacción de periódico, escritorios |
| `ong.jpg` | Salud Comunitaria · @salud_comunitaria_ong | centro de salud comunitario, voluntarios |
| `parodia.jpg` | El Sarcástico · @el_sarcastico_mx | máscara de teatro cómica |
| `sombra.jpg` | info_urgente_mx · @info_urgente_mx | silueta anónima con capucha, oscuro |
| `troll.jpg` | AntiSur · @vs_los_del_sur | máscara oscura / avatar anónimo agresivo |
| `arq.jpg` | El Arquitecto · @el_arquitecto | máscara de teatro sobre fondo negro |

## `public/img/portadas/` — portadas de perfil (opcional)

Mismos nombres que arriba: `carmen.jpg`, `n0ticias.jpg`, etc. Si no hay archivo,
el perfil usa un degradado según el tipo de cuenta y se ve bien igual.
Vale la pena hacer solo las que más se visitan: `n0ticias`, `medio`, `fitlife`,
`clima`, `beto`, `carmen`.

## `public/img/casos/` — imagen de cada publicación (17)

| Archivo | De qué es la publicación |
|---|---|
| `c1.jpg` | 🚨 URGENTE: el banco central COLAPSARÁ mañana. SACA TU DINERO YA. ¡¡COMPARTE!!… |
| `c2.jpg` | Lluvias fuertes el fin de semana. Recomendamos revisar coladeras antes de la final del dom… |
| `c3.jpg` | 🔥 ÚLTIMAS 12 HORAS: boletos para la FINAL DEL MUNDIAL al 70% de descuento. Deposita YA pa… |
| `c4.jpg` | Confirmado: la final del domingo se ve en casa de doña Mary. Tacos + pantalla nueva 🌮📺 N… |
| `c15.jpg` | ÚLTIMO MINUTO: el alcalde declara los tacos 'patrimonio de la humanidad' y decreta puente … |
| `c16.jpg` | 😤 'La gente del sur no merece ir a la final. Habría que correrlos de la ciudad.' — ¿usted… |
| `c17.jpg` | 😏 'MIREN a la 'maestra' profe.lena en este video… no es tan santita' — (video con su cara… |
| `c18.jpg` | ℹ️ Protección Civil publica el mapa oficial de rutas seguras al estadio el domingo. (poco … |
| `c5.jpg` | 😱 EXCLUSIVA: el capitán de la selección de FIESTA a las 3am… ¡ANTES DE LA SEMIFINAL! La a… |
| `c6.jpg` | UNA ENFERMERA REVELA lo que no te dicen de las vacunas. Ellos lo saben y lo ocultan. Prote… |
| `c7.jpg` | Jornada gratuita de vacunación este sábado en el centro de salud. Calendario oficial y req… |
| `c8.jpg` | Chicos, DetoxKoin cambió mi vida: quema grasa MIENTRAS DUERMES 😍 Código FIT70 (link en bi… |
| `c9.jpg` | 🛸 EL GOBIERNO LO OCULTA: OVNI estrellado en Chihuahua. Un testigo lo grabó antes de que '… |
| `c10.jpg` | 🎙️ AUDIO: 'mi primo del gobierno dice que cortarán el agua UN MES por la final. Compren g… |
| `c12.jpg` | 💦 ÚLTIMA HORA: el estadio de la final INUNDADO tras las lluvias. FIFA cancelaría el parti… |
| `c13.jpg` | 🎧 FILTRADO: audio del DT insultando a la afición en el vestidor. 'No merecen esta final'.… |
| `c14.jpg` | 🎬 VIDEO: el alcalde anuncia TOQUE DE QUEDA total desde medianoche por 'disturbios de la f… |

> Los casos que **genera la IA** en cada partida (`gen1.jpg`, `gen2.jpg`, …) también
> tienen ruta, pero su tema cambia en cada partida: mejor dejarlos sin archivo para
> que usen el degradado. No hace falta crearlos.

## `public/img/historias/` — fondos de historia

| Archivo | Historia |
|---|---|
| `amb_karla.jpg` | Karla entrenando de madrugada |
| `amb_mia.jpg` | Mía buscando boletos para la final |

Las historias de riesgo (`r_c3.jpg`…) y las de daño (`dano_carmen_fraude.jpg`…) se
crean durante la partida. Se les puede poner imagen, pero funcionan perfecto con el
degradado — y ahí el degradado rojo comunica bien.

## Cómo comprobar que quedó

```bash
npm run dev     # entra a un perfil: la foto debe aparecer sola
```

Si no aparece: revisar que el nombre sea **exacto** (minúsculas, `.jpg`) y que el
archivo esté dentro de `public/img/<carpeta>/`. Para publicar: `npm run deploy`.
