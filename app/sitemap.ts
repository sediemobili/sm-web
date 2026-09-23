import type { MetadataRoute } from "next";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCategories, getCollections, getPosts, getProcedencias, getProducts } from "@/lib/data";
import { absoluta } from "@/lib/seo";

// lastmod del sitemap de WordPress: se reutiliza mientras el contenido no cambie aquí.
async function fechasPorRuta() {
  "use cache";
  // Los datos se regeneran en cada build.
  cacheLife("max");
  const crudo = await readFile(path.join(process.cwd(), "data", "urls.json"), "utf8");
  const urls = JSON.parse(crudo) as { path: string; lastmod: string | null }[];
  return new Map(urls.filter((url) => url.lastmod).map((url) => [url.path, new Date(url.lastmod as string)]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ items: productos }, categorias, colecciones, procedencias, posts, fechas] = await Promise.all([
    getProducts(),
    getCategories(),
    getCollections(),
    getProcedencias(),
    getPosts(),
    fechasPorRuta(),
  ]);

  // /cotizacion/ y /gracias/ quedan fuera: son páginas privadas o de paso.
  const rutas = [
    "/",
    "/catalogo/",
    "/blog/",
    "/nosotros/",
    "/venta-empresarial/",
    "/legal/",
    ...productos.map((producto) => producto.path),
    ...categorias.map((categoria) => categoria.path),
    ...colecciones.map((coleccion) => coleccion.path),
    ...procedencias.map((procedencia) => procedencia.path),
    ...posts.map((post) => post.path),
  ];

  return rutas.map((ruta) => {
    const lastModified = fechas.get(ruta);
    return { url: absoluta(ruta), ...(lastModified ? { lastModified } : {}) };
  });
}
