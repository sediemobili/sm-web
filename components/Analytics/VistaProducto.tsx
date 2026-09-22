"use client";

import { useEffect } from "react";
import { enviarEvento } from "@/lib/analytics";

// view_item de la ficha de producto.
export function VistaProducto({
  slug,
  nombre,
  categoria,
}: {
  slug: string;
  nombre: string;
  categoria: string | null;
}) {
  useEffect(() => {
    enviarEvento("view_item", { item_id: slug, item_name: nombre, item_category: categoria });
  }, [slug, nombre, categoria]);

  return null;
}
