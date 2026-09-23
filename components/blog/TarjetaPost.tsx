import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/data";
import estilos from "./blog.module.css";

// Tarjeta oscura del original: la imagen ocupa el fondo y el título va encima.
export function TarjetaPost({ post }: { post: Post }) {
  return (
    <li className={estilos.tarjetaItem}>
      <article className={estilos.tarjeta}>
        {post.featuredImage ? (
          <Image
            src={post.featuredImage.src}
            alt=""
            fill
            sizes="(max-width: 767px) 90vw, 370px"
            className={estilos.tarjetaImagen}
          />
        ) : null}
        <h3 className={estilos.tarjetaTitulo}>
          <Link href={post.path} className={estilos.tarjetaEnlace}>
            {post.title}
          </Link>
        </h3>
      </article>
    </li>
  );
}
