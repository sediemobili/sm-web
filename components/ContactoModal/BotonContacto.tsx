"use client";

import { useRef, useState } from "react";
import { ContactoModal } from "./ContactoModal";
import type { OrigenContacto } from "./estado";

// Botón que abre el modal de contacto y recupera el foco al cerrarse.
export function BotonContacto({
  label = "Contáctanos",
  className = "sm-boton",
  origen,
}: {
  label?: string;
  className?: string;
  origen?: OrigenContacto;
}) {
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={boton} type="button" className={className} onClick={() => setAbierto(true)}>
        {label}
      </button>
      <ContactoModal
        abierto={abierto}
        origen={origen}
        onCerrar={() => {
          setAbierto(false);
          boton.current?.focus();
        }}
      />
    </>
  );
}
