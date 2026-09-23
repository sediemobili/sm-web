import estilos from "./filtros.module.css";

// Hueco que ocupa la rejilla mientras se resuelve la parte dinámica de la página.
export function EsqueletoRejilla({ tarjetas = 8 }: { tarjetas?: number }) {
  return (
    <ul className={estilos.esqueleto} aria-hidden="true">
      {Array.from({ length: tarjetas }, (_, indice) => (
        <li key={indice} className={estilos.esqueletoTarjeta} />
      ))}
    </ul>
  );
}
