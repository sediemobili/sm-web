// og:image de las fichas que vienen de la API de Sedie: su foto principal, convertida a JPEG.
// La API sirve WebP, que no es fiable en las previsualizaciones de WhatsApp y Facebook.
// URL: /og/producto/[slug].jpg (la arma ogProducto, en lib/seo.ts).

import { cacheLife } from "next/cache";
import sharp from "sharp";
import { getProducts } from "@/lib/data";
import { ogProducto } from "@/lib/seo";

// Mismo tamaño y calidad que las de public/media/og/ (scripts/extract/medios.ts).
const LADO = 1200;
const CALIDAD = 82;

// La conversión se guarda en caché: una por foto, no una por cada vez que alguien comparte.
async function aJpeg(src: string) {
  "use cache";
  cacheLife("days");
  const respuesta = await fetch(src);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} al pedir ${src}`);
  const jpeg = await sharp(Buffer.from(await respuesta.arrayBuffer()))
    .resize({ width: LADO, height: LADO, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: CALIDAD, mozjpeg: true })
    .toBuffer();
  return new Uint8Array(jpeg);
}

export async function GET(_request: Request, ctx: RouteContext<"/og/producto/[archivo]">) {
  const { archivo } = await ctx.params;
  const slug = archivo.endsWith(".jpg") ? archivo.slice(0, -".jpg".length) : null;
  if (!slug) return new Response(null, { status: 404 });

  // Solo responde por los productos cuya og:image es esta ruta: los de la API con foto
  // principal. En el listado, su primera imagen es justo esa foto principal.
  const { items } = await getProducts({ incluirOcultos: true });
  const producto = items.find((item) => item.slug === slug);
  const src = producto?.seo.ogImage === ogProducto(slug) ? producto.images[0]?.src : null;
  if (!src) return new Response(null, { status: 404 });

  try {
    const jpeg = await aJpeg(src);
    return new Response(jpeg, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error(`[og] sin imagen para ${slug}`, error);
    return new Response(null, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
