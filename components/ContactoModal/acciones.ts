"use server";

import { guardarLead } from "@/lib/leads";
import { validarContacto, type ErroresContacto } from "./esquema";

export type EstadoContacto = {
  estado: "inicial" | "exito" | "error";
  errores: ErroresContacto;
  mensaje: string | null;
};

export const estadoInicial: EstadoContacto = { estado: "inicial", errores: {}, mensaje: null };

export async function enviarContacto(_previo: EstadoContacto, formData: FormData): Promise<EstadoContacto> {
  const { datos, errores } = validarContacto(Object.fromEntries(formData));
  if (!datos) {
    return { estado: "error", errores, mensaje: "Revisa los campos marcados." };
  }

  try {
    await guardarLead({ ...datos, origen: "modal-contacto", creadoEn: new Date().toISOString() });
  } catch (error) {
    console.error("[lead] no se pudo guardar", error);
    return {
      estado: "error",
      errores: {},
      mensaje: "No pudimos enviar tu solicitud. Inténtalo de nuevo en un momento.",
    };
  }

  // T22: aquí se empuja el evento generate_lead al dataLayer.
  return {
    estado: "exito",
    errores: {},
    mensaje: "¡Gracias! Recibimos tu solicitud y te contactamos en menos de 24 horas.",
  };
}
