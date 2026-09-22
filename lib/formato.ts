// Formato de fecha larga en español, para el blog.
const FECHA_LARGA = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" });

export const formatearFecha = (fecha: string) => FECHA_LARGA.format(new Date(fecha));
