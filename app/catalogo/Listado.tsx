import Image from "next/image";
import Link from "next/link";
import { VistaListado } from "@/components/Analytics/VistaListado";
import { Filtros } from "@/components/filtros/Filtros";
import { Paginacion } from "@/components/filtros/Paginacion";
import { JsonLd } from "@/components/Seo/JsonLd";
import { getCategories, getCollections, getProcedencias, getProducts } from "@/lib/data";
import { aplicarFiltros, leerFiltros, opcionesDe, POR_PAGINA } from "@/lib/filtros";
import { listaItems } from "@/lib/jsonld";
import estilos from "./catalogo.module.css";

const BASE = "/catalogo/";

// Parte dinámica: depende de los filtros de la URL y va dentro del <Suspense>.
export async function Listado({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filtros = leerFiltros(await searchParams);
  const [{ items }, categorias, colecciones, procedencias] = await Promise.all([
    getProducts(),
    getCategories(),
    getCollections(),
    getProcedencias(),
  ]);

  const filtrados = aplicarFiltros(items, filtros, categorias).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(filtros.pagina, paginas);
  const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const opciones = opcionesDe(items, { categorias, colecciones, procedencias });

  const nombreCategoria = (slugs: string[]) => {
    const suyas = categorias.filter((categoria) => slugs.includes(categoria.slug));
    return (suyas.find((categoria) => categoria.parentSlug !== null) ?? suyas[0])?.name ?? null;
  };

  return (
    <div className={estilos.contenido}>
      <VistaListado nombre="Catálogo" total={filtrados.length} />
      <JsonLd datos={listaItems("Catálogo", visibles)} />

      <Filtros base={BASE} filtros={filtros} opciones={opciones} />

      <section className={estilos.resultado} aria-label="Productos">
        {visibles.length > 0 ? (
          <>
            <ul className={estilos.rejilla}>
              {visibles.map((producto) => {
                const categoria = nombreCategoria(producto.categories);
                return (
                  <li key={producto.slug}>
                    <Link href={producto.path} className="sm-tarjeta">
                      {producto.images[0] ? (
                        <Image
                          src={producto.images[0].src}
                          alt={producto.images[0].alt}
                          width={215}
                          height={215}
                          sizes="(max-width: 767px) 45vw, 215px"
                          className="sm-tarjeta-imagen"
                        />
                      ) : null}
                      {categoria ? <span className="sm-tarjeta-categoria">{categoria}</span> : null}
                      <span className="sm-tarjeta-nombre">{producto.name}</span>
                      <span className="sm-tarjeta-boton">Más información</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Paginacion base={BASE} filtros={filtros} paginas={paginas} />
          </>
        ) : (
          <div className="sm-vacio">
            <p>Ningún producto coincide con estos filtros.</p>
            <Link href={BASE} className="sm-boton">
              Limpiar filtros
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
