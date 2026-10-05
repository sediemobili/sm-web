// Estado de la acción en su propio archivo: en un archivo "use server" solo pueden exportarse
// funciones asíncronas, y una constante exportada desde ahí no llega bien al cliente.

import type { ErroresWhatsApp } from "@/components/ContactoModal/esquema";

export type EstadoWhatsApp = {
  estado: "inicial" | "exito" | "error";
  errores: ErroresWhatsApp;
  mensaje: string | null;
  // Enlace de wa.me al que redirige el cliente tras guardar el lead.
  url: string | null;
};

export const estadoInicialWhatsApp: EstadoWhatsApp = { estado: "inicial", errores: {}, mensaje: null, url: null };
