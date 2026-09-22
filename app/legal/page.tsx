import Link from "next/link";
import { notFound } from "next/navigation";
import estilos from "@/components/Paginas/Paginas.module.css";
import { getPageBySlug } from "@/lib/data";

export default async function LegalPage() {
  const pagina = await getPageBySlug("legal");
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

      <section className={estilos.bloqueLegal} aria-labelledby="privacidad">
        <h1 id="privacidad" className="sm-titulo-pagina">
          Aviso de Privacidad
        </h1>
        {seccion?.body ? <div className="sm-prosa" dangerouslySetInnerHTML={{ __html: seccion.body }} /> : null}
        <p className={estilos.pendiente}>Contenido pendiente de publicar.</p>
      </section>

      {/* El ancla #tc la usa el footer; en WordPress las pestañas están vacías. */}
      <section className={estilos.bloqueLegal} aria-labelledby="tc">
        <h2 id="tc" className="sm-seccion-titulo">
          Términos y Condiciones
        </h2>
        <p className={estilos.pendiente}>Contenido pendiente de publicar.</p>
      </section>
    </main>
  );
}
