// Utilidades de SEO: URLs absolutas, metadata y descripciones generadas.

import type { Metadata } from "next";

export const SITE = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://sediemobili.com";
export const NOMBRE = "Sedie & Mobili";

export const absoluta = (ruta: string) => new URL(ruta, SITE).toString();

type Opciones = {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string | null;
  noindex?: boolean;
  tipo?: "website" | "article";
};

export function metadataDe({ title, description, canonical, ogImage, noindex, tipo = "website" }: Opciones): Metadata {
  const url = absoluta(canonical);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: tipo,
      siteName: NOMBRE,
      locale: "es_MX",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

// Descripciones generadas cuando Yoast no trae una. Solo se usan datos que existen:
// nombre, categoría y número de productos. Nada de atributos inventados.
export const descripcionProducto = (nombre: string, categoria: string | null) =>
  categoria
    ? `${nombre}, ${categoria.toLowerCase()} del catálogo de mobiliario de oficina de ${NOMBRE}. Solicita tu cotización.`
    : `${nombre} en el catálogo de mobiliario de oficina de ${NOMBRE}. Solicita tu cotización.`;

export const descripcionListado = (nombre: string, total: number) =>
  `${total} ${total === 1 ? "producto" : "productos"} de ${nombre} en ${NOMBRE}, fabricante de mobiliario de oficina y sillería profesional.`;

export const descripcionPost = (titulo: string) => `${titulo}. Artículo del blog de ${NOMBRE}.`;
