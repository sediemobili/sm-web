# Inventario del blog original

Levantado de `https://sediemobili.com/blog/` y del post `.../tipos-sillas-para-oficina-bienestar/`,
leyendo el DOM renderizado y el CSS a 1440 y 390.

## Listado `/blog/`

### 1. Banda de portada

- **Caja:** 1440×450, fondo `#0A0807`, relleno lateral 86px, esquinas inferiores redondeadas 30px.
- "Terapia de Oficina", Archivo 110px 500, blanco.
- `h1` "Nuestro Blog", Archivo 20px 500, blanco, debajo del titular grande.

### 2. Fila de posts

- **Caja:** 1440×470, relleno lateral 10px.
- **Tarjetas:** 370×450, fondo `#0A0807`, radio 20px, relleno 60/40.
- La imagen destacada ocupa toda la tarjeta y **el título va encima**, en Raleway 24px 500 blanco.

## Post `/[slug]/`

### 1. Portada

- **Tarjeta centrada:** 1170×450 (empieza en x=135), fondo `#0A0807`, radio 40px, relleno 46/70,
  con la imagen destacada y el título del post.
- Título en Raleway 30px 400.

### 2. Cuerpo

- Contenedor de 1170px centrado.
- Encabezados internos en Albert Sans 32px 500.
- El texto conserva los enlaces y las citas del artículo.

### 3. Cierre

- "Nuestro Blog", Raleway 48px 300, y una fila con el resto de posts, con las mismas tarjetas
  oscuras del listado.

## Lo que no tiene

- Ni migas de pan, ni fecha, ni autor visibles en el listado ni en el post.

## Basura de Elementor que no se copia

El envoltorio de cuatro niveles por tarjeta, el marcado del carrusel de Swiper con sus diapositivas
duplicadas, las clases `elementor-*` y `raven-*` y los atributos `data-widget_type` y `data-settings`.
