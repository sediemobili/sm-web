import Link from "next/link";
import { construirUrl, hayFiltros, type Filtros as FiltrosActivos, type Opciones } from "@/lib/filtros";
import estilos from "./filtros.module.css";
import { PanelMovil } from "./PanelMovil";

type Props = {
  // Ruta sobre la que se construyen los enlaces: /catalogo/ o la de la categoría.
  base: string;
  filtros: FiltrosActivos;
  opciones: Opciones;
};

// Panel "Filtros Inteligentes" del original, compartido por el catálogo y la categoría.
// Cada opción es un enlace real, así que funciona sin JavaScript y Google lo puede seguir.
export function Filtros({ base, filtros, opciones }: Props) {
  const enlace = (cambios: Partial<FiltrosActivos>) => construirUrl(base, filtros, { ...cambios, pagina: 1 });
  const activos = [filtros.categoria, filtros.coleccion, filtros.procedencia].filter(Boolean).length;

  const grupo = (
    titulo: string,
    items: { slug: string; name: string }[],
    activo: string | undefined,
    clave: "categoria" | "coleccion" | "procedencia",
  ) =>
    items.length > 0 ? (
      <section className={estilos.grupo} aria-labelledby={`filtro-${clave}`}>
        <h3 id={`filtro-${clave}`} className={estilos.grupoTitulo}>
          {titulo}
        </h3>
        <ul className={estilos.opciones}>
          {items.map((item) => {
            const seleccionado = activo === item.slug;
            return (
              <li key={item.slug}>
                <Link
                  href={enlace({ [clave]: seleccionado ? undefined : item.slug })}
                  className={estilos.opcion}
                  data-activa={seleccionado}
                  aria-current={seleccionado ? "true" : undefined}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    ) : null;

  return (
    <PanelMovil activos={activos}>
      <div className={estilos.panel}>
        <h2 className={estilos.titulo}>Filtros Inteligentes</h2>
        {grupo("Categoría", opciones.categorias, filtros.categoria, "categoria")}
        {grupo("Colecciones", opciones.colecciones, filtros.coleccion, "coleccion")}
        {/* "Orígen" es la etiqueta del original, con su acento de más. */}
        {grupo("Orígen", opciones.procedencias, filtros.procedencia, "procedencia")}
        {hayFiltros(filtros) ? (
          <Link
            href={construirUrl(base, filtros, {
              categoria: undefined,
              coleccion: undefined,
              procedencia: undefined,
              pagina: 1,
            })}
            className={estilos.limpiar}
          >
            Limpiar filtros
          </Link>
        ) : null}
      </div>
    </PanelMovil>
  );
}
