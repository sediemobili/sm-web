import Link from "next/link";
import { construirUrl, type Filtros } from "@/lib/filtros";
import estilos from "./filtros.module.css";

// Enlaces reales, con rel prev/next, para que Google siga las páginas.
export function Paginacion({ base, filtros, paginas }: { base: string; filtros: Filtros; paginas: number }) {
  if (paginas < 2) return null;
  const pagina = Math.min(filtros.pagina, paginas);

  return (
    <nav className={estilos.paginacion} aria-label="Paginación">
      {pagina > 1 ? (
        <Link href={construirUrl(base, filtros, { pagina: pagina - 1 })} rel="prev" className={estilos.pagina}>
          Anterior
        </Link>
      ) : null}
      <ol className={estilos.paginas}>
        {Array.from({ length: paginas }, (_, indice) => indice + 1).map((numero) => (
          <li key={numero}>
            <Link
              href={construirUrl(base, filtros, { pagina: numero })}
              className={estilos.pagina}
              data-activa={numero === pagina}
              aria-current={numero === pagina ? "page" : undefined}
            >
              {numero}
            </Link>
          </li>
        ))}
      </ol>
      {pagina < paginas ? (
        <Link href={construirUrl(base, filtros, { pagina: pagina + 1 })} rel="next" className={estilos.pagina}>
          Siguiente
        </Link>
      ) : null}
    </nav>
  );
}
