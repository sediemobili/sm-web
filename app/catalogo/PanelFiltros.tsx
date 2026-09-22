"use client";

import { useId, useState } from "react";
import estilos from "./catalogo.module.css";

// Único componente de cliente del catálogo: abre y cierra el panel en móvil.
// En escritorio el panel siempre está visible, así que el botón se oculta por CSS.
export function PanelFiltros({ activos, children }: { activos: number; children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        className={`sm-boton sm-boton--secundario ${estilos.botonFiltros}`}
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto((previo) => !previo)}
      >
        Filtros{activos > 0 ? ` (${activos})` : ""}
      </button>

      <div id={panelId} className={estilos.panel} data-open={abierto}>
        {children}
      </div>
    </>
  );
}
