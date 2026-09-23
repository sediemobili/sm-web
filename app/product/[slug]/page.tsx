import Link from "next/link";
import { notFound } from "next/navigation";
import { VistaProducto } from "@/components/Analytics/VistaProducto";
import { Descargables } from "@/components/producto/Descargables";
import { Galeria } from "@/components/producto/Galeria";
import { PanelCompra } from "@/components/producto/PanelCompra";
import estilos from "@/components/producto/producto.module.css";
import { JsonLd } from "@/components/Seo/JsonLd";
import Image from "next/image";
import {
  getCategories,
  getCategoryBySlug,
  getProductBySlug,
  getProducts,
  getProductsByCategory,
  type Category,
} from "@/lib/data";
import { migas as migasLd, producto as productoLd } from "@/lib/jsonld";
import { descripcionProducto, metadataDe } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getProducts()).items.map((producto) => ({ slug: producto.slug }));
}

// La categoría principal es la más profunda: WooCommerce etiqueta con la hija y la madre.
function categoriaPrincipal(slugs: string[], categorias: Category[]) {
  const suyas = categorias.filter((categoria) => slugs.includes(categoria.slug));
  return suyas.find((categoria) => categoria.parentSlug !== null) ?? suyas[0] ?? null;
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const producto = await getProductBySlug(slug);
  if (!producto) return {};
  const categoria = categoriaPrincipal(producto.categories, await getCategories());
  return metadataDe({
    title: producto.seo.title ?? producto.name,
    description: producto.seo.description ?? descripcionProducto(producto.name, categoria?.name ?? null),
    canonical: producto.path,
    ogImage: producto.seo.ogImage ?? producto.images[0]?.src ?? null,
  });
}

export default async function ProductoPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const producto = await getProductBySlug(slug);
  if (!producto) notFound();

  const categorias = await getCategories();
  const principal = categoriaPrincipal(producto.categories, categorias);
  const detalle = principal ? await getCategoryBySlug(principal.slug) : null;
  const migas = [{ name: "Inicio", path: "/" }, ...(detalle?.breadcrumbs ?? [])];
  const relacionados = principal
    ? (await getProductsByCategory(principal.slug)).filter((otro) => otro.slug !== producto.slug).slice(0, 6)
    : [];

  return (
    <main className={estilos.ficha}>
      <VistaProducto slug={producto.slug} nombre={producto.name} categoria={detalle?.name ?? null} />
      <JsonLd
        datos={[
          productoLd(producto, detalle?.name ?? null),
          migasLd([...migas, { name: producto.name, path: producto.path }]),
        ]}
      />

      <Galeria imagenes={producto.images} nombre={producto.name} />

      <div className={estilos.informacion}>
        <h1 className={estilos.titulo}>{producto.name}</h1>

        <nav aria-label="Migas de pan" className={estilos.migas}>
          <ol className={estilos.migasLista}>
            {migas.map((miga) => (
              <li key={miga.path}>
                <Link href={miga.path}>{miga.name}</Link>
              </li>
            ))}
            <li aria-current="page">{producto.name}</li>
          </ol>
        </nav>

        <h2 className={estilos.especificaciones}>Especificaciones</h2>

        {producto.downloads?.length ? <Descargables descargables={producto.downloads} /> : null}

        {producto.shortDescription ? (
          <div className={estilos.descripcion} dangerouslySetInnerHTML={{ __html: producto.shortDescription }} />
        ) : null}

        {producto.description ? (
          <div className={estilos.descripcion} dangerouslySetInnerHTML={{ __html: producto.description }} />
        ) : null}

        <PanelCompra producto={producto} categoria={detalle?.name ?? null} />
      </div>

      {/* Añadido nuestro: la ficha del sitio actual no tiene productos relacionados. */}
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
