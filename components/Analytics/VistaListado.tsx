"use client";

import { useEffect } from "react";
import { enviarEvento } from "@/lib/analytics";

// view_item_list en las páginas de listado, que son de servidor: este componente
// solo existe para disparar el evento en cliente, sin convertir la página.
export function VistaListado({ nombre, total }: { nombre: string; total: number }) {
  useEffect(() => {
    enviarEvento("view_item_list", { item_list_name: nombre, resultados: total });
  }, [nombre, total]);

  return null;
}
