import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EsqueletoRejilla } from "@/components/filtros/EsqueletoRejilla";
import { Banda } from "@/components/listado/Banda";
import estilos from "@/components/listado/listado.module.css";
import { ListadoFiltrado } from "@/components/listado/ListadoFiltrado";
import { JsonLd } from "@/components/Seo/JsonLd";
import { getProcedenciaBySlug, getProcedencias, getProducts } from "@/lib/data";
import { migas as migasLd } from "@/lib/jsonld";
import { descripcionListado, metadataDe } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getProcedencias()).map((procedencia) => ({ slug: procedencia.slug }));
}

export async function generateMetadata({ params }: PageProps<"/procedencia/[slug]">) {
  const { slug } = await params;
  const procedencia = await getProcedenciaBySlug(slug);
  if (!procedencia) return {};
  const { total } = await getProducts({ procedencia: procedencia.slug });
  return metadataDe({
    title: procedencia.seo.title ?? `Mobiliario de procedencia ${procedencia.name}`,
    description: procedencia.seo.description ?? descripcionListado(procedencia.name, total),
    canonical: procedencia.path,
    ogImage: procedencia.seo.ogImage,
  });
}

export default async function ProcedenciaPage({ params, searchParams }: PageProps<"/procedencia/[slug]">) {
  const { slug } = await params;
  const procedencia = await getProcedenciaBySlug(slug);
  if (!procedencia) notFound();

  return (
    <main>
      <JsonLd
        datos={migasLd([
          { name: "Inicio", path: "/" },
          { name: procedencia.name, path: procedencia.path },
        ])}
      />

      {/* "Orígen" es la etiqueta del original, con su acento de más. */}
      <Banda prefijo="Orígen" nombre={procedencia.name} />

      <section className={estilos.listado} aria-label={`Productos de procedencia ${procedencia.name}`}>
        <Suspense fallback={<EsqueletoRejilla />}>
          <ListadoFiltrado
            base={procedencia.path}
            nombre={procedencia.name}
            ambito={{ tipo: "procedencia", slug: procedencia.slug }}
            searchParams={searchParams}
          />
        </Suspense>
      </section>
    </main>
  );
}
