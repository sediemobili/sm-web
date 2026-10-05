"use client";

import { useId, useState } from "react";
import estilos from "./Cantidad.module.css";

type Props = {
  valor: number;
  onCambiar: (cantidad: number) => void;
  // Nombre de lo que se cuenta, para las etiquetas accesibles ("Silla Eugenia").
  de: string;
  // Con 0, el botón de restar sigue activo en 1 y pide bajar de 1 (la lista quita el producto).
  minimo?: 0 | 1;
};

// Control de cantidad: restar, campo para escribirla a mano y sumar. Solo es la interfaz:
// qué pasa con cada cantidad lo decide quien lo usa (la lista, en lib/cotizacion).
export function Cantidad({ valor, onCambiar, de, minimo = 1 }: Props) {
  const id = useId();
  // Lo que se está escribiendo: se confirma al salir del campo o con Enter.
  const [borrador, setBorrador] = useState<string | null>(null);

  const confirmar = () => {
    if (borrador === null) return;
    const numero = Number.parseInt(borrador, 10);
    setBorrador(null);
    if (Number.isNaN(numero)) return;
    onCambiar(Math.max(minimo, numero));
  };

  return (
    <div className={estilos.cantidad} role="group" aria-labelledby={`${id}-etiqueta`}>
      <span id={`${id}-etiqueta`} className="sm-oculto">
        Cantidad de {de}
      </span>
      <button
        type="button"
        className={estilos.paso}
        aria-label={`Quitar una unidad de ${de}`}
        disabled={minimo === 1 && valor <= 1}
        onClick={() => onCambiar(valor - 1)}
      >
        −
      </button>
      <label htmlFor={`${id}-campo`} className="sm-oculto">
        Cantidad de {de}
      </label>
      <input
        id={`${id}-campo`}
        type="number"
        inputMode="numeric"
        min={minimo}
        className={estilos.campo}
        value={borrador ?? String(valor)}
        onChange={(evento) => setBorrador(evento.target.value)}
        onBlur={confirmar}
        onKeyDown={(evento) => {
          if (evento.key === "Enter") {
            evento.preventDefault();
            confirmar();
          }
        }}
      />
      <button
        type="button"
        className={estilos.paso}
        aria-label={`Añadir una unidad de ${de}`}
        onClick={() => onCambiar(valor + 1)}
      >
        +
      </button>
    </div>
  );
}
