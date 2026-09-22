import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "@/lib/data";
import { formatearFecha } from "@/lib/formato";
import estilos from "./post.module.css";

const SIGUE_LEYENDO = 3;

// Solo los slugs de posts: cualquier otra ruta de la raíz da 404 y no se come
// las páginas del sitio (/catalogo/, /nosotros/, /legal/…).
export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
}

// En WordPress el cuerpo puede traer un h1; en la página ya hay uno, así que baja a h2.
function jerarquiaCorregida(html: string) {
  return html.replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");
}

export default async function PostPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const otros = (await getPosts()).filter((otro) => otro.slug !== post.slug).slice(0, SIGUE_LEYENDO);

  return (
    <main className="sm-pagina">
      <nav aria-label="Migas de pan" className="sm-migas">
        <ol className="sm-migas-lista">
          <li>
            <Link href="/">Inicio</Link>
          </li>
          <li>
            <Link href="/blog/">Blog</Link>
          </li>
          <li aria-current="page">{post.title}</li>
        </ol>
      </nav>

      <article className={estilos.articulo}>
        <header className={estilos.encabezado}>
          <h1 className="sm-titulo-pagina">{post.title}</h1>
          <p className={estilos.meta}>
            <time dateTime={post.date}>{formatearFecha(post.date)}</time>
            {post.author ? <span> · {post.author}</span> : null}
          </p>
        </header>

        {post.featuredImage ? (
          <Image
            src={post.featuredImage.src}
            alt={post.featuredImage.alt}
            width={1200}
            height={800}
            priority
            className={estilos.destacada}
          />
        ) : null}

        {post.content ? (
          <div className={`sm-prosa ${estilos.cuerpo}`} dangerouslySetInnerHTML={{ __html: jerarquiaCorregida(post.content) }} />
        ) : null}
      </article>

      {otros.length > 0 ? (
        <section className={estilos.sigue} aria-labelledby="sigue-leyendo">
          <h2 id="sigue-leyendo" className="sm-seccion-titulo">
            Sigue leyendo
          </h2>
          <ul className="sm-rejilla">
            {otros.map((otro) => (
              <li key={otro.slug}>
                <Link href={otro.path} className="sm-tarjeta">
                  {otro.featuredImage ? (
                    <Image
                      src={otro.featuredImage.src}
                      alt={otro.featuredImage.alt}
                      width={400}
                      height={300}
                      className="sm-tarjeta-imagen"
                    />
                  ) : null}
                  <time dateTime={otro.date} className={estilos.fecha}>
                    {formatearFecha(otro.date)}
                  </time>
                  <span className="sm-tarjeta-nombre">{otro.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
