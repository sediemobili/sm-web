// Esquema del formulario de contacto. Lo usan la Server Action y el cliente,
// para que los mensajes sean los mismos en los dos lados.

import { z } from "zod";

export const INTERESES = [
  "Sillas de oficina",
  "Escritorios",
  "Recepciones",
  "Mesas",
  "Mobiliario en General",
  "Proyecto Integral",
  "Otro",
] as const;

// 10 dígitos, admitiendo espacios, guiones y paréntesis entre ellos.
const TELEFONO = /^[\d\s()-]+$/;

const opcional = (valor: unknown) => (typeof valor === "string" && valor.trim() === "" ? null : valor);

export const esquemaContacto = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre (mínimo 2 caracteres)."),
  email: z.string().trim().pipe(z.email("Escribe un correo válido.")),
  telefono: z
    .string()
    .trim()
    .regex(TELEFONO, "El teléfono solo admite números, espacios, guiones y paréntesis.")
    .refine((valor) => valor.replace(/\D/g, "").length === 10, "El teléfono debe tener 10 dígitos."),
  empresa: z.preprocess(opcional, z.string().trim().nullable()),
  interes: z.enum(INTERESES, { message: "Elige qué estás buscando." }),
  mensaje: z.preprocess(opcional, z.string().trim().nullable()),
});

export type DatosContacto = z.infer<typeof esquemaContacto>;

export type ErroresContacto = Partial<Record<keyof DatosContacto, string>>;

export function validarContacto(valores: Record<string, unknown>) {
  const resultado = esquemaContacto.safeParse(valores);
  if (resultado.success) return { datos: resultado.data, errores: {} as ErroresContacto };

  const errores: ErroresContacto = {};
  for (const issue of resultado.error.issues) {
    const campo = issue.path[0] as keyof DatosContacto | undefined;
    if (campo && !errores[campo]) errores[campo] = issue.message;
  }
  return { datos: null, errores };
}
