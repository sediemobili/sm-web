// Posts y páginas del sitio actual (wp/v2 con _embed; páginas de Elementor desde su HTML público).
// Uso: pnpm extract:contenido  →  data/posts.json, data/pages.json

import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DATA_DIR,
  SITE,
  cleanHtml,
  decodeEntities,
  fetchAllPages,
  fetchText,
  run,
  seoFrom,
  type Seo,
  type YoastHead,
} from "./lib.ts";

// Solo las páginas del mapa del sitio; la home se define en CLAUDE.md.
const PAGE_SLUGS = ["nosotros", "venta-empresarial", "legal", "gracias"];

type Image = { src: string; alt: string };

type WpEntry = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  yoast_head_json?: YoastHead | null;
  _embedded?: {
    author?: { name?: string }[];
    "wp:featuredmedia"?: { source_url?: string; alt_text?: string }[];
    "wp:term"?: { taxonomy: string; slug: string }[][];
  };
};

type Section = {
  heading: string | null;
  body: string | null;
  image: Image | null;
  cta: { label: string; href: string } | null;
};

type Post = {
  id: number;
  slug: string;
  path: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  date: string;
  modified: string;
  author: string | null;
  featuredImage: Image | null;
  categories: string[];
  tags: string[];
  seo: Seo;
};

type Page = Omit<Post, "author" | "categories"> & { sections: Section[] | null };

const text = (html: string) =>
  decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

function featuredImage(entry: WpEntry): Image | null {
  const media = entry._embedded?.["wp:featuredmedia"]?.[0];
  return media?.source_url ? { src: media.source_url, alt: decodeEntities(media.alt_text ?? "") } : null;
}

function termSlugs(entry: WpEntry, taxonomy: string) {
  return (entry._embedded?.["wp:term"] ?? []).flat().filter((t) => t.taxonomy === taxonomy).map((t) => t.slug);
}

// Devuelve el <div> completo que abre en `start`, contando divs anidados.
function outerDiv(html: string, start: number) {
  const tag = /<\/?div\b[^>]*>/gi;
  tag.lastIndex = start;
  let depth = 0;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return html.slice(start, tag.lastIndex);
  }
  return html.slice(start);
}

// Quita los bloques <div> que cumplen `marker` (plantillas de loop, widgets de formulario…).
function removeDivs(html: string, marker: RegExp) {
  for (let m = html.match(marker); m?.index !== undefined; m = html.match(marker)) {
    const start = html.lastIndexOf("<div", m.index);
    html = html.slice(0, start) + html.slice(start + outerDiv(html, start).length);
  }
  return html;
}

const DYNAMIC_WIDGET = /data-widget_type="((?:loop-carousel|loop-grid|raven-posts-carousel|posts)\.[\w-]+)"/;

// Cada contenedor de primer nivel de Elementor es una sección: título, cuerpo, imagen y CTA.
function sectionsFromHtml(html: string, dynamic: string[]) {
  const start = html.search(/<div[^>]+data-elementor-type="wp-page"/);
  if (start < 0) return [];
  const page = outerDiv(html, start).replace(/<(script|style|svg|noscript)[\s\S]*?<\/\1>/gi, "");

  const sections: Section[] = [];
  let consumedUntil = 0;
  for (const m of page.matchAll(/<div[^>]+class="[^"]*\be-parent\b[^"]*"/g)) {
    // Las plantillas de loop traen sus propios e-parent dentro de una sección ya leída.
    if (m.index < consumedUntil) continue;
    let block = outerDiv(page, m.index);
    consumedUntil = m.index + block.length;
    // Carruseles y listados de posts/categorías son consultas dinámicas, no contenido de la página.
    for (const [, widget] of block.matchAll(new RegExp(DYNAMIC_WIDGET, "g"))) dynamic.push(widget);
    block = removeDivs(block, DYNAMIC_WIDGET);

    const headingMatch = block.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/);
    const heading = headingMatch ? text(headingMatch[1]) : null;
    if (headingMatch) block = block.replace(headingMatch[0], "");

    const imgMatch = block.match(/<img\b[^>]*>/);
    let image: Image | null = null;
    if (imgMatch) {
      const src = imgMatch[0].match(/\ssrc="([^"]+)"/)?.[1];
      if (src && !src.startsWith("data:")) {
        image = { src, alt: decodeEntities(imgMatch[0].match(/\salt="([^"]*)"/)?.[1] ?? "") };
        block = block.replace(imgMatch[0], "");
      }
    }

    const ctaMatch = block.match(/<a\b[^>]*class="[^"]*(?:elementor|raven)-button[^"]*"[^>]*>([\s\S]*?)<\/a>/);
    let cta: Section["cta"] = null;
    if (ctaMatch) {
      cta = { label: text(ctaMatch[1]), href: decodeEntities(ctaMatch[0].match(/\shref="([^"]*)"/)?.[1] ?? "") };
      block = block.replace(ctaMatch[0], "");
    }

    const body = cleanHtml(block.replace(/<a\b[^>]*>\s*<\/a>/g, ""));
    if (heading || body || image || cta) sections.push({ heading, body, image, cta });
  }
  return sections;
}

