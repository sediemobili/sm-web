// Descarga a public/media/ las imágenes que usan header, footer y home, las convierte a WebP
// y reescribe las rutas en data/*.json. Re-ejecutable: data/medios.json guarda el origen
// de cada archivo local, así que una segunda corrida vuelve a bajar lo mismo.
// Uso: pnpm medios

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { DATA_DIR, fetchBinario, run } from "./lib.ts";

const MEDIA_DIR = path.join(process.cwd(), "public", "media");
const MANIFIESTO = path.join(DATA_DIR, "medios.json");
const MAX_LADO = 2000;
const CALIDAD = 82;

// Fondos de la home, que en Elementor son background-image y no salen de los datos.
const FONDOS = [
  "https://sediemobili.com/wp-content/uploads/2026/07/ZERO.webp",
  "https://sediemobili.com/wp-content/uploads/2026/07/background-sillas1.webp",
  "https://sediemobili.com/wp-content/uploads/2026/07/background-sillas2.webp",
  "https://sediemobili.com/wp-content/uploads/2026/07/sillas-para-todos.webp",
  "https://sediemobili.com/wp-content/uploads/2026/07/sala-de-juntas.webp",
  "https://sediemobili.com/wp-content/uploads/2025/12/fv-scaled.png",
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
async function guardar(imagen: Imagen) {
  const nombre = nombreDe(imagen.url);
  const esSvg = nombre.toLowerCase().endsWith(".svg");
  const destino = path.join(MEDIA_DIR, imagen.carpeta, esSvg ? nombre : nombre.replace(/\.[^.]+$/, ".webp"));
  const rutaPublica = `/media/${imagen.carpeta}/${path.basename(destino)}`;

  await mkdir(path.dirname(destino), { recursive: true });
  const original = await fetchBinario(imagen.url);

  if (esSvg) await writeFile(destino, original);
  else {
    await sharp(original)
      .resize({ width: MAX_LADO, height: MAX_LADO, fit: "inside", withoutEnlargement: true })
      .webp({ quality: CALIDAD })
      .toFile(destino);
  }

  const { size } = await stat(destino);
  return { rutaPublica, bytes: size, original: original.length };
}

async function main() {
  const manifiesto = await leerManifiesto();
  const categorias = JSON.parse(await readFile(path.join(DATA_DIR, "categories.json"), "utf8")) as {
    slug: string;
    image: string | null;
  }[];
  const productos = JSON.parse(await readFile(path.join(DATA_DIR, "products.json"), "utf8")) as {
    slug: string;
    collections: string[];
    images: { src: string; alt: string }[];
  }[];
  const posts = JSON.parse(await readFile(path.join(DATA_DIR, "posts.json"), "utf8")) as {
    slug: string;
    featuredImage: { src: string; alt: string } | null;
  }[];

  // Una ruta local ya reescrita se resuelve con el manifiesto, para poder volver a correr.
  const origen = (ruta: string) => (ruta.startsWith("/media/") ? (manifiesto[ruta] ?? null) : ruta);

  const pendientes: Imagen[] = [...FONDOS.map((url) => ({ url, carpeta: "fondos" }))];
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

  await writeFile(path.join(DATA_DIR, "categories.json"), JSON.stringify(categorias, null, 2) + "\n");
  await writeFile(path.join(DATA_DIR, "products.json"), JSON.stringify(productos, null, 2) + "\n");
  await writeFile(path.join(DATA_DIR, "posts.json"), JSON.stringify(posts, null, 2) + "\n");
  await writeFile(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + "\n");

  const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
  console.log(`Imágenes: ${rutas.size} de ${pendientes.length} pedidas`);
  console.log(`Peso: ${mb(bytes)} MB en public/media (originales: ${mb(bytesOriginales)} MB)`);
  console.log(`Rutas reescritas en data/: ${reescritas}`);
  if (fallos.length) console.log(`\nFallos (${fallos.length}):\n  ${fallos.join("\n  ")}`);
}

run(main);
