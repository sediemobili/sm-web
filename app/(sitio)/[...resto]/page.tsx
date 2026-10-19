import { notFound } from "next/navigation";

// Cualquier ruta de varios niveles que no reconozca otra página cae aquí y muestra el
// not-found.tsx del grupo, con el marco del sitio. Las rutas concretas y [slug] van antes:
// Next resuelve primero lo más específico.
export default function Resto() {
  notFound();
}
