// Design tokens del sitio actual: kit global de Elementor, CSS de la home y fuentes de Google.
// Uso: pnpm extract:tokens  →  docs/design-tokens.md

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { SITE, decodeEntities, fetchText, run } from "./lib.ts";

const OUT_FILE = path.join(process.cwd(), "docs", "design-tokens.md");
const MOBILE = "max-width:767px";

type Sheet = { id: string; role: string; css: string };

const unquote = (value: string) => value.replace(/["']/g, "").replace(/,\s*Sans-serif$/i, "").trim();

function count(values: string[]) {
  const map = new Map<string, number>();
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
  return [...map].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function declarations(css: string, prop: string) {
  return [...css.matchAll(new RegExp(`${prop}\\s*:\\s*([^;}]+)`, "gi"))].map((m) => m[1].trim());
}

// Separa el CSS de escritorio de cada bloque @media, contando llaves.
function splitMedia(css: string) {
  const media: { condition: string; css: string }[] = [];
  let desktop = "";
  let index = 0;
  for (const m of css.matchAll(/@media\s*\(([^)]+)\)\s*\{/g)) {
    desktop += css.slice(index, m.index);
    let depth = 1;
    let end = m.index + m[0].length;
    for (; depth > 0 && end < css.length; end++) {
      if (css[end] === "{") depth++;
      else if (css[end] === "}") depth--;
    }
    media.push({ condition: m[1].replace(/\s+/g, ""), css: css.slice(m.index + m[0].length, end - 1) });
    index = end;
  }
  return { desktop: desktop + css.slice(index), media };
}

// La home dice qué plantilla de Elementor es cada CSS (header, footer, la página…).
function rolesFromHome(html: string) {
  const roles = new Map<string, string>();
  for (const m of html.matchAll(/data-elementor-type="([^"]+)"\s+data-elementor-id="(\d+)"/g)) {
    roles.set(m[2], m[1]);
  }
  return roles;
}

function table(rows: string[][], headers: string[]) {
  return [
    `| ${headers.join(" | ")} |`,
    `|${headers.map(() => "---").join("|")}|`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");
}

async function main() {
  const home = (await fetchText(`${SITE}/`, "text/html")).body;
  const kitId = home.match(/elementor-kit-(\d+)/)?.[1];
  if (!kitId) throw new Error("No se encontró la clase elementor-kit-N en la home");

  const cssUrls = [...new Set([...home.matchAll(/href=['"]([^'"]*\/uploads\/elementor\/css\/post-\d+\.css[^'"]*)['"]/g)].map((m) => decodeEntities(m[1])))];
  const kitUrl = cssUrls.find((url) => url.includes(`post-${kitId}.css`));
  if (!kitUrl) throw new Error(`La home no carga el CSS del kit (post-${kitId}.css)`);

  const roles = rolesFromHome(home);
  const sheets: Sheet[] = [];
  for (const url of cssUrls) {
    const id = url.match(/post-(\d+)\.css/)?.[1] ?? "?";
    sheets.push({ id, role: id === kitId ? "kit" : (roles.get(id) ?? "otra plantilla"), css: (await fetchText(url, "text/css")).body });
  }

  const kit = sheets.find((s) => s.id === kitId)!.css;
  const pages = sheets.filter((s) => s.id !== kitId);
  const allCss = pages.map((s) => s.css).join("\n");
  const { desktop, media } = splitMedia(allCss);
  const mobile = media.filter((m) => m.condition === MOBILE).map((m) => m.css).join("\n");

  const globalColors = [...kit.matchAll(/--e-global-color-([\w-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})/g)].map((m) => ({
    name: m[1],
    hex: m[2].toUpperCase(),
  }));
  const usage = (name: string) =>
    pages
      .filter((s) => new RegExp(`var\\(\\s*--e-global-color-${name}\\b`).test(s.css))
      .map((s) => `${s.role} (${s.id})`);
  const usageCount = (name: string) =>
    [...allCss.matchAll(new RegExp(`var\\(\\s*--e-global-color-${name}\\b`, "g"))].length;

  const fonts = [...new Set([...home.matchAll(/fonts\.googleapis\.com\/css\?family=([^"'&]+)/g)].map((m) => decodeEntities(m[1])))];
  const families = count(declarations(allCss, "font-family").map(unquote).filter((f) => f !== "inherit"));

  const literalColors = count([...allCss.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)].map((m) => m[0].toUpperCase()));
  const fontSizes = (css: string) => count(declarations(css, "font-size").filter((v) => /^\d/.test(v)));

  const lines: string[] = [];
  lines.push("# Design tokens del sitio actual");
  lines.push("");
  lines.push(`Extraído de sediemobili.com con \`pnpm extract:tokens\`. Fuentes: kit global de Elementor (post-${kitId}.css), el CSS de las plantillas que carga la home y sus fuentes de Google.`);
  lines.push("");
  lines.push("Los nombres de Elementor se traducen a nombres semánticos en `app/styles/tokens.css`.");
  lines.push("");

  lines.push("## Color");
  lines.push("");
  lines.push("### Globales del kit");
  lines.push("");
  lines.push(
    table(
      globalColors.map((c) => [
        `\`${c.name}\``,
        c.hex,
        String(usageCount(c.name)),
        usage(c.name).join(", ") || "sin uso en estas plantillas",
      ]),
      ["Elementor", "HEX", "Usos", "Dónde"],
    ),
  );
  lines.push("");
  lines.push("### Colores escritos a mano en las plantillas");
  lines.push("");
  lines.push(table(literalColors.map(([hex, n]) => [hex, String(n)]), ["HEX", "Usos"]));
  lines.push("");

  lines.push("## Tipografía");
  lines.push("");
  lines.push(`Fuentes de Google que carga la home: ${fonts.map((f) => `\`${f.replace(/\+/g, " ")}\``).join(", ")}.`);
  lines.push("");
  lines.push("### Familias en uso");
  lines.push("");
  lines.push(table(families.map(([family, n]) => [family, String(n)]), ["Familia", "Declaraciones"]));
  lines.push("");
  lines.push("### Tipografía global del kit");
  lines.push("");
  lines.push(
    table(
      [...kit.matchAll(/--e-global-typography-([\w-]+)-font-(family|weight)\s*:\s*([^;]+)/g)].map((m) => [
        `\`${m[1]}\``,
        m[2],
        unquote(m[3]),
      ]),
      ["Elementor", "Propiedad", "Valor"],
    ),
  );
  lines.push("");
  lines.push("### Tamaños");
  lines.push("");
  lines.push(table(fontSizes(desktop).map(([v, n]) => [v, String(n)]), ["Escritorio", "Usos"]));
  lines.push("");
  lines.push(table(fontSizes(mobile).map(([v, n]) => [v, String(n)]), [`Móvil (${MOBILE})`, "Usos"]));
  lines.push("");
  for (const [label, prop] of [["Pesos", "font-weight"], ["Interlineado", "line-height"], ["Espaciado entre letras", "letter-spacing"]] as const) {
    lines.push(`### ${label}`);
    lines.push("");
    lines.push(table(count(declarations(allCss, prop)).map(([v, n]) => [v, String(n)]), ["Valor", "Usos"]));
    lines.push("");
  }

  lines.push("## Espaciado, radios y sombras");
  lines.push("");
  for (const [label, prop] of [["Separaciones (gap)", "gap"], ["Radios", "border-radius"], ["Sombras", "box-shadow"], ["Rellenos (padding)", "padding"]] as const) {
    lines.push(`### ${label}`);
    lines.push("");
    lines.push(table(count(declarations(allCss, prop)).slice(0, 15).map(([v, n]) => [`\`${v}\``, String(n)]), ["Valor", "Usos"]));
    lines.push("");
  }

  lines.push("## Contenedor y breakpoints");
  lines.push("");
  lines.push(
    table(
      [
        ["Escritorio", kit.match(/\.e-con\{--container-max-width:([^;}]+)/)?.[1] ?? "?"],
        ...[...kit.matchAll(/@media\(([^)]+)\)\{[\s\S]*?--container-max-width:([^;}]+)/g)].map((m) => [m[1], m[2]]),
      ],
      ["Contexto", "Ancho máximo"],
    ),
  );
  lines.push("");
  lines.push(table(count(media.map((m) => m.condition)).map(([c, n]) => [`\`${c}\``, String(n)]), ["Breakpoint", "Bloques"]));
  lines.push("");

  await writeFile(OUT_FILE, lines.join("\n") + "\n");

  console.log(`Kit: post-${kitId}.css`);
  console.log(`Hojas leídas: ${sheets.map((s) => `${s.id}=${s.role}`).join(", ")}`);
  console.log(`Colores globales: ${globalColors.length} · literales distintos: ${literalColors.length}`);
  console.log(`Tamaños distintos: escritorio ${fontSizes(desktop).length}, móvil ${fontSizes(mobile).length}`);
  console.log(`Familias: ${families.map(([f, n]) => `${f} (${n})`).join(", ")}`);
  console.log(`Fuentes de Google: ${fonts.join(", ")}`);
  console.log(`Sin uso: ${globalColors.filter((c) => usageCount(c.name) === 0).map((c) => `${c.name} ${c.hex}`).join(", ") || "—"}`);
  console.log(`Duplicados: ${count(globalColors.map((c) => c.hex)).filter(([, n]) => n > 1).map(([hex, n]) => `${hex} ×${n}`).join(", ") || "—"}`);
  console.log(`→ ${path.relative(process.cwd(), OUT_FILE)}`);
}

run(main);
