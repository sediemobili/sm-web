// Lista maestra de URLs del sitio actual a partir del sitemap de WordPress (Yoast).
// Uso: pnpm extract:sitemap  →  data/urls.json

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const INDEX_URL = "https://sediemobili.com/sitemap_index.xml";
const OUT_FILE = path.join(process.cwd(), "data", "urls.json");
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const MIN_INTERVAL_MS = 1000;

type Tipo =
  | "product"
  | "product_cat"
  | "coleccion"
  | "procedencia"
  | "post"
  | "page"
  | "archivo"
  | "otro";

// Yoast repite los archivos (tienda y blog) dentro de los sitemaps de producto y post.
const ARCHIVE_PATHS = new Set(["/catalogo/", "/blog/"]);

type UrlEntry = {
  url: string;
  path: string;
  tipo: Tipo;
  lastmod: string | null;
};

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
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8" },
  });
  const body = await res.text();
  return { res, body };
}

async function fetchXml(url: string) {
  let { res, body } = await fetchOnce(url);
  if (isCaptcha(res, body)) {
    ({ res, body } = await fetchOnce(url));
    if (isCaptcha(res, body)) throw new CaptchaError(`Captcha persistente en ${url}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return body;
}

function decode(text: string) {
  return text
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1")
    .trim()
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// Sitemaps de Yoast: estructura plana y predecible, basta con leer los bloques por etiqueta.
function readBlocks(xml: string, tag: "sitemap" | "url") {
  const blocks = xml.match(new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`, "g")) ?? [];
  return blocks.map((block) => {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1];
    return { loc: loc ? decode(loc) : null, lastmod: lastmod ? decode(lastmod) : null };
  });
}

// El tipo sale del nombre del sub-sitemap: product-sitemap.xml, product_cat-sitemap2.xml…
function tipoFromSitemap(sitemapUrl: string): Tipo {
  const name = path.basename(new URL(sitemapUrl).pathname).replace(/-sitemap\d*\.xml$/, "");
  if (name === "product" || name === "product_cat" || name === "post" || name === "page") return name;
  if (name.includes("coleccion")) return "coleccion";
  if (name === "procedencia") return "procedencia";
  return "otro";
}

async function main() {
  const index = readBlocks(await fetchXml(INDEX_URL), "sitemap");
  const sitemaps = index.map((s) => s.loc).filter((loc): loc is string => Boolean(loc));
  console.log(`Sub-sitemaps: ${sitemaps.length}`);

  const entries: UrlEntry[] = [];
  const seen = new Set<string>();
  for (const sitemap of sitemaps) {
    const tipo = tipoFromSitemap(sitemap);
    const urls = readBlocks(await fetchXml(sitemap), "url");
    console.log(`  ${sitemap} → ${tipo} (${urls.length})`);
    for (const { loc, lastmod } of urls) {
      if (!loc || seen.has(loc)) continue;
      seen.add(loc);
      const urlPath = new URL(loc).pathname;
      entries.push({ url: loc, path: urlPath, tipo: ARCHIVE_PATHS.has(urlPath) ? "archivo" : tipo, lastmod });
    }
  }

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(entries, null, 2) + "\n");

  const counts = new Map<Tipo, number>();
  for (const e of entries) counts.set(e.tipo, (counts.get(e.tipo) ?? 0) + 1);
  console.log(`\nTotal: ${entries.length} → ${path.relative(process.cwd(), OUT_FILE)}`);
  for (const [tipo, n] of counts) console.log(`  ${tipo}: ${n}`);

  const otros = entries.filter((e) => e.tipo === "otro");
  if (otros.length) {
    console.log("\nSin tipo (otro):");
    for (const e of otros) console.log(`  ${e.url}`);
  }
}

main().catch((err) => {
  console.error(err instanceof CaptchaError ? `DETENIDO: ${err.message}` : err);
  process.exit(1);
});
