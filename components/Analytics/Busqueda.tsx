"use client";

import { useEffect } from "react";
import { enviarEvento } from "@/lib/analytics";

// Evento search de GA4, con el término y cuántos resultados salieron.
export function Busqueda({ termino, resultados }: { termino: string; resultados: number }) {
  useEffect(() => {
    if (!termino) return;
    enviarEvento("search", { search_term: termino, resultados });
  }, [termino, resultados]);

  return null;
}
