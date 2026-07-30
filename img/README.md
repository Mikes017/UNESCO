# 🖼️ Imágenes de VERIFIED — qué imagen va en cada lugar

Todo está ya conectado en el código: solo hay que **poner la imagen**, por
archivo o por link. Las tablas del final dicen exactamente qué va en cada sitio.

## Dos maneras de cargarlas: elige una (o mézclalas)

### A · Archivos (recomendado para la demo)

Dejar caer el `.jpg` en la carpeta que toca, con el nombre exacto de las tablas
de abajo. No se toca nada de `src/`.

```bash
# ejemplo: la foto de perfil de la tía Carmen
cp ~/Descargas/abuela.jpg public/img/npcs/carmen.jpg

npm run dev        # comprobar en local: entra al perfil, la foto aparece sola
git add public/img && git commit -m "fotos de perfil" && git push
npm run deploy     # ⚠️ sin esto la página pública NO se actualiza
```

Ventaja: la imagen viaja con la app. Funciona sin internet, que es justo la
prueba estrella de la demo (desconectar el WiFi en vivo).

### B · Links (si no quieres bajar archivos)

Pegar la URL **directa** en el bloque `LINKS`, arriba de `src/App.jsx` (línea
~30). Lo que esté en `LINKS` manda sobre el archivo local, así que se pueden
mezclar: unas cuentas por link y otras por archivo.

```js
const LINKS = {
  npcs:      { carmen: "https://images.pexels.com/photos/1234/abuela.jpg" },
  portadas:  { medio: "https://…/redaccion.jpg" },
  casos:     { c1: "https://…/banco.jpg" },
  historias: {},
  galeria:   { carmen: ["https://…/1.jpg", "https://…/2.jpg"] },  // un ARRAY
};
```

Cómo sacar la URL directa: en Pexels/Unsplash, clic derecho sobre la imagen
grande → **"Copiar dirección de la imagen"**. Tiene que acabar en `.jpg` (o
llevar parámetros después). Si copias la URL de la *página* (`pexels.com/photo/…`)
no es una imagen y no cargará.

Después: `git commit` de `src/App.jsx` + `git push` + `npm run deploy`.

> ⚠️ Con links la app depende de que ese servidor siga respondiendo y de que
> permita mostrar sus imágenes desde otro sitio. Algunos bancos de imágenes lo
> bloquean, y entonces se ve el emoji de siempre. **Para la demo del jurado, usa
> archivos.**

### Da igual cuál elijas: si algo falta, no se rompe nada

La app comprueba cada imagen antes de pintarla. Lo que no exista (o no cargue)
cae solo al emoji y al degradado de color que ya trae. Se puede llenar de a
poco, en cualquier orden, y probar en cualquier momento.

## Reglas

| | |
|---|---|
| Formato | `.jpg` si va por **archivo** (las rutas lo esperan). Por **link**, cualquier formato que abra el navegador |
| Perfiles `npcs/` | cuadrado, 400×400 px basta |
| Portadas `portadas/` | ancho, 1200×400 px |
| Muro `galeria/<id>/` | cuadrado, 1080×1080 px |
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

## `public/img/galeria/<id>/` — el muro de fotos de cada cuenta

Cada NPC tiene **su propia carpeta**. Ahi van SUS fotos, las que se ven en la
rejilla de su perfil (ademas del avatar y la portada). Se numeran desde 1:

```
public/img/galeria/carmen/1.jpg
public/img/galeria/carmen/2.jpg   ← se pueden ir agregando de a poco
public/img/galeria/carmen/3.jpg
```

Se buscan hasta **12 ranuras** por cuenta y se muestran solo las que existan, en
orden. No hay que declarar nada en el codigo ni avisar cuantas hay: con poner
`1.jpg` ya aparece una, y el contador de publicaciones del perfil las suma.
Al tocar una se abre a pantalla completa y se pasa con ‹ ›.

Cuadradas (1080×1080) para que la rejilla quede pareja.

> 💡 **Por que importa para el juego:** un perfil con fotos de la vida de alguien
> se siente real, y hace mas incomodo lo que viene despues — entre esas fotos
> esta la cadena que reenvio. Y en las cuentas falsas conviene lo contrario:
> llenarlas de fotos genericas de banco de imagenes, porque es exactamente lo que
> hacen las cuentas de estafa para parecer legitimas. Esa sensacion de "muro sin
> vida propia" es una pista que el jugador puede aprender a leer.

