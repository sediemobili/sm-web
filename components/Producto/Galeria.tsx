import Image from "next/image";
import type { ProductImage } from "@/lib/data";
import estilos from "./Producto.module.css";

// La galería del original es una pila vertical de todas las imágenes, sin miniaturas
// ni carrusel: cada una ocupa el ancho de la columna con 800px de alto, reservado en el CSS
// antes de que cargue. Solo la primera se pide de inmediato y con prioridad; el resto, en
// diferido, al acercarse a la pantalla. (En Next 16, priority está obsoleta: se usan
// loading y fetchPriority.)
export function Galeria({ imagenes, nombre }: { imagenes: ProductImage[]; nombre: string }) {
  if (imagenes.length === 0) return null;

  return (
    <div className={estilos.galeria}>
      {imagenes.map((imagen, indice) => (
        <figure key={imagen.src} className={estilos.galeriaFigura}>
          <Image
            src={imagen.src}
            alt={imagen.alt || `${nombre}, imagen ${indice + 1}`}
            width={720}
            height={800}
            sizes="(max-width: 767px) 100vw, 50vw"
            loading={indice === 0 ? "eager" : "lazy"}
            fetchPriority={indice === 0 ? "high" : undefined}
            className={estilos.galeriaImagen}
          />
        </figure>
      ))}
    </div>
  );
}
