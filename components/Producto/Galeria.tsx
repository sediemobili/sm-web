import Image from "next/image";
import type { ProductImage } from "@/lib/data";
import estilos from "./producto.module.css";

// La galería del original es una pila vertical de todas las imágenes, sin miniaturas
// ni carrusel: cada una ocupa el ancho de la columna con 800px de alto.
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
            priority={indice === 0}
            className={estilos.galeriaImagen}
          />
        </figure>
      ))}
    </div>
  );
}
