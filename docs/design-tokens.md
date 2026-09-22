# Design tokens

El sistema de tokens del sitio nuevo. Los valores salen del sitio actual (kit global de
Elementor `post-29.css` y el CSS de sus plantillas) y viven en `app/styles/tokens.css`, que es
la única fuente de verdad. Aquí se explica de dónde sale cada uno y qué se dejó fuera.

El inventario crudo se regenera con `pnpm extract:tokens` en `docs/design-tokens-inventario.md`.
Este documento se edita a mano.

## Color

| Token | HEX | Origen en Elementor | Uso |
|---|---|---|---|
| `--color-tinta` | #0A0807 | `primary` | Texto principal y fondos oscuros |
| `--color-fondo` | #FFFFFF | `border-dark` | Fondo del sitio |
| `--color-fondo-suave` | #EDEAE5 | `secondary` | Crema de secciones |
| `--color-texto` | #5F5146 | `text` | Texto de párrafo |
| `--color-texto-suave` | #8C7D70 | `3375f71` | Texto secundario |
| `--color-acento` | #5A3A21 | `accent` | Botones y enlaces destacados |
| `--color-acento-oscuro` | #422A18 | `2e1100b` | Footer |

**Consolidaciones:**
- `--color-tinta` unifica los tres casi negros del sitio actual: #0A0807, #000000 y #020101.
- `--color-texto` unifica `text` y su alias `9491a6b`, que tienen el mismo valor.

**Fuera del sistema:**
- `border-light` (#DCD9D4) y `cc010a8` (#2D2A28): están en el kit con 0 usos.
- Grises de un solo uso: #505050, #525252, #D0D0D0 y #F4F4F4. Si una página los necesita,
  se resuelven en su módulo CSS.
- Transparencias sueltas: #FFFFFF00, #02010100 y #00000057. Mismo criterio.

## Tipografía

Las familias las carga `next/font/google` en `app/layout.tsx` con subset `latin`,
`display: swap` y los pesos 200, 300, 400, 500 y 600, que son los que usa el sitio actual.
Cada una expone su variable CSS y los tokens de fuente apuntan a ella.

| Token | Familia | Variable de next/font | Uso en el sitio actual |
|---|---|---|---|
| `--fuente-titulo` | Raleway | `--font-raleway` | Encabezados (27 declaraciones) |
| `--fuente-texto` | Albert Sans | `--font-albert-sans` | Cuerpo y botones (19) |
| `--fuente-secundaria` | Archivo | `--font-archivo` | Footer y algunos títulos (12) |

**Fuera del sistema:** Inter (2 usos sueltos en una plantilla de sección), Roboto y Roboto Slab.
Estas dos últimas se descargan en el sitio actual solo porque quedaron como valor por defecto
de la tipografía global del kit, sin usarse en ninguna regla.

### Pesos

| Token | Valor |
|---|---|
| `--peso-extraligero` | 200 |
| `--peso-ligero` | 300 |
| `--peso-regular` | 400 |
| `--peso-medio` | 500 |
| `--peso-semibold` | 600 |

### Tamaños

| Token | Valor | Uso |
|---|---|---|
| `--texto-xs` | 12px | Pie del footer |
| `--texto-s` | 14px | Botones y antetítulos |
| `--texto-m` | 16px | Cuerpo; el tamaño más usado |
| `--texto-l` | 18px | Entradillas |
| `--texto-xl` | 24px | |
| `--texto-2xl` | 32px | |
| `--texto-3xl` | 40px | Títulos de sección; en móvil, el hero |
| `--texto-4xl` | 48px | |
| `--texto-hero` | 80px | Hero de la home en escritorio |
| `--texto-hero-movil` | 40px | El mismo hero bajo 767px |

**Fuera del sistema:** el sitio actual usa 21 tamaños distintos entre escritorio y móvil. Los
que aparecen una o dos veces no suben a tokens: 13, 15, 20, 26, 28, 30, 35, 55, 70, 90 y 100px.
Si una página necesita uno, se queda en su módulo.

### Interlineado y tracking

| Token | Valor | Para qué |
|---|---|---|
| `--interlineado-titulo` | 1.15 | Títulos |
| `--interlineado-base` | 1.5 | Texto corrido |
| `--interlineado-amplio` | 1.7 | Bloques aireados |

El sitio actual no tiene escala: son 10 valores sueltos en px (12, 18, 20, 22, 30, 35, 36, 55,
59 y 100px), uno por bloque y atados al tamaño de fuente de cada widget. Esta escala de 3
valores relativos los aproxima; habrá diferencias de uno o dos píxeles contra el original.

`--tracking-titulo` es `-0.5px`, el único valor de espaciado entre letras que se repite
(6 usos). Los demás (-0.3px, -1px y -3px) son de un solo uso.

## Espaciado

Escala de 8 pasos, tomada de los `gap` del sitio actual:

| Token | Valor |
|---|---|
| `--espacio-1` | 5px |
| `--espacio-2` | 10px |
| `--espacio-3` | 12px |
| `--espacio-4` | 20px |
| `--espacio-5` | 30px |
| `--espacio-6` | 40px |
| `--espacio-7` | 50px |
| `--espacio-8` | 60px |

## Radios y sombras

| Token | Valor | Uso |
|---|---|---|
| `--radio-s` | 12px | |
| `--radio-m` | 20px | Tarjetas |
| `--radio-l` | 30px | |
| `--radio-pill` | 40px | El radio dominante: 41 usos |
| `--sombra-tarjeta` | `2px 8px 23px 3px rgb(0 0 0 / 0.2)` | Tarjetas |
| `--sombra-modal` | `0 0 10px 0 rgb(0 0 0 / 0.5)` | Modal |

Son las únicas 2 sombras del sitio actual. Los radios asimétricos (`20px 0 0 20px`,
`0 30px 30px 0`…) son de un solo uso y se resuelven en el módulo que los pida.

## Disposición

| Token | Valor | Origen |
|---|---|---|
| `--ancho-contenido` | 1170px | `--container-max-width` del kit |

**Breakpoints** (van como comentario en `tokens.css`, porque una custom property no funciona
dentro de `@media`):

| Contexto | Ancho |
|---|---|
| Móvil | hasta 767px |
| Tablet | hasta 1189px |
