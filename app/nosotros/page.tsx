import Link from "next/link";
import { notFound } from "next/navigation";
import estilos from "@/components/Paginas/Paginas.module.css";
import { metadataDe } from "@/lib/seo";
import { getPageBySlug } from "@/lib/data";

export async function generateMetadata() {
  const pagina = await getPageBySlug("nosotros");
  return metadataDe({
    title: pagina?.seo.title ?? "Acerca de Sedie & Mobili",
    description: pagina?.seo.description ?? "Más de 25 años fabricando mobiliario para oficina y sillería profesional en México.",
    canonical: "/nosotros/",
    ogImage: pagina?.seo.ogImage ?? null,
  });
}

export default async function NosotrosPage() {
  const pagina = await getPageBySlug("nosotros");
  if (!pagina) notFound();

  const [seccion] = pagina.sections ?? [];

  return (
    <main className="sm-pagina">
      <nav aria-label="Migas de pan" className="sm-migas">
        <ol className="sm-migas-lista">
          <li>
            <Link href="/">Inicio</Link>
          </li>
          <li aria-current="page">{pagina.title}</li>
        </ol>
      </nav>

      {seccion ? (
        <article className={estilos.seccion}>
          <h1 className="sm-titulo-pagina">{seccion.heading ?? pagina.title}</h1>
          {seccion.body ? <div className="sm-prosa" dangerouslySetInnerHTML={{ __html: seccion.body }} /> : null}
        </article>
      ) : null}
    </main>
  );
}