async function main() {
  const posts: Post[] = (await fetchAllPages<WpEntry>(`${SITE}/wp-json/wp/v2/posts?_embed`)).map((p) => ({
    id: p.id,
    slug: p.slug,
    path: `/${p.slug}/`,
    title: decodeEntities(p.title.rendered),
    excerpt: cleanHtml(p.excerpt.rendered),
    content: cleanHtml(p.content.rendered),
    date: p.date,
    modified: p.modified,
    author: p._embedded?.author?.[0]?.name ?? null,
    featuredImage: featuredImage(p),
    categories: termSlugs(p, "category"),
    tags: termSlugs(p, "post_tag"),
    seo: seoFrom(p.yoast_head_json),
  }));

  const wpPages = (await fetchAllPages<WpEntry>(`${SITE}/wp-json/wp/v2/pages?_embed`)).filter((p) =>
    PAGE_SLUGS.includes(p.slug),
  );
  const fromHtml: string[] = [];
  const dynamic: string[] = [];
  const pages: Page[] = [];
  for (const slug of PAGE_SLUGS) {
    const p = wpPages.find((wp) => wp.slug === slug);
    if (!p) throw new Error(`No existe la página ${slug}`);

    // content.rendered de una página de Elementor es su marcado de widgets: se lee la página pública.
    const isElementor = /data-elementor-type=/.test(p.content.rendered) || !p.content.rendered.trim();
    let sections: Section[] | null = null;
    if (isElementor) {
      fromHtml.push(slug);
      const found: string[] = [];
      sections = sectionsFromHtml((await fetchText(`${SITE}/${slug}/`, "text/html")).body, found);
      dynamic.push(...found.map((h) => `${slug}: ${h}`));
    }

    pages.push({
      id: p.id,
      slug: p.slug,
      path: `/${p.slug}/`,
      title: decodeEntities(p.title.rendered),
      excerpt: cleanHtml(p.excerpt.rendered),
      content: isElementor ? null : cleanHtml(p.content.rendered),
      sections,
      date: p.date,
      modified: p.modified,
      featuredImage: featuredImage(p),
      tags: [],
      seo: seoFrom(p.yoast_head_json),
    });
  }

  await writeFile(path.join(DATA_DIR, "posts.json"), JSON.stringify(posts, null, 2) + "\n");
  await writeFile(path.join(DATA_DIR, "pages.json"), JSON.stringify(pages, null, 2) + "\n");

  const imagesIn = (html: string | null) => [...(html ?? "").matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
  const contentImages = [
    ...posts.flatMap((p) => imagesIn(p.content).map((src) => `${p.slug}: ${src}`)),
    ...pages.flatMap((p) => [
      ...imagesIn(p.content).map((src) => `${p.slug}: ${src}`),
      ...(p.sections ?? []).flatMap((s) => [
        ...(s.image ? [`${p.slug}: ${s.image.src}`] : []),
        ...imagesIn(s.body).map((src) => `${p.slug}: ${src}`),
      ]),
    ]),
  ];
  const list = (items: string[]) => (items.length ? `\n  ${items.join("\n  ")}` : " —");

  console.log(`\nPosts: ${posts.length} (sin contenido: ${posts.filter((p) => !p.content).map((p) => p.slug).join(", ") || "—"})`);
  console.log(`Páginas: ${pages.length}`);
  for (const p of pages) console.log(`  ${p.slug}: ${p.sections ? `${p.sections.length} secciones (HTML público)` : "content.rendered"}`);
  console.log(`\nLeídas del HTML: ${fromHtml.join(", ") || "—"}`);
  console.log(`Listados dinámicos omitidos (loop de Elementor):${list(dynamic)}`);
  console.log(`Imágenes dentro del contenido (${contentImages.length}):${list(contentImages)}`);
  console.log(`\nSin meta description:${list([...posts, ...pages].filter((p) => !p.seo.description).map((p) => p.slug))}`);
}

run(main);
