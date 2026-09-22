// Productos del sitio actual (WooCommerce Store API + wp/v2 para taxonomías propias y Yoast).
// Uso: pnpm extract:productos  →  data/products.json

import { readFile, writeFile } from "node:fs/promises";
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
  type Download,
  type Seo,
  type Spec,
  type YoastHead,
} from "./lib.ts";

type StoreImage = { src: string; alt: string };

type StorePrices = {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_minor_unit: number;
};

type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  type: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  prices: StorePrices;
  images: StoreImage[];
  categories: { slug: string }[];
  tags: { slug: string }[];
  attributes: { name: string; terms: { name: string; slug: string }[] }[];
  variations: { id: number; attributes: { name: string; value: string }[] }[];
  is_in_stock: boolean;
  is_on_backorder: boolean;
  stock_availability: { class: string };
};

type WpProduct = {
  id: number;
  coleccion: number[];
  procedencia: number[];
  acf: unknown;
  meta: Record<string, unknown>;
  yoast_head_json?: YoastHead | null;
};

type Variation = {
  id: number;
  sku: string | null;
  attributes: Record<string, string>;
  price: number | null;
  stockStatus: string;
  image: string | null;
};

type Product = {
  id: number;
  slug: string;
  name: string;
  path: string;
  shortDescription: string | null;
  description: string | null;
  sku: string | null;
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  currency: string;
  stockStatus: string;
  attributes: { name: string; options: string[] }[];
  variations: Variation[];
  images: { src: string; alt: string }[];
  categories: string[];
  collections: string[];
  procedencia: string | null;
  tags: string[];
  specs: Spec[] | null;
  downloads: Download[] | null;
  seo: Seo;
};

// La Store API da los precios en unidades menores ("150000" = 1500.00). En modo catálogo
// WooCommerce devuelve "0": sin precio se guarda null, como pide el modelo de datos.
function toPrice(value: string, minorUnit: number) {
  const n = Number(value);
  return value && n > 0 ? n / 10 ** minorUnit : null;
}

// Mismos valores que WooCommerce guarda en _stock_status.
function toStockStatus(p: Pick<StoreProduct, "is_on_backorder" | "stock_availability">) {
  if (p.is_on_backorder) return "onbackorder";
  return p.stock_availability.class === "out-of-stock" ? "outofstock" : "instock";
}

async function readTermSlugs(file: string) {
  const terms = JSON.parse(await readFile(path.join(DATA_DIR, file), "utf8")) as { id: number; slug: string }[];
  return new Map(terms.map((t) => [t.id, t.slug]));
}

async function readPrevious() {
  try {
    const products = JSON.parse(await readFile(path.join(DATA_DIR, "products.json"), "utf8")) as Product[];
    return new Map(products.map((p) => [p.id, p]));
  } catch {
    return new Map<number, Product>();
  }
}

function isEmptyCustomFields(p: WpProduct) {
  const acfEmpty = Array.isArray(p.acf) ? p.acf.length === 0 : !p.acf;
  const metaKeys = Object.keys(p.meta ?? {}).filter((k) => !k.startsWith("_"));
  return acfEmpty && metaKeys.length === 0;
}

