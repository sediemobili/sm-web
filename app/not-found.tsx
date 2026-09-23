import Link from "next/link";
import estilos from "@/components/estado/estado.module.css";
import { getCategories } from "@/lib/data";

// Es la página que ve quien llega a una URL que no existe, y también la que muestran
// notFound() en producto, categoría, colección, procedencia y post.
export default async function NoEncontrado() {
  const categorias = (await getCategories()).filter((categoria) => categoria.parentSlug === null);

  return (
    <main className={estilos.pagina}>
      {/* not-found.tsx no admite export const metadata: el robots va en la propia página. */}
      <meta name="robots" content="noindex, follow" />

      <h1 className={estilos.titulo}>No encontramos esta página</h1>
      <p className={estilos.texto}>
        La dirección que abriste no existe o cambió de sitio. Busca lo que necesitas o entra al
        catálogo: seguimos teniendo todo el mobiliario.
      </p>

      <form className={estilos.buscador} role="search" action="/buscar/" method="get">
        <label htmlFor="buscar-404" className="sm-oculto">
          Buscar en el sitio
        </label>
        <input id="buscar-404" type="search" name="q" placeholder="Buscar" className={estilos.campo} />
        <button type="submit" className="sm-boton sm-boton--secundario">
          Buscar
        </button>
      </form>

      <div className={estilos.acciones}>
        <Link href="/" className="sm-boton">
          Volver al inicio
        </Link>
        <Link href="/catalogo/" className="sm-boton sm-boton--secundario">
          Ver el catálogo
        </Link>
      </div>

      <section className={estilos.categorias} aria-labelledby="categorias-404">
        <h2 id="categorias-404" className={estilos.categoriasTitulo}>
          O empieza por una categoría
        </h2>
        <ul className="sm-chips">
          {categorias.map((categoria) => (
            <li key={categoria.slug}>
              <Link href={categoria.path} className="sm-chip">
                {categoria.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
