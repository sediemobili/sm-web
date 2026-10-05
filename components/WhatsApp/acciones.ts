"use server";

import { validarWhatsApp } from "@/components/ContactoModal/esquema";
import { guardarLead } from "@/lib/leads";
import { WHATSAPP } from "@/lib/sitio";
import { estadoInicialWhatsApp, type EstadoWhatsApp } from "./estado";

export async function contactarWhatsApp(_previo: EstadoWhatsApp, formData: FormData): Promise<EstadoWhatsApp> {
  const { datos, errores } = validarWhatsApp(Object.fromEntries(formData));
  if (!datos) return { ...estadoInicialWhatsApp, estado: "error", errores, mensaje: "Revisa los campos marcados." };

  try {
    await guardarLead({
      nombre: datos.nombre,
      email: null,
      telefono: datos.telefono,
      empresa: null,
      interes: null,
      mensaje: null,
      origen: "whatsapp",
      destino: null,
      categorias: null,
      volumen: null,
      plazo: null,
      renglones: null,
      creadoEn: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[lead] no se pudo guardar el contacto de WhatsApp", error);
    return {
      ...estadoInicialWhatsApp,
      estado: "error",
      mensaje: "No pudimos registrar tus datos. Inténtalo de nuevo en un momento.",
    };
  }

  return { estado: "exito", errores: {}, mensaje: null, url: `https://wa.me/${WHATSAPP}` };
}
