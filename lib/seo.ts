// Utilidades de SEO: URLs absolutas, metadata y descripciones generadas.

import type { Metadata } from "next";
import { EMPRESA } from "./sitio";

export const SITE = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://sediemobili.com";
export const NOMBRE = EMPRESA.nombre;

export const absoluta = (ruta: string) => new URL(ruta, SITE).toString();

// La marca va una sola vez al final de cada título, siempre con este separador. La añade la
// plantilla del layout (app/layout.tsx); los títulos de Yoast ya la traen, con " - " o con
// " | " y sin "&", así que metadataDe se la quita antes y la plantilla la pone igual en todos.
export const SEPARADOR = " - ";
const MARCA = /Sedie\s*(?:&amp;|&|y)?\s*Mobili/i;
const MARCA_FINAL = new RegExp(`\\s*[-–—·|]\\s*${MARCA.source}\\s*$`, "i");
export const sinMarca = (titulo: string) => titulo.replace(MARCA_FINAL, "").trim();

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
  // Si la marca sigue dentro del título ("Acerca de Sedie & Mobili") va tal cual; si el título
  // era solo la marca, queda "Sedie & Mobili".
  const limpio = sinMarca(title);
  const completo = !limpio ? NOMBRE : MARCA.test(limpio) ? limpio : `${limpio}${SEPARADOR}${NOMBRE}`;
  return {
    title: completo === `${limpio}${SEPARADOR}${NOMBRE}` ? limpio : { absolute: completo },
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: completo,
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
