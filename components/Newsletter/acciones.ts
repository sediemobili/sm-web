"use server";

import { z } from "zod";
import { guardarLead } from "@/lib/leads";

export type EstadoNewsletter = {
  estado: "inicial" | "exito" | "error";
  mensaje: string | null;
};

export const estadoInicialNewsletter: EstadoNewsletter = { estado: "inicial", mensaje: null };

const esquemaNewsletter = z.object({ email: z.string().trim().pipe(z.email("Escribe un correo válido.")) });

export async function suscribir(_previo: EstadoNewsletter, formData: FormData): Promise<EstadoNewsletter> {
  const resultado = esquemaNewsletter.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { estado: "error", mensaje: resultado.error.issues[0]?.message ?? "Revisa el correo." };
  }

  try {
    await guardarLead({
      nombre: null,
      email: resultado.data.email,
      telefono: null,
      empresa: null,
      interes: null,
      mensaje: null,
      origen: "newsletter",
      renglones: null,
      creadoEn: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[lead] no se pudo guardar la suscripción", error);
    return { estado: "error", mensaje: "No pudimos registrarte. Inténtalo de nuevo en un momento." };
  }

  return { estado: "exito", mensaje: "¡Listo! Te avisaremos de las novedades." };
}
