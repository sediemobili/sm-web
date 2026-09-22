// Un renglón guarda solo la referencia: los datos del producto se leen de lib/data al pintar.
export type Renglon = {
  slug: string;
  variacionId: number | null;
  cantidad: number;
};
