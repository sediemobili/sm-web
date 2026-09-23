import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Conversion } from "@/components/Analytics/Conversion";
import estilos from "@/components/paginas/paginas.module.css";
import { getPageBySlug, getPosts } from "@/lib/data";
import { metadataDe } from "@/lib/seo";

const NOTICIAS = 3;

// Página de paso tras enviar un formulario: no aporta nada en búsquedas.
export const metadata = metadataDe({
  title: "Solicitud enviada",
  description: "Recibimos tu solicitud; un asesor de Sedie & Mobili te contactará.",
  canonical: "/gracias/",
  noindex: true,
});

export default async function GraciasPage() {
  const [pagina, posts] = await Promise.all([getPageBySlug("gracias"), getPosts()]);
  if (!pagina) notFound();
  const [seccion] = pagina.sections ?? [];

  return (
    <main>
      <Conversion pagina="gracias" />

      <section className={estilos.gracias}>
        <Image
          src="/media/marca/sediemobili_white.svg"
          alt="Sedie &amp; Mobili"
          width={1750}
          height={323}
          className={estilos.graciasLogo}
        />

        <h1 className={estilos.graciasTitulo}>{seccion?.heading ?? pagina.title}</h1>
        <p className={estilos.graciasTexto}>
          En breve, un miembro de nuestro equipo se pondrá en contacto contigo.
        </p>

        <Link href="/" className={estilos.boton}>
          Volver al Inicio
        </Link>

        <h2 className={estilos.graciasSubtitulo}>Mientras esperas, puedes ver las últimas noticias.</h2>
        <ul className={estilos.noticias}>
          {posts.slice(0, NOTICIAS).map((post) => (
            <li key={post.slug}>
              <Link href={post.path} className={estilos.noticia}>
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage.src}
                    alt=""
                    width={103}
                    height={68}
                    sizes="103px"
                    className={estilos.noticiaImagen}
                  />
                ) : null}
                <span className={estilos.noticiaTitulo}>{post.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
