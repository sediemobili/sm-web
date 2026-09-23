# Inventario de la home original

Levantado de https://sediemobili.com/ con Playwright (Chromium), midiendo el DOM renderizado a
1440×900 y a 390×844, más el CSS del kit (`post-29.css`) y de la página (`post-27.css`).
Es la referencia para reconstruir la home: cada sección, en orden, con su contenido, estructura,
medidas y medios.

La home del original son **9 secciones** de primer nivel (contenedores `.e-con` dentro de
`[data-elementor-type="wp-page"]`). El newsletter no es parte de la página: vive en la plantilla
del footer.

## 1. Hero (carrusel de 3 diapositivas)

- **Caja:** 1440×675 (75vh) en escritorio, 390×591 (70vh) en móvil. Sin relleno. A sangre.
- **Estructura:** carrusel de 3 diapositivas a pantalla completa; el texto va centrado encima del medio.
- **Medios:** dos **vídeos** en bucle con reproducción automática y una imagen de fondo.
  - Eugenia: `2026/07/eugenia.mp4`
  - LARUS: `2026/07/larus.mp4#t=1`
  - Zero: imagen `2026/07/ZERO.webp`, `cover`, centrada.

| Diapositiva | Antetítulo | Título | Párrafo | CTA | Color |
|---|---|---|---|---|---|
| Eugenia | Archivo 13px 300 | Raleway 90px 500, lh 59px | Albert Sans 18px 200, lh 27px | "Ver Eugenia", Albert Sans 14px | Texto `#0A0807` |
| Zero | Raleway 14px 300, lh 20px | Raleway 80px 400 versalitas, lh 59px | Albert Sans 16px 300 | "Ver Colección", 15px | Texto negro |
| LARUS | Archivo 14px 200 versalitas, lh 36px | Archivo 80px 400 versalitas, lh 59px | Archivo 16px 200 | "Ver cOLECCIÓN", Archivo 14px versalitas | Texto blanco, velo `#00000057` |

En móvil los títulos bajan a 60px (Eugenia) y 70px (Zero y LARUS), y la columna de texto pasa del
40–45% al 70–75%.

## 2. Carrusel de categorías

- **Caja:** 1440×625, relleno 58/0/29. En móvil 390×532.
- **Tarjetas:** 407×495 en escritorio, 294×464 en móvil. Radio 20px, velo `#020101` al 50%,
  imagen de la categoría como fondo (`sillas-cat.webp`, `recepciones-cat.webp`, `mesas-cat.webp`,
  `escritorios-cat.webp`, `taburetes-cat.webp`, `sofas.jpg`).
- **Contenido por tarjeta:** nombre en Raleway 40px 500 blanco (lh 38px) y "Ver Colección" en
  Albert Sans 14px sobre `#DCD9D4`.
- **Orden:** Sillas, Recepciones, Mesas, Escritorios, Taburetes, Sofás.

## 3. Dos banners

- **Caja:** 1440×340, relleno 29/57. En móvil 390×458, y los dos banners se apilan.
- **Estructura:** dos tarjetas lado a lado, radio 12px, fondo `#F4F4F4` con imagen
  (`background-sillas1.webp` y `background-sillas2.webp`) y velo al 30%.
- **Textos:** título Raleway 32px 400 (24px en móvil), párrafo Albert Sans 16px (14px en móvil),
  botón Albert Sans 14px con radio de píldora.
  1. "Oficinas y Corporativos" → "Más Información" a `/venta-empresarial/`.
  2. "Personaliza tus Experiencia" (con esa errata) → "Contáctanos", que abre el popup.

## 4. Explora + Sillería Ejecutiva

