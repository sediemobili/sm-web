import { Suspense } from "react";
import { EsqueletoRejilla } from "@/components/filtros/EsqueletoRejilla";
import { metadataDe } from "@/lib/seo";
import estilos from "./buscar.module.css";
import { Resultados } from "./Resultados";

// Los resultados de búsqueda no se indexan, pero sí se siguen sus enlaces.
export const metadata = metadataDe({
  title: "Buscar",
  description: "Busca productos, categorías y artículos en el catálogo de Sedie & Mobili.",
  canonical: "/buscar/",
  noindex: true,
});

export default function BuscarPage({ searchParams }: PageProps<"/buscar">) {
  return (
    <main className={estilos.pagina}>
      <h1 className={estilos.titulo}>Buscar</h1>

      <Suspense fallback={<EsqueletoRejilla />}>
        <Resultados searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
