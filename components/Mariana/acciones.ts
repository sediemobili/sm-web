"use server";

import { validarMariana } from "@/components/ContactoModal/esquema";
import { guardarLead } from "@/lib/leads";
import { estadoInicialMariana, type EstadoMariana } from "./estado";

export async function enviarMariana(_previo: EstadoMariana, formData: FormData): Promise<EstadoMariana> {
  const { datos, errores } = validarMariana(Object.fromEntries(formData));
  if (!datos) return { ...estadoInicialMariana, estado: "error", errores, mensaje: "Revisa los campos marcados." };

  try {
    await guardarLead({
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono,
      empresa: null,
      interes: null,
      mensaje: datos.mensaje,
      origen: "mariana",
      destino: null,
      categorias: null,
      volumen: null,
      plazo: null,
      renglones: null,
      creadoEn: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[lead] no se pudo guardar el mensaje de Mariana", error);
    return {
      ...estadoInicialMariana,
      estado: "error",
      mensaje: "No pudimos enviar tu mensaje. Inténtalo de nuevo en un momento.",
    };
  }

  return { estado: "exito", errores: {}, mensaje: null };
}
