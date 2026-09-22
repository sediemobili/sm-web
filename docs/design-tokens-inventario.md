# Inventario de tokens del sitio actual

Inventario crudo y generado: no se edita a mano. El sistema final, curado, vive en `docs/design-tokens.md`.

Extraído de sediemobili.com con `pnpm extract:tokens`. Fuentes: kit global de Elementor (post-29.css), el CSS de las plantillas que carga la home y sus fuentes de Google.

Los nombres de Elementor se traducen a nombres semánticos en `app/styles/tokens.css`.

## Color

### Globales del kit

| Elementor | HEX | Usos | Dónde |
|---|---|---|---|
| `primary` | #0A0807 | 44 | wp-page (27), header (31), header (33), footer (32), section (3757), popup (2438) |
| `secondary` | #EDEAE5 | 31 | wp-page (27), header (31), header (33), footer (32), popup (2438) |
| `text` | #5F5146 | 2 | footer (32) |
| `accent` | #5A3A21 | 3 | popup (2438) |
| `border-light` | #DCD9D4 | 0 | sin uso en estas plantillas |
| `cc010a8` | #2D2A28 | 0 | sin uso en estas plantillas |
| `border-dark` | #FFFFFF | 43 | wp-page (27), header (31), header (33), section (3757) |
| `2e1100b` | #422A18 | 2 | footer (32) |
| `9491a6b` | #5F5146 | 1 | footer (32) |
| `3375f71` | #8C7D70 | 23 | wp-page (27), header (31), header (33), section (3757), popup (2438) |

### Colores escritos a mano en las plantillas

| HEX | Usos |
|---|---|
| #FFFFFF | 35 |
| #EDEAE5 | 8 |
| #000000 | 5 |
| #0A0807 | 3 |
| #02010100 | 2 |
| #F4F4F4 | 2 |
| #00000057 | 1 |
| #020101 | 1 |
| #505050 | 1 |
| #525252 | 1 |
| #5F5146 | 1 |
| #D0D0D0 | 1 |
| #FFFFFF00 | 1 |

## Tipografía

Fuentes de Google que carga la home: `Roboto:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic`, `Roboto Slab:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic`, `Archivo:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic`, `Raleway:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic`, `Albert Sans:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic`, `Inter:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic`.

### Familias en uso

| Familia | Declaraciones |
|---|---|
| Raleway | 27 |
| Albert Sans | 19 |
| Archivo | 12 |
| Inter | 2 |

### Tipografía global del kit

| Elementor | Propiedad | Valor |
|---|---|---|
| `primary` | family | Roboto |
| `primary` | weight | 600 |
| `secondary` | family | Roboto Slab |
| `secondary` | weight | 400 |
| `text` | family | Roboto |
| `text` | weight | 400 |
| `accent` | family | Roboto |
| `accent` | weight | 500 |

### Tamaños

| Escritorio | Usos |
|---|---|
| 16px | 18 |
| 14px | 13 |
| 12px | 9 |
| 18px | 6 |
| 40px | 4 |
| 13px | 3 |
| 15px | 2 |
| 30px | 2 |
| 32px | 2 |
| 48px | 2 |
| 80px | 2 |
| 100px | 1 |
| 20px | 1 |
| 24px | 1 |
| 55px | 1 |
| 70px | 1 |
| 90px | 1 |

| Móvil (max-width:767px) | Usos |
|---|---|
| 40px | 6 |
| 14px | 5 |
| 24px | 3 |
| 16px | 2 |
| 28px | 2 |
| 30px | 2 |
| 12px | 1 |
| 20px | 1 |
| 26px | 1 |
| 35px | 1 |
| 60px | 1 |
| 70px | 1 |

### Pesos

| Valor | Usos |
|---|---|
| 400 | 29 |
| 300 | 11 |
| 200 | 3 |
| 500 | 3 |
| 600 | 3 |

### Interlineado

| Valor | Usos |
|---|---|
| 36px | 4 |
| 59px | 3 |
| 30px | 2 |
| 100px | 1 |
| 12px | 1 |
| 18px | 1 |
| 20px | 1 |
| 22px | 1 |
| 35px | 1 |
| 55px | 1 |

### Espaciado entre letras

| Valor | Usos |
|---|---|
| -0.5px | 6 |
| 0px | 2 |
| -0.3px | 1 |
| -1px | 1 |
| -3px | 1 |

## Espaciado, radios y sombras

### Separaciones (gap)

| Valor | Usos |
|---|---|
| `10px` | 24 |
| `20px` | 18 |
| `10px 10px` | 11 |
| `0px` | 9 |
| `20px 20px` | 8 |
| `40px` | 7 |
| `50px` | 4 |
| `5px` | 4 |
| `0px 0px` | 2 |
| `12px` | 2 |
| `40px 40px` | 2 |
| `50px 50px` | 2 |
| `5px 5px` | 2 |
| `60px` | 2 |
| `6px` | 2 |

### Radios

| Valor | Usos |
|---|---|
| `40px 40px 40px 40px` | 41 |
| `20px 20px 20px 20px` | 12 |
| `0px` | 6 |
| `0px 0px 0px 0px` | 5 |
| `30px 30px 30px 30px` | 3 |
| `12px 12px 12px 12px` | 2 |
| `15px 15px 15px 15px` | 2 |
| `20px 20px 0px 0px` | 2 |
| `0px 10px 10px 0px` | 1 |
| `0px 30px 30px 0px` | 1 |
| `10px 0 0 10px` | 1 |
| `10px 0px 0px 10px` | 1 |
| `10px 10px 10px 10px` | 1 |
| `20px 0 0 20px` | 1 |
| `20px 0px 0px 20px` | 1 |

### Sombras

| Valor | Usos |
|---|---|
| `0px 0px 10px 0px rgba(0,0,0,0.5)` | 1 |
| `2px 8px 23px 3px rgba(0,0,0,0.2)` | 1 |

### Rellenos (padding)

| Valor | Usos |
|---|---|
| `0px 0px 0px 0px` | 9 |
| `0% 0% 0% 0%` | 4 |
| `2% 0% 0% 0%` | 3 |
| `0% 0% 0% 12%` | 2 |
| `0% 0% 0% 4%` | 2 |
| `30px` | 2 |
| `8px 32px 8px 32px` | 2 |
| `0% 0% 0% 04%` | 1 |
| `0% 0% 0% 6%` | 1 |
| `0em` | 1 |
| `11px 12px 11px 12px` | 1 |
| `12px 12px 12px 12px` | 1 |
| `12px 14px 12px 14px` | 1 |
| `16px 17px 16px 17px` | 1 |
| `9px 9px 9px 9px` | 1 |

## Contenedor y breakpoints

| Contexto | Ancho máximo |
|---|---|
| Escritorio | 1170px |
| max-width:1189px | 1189px |
| max-width:767px | 767px |

| Breakpoint | Bloques |
|---|---|
| `max-width:767px` | 6 |
| `min-width:768px` | 5 |
| `max-width:1189px` | 2 |