- **Caja:** 1440×920, relleno 58/57/29. En móvil 390×617.
- **Bloque de texto:** título Raleway 40px 400 (28px en móvil) y párrafo Albert Sans 16px.
- **Tarjeta grande:** 1325×665, radio 20px, fondo `2026/07/sillas-para-todos.webp` con velo.
  - Título "Sillería Ejecutiva" en Raleway 70px 500 blanco, en dos líneas (40px en móvil).
  - Párrafo "Descubre nuestras nuevas líneas disponibles." Albert Sans 18px blanco.
  - CTA "Ver Todas las Sillas", Albert Sans 14px, radio de píldora.

## 5. Carrusel de sillas

- **Caja:** 1440×645, relleno 29/0/58. En móvil 390×596.
- **Título:** "Descubre el Catálogo de Sillas para oficina", Raleway 40px 400 (28px en móvil).
- **Tarjetas:** 295×419 (294×417 en móvil), con imagen cuadrada de 258×258.
- **Contenido por tarjeta:** categoría en Albert Sans 10px 500 versalitas, nombre del producto en
  18px 300, botón "Más información" 14px.
- **Productos:** Flight, Eugenia, Felicita, Space Plegable, Solar y Visio.

## 6. Escritorios Innovadores

- **Caja:** 1440×245, relleno 72/86/43, fondo crema `#EDEAE5`. **Oculta en móvil.**
- **Texto:** "Escritorios" Raleway 55px 400 (lh 30px) e "Innovadores" 100px.

## 7. Descubre todas nuestras líneas

- **Caja:** 1440×523, relleno 86/0, fondo crema `#EDEAE5`. **Oculta en móvil.**
- **Texto:** título Raleway 48px 300 (lh 36px) y CTA "Ver Todas las Sillas".
- **Medio:** el bloque se apoya en `2026/07/sala-de-juntas.webp` y un degradado desde el crema.

## 8. Carrusel de escritorios

- Misma estructura que la sección 5. **Caja:** 1440×682, relleno 86/0. En móvil 390×659.
- **Título:** "Nuestros Escritorios para Oficina", Raleway 40px 400.
- **Productos:** Dínamo 1, Versátil V8-MESA, V7-MET, V4-MET, V3-HYB+LSP y V3-HYB.

## 9. Nuestro Blog

- **Caja:** 1440×536, relleno 58/57/29. En móvil 390×604.
- **Título:** Raleway 48px 300 (lh 36px) y CTA "Ver Más" a `/blog/`.
- **Tarjetas:** 318×450 (359×422 en móvil), con la imagen destacada de fondo y el título del post
  encima, en Raleway 24px 500 blanco (lh 28.8px).
- **Posts:** los 6 del blog, del más reciente al más antiguo.

## Medios que hay que traer al repo

| Archivo | Uso |
|---|---|
| `2026/07/eugenia.mp4` | Fondo de la diapositiva 1 |
| `2026/07/larus.mp4` | Fondo de la diapositiva 3 |
| `2026/07/ZERO.webp` | Fondo de la diapositiva 2 |
| `2026/07/background-sillas1.webp`, `background-sillas2.webp` | Fondos de los dos banners |
| `2026/07/sillas-para-todos.webp` | Fondo de "Sillería Ejecutiva" |
| `2026/07/sala-de-juntas.webp` | Fondo de "Descubre todas nuestras líneas" |
| Imágenes de las 6 categorías | Tarjetas de la sección 2 |
| Imágenes de los 12 productos | Carruseles 5 y 8 |
| Destacadas de los 6 posts | Sección 9 |

## Basura de Elementor que no se copia

Contenedores anidados sin función (`.e-con` dentro de `.e-con-inner` dentro de `.elementor-element`),
divs de relleno, `.elementor-widget-container`, clases `elementor-*` y `raven-*`, atributos
`data-widget_type`, `data-element_type` y `data-settings`, estilos en línea, y el marcado de Swiper
(`.swiper-wrapper`, `.swiper-slide` duplicadas para el bucle infinito, botones `.elementor-swiper-button`).
El resultado visual se reproduce con marcado semántico (`section`, `article`, `figure`, `ul`/`li`,
`h1`–`h3`), módulos CSS y los tokens del proyecto.
