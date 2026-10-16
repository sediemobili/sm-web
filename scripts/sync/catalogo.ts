// Sincronización con la API de catálogo de Sedie (solo lectura). Por ahora no cambia el sitio:
// guarda lo que trae la API en data/api/ y lo cruza con los productos de WordPress.
// Uso: pnpm sync:catalogo  →  data/api/productos.json, data/api/equivalencias-slug.json y
// data/api/reporte.txt. Pide SEDIE_API_KEY (en el entorno o en .env.local).
// Documentación: https://sedie-wiki.vercel.app/api/external/v1/openapi.json

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizar } from "../../lib/buscar.ts";

const API = "https://sedie-wiki.vercel.app/api/external/v1";
const DATA_DIR = path.join(process.cwd(), "data");
const SALIDA = path.join(DATA_DIR, "api");
const POR_PAGINA = 200;

// La API admite 60 solicitudes por minuto: como mucho una por segundo, sostenida.
const INTERVALO_MS = 1000;
// Ante un 429 se espera 10, 20 y 40 s antes de cada reintento; ante un 500, un reintento.
const ESPERAS_429_MS = [10_000, 20_000, 40_000];
const REINTENTOS_500 = 1;

// Tipos de la API (components.schemas de la documentación) -------------------------

type Producto = {
  slug: string;
  sku: string | null;
  nombre: string;
  categoria: string;
  tipo: string | null;
  disponible: boolean;
  precio_base: number | null;
  precios_por_material: Record<string, number> | null;
  descripcion: string | null;
  especificaciones: { etiqueta: string; valor: string }[];
  imagen_principal: string | null;
  acabados: { id: string; label: string; description: string | null; imagen_url: string | null }[];
};

type ProductoDetalle = Producto & {
  galeria: string[];
  documentos: { nombre: string; url: string }[];
};

// Lo que se guarda: el detalle, o el producto de la lista si su detalle no se pudo traer.
type ProductoGuardado = Producto & {
  galeria: string[] | null;
  documentos: { nombre: string; url: string }[] | null;
  errorDetalle: string | null;
};

type ProductoWp = { slug: string; name: string; categories: string[] };

type Equivalencia = {
  wpSlug: string;
  wpNombre: string;
  // Solo cuando el emparejamiento es inequívoco; si no, null y el equipo lo resuelve.
  apiSlug: string | null;
  estado: "inequivoco" | "dudoso" | "sin-pareja";
  motivo: string | null;
  // En los dudosos, los slugs de la API entre los que hay que elegir.
  candidatos: string[];
};

// Peticiones -----------------------------------------------------------------------

class ErrorApi extends Error {
  readonly status: number;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.status = status;
  }
}

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

let ultimaSolicitud = 0;

async function ritmo() {
  const espera = ultimaSolicitud + INTERVALO_MS - Date.now();
  if (espera > 0) await esperar(espera);
  ultimaSolicitud = Date.now();
}

async function pedir<T>(ruta: string, clave: string): Promise<T> {
  let intentos429 = 0;
  let intentos500 = 0;
  for (;;) {
    await ritmo();
    const respuesta = await fetch(`${API}${ruta}`, {
      headers: { Authorization: `Bearer ${clave}`, Accept: "application/json" },
    });
    if (respuesta.ok) return (await respuesta.json()) as T;

    const cuerpo = await respuesta.text();
    if (respuesta.status === 429 && intentos429 < ESPERAS_429_MS.length) {
      const espera = ESPERAS_429_MS[intentos429++];
      aviso(`429 en ${ruta}: espero ${espera / 1000} s (reintento ${intentos429} de ${ESPERAS_429_MS.length})`);
      await esperar(espera);
      continue;
    }
    if (respuesta.status >= 500 && intentos500 < REINTENTOS_500) {
      intentos500++;
      aviso(`${respuesta.status} en ${ruta}: reintento una vez`);
      continue;
    }
    throw new ErrorApi(respuesta.status, `HTTP ${respuesta.status} en ${ruta}: ${cuerpo.slice(0, 200)}`);
  }
}

// Avance en una sola línea si es una terminal; si no, una línea cada tanto.
const enTerminal = process.stdout.isTTY;
let lineaAbierta = false;

function avance(texto: string, cadaTanto: boolean) {
  if (enTerminal) {
    process.stdout.write(`\r\x1b[2K${texto}`);
    lineaAbierta = true;
  } else if (cadaTanto) console.log(texto);
}

function aviso(texto: string) {
  if (lineaAbierta) process.stdout.write("\n");
  lineaAbierta = false;
  console.warn(texto);
}

function cerrarLinea() {
  if (lineaAbierta) process.stdout.write("\n");
  lineaAbierta = false;
}

// Descarga -------------------------------------------------------------------------

