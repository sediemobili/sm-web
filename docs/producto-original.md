# Inventario de la ficha de producto original

Levantado de `https://sediemobili.com/product/eugenia/` (con variaciones y descargables) y
contrastado con `https://sediemobili.com/product/versatil-v8-mesa/` (sin descripción), midiendo el
DOM renderizado a 1440×900 y 390×844.

A diferencia de la home, la ficha **no son secciones apiladas**: es un único contenedor de dos
columnas iguales de 720px, donde la izquierda es la galería y la derecha la información.

## Disposición

| | Escritorio (1440) | Móvil (390) |
|---|---|---|
| Columnas | 2 de 720px | 1 columna; primero la galería, después la información |
| Galería | 720px de ancho, relleno superior 57px | 390px, relleno superior 15px |
| Información | 720px, relleno 115/115/0/57 → contenido de 547px | relleno 31/31/0/15 → contenido de 343px |
| Alto total | 8058px en Eugenia (10 imágenes), 4058px en V8-MESA (5 imágenes) | 8431px |

## 1. Galería (columna izquierda)

- **Pila vertical de todas las imágenes del producto, sin miniaturas y sin carrusel.**
- Cada imagen ocupa el ancho de la columna con una altura fija de 800px (720×800 en escritorio,
  390×800 en móvil), recortada.
- Sin separación entre imágenes: 10 imágenes = 8000px de alto.
- La columna de información queda fija a la vista mientras la galería se desplaza.

## 2. Información (columna derecha), en este orden

| Bloque | Contenido | Estilo |
|---|---|---|
| Título | Nombre del producto | Raleway 42px 500 |
| Migas | Inicio / Sillas / Silla Directiva / Eugenia | 14px 300, separador `/` |
| "Especificaciones" | Encabezado del bloque | 20px 500 |
| Descargables | Acordeón plegado, 43px de alto | Título 14px |
| Descripción | Solo si existe (90px en V8-MESA; Eugenia no tiene) | Albert Sans 16px |
| Variaciones | Selector de la variación cuando el producto tiene (130px en Eugenia) | Etiqueta 16px 700 |
| Nota | "Configúrala según tu proyecto. Medidas, colores y acabados personalizables." | Caja 383×60, fondo `#EDEAE5`, relleno 16/20, Albert Sans 14px |
| CTA | "Solicitar Cotización" | Botón oscuro de 44px, texto 14px sobre `#DCD9D4` |

## 3. Lo que la ficha original NO tiene

- No hay imagen principal con miniaturas: la galería es la pila vertical.
- No hay precio, ni estado de existencias, ni tabla de especificaciones.
- **No hay bloque de productos relacionados.**

## Basura de Elementor que no se copia

El contenedor de dos columnas está envuelto en cuatro niveles de `div` sin función
(`.e-con` > `.e-con-inner` > `.elementor-element` > `.elementor-widget-container`), la galería usa
el marcado de Raven con sus `div` de posicionamiento, el acordeón mete `details` con clases
`e-n-accordion-item` y `aria` duplicados, y el formulario de WooCommerce añade tres `input` ocultos.
Se reproduce con `figure`, `ol`, `details` nativo y un formulario propio.
