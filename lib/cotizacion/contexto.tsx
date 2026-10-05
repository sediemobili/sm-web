"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Renglon } from "./types";

const CLAVE = "sm-cotizacion";

type Contexto = {
  renglones: Renglon[];
  // Total de piezas (la suma de las cantidades) y de productos distintos (renglones).
  piezas: number;
  productos: number;
  agregar: (renglon: Renglon) => void;
  quitar: (slug: string, variacionId: number | null) => void;
  // Por debajo de 1 quita el renglón, y se puede deshacer.
  cambiarCantidad: (slug: string, variacionId: number | null, cantidad: number) => void;
  // El último renglón quitado, para ofrecer deshacer; null si no hay nada que deshacer.
  quitado: Renglon | null;
  deshacer: () => void;
  vaciar: () => void;
};

// Piezas y productos distintos de un conjunto de renglones.
export function contar(renglones: Renglon[]) {
  return { piezas: renglones.reduce((suma, renglon) => suma + renglon.cantidad, 0), productos: renglones.length };
}

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
  // Último renglón quitado y su posición, para poder devolverlo a su sitio.
  const [quitado, setQuitado] = useState<{ renglon: Renglon; indice: number } | null>(null);

  // Se lee después del primer render para que el HTML del servidor y el del cliente coincidan.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage solo existe en el cliente; leerlo tras el primer render evita el desajuste de hidratación.
  useEffect(() => setRenglones(leer()), []);

  const actualizar = useCallback((calcular: (previos: Renglon[]) => Renglon[]) => {
    setRenglones((previos) => {
      const siguientes = calcular(previos);
      escribir(siguientes);
      return siguientes;
    });
  }, []);

  // Quita un renglón y lo recuerda, con su posición, para deshacer.
  const sacar = useCallback(
    (slug: string, variacionId: number | null) => {
      const indice = renglones.findIndex((renglon) => mismoRenglon(renglon, slug, variacionId));
      if (indice === -1) return;
      setQuitado({ renglon: renglones[indice], indice });
      actualizar((previos) => previos.filter((previo) => !mismoRenglon(previo, slug, variacionId)));
    },
    [renglones, actualizar],
  );

  const valor = useMemo<Contexto>(
    () => ({
      renglones,
      ...contar(renglones),
      agregar: (renglon) =>
        actualizar((previos) => {
          const existente = previos.find((previo) => mismoRenglon(previo, renglon.slug, renglon.variacionId));
          if (!existente) return [...previos, renglon];
          return previos.map((previo) =>
            previo === existente ? { ...previo, cantidad: previo.cantidad + renglon.cantidad } : previo,
          );
        }),
      quitar: sacar,
      cambiarCantidad: (slug, variacionId, cantidad) => {
        const entera = Math.floor(cantidad);
        if (!Number.isFinite(entera)) return;
        if (entera < 1) return sacar(slug, variacionId);
        actualizar((previos) =>
          previos.map((previo) => (mismoRenglon(previo, slug, variacionId) ? { ...previo, cantidad: entera } : previo)),
        );
      },
      quitado: quitado?.renglon ?? null,
      deshacer: () => {
        if (!quitado) return;
        actualizar((previos) => {
          // Si mientras tanto se volvió a añadir, no se duplica.
          if (previos.some((previo) => mismoRenglon(previo, quitado.renglon.slug, quitado.renglon.variacionId))) {
            return previos;
          }
          const siguientes = [...previos];
          siguientes.splice(Math.min(quitado.indice, siguientes.length), 0, quitado.renglon);
          return siguientes;
        });
        setQuitado(null);
      },
      vaciar: () => {
        setQuitado(null);
        actualizar(() => []);
      },
    }),
    [renglones, actualizar, sacar, quitado],
  );

  return <CotizacionContexto.Provider value={valor}>{children}</CotizacionContexto.Provider>;
}

export function useCotizacion() {
  const contexto = useContext(CotizacionContexto);
  if (!contexto) throw new Error("useCotizacion necesita CotizacionProvider (va en app/layout.tsx).");
  return contexto;
}
