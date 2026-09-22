import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/lib/data";
import { formatearFecha } from "@/lib/formato";
import estilos from "./blog.module.css";

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="sm-pagina">
      <nav aria-label="Migas de pan" className="sm-migas">
        <ol className="sm-migas-lista">
          <li>
            <Link href="/">Inicio</Link>
          </li>
          <li aria-current="page">Blog</li>
        </ol>
      </nav>

      <header className={estilos.encabezado}>
        <h1 className="sm-titulo-pagina">Blog</h1>
      </header>

      <ul className="sm-rejilla">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={post.path} className="sm-tarjeta">
              {post.featuredImage ? (
                <Image
                  src={post.featuredImage.src}
                  alt={post.featuredImage.alt}
                  width={400}
                  height={300}
                  className="sm-tarjeta-imagen"
                />
              ) : null}
              <time dateTime={post.date} className={estilos.fecha}>
                {formatearFecha(post.date)}
              </time>
              <span className="sm-tarjeta-nombre">{post.title}</span>
              {post.excerpt ? (
                <span className={estilos.extracto} dangerouslySetInnerHTML={{ __html: post.excerpt }} />
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      {/* Con 6 posts no hace falta paginar; la paginación entraría aquí, como en /catalogo/. */}
    </main>
  );
}
