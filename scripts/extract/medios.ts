// Descarga a public/media/ las imágenes que usan header, footer y home, las convierte a WebP
// y reescribe las rutas en data/*.json. Re-ejecutable: data/medios.json guarda el origen
// de cada archivo local, así que una segunda corrida vuelve a bajar lo mismo.
// Uso: pnpm medios
// pnpm medios --og genera solo las imágenes al compartir (og:image), en JPEG: ver ogParaCompartir.
// pnpm medios --fichas baja las fotos que la API de Sedie no cubre: ver fotosSinApi.

import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { DATA_DIR, fetchBinario, run } from "./lib.ts";

const MEDIA_DIR = path.join(process.cwd(), "public", "media");
const MANIFIESTO = path.join(DATA_DIR, "medios.json");
const MAX_LADO = 2000;
const CALIDAD = 82;
// La og:image no necesita más: Facebook y WhatsApp la muestran a 1200 px como mucho.
const OG_LADO = 1200;

// Vídeos del hero: se guardan tal cual, sin convertir.
const VIDEOS = [
  "https://sediemobili.com/wp-content/uploads/2026/07/eugenia.mp4",
  "https://sediemobili.com/wp-content/uploads/2026/07/larus.mp4",
];

// Fondos de la home, que en Elementor son background-image y no salen de los datos.
const FONDOS = [
  "https://sediemobili.com/wp-content/uploads/2026/07/ZERO.webp",
  "https://sediemobili.com/wp-content/uploads/2026/07/background-sillas1.webp",
  "https://sediemobili.com/wp-content/uploads/2026/07/background-sillas2.webp",
  "https://sediemobili.com/wp-content/uploads/2026/07/sillas-para-todos.webp",
  "https://sediemobili.com/wp-content/uploads/2026/07/sala-de-juntas.webp",
  "https://sediemobili.com/wp-content/uploads/2025/12/fv-scaled.png",
  // Fondo de la columna izquierda de /nosotros/. Es la misma imagen que la destacada de un
  // post: se baja una sola vez y las dos referencias apuntan al mismo archivo.
  "https://sediemobili.com/wp-content/uploads/2026/02/modern-office-with-no-people-luxury-chair-generated-by-ai-scaled.jpg",
];

// Los 12 productos de los dos carruseles y Eugenia, que da imagen a la primera diapositiva.
// Las diapositivas de colección usan el primer producto de su colección: se resuelve abajo.
const COLECCIONES_HERO = ["larus", "uno-zero"];

const PRODUCTOS_HOME = [
  "eugenia",
  "flight",
  "felicita",
  "space-plegable",
  "solar",
  "visio",
  "dinamo-1",
  "versatil-v8-mesa",
  "versatil-v7-met",
  "versatil-v4-met",
  "versatil-v3-hyblsp",
  "versatil-v3-hyb",
];

type Manifiesto = Record<string, string>; // ruta local → URL original

type Imagen = { url: string; carpeta: string };

const nombreDe = (url: string) => path.basename(new URL(url).pathname);

async function leerManifiesto(): Promise<Manifiesto> {
  try {
    return JSON.parse(await readFile(MANIFIESTO, "utf8")) as Manifiesto;
  } catch {
    return {};
  }
}

// Los SVG se copian tal cual; el resto se convierte a WebP con el lado mayor acotado.
// JPEG solo para las imágenes al compartir (og:image): WebP no es fiable en las previsualizaciones
// de WhatsApp y Facebook. Lo demás de public/media, que es para el sitio, va en WebP.
type OpcionesGuardar = { maxLado?: number; formato?: "webp" | "jpeg"; nombre?: string };

