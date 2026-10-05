// Estado de la acción en su propio archivo: en un archivo "use server" solo pueden exportarse
// funciones asíncronas, y una constante exportada desde ahí no llega bien al cliente.

import type { ErroresAsistente, Paso } from "./esquema";

export type EstadoContacto = {
  estado: "inicial" | "exito" | "error";
  errores: ErroresAsistente;
  // Primer paso con errores, para que el asistente vuelva a él.
  paso: Paso | null;
  mensaje: string | null;
  // Los consume el evento generate_lead en cliente.
  destino: string | null;
  interes: string | null;
};

export const estadoInicial: EstadoContacto = {
  estado: "inicial",
  errores: {},
  paso: null,
  mensaje: null,
  destino: null,
  interes: null,
};
