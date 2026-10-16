// Conversión de la API de Sedie al dominio del sitio. Sin dependencias de Next: todo es puro y
// se puede probar fuera del servidor.

import { normalizar } from "../../buscar";
import type { Category, Download, Product, Seo } from "../types";
import type { ProductoApi, ProductoDetalleApi } from "./cliente";
import { categoriaSitio } from "./correspondencias";

const MARCA = "Sedie & Mobili";

// Equivalencia de data/api/equivalencias-slug.json (la genera scripts/sync/catalogo.ts).
export type Equivalencia = {
  wpSlug: string;
  apiSlug: string | null;
  estado: "inequivoco" | "dudoso" | "sin-pareja";
};

// Slugs del sitio --------------------------------------------------------------------

export type Asignacion = { slug: string; colision: boolean };

// Slug del sitio para cada producto de la API. El que tiene equivalencia en WordPress conserva
// su slug actual. Los demás usan el último segmento ("sillas/centurion" → "centurion"); si ese
// slug ya está ocupado, llevan la categoría de la API como sufijo y, si aun así choca, un número.
// Los nuevos se recorren por slug de la API, así el resultado no depende del orden del listado.
export function asignarSlugs(api: ProductoApi[], wpPorApiSlug: Map<string, string>, slugsWp: Iterable<string>) {
  const ocupados = new Set(slugsWp);
  const asignados = new Map<string, Asignacion>();
  for (const producto of api) {
    const wpSlug = wpPorApiSlug.get(producto.slug);
    if (wpSlug) asignados.set(producto.slug, { slug: wpSlug, colision: false });
  }
  const nuevos = api.filter((p) => !asignados.has(p.slug)).sort((a, b) => a.slug.localeCompare(b.slug));
  for (const producto of nuevos) {
    const segmento = producto.slug.split("/").pop() || producto.slug;
    let slug = segmento;
    if (ocupados.has(slug)) slug = `${segmento}-${producto.categoria}`;
    for (let n = 2; ocupados.has(slug); n++) slug = `${segmento}-${producto.categoria}-${n}`;
    ocupados.add(slug);
    asignados.set(producto.slug, { slug, colision: slug !== segmento });
  }
  return asignados;
}

// Descripciones -----------------------------------------------------------------------

// Genérica: vacía, repetida en otro producto o que solo repite nombre y tipo ("Banca Aero — banca.").
export function descripcionesGenericas(api: ProductoApi[]) {
  const veces = new Map<string, number>();
  for (const p of api) {
    const texto = normalizar(p.descripcion ?? "");
    veces.set(texto, (veces.get(texto) ?? 0) + 1);
  }
  const genericas = new Set<string>();
  for (const p of api) {
    const texto = normalizar(p.descripcion ?? "");
    if (
      !texto ||
      (veces.get(texto) ?? 0) > 1 ||
      texto === normalizar(p.nombre) ||
      texto === normalizar(`${p.nombre} ${p.tipo ?? ""}`)
    )
      genericas.add(p.slug);
  }
  return genericas;
}

const escapar = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// La API trae texto plano; la ficha pinta HTML: se escapa y cada salto de línea es un párrafo.
function descripcionHtml(texto: string | null) {
  const parrafos = (texto ?? "")
    .split(/\n+/)
    .map((linea) => linea.trim())
    .filter(Boolean);
  return parrafos.length ? parrafos.map((p) => `<p>${escapar(p)}</p>`).join("") : null;
}

// Recorta en el último espacio antes de 160 caracteres, el largo útil de una meta description.
function recortar(texto: string, maximo = 160) {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= maximo) return limpio;
  const corte = limpio.lastIndexOf(" ", maximo - 1);
  return `${limpio.slice(0, corte > 0 ? corte : maximo - 1)}…`;
}

