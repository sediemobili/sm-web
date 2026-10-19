"use server";

import { z } from "zod";
import { validarContacto } from "@/components/ContactoModal/esquema";
import { guardarLead } from "@/lib/leads";
import type { EstadoCotizacion } from "./estado";

const esquemaRenglones = z.array(
  z.object({ slug: z.string(), variacionId: z.number().nullable(), cantidad: z.number().int().positive() }),
);

export async function enviarCotizacion(_previo: EstadoCotizacion, formData: FormData): Promise<EstadoCotizacion> {
  const { datos, errores } = validarContacto(Object.fromEntries(formData));
  if (!datos) return { estado: "error", errores, mensaje: "Revisa los campos marcados.", interes: null };

  const renglones = esquemaRenglones.safeParse(JSON.parse(String(formData.get("renglones") ?? "[]")));
  if (!renglones.success || renglones.data.length === 0) {
    return { estado: "error", errores: {}, mensaje: "Tu lista de cotización está vacía.", interes: null };
  }

  try {
    await guardarLead({
      ...datos,
      origen: "cotizacion",
      destino: null,
      categorias: null,
      volumen: null,
      plazo: null,
      renglones: renglones.data,
      creadoEn: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[lead] no se pudo guardar la cotización", error);
    return {
      estado: "error",
      errores: {},
      mensaje: "No pudimos enviar tu solicitud. Inténtalo de nuevo en un momento.",
      interes: null,
    };
  }

  return { estado: "exito", errores: {}, mensaje: null, interes: datos.interes };
}
