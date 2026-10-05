import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data";
import estilos from "./TarjetaProducto.module.css";

type Props = {
  producto: Product;
  categoria: string | null;
  // Ancho real de la zona de imagen en cada contexto (carrusel, rejilla…).
  sizes: string;
  // Hueco previsto para cuando haya venta en línea: sin precio no se pinta nada.
  precio?: string | null;
};

// Hueco de la tarjeta mientras carga la rejilla: mismas clases de zona y cuerpo, así mide igual.
export function TarjetaProductoEsqueleto() {
  return (
    <div className={estilos.esqueleto}>
      <span className={estilos.imagenZona} />
      <span className={estilos.cuerpo}>
        <span className={`${estilos.nombre} ${estilos.barra}`} />
        <span className={`${estilos.categoria} ${estilos.barra}`} />
      </span>
    </div>
  );
}

// Tarjeta de producto única del sitio: toda la tarjeta es el enlace. En el DOM el nombre va
// antes que la categoría para que el enlace se anuncie por el nombre; la rejilla del cuerpo
// los coloca en su sitio visual.
export function TarjetaProducto({ producto, categoria, sizes, precio = null }: Props) {
  const imagen = producto.images[0];

  return (
    <Link href={producto.path} className={estilos.tarjeta}>
      <span className={estilos.imagenZona}>
        {imagen ? <Image src={imagen.src} alt="" fill sizes={sizes} className={estilos.imagen} /> : null}
      </span>
      <span className={estilos.cuerpo}>
        <span className={estilos.nombre}>{producto.name}</span>
        <span className={estilos.categoria}>{categoria}</span>
        {precio ? <span className={estilos.precio}>{precio}</span> : null}
        <span className={estilos.flecha} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" focusable="false">
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </Link>
  );
}
