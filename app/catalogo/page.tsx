import Image from "next/image";
import Link from "next/link";
import { VistaListado } from "@/components/Analytics/VistaListado";
import { JsonLd } from "@/components/Seo/JsonLd";
import { listaItems, migas as migasLd } from "@/lib/jsonld";
import { metadataDe } from "@/lib/seo";
import { getCategories, getCollections, getProcedencias, getProducts, type Category } from "@/lib/data";
import estilos from "./catalogo.module.css";
import { PanelFiltros } from "./PanelFiltros";

const POR_PAGINA = 24;

type Filtros = {
  categoria?: string;
  coleccion?: string;
  procedencia?: string;
  orden: "az" | "za";
  pagina: number;
};

const primero = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor) || undefined;

// Los filtros viven en la URL: cada combinación es enlazable y compartible.
function construirUrl(filtros: Filtros, cambios: Partial<Filtros>) {
  const siguiente = { ...filtros, ...cambios };
  const query = new URLSearchParams();
  if (siguiente.categoria) query.set("categoria", siguiente.categoria);
  if (siguiente.coleccion) query.set("coleccion", siguiente.coleccion);
  if (siguiente.procedencia) query.set("procedencia", siguiente.procedencia);
  if (siguiente.orden !== "az") query.set("orden", siguiente.orden);
  if (siguiente.pagina > 1) query.set("pagina", String(siguiente.pagina));
  const texto = query.toString();
  return texto ? `/catalogo/?${texto}` : "/catalogo/";
}

export async function generateMetadata({ searchParams }: PageProps<"/catalogo">) {
  const parametros = await searchParams;
  const filtrado = Boolean(
    primero(parametros.categoria) || primero(parametros.coleccion) || primero(parametros.procedencia),
  );
  const pagina = Number(primero(parametros.pagina));
  // Una URL con filtros o paginada no se indexa, pero sí se siguen sus enlaces,
  // y su canonical apunta al catálogo limpio.
  return metadataDe({
    title: "Catálogo",
    description:
      "Todo el mobiliario de oficina de Sedie & Mobili: sillas, escritorios, recepciones, mesas y más, con filtro por categoría y colección.",
    canonical: "/catalogo/",
    noindex: filtrado || pagina > 1,
  });
}

