// Comparación visual de la home contra sediemobili.com: capturas y medidas.
// Uso: pnpm comparar  →  .capturas/ y docs/paridad-home.md
// Playwright es solo una herramienta local; no entra en el bundle del sitio.

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright";

const ORIGINAL = "https://sediemobili.com/";
const PUERTO = 4173;
const LOCAL = `http://localhost:${PUERTO}/`;
const CAPTURAS = path.join(process.cwd(), ".capturas");
const DOC = path.join(process.cwd(), "docs", "paridad-home.md");
const ANCHOS = [
  { nombre: "escritorio", ancho: 1440, alto: 900 },
  { nombre: "movil", ancho: 390, alto: 844 },
];

type Texto = { texto: string; tamano: number; peso: string; familia: string };
type Seccion = {
  titulo: string;
  top: number;
  alto: number;
  paddingTop: number;
  paddingBottom: number;
  ancho: number;
  textos: Texto[];
};

// Se leen las secciones de primer nivel de cada página: las del original son los
// contenedores de Elementor; las nuestras, los hijos directos de <main>.
async function medir(page: Page, selector: string): Promise<Seccion[]> {
  return page.evaluate((sel) => {
    const limpio = (texto: string) => texto.replace(/\s+/g, " ").trim().slice(0, 60);
    return [...document.querySelectorAll(sel)].map((nodo) => {
      const elemento = nodo as HTMLElement;
      const caja = elemento.getBoundingClientRect();
      const estilo = getComputedStyle(elemento);
      const encabezado = elemento.querySelector("h1, h2, h3");
      const textos = [...elemento.querySelectorAll("h1, h2, h3, p, a, span")]
        .filter((hijo) => {
          const propio = [...hijo.childNodes].some(
            (nieto) => nieto.nodeType === 3 && (nieto.textContent ?? "").trim().length > 1,
          );
          return propio && (hijo as HTMLElement).offsetParent !== null;
        })
        .slice(0, 6)
        .map((hijo) => {
          const suyo = getComputedStyle(hijo as HTMLElement);
          return {
            texto: limpio(hijo.textContent ?? ""),
            tamano: Math.round(parseFloat(suyo.fontSize)),
            peso: suyo.fontWeight,
            familia: suyo.fontFamily.split(",")[0].replace(/["']/g, ""),
          };
        });
      return {
        titulo: limpio(encabezado?.textContent ?? elemento.getAttribute("aria-label") ?? "(sin título)"),
        top: Math.round(caja.top + window.scrollY),
        alto: Math.round(caja.height),
        paddingTop: Math.round(parseFloat(estilo.paddingTop)),
        paddingBottom: Math.round(parseFloat(estilo.paddingBottom)),
        ancho: Math.round(caja.width),
        textos,
      };
    });
  }, selector);
}

async function capturar(page: Page, url: string, selector: string, etiqueta: string, ancho: number) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  // Se recorre la página para que carguen las imágenes diferidas y se asienten las alturas.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((listo) => setTimeout(listo, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);

  const carpeta = path.join(CAPTURAS, `${ancho}`);
  await mkdir(carpeta, { recursive: true });
  await page.screenshot({ path: path.join(carpeta, `${etiqueta}-completa.png`), fullPage: true });

  const secciones = await medir(page, selector);
  const nodos = await page.locator(selector).all();
  for (const [indice, nodo] of nodos.entries()) {
    const archivo = path.join(carpeta, `${etiqueta}-${String(indice + 1).padStart(2, "0")}.png`);
    await nodo.screenshot({ path: archivo }).catch(() => undefined);
  }
  return secciones;
}

// El original tiene secciones que el mapa de CLAUDE.md no incluye, así que las
// parejas se buscan por título y lo que no casa se reporta aparte.
const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();

function emparejar(original: Seccion[], nuestro: Seccion[]) {
  const libres = [...nuestro];
  return original.map((seccion) => {
    const objetivo = normalizar(seccion.titulo);
    const indice = libres.findIndex((candidata) => {
      const suyo = normalizar(candidata.titulo);
      return suyo === objetivo || suyo.startsWith(objetivo.slice(0, 18)) || objetivo.startsWith(suyo.slice(0, 18));
    });
    return { original: seccion, nuestro: indice >= 0 ? libres.splice(indice, 1)[0] : undefined, sobrantes: libres };
  });
}

function tabla(original: Seccion[], nuestro: Seccion[]) {
  const filas: string[] = [];
  const parejas = emparejar(original, nuestro);
  const emparejadas = new Set(parejas.map((p) => p.nuestro).filter(Boolean));
  for (let i = 0; i < parejas.length; i++) {
    const a = parejas[i].original;
    const b = parejas[i].nuestro;
    const dif = (x?: number, y?: number) => (x === undefined || y === undefined ? "—" : `${y - x > 0 ? "+" : ""}${y - x}`);
    filas.push(
      `| ${i + 1} | ${a?.titulo ?? "—"} / ${b?.titulo ?? "—"} | ${a?.alto ?? "—"} | ${b?.alto ?? "—"} | ${dif(a?.alto, b?.alto)} | ` +
        `${a?.top ?? "—"} | ${b?.top ?? "—"} | ${dif(a?.top, b?.top)} | ` +
        `${a ? `${a.paddingTop}/${a.paddingBottom}` : "—"} | ${b ? `${b.paddingTop}/${b.paddingBottom}` : "—"} | ` +
        `${a?.ancho ?? "—"} | ${b?.ancho ?? "—"} | ${dif(a?.ancho, b?.ancho)} |`,
    );
  }
  const soloNuestras = nuestro.filter((seccion) => !emparejadas.has(seccion));
  const extra = soloNuestras.length
    ? `\n\nSolo en la nuestra: ${soloNuestras.map((s) => `${s.titulo} (${s.alto}px)`).join(", ")}.`
    : "";
  return (
    [
      "| # | Sección (original / nuestra) | Alto orig. | Alto nuestro | Δ alto | Top orig. | Top nuestro | Δ top | Relleno orig. | Relleno nuestro | Ancho orig. | Ancho nuestro | Δ ancho |",
      "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
      ...filas,
    ].join("\n") + extra
  );
}

function tablaTextos(original: Seccion[], nuestro: Seccion[]) {
  const filas: string[] = [];
  const parejas = emparejar(original, nuestro);
  for (let i = 0; i < parejas.length; i++) {
    const textosA = parejas[i].original.textos;
    const textosB = parejas[i].nuestro?.textos ?? [];
    for (let j = 0; j < Math.max(textosA.length, textosB.length); j++) {
      const a = textosA[j];
      const b = textosB[j];
      if (!a && !b) continue;
      const dif = a && b ? b.tamano - a.tamano : undefined;
      filas.push(
        `| ${i + 1} | ${a?.texto ?? "—"} | ${a ? `${a.familia} ${a.tamano}px ${a.peso}` : "—"} | ` +
          `${b?.texto ?? "—"} | ${b ? `${b.familia} ${b.tamano}px ${b.peso}` : "—"} | ${dif === undefined ? "—" : dif} |`,
      );
    }
  }
  return [
    "| # | Texto original | Estilo original | Texto nuestro | Estilo nuestro | Δ tamaño |",
    "|---|---|---|---|---|---|",
    ...filas,
  ].join("\n");
}

async function main() {
  // El sitio local se levanta en modo producción y se apaga al terminar.
  const servidor = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", String(PUERTO)], {
    stdio: "ignore",
  });
  const navegador = await chromium.launch();

  try {
    for (let intento = 0; intento < 40; intento++) {
      try {
        const res = await fetch(LOCAL);
        if (res.ok) break;
      } catch {
        // el servidor todavía no responde
      }
      await new Promise((listo) => setTimeout(listo, 1000));
    }

    const documento: string[] = [
      "# Paridad de la home",
      "",
      `Comparación automática contra ${ORIGINAL}, generada con \`pnpm comparar\`.`,
      "Las capturas quedan en `.capturas/` (fuera del repo). Medidas en píxeles CSS.",
      "",
    ];

    for (const { nombre, ancho, alto } of ANCHOS) {
      const contexto = await navegador.newContext({ viewport: { width: ancho, height: alto } });
      const page = await contexto.newPage();

      const original = await capturar(page, ORIGINAL, '[data-elementor-type="wp-page"] > .e-con', "original", ancho);
      const nuestro = await capturar(page, LOCAL, "main > section, main > div > section", "nuestro", ancho);
      await contexto.close();

      documento.push(`## ${nombre} (${ancho}px)`, "", tabla(original, nuestro), "", "### Textos", "", tablaTextos(original, nuestro), "");
      console.log(`${nombre}: ${original.length} secciones en el original, ${nuestro.length} en la nuestra`);
    }

    await writeFile(DOC, documento.join("\n") + "\n");
    console.log(`→ ${path.relative(process.cwd(), DOC)} y .capturas/`);
  } finally {
    await navegador.close();
    servidor.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
