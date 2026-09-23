import { Suspense } from "react";
import { EsqueletoRejilla } from "@/components/filtros/EsqueletoRejilla";
import { JsonLd } from "@/components/Seo/JsonLd";
import { migas as migasLd } from "@/lib/jsonld";
import { metadataDe } from "@/lib/seo";
import estilos from "./catalogo.module.css";
import { Listado } from "./Listado";

const BASE = "/catalogo/";

// El canonical apunta siempre al catálogo limpio. El noindex de las URL con filtros
// lo resuelve el robots de la propia URL: ver docs/analytics.md y T23.
export const metadata = metadataDe({
  title: "Catálogo",
  description:
    "Todo el mobiliario de oficina de Sedie & Mobili: sillas, escritorios, recepciones, mesas y más, con filtro por categoría, colección y origen.",
  canonical: BASE,
});

export default function CatalogoPage({ searchParams }: PageProps<"/catalogo">) {
  return (
    <main className={estilos.pagina}>
      <JsonLd
        datos={migasLd([
          { name: "Inicio", path: "/" },
          { name: "Catálogo", path: BASE },
        ])}
      />

      <h1 className={estilos.titulo}>Catálogo</h1>

      <Suspense fallback={<EsqueletoRejilla />}>
        <Listado searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
