import Link from "next/link";
import { Busqueda } from "@/components/Analytics/Busqueda";
import { ListadoFiltrado } from "@/components/listado/ListadoFiltrado";
import { getCategories, getCollections, getPosts, getProducts } from "@/lib/data";
import { buscarCategorias, buscarPosts, buscarProductos, terminos } from "@/lib/buscar";
import estilos from "./buscar.module.css";

const BASE = "/buscar/";

// Resultados: dependen de ?q=, así que van dentro del <Suspense> de la página.
export async function Resultados({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametros = await searchParams;
  const crudo = parametros.q;
  const consulta = (Array.isArray(crudo) ? crudo[0] : crudo)?.trim() ?? "";
  const palabras = terminos(consulta);

  const [{ items }, categorias, colecciones, posts] = await Promise.all([
    getProducts(),
    getCategories(),
    getCollections(),
    getPosts(),
  ]);

  const productos = buscarProductos(items, palabras, categorias, colecciones);
  const categoriasHalladas = buscarCategorias(categorias, palabras);
  const postsHallados = buscarPosts(posts, palabras);
  const total = productos.length + categoriasHalladas.length + postsHallados.length;

  return (
    <>
      <Busqueda termino={consulta} resultados={total} />

      <p className={estilos.resumen}>
        {consulta
          ? `${total} ${total === 1 ? "resultado" : "resultados"} para “${consulta}”`
          : "Escribe qué estás buscando."}
      </p>

      {categoriasHalladas.length > 0 || postsHallados.length > 0 ? (
        <section className={estilos.otros} aria-labelledby="otros-resultados">
          <h2 id="otros-resultados" className={estilos.otrosTitulo}>
            También en el sitio
          </h2>
          <ul className="sm-chips">
            {categoriasHalladas.map((categoria) => (
              <li key={categoria.slug}>
                <Link href={categoria.path} className="sm-chip">
                  {categoria.name}
                </Link>
              </li>
            ))}
            {postsHallados.map((post) => (
              <li key={post.slug}>
                <Link href={post.path} className="sm-chip">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ListadoFiltrado
        base={BASE}
        nombre={consulta ? `Búsqueda: ${consulta}` : "Búsqueda"}
        ambito={{ tipo: "busqueda", q: consulta }}
        searchParams={searchParams}
        vacio={
          <div className="sm-vacio">
            <p>
              {consulta
                ? `No encontramos productos para “${consulta}”.`
                : "Escribe qué estás buscando para ver resultados."}
            </p>
            <Link href="/catalogo/" className="sm-boton">
              Ver todo el catálogo
            </Link>
          </div>
        }
      />
    </>
  );
}