async function listarProductos(clave: string) {
  const productos: Producto[] = [];
  let total = Infinity;
  for (let pagina = 1; productos.length < total; pagina++) {
    const respuesta = await pedir<{ total: number; productos: Producto[] }>(
      `/productos?page=${pagina}&pageSize=${POR_PAGINA}`,
      clave,
    );
    total = respuesta.total;
    productos.push(...respuesta.productos);
    avance(`Lista: página ${pagina}, ${productos.length} de ${total} productos`, true);
    // Una página vacía antes de llegar al total cortaría el bucle infinito.
    if (respuesta.productos.length === 0) break;
  }
  cerrarLinea();
  if (productos.length !== total) aviso(`La lista trajo ${productos.length} productos y "total" dice ${total}.`);
  return productos;
}

async function detallar(productos: Producto[], clave: string) {
  const guardados: ProductoGuardado[] = [];
  for (const [i, producto] of productos.entries()) {
    avance(`Detalle ${i + 1} de ${productos.length}: ${producto.slug}`, (i + 1) % 25 === 0 || i + 1 === productos.length);
    try {
      const { producto: detalle } = await pedir<{ producto: ProductoDetalle }>(
        `/productos/lookup?slug=${encodeURIComponent(producto.slug)}`,
        clave,
      );
      guardados.push({ ...detalle, galeria: detalle.galeria ?? [], documentos: detalle.documentos ?? [], errorDetalle: null });
    } catch (error) {
      // 401 o 400 no se arreglan producto a producto: se detiene todo.
      if (error instanceof ErrorApi && (error.status === 401 || error.status === 400)) throw error;
      const mensaje = error instanceof Error ? error.message : String(error);
      aviso(`Sin detalle para ${producto.slug}: ${mensaje}`);
      guardados.push({ ...producto, galeria: null, documentos: null, errorDetalle: mensaje });
    }
  }
  cerrarLinea();
  return guardados;
}

// Cruce con WordPress --------------------------------------------------------------

function agrupar<T>(items: T[], clave: (item: T) => string) {
  const grupos = new Map<string, T[]>();
  for (const item of items) {
    const k = clave(item);
    grupos.set(k, [...(grupos.get(k) ?? []), item]);
  }
  return grupos;
}

function cruzar(api: ProductoGuardado[], wp: ProductoWp[]) {
  const apiPorNombre = agrupar(api, (p) => normalizar(p.nombre));
  const wpPorNombre = agrupar(wp, (p) => normalizar(p.name));

  const equivalencias: Equivalencia[] = wp.map((producto) => {
    const nombre = normalizar(producto.name);
    const candidatos = (apiPorNombre.get(nombre) ?? []).map((p) => p.slug).sort();
    const base = { wpSlug: producto.slug, wpNombre: producto.name };
    if (candidatos.length === 0)
      return { ...base, apiSlug: null, estado: "sin-pareja", motivo: "Ningún producto de la API tiene este nombre.", candidatos };
    if (candidatos.length > 1)
      return { ...base, apiSlug: null, estado: "dudoso", motivo: "El nombre está repetido en la API.", candidatos };
    if ((wpPorNombre.get(nombre) ?? []).length > 1)
      return { ...base, apiSlug: null, estado: "dudoso", motivo: "El nombre está repetido en WordPress.", candidatos };
    return { ...base, apiSlug: candidatos[0], estado: "inequivoco", motivo: null, candidatos: [] };
  });
  equivalencias.sort((a, b) => a.wpSlug.localeCompare(b.wpSlug));

  const repetidosApi = [...apiPorNombre.values()].filter((grupo) => grupo.length > 1);
  const repetidosWp = [...wpPorNombre.values()].filter((grupo) => grupo.length > 1);
  const soloApi = api.filter((p) => !wpPorNombre.has(normalizar(p.nombre)));
  return { equivalencias, repetidosApi, repetidosWp, soloApi };
}

// Reporte --------------------------------------------------------------------------

