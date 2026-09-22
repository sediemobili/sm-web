"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ContactoModal } from "@/components/ContactoModal/ContactoModal";
import type { Product } from "@/lib/data";
import estilos from "./Producto.module.css";

type Props = {
  producto: Product;
  // La columna de información se arma en el servidor y entra aquí.
  children: React.ReactNode;
};

export function FichaProducto({ producto, children }: Props) {
  const [imagenActiva, setImagenActiva] = useState(0);
  const [variacion, setVariacion] = useState<number | null>(null);
  const [contacto, setContacto] = useState(false);
  const botonContacto = useRef<HTMLButtonElement>(null);

  const imagenes = producto.images;
  const atributo = producto.attributes[0];

  // Cada variación puede traer su propia imagen; si está en la galería, se muestra esa.
  const indicePorVariacion = useMemo(() => {
    const mapa = new Map<number, number>();
    for (const variante of producto.variations) {
      const indice = imagenes.findIndex((imagen) => imagen.src === variante.image);
      if (indice >= 0) mapa.set(variante.id, indice);
    }
    return mapa;
  }, [producto.variations, imagenes]);

  const elegirVariacion = (id: number) => {
    setVariacion(id);
    const indice = indicePorVariacion.get(id);
    if (indice !== undefined) setImagenActiva(indice);
  };

  const principal = imagenes[imagenActiva];

  return (
    <>
      <div className={estilos.galeria}>
        {principal ? (
          <Image
            key={principal.src}
            src={principal.src}
            alt={principal.alt}
            width={800}
            height={800}
            priority={imagenActiva === 0}
            className={estilos.imagenPrincipal}
          />
        ) : null}

        {imagenes.length > 1 ? (
          <ul className={estilos.miniaturas}>
            {imagenes.map((imagen, indice) => (
              <li key={imagen.src}>
                <button
                  type="button"
                  className={estilos.miniatura}
                  data-activa={indice === imagenActiva}
                  aria-label={`Ver imagen ${indice + 1} de ${imagenes.length}: ${imagen.alt}`}
                  aria-current={indice === imagenActiva}
                  onClick={() => setImagenActiva(indice)}
                >
                  <Image src={imagen.src} alt="" width={120} height={120} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={estilos.informacion}>
        {children}

        {atributo && producto.variations.length > 0 ? (
          <fieldset className={estilos.variaciones}>
            <legend className={estilos.etiqueta}>{atributo.name}</legend>
            <div className={estilos.opciones}>
              {producto.variations.map((variante) => {
                const valor = Object.values(variante.attributes)[0] ?? `Opción ${variante.id}`;
                return (
                  <label key={variante.id} className={estilos.opcion} data-activa={variacion === variante.id}>
                    <input
                      type="radio"
                      name="variacion"
                      value={variante.id}
                      checked={variacion === variante.id}
                      onChange={() => elegirVariacion(variante.id)}
                      className={estilos.opcionRadio}
                    />
                    {valor}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <p className={estilos.nota}>
          Configúrala según tu proyecto. Medidas, colores y acabados personalizables.
        </p>

        <div className={estilos.acciones}>
          {/* T21: "Cotizar" agrega el producto a la lista de cotización. */}
          <button type="button" className="sm-boton">
            Cotizar
          </button>
          <button
            ref={botonContacto}
            type="button"
            className="sm-boton sm-boton--secundario"
            onClick={() => setContacto(true)}
          >
            Contáctanos
          </button>
        </div>
      </div>

      <ContactoModal
        abierto={contacto}
        onCerrar={() => {
          setContacto(false);
          botonContacto.current?.focus();
        }}
      />
    </>
  );
}
