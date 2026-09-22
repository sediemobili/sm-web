// Especificaciones y descargables desde el HTML público de cada ficha /product/[slug]/.
// Uso: pnpm extract:fichas  →  actualiza specs y downloads en data/products.json

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DATA_DIR,
  SITE,
  decodeEntities,
  fetchHead,
  fetchText,
  run,
  type Download,
  type DownloadTipo,
  type Spec,
} from "./lib.ts";

type ProductRecord = { id: number; slug: string; path: string; specs: Spec[] | null; downloads: Download[] | null };

type Ficha = {
  found: boolean;
  downloads: Download[];
  specs: Spec[];
  broken: string[]; // enlaces con href vacío o "#"
  unlinked: string[]; // iconos del acordeón sin enlace (campo vacío en WP)
};

const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

const text = (html: string) =>
  decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

function tipoFromLabel(label: string): DownloadTipo {
  const l = label.toLowerCase();
  if (l.includes("modelo 3d")) return "modelo3d";
  if (l.includes("dwg")) return "dwg";
  if (l.includes("instructivo")) return "instructivo";
  if (l.includes("ficha")) return "ficha_tecnica";
  if (l.includes("video")) return "video";
  return "otro";
}

function extensionOf(url: string) {
  const ext = path.extname(new URL(url).pathname).slice(1).toLowerCase();
  return ext || null;
}

// El bloque va del título "Especificaciones" al formulario de compra que le sigue en la plantilla.
function parseFicha(html: string): Ficha {
  const ficha: Ficha = { found: false, downloads: [], specs: [], broken: [], unlinked: [] };
  const start = html.search(/<h2[^>]*>\s*Especificaciones\s*<\/h2>/i);
  if (start < 0) return ficha;
  ficha.found = true;
  const end = html.indexOf("product-add-to-cart", start);
  const block = html.slice(start, end < 0 ? undefined : end).replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, "");

  for (const [item] of block.matchAll(/<details[\s\S]*?<\/details>/gi)) {
    const title = text(item.match(/e-n-accordion-item-title-text">([\s\S]*?)<\/div>/)?.[1] ?? "");

    if (/descargables/i.test(title)) {
      for (const [, box] of item.matchAll(/<h3 class="elementor-icon-box-title">([\s\S]*?)<\/h3>/gi)) {
        const label = text(box);
        const href = box.match(/<a[^>]*href="([^"]*)"/)?.[1];
        if (href === undefined) ficha.unlinked.push(label);
        else if (!href.trim() || href.trim() === "#") ficha.broken.push(label);
        else {
          const url = decodeEntities(href.trim());
          ficha.downloads.push({ tipo: tipoFromLabel(label), label, url, extension: extensionOf(url) });
        }
      }
      continue;
    }

    // Cualquier otro panel del bloque es especificación: filas de tabla o el texto del panel.
    const rows = [...item.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map(([row]) =>
      [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map(([, cell]) => text(cell)),
    );
    const pairs = rows.filter((cells) => cells.length >= 2 && cells[0]);
    if (pairs.length) ficha.specs.push(...pairs.map(([label, ...rest]) => ({ label, value: rest.join(" ") })));
    else {
      const body = text(item.replace(/<summary[\s\S]*?<\/summary>/i, ""));
      if (body) ficha.specs.push({ label: title, value: body });
    }
  }
  return ficha;
}

async function main() {
  const products = JSON.parse(await readFile(PRODUCTS_FILE, "utf8")) as ProductRecord[];
  const sinBloque: string[] = [];
  const vacios: string[] = [];
  const rotos: string[] = [];

  for (const p of products) {
    const { body } = await fetchText(`${SITE}${p.path}`, "text/html");
    const ficha = parseFicha(body);
    if (!ficha.found) sinBloque.push(p.slug);
    else if (!ficha.downloads.length && !ficha.specs.length) vacios.push(p.slug);
    for (const label of ficha.broken) rotos.push(`${p.slug}: ${label} (href vacío o #)`);
    p.downloads = ficha.downloads.length ? ficha.downloads : null;
    p.specs = ficha.specs.length ? ficha.specs : null;
  }

  await writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2) + "\n");

  // Peso: HEAD a cada URL única; los 4xx/5xx también cuentan como enlaces rotos.
  const urls = [...new Set(products.flatMap((p) => p.downloads ?? []).map((d) => d.url))];
  let bytes = 0;
  let sinLength = 0;
  for (const url of urls) {
    const head = await fetchHead(url);
    if (head.status >= 400) rotos.push(`${url} (HTTP ${head.status})`);
    else if (head.length === null) sinLength++;
    else bytes += head.length;
  }

  const all = products.flatMap((p) => p.downloads ?? []);
  const porTipo = new Map<string, { productos: Set<string>; enlaces: number }>();
  for (const p of products)
    for (const d of p.downloads ?? []) {
      const entry = porTipo.get(d.tipo) ?? { productos: new Set(), enlaces: 0 };
      entry.productos.add(p.slug);
      entry.enlaces++;
      porTipo.set(d.tipo, entry);
    }

  console.log(`\nProductos con descargables: ${products.filter((p) => p.downloads).length} de ${products.length}`);
  console.log(`Enlaces: ${all.length} (${urls.length} URLs únicas)`);
  for (const [tipo, e] of porTipo) console.log(`  ${tipo}: ${e.productos.size} productos, ${e.enlaces} enlaces`);
  console.log(`Extensiones: ${[...new Set(all.map((d) => d.extension))].join(", ")}`);
  console.log(`Etiquetas "otro": ${[...new Set(all.filter((d) => d.tipo === "otro").map((d) => d.label))].join(", ") || "—"}`);
  console.log(`Productos con specs: ${products.filter((p) => p.specs).length}`);
  console.log(`\nSin bloque Especificaciones: ${sinBloque.join(", ") || "—"}`);
  console.log(`Acordeón sin contenido (${vacios.length}): ${vacios.join(", ") || "—"}`);
  console.log(`Enlaces rotos o vacíos (${rotos.length}):${rotos.length ? "\n  " + rotos.join("\n  ") : " —"}`);
  console.log(
    `\nPeso estimado: ${(bytes / 1024 / 1024).toFixed(1)} MB` +
      (sinLength ? ` (${sinLength} URLs sin Content-Length, no incluidas)` : ""),
  );
}

run(main);
