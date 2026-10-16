# Martina Høbelar — Press kit

Press kit web de Martina Høbelar, DJ y productora de hard techno y schranz de Buenos Aires.

Es una sola página estática: sin panel, sin funciones serverless y sin paso de build. Toma como referencia la estructura de [presskit_digital](https://github.com/Enzodiazzingaretti/presskit_digital) (inicio, sets, bio, rider y booking), con una estética propia y minimalista.

## Idea visual

- **El led.** El rojo de su presskit 2025 aparece en sus fotos y en un led chico que marca lo activo (la sección en el menú, el set elegido), como los de una cabina. Al elegir un set, el led de abajo del reproductor titila ocho veces a los BPM de ese set. Con movimiento reducido no titila. El inicio no tiene animación.
- **Sin logo.** Martina pidió sacar la gota de sangre; la pestaña usa la Ø de su apellido.
- **La tipografía.** Una sola familia, Archivo variable: extra condensada y en mayúsculas para el nombre y los títulos, normal para leer.
- **El ritmo.** La sala a oscuras, la bio sobre el gris de estudio de su book (con sus dos fotos en zigzag), y las dos fotos que ella marcó como épicas a todo el ancho antes de la grilla.

## Pensado para quien la contrata

- **Booking siempre a mano.** Botón en el inicio y, al bajar, en la barra; en la sección de booking queda lleno.
- **Consulta directa.** En booking se elige qué se consulta (fecha, prensa o colaboración) y se completan los datos: nombre, productora, fecha, ciudad, venue, capacidad, tipo de evento y mensaje. La consulta se abre armada en el mail de quien escribe (o en Gmail, o en WhatsApp), con un asunto ordenable como `Booking · Martina Høbelar · 12/12/2026 · Rosario, Argentina`, así la respuesta le llega directo a su casilla. No pasa por ningún servidor ni servicio externo. Si la compu no tiene app de mail, la página lo detecta y ofrece Gmail o copiar la consulta. Debajo de la fecha aparece el día escrito, para que no haya dudas entre día y mes. El borrador queda en la pestaña por si el celular recarga la página al volver del mail.
- **Contacto directo al lado.** Mail (con botón para copiarlo), WhatsApp e Instagram, a mano mientras se completa la consulta.
- **Copiar la bio completa o la corta.** La corta es el primer párrafo, para flyers y posteos.
- **Fotos en JPG.** El visor muestra WebP pero descarga JPG de hasta 3000 px, que cualquier programa abre. Arriba de la grilla está la carpeta en alta resolución.
- **Imprimir o guardar en PDF.** Sale una hoja de prensa en blanco y negro (nombre, bio, sets, rider, enlace a las fotos y contacto), sin fotos ni formulario, para quien arma la producción.
- **Todo se puede tocar.** Botones y enlaces de 44 px de alto como mínimo; fotos nítidas en pantallas de alta densidad (srcset) sin cargar de más en el celular.

## Detalles de diseño

- **Etiquetas.** Los rótulos (fichas, rider, formulario, contacto) van chicos, en mayúsculas y con aire, como la serigrafía de un equipo, para separarlos del dato.
- **Sangría óptica.** El nombre del inicio y del pie está justificado por la tinta, no por la caja: arranca y termina a filo del texto y de la línea. Los títulos se corren lo que mide la sangría de su primera letra (la S menos que la B, la F o la R).
- **Leds.** En el formulario, las teclas de tipo de evento tienen su led apagado y se enciende el elegido; un campo que falta se marca con borde rojo y el led al lado del aviso.
- **Enlaces que salen del sitio** llevan una flecha chica.
- **Fotos que se revelan.** Mientras carga, cada foto muestra su tono; después aparece con un fundido, como una copia en la cubeta. En el visor, cada foto entra con un fundido corto.
- **Teclas.** Botones y opciones se hunden un pixel al tocarlos; en el celular no aparece el recuadro gris del toque.
- **Menú del celular.** Aparece con un fundido y las secciones suben apenas, una tras otra.
- **Video.** Al darle play, la miniatura queda debajo mientras carga YouTube, sin pantallazo negro.
- **Formulario.** El cursor titila en rojo como el led, el calendario de la fecha usa el rojo de la marca, el autocompletado no pinta los campos de celeste y el mensaje crece con lo que se escribe.
- **Tipografía.** Bajadas y avisos en líneas parejas, párrafos sin una palabra sola al final, y sin cortes en el teléfono, los modelos de equipos ni “Buenos Aires”. Archivo no trae el guion que no corta (U+2011): para que una palabra con guion no se parta se usa `sin-corte`, no ese carácter.
- **Más contraste** para quien lo pide en su sistema (grises más claros y sin grano), y barras de desplazamiento al tono del sitio.
- **Movimiento.** Con “reducir movimiento” activado no hay fundidos ni titileo.

## Estructura

```
index.html     todo el contenido: textos, sets, fotos, rider y booking
404.html       página para direcciones que no existen
style.css      estilos (incluye la versión para imprimir)
script.js      comportamiento: latido, reproductor de sets, visor de fotos, consulta de booking, copiar mail y bio, menú y reintento de fotos
fonts/         Archivo variable (woff2, solo latín) con su licencia OFL
img/           fotos en WebP y JPG, la cabina del rider, íconos y vista previa para compartir (og.jpg)
vercel.json    encabezados de seguridad y caché
robots.txt
sitemap.xml
```

## Editar contenido

- **Textos:** directamente en `index.html`.
- **Sets:** cada fila de la lista (`.track`) lleva el ID del video de YouTube en `data-id` y los BPM en `data-bpm` (el número que usa el latido). La primera es la que aparece cargada en el reproductor; si cambia, cambiar también la miniatura, `#nowName` y `#nowBpm`.
- **Fotos:** cada foto tiene una miniatura `img/fotos/NN-720.webp`, una versión grande `NN-1800.webp` (la que abre el visor) y `NN.jpg` (la que se descarga). WebP debajo de ~300 KB. Las dos de arriba de la grilla usan `img/hero-2.webp` y `img/hero-3.webp`. El lugar de cada foto en la grilla sale de su clase (`g-01`, `g-02`…) en `style.css`, y su `sizes` en `index.html` acompaña ese ancho. Cada botón de foto lleva `data-tono`, el color promedio de la foto, que se ve mientras carga: si se reemplaza una foto, actualizarlo (con cualquier editor, el color medio de la imagen achicada a 1 px).
- **Bio:** las dos fotos son `img/bio-a.webp` (de pie) y `img/bio-b.webp` (recostada, recortada a 5:4). Abren el visor y se descargan completas (`fotos/13` y `fotos/14`).
- **Booking:** el mail y el WhatsApp están en `index.html` (contacto directo y menú del celular) y en `script.js` (`MAIL` y `WHATSAPP`, al principio de la consulta). Si cambian, van en los dos. Los textos que arma la consulta (saludo, asunto, qué datos pide cada motivo) están en `MOTIVOS`, en `script.js`.
- **Rider:** la cabina es `img/rider-cabina.webp`, sacada del diagrama del presskit de Kexxy y adaptada a su setup: CDJ, mixer, CDJ y CDJ, sin texto en la imagen. Los modelos van escritos en la lista de al lado.
- **Imágenes y caché:** el navegador guarda las imágenes un día. Si reemplazás una manteniendo el nombre, sumale `?v=` con un número nuevo donde se usa en `index.html` (como la 04 y la 07).
- **Inicio:** la foto es `img/hero-1.webp` (y `hero-1-2880.webp` para pantallas de alta densidad), con un recorte vertical para celular, `hero-1-m.webp`.
- **Tipografía:** se sirve desde el sitio con caché de un año. Si se cambia el archivo de `fonts/`, cambiarle el nombre.
- **Dominio:** la URL está escrita en `index.html` (canonical, `og:url`, `og:image`, JSON-LD), `robots.txt` y `sitemap.xml`. Si cambia, va en los tres.

## Deploy

Proyecto `martinahobelar-presskit` en el equipo kexxy de Vercel, conectado a este repo, sin paso de build. Cada push a `main` sale a producción en https://martinahobelar-presskit.vercel.app.

La URL para compartir es esa. Las otras que arma Vercel (las de cada deploy y los alias `-kexxy` / `-git-main-kexxy`) piden login de Vercel.

## Crédito

El pie lleva “Sitio web hecho por Enzo Diaz Zingaretti” con enlace a https://portfolio-kexxy.vercel.app. No se quita.

## Pendiente de confirmar con Martina

- **Foto de estudio en la grilla:** donde estaba la que pidió sacar (sentada sobre fondo blanco) va la de pie con top de cuero, que antes estaba en la bio. Las dos que mandó para la bio no se repiten en la grilla.
- **Datos derivados:** “más de 1,6 millones de vistas” es la suma de las vistas de sus sets en YouTube (octubre 2026) y los BPM de cada set salen de los títulos de esos videos.
- **Fotos en alta:** el botón apunta a su carpeta FOTOS de Drive, que es pública con el enlace.
- **SoundCloud:** el enlace a soundcloud.com/martina-hobelar no lo mandó ella; es su perfil público.
- **Créditos de fotos:** si los fotógrafos quieren crédito al publicar, sumarlo en el visor o en el texto de la sección.

## Para sumar con material de Martina

- **Fechas destacadas:** clubes y fiestas donde tocó (es lo primero que mira una productora para decidir).
- **Bio en inglés:** para fechas afuera; se puede sumar un selector ES / EN.
- **Rider completo:** monitores, altura de cabina, hospitalidad, si tiene requisitos.
- **Formulario que envía solo:** hoy la consulta sale desde el mail o WhatsApp de quien escribe. Para que se envíe sin salir de la página hace falta un servicio de formularios, que se activa con la cuenta del mail de bookings.

## Lo que ya confirmó (octubre 2026)

- **Bio:** es la que mandó; solo se corrigieron mayúsculas (Co-founder, Sangre Club, Groove Selections) y la puntuación del segundo párrafo. Es organizadora de Groove Selections.
- **Rider:** la tercera CDJ no es opcional; “para cambios en el setup, consultar” queda.
- **Booking:** revisó la sección y sumó el Instagram de bookings, @grooveselectionsbookings.
- **Fotos:** la de látex con el radiograbador va en blanco y negro, y sale la de auriculares con luz roja.
