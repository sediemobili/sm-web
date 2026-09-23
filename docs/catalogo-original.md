# Inventario del catálogo original

Levantado de `https://sediemobili.com/catalogo/`, leyendo el DOM renderizado y el CSS a 1440 y 390.

## Disposición

- **Título de la página:** "Archives: Catálogo", 24px 300, a 29px del borde.
  El prefijo "Archives:" es un fallo de configuración de Elementor; no se copia.
- **Dos columnas:** panel de filtros a la izquierda (314px de ancho, en x=29) y rejilla de
  productos a la derecha (empieza en x=363).
- En móvil las dos columnas se apilan, con el panel arriba.

## Panel de filtros

- **Caja:** 314×306, relleno 22px, fondo crema `#EDEAE5`.
- **Encabezado:** "Filtros Inteligentes", 20px.
- **Tres grupos**, cada uno con su etiqueta a 15px:
  1. **Categoría** — incluye las subcategorías (Bancas, Escritorios, Mesas, Recepciones, Sillas,
     Silla Directiva, Silla Ejecutiva…).
  2. **Colecciones**
  3. **Orígen** (así, con acento, en el original)
- **Opciones:** fichas de 11px en Albert Sans.

## Rejilla de productos

- Tarjetas de 247×366, las mismas de la categoría y de los carruseles de la home:
  marco de 1px `rgba(207,207,207,0.51)` con radio 20px, imagen de 215×215, categoría en 10px
  versalitas, nombre en 18px 300 y botón "Más información".

## Basura de Elementor que no se copia

El prefijo "Archives:" del título, el envoltorio de cuatro niveles por tarjeta, las clases
`jet-filter-*` y `jet-listing-grid__*`, los `div` de posicionamiento del panel y los atributos
`data-widget_type` y `data-settings`.
