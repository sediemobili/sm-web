// Filtros de listado compartidos por /catalogo/ y /product-category/[...slug]/.
// Viven en la URL, así que cada combinación es enlazable y la puede seguir Google.

import type { Category, Collection, Procedencia, Product } from "./data";

export type Filtros = {
  categoria?: string;
  coleccion?: string;
  procedencia?: string;
  pagina: number;
};

export const POR_PAGINA = 24;

type Parametros = Record<string, string | string[] | undefined>;

const primero = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor) || undefined;

export function leerFiltros(parametros: Parametros): Filtros {
  const pagina = Number(primero(parametros.pagina));
  return {
    categoria: primero(parametros.categoria),
    coleccion: primero(parametros.coleccion),
    procedencia: primero(parametros.procedencia),
    pagina: Number.isFinite(pagina) && pagina > 1 ? Math.floor(pagina) : 1,
  };
}

// Solo se escriben los parámetros que no son el valor por defecto: la URL queda limpia.
export function construirUrl(base: string, filtros: Filtros, cambios: Partial<Filtros>) {
  const siguiente = { ...filtros, ...cambios };
  const query = new URLSearchParams();
  if (siguiente.categoria) query.set("categoria", siguiente.categoria);
  if (siguiente.coleccion) query.set("coleccion", siguiente.coleccion);
  if (siguiente.procedencia) query.set("procedencia", siguiente.procedencia);
  if (siguiente.pagina > 1) query.set("pagina", String(siguiente.pagina));
  const texto = query.toString();
  return texto ? `${base}?${texto}` : base;
}

export const hayFiltros = (filtros: Filtros) =>
  Boolean(filtros.categoria || filtros.coleccion || filtros.procedencia);

// Una categoría incluye a sus descendientes, igual que en lib/data.
function conDescendientes(categorias: Category[], slug: string) {
  const slugs = new Set([slug]);
  for (let creció = true; creció; ) {
    creció = false;
    for (const categoria of categorias) {
      if (categoria.parentSlug && slugs.has(categoria.parentSlug) && !slugs.has(categoria.slug)) {
        slugs.add(categoria.slug);
        creció = true;
      }
    }
  }
  return slugs;
}

export function aplicarFiltros(productos: Product[], filtros: Filtros, categorias: Category[]) {
  const slugs = filtros.categoria ? conDescendientes(categorias, filtros.categoria) : null;
  return productos.filter(
    (producto) =>
      (!slugs || producto.categories.some((slug) => slugs.has(slug))) &&
      (!filtros.coleccion || producto.collections.includes(filtros.coleccion)) &&
      (!filtros.procedencia || producto.procedencia === filtros.procedencia),
  );
}

export type Opciones = {
  categorias: Category[];
  colecciones: Collection[];
  procedencias: Procedencia[];
};

// Dentro de un ámbito (una categoría) solo se ofrecen las opciones que existen en él.
export function opcionesDe(
  productos: Product[],
  { categorias, colecciones, procedencias }: Opciones,
  ambitoCategoria?: string,
): Opciones {
  const enProductos = new Set(productos.flatMap((producto) => producto.categories));
  const enColecciones = new Set(productos.flatMap((producto) => producto.collections));
  const enProcedencias = new Set(productos.map((producto) => producto.procedencia).filter(Boolean));
  const descendientes = ambitoCategoria ? conDescendientes(categorias, ambitoCategoria) : null;

  return {
    categorias: categorias.filter(
      (categoria) =>
        enProductos.has(categoria.slug) &&
        (!descendientes || (descendientes.has(categoria.slug) && categoria.slug !== ambitoCategoria)),
    ),
    colecciones: colecciones.filter((coleccion) => enColecciones.has(coleccion.slug)),
    procedencias: procedencias.filter((procedencia) => enProcedencias.has(procedencia.slug)),
  };
}
