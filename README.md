# Martina Høbelar — Press kit

Press kit web de Martina Høbelar, DJ y productora de hard techno y schranz de Buenos Aires.

Es una sola página estática: sin panel, sin funciones serverless y sin paso de build. Toma como referencia la estructura de [presskit_digital](https://github.com/Enzodiazzingaretti/presskit_digital) (inicio, sets, bio, rider, booking), con una estética propia y más minimalista.

## Estructura

```
index.html     todo el contenido: textos, sets, fotos, rider y booking
style.css      estilos
script.js      comportamiento: fundido de fotos del inicio, reproductor de sets, visor de fotos y menú
img/           fotos en WebP, ícono y vista previa para compartir (og.jpg)
vercel.json    encabezados de seguridad y caché
robots.txt
sitemap.xml
```

## Editar contenido

- **Textos:** directamente en `index.html`.
- **Sets:** cada fila de la lista (`.track`) lleva el ID del video de YouTube en `data-id`. La primera es la que aparece cargada en el reproductor; si cambia, cambiar también la miniatura y el texto de `#playerNow`.
- **Fotos:** cada foto tiene una miniatura `img/fotos/NN-720.webp` y una versión grande `NN-1800.webp`, que es la que abre el visor y la que se descarga. WebP y debajo de ~300 KB.
- **Inicio:** las tres fotos que cruzan en fundido son `img/hero-1.webp` (con un recorte vertical para celular, `hero-1-m.webp`), `hero-2.webp` y `hero-3.webp`.
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
- **Datos derivados:** “más de 1,6 millones de vistas” es la suma de las vistas de sus sets en YouTube (octubre 2026) y el rango de 146 a 165 BPM sale de los títulos de esos videos.
- **Fotos en alta:** el botón apunta a su carpeta FOTOS de Drive, que es pública con el enlace.
- **SoundCloud:** el enlace a soundcloud.com/martina-hobelar no lo mandó ella; es su perfil público.
