"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Renglon } from "./types";

const CLAVE = "sm-cotizacion";

type Contexto = {
  renglones: Renglon[];
  total: number;
  agregar: (renglon: Renglon) => void;
  quitar: (slug: string, variacionId: number | null) => void;
  cambiarCantidad: (slug: string, variacionId: number | null, cantidad: number) => void;
  vaciar: () => void;
};

const CotizacionContexto = createContext<Contexto | null>(null);

const mismoRenglon = (renglon: Renglon, slug: string, variacionId: number | null) =>
  renglon.slug === slug && renglon.variacionId === variacionId;

// localStorage puede estar bloqueado (modo privado, permisos): la lista sigue funcionando
// en memoria, solo que no se recuerda entre visitas.
function leer(): Renglon[] {
  try {
    const guardado = window.localStorage.getItem(CLAVE);
    const datos: unknown = guardado ? JSON.parse(guardado) : [];
    if (!Array.isArray(datos)) return [];
    return datos.filter(
      (renglon): renglon is Renglon =>
        typeof renglon === "object" &&
        renglon !== null &&
        typeof (renglon as Renglon).slug === "string" &&
        typeof (renglon as Renglon).cantidad === "number",
    );
  } catch {
    return [];
  }
}

function escribir(renglones: Renglon[]) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(renglones));
  } catch {
    // Sin persistencia: no hay nada que hacer y no debe romper la página.
  }
}

export function CotizacionProvider({ children }: { children: React.ReactNode }) {
  const [renglones, setRenglones] = useState<Renglon[]>([]);

  // Se lee después del primer render para que el HTML del servidor y el del cliente coincidan.
  useEffect(() => setRenglones(leer()), []);

  const actualizar = useCallback((calcular: (previos: Renglon[]) => Renglon[]) => {
    setRenglones((previos) => {
      const siguientes = calcular(previos);
      escribir(siguientes);
      return siguientes;
    });
  }, []);

  const valor = useMemo<Contexto>(
    () => ({
      renglones,
      total: renglones.length,
      agregar: (renglon) =>
        actualizar((previos) => {
          const existente = previos.find((previo) => mismoRenglon(previo, renglon.slug, renglon.variacionId));
          if (!existente) return [...previos, renglon];
          return previos.map((previo) =>
            previo === existente ? { ...previo, cantidad: previo.cantidad + renglon.cantidad } : previo,
          );
        }),
      quitar: (slug, variacionId) =>
        actualizar((previos) => previos.filter((previo) => !mismoRenglon(previo, slug, variacionId))),
      cambiarCantidad: (slug, variacionId, cantidad) =>
        actualizar((previos) =>
          previos.map((previo) =>
            mismoRenglon(previo, slug, variacionId) ? { ...previo, cantidad: Math.max(1, cantidad) } : previo,
          ),
        ),
      vaciar: () => actualizar(() => []),
    }),
    [renglones, actualizar],
  );

  return <CotizacionContexto.Provider value={valor}>{children}</CotizacionContexto.Provider>;
}

export function useCotizacion() {
  const contexto = useContext(CotizacionContexto);
  if (!contexto) throw new Error("useCotizacion necesita CotizacionProvider (va en app/layout.tsx).");
  return contexto;
}
