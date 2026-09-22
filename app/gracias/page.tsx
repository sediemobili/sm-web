import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import estilos from "@/components/Paginas/Paginas.module.css";
import { getPageBySlug } from "@/lib/data";

export default async function GraciasPage() {
  const pagina = await getPageBySlug("gracias");
  if (!pagina) notFound();

  const [seccion] = pagina.sections ?? [];

  return (
    <main className="sm-pagina">
      {/* T22: aquí entra el evento de conversión, cuando el formulario redirija a esta página. */}
      <section className={estilos.gracias}>
        {seccion?.image ? (
          <Image
            src={seccion.image.src}
            alt={seccion.image.alt}
            width={1750}
            height={323}
            className={estilos.graciasLogo}
          />
        ) : null}

        <h1 className={`sm-titulo-pagina ${estilos.graciasTitulo}`}>
          {seccion?.heading ?? pagina.title}
        </h1>

        {seccion?.body ? (
          <div
            className={`sm-prosa ${estilos.graciasTexto}`}
            dangerouslySetInnerHTML={{ __html: seccion.body }}
          />
        ) : null}

        <div className={estilos.acciones}>
          <Link href="/" className="sm-boton">
            Volver al Inicio
          </Link>
          <Link href="/catalogo/" className="sm-boton sm-boton--secundario">
            Ver el catálogo
          </Link>
        </div>
      </section>
    </main>
  );
}
