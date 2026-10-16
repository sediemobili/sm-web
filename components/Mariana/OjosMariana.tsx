// Marca de Mariana: dos ojos rellenos del color del texto que los rodea. Es decorativa: el
// nombre accesible lo da quien la usa. El parpadeo lo pone el módulo del botón (Header.module.css).
export function OjosMariana({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <ellipse cx="8" cy="12" rx="2.5" ry="4" />
      <ellipse cx="16" cy="12" rx="2.5" ry="4" />
    </svg>
  );
}
