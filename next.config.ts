import type { NextConfig } from "next";

// URLs de WordPress que no se replican. La lista maestra está en docs/redirects.md.
const REDIRECTS = [
  { source: "/m", destination: "/" },
  { source: "/category/uncategorized", destination: "/blog/" },
  { source: "/tag/diseno-2", destination: "/blog/" },
  { source: "/tag/oficinas", destination: "/blog/" },
  { source: "/product-tag/escolar", destination: "/product-category/sillas-de-oficina/sillas-escolares/" },
  { source: "/product-tag/silla", destination: "/product-category/sillas-de-oficina/" },
  { source: "/product-tag/sillas", destination: "/product-category/sillas-de-oficina/" },
];

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Partial Prerendering. En Next 16 no hay bandera por ruta: cacheComponents lo activa
  // en toda la app. Cada página sirve su shell estático y transmite lo dinámico.
  cacheComponents: true,
  // Con trailingSlash, el source va sin barra y el destino con ella: así no hay un segundo salto.
  async redirects() {
    return REDIRECTS.map((redirect) => ({ ...redirect, permanent: true }));
  },
  images: {
    // Provisional: las imágenes se sirven desde WordPress hasta que T06 las baje a public/media.
    remotePatterns: [{ protocol: "https", hostname: "sediemobili.com", pathname: "/wp-content/uploads/**" }],
  },
};

export default nextConfig;
