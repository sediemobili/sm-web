import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Descargables } from "@/components/Producto/Descargables";
import { FichaProducto } from "@/components/Producto/FichaProducto";
import estilos from "@/components/Producto/Producto.module.css";
import {
  getCategories,
  getCategoryBySlug,
  getCollections,
  getProductBySlug,
  getProducts,
  getProductsByCategory,
  type Category,
} from "@/lib/data";

const RELACIONADOS = 6;

export async function generateStaticParams() {
  return (await getProducts()).map((producto) => ({ slug: producto.slug }));
}

// La categoría principal es la más profunda de las que trae el producto:
// WooCommerce etiqueta con la hija y la madre, y las migas deben partir de la hija.
function categoriaPrincipal(slugs: string[], categorias: Category[]) {
  const suyas = categorias.filter((categoria) => slugs.includes(categoria.slug));
  return suyas.find((categoria) => categoria.parentSlug !== null) ?? suyas[0] ?? null;
}

export default async function ProductoPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const producto = await getProductBySlug(slug);
  if (!producto) notFound();

  const [categorias, colecciones] = await Promise.all([getCategories(), getCollections()]);
  const principal = categoriaPrincipal(producto.categories, categorias);
  const detalle = principal ? await getCategoryBySlug(principal.slug) : null;
  const relacionados = principal
    ? (await getProductsByCategory(principal.slug)).filter((otro) => otro.slug !== producto.slug).slice(0, RELACIONADOS)
    : [];
  const suyasColecciones = colecciones.filter((coleccion) => producto.collections.includes(coleccion.slug));
  const migas = [{ name: "Inicio", path: "/" }, ...(detalle?.breadcrumbs ?? [])];

  return (
    <main className="sm-pagina">
      <nav aria-label="Migas de pan" className="sm-migas">
        <ol className="sm-migas-lista">
          {migas.map((miga) => (
            <li key={miga.path}>
              <Link href={miga.path}>{miga.name}</Link>
            </li>
          ))}
          <li aria-current="page">{producto.name}</li>
        </ol>
      </nav>

      <div className={estilos.ficha}>
        <FichaProducto producto={producto}>
          <h1 className="sm-titulo-pagina">{producto.name}</h1>

          <p className={estilos.taxonomias}>
            {detalle ? (
              <Link href={detalle.path} className={estilos.taxonomia}>
                {detalle.name}
              </Link>
            ) : null}
            {suyasColecciones.map((coleccion) => (
              <Link key={coleccion.slug} href={coleccion.path} className={estilos.taxonomia}>
                {coleccion.name}
              </Link>
            ))}
          </p>

          {producto.stockStatus === "outofstock" ? (
            <p className={estilos.agotado}>Agotado</p>
          ) : null}

          {producto.shortDescription ? (
            <div
              className={estilos.descripcionCorta}
              dangerouslySetInnerHTML={{ __html: producto.shortDescription }}
            />
          ) : null}

          {producto.description ? (
            <div className={estilos.descripcion} dangerouslySetInnerHTML={{ __html: producto.description }} />
          ) : null}
        </FichaProducto>
      </div>

      {producto.downloads?.length ? <Descargables descargables={producto.downloads} /> : null}

      {relacionados.length > 0 ? (
        <section className={estilos.relacionados} aria-labelledby="relacionados">
          <h2 id="relacionados" className="sm-seccion-titulo">
            También te puede interesar
          </h2>
          <ul className="sm-rejilla">
            {relacionados.map((otro) => (
              <li key={otro.slug}>
                <Link href={otro.path} className="sm-tarjeta">
                  {otro.images[0] ? (
                    <Image
                      src={otro.images[0].src}
                      alt={otro.images[0].alt}
                      width={400}
                      height={400}
                      className="sm-tarjeta-imagen"
                    />
                  ) : null}
                  <span className="sm-tarjeta-nombre">{otro.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
