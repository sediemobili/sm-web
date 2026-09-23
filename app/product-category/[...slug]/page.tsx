import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EsqueletoRejilla } from "@/components/filtros/EsqueletoRejilla";
import { Banda } from "@/components/listado/Banda";
import { ListadoFiltrado } from "@/components/listado/ListadoFiltrado";
import { JsonLd } from "@/components/Seo/JsonLd";
import { getCategories, getCategoryBySlug, getProductsByCategory } from "@/lib/data";
import { migas as migasLd } from "@/lib/jsonld";
import { descripcionListado, metadataDe } from "@/lib/seo";
import estilos from "@/components/listado/listado.module.css";

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

export default async function CategoriaPage({ params, searchParams }: PageProps<"/product-category/[...slug]">) {
  const { slug } = await params;
  const categoria = await getCategoryBySlug(slug[slug.length - 1]);
  // El último segmento manda, pero la ruta completa debe coincidir con la jerarquía real.
  if (!categoria || categoria.path !== `/product-category/${slug.join("/")}/`) notFound();

  return (
    <main>
      <JsonLd datos={migasLd([{ name: "Inicio", path: "/" }, ...categoria.breadcrumbs])} />

      {/* Banda de encabezado: se genera en el build. */}
      <Banda prefijo="Categoría" nombre={categoria.name} />

      <section className={estilos.listado} aria-label={`Productos de ${categoria.name}`}>
        {categoria.description ? (
          <div className="sm-prosa" dangerouslySetInnerHTML={{ __html: categoria.description }} />
        ) : null}

        {/* Lo único dinámico: el panel con su estado y la rejilla filtrada. */}
        <Suspense fallback={<EsqueletoRejilla />}>
          <ListadoFiltrado
            base={categoria.path}
            nombre={categoria.name}
            ambito={{ tipo: "categoria", slug: categoria.slug }}
            searchParams={searchParams}
          />
        </Suspense>
      </section>
    </main>
  );
}
