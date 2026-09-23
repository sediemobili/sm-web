import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EsqueletoRejilla } from "@/components/filtros/EsqueletoRejilla";
import { Banda } from "@/components/listado/Banda";
import estilos from "@/components/listado/listado.module.css";
import { ListadoFiltrado } from "@/components/listado/ListadoFiltrado";
import { JsonLd } from "@/components/Seo/JsonLd";
import { getCollectionBySlug, getCollections, getProductsByCollection } from "@/lib/data";
import { migas as migasLd } from "@/lib/jsonld";
import { descripcionListado, metadataDe } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getCollections()).map((coleccion) => ({ slug: coleccion.slug }));
}

export async function generateMetadata({ params }: PageProps<"/coleccion/[slug]">) {
  const { slug } = await params;
  const coleccion = await getCollectionBySlug(slug);
  if (!coleccion) return {};
  const productos = await getProductsByCollection(coleccion.slug);
  return metadataDe({
    title: coleccion.seo.title ?? coleccion.name,
    description: coleccion.seo.description ?? descripcionListado(coleccion.name, productos.length),
    canonical: coleccion.path,
    ogImage: coleccion.seo.ogImage ?? productos[0]?.images[0]?.src ?? null,
  });
}

export default async function ColeccionPage({ params, searchParams }: PageProps<"/coleccion/[slug]">) {
  const { slug } = await params;
  const coleccion = await getCollectionBySlug(slug);
  if (!coleccion) notFound();

  return (
    <main>
      <JsonLd
        datos={migasLd([
          { name: "Inicio", path: "/" },
          { name: coleccion.name, path: coleccion.path },
        ])}
      />

      {/* Banda de encabezado: se genera en el build. */}
      <Banda prefijo="Colección" nombre={coleccion.name} />

      <section className={estilos.listado} aria-label={`Productos de ${coleccion.name}`}>
        {coleccion.description ? (
          <div className="sm-prosa" dangerouslySetInnerHTML={{ __html: coleccion.description }} />
        ) : null}

        <Suspense fallback={<EsqueletoRejilla />}>
          <ListadoFiltrado
            base={coleccion.path}
            nombre={coleccion.name}
            ambito={{ tipo: "coleccion", slug: coleccion.slug }}
            searchParams={searchParams}
          />
        </Suspense>
      </section>
    </main>
  );
}
