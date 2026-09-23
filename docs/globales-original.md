# Inventario de header y footer originales

Levantado de `https://sediemobili.com/`, leyendo el DOM renderizado y el CSS a 1440, arriba del
todo y después de desplazar la página.

## Header

El sitio tiene **dos plantillas de cabecera** que se relevan al hacer scroll.

| | Normal (plantilla 31) | Pegada (plantilla 33) |
|---|---|---|
| Alto | 67px | 93px |
| Posición | estática, en el flujo | `fixed` arriba |
| Relleno | 14/28 | 14/28 |
| Logo | `sediemobili.svg`, 180×33 | el mismo, 200×37 |
| Fondo | degradado 176° de crema `#EDEAE5` a blanco | blanco |
| Cuándo | al cargar | aparece tras desplazar unos 300px |

- **Menú:** "Productos" (Albert Sans 15px 400) abre el mega-menú; "Recursos" lleva al blog.
- **Mega-menú:** tres columnas — Productos (las categorías y "↳ Ver Todo"), Colecciones y
  Catálogos Descargables. Títulos de columna en Raleway 12px 300 y entradas de 16px sobre blanco.
- **Separación entre ítems:** 26px.
- **Buscador** y botón **"Contáctanos"** a la derecha.

## Footer

Dos piezas:

### 1. Tarjeta oscura

- **Caja:** 1382×567, fondo `#0A0807`, radio 20px, relleno 55px.
- Dentro, el bloque de **newsletter** sobre fondo blanco (1272×158) con "Entérate de todo, antes
  que todos" (Archivo 30px) y "Suscríbete al newsletter." (16px).
- Debajo, una fila de cuatro columnas (1272×248):
  1. Logo blanco `sediemobili_white.svg` (238×44), texto institucional y las 5 redes, con iconos
     de 20px.
  2. **Categorías**, título Raleway 18px 400 blanco.
  3. **Información**, mismo estilo.
  4. **Sedes**: "Monterrey" y "Ciudad de México" en Raleway 16px 600 crema, con sus direcciones.

### 2. Barra inferior

- **Caja:** 1440×55, fondo `#5F5146`, esquinas superiores redondeadas 20px, relleno 14/57.
- A la izquierda, `White-webtag.svg` a 200×24: **es la firma "Created by SCNDAL"**.
- A la derecha, "Copyright 2026 @Sedie&Mobili" en 13px crema.

## Diferencia con nuestro sitio

En el original el **newsletter vive en el footer**, así que sale en todas las páginas. En nuestro
proyecto es la última sección de la home, como indica CLAUDE.md. Se mantiene así.

## Basura de Elementor que no se copia

Las dos plantillas duplicadas en el DOM (la normal y la pegada se renderizan las dos y se ocultan
por CSS), el envoltorio de cuatro niveles por widget, el marcado de menú de Raven con sus `ul`
anidados y vacíos, los iconos de Font Awesome y los atributos `data-widget_type` y `data-settings`.
