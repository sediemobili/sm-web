"use server";

import { guardarLead } from "@/lib/leads";
import { validarContacto, type ErroresContacto } from "./esquema";

export type EstadoContacto = {
  estado: "inicial" | "exito" | "error";
  errores: ErroresContacto;
  mensaje: string | null;
  // Lo consume el evento generate_lead en cliente.
  interes: string | null;
};

export const estadoInicial: EstadoContacto = { estado: "inicial", errores: {}, mensaje: null, interes: null };

export async function enviarContacto(_previo: EstadoContacto, formData: FormData): Promise<EstadoContacto> {
  const { datos, errores } = validarContacto(Object.fromEntries(formData));
  if (!datos) {
    return { estado: "error", errores, mensaje: "Revisa los campos marcados.", interes: null };
  }

  try {
    await guardarLead({ ...datos, origen: "modal-contacto", renglones: null, creadoEn: new Date().toISOString() });
  } catch (error) {
    console.error("[lead] no se pudo guardar", error);
    return {
      estado: "error",
      errores: {},
      mensaje: "No pudimos enviar tu solicitud. Inténtalo de nuevo en un momento.",
      interes: null,
    };
  }

  return {
    estado: "exito",
    errores: {},
    mensaje: "¡Gracias! Recibimos tu solicitud y te contactamos en menos de 24 horas.",
    interes: datos.interes,
  };
}
