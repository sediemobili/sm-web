// Iconos de línea del header (lupa, búsqueda asistida y cotización): 24×24, trazo de 2 y el color
// del texto que los rodea.

export function LupaIcono() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
    </svg>
  );
}

// Anuncio de la búsqueda asistida por IA: solo visual por ahora.
export function ChispaIcono() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      role="img"
      aria-label="Búsqueda asistida"
      focusable="false"
    >
      <title>Búsqueda asistida</title>
      <path d="M12 3l1.8 4.9L18.7 9.7l-4.9 1.8L12 16.4l-1.8-4.9L5.3 9.7l4.9-1.8z" strokeLinejoin="round" />
      <path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" strokeLinejoin="round" />
    </svg>
  );
}

// Documento con lápiz: la lista de cotización.
export function CotizacionIcono() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M13 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21H11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 3l5 5h-3.5A1.5 1.5 0 0 1 13 6.5z" strokeLinejoin="round" />
      <path d="M8 12h6M8 16h3" strokeLinecap="round" />
      <path d="M14 21l.6-2.6 4.9-4.9a1.4 1.4 0 0 1 2 2l-4.9 4.9z" strokeLinejoin="round" />
    </svg>
  );
}
