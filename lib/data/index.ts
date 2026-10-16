// Punto de entrada de la capa de datos: toda lectura del sitio pasa por aquí.
// DATA_SOURCE elige la implementación: json (data/*.json) o sedie-api (la API de Sedie).

import { jsonRepository } from "./json";
import { sedieApiRepository } from "./sedie-api";
import type { DataRepository } from "./types";

function selectRepository(): DataRepository {
  // Sin definir o vacío se toma json, el valor por defecto del proyecto.
  const source = process.env.DATA_SOURCE?.trim() || "json";
  if (source === "json") return jsonRepository;
  if (source === "sedie-api") return sedieApiRepository;
  if (source === "db") {
    throw new Error("DATA_SOURCE=db todavía no está implementado: usa DATA_SOURCE=json.");
  }
  throw new Error(`DATA_SOURCE no reconocido: "${source}". Valores válidos: json, sedie-api, db.`);
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
