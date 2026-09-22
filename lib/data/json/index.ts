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

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const { category, collection, procedencia, limit, offset = 0 } = query;
  const products = await loadProducts();
  const categorySlugs = category ? withDescendants(await loadCategories(), category) : null;

  const filtered = products.filter(
    (product) =>
      (!categorySlugs || product.categories.some((slug) => categorySlugs.has(slug))) &&
      (!collection || product.collections.includes(collection)) &&
      (!procedencia || product.procedencia === procedencia),
  );
  return filtered.slice(offset, limit === undefined ? undefined : offset + limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await loadProducts()).find((product) => product.slug === slug) ?? null;
}

export const getProductsByCategory = (slug: string) => getProducts({ category: slug });
export const getProductsByCollection = (slug: string) => getProducts({ collection: slug });

export const getCategories = (): Promise<Category[]> => loadCategories();

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

export const getCollections = (): Promise<Collection[]> => loadCollections();

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
