"use client";

import { useEffect, useState } from "react";

// Ritmo tranquilo, para que se lea: escribe, espera, borra más rápido y pasa a la siguiente.
const MS_POR_LETRA = 70;
const MS_BORRADO = 30;
const PAUSA_ESCRITA = 2000;
const PAUSA_VACIA = 500;

type Props = {
  frases: readonly string[];
  className?: string;
};

// Texto que se escribe solo, letra a letra, en bucle. Es decorativo (aria-hidden): quien lo
// usa da el nombre accesible. Con prefers-reduced-motion muestra solo la primera frase, fija.
export function TextoTecleado({ frases, className }: Props) {
  const [texto, setTexto] = useState(frases[0] ?? "");

  useEffect(() => {
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)");
    let temporizador: ReturnType<typeof setTimeout>;
    let indice = 0;
    let letras = 0;
    let borrando = false;

    const paso = () => {
      const frase = frases[indice] ?? "";
      if (!borrando) {
        letras += 1;
        setTexto(frase.slice(0, letras));
        if (letras >= frase.length) {
          borrando = true;
          temporizador = setTimeout(paso, PAUSA_ESCRITA);
          return;
        }
        temporizador = setTimeout(paso, MS_POR_LETRA);
        return;
      }
      letras -= 1;
      setTexto(frase.slice(0, letras));
      if (letras <= 0) {
        borrando = false;
        indice = (indice + 1) % frases.length;
        temporizador = setTimeout(paso, PAUSA_VACIA);
        return;
      }
      temporizador = setTimeout(paso, MS_BORRADO);
    };

    const arrancar = () => {
      clearTimeout(temporizador);
      if (reducido.matches) {
        setTexto(frases[0] ?? "");
        return;
      }
      indice = 0;
      letras = 0;
      borrando = false;
      setTexto("");
      temporizador = setTimeout(paso, PAUSA_VACIA);
    };

    // El primer arranque va en un temporizador: el estado inicial ya es la primera frase.
    temporizador = setTimeout(arrancar, 0);
    reducido.addEventListener("change", arrancar);
    return () => {
      clearTimeout(temporizador);
      reducido.removeEventListener("change", arrancar);
    };
  }, [frases]);

  return (
    <span className={className} aria-hidden="true">
      {texto}
    </span>
  );
}
