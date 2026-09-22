import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    // Provisional: las imágenes se sirven desde WordPress hasta que T06 las baje a public/media.
    remotePatterns: [{ protocol: "https", hostname: "sediemobili.com", pathname: "/wp-content/uploads/**" }],
  },
};

export default nextConfig;
