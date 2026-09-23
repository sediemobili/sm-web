import Image from "next/image";
import { notFound } from "next/navigation";
import estilos from "@/components/paginas/paginas.module.css";
import { getPageBySlug } from "@/lib/data";
import { metadataDe } from "@/lib/seo";

// Imagen de fondo de la columna izquierda en el original.
const IMAGEN = "/media/fondos/modern-office-with-no-people-luxury-chair-generated-by-ai-scaled.webp";

export async function generateMetadata() {
  const pagina = await getPageBySlug("nosotros");
  return metadataDe({
    title: pagina?.seo.title ?? "Acerca de Sedie & Mobili",
    description:
      pagina?.seo.description ??
      "Más de 25 años fabricando mobiliario para oficina y sillería profesional en México.",
    canonical: "/nosotros/",
    ogImage: pagina?.seo.ogImage ?? null,
  });
}

export default async function NosotrosPage() {
  const pagina = await getPageBySlug("nosotros");
  if (!pagina) notFound();
  const [seccion] = pagina.sections ?? [];

  return (
    <main>
      <section className={estilos.nosotros}>
        <div className={estilos.nosotrosImagen}>
          <Image src={IMAGEN} alt="" fill sizes="50vw" />
        </div>

        <div className={estilos.nosotrosTexto}>
          <h1 className={estilos.titulo}>{seccion?.heading ?? pagina.title}</h1>
          {seccion?.body ? (
            <div className={estilos.prosa} dangerouslySetInnerHTML={{ __html: seccion.body }} />
          ) : null}
        </div>
      </section>
    </main>
  );
}
