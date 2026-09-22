"use client";

import { useRef, useState } from "react";
import { ContactoModal } from "./ContactoModal";

// Botón que abre el modal de contacto y recupera el foco al cerrarse.
export function BotonContacto({ label = "Contáctanos", className = "sm-boton" }: { label?: string; className?: string }) {
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={boton} type="button" className={className} onClick={() => setAbierto(true)}>
        {label}
      </button>
      <ContactoModal
        abierto={abierto}
        onCerrar={() => {
          setAbierto(false);
          boton.current?.focus();
        }}
      />
    </>
  );
}