// SEO de un producto nuevo (sin Yoast): solo con datos que existen.
function seoNuevo(producto: ProductoApi, generica: boolean, categoria: string | null): Seo {
  const tipo = producto.tipo?.trim() || null;
  // La marca la añade la plantilla del título (lib/seo.ts), con el separador del sitio.
  const title = tipo ? `${producto.nombre} — ${tipo}` : producto.nombre;
  const partes = [tipo?.toLowerCase(), categoria ? `de la categoría ${categoria}` : null].filter(Boolean).join(" ");
  const description =
    !generica && producto.descripcion
      ? recortar(producto.descripcion)
      : `${producto.nombre}${partes ? `, ${partes}` : ""}, en el catálogo de ${MARCA}. Solicita tu cotización.`;
  return { title, description, ogImage: null };
}

// Producto -----------------------------------------------------------------------------

// Id numérico estable para los productos sin pareja en WordPress (FNV-1a del slug de la API),
// por encima de los ids de WooCommerce para que no choquen.
function idEstable(slug: string) {
  let hash = 0x811c9dc5;
  for (const c of slug) hash = Math.imul(hash ^ c.codePointAt(0)!, 0x01000193) >>> 0;
  return 1_000_000_000 + (hash % 1_000_000_000);
}

const extension = (url: string) => {
  const ruta = url.split(/[?#]/)[0];
  const punto = ruta.lastIndexOf(".");
  return punto > ruta.lastIndexOf("/") ? ruta.slice(punto + 1).toLowerCase() : null;
};

type Contexto = {
  slug: string;
  // El producto de WordPress equivalente: aporta lo que la API no trae (SEO de Yoast,
  // colecciones, procedencia, etiquetas, variaciones y, si la API no tiene, las fotos).
  wp: Product | null;
  generica: boolean;
  categorias: Category[];
};

export function aProducto(producto: ProductoApi | ProductoDetalleApi, { slug, wp, generica, categorias }: Contexto): Product {
  const madres = new Map(categorias.map((c) => [c.slug, c.parentSlug]));
  const categoria = categoriaSitio(producto.categoria, producto.tipo, (s) => madres.get(s) ?? null);
  const nombreCategoria = categorias.find((c) => c.slug === categoria)?.name ?? null;

  // En el listado solo llega la foto principal; el detalle suma la galería.
  const galeria = "galeria" in producto ? (producto.galeria ?? []) : [];
  const fotos = [...new Set([producto.imagen_principal, ...galeria].filter((src): src is string => Boolean(src)))];
  const documentos = "documentos" in producto ? (producto.documentos ?? []) : null;
  const downloads: Download[] | null = documentos
    ? documentos.map((d) => ({ tipo: "otro", label: d.nombre, url: d.url, extension: extension(d.url) }))
    : null;

  return {
    id: wp?.id ?? idEstable(producto.slug),
    slug,
    name: producto.nombre,
    path: `/product/${slug}/`,
    shortDescription: null,
    description: descripcionHtml(producto.descripcion),
    sku: producto.sku,
    // Modo cotización: la API todavía no trae precios.
    price: null,
    regularPrice: null,
    salePrice: null,
    currency: "MXN",
    stockStatus: producto.disponible === false ? "outofstock" : "instock",
    attributes: wp?.attributes ?? [],
    variations: wp?.variations ?? [],
    // Sin fotos en la API, el equivalente de WordPress conserva las suyas.
    images: fotos.length
      ? fotos.map((src, i) => ({ src, alt: i === 0 ? producto.nombre : `${producto.nombre} — vista ${i + 1}` }))
      : (wp?.images ?? []),
    categories: categoria ? [categoria] : [],
    collections: wp?.collections ?? [],
    procedencia: wp?.procedencia ?? null,
    tags: wp?.tags ?? [],
    specs: producto.especificaciones?.length
      ? producto.especificaciones.map((e) => ({ label: e.etiqueta, value: e.valor }))
      : null,
    downloads: downloads?.length ? downloads : null,
    acabados: (producto.acabados ?? []).map((a) => ({
      id: a.id,
      label: a.label,
      description: a.description,
      image: a.imagen_url,
    })),
    origen: "sedie-api",
    seo: wp?.seo ?? seoNuevo(producto, generica, nombreCategoria),
  };
}
