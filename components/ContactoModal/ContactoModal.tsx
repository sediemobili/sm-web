"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Asistente } from "./Asistente";
import estilos from "./ContactoModal.module.css";

type Props = {
  abierto: boolean;
  onCerrar: () => void;
};

const TEXTO =
  "¿Necesitas mobiliario ergonómico o corporativo? Cuéntanos qué buscas y te llamamos en menos de 24h " +
  "con las mejores opciones para tu oficina.";

export function ContactoModal({ abierto, onCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  // Tras un envío correcto, la siguiente apertura empieza un asistente nuevo.
  const enviado = useRef(false);
  const [ronda, setRonda] = useState(0);

  // showModal() da el modo modal del navegador: foco atrapado, inerte el resto y Escape nativo.
  // Va en layout effect para que el diálogo ya esté abierto cuando el asistente mueva el foco.
  useLayoutEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) elemento.showModal();
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-scroll-locked", abierto);
    return () => document.documentElement.classList.remove("is-scroll-locked");
  }, [abierto]);

  const cerrar = () => {
    if (enviado.current) {
      enviado.current = false;
      setRonda((previa) => previa + 1);
    }
    onCerrar();
  };

  return (
    <dialog
      ref={dialogo}
      className={estilos.dialogo}
      aria-labelledby={tituloId}
      onClose={cerrar}
      onClick={(evento) => {
        if (evento.target === dialogo.current) cerrar();
      }}
    >
      <div className={estilos.panel}>
        <button type="button" className={estilos.cerrar} aria-label="Cerrar" onClick={cerrar}>
          ×
        </button>

        <h2 id={tituloId} className={estilos.titulo}>
          Contáctanos
        </h2>
        <p className={estilos.texto}>{TEXTO}</p>

        <Asistente key={ronda} activo={abierto} onExito={() => (enviado.current = true)} />
      </div>
    </dialog>
  );
}
