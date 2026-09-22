import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data";
import estilos from "./Home.module.css";

type Props = {
  id: string;
  titulo: string;
  productos: Product[];
  // Nombre visible de la categoría de cada producto, como lo muestra el sitio actual.
  categoriaDe: (producto: Product) => string | null;
  enlace: { label: string; href: string };
};

// Fila desplazable con scroll-snap: no necesita JavaScript y se recorre con teclado.
export function Carrusel({ id, titulo, productos, categoriaDe, enlace }: Props) {
  if (productos.length === 0) return null;

  return (
    <section className={estilos.seccion} aria-labelledby={id}>
      <div className={estilos.seccionEncabezado}>
        <h2 id={id} className="sm-seccion-titulo">
          {titulo}
        </h2>
        <Link href={enlace.href} className="sm-boton sm-boton--secundario">
          {enlace.label}
        </Link>
      </div>

      <ul className={estilos.fila}>
        {productos.map((producto) => (
          <li key={producto.slug} className={estilos.filaItem}>
            <Link href={producto.path} className="sm-tarjeta">
              {producto.images[0] ? (
                <Image
                  src={producto.images[0].src}
                  alt={producto.images[0].alt}
                  width={400}
                  height={400}
                  className="sm-tarjeta-imagen"
                />
              ) : null}
              <span className={estilos.tarjetaCategoria}>{categoriaDe(producto)}</span>
              <span className="sm-tarjeta-nombre">{producto.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