| Carpeta | Cuenta | Que fotos le van bien |
|---|---|---|
| `galeria/carmen/` | Tía Carmen · @carmen_74 | su cocina, plantas en macetas, nietos de espaldas, pan dulce, la virgen del pasillo |
| `galeria/mama/` | Mamá · @mama.rosa | turnos en el hospital, su cafe de la mañana, zapatos de enfermera, plantas |
| `galeria/lupe/` | Doña Lupe · @lupe.vecina | la banqueta de su casa, su perro, la tienda de la esquina, macetas |
| `galeria/beto/` | Beto · @beto.mx | su escritorio con dos pantallas, notas en post-its, cafe frio, libros de datos |
| `galeria/raul/` | Raúl · @raul_taxi | su taxi limpio, el volante, el trafico al amanecer, el sitio de taxis |
| `galeria/flores/` | Sra. Flores · @sra.flores | ramos de flores, el puesto del mercado, manos con tijeras de podar |
| `galeria/chuy/` | Don Chuy · @don_chuy | herramientas ordenadas, un motor abierto, la pantalla del Mundial en el taller |
| `galeria/karla/` | Karla · @karla_gym | pesas, botella de agua, el gym vacio de madrugada, tenis deportivos |
| `galeria/padre/` | Padre Tomás · @padre_tomas | la parroquia por dentro, velas, sillas vacias, un jardin |
| `galeria/profe/` | Profa. Lena · @profe.lena | pizarron con ejercicios, mochilas, libros apilados, el patio de la escuela |
| `galeria/fitlife/` | FitLife Dr. · @fitlife_dr | batidos, mancuernas, espejo del gym, frascos de suplemento (SIN marcas reales) |
| `galeria/mia/` | Mía · @viaja_con_mia | maletas, aviones desde la ventanilla, mapas, sellos de pasaporte |
| `galeria/n0ticias/` | n0ticias24 · @n0ticias24_oficial ⚠️ | pantallas de television genericas, microfonos, graficas borrosas — todo de banco de imagenes, que es justo la pista |
| `galeria/boletos/` | BoletosFinalMX · @boletos_finalmx ⚠️ | boletos genericos, un estadio vacio, capturas de pago borrosas — fotos claramente de stock |
| `galeria/futgossip/` | FutGossip · @futgossip_mx | vestidores vacios, microfonos de prensa, cesped, gradas |
| `galeria/enfermera/` | EnfermeraDespierta · @enfermera_despierta ⚠️ | frascos sin etiqueta, guantes, hierbas — nada de rostros, la cuenta es anonima |
| `galeria/ovni/` | VerdadOculta · @verdad_oculta_mx ⚠️ | cielos nocturnos, luces lejanas, antenas, documentos tachados |
| `galeria/veci/` | VeciInforma · @veci_informa ⚠️ | calles del barrio, postes de luz, avisos pegados en la pared, tinacos |
| `galeria/clima/` | Clima Oficial · @clima_oficial | mapas de satelite, radares, nubes, pluviometros |
| `galeria/medio/` | Noticias24 · @noticias24_verif | la redaccion, escritorios, prensas, credenciales de prensa |
| `galeria/ong/` | Salud Comunitaria · @salud_comunitaria_ong | jornadas de vacunacion, voluntarios de espaldas, carpas, folletos |
| `galeria/parodia/` | El Sarcástico · @el_sarcastico_mx | memes deportivos propios, mascaras de teatro, cosas absurdas |
| `galeria/sombra/` | info_urgente_mx · @info_urgente_mx ⚠️ | pantallas en la oscuridad, cables, un cuarto sin ventanas |
| `galeria/troll/` | AntiSur · @vs_los_del_sur ⚠️ | fondos oscuros, texto sobre negro, imagenes agresivas y vacias |
| `galeria/arq/` | El Arquitecto · @el_arquitecto ⚠️ | mejor dejar la carpeta vacia: su perfil no debe tener nada que comprobar |

⚠️ = cuenta falsa: **nada de personas reales identificables** aqui. Objetos,
lugares, siluetas o gente de espaldas.

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
