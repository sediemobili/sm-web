// Constructores de JSON-LD. Un campo que no existe se omite, nunca se inventa.

import { NOMBRE, SITE, absoluta, esDeWordPress } from "./seo";
import { EMPRESA, REDES, SEDES, TELEFONO } from "./sitio";
import type { Post, Product } from "./data";

// Imágenes para los datos estructurados: absolutas y nunca de sediemobili.com/wp-content/, el
// mismo filtro que las metaetiquetas (lib/seo.ts).
const imagenes = (srcs: (string | null | undefined)[]) => [
  ...new Set(srcs.filter((src): src is string => Boolean(src) && !esDeWordPress(src!)).map((src) => absoluta(src))),
];

// Red de seguridad para todo el JSON-LD del sitio (la aplica components/Seo/JsonLd.tsx): quita
// cualquier URL de WordPress que llegue por los datos, y el campo si se queda vacío.
export function sinWordPress<T>(valor: T): T {
  if (typeof valor === "string") return (esDeWordPress(valor) ? undefined : valor) as T;
  if (Array.isArray(valor)) return valor.map(sinWordPress).filter((v) => v !== undefined) as T;
  if (valor && typeof valor === "object") {
    const limpio: Record<string, unknown> = {};
    for (const [clave, v] of Object.entries(valor)) {
      const filtrado = sinWordPress(v);
      if (filtrado === undefined || (Array.isArray(filtrado) && filtrado.length === 0 && Array.isArray(v) && v.length > 0)) continue;
      limpio[clave] = filtrado;
    }
    return limpio as T;
  }
  return valor;
}

// Horario de atención del teléfono, en el formato de schema.org.
const horario = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: TELEFONO.horario.dias,
  opens: TELEFONO.horario.abre,
  closes: TELEFONO.horario.cierra,
};

export const organizacion = () => [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: NOMBRE,
    url: `${SITE}/`,
    logo: absoluta("/media/marca/sediemobili.svg"),
    sameAs: REDES.map((red) => red.url),
    telephone: TELEFONO.marcar,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: TELEFONO.marcar,
      contactType: "customer service",
      areaServed: EMPRESA.pais,
      availableLanguage: "es",
      hoursAvailable: horario,
    },
  },
  ...SEDES.map((sede) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE}/#${sede.slug}`,
    name: `${NOMBRE} ${sede.ciudad}`,
    url: `${SITE}/`,
    image: absoluta("/media/marca/sediemobili.svg"),
    parentOrganization: { "@id": `${SITE}/#organization` },
    address: {
      "@type": "PostalAddress",
      streetAddress: sede.calle,
      postalCode: sede.cp,
      addressLocality: sede.localidad,
      addressRegion: sede.region,
      addressCountry: EMPRESA.pais,
    },
    // Teléfono y horario: los del sitio, comunes a las dos sedes.
    telephone: TELEFONO.marcar,
    openingHoursSpecification: horario,
    // Correo solo si existe: un campo vacío se omite, no se inventa.
    ...(sede.correos?.length ? { email: sede.correos[0] } : {}),
  })),
];

export const migas = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, indice) => ({
    "@type": "ListItem",
    position: indice + 1,
    name: item.name,
    item: absoluta(item.path),
  })),
});

export function producto(item: Product, categoria: string | null) {
  // Las fotos que no dependen de WordPress; si no queda ninguna (fichas del JSON de WordPress),
  // la copia local de la primera, que es la misma de la og:image.
  const propias = imagenes(item.images.map((imagen) => imagen.src));
  const fotos = propias.length > 0 ? propias : imagenes([item.seo.ogImage]);
  // Sin offers: el sitio es catálogo y no hay precio en ningún producto.
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluta(item.path)}#product`,
    name: item.name,
    url: absoluta(item.path),
    brand: { "@type": "Brand", name: NOMBRE },
    ...(fotos.length > 0 ? { image: fotos } : {}),
    ...(categoria ? { category: categoria } : {}),
    ...(item.sku ? { sku: item.sku } : {}),
    ...(item.description ? { description: item.description.replace(/<[^>]+>/g, " ").trim() } : {}),
  };
}

export const listaItems = (nombre: string, items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: nombre,
  numberOfItems: items.length,
  itemListElement: items.map((item, indice) => ({
    "@type": "ListItem",
    position: indice + 1,
    name: item.name,
    url: absoluta(item.path),
  })),
});

export const articulo = (post: Post) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": `${absoluta(post.path)}#post`,
  headline: post.title,
  url: absoluta(post.path),
  datePublished: post.date,
  dateModified: post.modified,
  publisher: { "@id": `${SITE}/#organization` },
  ...(post.author ? { author: { "@type": "Person", name: post.author } } : {}),
  ...(imagenes([post.featuredImage?.src]).length > 0 ? { image: imagenes([post.featuredImage?.src]) } : {}),
});
