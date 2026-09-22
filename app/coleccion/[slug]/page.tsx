import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getCollections, getProductsByCollection } from "@/lib/data";
import estilos from "./coleccion.module.css";

export async function generateStaticParams() {
  return (await getCollections()).map((coleccion) => ({ slug: coleccion.slug }));
}

export default async function ColeccionPage({ params }: PageProps<"/coleccion/[slug]">) {
  const { slug } = await params;
  const coleccion = await getCollectionBySlug(slug);
  if (!coleccion) notFound();

  const productos = (await getProductsByCollection(coleccion.slug)).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
  // getCollections ya devuelve el orden curado del mega-menú.
  const otras = (await getCollections()).filter((otra) => otra.slug !== coleccion.slug);

  return (
    <main className="sm-pagina">
      <nav aria-label="Migas de pan" className="sm-migas">
        <ol className="sm-migas-lista">
          <li>
            <Link href="/">Inicio</Link>
          </li>
          {/* No existe una página /coleccion/ en el sitio actual: la miga va sin enlace. */}
          <li>Colecciones</li>
          <li aria-current="page">{coleccion.name}</li>
        </ol>
      </nav>

      <header className={estilos.encabezado}>
        <h1 className="sm-titulo-pagina">{coleccion.name}</h1>
        {coleccion.description ? (
          <div className="sm-prosa" dangerouslySetInnerHTML={{ __html: coleccion.description }} />
        ) : null}
      </header>

      {productos.length > 0 ? (
        <section aria-label={`Productos de ${coleccion.name}`}>
          <p className="sm-conteo">
            {productos.length} {productos.length === 1 ? "producto" : "productos"}
          </p>
          <ul className="sm-rejilla">
            {productos.map((producto) => (
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
        </section>
      ) : (
        <div className="sm-vacio">
          <p>Todavía no hay productos en esta colección.</p>
          <Link href="/catalogo/" className="sm-boton">
            Ver todo el catálogo
          </Link>
        </div>
      )}

      {otras.length > 0 ? (
        <nav className={estilos.otras} aria-label="Otras colecciones">
          <h2 className="sm-seccion-titulo">Otras colecciones</h2>
          <ul className="sm-chips">
            {otras.map((otra) => (
              <li key={otra.slug}>
                <Link href={otra.path} className="sm-chip">
                  {otra.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </main>
  );
}
