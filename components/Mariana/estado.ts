// Estado de la acción en su propio archivo: en un archivo "use server" solo pueden exportarse
// funciones asíncronas, y una constante exportada desde ahí no llega bien al cliente.

import type { ErroresMariana } from "@/components/ContactoModal/esquema";

export type EstadoMariana = {
  estado: "inicial" | "exito" | "error";
  errores: ErroresMariana;
  mensaje: string | null;
};

export const estadoInicialMariana: EstadoMariana = { estado: "inicial", errores: {}, mensaje: null };
