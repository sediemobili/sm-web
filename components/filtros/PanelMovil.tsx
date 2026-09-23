"use client";

import { useId, useState } from "react";
import estilos from "./filtros.module.css";

// En móvil el panel se pliega tras un botón; en escritorio está siempre visible.
export function PanelMovil({ activos, children }: { activos: number; children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const panelId = useId();

  return (
    <aside className={estilos.lateral} aria-label="Filtros">
      <button
        type="button"
        className={estilos.botonFiltros}
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto((previo) => !previo)}
      >
        Filtros Inteligentes{activos > 0 ? ` (${activos})` : ""}
      </button>
      <div id={panelId} className={estilos.contenedor} data-open={abierto}>
        {children}
      </div>
    </aside>
  );
}
