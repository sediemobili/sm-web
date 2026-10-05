// Estado de la acción en su propio archivo: en un archivo "use server" solo pueden exportarse
// funciones asíncronas, y una constante exportada desde ahí no llega bien al cliente.

export type EstadoNewsletter = {
  estado: "inicial" | "exito" | "error";
  mensaje: string | null;
};

export const estadoInicialNewsletter: EstadoNewsletter = { estado: "inicial", mensaje: null };
