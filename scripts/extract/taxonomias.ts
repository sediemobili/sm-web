// Categorías, colecciones y procedencias del sitio actual (WooCommerce Store API + WP REST).
// Uso: pnpm extract:taxonomias  →  data/categories.json, data/collections.json, data/procedencias.json

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DATA_DIR,
  SITE,
  cleanHtml,
  decodeEntities,
  fetchAllPages,
  fetchJson,
  run,
  seoFrom,
  type Seo,
  type YoastHead,
} from "./lib.ts";

type Term = {
  id: number;
  slug: string;
  name: string;
  parentSlug: string | null;
  path: string;
  description: string | null;
  image: string | null;
  count: number;
  orden: number;
  seo: Seo;
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

// Orden curado del mega-menú del sitio actual, que la API de WordPress no expone.
// Bancas va al final: hoy falta en el mega-menú del sitio, pero es un olvido, no una decisión.
const ORDEN_CATEGORIAS = [
  "escritorios",
  "recepciones",
  "sillas-de-oficina",
  "sofas",
  "soft-seating",
  "mesas",
  "taburetes",
  "bancas",
];

const ORDEN_COLECCIONES = [
  "quadri",
  "versatil",
  "larus",
  "lithos",
  "uno-zero",
  "temx",
  "air-duo",
  "basic",
  "dinamo",
];

// Los términos de la lista curada van primero y en ese orden; el resto, alfabético al final.
function ordenar(terms: Term[], curado: string[]): Term[] {
  const posicion = (slug: string) => {
    const index = curado.indexOf(slug);
    return index === -1 ? curado.length : index;
  };
  return [...terms]
    .sort((a, b) => posicion(a.slug) - posicion(b.slug) || a.name.localeCompare(b.name, "es"))
    .map((term, index) => ({ ...term, orden: index }));
}

const fetchAllTerms = (restBase: string) => fetchAllPages<WpTerm>(`${SITE}/wp-json/wp/v2/${restBase}`);

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
    description: cleanHtml(t.description),
    image: t.image ?? null,
    count: t.count,
    orden: 0, // lo asigna ordenar()
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
  const categories = ordenar(toTerms(
    store.map((c) => ({ ...c, image: c.image?.src ?? null })),
    new Map(productCat.map((t) => [t.id, t.yoast_head_json])),
    "/product-category/",
  ), ORDEN_CATEGORIAS);

  const taxonomies = (await fetchJson<Record<string, WpTaxonomy>>(`${SITE}/wp-json/wp/v2/taxonomies`)).data;
  const restBase = (slug: string) => {
    const tax = taxonomies[slug];
    if (!tax) throw new Error(`No existe la taxonomía ${slug}`);
    return tax.rest_base;
  };
  const coleccion = await fetchAllTerms(restBase("coleccion"));
  const procedencia = await fetchAllTerms(restBase("procedencia"));
  const collections = ordenar(
    toTerms(coleccion, new Map(coleccion.map((t) => [t.id, t.yoast_head_json])), "/coleccion/"),
    ORDEN_COLECCIONES,
  );
  // Procedencias no tienen orden curado: alfabético, pero llevan el campo para no romper el tipo.
  const procedencias = ordenar(
    toTerms(procedencia, new Map(procedencia.map((t) => [t.id, t.yoast_head_json])), "/procedencia/"),
    [],
  );

  await mkdir(DATA_DIR, { recursive: true });
  await writeData("categories.json", categories);
  await writeData("collections.json", collections);
  await writeData("procedencias.json", procedencias);

  report("Categorías", categories, urlPathsOf("product_cat"));
  report("Colecciones", collections, urlPathsOf("coleccion"));
  report("Procedencias", procedencias, urlPathsOf("procedencia"));
}

run(main);
