import type { MetadataRoute } from "next";
import { absoluta } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // La lista de cotización es privada y /gracias/ es una página de paso.
      disallow: ["/cotizacion/", "/gracias/"],
    },
    sitemap: absoluta("/sitemap.xml"),
  };
}
