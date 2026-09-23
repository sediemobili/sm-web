import Image from "next/image";
import Link from "next/link";
import { Carrusel } from "@/components/home/Carrusel";
import type { Category } from "@/lib/data";
import estilos from "./categorias.module.css";

// Carrusel de tarjetas de categoría, igual en la home y en /venta-empresarial/.
export function CarruselCategorias({ categorias }: { categorias: Category[] }) {
  if (categorias.length === 0) return null;

  return (
    <Carrusel etiqueta="categorías">
      {categorias.map((categoria) => (
        <li key={categoria.slug} className={estilos.categoriaItem}>
          <Link href={categoria.path} className={estilos.categoria}>
            {categoria.image ? (
              <Image
                src={categoria.image}
                alt=""
                fill
                sizes="(max-width: 767px) 80vw, 410px"
                className={estilos.categoriaImagen}
              />
            ) : null}
            <h3 className={estilos.categoriaNombre}>{categoria.name}</h3>
            <span className={estilos.categoriaEnlace}>Ver Colección</span>
          </Link>
        </li>
      ))}
    </Carrusel>
  );
}