async function guardar(imagen: Imagen, { maxLado = MAX_LADO, formato = "webp", nombre = nombreDe(imagen.url) }: OpcionesGuardar = {}) {
  const talCual = /\.(svg|mp4|webm)$/i.test(nombre);
  const extension = formato === "jpeg" ? ".jpg" : ".webp";
  const destino = path.join(MEDIA_DIR, imagen.carpeta, talCual ? nombre : nombre.replace(/\.[^.]+$/, extension));
  const rutaPublica = `/media/${imagen.carpeta}/${path.basename(destino)}`;

  await mkdir(path.dirname(destino), { recursive: true });
  const original = await fetchBinario(imagen.url);

  if (talCual) await writeFile(destino, original);
  else {
    const redimensionada = sharp(original).resize({ width: maxLado, height: maxLado, fit: "inside", withoutEnlargement: true });
    await (formato === "jpeg"
      ? redimensionada.flatten({ background: "#ffffff" }).jpeg({ quality: CALIDAD, mozjpeg: true })
      : redimensionada.webp({ quality: CALIDAD })
    ).toFile(destino);
  }

  const { size } = await stat(destino);
  return { rutaPublica, bytes: size, original: original.length };
}

type ConSeo = { seo: { ogImage: string | null } };
type ProductoOg = ConSeo & { slug: string; images: { src: string }[] };
type CategoriaOg = ConSeo & { slug: string; image: string | null };
type PostOg = ConSeo & { slug: string; featuredImage: { src: string } | null };

