// Lectura de data/*.json: cada archivo se lee una vez y queda en memoria.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import type { Category, Collection, Page, Post, Procedencia, Product, ProductImage, Section, Term } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");

const cache = new Map<string, Promise<unknown>>();

// "use cache" hace que la lectura de disco entre en el prerenderizado: sin esto, con
// cacheComponents activo, cualquier página que lea datos sería dinámica entera.
async function load<T>(file: string): Promise<T> {
  "use cache";
  // Los datos se regeneran en cada build: no tiene sentido revalidarlos por tiempo.
  cacheLife("max");
  return leer<T>(file);
}

function leer<T>(file: string): Promise<T> {
  const cached = cache.get(file);
  if (cached) return cached as Promise<T>;
  const pending = readFile(path.join(DATA_DIR, file), "utf8").then((raw) => JSON.parse(raw) as T);
  cache.set(file, pending);
  return pending;
}

// En WordPress los alt vienen vacíos: se arma uno a partir del contexto.
function withAlt(images: ProductImage[], base: string, altFor: (src: string) => string): ProductImage[] {
  const counts = new Map<string, number>();
  return images.map((image) => {
    if (image.alt.trim()) return image;
    const text = altFor(image.src) || base;
    const seen = counts.get(text) ?? 0;
    counts.set(text, seen + 1);
    return { ...image, alt: seen === 0 ? text : `${text} — vista ${seen + 1}` };
  });
}

function normalizeProduct(product: Product): Product {
  const variantAlt = new Map<string, string>();
  for (const variant of product.variations) {
    const value = Object.values(variant.attributes)[0];
    if (variant.image && value) variantAlt.set(variant.image, `${product.name} en ${value}`);
  }
  return {
    ...product,
    acabados: [],
    origen: "wordpress",
    images: withAlt(product.images, product.name, (src) => variantAlt.get(src) ?? product.name),
  };
}

function normalizeSections(sections: Section[] | null, title: string): Section[] | null {
  if (!sections) return null;
  return sections.map((section) => {
    if (!section.image || section.image.alt.trim()) return section;
    return { ...section, image: { ...section.image, alt: section.heading ?? title } };
  });
}

function normalizeEntry<T extends { title: string; featuredImage: ProductImage | null }>(entry: T): T {
  if (!entry.featuredImage || entry.featuredImage.alt.trim()) return entry;
  return { ...entry, featuredImage: { ...entry.featuredImage, alt: entry.title } };
}

export async function loadProducts(): Promise<Product[]> {
  return (await load<Product[]>("products.json")).map(normalizeProduct);
}

// WordPress titula sus páginas de archivo "Escritorios archivos - Sedie & Mobili": el
// "archivos" no le dice nada al visitante ni al buscador. Se quita al leer, antes de la marca
// si la hay; la marca la pone la plantilla del título (lib/seo.ts). Si no queda nada, null, y
// la página usa el nombre del término.
const SUFIJO_ARCHIVO = /\s+archivos(?=\s*(?:[-–—·|]\s*Sedie\b.*)?$)/i;

function normalizeTerm<T extends Term>(term: T): T {
  const title = term.seo.title?.replace(SUFIJO_ARCHIVO, "").trim() || null;
  return { ...term, seo: { ...term.seo, title } };
}

export const loadCategories = async () => (await load<Category[]>("categories.json")).map(normalizeTerm);
export const loadCollections = async () => (await load<Collection[]>("collections.json")).map(normalizeTerm);
export const loadProcedencias = async () => (await load<Procedencia[]>("procedencias.json")).map(normalizeTerm);

export async function loadPosts(): Promise<Post[]> {
  return (await load<Post[]>("posts.json")).map(normalizeEntry);
}

export async function loadPages(): Promise<Page[]> {
  const pages = await load<Page[]>("pages.json");
  return pages.map((page) => ({ ...normalizeEntry(page), sections: normalizeSections(page.sections, page.title) }));
}
