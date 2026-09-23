import Image from "next/image";
import { notFound } from "next/navigation";
import estilos from "@/components/blog/blog.module.css";
import { TarjetaPost } from "@/components/blog/TarjetaPost";
import { JsonLd } from "@/components/Seo/JsonLd";
import { getPostBySlug, getPosts } from "@/lib/data";
import { articulo, migas as migasLd } from "@/lib/jsonld";
import { descripcionPost, metadataDe } from "@/lib/seo";

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

export async function generateMetadata({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const extracto = post.excerpt?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return metadataDe({
    title: post.seo.title ?? post.title,
    description: post.seo.description ?? extracto ?? descripcionPost(post.title),
    canonical: post.path,
    ogImage: post.seo.ogImage ?? post.featuredImage?.src ?? null,
    tipo: "article",
  });
}

export default async function PostPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const otros = (await getPosts()).filter((otro) => otro.slug !== post.slug).slice(0, SIGUE_LEYENDO);

  return (
    <main>
      <JsonLd
        datos={[
          articulo(post),
          migasLd([
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog/" },
            { name: post.title, path: post.path },
          ]),
        ]}
      />

      <article>
        <header className={estilos.postPortada}>
          {post.featuredImage ? (
            <Image
              src={post.featuredImage.src}
              alt={post.featuredImage.alt}
              fill
              sizes="100vw"
              priority
              className={estilos.postPortadaImagen}
            />
          ) : null}
          <h1 className={estilos.postTitulo}>{post.title}</h1>
        </header>

        {/* Los posts sin contenido muestran solo portada y cierre, sin huecos. */}
        {post.content ? (
          <div className={estilos.cuerpo} dangerouslySetInnerHTML={{ __html: jerarquiaCorregida(post.content) }} />
        ) : null}
      </article>

      {otros.length > 0 ? (
        <section className={estilos.cierre} aria-labelledby="mas-posts">
          <h2 id="mas-posts" className={estilos.cierreTitulo}>
            Nuestro Blog
          </h2>
          <ul className={estilos.lista}>
            {otros.map((otro) => (
              <TarjetaPost key={otro.slug} post={otro} />
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
