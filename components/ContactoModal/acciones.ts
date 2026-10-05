"use server";

import { guardarLead } from "@/lib/leads";
import { leerAsistente, validarAsistente } from "./esquema";
import { estadoInicial, type EstadoContacto } from "./estado";

const ERROR_GUARDADO = "No pudimos enviar tu solicitud. Inténtalo de nuevo en un momento.";

export async function enviarContacto(_previo: EstadoContacto, formData: FormData): Promise<EstadoContacto> {
  const { datos, errores, paso } = validarAsistente(leerAsistente(formData));
  if (!datos) {
    return { ...estadoInicial, estado: "error", errores, paso, mensaje: "Revisa los campos marcados." };
  }

  try {
    await guardarLead({
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono,
      empresa: datos.empresa,
      interes: null,
      mensaje: datos.mensaje,
      origen: "modal-contacto",
      destino: datos.destino,
      categorias: datos.categorias,
      volumen: datos.volumen,
      plazo: datos.plazo,
      renglones: null,
      creadoEn: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[lead] no se pudo guardar", error);
    return { ...estadoInicial, estado: "error", mensaje: ERROR_GUARDADO };
  }

  return {
    estado: "exito",
    errores: {},
    paso: null,
    mensaje: "¡Gracias! Recibimos tu solicitud y te contactamos en menos de 24 horas.",
    destino: datos.destino,
    interes: datos.categorias.join(", "),
  };
}
