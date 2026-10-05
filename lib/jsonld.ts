// Constructores de JSON-LD. Un campo que no existe se omite, nunca se inventa.

import { NOMBRE, SITE, absoluta } from "./seo";
import { EMPRESA, REDES, SEDES } from "./sitio";
import type { Post, Product } from "./data";

export const organizacion = () => [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: NOMBRE,
    url: `${SITE}/`,
    logo: absoluta("/media/marca/sediemobili.svg"),
    sameAs: REDES.map((red) => red.url),
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
    // Teléfono, correo y horario solo si existen: un campo vacío se omite, no se inventa.
    ...(sede.telefonos?.length ? { telephone: sede.telefonos[0] } : {}),
    ...(sede.correos?.length ? { email: sede.correos[0] } : {}),
    ...(sede.horario ? { openingHours: sede.horario } : {}),
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
  // Sin offers: el sitio es catálogo y no hay precio en ningún producto.
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluta(item.path)}#product`,
    name: item.name,
    url: absoluta(item.path),
    brand: { "@type": "Brand", name: NOMBRE },
    ...(item.images.length > 0 ? { image: item.images.map((imagen) => imagen.src) } : {}),
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
  ...(post.featuredImage ? { image: [post.featuredImage.src] } : {}),
});
