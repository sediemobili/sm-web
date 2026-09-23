# Inventario de las páginas estáticas originales

Levantado de `https://sediemobili.com/` con Playwright, leyendo el DOM renderizado y el CSS a
1440. Cubre `/nosotros/`, `/venta-empresarial/`, `/legal/` y `/gracias/`.

## `/nosotros/` — 1 sección

- **Caja:** 1440×765, relleno 0/28.
- **Dos columnas de ~675px**, las dos con fondo crema `#EDEAE5`:
  - Izquierda: la imagen `modern-office-with-no-people-luxury-chair…` como fondo.
  - Derecha: "La Compañía" (32px 500) y el texto institucional.

## `/venta-empresarial/` — 5 secciones

| # | Caja | Contenido |
|---|---|---|
| 1 | 1440×644, relleno 0/28/14 | Antetítulo "Proyectos Empresariales" (16px 500), título "Mobiliario que impulsa a tu equipo." (40px 500), párrafo (16px) y CTA "Contáctanos" |
| 2 | 1440×783, relleno 14/28/28 | Galería de 4 imágenes de 331×331 (Lithos LIT-1, LIT-2, Zero, Uno) y las 3 ventajas, cada una con `h3` 20px 500 y párrafo de 14px |
| 3 | 1440×536, relleno 28/57/57 | "Tu visión, de la mano de nuestros expertos." (32px 500) y párrafo |
| 4 | 1440×697, relleno 57/0/28 | "Explore nuestros productos" (32px 500) y **carrusel de categorías**: las mismas tarjetas oscuras de la home, con el nombre en 40px blanco y "Ver Colección" |
| 5 | 1440×536, relleno 57/57/28 | "Nuestro Blog" (48px 300), CTA "Ver Más" y las tarjetas de post de 318×450, con el título en 24px sobre la imagen |

Las secciones 4 y 5 son listados dinámicos: se reconstruyen con `lib/data`.

## `/legal/` — 1 sección

- **Caja:** 1440×136, relleno 0/10. Es la página más escueta del sitio.
- "Legal" (32px 500) y tres pestañas de 16px: **Confidencialidad** (activa, texto blanco),
  **Privacidad** y **Cookies** (texto crema).
- **Las tres pestañas están vacías**: no hay ningún texto legal publicado en WordPress.

## `/gracias/` — 1 sección

- **Caja:** 1440×900, relleno 57px, sobre fondo oscuro (los textos van en crema `#EDEAE5`).
- Logo blanco de 250×46.
- "¡Tu Solicitud fue Enviada!" (Raleway 50px 400) y el párrafo de confirmación (18px).
- Botón "Volver al Inicio" (16px 500, oscuro sobre claro).
- "Mientras esperas, puedes ver las últimas noticias." (22px 600) y tres posts con miniatura de
  103×68 y título de 17px 600.

## Basura de Elementor que no se copia

El envoltorio de cuatro niveles por sección y por tarjeta, el marcado de Swiper con sus
diapositivas duplicadas, las pestañas `e-n-tabs` con sus `aria` repetidos, las clases
`elementor-*` y `raven-*`, y los atributos `data-widget_type`, `data-element_type` y
`data-settings`.
