import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { ListaCotizacion, type ProductoResumen } from "./ListaCotizacion";

// La lista es privada de cada visitante: ni se indexa ni entra en el sitemap.
export const metadata: Metadata = {
  title: "Lista de cotización",
  robots: { index: false, follow: false },
};

export default async function CotizacionPage() {
  const [{ items }, categorias] = await Promise.all([getProducts(), getCategories()]);
  const nombreCategoria = (slugs: string[]) => {
    const suyas = categorias.filter((categoria) => slugs.includes(categoria.slug));
    return (suyas.find((categoria) => categoria.parentSlug !== null) ?? suyas[0])?.name ?? null;
  };

  // Solo lo que la tabla necesita: los datos siguen viniendo de lib/data, no de la lista.
  const productos: ProductoResumen[] = items.map((producto) => ({
    slug: producto.slug,
    name: producto.name,
    path: producto.path,
    categoria: nombreCategoria(producto.categories),
    imagen: producto.images[0] ?? null,
    variaciones: producto.variations.map((variacion) => ({
      id: variacion.id,
      etiqueta: Object.values(variacion.attributes).join(" · "),
    })),
  }));

  return <ListaCotizacion productos={productos} />;
}
