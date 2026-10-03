// Esquema del formulario de contacto. Lo usan la Server Action y el cliente,
// para que los mensajes sean los mismos en los dos lados.

import { z } from "zod";

// Opciones de "¿Qué estás buscando?" del formulario de cotización.
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

const esquemaContacto = z.object({
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

type DatosContacto = z.infer<typeof esquemaContacto>;

export type ErroresContacto = Partial<Record<keyof DatosContacto, string>>;

export function validarContacto(valores: Record<string, unknown>) {
  const resultado = esquemaContacto.safeParse(valores);
  if (resultado.success) return { datos: resultado.data, errores: {} as ErroresContacto };
  return { datos: null, errores: erroresPorCampo<ErroresContacto>(resultado.error.issues) };
}

// El primer mensaje de cada campo.
function erroresPorCampo<T extends Record<string, string | undefined>>(issues: z.core.$ZodIssue[]): T {
  const errores: Record<string, string> = {};
  for (const issue of issues) {
    const campo = issue.path[0];
    if (typeof campo === "string" && !errores[campo]) errores[campo] = issue.message;
  }
  return errores as T;
}

// Asistente del modal de contacto ------------------------------------------------

export const DESTINOS = ["oficina", "casa", "proyecto", "otro"] as const;
export type Destino = (typeof DESTINOS)[number];

export const ETIQUETAS_DESTINO: Record<Destino, string> = {
  oficina: "Oficina o corporativo",
  casa: "Casa u home office",
  proyecto: "Proyecto integral",
  otro: "Otro",
};

export const CATEGORIAS = [
  "Sillas",
  "Escritorios",
  "Recepciones",
  "Mesas",
  "Sofás y soft seating",
  "Mobiliario en general",
] as const;

export const VOLUMENES = ["1-5", "6-20", "21-50", "Más de 50"] as const;

export const PLAZOS = ["De inmediato", "Este mes", "1 a 3 meses", "Solo estoy cotizando"] as const;

// Lo que pide cada destino en los pasos 3 y 4.
export const pideVolumen = (destino: Destino | null) => destino === "oficina" || destino === "proyecto";
export const pidePlazo = (destino: Destino | null) => destino !== null && destino !== "otro";
export const pideEmpresa = (destino: Destino | null) => destino !== "casa";

export type Paso = "destino" | "categorias" | "detalles" | "datos";

// "Otro" no tiene detalles: el paso se salta.
export const pasosPara = (destino: Destino | null): Paso[] =>
  pidePlazo(destino) || destino === null
    ? ["destino", "categorias", "detalles", "datos"]
    : ["destino", "categorias", "datos"];

const esquemaDestino = z.object({
  destino: z.enum(DESTINOS, { message: "Elige para dónde es." }),
});

const esquemaCategorias = z.object({
  categorias: z.array(z.enum(CATEGORIAS)).min(1, "Elige al menos una opción."),
});

// Lo que el destino no pide se descarta aunque llegue.
const ignorado = z.unknown().transform(() => null);

const esquemaDetalles = (destino: Destino) =>
  z.object({
    volumen: pideVolumen(destino)
      ? z.enum(VOLUMENES, { message: "Elige para cuántas personas." })
      : ignorado,
    plazo: pidePlazo(destino) ? z.enum(PLAZOS, { message: "Elige para cuándo lo necesitas." }) : ignorado,
  });

const esquemaDatos = esquemaContacto.pick({ nombre: true, telefono: true, email: true, empresa: true, mensaje: true });

type DatosAsistente = {
  destino: Destino;
  categorias: (typeof CATEGORIAS)[number][];
  volumen: (typeof VOLUMENES)[number] | null;
  plazo: (typeof PLAZOS)[number] | null;
} & z.infer<typeof esquemaDatos>;

export type CampoAsistente = keyof DatosAsistente;
export type ErroresAsistente = Partial<Record<CampoAsistente, string>>;

// FormData pierde los valores repetidos con Object.fromEntries: las categorías se leen aparte.
// Un campo que el paso no muestra llega como null.
export function leerAsistente(formData: FormData): Record<string, unknown> {
  const texto = (nombre: string) => {
    const valor = formData.get(nombre);
    return typeof valor === "string" ? valor : null;
  };
  return {
    destino: texto("destino"),
    categorias: formData.getAll("categorias"),
    volumen: texto("volumen"),
    plazo: texto("plazo"),
    nombre: texto("nombre") ?? "",
    telefono: texto("telefono") ?? "",
    email: texto("email") ?? "",
    empresa: texto("empresa"),
    mensaje: texto("mensaje"),
  };
}

// Valida un solo paso: es lo que decide si el asistente puede avanzar.
export function validarPaso(paso: Paso, valores: Record<string, unknown>): ErroresAsistente {
  const destino = esquemaDestino.safeParse(valores);
  if (paso === "destino") return destino.success ? {} : erroresPorCampo(destino.error.issues);
  if (!destino.success) return erroresPorCampo(destino.error.issues);

  const esquema =
    paso === "categorias"
      ? esquemaCategorias
      : paso === "detalles"
        ? esquemaDetalles(destino.data.destino)
        : esquemaDatos;
  const resultado = esquema.safeParse(valores);
  return resultado.success ? {} : erroresPorCampo(resultado.error.issues);
}

// Valida el asistente completo, paso por paso. Devuelve el primer paso con errores
// para que el cliente vuelva a él.
export function validarAsistente(
  valores: Record<string, unknown>,
): { datos: DatosAsistente; errores: ErroresAsistente; paso: null } | { datos: null; errores: ErroresAsistente; paso: Paso } {
  const destino = esquemaDestino.safeParse(valores);
  const pasos = pasosPara(destino.success ? destino.data.destino : null);
  for (const paso of pasos) {
    const errores = validarPaso(paso, valores);
    if (Object.keys(errores).length > 0) return { datos: null, errores, paso };
  }

  const elegido = esquemaDestino.parse(valores).destino;
  const detalles = esquemaDetalles(elegido).parse(valores);
  const datos = esquemaDatos.parse(valores);
  return {
    datos: {
      destino: elegido,
      categorias: esquemaCategorias.parse(valores).categorias,
      volumen: detalles.volumen,
      plazo: detalles.plazo,
      ...datos,
      // Si eligió Casa el campo no se muestra: no se guarda aunque llegue.
      empresa: pideEmpresa(elegido) ? datos.empresa : null,
    },
    errores: {},
    paso: null,
  };
}

// Mini formulario de WhatsApp -----------------------------------------------------

const esquemaWhatsApp = esquemaContacto.pick({ nombre: true, telefono: true });
export type ErroresWhatsApp = Partial<Record<keyof z.infer<typeof esquemaWhatsApp>, string>>;

export function validarWhatsApp(valores: Record<string, unknown>) {
  const resultado = esquemaWhatsApp.safeParse(valores);
  if (resultado.success) return { datos: resultado.data, errores: {} as ErroresWhatsApp };
  return { datos: null, errores: erroresPorCampo<ErroresWhatsApp>(resultado.error.issues) };
}
