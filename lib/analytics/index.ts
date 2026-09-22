// Única puerta al dataLayer: ningún componente toca window.dataLayer directo.
// Si GTM no cargó (variable sin definir, bloqueador, render en servidor) no hace nada.

type Datos = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function enviarEvento(nombre: string, datos: Datos = {}) {
  if (typeof window === "undefined" || !Array.isArray(window.dataLayer)) return;
  window.dataLayer.push({ event: nombre, ...datos });
}
