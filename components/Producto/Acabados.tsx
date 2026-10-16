import Image from "next/image";
import type { Acabado } from "@/lib/data";
import estilos from "./Producto.module.css";

// Acabados del producto (telas, colores, materiales), con el mismo acordeón que "Descargables".
// Solo los trae la API y hoy llegan vacíos: la ficha no lo pinta mientras la lista esté vacía.
export function Acabados({ acabados }: { acabados: Acabado[] }) {
  return (
    <details className={estilos.acordeon}>
      <summary className={estilos.acordeonTitulo}>Acabados</summary>
      <ul className={estilos.acabados}>
        {acabados.map((acabado) => (
          <li key={acabado.id} className={estilos.acabado}>
            <span className={estilos.acabadoMuestra}>
              {acabado.image ? (
                <Image src={acabado.image} alt="" width={40} height={40} sizes="40px" className={estilos.acabadoImagen} />
              ) : null}
            </span>
            <span>
              {acabado.label}
              {acabado.description ? <span className={estilos.acabadoDescripcion}>{acabado.description}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
