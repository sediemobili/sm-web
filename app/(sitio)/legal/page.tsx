import { notFound } from "next/navigation";
import estilos from "@/components/Paginas/Paginas.module.css";
import { getPageBySlug } from "@/lib/data";
import { metadataDe } from "@/lib/seo";

// Las tres pestañas del original están vacías en WordPress: se conserva la estructura
// y se dice que falta el contenido. No se inventa texto legal.
const BLOQUES = [
  { id: "confidencialidad", titulo: "Confidencialidad" },
  { id: "privacidad", titulo: "Privacidad" },
  { id: "tc", titulo: "Términos y Condiciones" },
  { id: "cookies", titulo: "Cookies" },
];

export async function generateMetadata() {
  const pagina = await getPageBySlug("legal");
  return metadataDe({
    title: pagina?.seo.title ?? "Aviso de Privacidad y Términos y Condiciones",
    description: pagina?.seo.description ?? "Aviso de privacidad y términos y condiciones de Sedie & Mobili.",
    canonical: "/legal/",
    ogImage: pagina?.seo.ogImage ?? null,
  });
}

export default async function LegalPage() {
  const pagina = await getPageBySlug("legal");
  if (!pagina) notFound();

  return (
    <main className={estilos.legal}>
      <h1 className={estilos.titulo}>Legal</h1>

      {BLOQUES.map((bloque) => (
        <section key={bloque.id} className={estilos.legalBloque} aria-labelledby={bloque.id}>
          {/* El ancla #tc la enlaza el footer. */}
          <h2 id={bloque.id} className={estilos.legalTitulo}>
            {bloque.titulo}
          </h2>
          <p className={estilos.pendiente}>Contenido pendiente de publicar.</p>
        </section>
      ))}
    </main>
  );
}
