// Búsqueda sobre los datos del sitio. Sin índice externo: con 157 productos y 6 posts
// basta con normalizar y comparar en memoria.

import type { Category, Collection, Post, Product } from "./data";

// Sin acentos, sin mayúsculas y sin signos: "sillón" y "sillon" buscan lo mismo.
export function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const terminos = (consulta: string) => normalizar(consulta).split(" ").filter(Boolean);

// Todas las palabras tienen que aparecer, en cualquier orden y en cualquier campo.
const coincide = (texto: string, palabras: string[]) => palabras.every((palabra) => texto.includes(palabra));

const sinEtiquetas = (html: string | null) => (html ?? "").replace(/<[^>]+>/g, " ");

export function buscarProductos(
  productos: Product[],
  palabras: string[],
  categorias: Category[],
  colecciones: Collection[],
) {
  if (palabras.length === 0) return [];
  const nombreCategoria = new Map(categorias.map((categoria) => [categoria.slug, categoria.name]));
  const nombreColeccion = new Map(colecciones.map((coleccion) => [coleccion.slug, coleccion.name]));

  return productos.filter((producto) => {
    const texto = normalizar(
      [
        producto.name,
        sinEtiquetas(producto.shortDescription),
        sinEtiquetas(producto.description),
        ...producto.categories.map((slug) => nombreCategoria.get(slug) ?? slug),
        ...producto.collections.map((slug) => nombreColeccion.get(slug) ?? slug),
      ].join(" "),
    );
    return coincide(texto, palabras);
  });
}

export function buscarPosts(posts: Post[], palabras: string[]) {
  if (palabras.length === 0) return [];
  return posts.filter((post) =>
    coincide(normalizar([post.title, sinEtiquetas(post.excerpt), sinEtiquetas(post.content)].join(" ")), palabras),
  );
}

export function buscarCategorias(categorias: Category[], palabras: string[]) {
  if (palabras.length === 0) return [];
  return categorias.filter((categoria) =>
    coincide(normalizar([categoria.name, sinEtiquetas(categoria.description)].join(" ")), palabras),
  );
}
