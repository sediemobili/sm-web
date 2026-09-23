"use client";

import { useRef } from "react";
import estilos from "./Home.module.css";

// Fila desplazable con flechas, como los carruseles del original. El scroll táctil,
// la rueda y el teclado siguen funcionando: las flechas solo desplazan la lista.
export function Carrusel({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  const lista = useRef<HTMLUListElement>(null);

  const mover = (direccion: 1 | -1) => {
    const nodo = lista.current;
    if (!nodo) return;
    nodo.scrollBy({ left: direccion * nodo.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className={estilos.carrusel}>
      <ul ref={lista} className={estilos.carruselLista}>
        {children}
      </ul>
      <button type="button" className={estilos.flechaPrev} aria-label={`Anteriores de ${etiqueta}`} onClick={() => mover(-1)}>
        ‹
      </button>
      <button type="button" className={estilos.flechaNext} aria-label={`Siguientes de ${etiqueta}`} onClick={() => mover(1)}>
        ›
      </button>
    </div>
  );
}
