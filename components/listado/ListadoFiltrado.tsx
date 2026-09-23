import Image from "next/image";
import Link from "next/link";
import { VistaListado } from "@/components/Analytics/VistaListado";
import { Filtros } from "@/components/filtros/Filtros";
import { Paginacion } from "@/components/filtros/Paginacion";
import { JsonLd } from "@/components/Seo/JsonLd";
import {
  getCategories,
  getCollections,
  getProcedencias,
  getProducts,
  getProductsByCategory,
  getProductsByCollection,
} from "@/lib/data";
import { buscarProductos, terminos } from "@/lib/buscar";
import { aplicarFiltros, leerFiltros, opcionesDe, POR_PAGINA } from "@/lib/filtros";
import { listaItems } from "@/lib/jsonld";
import estilos from "./listado.module.css";

export type Ambito =
  | { tipo: "catalogo" }
  | { tipo: "busqueda"; q: string }
  | { tipo: "categoria"; slug: string }
  | { tipo: "coleccion"; slug: string }
  | { tipo: "procedencia"; slug: string };

async function productosDe(ambito: Ambito) {
  if (ambito.tipo === "busqueda") {
    const [{ items }, categorias, colecciones] = await Promise.all([
      getProducts(),
      getCategories(),
      getCollections(),
    ]);
    return buscarProductos(items, terminos(ambito.q), categorias, colecciones);
  }
  if (ambito.tipo === "categoria") return getProductsByCategory(ambito.slug);
  if (ambito.tipo === "coleccion") return getProductsByCollection(ambito.slug);
  if (ambito.tipo === "procedencia") return (await getProducts({ procedencia: ambito.slug })).items;
  return (await getProducts()).items;
}

// Parte dinámica de los listados: depende de los filtros de la URL, así que va dentro
// del <Suspense> de cada página y se resuelve por petición.
export async function ListadoFiltrado({
  base,
  nombre,
  ambito,
  searchParams,
  vacio,
}: {
  base: string;
  nombre: string;
  ambito: Ambito;
  // Mensaje del estado vacío cuando el listado no es un filtro, sino una búsqueda.
  vacio?: React.ReactNode;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filtros = leerFiltros(await searchParams);
  const [delAmbito, categorias, colecciones, procedencias] = await Promise.all([
    productosDe(ambito),
    getCategories(),
    getCollections(),
    getProcedencias(),
  ]);

  const productos = aplicarFiltros(delAmbito, filtros, categorias).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
  const opciones = opcionesDe(
    delAmbito,
    { categorias, colecciones, procedencias },
    ambito.tipo === "categoria" ? ambito.slug : undefined,
  );
  const paginas = Math.max(1, Math.ceil(productos.length / POR_PAGINA));
  const pagina = Math.min(filtros.pagina, paginas);
  const visibles = productos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const nombreCategoria = (slugs: string[]) => {
    const suyas = categorias.filter((categoria) => slugs.includes(categoria.slug));
    return (suyas.find((categoria) => categoria.parentSlug !== null) ?? suyas[0])?.name ?? null;
  };

  return (
    <div className={estilos.contenido}>
      <VistaListado nombre={nombre} total={productos.length} />
      <JsonLd datos={listaItems(nombre, visibles)} />

      <Filtros base={base} filtros={filtros} opciones={opciones} />

      <div className={estilos.resultado}>
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

            <Paginacion base={base} filtros={filtros} paginas={paginas} />
          </>
        ) : (
          (vacio ?? (
            <div className="sm-vacio">
              <p>Ningún producto coincide con estos filtros.</p>
              <Link href={base} className="sm-boton">
                Limpiar filtros
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
