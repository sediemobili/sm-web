// Repositorio sobre data/*.json. Es la implementación activa mientras DATA_SOURCE=json.

import type {
  Breadcrumb,
  Category,
  CategoryWithHierarchy,
  Collection,
  DataRepository,
  Page,
  Post,
  Procedencia,
  Product,
  ProductPage,
  ProductQuery,
} from "../types";
import { loadCategories, loadCollections, loadPages, loadPosts, loadProcedencias, loadProducts } from "./load";

// WooCommerce asigna la categoría hija y la madre, pero se incluyen las descendientes
// para que una categoría madre nunca dependa de cómo quedó etiquetado el producto.
function withDescendants(categories: Category[], slug: string) {
  const slugs = new Set([slug]);
  for (let added = true; added; ) {
    added = false;
    for (const category of categories) {
      if (category.parentSlug && slugs.has(category.parentSlug) && !slugs.has(category.slug)) {
        slugs.add(category.slug);
        added = true;
      }
    }
  }
  return slugs;
}

function breadcrumbsFor(categories: Category[], category: Category): Breadcrumb[] {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const chain: Category[] = [];
  for (let current: Category | undefined = category; current; current = current.parentSlug ? bySlug.get(current.parentSlug) : undefined) {
    chain.unshift(current);
  }
  return chain.map((c) => ({ name: c.name, path: c.path }));
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
  const { category, collection, procedencia, limit, offset = 0 } = query;
  const products = await loadProducts();
  const categorySlugs = category ? withDescendants(await loadCategories(), category) : null;

  const filtered = products.filter(
    (product) =>
      (!categorySlugs || product.categories.some((slug) => categorySlugs.has(slug))) &&
      (!collection || product.collections.includes(collection)) &&
      (!procedencia || product.procedencia === procedencia),
  );
  return {
    items: filtered.slice(offset, limit === undefined ? undefined : offset + limit),
    total: filtered.length,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await loadProducts()).find((product) => product.slug === slug) ?? null;
}

export const getProductsByCategory = async (slug: string): Promise<Product[]> =>
  (await getProducts({ category: slug })).items;

export const getProductsByCollection = async (slug: string): Promise<Product[]> =>
  (await getProducts({ collection: slug })).items;

// Categorías y colecciones salen en el orden curado, no en el de WordPress.
const porOrden = <T extends { orden: number }>(terms: T[]) => [...terms].sort((a, b) => a.orden - b.orden);

export async function getCategories(): Promise<Category[]> {
  return porOrden(await loadCategories());
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithHierarchy | null> {
  const categories = await loadCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return null;
  return {
    ...category,
    parent: categories.find((c) => c.slug === category.parentSlug) ?? null,
    children: categories.filter((c) => c.parentSlug === category.slug),
    breadcrumbs: breadcrumbsFor(categories, category),
  };
}

export async function getCollections(): Promise<Collection[]> {
  return porOrden(await loadCollections());
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  return (await loadCollections()).find((collection) => collection.slug === slug) ?? null;
}

export const getProcedencias = (): Promise<Procedencia[]> => loadProcedencias();

export async function getProcedenciaBySlug(slug: string): Promise<Procedencia | null> {
  return (await loadProcedencias()).find((procedencia) => procedencia.slug === slug) ?? null;
}

// Los posts salen del más reciente al más antiguo, como el blog actual.
export async function getPosts(): Promise<Post[]> {
  return [...(await loadPosts())].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return (await loadPosts()).find((post) => post.slug === slug) ?? null;
}

export const getPages = (): Promise<Page[]> => loadPages();

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return (await loadPages()).find((page) => page.slug === slug) ?? null;
}

export const jsonRepository: DataRepository = {
  getProducts,
  getProductBySlug,
  getProductsByCategory,
  getProductsByCollection,
  getCategories,
  getCategoryBySlug,
  getCollections,
  getCollectionBySlug,
  getProcedencias,
  getProcedenciaBySlug,
  getPosts,
  getPostBySlug,
  getPages,
  getPageBySlug,
};
