"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { VistaProducto } from "@/components/Analytics/VistaProducto";
import { enviarEvento } from "@/lib/analytics";
import { ContactoModal } from "@/components/ContactoModal/ContactoModal";
import type { Product } from "@/lib/data";
import { useCotizacion } from "@/lib/cotizacion";
import estilos from "./Producto.module.css";

type Props = {
  producto: Product;
  // Nombre visible de la categoría principal, para los eventos de analítica.
  categoria: string | null;
  // La columna de información se arma en el servidor y entra aquí.
  children: React.ReactNode;
};

export function FichaProducto({ producto, categoria, children }: Props) {
  const [imagenActiva, setImagenActiva] = useState(0);
  const [variacion, setVariacion] = useState<number | null>(null);
  const [contacto, setContacto] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "exito" | "falta"; texto: string } | null>(null);
  const { agregar } = useCotizacion();
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
  const necesitaVariacion = producto.variations.length > 0;

  // Con NEXT_PUBLIC_COMMERCE_ENABLED=true estos textos pasarían a "Agregar al carrito"
  // y el destino sería el carrito en vez de la lista de cotización. Hoy el flag está en false.
  const cotizar = () => {
    const elegida = producto.variations.find((variante) => variante.id === variacion);
    if (necesitaVariacion && variacion === null) {
      setAviso({ tipo: "falta", texto: `Elige una opción de ${atributo?.name ?? "variación"} antes de cotizar.` });
      return;
    }
    agregar({ slug: producto.slug, variacionId: variacion, cantidad: 1 });
    enviarEvento("add_to_quote", {
      item_id: producto.slug,
      item_name: producto.name,
      item_category: categoria,
      variacion: variacion === null ? null : (Object.values(elegida?.attributes ?? {})[0] ?? null),
    });
    setAviso({ tipo: "exito", texto: "Agregado a tu lista de cotización." });
  };

  return (
    <>
      <VistaProducto slug={producto.slug} nombre={producto.name} categoria={categoria} />

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
                      onChange={() => {
                        elegirVariacion(variante.id);
                        setAviso(null);
                      }}
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
          <button type="button" className="sm-boton" onClick={cotizar}>
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

        {aviso ? (
          <p className={estilos.aviso} data-tipo={aviso.tipo} role="status">
            {aviso.texto}
            {aviso.tipo === "exito" ? (
              <>
                {" "}
                <Link href="/cotizacion/">Ver la lista</Link>
              </>
            ) : null}
          </p>
        ) : null}
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
