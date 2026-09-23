import type { Download } from "@/lib/data";
import estilos from "./producto.module.css";

// Hoy solo hay .dwg y .pdf; el resto cae en la etiqueta genérica.
const ETIQUETAS: Record<string, string> = { pdf: "PDF", dwg: "DWG" };

// En el original es un acordeón plegado bajo "Especificaciones"; aquí es <details> nativo.
export function Descargables({ descargables }: { descargables: Download[] }) {
  return (
    <details className={estilos.acordeon}>
      <summary className={estilos.acordeonTitulo}>Descargables</summary>
      <ul className={estilos.descargas}>
        {descargables.map((archivo) => (
          <li key={archivo.url}>
            <a href={archivo.url} className={estilos.descarga} download>
              <span className={estilos.descargaTipo} aria-hidden="true">
                {ETIQUETAS[archivo.extension ?? ""] ?? "FILE"}
              </span>
              {archivo.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
