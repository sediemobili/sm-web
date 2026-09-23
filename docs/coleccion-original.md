# Inventario de colección y procedencia originales

Levantado de `https://sediemobili.com/coleccion/larus/` y `https://sediemobili.com/procedencia/italiano/`,
leyendo el DOM renderizado y el CSS a 1440 y 390.

**Las dos páginas usan exactamente la misma plantilla que la categoría.** Lo único que cambia es el
prefijo del subtítulo.

## 1. Banda de encabezado

- **Caja:** 1440×154, fondo crema `#EDEAE5`, relleno 28px.
- "Mobiliario de Oficina", Raleway 40px 500 — fijo.
- Subtítulo Raleway 24px 300, con el prefijo según el tipo:
  - categoría → "Categoría: Escritorios"
  - colección → "Colección: Larus"
  - procedencia → "Orígen: Italiano"
- A la derecha, "Contáctanos" y "¡Reciba una llamada de un ejecutivo de ventas!".

## 2. Listado

- **Caja:** 1440, relleno 28px. En Larus mide 424px de alto porque solo tiene 4 productos.
- Panel "Filtros Inteligentes" a la izquierda (314px) y rejilla a la derecha (empieza en x=363).
- Tarjetas de 247×366, idénticas a las de la categoría y el catálogo: marco de 1px con radio 20px,
  imagen 215×215, categoría en 10px versalitas, nombre en 18px 300 y botón "Más información".

## Lo que no tienen

- Ni migas de pan, ni `h1`, ni descripción de la colección, ni conteo de resultados.
- No hay enlaces a las otras colecciones.

## Consecuencia para el código

Las tres páginas de listado (categoría, colección y procedencia) comparten banda, panel de filtros,
rejilla y paginación. Se reconstruyen con los mismos componentes, cambiando solo el ámbito del
filtro y el prefijo del subtítulo.

## Basura de Elementor que no se copia

El envoltorio de cuatro niveles por tarjeta, las clases `jet-filter-*` y `jet-listing-grid__*`, los
`div` de posicionamiento del panel y los atributos `data-widget_type` y `data-settings`.
