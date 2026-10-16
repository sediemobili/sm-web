// Cliente de la API de catálogo de Sedie (solo lectura). Solo corre en el servidor: la clave sale
// de SEDIE_API_KEY, que no lleva el prefijo NEXT_PUBLIC_ y por eso nunca entra en el bundle del
// navegador. Documentación: https://sedie-wiki.vercel.app/api/external/v1/openapi.json

import { cacheLife } from "next/cache";

const API = "https://sedie-wiki.vercel.app/api/external/v1";
const POR_PAGINA = 200;

// La API admite 60 solicitudes por minuto. Dentro de un mismo proceso se espacian a una por
// segundo; ante un 429 se espera 10, 20 y 40 s, y ante un 500 se reintenta una vez.
const INTERVALO_MS = 1000;
const ESPERAS_429_MS = [10_000, 20_000, 40_000];

export type ProductoApi = {
  slug: string;
  sku: string | null;
  nombre: string;
  categoria: string;
  tipo: string | null;
  disponible: boolean;
  precio_base: number | null;
  precios_por_material: Record<string, number> | null;
  descripcion: string | null;
  especificaciones: { etiqueta: string; valor: string }[] | null;
  imagen_principal: string | null;
  acabados: { id: string; label: string; description: string | null; imagen_url: string | null }[] | null;
};

export type ProductoDetalleApi = ProductoApi & {
  galeria: string[] | null;
  documentos: { nombre: string; url: string }[] | null;
};

class ErrorApi extends Error {
  readonly status: number;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.status = status;
  }
}

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

// Cola de turnos compartida por todas las llamadas del proceso: entre una salida y la
// siguiente pasa al menos un segundo.
let ultimaSalida = 0;
let turno: Promise<void> = Promise.resolve();
function ritmo() {
  turno = turno.then(async () => {
    const espera = ultimaSalida + INTERVALO_MS - Date.now();
    if (espera > 0) await esperar(espera);
    ultimaSalida = Date.now();
  });
  return turno;
}

async function pedir<T>(ruta: string): Promise<T | null> {
  const clave = process.env.SEDIE_API_KEY?.trim();
  if (!clave) throw new Error("Falta SEDIE_API_KEY: hace falta para DATA_SOURCE=sedie-api.");

  let intentos429 = 0;
  let reintento500 = false;
  for (;;) {
    await ritmo();
    const respuesta = await fetch(`${API}${ruta}`, {
      headers: { Authorization: `Bearer ${clave}`, Accept: "application/json" },
    });
    // Una línea por solicitud real: con la caché, cada una es un fallo de caché.
    console.info(`[sedie-api] GET ${ruta} → ${respuesta.status}`);
    if (respuesta.ok) return (await respuesta.json()) as T;
    if (respuesta.status === 404) return null;
    if (respuesta.status === 429 && intentos429 < ESPERAS_429_MS.length) {
      await esperar(ESPERAS_429_MS[intentos429++]);
      continue;
    }
    if (respuesta.status >= 500 && !reintento500) {
      reintento500 = true;
      continue;
    }
    throw new ErrorApi(respuesta.status, `API de Sedie: HTTP ${respuesta.status} en ${ruta}`);
  }
}

// Listado completo: con 405 productos y 200 por página son 3 solicitudes. Se revalida cada hora.
export async function listarProductos(): Promise<ProductoApi[]> {
  "use cache";
  cacheLife("hours");
  const productos: ProductoApi[] = [];
  for (let pagina = 1, total = Infinity; productos.length < total; pagina++) {
    const respuesta = await pedir<{ total: number; productos: ProductoApi[] }>(
      `/productos?page=${pagina}&pageSize=${POR_PAGINA}`,
    );
    if (!respuesta || respuesta.productos.length === 0) break;
    total = respuesta.total;
    productos.push(...respuesta.productos);
  }
  return productos;
}

// Detalle de un producto, con galería y documentos. Se revalida cada 24 horas; null si no existe.
export async function detalleProducto(slug: string): Promise<ProductoDetalleApi | null> {
  "use cache";
  cacheLife("days");
  const respuesta = await pedir<{ producto: ProductoDetalleApi }>(`/productos/lookup?slug=${encodeURIComponent(slug)}`);
  return respuesta?.producto ?? null;
}
