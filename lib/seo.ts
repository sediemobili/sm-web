// Utilidades de SEO: URLs absolutas, metadata y descripciones generadas.

import type { Metadata } from "next";
import { EMPRESA } from "./sitio";

export const SITE = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://sediemobili.com";
export const NOMBRE = EMPRESA.nombre;

export const absoluta = (ruta: string) => new URL(ruta, SITE).toString();

// La marca va una sola vez al final de cada título, siempre con este separador. La añade la
// plantilla del layout (app/(sitio)/layout.tsx); los títulos de Yoast ya la traen, con " - " o con
// " | " y sin "&", así que metadataDe se la quita antes y la plantilla la pone igual en todos.
export const SEPARADOR = " - ";
const MARCA = /Sedie\s*(?:&amp;|&|y)?\s*Mobili/i;
const MARCA_FINAL = new RegExp(`\\s*[-–—·|]\\s*${MARCA.source}\\s*$`, "i");
export const sinMarca = (titulo: string) => titulo.replace(MARCA_FINAL, "").trim();

// Imagen al compartir en redes (og:image y twitter:image). Vive en el repositorio: el escritorio
// Zero, la misma foto de la diapositiva del hero. La usan las páginas sin imagen propia.
// Las imágenes para compartir van en JPEG (public/media/og/): WebP no es fiable en las
// previsualizaciones de WhatsApp y Facebook. Las genera pnpm medios --og.
export const OG_RESPALDO = "/media/og/ZERO.jpg";

// og:image de una ficha de la API: su foto principal, convertida a JPEG por app/og/producto/.
export const ogProducto = (slug: string) => `/og/producto/${slug}.jpg`;

// Nada de sediemobili.com/wp-content/: el día que se apague WordPress, esa previsualización
// quedaría en blanco. Lo usan también los datos estructurados (lib/jsonld.ts).
const DE_WORDPRESS = /\/\/(?:www\.)?sediemobili\.com\/wp-content\//i;
export const esDeWordPress = (url: string) => DE_WORDPRESS.test(url);

type Candidata = string | null | undefined;

// La primera candidata, en orden, que no dependa de WordPress; si no queda ninguna, la de respaldo.
export function imagenCompartir(...candidatas: Candidata[]) {
  return candidatas.find((src): src is string => Boolean(src) && !esDeWordPress(src!)) ?? OG_RESPALDO;
}

type Opciones = {
  title: string;
  description: string;
  canonical: string;
  // Una imagen o varias candidatas en orden de preferencia.
  ogImage?: Candidata | Candidata[];
  noindex?: boolean;
  tipo?: "website" | "article";
};

export function metadataDe({ title, description, canonical, ogImage, noindex, tipo = "website" }: Opciones): Metadata {
  const url = absoluta(canonical);
  // Si la marca sigue dentro del título ("Acerca de Sedie & Mobili") va tal cual; si el título
  // era solo la marca, queda "Sedie & Mobili".
  const limpio = sinMarca(title);
  const completo = !limpio ? NOMBRE : MARCA.test(limpio) ? limpio : `${limpio}${SEPARADOR}${NOMBRE}`;
  const imagen = imagenCompartir(...(Array.isArray(ogImage) ? ogImage : [ogImage]));
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
      images: [{ url: imagen }],
    },
    twitter: { card: "summary_large_image", images: [imagen] },
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
