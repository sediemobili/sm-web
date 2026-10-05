// Iconos de línea del header (lupa, búsqueda asistida y lista): 24×24, trazo de 2 y el color
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

export function ListaIcono() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    </svg>
  );
}
