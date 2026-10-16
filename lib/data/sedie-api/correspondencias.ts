// Correspondencias entre la API de catálogo de Sedie y el sitio. Una sola fuente para los dos que
// las usan: el repositorio (lib/data/sedie-api) y el emparejador (scripts/sync/catalogo.ts).
// Sin imports: el script la carga con node directamente.

// Categoría de la API → categoría del sitio donde se publica (ruta de /product-category/).
// Mesabancos no tiene categoría propia en el sitio: va donde está hoy, en sillas escolares.
export const CATEGORIA_SITIO: Record<string, string> = {
  bancas: "bancas",
  escritorios: "escritorios",
  mesabancos: "sillas-escolares",
  mesas: "mesas",
  recepciones: "recepciones",
  sillas: "sillas-de-oficina",
  sofas: "sofas",
  "soft-seating": "soft-seating",
  taburetes: "taburetes",
};

// Subcategoría del sitio → valores de "tipo" de la API que le corresponden. Solo existen las de
// sillas de oficina; un "tipo" que no esté aquí deja el producto en su categoría, sin subcategoría.
export const SUBCATEGORIA_TIPO: Record<string, string[]> = {
  "silla-directiva": ["Silla directiva"],
  "silla-ejecutiva": ["Silla ejecutiva"],
  "silla-industrial": ["Silla industrial"],
  "silla-operativa": ["Silla operativa"],
  "silla-secretarial": ["Silla secretarial"],
  "sillas-visita": ["Silla de visita"],
  "sillas-escolares": ["Silla escolar", "Mesabanco escolar"],
};

// Prefijo con el que la API nombra algunos productos según su categoría: "Banca Kiwi" es la
// Kiwi de WordPress. Lo usa el emparejador cuando el nombre exacto no encuentra pareja.
export const PREFIJOS_CATEGORIA: Record<string, string[]> = {
  bancas: ["Banca"],
  escritorios: ["Escritorio"],
  mesabancos: ["Mesabanco"],
  mesas: ["Mesa"],
  recepciones: ["Recepción"],
  sillas: ["Silla"],
  sofas: ["Sofá"],
  "soft-seating": [],
  taburetes: ["Taburete"],
};

// Resoluciones manuales del equipo: slug de WordPress → slug de la API. Ganan a cualquier regla.
export const EQUIVALENCIAS_MANUALES: Record<string, string> = {
  kiwi: "bancas/banca-kiwi",
  malaga: "sofas/malaga",
};

// Categoría del sitio de un producto de la API: la de su categoría y, si su "tipo" corresponde a
// una subcategoría de esa misma categoría, la subcategoría. madreDe da la madre de cada slug.
export function categoriaSitio(categoria: string, tipo: string | null, madreDe: (slug: string) => string | null) {
  const base = CATEGORIA_SITIO[categoria] ?? null;
  if (!base || !tipo) return base;
  const primerNivel = madreDe(base) ?? base;
  const sub = Object.keys(SUBCATEGORIA_TIPO).find(
    (slug) => madreDe(slug) === primerNivel && SUBCATEGORIA_TIPO[slug].includes(tipo),
  );
  return sub ?? base;
}
