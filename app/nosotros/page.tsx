import Link from "next/link";
import { notFound } from "next/navigation";
import estilos from "@/components/Paginas/Paginas.module.css";
import { getPageBySlug } from "@/lib/data";

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
