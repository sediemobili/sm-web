// Íconos de las tarjetas del paso "¿Para dónde es?". Decorativos: el texto de la tarjeta los nombra.

import type { Destino } from "./esquema";

const comunes = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

function Oficina() {
  return (
    <svg {...comunes}>
      <path d="M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17" />
      <path d="M15 9h4a1 1 0 0 1 1 1v11" />
      <path d="M2 21h20M8 7h3M8 11h3M8 15h3M10 21v-3" />
    </svg>
  );
}

function Casa() {
  return (
    <svg {...comunes}>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function Proyecto() {
  return (
    <svg {...comunes}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

function Otro() {
  return (
    <svg {...comunes}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export const ICONOS_DESTINO: Record<Destino, () => React.JSX.Element> = {
  oficina: Oficina,
  casa: Casa,
  proyecto: Proyecto,
  otro: Otro,
};
