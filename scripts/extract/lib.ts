// Utilidades comunes de los extractores: fetch con ritmo y captcha, entidades y limpieza de HTML.

import path from "node:path";

export const SITE = "https://sediemobili.com";
export const DATA_DIR = path.join(process.cwd(), "data");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const MIN_INTERVAL_MS = 1000;

export class CaptchaError extends Error {}

let lastRequestAt = 0;

async function throttle() {
  const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

function isCaptcha(res: Response, body: string) {
  return (
    res.headers.has("sg-captcha") ||
    /<meta[^>]+http-equiv=["']?refresh[^>]+\/\.well-known\/sgcaptcha\//i.test(body)
  );
}

async function fetchOnce(url: string, accept: string, method = "GET") {
  await throttle();
  const res = await fetch(url, { method, headers: { "User-Agent": USER_AGENT, Accept: accept } });
  const body = method === "HEAD" ? "" : await res.text();
  return { res, body };
}

// Máximo 1 petición por segundo; ante captcha reintenta una vez y, si sigue, lanza CaptchaError.
export async function fetchText(url: string, accept = "*/*") {
  let { res, body } = await fetchOnce(url, accept);
  if (isCaptcha(res, body)) {
    ({ res, body } = await fetchOnce(url, accept));
    if (isCaptcha(res, body)) throw new CaptchaError(`Captcha persistente en ${url}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return { res, body };
}

// HEAD con las mismas reglas; no lanza por status para poder reportar enlaces rotos.
export async function fetchHead(url: string) {
  let { res } = await fetchOnce(url, "*/*", "HEAD");
  if (isCaptcha(res, "")) {
    ({ res } = await fetchOnce(url, "*/*", "HEAD"));
    if (isCaptcha(res, "")) throw new CaptchaError(`Captcha persistente en ${url}`);
  }
  const length = res.headers.get("content-length");
  return { status: res.status, length: length === null ? null : Number(length) };
}

// Descarga binaria (imágenes) con el mismo ritmo de una petición por segundo.
export async function fetchBinario(url: string) {
  await throttle();
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function fetchJson<T>(url: string) {
  const { res, body } = await fetchText(url, "application/json");
  return { data: JSON.parse(body) as T, totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1) };
}

// Recorre todas las páginas de un endpoint paginado de WP/WooCommerce.
export async function fetchAllPages<T>(url: string) {
  const items: T[] = [];
  const sep = url.includes("?") ? "&" : "?";
  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const res = await fetchJson<T[]>(`${url}${sep}per_page=100&page=${page}`);
    items.push(...res.data);
    totalPages = res.totalPages;
  }
  return items;
}

export function decodeEntities(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// HTML limpio: sin shortcodes, sin wrappers de Elementor (div/span/section/article/button),
// solo atributos con significado y con párrafos cuando viene como texto plano (como wpautop).
export function cleanHtml(raw: string) {
  let html = raw
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/\[\/?[a-z0-9_-]+(?:\s[^\]]*)?\]/gi, "")
    .replace(/<\/?(?:div|span|section|article|button)(?:\s[^>]*)?>/gi, "")
    .replace(/<([a-z][a-z0-9]*)(\s[^>]*)?>/gi, (_, tag: string, attrs = "") => {
      const kept = (attrs as string).match(/\s(?:href|src|alt|colspan|rowspan)="[^"]*"/gi) ?? [];
      return `<${tag}${kept.join("")}>`;
    })
    .replace(/<(p|figure|a)>\s*(?:&nbsp;)?\s*<\/\1>/gi, "")
    .trim();
  if (!html) return null;
  if (/<(?:p|ul|ol|h[1-6]|table|blockquote|figure)[\s>]/i.test(html)) {
    html = html
      .replace(/>\s+</g, "><")
      .replace(/\s+/g, " ")
      .replace(/<(h[1-6]|p|a|li)>\s+/gi, "<$1>")
      .replace(/\s+<\/(h[1-6]|p|a|li)>/gi, "</$1>");
  } else {
    html = html
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }
  return html;
}

export type YoastHead = {
  title?: string;
  description?: string;
  og_image?: { url?: string }[];
};

export type Seo = { title: string | null; description: string | null; ogImage: string | null };

export function seoFrom(yoast: YoastHead | null | undefined): Seo {
  return {
    title: yoast?.title ? decodeEntities(yoast.title) : null,
    description: yoast?.description ? decodeEntities(yoast.description) : null,
    ogImage: yoast?.og_image?.[0]?.url ?? null,
  };
}

export type DownloadTipo = "modelo3d" | "dwg" | "instructivo" | "ficha_tecnica" | "video" | "otro";
export type Download = { tipo: DownloadTipo; label: string; url: string; extension: string | null };
export type Spec = { label: string; value: string };

export function run(main: () => Promise<void>) {
  main().catch((err) => {
    console.error(err instanceof CaptchaError ? `DETENIDO: ${err.message}` : err);
    process.exit(1);
  });
}
