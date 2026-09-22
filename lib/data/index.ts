// Punto de entrada de la capa de datos: toda lectura del sitio pasa por aquí.
// DATA_SOURCE elige la implementación; hoy solo existe json.

import { jsonRepository } from "./json";
import type { DataRepository } from "./types";

function selectRepository(): DataRepository {
  const source = process.env.DATA_SOURCE ?? "json";
  if (source === "json") return jsonRepository;
  if (source === "db") {
    throw new Error("DATA_SOURCE=db todavía no está implementado: usa DATA_SOURCE=json.");
  }
  throw new Error(`DATA_SOURCE no reconocido: "${source}". Valores válidos: json, db.`);
}

export const repository: DataRepository = selectRepository();

export const {
  getProducts,
  getProductBySlug,
  getProductsByCategory,
  getProductsByCollection,
  getCategories,
  getCategoryBySlug,
  getCollections,
  getCollectionBySlug,
  getProcedencias,
  getProcedenciaBySlug,
  getPosts,
  getPostBySlug,
  getPages,
  getPageBySlug,
} = repository;

export type * from "./types";