async function main() {
  const store = await fetchAllPages<StoreProduct>(`${SITE}/wp-json/wc/store/v1/products`);
  const wp = new Map((await fetchAllPages<WpProduct>(`${SITE}/wp-json/wp/v2/product`)).map((p) => [p.id, p]));
  const collectionSlugs = await readTermSlugs("collections.json");
  const procedenciaSlugs = await readTermSlugs("procedencias.json");
  // specs y downloads los llena fichas.ts desde el HTML; se conservan al regenerar.
  const previous = await readPrevious();

  const products: Product[] = [];
  const warnings: string[] = [];

  for (const p of store) {
    const extra = wp.get(p.id);
    if (!extra) warnings.push(`sin registro wp/v2: ${p.slug}`);
    else if (!isEmptyCustomFields(extra)) warnings.push(`campos propios sin mapear: ${p.slug}`);

    const variations: Variation[] = [];
    for (const v of p.variations) {
      const detail = (await fetchJson<StoreProduct>(`${SITE}/wp-json/wc/store/v1/products/${v.id}`)).data;
      const attributes: Record<string, string> = {};
      for (const a of v.attributes) {
        const term = p.attributes.find((pa) => pa.name === a.name)?.terms.find((t) => t.slug === a.value);
        attributes[decodeEntities(a.name)] = term ? decodeEntities(term.name) : a.value;
      }
      variations.push({
        id: v.id,
        sku: detail.sku || null,
        attributes,
        price: toPrice(detail.prices.price, detail.prices.currency_minor_unit),
        stockStatus: toStockStatus(detail),
        image: detail.images[0]?.src ?? null,
      });
    }

    const procedencias = (extra?.procedencia ?? []).map((id) => procedenciaSlugs.get(id) ?? String(id));
    if (procedencias.length > 1) warnings.push(`más de una procedencia: ${p.slug}`);

    products.push({
      id: p.id,
      slug: p.slug,
      name: decodeEntities(p.name),
      path: `/product/${p.slug}/`,
      shortDescription: cleanHtml(p.short_description),
      description: cleanHtml(p.description),
      sku: p.sku || null,
      price: toPrice(p.prices.price, p.prices.currency_minor_unit),
      regularPrice: toPrice(p.prices.regular_price, p.prices.currency_minor_unit),
      salePrice: toPrice(p.prices.sale_price, p.prices.currency_minor_unit),
      currency: p.prices.currency_code,
      stockStatus: toStockStatus(p),
      attributes: p.attributes.map((a) => ({
        name: decodeEntities(a.name),
        options: a.terms.map((t) => decodeEntities(t.name)),
      })),
      variations,
      images: p.images.map((i) => ({ src: i.src, alt: decodeEntities(i.alt) })),
      categories: p.categories.map((c) => c.slug),
      collections: (extra?.coleccion ?? []).map((id) => collectionSlugs.get(id) ?? String(id)),
      procedencia: procedencias[0] ?? null,
      tags: p.tags.map((t) => t.slug),
      specs: previous.get(p.id)?.specs ?? null,
      downloads: previous.get(p.id)?.downloads ?? null,
      seo: seoFrom(extra?.yoast_head_json),
    });
  }

  await writeFile(path.join(DATA_DIR, "products.json"), JSON.stringify(products, null, 2) + "\n");

  const urls = JSON.parse(await readFile(path.join(DATA_DIR, "urls.json"), "utf8")) as { path: string; tipo: string }[];
  const urlPaths = new Set(urls.filter((u) => u.tipo === "product").map((u) => u.path));
  const productPaths = new Set(products.map((p) => p.path));
  const count = (fn: (p: Product) => boolean) => products.filter(fn).length;
  const slugs = (fn: (p: Product) => boolean) => products.filter(fn).map((p) => p.slug).join(", ") || "—";

  console.log(`\nProductos: ${products.length}`);
  console.log(`Variaciones: ${products.reduce((n, p) => n + p.variations.length, 0)}`);
  console.log(`Imágenes: ${products.reduce((n, p) => n + p.images.length, 0)}`);
  console.log("\nCobertura:");
  console.log(`  SKU: ${count((p) => Boolean(p.sku) || p.variations.some((v) => v.sku))}`);
  console.log(`  precio: ${count((p) => p.price !== null || p.variations.some((v) => v.price !== null))}`);
  console.log(`  stock: ${count((p) => Boolean(p.stockStatus))} (agotados: ${count((p) => p.stockStatus === "outofstock")})`);
  console.log(`  atributos: ${count((p) => p.attributes.length > 0)}`);
  console.log(`  variaciones: ${count((p) => p.variations.length > 0)}`);
  console.log(`  colección: ${count((p) => p.collections.length > 0)}`);
  console.log(`  procedencia: ${count((p) => p.procedencia !== null)}`);
  console.log(`  tags: ${count((p) => p.tags.length > 0)}`);
  console.log(`  SEO description: ${count((p) => p.seo.description !== null)}`);
  console.log(`\nSin imagen: ${slugs((p) => p.images.length === 0)}`);
  console.log(`Sin descripción: ${count((p) => !p.description && !p.shortDescription)}`);
  console.log(`Sin categoría: ${slugs((p) => p.categories.length === 0)}`);
  console.log(`Agotados: ${slugs((p) => p.stockStatus === "outofstock")}`);
  console.log(`\npath sin URL en urls.json: ${[...productPaths].filter((p) => !urlPaths.has(p)).join(", ") || "—"}`);
  console.log(`URL de urls.json sin producto: ${[...urlPaths].filter((p) => !productPaths.has(p)).join(", ") || "—"}`);
  if (warnings.length) console.log(`\nAvisos:\n  ${warnings.join("\n  ")}`);
}

run(main);