function reporte(api: ProductoGuardado[], wp: ProductoWp[], cruce: ReturnType<typeof cruzar>) {
  const lineas: string[] = [];
  const titulo = (texto: string) => lineas.push("", texto, "-".repeat(texto.length));
  const lista = (items: string[]) => lineas.push(...(items.length ? items.map((i) => `  - ${i}`) : ["  (ninguno)"]));
  const cuenta = (etiqueta: string, n: number) => lineas.push(`  ${etiqueta.padEnd(42, ".")} ${n} de ${api.length}`);

  const esPdf = (d: { nombre: string; url: string }) => /\.pdf($|[?#])/i.test(d.url) || /\.pdf$/i.test(d.nombre);
  const descripciones = agrupar(
    api.filter((p) => p.descripcion?.trim()),
    (p) => normalizar(p.descripcion!),
  );

  lineas.push("Sincronización con la API de catálogo de Sedie", `Fuente: ${API}`);

  titulo("Productos de la API por categoría");
  for (const [categoria, grupo] of [...agrupar(api, (p) => p.categoria)].sort(([a], [b]) => a.localeCompare(b)))
    lineas.push(`  ${categoria.padEnd(42, ".")} ${grupo.length}`);
  lineas.push(`  ${"Total".padEnd(42, ".")} ${api.length}`);

  titulo("Contenido");
  cuenta("Con foto principal", api.filter((p) => p.imagen_principal).length);
  cuenta("Con galería", api.filter((p) => p.galeria?.length).length);
  cuenta("Con PDF", api.filter((p) => p.documentos?.some(esPdf)).length);
  cuenta("Con algún documento (PDF u otro)", api.filter((p) => p.documentos?.length).length);
  cuenta("Con especificaciones", api.filter((p) => p.especificaciones?.length).length);
  cuenta("Con descripción", api.filter((p) => p.descripcion?.trim()).length);
  // Propia: la descripción no se repite, idéntica, en otro producto.
  cuenta("Con descripción propia (no repetida)", [...descripciones.values()].filter((g) => g.length === 1).length);

  const sinDetalle = api.filter((p) => p.errorDetalle);
  if (sinDetalle.length) {
    titulo("Productos sin detalle (falló /productos/lookup)");
    lista(sinDetalle.map((p) => `${p.slug}: ${p.errorDetalle}`));
  }

  const { equivalencias, repetidosApi, repetidosWp, soloApi } = cruce;
  const por = (estado: Equivalencia["estado"]) => equivalencias.filter((e) => e.estado === estado);

  titulo(`Cruce con WordPress (${wp.length} productos), por nombre normalizado`);
  lineas.push(`  ${"Con equivalente inequívoco".padEnd(42, ".")} ${por("inequivoco").length}`);
  lineas.push(`  ${"Dudosos (nombre repetido)".padEnd(42, ".")} ${por("dudoso").length}`);
  lineas.push(`  ${"Sin equivalente".padEnd(42, ".")} ${por("sin-pareja").length}`);

  titulo("Productos de WordPress sin equivalente en la API (a resolver a mano)");
  lista(por("sin-pareja").map((e) => `${e.wpNombre} (${e.wpSlug})`));

  titulo("Productos de WordPress dudosos (a resolver a mano)");
  lista(por("dudoso").map((e) => `${e.wpNombre} (${e.wpSlug}): ${e.motivo} Candidatos: ${e.candidatos.join(", ")}`));

  titulo("Nombres repetidos en la API (no se elige ninguno)");
  lista(repetidosApi.map((g) => `${g[0].nombre}: ${g.map((p) => `${p.slug}${p.tipo ? ` [${p.tipo}]` : ""}`).join(", ")}`));

  if (repetidosWp.length) {
    titulo("Nombres repetidos en WordPress");
    lista(repetidosWp.map((g) => `${g[0].name}: ${g.map((p) => p.slug).sort().join(", ")}`));
  }

  titulo(`Productos de la API que no existen hoy en el sitio: ${soloApi.length}`);
  lista(soloApi.map((p) => `${p.nombre} (${p.slug})`));

  return lineas.join("\n") + "\n";
}

// Escritura idempotente: mismo contenido, mismo archivo; solo se reescribe si cambia.
async function escribir(nombre: string, contenido: string) {
  const ruta = path.join(SALIDA, nombre);
  const previo = await readFile(ruta, "utf8").catch(() => null);
  if (previo === contenido) return console.log(`  ${path.relative(process.cwd(), ruta)}: sin cambios`);
  await writeFile(ruta, contenido);
  console.log(`  ${path.relative(process.cwd(), ruta)}: ${previo === null ? "creado" : "actualizado"}`);
}

async function main() {
  const clave = process.env.SEDIE_API_KEY?.trim();
  if (!clave) {
    console.error(
      "Falta SEDIE_API_KEY: la clave de la API de catálogo de Sedie.\n" +
        "Defínela en .env.local (SEDIE_API_KEY=...) o en el entorno y vuelve a correr pnpm sync:catalogo.",
    );
    process.exit(1);
  }

  const wp = JSON.parse(await readFile(path.join(DATA_DIR, "products.json"), "utf8")) as ProductoWp[];

  const lista = await listarProductos(clave);
  const api = (await detallar(lista, clave)).sort((a, b) => a.slug.localeCompare(b.slug));
  const cruce = cruzar(api, wp);
  const texto = reporte(api, wp, cruce);

  console.log(texto);
  await mkdir(SALIDA, { recursive: true });
  await escribir("productos.json", JSON.stringify(api, null, 2) + "\n");
  await escribir("equivalencias-slug.json", JSON.stringify(cruce.equivalencias, null, 2) + "\n");
  await escribir("reporte.txt", texto);
}

main().catch((error) => {
  cerrarLinea();
  if (error instanceof ErrorApi && error.status === 401) {
    console.error("La API rechazó la clave (401). Revisa SEDIE_API_KEY.");
  } else {
    console.error(error);
  }
  process.exit(1);
});
