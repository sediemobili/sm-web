// Estado de la acción en su propio archivo: en un archivo "use server" solo pueden exportarse
// funciones asíncronas, y una constante exportada desde ahí no llega bien al cliente.

import type { ErroresContacto } from "@/components/ContactoModal/esquema";

export type EstadoCotizacion = {
  estado: "inicial" | "exito" | "error";
  errores: ErroresContacto;
  mensaje: string | null;
  // Lo consume el evento generate_lead en cliente.
  interes: string | null;
};

export const estadoInicialCotizacion: EstadoCotizacion = {
  estado: "inicial",
  errores: {},
  mensaje: null,
  interes: null,
};
