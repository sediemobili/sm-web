// Categorías, colecciones y procedencias del sitio actual (WooCommerce Store API + WP REST).
// Uso: pnpm extract:taxonomias  →  data/categories.json, data/collections.json, data/procedencias.json

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://sediemobili.com";
const DATA_DIR = path.join(process.cwd(), "data");
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const MIN_INTERVAL_MS = 1000;

type Term = {
  id: number;
  slug: string;
  name: string;
  parentSlug: string | null;
  path: string;
  description: string | null;
  image: string | null;
  count: number;
  seo: { title: string | null; description: string | null; ogImage: string | null };
};

type YoastHead = {
  title?: string;
  description?: string;
  og_image?: { url?: string }[];
};

type WpTerm = {
  id: number;
  slug: string;
  name: string;
  parent: number;
  count: number;
  description: string;
  yoast_head_json?: YoastHead | null;
};

type StoreCategory = WpTerm & { image: { src?: string } | null };

type WpTaxonomy = { slug: string; rest_base: string };

class CaptchaError extends Error {}

let lastRequestAt = 0;

async function throttle() {
  const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

function isCaptcha(res: Response, body: string) {
  return (
    res.headers.has("sg-captcha") ||
    /<meta[^>]+http-equiv=["']?refresh[^>]+\/\.well-known\/sgcaptcha\//i.test(body)
  );
}

async function fetchOnce(url: string) {
  await throttle();
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  const body = await res.text();
  return { res, body };
}

async function fetchJson<T>(url: string) {
  let { res, body } = await fetchOnce(url);
  if (isCaptcha(res, body)) {
    ({ res, body } = await fetchOnce(url));
    if (isCaptcha(res, body)) throw new CaptchaError(`Captcha persistente en ${url}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return { data: JSON.parse(body) as T, totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1) };
}

async function fetchAllTerms(restBase: string) {
  const terms: WpTerm[] = [];
  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const res = await fetchJson<WpTerm[]>(`${SITE}/wp-json/wp/v2/${restBase}?per_page=100&page=${page}`);
    terms.push(...res.data);
    totalPages = res.totalPages;
  }
  return terms;
}

function decodeEntities(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// HTML limpio: sin shortcodes, sin atributos de presentación y con párrafos (como wpautop).
function cleanDescription(raw: string) {
  let html = raw
    .replace(/\[\/?[a-z0-9_-]+(?:\s[^\]]*)?\]/gi, "")
    .replace(/\s(?:style|class|id|data-[\w-]+)="[^"]*"/gi, "")
    .replace(/<p>\s*(?:&nbsp;)?\s*<\/p>/gi, "")
    .trim();
  if (!html) return null;
  if (!/<(?:p|ul|ol|h[1-6]|div|table|blockquote)[\s>]/i.test(html)) {
    html = html
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }
  return html;
}

function seoFrom(yoast: YoastHead | null | undefined): Term["seo"] {
  return {
    title: yoast?.title ? decodeEntities(yoast.title) : null,
    description: yoast?.description ? decodeEntities(yoast.description) : null,
    ogImage: yoast?.og_image?.[0]?.url ?? null,
  };
}

function toTerms(
  source: (WpTerm & { image?: string | null })[],
  seoById: Map<number, YoastHead | null | undefined>,
  basePath: string,
): Term[] {
  const byId = new Map(source.map((t) => [t.id, t]));
  const ancestry = (t: WpTerm): string[] => {
    const parent = byId.get(t.parent);
    return parent ? [...ancestry(parent), t.slug] : [t.slug];
  };
  return source.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: decodeEntities(t.name),
    parentSlug: byId.get(t.parent)?.slug ?? null,
    path: `${basePath}${ancestry(t).join("/")}/`,
    description: cleanDescription(t.description),
    image: t.image ?? null,
    count: t.count,
    seo: seoFrom(seoById.get(t.id)),
  }));
}

async function writeData(file: string, terms: Term[]) {
  await writeFile(path.join(DATA_DIR, file), JSON.stringify(terms, null, 2) + "\n");
}

function report(label: string, terms: Term[], urlPaths: Set<string>) {
  // SEO propio: Yoast con plantilla por defecto da "<nombre> archivos - …" y sin meta description.
  const hasOwnSeo = (t: Term) =>
    Boolean(t.seo.description) || !(t.seo.title ?? "").startsWith(`${t.name} archivos`);
  const list = (items: Term[]) => (items.length ? items.map((t) => t.slug).join(", ") : "—");
  const termPaths = new Set(terms.map((t) => t.path));

  console.log(`\n${label}: ${terms.length}`);
  console.log(`  sin descripción: ${list(terms.filter((t) => !t.description))}`);
  console.log(`  sin imagen: ${list(terms.filter((t) => !t.image))}`);
  console.log(`  sin SEO propio: ${list(terms.filter((t) => !hasOwnSeo(t)))}`);
  console.log(`  count 0: ${list(terms.filter((t) => t.count === 0))}`);
  console.log(`  path sin URL en urls.json: ${[...termPaths].filter((p) => !urlPaths.has(p)).join(", ") || "—"}`);
  console.log(`  URL de urls.json sin término: ${[...urlPaths].filter((p) => !termPaths.has(p)).join(", ") || "—"}`);
}

async function main() {
  const urls = JSON.parse(await readFile(path.join(DATA_DIR, "urls.json"), "utf8")) as {
    path: string;
    tipo: string;
  }[];
  const urlPathsOf = (tipo: string) => new Set(urls.filter((u) => u.tipo === tipo).map((u) => u.path));

  // Categorías: datos y imagen de la Store API; el SEO de Yoast solo viene en wp/v2.
  const store = (await fetchJson<StoreCategory[]>(`${SITE}/wp-json/wc/store/v1/products/categories`)).data;
  const productCat = await fetchAllTerms("product_cat");
  const categories = toTerms(
    store.map((c) => ({ ...c, image: c.image?.src ?? null })),
    new Map(productCat.map((t) => [t.id, t.yoast_head_json])),
    "/product-category/",
  );

  const taxonomies = (await fetchJson<Record<string, WpTaxonomy>>(`${SITE}/wp-json/wp/v2/taxonomies`)).data;
  const restBase = (slug: string) => {
    const tax = taxonomies[slug];
    if (!tax) throw new Error(`No existe la taxonomía ${slug}`);
    return tax.rest_base;
  };
  const coleccion = await fetchAllTerms(restBase("coleccion"));
  const procedencia = await fetchAllTerms(restBase("procedencia"));
  const collections = toTerms(coleccion, new Map(coleccion.map((t) => [t.id, t.yoast_head_json])), "/coleccion/");
  const procedencias = toTerms(
    procedencia,
    new Map(procedencia.map((t) => [t.id, t.yoast_head_json])),
    "/procedencia/",
  );

  await mkdir(DATA_DIR, { recursive: true });
  await writeData("categories.json", categories);
  await writeData("collections.json", collections);
  await writeData("procedencias.json", procedencias);

  report("Categorías", categories, urlPathsOf("product_cat"));
  report("Colecciones", collections, urlPathsOf("coleccion"));
  report("Procedencias", procedencias, urlPathsOf("procedencia"));
}

main().catch((err) => {
  console.error(err instanceof CaptchaError ? `DETENIDO: ${err.message}` : err);
  process.exit(1);
});
