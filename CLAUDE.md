@AGENTS.md
# Reglas de trabajo

## Git
- No ejecutes `git add`, `git commit`, `git push` ni ningún otro comando de git.
- No despliegues a producción bajo ninguna circunstancia, ni con aprobación verbal.
  Tampoco toques Vercel, DNS ni el WordPress actual; del sitio actual solo se lee.
- Al terminar una tarea, deja los cambios en el working directory y lista los archivos
  que tocaste. El commit y el push los hace el equipo manualmente desde terminal.

## Flujo de trabajo
- Ejecuta directamente. No entregues un plan previo ni esperes aprobación,
  salvo que la tarea sea ambigua o que ejecutarla implique una decisión
  que no está en la instrucción.
- Si durante la ejecución encuentras algo que la instrucción no contemplaba,
  detente y repórtalo antes de improvisar una solución.
- No repitas contexto ya establecido en el proyecto.
- Las instrucciones llegan como tareas sueltas del backlog (T01, T02…), una a la vez.
  Cada tarea cierra con el reporte descrito en "Reporte de tarea".
  No adelantes trabajo de tareas futuras.

## Sistema de diseño
- El proyecto NO usa Tailwind: se descartó a propósito. No lo introduzcas ni
  escribas clases de utilidad.
- Todo el estilo es CSS propio, organizado en capas:
    app/styles/tokens.css         los valores de diseño, única fuente de verdad
    app/styles/base.css           el reset y los estilos de elemento, únicos
    app/styles/patrones.css       el vocabulario compartido, clases sm-*
    app/styles/interacciones.css  las clases que consulta el JavaScript
  Lo propio de una página va en su módulo CSS. No hay ni debe haber hojas
  globales de página: el orden de capas (base, patrones, y los módulos fuera de
  toda capa) permite que un módulo siempre ajuste un patrón con una regla
  normal, sin !important ni selectores inflados.
- Los estados de un componente (abierto, activo…) van en su módulo, como atributos o clases del módulo ([data-open="true"]).
  interacciones.css solo guarda clases globales que ningún módulo estiliza (html.is-scroll-locked, .is-hidden), así nunca chocan.
- Un patrón sube a patrones.css cuando lo piden dos páginas, no antes. Lo que
  solo usa una página se queda en su módulo, por evidente que parezca.
- No inventes valores fuera del sistema: usa los tokens de tokens.css. Si un
  valor no está, no lo escribas suelto: decide si toca añadirlo al sistema.
- Los tokens salen del sitio actual (el kit global de Elementor y los SVG de la marca),
  documentados en docs/design-tokens.md. Mientras dure la migración, la referencia
  visual es sediemobili.com: se busca paridad, no rediseño.
- Jerarquía de referencia cuando dos páginas resuelven lo mismo de forma distinta:
  1. /product/[slug]/  2. /product-category/[...slug]/  3. el resto.
- Si un cambio toca un patrón compartido y afectaría a otras páginas, no lo
  toques: aplica el override acotado a la sección y repórtalo.

## Alcance
- Haz solo lo que se pide. No agregues elementos, secciones ni mejoras no solicitadas.
- Si algo se ve duplicado, mal escrito o mejorable fuera del alcance, repórtalo.
  No lo corrijas. Esto incluye el contenido heredado de WordPress: textos de prueba
  como "test city", placeholders y links rotos.

## Verificación
- No hagas comprobaciones repetidas ni ciclos de validación por tu cuenta.
  Ejecuta la tarea una vez y reporta. Al cerrar cada tarea que toque código, corre
  `pnpm build` una sola vez e incluye el resultado en el reporte.
- Para cambios visuales, la revisión la hace el equipo. No abras el navegador
  para valorar cómo se ve algo.
- Para diagnosticar un fallo reportado, sí levanta el servidor y mide en el
  navegador. No deduzcas la causa leyendo el CSS: repróducela.
- Si detectas un error real que impide que la tarea funcione, repórtalo.

## Reporte de tarea
- Qué se hizo, en una lista corta.
- Archivos tocados.
- Resultado de `pnpm build`.
- Pendientes, bloqueos o decisiones que necesita el equipo.
- Números clave cuando apliquen (productos, páginas, imágenes, errores).


# Proyecto: Sedie & Mobili (sm-web)

## Contexto
- Cliente: Sedie & Mobili México (sediemobili.com), fabricante de mobiliario de oficina
  y sillería profesional. Sedes en Monterrey y CDMX.
- Se migra el sitio actual (WordPress + Elementor + WooCommerce en modo catálogo)
  a Next.js, con tres objetivos:
  1. Replicar 1:1 el contenido, la estructura y las URLs.
  2. Nacer listo para vender en línea en el futuro, sin reescribir.
  3. Poder conectarse después al sistema de datos que Sedie ya tiene (Node/Next).
- Hosting: el Vercel de Sedie, ya conectado al repo. Cada push a main despliega.

