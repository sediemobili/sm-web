// Lectura de data/*.json: cada archivo se lee una vez y queda en memoria.

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Category, Collection, Page, Post, Procedencia, Product, ProductImage, Section } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");

const cache = new Map<string, Promise<unknown>>();

function load<T>(file: string): Promise<T> {
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

export const loadCategories = () => load<Category[]>("categories.json");
export const loadCollections = () => load<Collection[]>("collections.json");
export const loadProcedencias = () => load<Procedencia[]>("procedencias.json");

export async function loadPosts(): Promise<Post[]> {
  return (await load<Post[]>("posts.json")).map(normalizeEntry);
}

export async function loadPages(): Promise<Page[]> {
  const pages = await load<Page[]>("pages.json");
  return pages.map((page) => ({ ...normalizeEntry(page), sections: normalizeSections(page.sections, page.title) }));
}
