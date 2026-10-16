// Enlaces internos del contenido de posts y páginas. WordPress los guarda absolutos
// (https://sediemobili.com/…) y algunos apuntan a rutas que no existen.
//   - Los absolutos a páginas del sitio pasan a relativos: no se manda al visitante fuera y de vuelta.
//   - Una ruta que no existe se resuelve solo si hay certeza: primero con las erratas conocidas
//     (ERRATAS en lib.ts) y, en categorías, por el último segmento cuando un solo término lo tiene.
//   - Lo que no se resuelve se deja tal cual y se reporta. No se inventa ningún destino.
// Los archivos de WordPress (/wp-content/…) no son páginas del sitio: siguen absolutos.
//
// Lo aplica contenido.ts en cada extracción. Uso suelto, sobre los datos ya extraídos:
// pnpm extract:enlaces  →  data/posts.json y data/pages.json

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR, ERRATAS, run } from "./lib.ts";

// Rutas fijas de app/ que no salen de ningún JSON.
const RUTAS_FIJAS = ["/", "/catalogo/", "/blog/", "/nosotros/", "/venta-empresarial/", "/legal/", "/gracias/", "/buscar/", "/cotizacion/"];
const DOMINIO = /^https?:\/\/(?:www\.)?sediemobili\.com(?=\/|$|[?#])/i;

export type Destinos = { rutas: Set<string>; categorias: { slug: string; path: string }[] };

export type Cambio = {
  donde: string;
  antes: string;
  despues: string | null; // null: no se pudo resolver y queda como estaba
  motivo: string;
};

type Conteo = { enlaces: number; aRelativo: number; corregidos: number; sinResolver: Cambio[]; cambios: Cambio[] };

// Las rutas que existen en el sitio, a partir de los datos extraídos.
export async function cargarDestinos(): Promise<Destinos> {
  const leer = async <T>(archivo: string) => JSON.parse(await readFile(path.join(DATA_DIR, archivo), "utf8")) as T;
  const conRuta = await Promise.all(
    ["products.json", "categories.json", "collections.json", "procedencias.json", "posts.json", "pages.json"].map((f) =>
      leer<{ path: string }[]>(f),
    ),
  );
  const categorias = await leer<{ slug: string; path: string }[]>("categories.json");
  return { rutas: new Set([...RUTAS_FIJAS, ...conRuta.flat().map((x) => x.path)]), categorias };
}

const conBarra = (ruta: string) => (ruta.endsWith("/") || /\.[a-z0-9]+$/i.test(ruta) ? ruta : `${ruta}/`);

// Ruta existente para una que no lo es, o null si no hay certeza.
function resolver(ruta: string, { rutas, categorias }: Destinos): { ruta: string; motivo: string } | null {
  const conErratas = ERRATAS.reduce((r, e) => r.replaceAll(e.mal.toLowerCase(), e.bien.toLowerCase()), ruta);
  if (conErratas !== ruta && rutas.has(conErratas)) return { ruta: conErratas, motivo: "errata conocida" };
  if (conErratas.startsWith("/product-category/")) {
    const ultimo = conErratas.split("/").filter(Boolean).pop();
    const candidatos = categorias.filter((c) => c.slug === ultimo);
    if (candidatos.length === 1)
      return { ruta: candidatos[0].path, motivo: conErratas !== ruta ? "errata conocida y categoría por su slug" : "categoría por su slug" };
  }
  return null;
}

// Corrige un href. Devuelve el mismo valor si no hay nada que hacer.
function corregirHref(href: string, destinos: Destinos, donde: string, conteo: Conteo): string {
  // Ancla que en WordPress abría un popup de Elementor: no lleva a ninguna página.
  if (href.startsWith("#elementor-action")) {
    conteo.enlaces++;
    conteo.sinResolver.push({ donde, antes: href, despues: null, motivo: "abría un popup de Elementor" });
    return href;
  }
  const absoluto = DOMINIO.test(href);
  if (!absoluto && !href.startsWith("/")) return href; // externos, anclas, mailto…
  conteo.enlaces++;
  const resto = absoluto ? href.replace(DOMINIO, "") || "/" : href;
  const [, rutaCruda = "/", sufijo = ""] = resto.match(/^([^?#]*)(.*)$/) ?? [];
  if (/^\/wp-content\//.test(rutaCruda)) return href; // archivo de WordPress: se queda absoluto
  const ruta = conBarra(rutaCruda || "/");

  if (destinos.rutas.has(ruta)) {
    const nuevo = `${ruta}${sufijo}`;
    if (nuevo !== href) {
      if (absoluto) conteo.aRelativo++;
      conteo.cambios.push({ donde, antes: href, despues: nuevo, motivo: absoluto ? "a relativo" : "barra final" });
    }
    return nuevo;
  }
  const resuelta = resolver(ruta, destinos);
  if (!resuelta) {
    const cambio = { donde, antes: href, despues: null, motivo: "la ruta no existe y no hay certeza del destino" };
    conteo.sinResolver.push(cambio);
    return href;
  }
  const nuevo = `${resuelta.ruta}${sufijo}`;
  conteo.corregidos++;
  if (absoluto) conteo.aRelativo++;
  conteo.cambios.push({ donde, antes: href, despues: nuevo, motivo: resuelta.motivo });
  return nuevo;
}

const corregirHtml = (html: string | null, destinos: Destinos, donde: string, conteo: Conteo) =>
  html?.replace(/href="([^"]*)"/g, (_, href: string) => `href="${corregirHref(href, destinos, donde, conteo)}"`) ?? null;

type ConContenido = { slug: string; excerpt: string | null; content: string | null };
type ConSecciones = ConContenido & {
  sections: { body: string | null; cta: { label: string; href: string } | null }[] | null;
};

export function corregirEnlaces<P extends ConContenido, G extends ConSecciones>(posts: P[], pages: G[], destinos: Destinos) {
  const conteo: Conteo = { enlaces: 0, aRelativo: 0, corregidos: 0, sinResolver: [], cambios: [] };
  const entrada = <T extends ConContenido>(e: T, tipo: string): T => ({
    ...e,
    excerpt: corregirHtml(e.excerpt, destinos, `${tipo} ${e.slug}`, conteo),
    content: corregirHtml(e.content, destinos, `${tipo} ${e.slug}`, conteo),
  });
  const nuevosPosts = posts.map((p) => entrada(p, "post"));
  const nuevasPaginas = pages.map((p) => ({
    ...entrada(p, "página"),
    sections:
      p.sections?.map((s, i) => ({
        ...s,
        body: corregirHtml(s.body, destinos, `página ${p.slug}, sección ${i + 1}`, conteo),
        cta: s.cta ? { ...s.cta, href: corregirHref(s.cta.href, destinos, `página ${p.slug}, sección ${i + 1} (botón)`, conteo) } : null,
      })) ?? null,
  }));
  return { posts: nuevosPosts, pages: nuevasPaginas, conteo };
}

export function reportarEnlaces({ enlaces, aRelativo, corregidos, sinResolver, cambios }: Conteo) {
  console.log(`\nEnlaces internos: ${enlaces} (a relativo: ${aRelativo}, ruta corregida: ${corregidos}, sin resolver: ${sinResolver.length})`);
  for (const c of cambios) console.log(`  ${c.donde}: ${c.antes} → ${c.despues} (${c.motivo})`);
  for (const c of sinResolver) console.log(`  SIN RESOLVER ${c.donde}: ${c.antes} (${c.motivo})`);
}

// Uso suelto: corrige los JSON ya extraídos. Correrlo dos veces no cambia nada la segunda.
async function main() {
  const ruta = (archivo: string) => path.join(DATA_DIR, archivo);
  const posts = JSON.parse(await readFile(ruta("posts.json"), "utf8")) as ConContenido[];
  const pages = JSON.parse(await readFile(ruta("pages.json"), "utf8")) as ConSecciones[];
  const resultado = corregirEnlaces(posts, pages, await cargarDestinos());
  await writeFile(ruta("posts.json"), JSON.stringify(resultado.posts, null, 2) + "\n");
  await writeFile(ruta("pages.json"), JSON.stringify(resultado.pages, null, 2) + "\n");
  reportarEnlaces(resultado.conteo);
}

if (import.meta.url === `file://${process.argv[1]}`) run(main);
