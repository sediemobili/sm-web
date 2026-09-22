import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Conversion } from "@/components/Analytics/Conversion";
import estilos from "@/components/Paginas/Paginas.module.css";
import { getPageBySlug } from "@/lib/data";
import { metadataDe } from "@/lib/seo";

// Página de paso tras enviar un formulario: no aporta nada en búsquedas.
export const metadata = metadataDe({
  title: "Solicitud enviada",
  description: "Recibimos tu solicitud; un asesor de Sedie & Mobili te contactará.",
  canonical: "/gracias/",
  noindex: true,
});

export default async function GraciasPage() {
  const pagina = await getPageBySlug("gracias");
  if (!pagina) notFound();

  const [seccion] = pagina.sections ?? [];

  return (
    <main className="sm-pagina">
      <Conversion pagina="gracias" />
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
