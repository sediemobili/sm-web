import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VistaListado } from "@/components/Analytics/VistaListado";
import { JsonLd } from "@/components/Seo/JsonLd";
import { listaItems, migas as migasLd } from "@/lib/jsonld";
import { descripcionListado, metadataDe } from "@/lib/seo";
import { getCategories, getCategoryBySlug, getProductsByCategory } from "@/lib/data";
import estilos from "./categoria.module.css";

// Las rutas llevan toda la jerarquía: sillas-de-oficina/silla-directiva.
export async function generateStaticParams() {
  const categorias = await getCategories();
  return categorias.map((categoria) => ({
    slug: categoria.path.replace("/product-category/", "").replace(/\/$/, "").split("/"),
  }));
}

export async function generateMetadata({ params }: PageProps<"/product-category/[...slug]">) {
  const { slug } = await params;
  const categoria = await getCategoryBySlug(slug[slug.length - 1]);
  if (!categoria || categoria.path !== `/product-category/${slug.join("/")}/`) return {};
  const productos = await getProductsByCategory(categoria.slug);
  return metadataDe({
    title: categoria.seo.title ?? categoria.name,
    description: categoria.seo.description ?? descripcionListado(categoria.name, productos.length),
    canonical: categoria.path,
    ogImage: categoria.seo.ogImage ?? categoria.image,
  });
}

export default async function CategoriaPage({ params }: PageProps<"/product-category/[...slug]">) {
  const { slug } = await params;
  const categoria = await getCategoryBySlug(slug[slug.length - 1]);
  // El último segmento manda, pero la ruta completa tiene que coincidir con la jerarquía real.
  if (!categoria || categoria.path !== `/product-category/${slug.join("/")}/`) notFound();

  const productos = (await getProductsByCategory(categoria.slug)).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const migas = [{ name: "Inicio", path: "/" }, ...categoria.breadcrumbs.slice(0, -1)];

  return (
    <main className="sm-pagina">
      <VistaListado nombre={categoria.name} total={productos.length} />
      <JsonLd
        datos={[
          migasLd([...migas, { name: categoria.name, path: categoria.path }]),
          listaItems(categoria.name, productos),
        ]}
      />

      <nav aria-label="Migas de pan" className="sm-migas">
        <ol className="sm-migas-lista">
          {migas.map((miga) => (
            <li key={miga.path}>
              <Link href={miga.path}>{miga.name}</Link>
            </li>
          ))}
          <li aria-current="page">{categoria.name}</li>
        </ol>
      </nav>

      <header className={estilos.encabezado}>
        <h1 className="sm-titulo-pagina">{categoria.name}</h1>
        {categoria.description ? (
          <div className="sm-prosa" dangerouslySetInnerHTML={{ __html: categoria.description }} />
        ) : null}
      </header>

      {categoria.children.length > 0 ? (
        <nav className={estilos.subcategorias} aria-label={`Subcategorías de ${categoria.name}`}>
          <ul className="sm-chips">
            {categoria.children.map((hija) => (
              <li key={hija.slug}>
                <Link href={hija.path} className="sm-chip">
                  {hija.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {productos.length > 0 ? (
        <section aria-label={`Productos de ${categoria.name}`}>
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
          <p>Todavía no hay productos en esta categoría.</p>
          <Link href="/catalogo/" className="sm-boton">
            Ver todo el catálogo
          </Link>
        </div>
      )}
    </main>
  );
}
