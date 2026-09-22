# Analítica: GTM y eventos

El sitio carga **Google Tag Manager `GTM-WQCFFJMD`** (el mismo del sitio actual) desde
`app/layout.tsx`, con `GoogleTagManager` de `next/third-parties/google` y su `<noscript>`.
El id sale de `NEXT_PUBLIC_GTM_ID`: si la variable no está definida, no se carga nada.

Todos los eventos pasan por `enviarEvento(nombre, datos)` de `lib/analytics/`, que empuja al
`dataLayer` con guardas (sin `window` o sin `dataLayer`, no hace nada). Ningún componente toca
`window.dataLayer` directamente.

Todos se disparan **en el cliente y después de que la acción tuvo éxito**, nunca antes.

## Eventos

| Evento | Cuándo | Dónde | Parámetros |
|---|---|---|---|
| `generate_lead` | El modal de contacto se envió correctamente | Modal, disponible en todo el sitio (header, ficha de producto, venta empresarial y home) | `origen: "modal-contacto"`, `interes` |
| `generate_lead` | La solicitud de cotización se envió correctamente | `/cotizacion/` | `origen: "cotizacion"`, `interes` |
| `sign_up_newsletter` | La suscripción se guardó | Bloque de newsletter de la home | — |
| `add_to_quote` | Se agregó un producto a la lista de cotización | `/product/[slug]/` | `item_id` (slug), `item_name`, `item_category`, `variacion` |
| `remove_from_quote` | Se quitó un producto de la lista | `/cotizacion/` | `item_id`, `item_name`, `item_category`, `variacion` |
| `view_item` | Se abrió una ficha de producto | `/product/[slug]/` | `item_id`, `item_name`, `item_category` |
| `view_item_list` | Se abrió un listado | `/catalogo/`, `/product-category/[...slug]/`, `/coleccion/[slug]/`, `/procedencia/[slug]/` | `item_list_name`, `resultados` |
| `conversion` | Se llegó a la página de gracias | `/gracias/` | `pagina: "gracias"` |
| `search` | Pendiente | Buscador del header | `search_term` |

### Notas por evento

- **`generate_lead`** distingue los dos formularios por `origen`. `interes` es el valor del
  campo "¿Qué estás buscando?" (Sillas de oficina, Escritorios, Recepciones, Mesas, Mobiliario
  en General, Proyecto Integral, Otro).
- **`add_to_quote` / `remove_from_quote`**: `variacion` es el valor visible de la variación
  elegida ("Con Cabecera") o `null` si el producto no tiene variaciones.
- **`view_item_list`**: `item_list_name` es el nombre del listado ("Catálogo", "Escritorios",
  "Quadri", "Nacional"…) y `resultados` el número total de productos del listado, no los
  visibles en la página.
- **`conversion`** se dispara al cargar `/gracias/`, que hoy solo recibe a quien envía una
  cotización. Va aparte de `generate_lead` para que en GTM se pueda marcar la conversión por
  página sin depender del formulario.
- **`search`** todavía no existe: el buscador del header no tiene lógica. El punto donde va
  está marcado con un comentario en `components/Header/HeaderNav.tsx`.

## Para quien configure GTM

- Los eventos llegan como `event` en el `dataLayer`, con sus parámetros al mismo nivel.
- `/cotizacion/` no se indexa (`robots: noindex`), pero sí dispara eventos.
- La medición de páginas vistas la hace GTM por su cuenta; aquí no se envía ningún `page_view`.