## Stack
- Next.js (última estable), App Router, TypeScript strict, pnpm.
- Estilos: CSS propio en capas + CSS Modules (ver "Sistema de diseño").
- Datos: PostgreSQL (Neon) con Drizzle y migraciones versionadas. Hay un fallback a JSON.
- Imágenes: next/image, con originales en public/media convertidos a WebP (sharp, máx. 2000 px).
- Formularios: Server Actions + Zod, y los envíos se guardan en la base de datos.
- Analítica: Google Tag Manager GTM-WQCFFJMD (el mismo del sitio actual).
- No agregues dependencias fuera de esta lista sin reportarlo.

## Arquitectura de datos
- Toda lectura y escritura de datos pasa por lib/data/ (capa de repositorio).
  Ninguna página ni componente importa Drizzle ni lee JSON directamente.
    lib/data/types.ts   tipos de dominio
    lib/data/index.ts   exporta el repositorio activo según DATA_SOURCE (db | json)
    lib/data/db/        implementación con Postgres/Drizzle
    lib/data/json/      implementación sobre data/*.json
  El día que se conecte el sistema de Sedie, se agrega lib/data/sedie-api/ y nada más.
- data/ guarda el contenido extraído de WordPress en JSON y se versiona.
- Entidades: categories (jerárquicas), collections, products, product_variants
  (sku, precio, precio_oferta, stock, atributos; el precio puede ser null),
  product_images, product_categories, product_collections, downloads (catálogos PDF),
  posts, pages, leads, quote_requests y quote_items.
- Todavía no se crean orders ni payments. Solo se documenta en docs/ecommerce.md dónde
  entrarían.
- Flags en .env: NEXT_PUBLIC_COMMERCE_ENABLED=false (los CTA dicen "Cotizar" y
  alimentan la lista de cotización) y DATA_SOURCE=db|json. Los secretos nunca van
  en el repo: se documentan en .env.example.

## Mapa del sitio (URLs idénticas a WordPress, con trailingSlash: true)
- /                              home
- /catalogo/                     todos los productos, con filtro por categoría y colección
- /product-category/[...slug]/   categoría y subcategoría (sillas-de-oficina/silla-directiva/)
- /product/[slug]/               ficha de producto
- /coleccion/[slug]/             colección
- /procedencia/[slug]/           procedencia (italiano, nacional)
- /blog/                         listado del blog
- /[slug]/                       los posts viven en la raíz y no deben chocar con las páginas
- /venta-empresarial/  /nosotros/  /legal/ (los términos están en #tc)
- /gracias/                      página de conversión del formulario
- Toda URL de WordPress que no se replique lleva una 301 en next.config, listada en
  docs/redirects.md. La lista maestra es el sitemap de WP (/sitemap_index.xml).
- Categorías de primer nivel: bancas, escritorios, mesas, recepciones, sillas-de-oficina,
  sofas, soft-seating y taburetes. Dentro de sillas-de-oficina: silla-directiva,
  silla-ejecutiva, silla-industrial, silla-operativa, silla-secretarial, sillas-visita
  y sillas-escolares.
- Colecciones: Quadri, Versátil, Larus, Lithos, Uno-Zero, TEMX, Air Duo, Basic y Dinamo.

## Componentes globales
- Header: logo SVG; mega-menú "Productos" en tres columnas (Productos / Colecciones /
  Catálogos descargables); "Recursos" (lleva al blog); buscador; botón "Contáctanos",
  que abre el modal.
- Modal de contacto: "¿Necesitas mobiliario ergonómico o corporativo? Cuéntanos qué
  buscas y te llamamos en menos de 24h…". Campos: nombre, email, teléfono, empresa,
  "¿Qué estás buscando?" (Sillas de oficina · Escritorios · Recepciones · Mesas ·
  Mobiliario en General · Proyecto Integral · Otro) y mensaje. Se guarda en leads
  y envía el evento generate_lead al dataLayer.
- Home, en orden: hero slider (Eugenia, Zero, LARUS) → grid de categorías → "Oficinas
  y Corporativos" → "Personaliza tu experiencia" → "Explora nuestro mobiliario" →
  carrusel de sillas → carrusel de escritorios → últimos 6 posts.
- Newsletter: vive en el footer, como en el sitio actual, así que sale en todas las páginas.
- Footer: logo blanco, texto institucional, redes (Facebook, Instagram, YouTube,
  TikTok, LinkedIn), columnas Categorías e Información, las dos sedes y el copyright.

## SEO (no negociable)
- generateMetadata en todas las rutas: title, description, canonical absoluto y OG.
  Se reutilizan los textos de Yoast del sitio actual.
- JSON-LD: Organization + LocalBusiness (2 sedes), Product (sin offers mientras no
  haya precio), BreadcrumbList y BlogPosting.
- app/sitemap.ts y app/robots.ts.
- Un solo H1 por página. El sitio actual abusa de H2: corrige la jerarquía sin
  cambiar el texto visible (esto sí está dentro del alcance).
- priority en next/image solo para el hero. Siempre con sizes correctos.
- Accesibilidad AA: alt en todas las imágenes, foco visible, y mega-menú y modal
  operables con teclado.
