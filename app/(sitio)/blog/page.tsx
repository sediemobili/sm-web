import estilos from "@/components/blog/blog.module.css";
import { TarjetaPost } from "@/components/blog/TarjetaPost";
import { getPosts } from "@/lib/data";
import { metadataDe } from "@/lib/seo";

// Titular de plantilla del original, no sale de los datos.
const TITULAR = "Terapia de Oficina";

export const metadata = metadataDe({
  title: "Blog",
  description:
    "Artículos sobre mobiliario de oficina, ergonomía y diseño de espacios de trabajo de Sedie & Mobili.",
  canonical: "/blog/",
});

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main>
      <section className={estilos.portada}>
        <p className={estilos.portadaTitular}>{TITULAR}</p>
        <h1 className={estilos.portadaSubtitulo}>Nuestro Blog</h1>
      </section>

      <ul className={estilos.lista}>
        {posts.map((post) => (
          <TarjetaPost key={post.slug} post={post} />
        ))}
      </ul>

      {/* Con 6 posts no hace falta paginar; la paginación entraría aquí, como en /catalogo/. */}
    </main>
  );
}
