# Martina Høbelar — Press kit

Press kit web de Martina Høbelar, DJ y productora de hard techno y schranz de Buenos Aires.

Es una sola página estática: sin panel, sin funciones serverless y sin paso de build. Toma como referencia la estructura de [presskit_digital](https://github.com/Enzodiazzingaretti/presskit_digital) (inicio, sets, bio, rider y booking), con una estética propia y minimalista.

## Idea visual

- **La gota.** Su logo (la gota de sangre de su carpeta LOGO) cierra su nombre como un punto y es la firma de la barra, del pie y de la pestaña.
- **El pulso.** El rojo no se usa como color de interfaz: aparece en la gota, en sus fotos y en una luz que late a los BPM. Al entrar, el inicio da ocho golpes a 157 BPM (el primer set) y queda quieto. Al elegir un set, la gota de abajo del reproductor da ocho golpes a los BPM de ese set. Con movimiento reducido no late nada.
- **La tipografía.** Grenze Gotisch para el nombre y los títulos, en la línea del logo de Sangre Club y de sus tatuajes. Instrument Sans para todo lo que se lee.
- **El ritmo.** La sala a oscuras, la bio sobre el gris de estudio de su book, y las dos fotos que ella marcó como épicas a todo el ancho antes de la grilla.

## Estructura

```
index.html     todo el contenido: textos, sets, fotos, rider y booking
style.css      estilos
script.js      comportamiento: latido, reproductor de sets, visor de fotos, menú y reintento de fotos
fonts/         las dos tipografías (woff2, solo latín) con su licencia OFL
img/           fotos en WebP, la gota, íconos y vista previa para compartir (og.jpg)
vercel.json    encabezados de seguridad y caché
robots.txt
sitemap.xml
```

## Editar contenido

- **Textos:** directamente en `index.html`.
- **Sets:** cada fila de la lista (`.track`) lleva el ID del video de YouTube en `data-id` y los BPM en `data-bpm` (el número que usa el latido). La primera es la que aparece cargada en el reproductor; si cambia, cambiar también la miniatura, `#nowName` y `#nowBpm`.
- **Fotos:** cada foto tiene una miniatura `img/fotos/NN-720.webp` y una versión grande `NN-1800.webp`, que es la que abre el visor y la que se descarga. WebP y debajo de ~300 KB. Las dos de arriba de la grilla usan `img/hero-2.webp` y `img/hero-3.webp`. El lugar de cada foto en la grilla sale de su clase (`g-01`, `g-05`…) en `style.css`.
- **Inicio:** la foto es `img/hero-1.webp`, con un recorte vertical para celular, `hero-1-m.webp`.
- **Tipografías:** se sirven desde el sitio con caché de un año. Si se cambia un archivo de `fonts/`, cambiarle el nombre.
- **Dominio:** la URL está escrita en `index.html` (canonical, `og:url`, `og:image`, JSON-LD), `robots.txt` y `sitemap.xml`. Si cambia, va en los tres.

## Deploy

Proyecto `martinahobelar-presskit` en el equipo kexxy de Vercel, conectado a este repo, sin paso de build. Cada push a `main` sale a producción en https://martinahobelar-presskit.vercel.app.

La URL para compartir es esa. Las otras que arma Vercel (las de cada deploy y los alias `-kexxy` / `-git-main-kexxy`) piden login de Vercel.

## Crédito

El pie lleva “Sitio web hecho por Enzo Diaz Zingaretti” con enlace a https://portfolio-kexxy.vercel.app. No se quita.

## Pendiente de confirmar con Martina

- **Bio:** la del sitio arma su bio del presskit 2025 con los datos nuevos que mandó (DJ y productora, co-founder de Sangre Club). Falta el texto completo de la bio nueva para reemplazarla.
- **Tercera foto del book:** el tercer link de Drive que mandó no está compartido; hay que pedirle acceso.
- **Booking:** mail y WhatsApp salen del presskit 2025 (`booking.grooveselections@gmail.com`, +54 9 11 6922 9895). Confirmar que siguen vigentes, y que sigue siendo residente de Groove Selections.
- **Datos derivados:** “más de 1,6 millones de vistas” es la suma de las vistas de sus sets en YouTube (octubre 2026) y los BPM de cada set salen de los títulos de esos videos.
- **Fotos en alta:** el botón apunta a su carpeta FOTOS de Drive, que es pública con el enlace.
- **SoundCloud:** el enlace a soundcloud.com/martina-hobelar no lo mandó ella; es su perfil público.
- **Tipografía gótica:** es una propuesta para el nombre; no viene de su material.
