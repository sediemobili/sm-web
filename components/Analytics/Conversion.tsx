"use client";

import { useEffect } from "react";
import { enviarEvento } from "@/lib/analytics";

// Evento de conversión de /gracias/, la página a la que llega quien envía una solicitud.
export function Conversion({ pagina }: { pagina: string }) {
  useEffect(() => {
    enviarEvento("conversion", { pagina });
  }, [pagina]);

  return null;
}
