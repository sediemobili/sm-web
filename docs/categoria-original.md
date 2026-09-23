# Inventario de la página de categoría original

Levantado de `https://sediemobili.com/product-category/escritorios/` y de la subcategoría
`.../sillas-de-oficina/silla-directiva/`, leyendo el DOM renderizado y el CSS a 1440 y 390.

La página son **dos secciones** de primer nivel, ambas con 28px de relleno.

## 1. Banda de encabezado

- **Caja:** 1440×154, fondo crema `#EDEAE5`, relleno 28px.
- **Contenido:**
  - "Mobiliario de Oficina", Raleway 40px 500 — es fijo, igual en todas las categorías.
  - "Categoría: Escritorios", Raleway 24px 300 — el nombre cambia con la categoría.
  - Bloque de contacto a la derecha: "Contáctanos" (Raleway 16px 500) y
    "¡Reciba una llamada de un ejecutivo…" (Albert Sans 14px 300).

## 2. Listado

- **Caja:** 1440×1582 en Escritorios, relleno 28px.
- **Encabezado:** "Filtros Inteligentes", Raleway 20px 400.
- **Panel de filtros:** fichas de 11px con las categorías (Bancas, Escritorios, Mesas…) y una "×"
  para limpiar. Es el mismo sistema de filtros que el catálogo.
- **Rejilla de productos:** tarjetas de 247×366 repartidas en filas de 5 a 1440px.

### Tarjeta de producto

| Parte | Medida |
|---|---|
| Marco | 247×366, borde 1px `rgba(207,207,207,0.51)`, radio 20px, relleno 0/14px |
| Interior | 215×364, relleno 12px arriba y abajo |
| Imagen | 215×215, radio 20px |
| Categoría | Albert Sans 10px 500 en versalitas, encima del nombre |
| Nombre | 18px 300 |
| Botón | "Más información", 14px, texto blanco sobre fondo oscuro |

Es la misma tarjeta que usan los carruseles de la home, más el marco blanco.

## Lo que no tiene

- No hay migas de pan.
- No hay `h1`: el título de la banda es un `h2`.
- No hay descripción de la categoría ni conteo de resultados visible.
- No hay enlaces a las subcategorías: la subcategoría se ve igual que la categoría madre,
  solo cambia el texto "Categoría: …".

## Basura de Elementor que no se copia

El envoltorio de cuatro niveles por tarjeta (`.e-con` > `.e-con-inner` > `.elementor-element` >
`.elementor-widget-container`), las clases `jet-listing-grid__*` del generador de listados, los
atributos `data-widget_type` y `data-settings`, y los `div` que Jet usa para posicionar los filtros.