// Imágenes al compartir (og:image), en JPEG a 1200 px, en public/media/og/:
//  - productos: su primera foto, que es la misma que declara Yoast;
//  - categorías: su imagen; posts: su imagen destacada;
//  - la imagen de respaldo de lib/seo.ts (OG_RESPALDO), que sale del fondo ZERO del hero.
// Se bajan del original (el manifiesto guarda el de cada archivo local) y solo se escribe
// seo.ogImage: las imágenes que muestra el sitio no cambian. Si una falla queda null y la página
// usa la de respaldo, nunca la URL de WordPress.
async function ogParaCompartir(
  productos: ProductoOg[],
  categorias: CategoriaOg[],
  posts: PostOg[],
  manifiesto: Manifiesto,
) {
  const origenDe = (ruta: string) => (ruta.startsWith("/media/") ? (manifiesto[ruta] ?? null) : ruta);
  const usadas = new Map<string, string>(); // ruta pública → URL original
  let bytes = 0;
  const fallos: string[] = [];

  async function og(etiqueta: string, ruta: string | null | undefined) {
    const url = ruta ? origenDe(ruta) : null;
    if (!url) {
      if (ruta) fallos.push(`${etiqueta}: ${ruta} no tiene original en data/medios.json`);
      return null;
    }
    // Dos originales con el mismo nombre de archivo (en distintas carpetas de WordPress) no pueden
    // compartir copia: el segundo lleva delante su etiqueta. Se decide antes de escribir.
    const base = nombreDe(url).replace(/\.[^.]+$/, ".jpg");
    const otra = usadas.get(`/media/og/${base}`);
    const nombre = otra && otra !== url ? `${etiqueta.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "-")}-${base}` : base;
    try {
      const guardada = await guardar({ url, carpeta: "og" }, { maxLado: OG_LADO, formato: "jpeg", nombre });
      if (!usadas.has(guardada.rutaPublica)) bytes += guardada.bytes;
      usadas.set(guardada.rutaPublica, url);
      manifiesto[guardada.rutaPublica] = url;
      return guardada.rutaPublica;
    } catch (error) {
      fallos.push(`${etiqueta} (${url}): ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  for (const producto of productos) producto.seo.ogImage = await og(producto.slug, producto.images[0]?.src);
  for (const categoria of categorias) categoria.seo.ogImage = await og(`categoría ${categoria.slug}`, categoria.image);
  for (const post of posts) post.seo.ogImage = await og(`post ${post.slug}`, post.featuredImage?.src);
  const respaldo = await og("respaldo", "/media/fondos/ZERO.webp");
  if (respaldo !== "/media/og/ZERO.jpg") fallos.push(`respaldo: se esperaba /media/og/ZERO.jpg y quedó ${respaldo}`);

  // Lo que hay en public/media/og/ y esta corrida no usó (versiones anteriores) se borra.
  const sobrantes = Object.keys(manifiesto).filter((ruta) => ruta.startsWith("/media/og/") && !usadas.has(ruta));
  for (const ruta of sobrantes) {
    await rm(path.join(process.cwd(), "public", ruta), { force: true });
    delete manifiesto[ruta];
  }

  await writeFile(path.join(DATA_DIR, "products.json"), JSON.stringify(productos, null, 2) + "\n");
  await writeFile(path.join(DATA_DIR, "categories.json"), JSON.stringify(categorias, null, 2) + "\n");
  await writeFile(path.join(DATA_DIR, "posts.json"), JSON.stringify(posts, null, 2) + "\n");
  await writeFile(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + "\n");

  console.log(`og:image en JPEG: ${usadas.size} archivos en public/media/og/ (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`Sobrantes borrados de public/media/og/: ${sobrantes.length}`);
  if (fallos.length) console.log(`\nFallos (${fallos.length}), quedan con la imagen de respaldo:\n  ${fallos.join("\n  ")}`);
}

type ProductoFicha = {
  slug: string;
  images: { src: string; alt: string }[];
  variations: { image: string | null }[];
};

const esDeWordPress = (url: string | null | undefined): url is string =>
  Boolean(url) && /\/\/(?:www\.)?sediemobili\.com\/wp-content\//i.test(url!);

// Fotos que la API de Sedie no cubre (producción usa DATA_SOURCE=sedie-api):
//  - todas las de las fichas sin pareja en la API o emparejadas sin foto principal; el
//    emparejamiento sale de data/api/ (lo genera pnpm sync:catalogo);
//  - todas las imágenes de variación (selector de color): salen del JSON de WordPress también
//    en las fichas de la API.
// Se guardan en WebP en public/media/productos/ y cada aparición de esas URLs en products.json
// pasa a la copia local. Un original que ya tiene copia (manifiesto) no se vuelve a bajar.
// Uso: pnpm medios --fichas
async function fotosSinApi(productos: ProductoFicha[], manifiesto: Manifiesto) {
  const equivalencias = JSON.parse(await readFile(path.join(DATA_DIR, "api", "equivalencias-slug.json"), "utf8")) as {
    wpSlug: string;
    apiSlug: string | null;
    estado: string;
  }[];
  const api = JSON.parse(await readFile(path.join(DATA_DIR, "api", "productos.json"), "utf8")) as {
    slug: string;
    imagen_principal: string | null;
  }[];
  const conPrincipal = new Set(api.filter((p) => p.imagen_principal).map((p) => p.slug));
  const apiDe = new Map(
    equivalencias.filter((e) => e.estado === "inequivoco" && e.apiSlug).map((e) => [e.wpSlug, e.apiSlug!]),
  );
  const fichas = productos.filter((p) => !conPrincipal.has(apiDe.get(p.slug) ?? ""));

  // URL original → slug del producto (para nombrar la copia si el nombre choca).
  const pendientes = new Map<string, string>();
  for (const producto of fichas)
    for (const imagen of producto.images) if (esDeWordPress(imagen.src)) pendientes.set(imagen.src, producto.slug);
  let deVariaciones = 0;
  for (const producto of productos)
    for (const variacion of producto.variations)
      if (esDeWordPress(variacion.image) && !pendientes.has(variacion.image)) {
        pendientes.set(variacion.image, producto.slug);
        deVariaciones++;
      }

  // URL → copia local para el sitio. Las de public/media/og/ son solo para compartir: no cuentan.
  const copiaDe = new Map(
    Object.entries(manifiesto)
      .filter(([ruta]) => !ruta.startsWith("/media/og/"))
      .map(([ruta, url]) => [url, ruta]),
  );
  const rutas = new Map<string, string>();
  let bajadas = 0;
  let reutilizadas = 0;
  let bytes = 0;
  const fallos: string[] = [];

  for (const [url, slug] of pendientes) {
    const previa = copiaDe.get(url);
    if (previa) {
      rutas.set(url, previa);
      reutilizadas++;
      continue;
    }
    // Un nombre ya ocupado por otro original lleva delante el slug del producto.
    const base = nombreDe(url).replace(/\.[^.]+$/, ".webp");
    const ocupada = manifiesto[`/media/productos/${base}`];
    const nombre = ocupada && ocupada !== url ? `${slug}-${base}` : base;
    try {
      const guardada = await guardar({ url, carpeta: "productos" }, { nombre });
      manifiesto[guardada.rutaPublica] = url;
      rutas.set(url, guardada.rutaPublica);
      bajadas++;
      bytes += guardada.bytes;
    } catch (error) {
      fallos.push(`${slug} (${url}): ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  let reescritas = 0;
  const local = (src: string) => {
    const destino = rutas.get(src);
    if (!destino) return src;
    reescritas++;
    return destino;
  };
  for (const producto of productos) {
    producto.images = producto.images.map((imagen) => ({ ...imagen, src: local(imagen.src) }));
    producto.variations = producto.variations.map((v) => (v.image ? { ...v, image: local(v.image) } : v));
  }

  await writeFile(path.join(DATA_DIR, "products.json"), JSON.stringify(productos, null, 2) + "\n");
  await writeFile(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + "\n");

  console.log(`Fichas sin foto en la API: ${fichas.length}`);
  console.log(`Originales: ${pendientes.size} (${pendientes.size - deVariaciones} de esas fichas y ${deVariaciones} solo de variaciones)`);
  console.log(`Bajadas: ${bajadas} (${(bytes / 1024 / 1024).toFixed(1)} MB en WebP) · ya tenían copia: ${reutilizadas}`);
  console.log(`Referencias reescritas en products.json: ${reescritas}`);
  if (fallos.length) console.log(`\nFallos (${fallos.length}), siguen apuntando a WordPress:\n  ${fallos.join("\n  ")}`);
}

async function main() {
  const manifiesto = await leerManifiesto();
  const categorias = JSON.parse(await readFile(path.join(DATA_DIR, "categories.json"), "utf8")) as {
    slug: string;
    image: string | null;
    seo: { ogImage: string | null };
  }[];
  const productos = JSON.parse(await readFile(path.join(DATA_DIR, "products.json"), "utf8")) as {
    slug: string;
    collections: string[];
    images: { src: string; alt: string }[];
    variations: { image: string | null }[];
    seo: { ogImage: string | null };
  }[];
  if (process.argv.includes("--fichas")) return fotosSinApi(productos, manifiesto);
  const posts = JSON.parse(await readFile(path.join(DATA_DIR, "posts.json"), "utf8")) as {
    slug: string;
    featuredImage: { src: string; alt: string } | null;
    seo: { ogImage: string | null };
  }[];
  if (process.argv.includes("--og")) return ogParaCompartir(productos, categorias, posts, manifiesto);
  const paginas = JSON.parse(await readFile(path.join(DATA_DIR, "pages.json"), "utf8")) as {
    slug: string;
    sections: { body: string | null; image: { src: string; alt: string } | null }[] | null;
  }[];

  // Una ruta local ya reescrita se resuelve con el manifiesto, para poder volver a correr.
  const origen = (ruta: string) => (ruta.startsWith("/media/") ? (manifiesto[ruta] ?? null) : ruta);

  const pendientes: Imagen[] = [
    ...FONDOS.map((url) => ({ url, carpeta: "fondos" })),
    ...VIDEOS.map((url) => ({ url, carpeta: "video" })),
  ];
  for (const categoria of categorias) {
    const url = categoria.image ? origen(categoria.image) : null;
    if (url) pendientes.push({ url, carpeta: "categorias" });
  }
  // Primer producto de cada colección del hero, igual que hace la home.
  const productosHome = [
    ...PRODUCTOS_HOME,
    ...COLECCIONES_HERO.map(
      (coleccion) => productos.find((producto) => producto.collections.includes(coleccion))?.slug,
    ).filter((slug) => slug !== undefined),
  ];

  for (const slug of productosHome) {
    const url = productos.find((producto) => producto.slug === slug)?.images[0]?.src;
    const fuente = url ? origen(url) : null;
    if (fuente) pendientes.push({ url: fuente, carpeta: "productos" });
  }
  for (const post of posts) {
    const url = post.featuredImage ? origen(post.featuredImage.src) : null;
    if (url) pendientes.push({ url, carpeta: "blog" });
  }

  // Imágenes dentro de las secciones de las páginas estáticas: la del bloque y las del cuerpo.
  const enPaginas = new Set<string>();
  for (const pagina of paginas) {
    for (const seccion of pagina.sections ?? []) {
      if (seccion.image) enPaginas.add(seccion.image.src);
      for (const [, src] of (seccion.body ?? "").matchAll(/<img src="([^"]+)"/g)) enPaginas.add(src);
    }
  }
  for (const src of enPaginas) {
    const url = origen(src);
    if (url) pendientes.push({ url, carpeta: "paginas" });
  }

  const rutas = new Map<string, string>(); // URL original → ruta pública
  let bytes = 0;
  let bytesOriginales = 0;
  const fallos: string[] = [];

  for (const imagen of pendientes) {
    if (rutas.has(imagen.url)) continue;
    try {
      const guardada = await guardar(imagen);
      rutas.set(imagen.url, guardada.rutaPublica);
      manifiesto[guardada.rutaPublica] = imagen.url;
      bytes += guardada.bytes;
      bytesOriginales += guardada.original;
    } catch (error) {
      fallos.push(`${imagen.url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Reescritura de rutas en los datos.
  let reescritas = 0;
  const local = (src: string) => {
    const destino = rutas.get(origen(src) ?? src);
    if (!destino || destino === src) return src;
    reescritas++;
    return destino;
  };

  for (const categoria of categorias) if (categoria.image) categoria.image = local(categoria.image);
  for (const producto of productos) {
    producto.images = producto.images.map((imagen) => ({ ...imagen, src: local(imagen.src) }));
  }
  for (const post of posts) {
    if (post.featuredImage) post.featuredImage = { ...post.featuredImage, src: local(post.featuredImage.src) };
  }
  for (const pagina of paginas) {
    for (const seccion of pagina.sections ?? []) {
      if (seccion.image) seccion.image = { ...seccion.image, src: local(seccion.image.src) };
      if (seccion.body) seccion.body = seccion.body.replace(/<img src="([^"]+)"/g, (_, src) => `<img src="${local(src)}"`);
    }
  }

  await writeFile(path.join(DATA_DIR, "categories.json"), JSON.stringify(categorias, null, 2) + "\n");
  await writeFile(path.join(DATA_DIR, "products.json"), JSON.stringify(productos, null, 2) + "\n");
  await writeFile(path.join(DATA_DIR, "posts.json"), JSON.stringify(posts, null, 2) + "\n");
  await writeFile(path.join(DATA_DIR, "pages.json"), JSON.stringify(paginas, null, 2) + "\n");
  await writeFile(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + "\n");

  const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
  console.log(`Medios: ${rutas.size} de ${pendientes.length} pedidos`);
  console.log(`Peso: ${mb(bytes)} MB en public/media (originales: ${mb(bytesOriginales)} MB)`);
  console.log(`Rutas reescritas en data/: ${reescritas}`);
  if (fallos.length) console.log(`\nFallos (${fallos.length}):\n  ${fallos.join("\n  ")}`);
}

run(main);