export default async function CatalogoPage({ searchParams }: PageProps<"/catalogo">) {
  const parametros = await searchParams;
  const orden = primero(parametros.orden) === "za" ? "za" : "az";
  const paginaPedida = Number(primero(parametros.pagina));
  const filtros: Filtros = {
    categoria: primero(parametros.categoria),
    coleccion: primero(parametros.coleccion),
    procedencia: primero(parametros.procedencia),
    orden,
    pagina: Number.isFinite(paginaPedida) && paginaPedida > 1 ? Math.floor(paginaPedida) : 1,
  };

  const [categorias, colecciones, procedencias] = await Promise.all([
    getCategories(),
    getCollections(),
    getProcedencias(),
  ]);

  // Se pide todo lo que pasa el filtro: el orden se aplica antes de cortar la página.
  const { items, total } = await getProducts({
    category: filtros.categoria,
    collection: filtros.coleccion,
    procedencia: filtros.procedencia,
  });
  const ordenados = [...items].sort((a, b) =>
    filtros.orden === "az" ? a.name.localeCompare(b.name, "es") : b.name.localeCompare(a.name, "es"),
  );
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(filtros.pagina, paginas);
  const visibles = ordenados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const principales = categorias.filter((categoria) => categoria.parentSlug === null);
  const hijasDe = (madre: Category) => categorias.filter((categoria) => categoria.parentSlug === madre.slug);
  const activos = [filtros.categoria, filtros.coleccion, filtros.procedencia].filter(Boolean).length;

  // Cambiar un filtro siempre devuelve a la página 1: la paginación es del resultado, no de la URL previa.
  const enlaceFiltro = (cambios: Partial<Filtros>) => construirUrl(filtros, { ...cambios, pagina: 1 });

  const opcionFiltro = (nombre: string, activo: boolean, href: string, anidada = false) => (
    <li key={`${nombre}-${href}`} className={anidada ? estilos.opcionAnidada : undefined}>
      <Link href={href} className={estilos.opcion} data-activa={activo} aria-current={activo ? "true" : undefined}>
        {nombre}
      </Link>
    </li>
  );

  return (
    <main className="sm-pagina">
      <VistaListado nombre="Catálogo" total={total} />
      <JsonLd
        datos={[
          migasLd([
            { name: "Inicio", path: "/" },
            { name: "Catálogo", path: "/catalogo/" },
          ]),
          listaItems("Catálogo", visibles),
        ]}
      />

      <nav aria-label="Migas de pan" className="sm-migas">
        <ol className="sm-migas-lista">
          <li>
            <Link href="/">Inicio</Link>
          </li>
          <li aria-current="page">Catálogo</li>
        </ol>
      </nav>

      <header className={estilos.encabezado}>
        <h1 className="sm-titulo-pagina">Catálogo</h1>
      </header>

      <div className={estilos.disposicion}>
        <aside className={estilos.filtros} aria-label="Filtros">
          <PanelFiltros activos={activos}>
            {activos > 0 ? (
              <Link href={construirUrl(filtros, { categoria: undefined, coleccion: undefined, procedencia: undefined, pagina: 1 })} className={estilos.limpiar}>
                Limpiar filtros
              </Link>
            ) : null}

            <section className={estilos.grupo} aria-labelledby="filtro-categorias">
              <h2 id="filtro-categorias" className={estilos.grupoTitulo}>
                Categorías
              </h2>
              <ul className={estilos.opciones}>
                {opcionFiltro("Todas", !filtros.categoria, enlaceFiltro({ categoria: undefined }))}
                {principales.map((categoria) => (
                  <li key={categoria.slug}>
                    <ul className={estilos.opciones}>
                      {opcionFiltro(
                        categoria.name,
                        filtros.categoria === categoria.slug,
                        enlaceFiltro({ categoria: categoria.slug }),
                      )}
                      {hijasDe(categoria).map((hija) =>
                        opcionFiltro(hija.name, filtros.categoria === hija.slug, enlaceFiltro({ categoria: hija.slug }), true),
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>

            <section className={estilos.grupo} aria-labelledby="filtro-colecciones">
              <h2 id="filtro-colecciones" className={estilos.grupoTitulo}>
                Colecciones
              </h2>
              <ul className={estilos.opciones}>
                {opcionFiltro("Todas", !filtros.coleccion, enlaceFiltro({ coleccion: undefined }))}
                {colecciones.map((coleccion) =>
                  opcionFiltro(
                    coleccion.name,
                    filtros.coleccion === coleccion.slug,
                    enlaceFiltro({ coleccion: coleccion.slug }),
                  ),
                )}
              </ul>
            </section>

            <section className={estilos.grupo} aria-labelledby="filtro-procedencia">
              <h2 id="filtro-procedencia" className={estilos.grupoTitulo}>
                Procedencia
              </h2>
              <ul className={estilos.opciones}>
                {opcionFiltro("Todas", !filtros.procedencia, enlaceFiltro({ procedencia: undefined }))}
                {procedencias.map((procedencia) =>
                  opcionFiltro(
                    procedencia.name,
                    filtros.procedencia === procedencia.slug,
                    enlaceFiltro({ procedencia: procedencia.slug }),
                  ),
                )}
              </ul>
            </section>
          </PanelFiltros>
        </aside>

        <section className={estilos.resultado} aria-label="Resultados">
          <div className={estilos.barra}>
            <p className="sm-conteo">
              {total} {total === 1 ? "producto" : "productos"}
              {paginas > 1 ? ` · página ${pagina} de ${paginas}` : ""}
            </p>
            <nav className={estilos.orden} aria-label="Orden">
              <Link
                href={construirUrl(filtros, { orden: "az", pagina: 1 })}
                className={estilos.opcion}
                data-activa={filtros.orden === "az"}
                aria-current={filtros.orden === "az" ? "true" : undefined}
              >
                A-Z
              </Link>
              <Link
                href={construirUrl(filtros, { orden: "za", pagina: 1 })}
                className={estilos.opcion}
                data-activa={filtros.orden === "za"}
                aria-current={filtros.orden === "za" ? "true" : undefined}
              >
                Z-A
              </Link>
            </nav>
          </div>

          {visibles.length > 0 ? (
            <>
              <ul className="sm-rejilla">
                {visibles.map((producto) => (
                  <li key={producto.slug}>
                    <Link href={producto.path} className="sm-tarjeta">
                      {producto.images[0] ? (
                        <Image
                          src={producto.images[0].src}
                          alt={producto.images[0].alt}
                          width={400}
                          height={400}
                          className="sm-tarjeta-imagen"
                        />
                      ) : null}
                      <span className="sm-tarjeta-nombre">{producto.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {paginas > 1 ? (
                <nav className={estilos.paginacion} aria-label="Paginación">
                  {pagina > 1 ? (
                    <Link href={construirUrl(filtros, { pagina: pagina - 1 })} rel="prev" className={estilos.opcion}>
                      Anterior
                    </Link>
                  ) : null}
                  <ol className={estilos.paginas}>
                    {Array.from({ length: paginas }, (_, indice) => indice + 1).map((numero) => (
                      <li key={numero}>
                        <Link
                          href={construirUrl(filtros, { pagina: numero })}
                          className={estilos.opcion}
                          data-activa={numero === pagina}
                          aria-current={numero === pagina ? "page" : undefined}
                        >
                          {numero}
                        </Link>
                      </li>
                    ))}
                  </ol>
                  {pagina < paginas ? (
                    <Link href={construirUrl(filtros, { pagina: pagina + 1 })} rel="next" className={estilos.opcion}>
                      Siguiente
                    </Link>
                  ) : null}
                </nav>
              ) : null}
            </>
          ) : (
            <div className="sm-vacio">
              <p>Ningún producto coincide con estos filtros.</p>
              <Link
                href={construirUrl(filtros, { categoria: undefined, coleccion: undefined, procedencia: undefined, pagina: 1 })}
                className="sm-boton"
              >
                Limpiar filtros
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
