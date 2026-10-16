// Repositorio sobre la API de catálogo de Sedie. Se elige con DATA_SOURCE=sedie-api.
// Los productos salen de la API; lo que la API no expone (colecciones, procedencias, categorías,
// posts y páginas) sigue viniendo del JSON de WordPress, igual que en el repositorio json.
//
// Publicados: los de la API y, además, los de WordPress sin pareja en ella, servidos del JSON y
// marcados con origen "wordpress". Un producto sin foto no sale en listados ni carruseles, pero
// su ficha existe: en cuanto Sedie le cargue la foto, aparece solo.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { jsonRepository } from "../json";
import { loadCategories, loadProducts } from "../json/load";
import type { Category, DataRepository, Product, ProductPage, ProductQuery } from "../types";
import { detalleProducto, listarProductos } from "./cliente";
import { aProducto, asignarSlugs, descripcionesGenericas, type Equivalencia } from "./mapeo";

async function cargarEquivalencias(): Promise<Equivalencia[]> {
  "use cache";
  cacheLife("max");
  const ruta = path.join(process.cwd(), "data", "api", "equivalencias-slug.json");
  return JSON.parse(await readFile(ruta, "utf8")) as Equivalencia[];
}

type Entrada = { producto: Product; apiSlug: string | null; generica: boolean; wp: Product | null };

// El catálogo entero, en el orden del sitio actual: primero los productos que ya existían en
// WordPress, en su orden, y detrás los nuevos de la API. Se recalcula cuando cambia el listado.
async function catalogo(): Promise<Entrada[]> {
  "use cache";
  cacheLife("hours");
  const [api, wp, equivalencias, categorias] = await Promise.all([
    listarProductos(),
    loadProducts(),
    cargarEquivalencias(),
    loadCategories(),
  ]);

  const enApi = new Set(api.map((p) => p.slug));
  // Solo cuentan las equivalencias cuyo producto sigue en la API.
  const wpPorApiSlug = new Map(
    equivalencias
      .filter((e) => e.estado === "inequivoco" && e.apiSlug && enApi.has(e.apiSlug))
      .map((e) => [e.apiSlug!, e.wpSlug]),
  );
  const apiPorWpSlug = new Map([...wpPorApiSlug].map(([apiSlug, wpSlug]) => [wpSlug, apiSlug]));
  const slugs = asignarSlugs(api, wpPorApiSlug, wp.map((p) => p.slug));
  const genericas = descripcionesGenericas(api);
  const wpPorSlug = new Map(wp.map((p) => [p.slug, p]));
  const apiPorSlug = new Map(api.map((p) => [p.slug, p]));

  const desdeApi = (apiSlug: string): Entrada => {
    const producto = apiPorSlug.get(apiSlug)!;
    const equivalente = wpPorSlug.get(wpPorApiSlug.get(apiSlug) ?? "") ?? null;
    const generica = genericas.has(apiSlug);
    return {
      producto: aProducto(producto, { slug: slugs.get(apiSlug)!.slug, wp: equivalente, generica, categorias }),
      apiSlug,
      generica,
      wp: equivalente,
    };
  };

  const deWordpress = wp.map((producto): Entrada => {
    const apiSlug = apiPorWpSlug.get(producto.slug);
    return apiSlug ? desdeApi(apiSlug) : { producto, apiSlug: null, generica: false, wp: producto };
  });
  const nuevos = api.filter((p) => !wpPorApiSlug.has(p.slug)).map((p) => desdeApi(p.slug));
  return [...deWordpress, ...nuevos];
}

const visible = (producto: Product) => producto.images.length > 0;

// Las madres incluyen a sus hijas, como en el repositorio json.
function conDescendientes(categorias: Category[], slug: string) {
  const slugs = new Set([slug]);
  for (let added = true; added; ) {
    added = false;
    for (const categoria of categorias) {
      if (categoria.parentSlug && slugs.has(categoria.parentSlug) && !slugs.has(categoria.slug)) {
        slugs.add(categoria.slug);
        added = true;
      }
    }
  }
  return slugs;
}

async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
  const { category, collection, procedencia, limit, offset = 0, incluirOcultos = false } = query;
  const [entradas, categorias] = await Promise.all([catalogo(), loadCategories()]);
  const deCategoria = category ? conDescendientes(categorias, category) : null;
  const filtrados = entradas
    .map((entrada) => entrada.producto)
    .filter(
      (producto) =>
        (incluirOcultos || visible(producto)) &&
        (!deCategoria || producto.categories.some((slug) => deCategoria.has(slug))) &&
        (!collection || producto.collections.includes(collection)) &&
        (!procedencia || producto.procedencia === procedencia),
    );
  return {
    items: filtrados.slice(offset, limit === undefined ? undefined : offset + limit),
    total: filtrados.length,
  };
}

// La ficha suma al producto del listado la galería y los documentos del detalle. Si el detalle
// falla o ya no existe, la ficha sigue con lo del listado.
async function getProductBySlug(slug: string): Promise<Product | null> {
  const entrada = (await catalogo()).find((e) => e.producto.slug === slug);
  if (!entrada) return null;
  if (!entrada.apiSlug) return entrada.producto;
  const detalle = await detalleProducto(entrada.apiSlug).catch((error: unknown) => {
    console.error(`[sedie-api] sin detalle para ${entrada.apiSlug}`, error);
    return null;
  });
  if (!detalle) return entrada.producto;
  return aProducto(detalle, {
    slug,
    wp: entrada.wp,
    generica: entrada.generica,
    categorias: await loadCategories(),
  });
}

export const sedieApiRepository: DataRepository = {
  ...jsonRepository,
  getProducts,
  getProductBySlug,
  getProductsByCategory: async (slug) => (await getProducts({ category: slug })).items,
  getProductsByCollection: async (slug) => (await getProducts({ collection: slug })).items,
};
