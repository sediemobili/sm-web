import type { Download } from "@/lib/data";
import estilos from "./Producto.module.css";

// Hoy solo hay .dwg y .pdf; el resto cae en el ícono genérico.
const ICONOS: Record<string, string> = { pdf: "PDF", dwg: "DWG" };

export function Descargables({ descargables }: { descargables: Download[] }) {
  return (
    <section className={estilos.descargables} aria-labelledby="descargables">
      <h2 id="descargables" className="sm-seccion-titulo">
        Descargables
      </h2>
      <ul className={estilos.listaDescargas}>
        {descargables.map((archivo) => (
          <li key={archivo.url}>
            <a href={archivo.url} className={estilos.descarga} download>
              <span className={estilos.iconoArchivo} aria-hidden="true">
                {ICONOS[archivo.extension ?? ""] ?? "FILE"}
              </span>
              <span>
                {archivo.label}
                {archivo.extension ? <span className={estilos.extension}>.{archivo.extension}</span> : null}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
