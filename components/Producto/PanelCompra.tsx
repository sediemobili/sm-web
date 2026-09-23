"use client";

import { useRef, useState } from "react";
import { BotonContacto } from "@/components/ContactoModal/BotonContacto";
import { enviarEvento } from "@/lib/analytics";
import { useCotizacion } from "@/lib/cotizacion";
import type { Product } from "@/lib/data";
import estilos from "./producto.module.css";

// Variaciones y CTA. Mantiene la lógica de la lista de cotización y los eventos.
export function PanelCompra({ producto, categoria }: { producto: Product; categoria: string | null }) {
  const [variacion, setVariacion] = useState<number | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "exito" | "falta"; texto: string } | null>(null);
  const { agregar } = useCotizacion();
  const grupo = useRef<HTMLFieldSetElement>(null);

  const atributo = producto.attributes[0];
  const necesitaVariacion = producto.variations.length > 0;

  // Con NEXT_PUBLIC_COMMERCE_ENABLED=true este botón pasaría a "Agregar al carrito".
  const cotizar = () => {
    if (necesitaVariacion && variacion === null) {
      setAviso({ tipo: "falta", texto: `Elige una opción de ${atributo?.name ?? "variación"} antes de cotizar.` });
      grupo.current?.querySelector("input")?.focus();
      return;
    }
    const elegida = producto.variations.find((variante) => variante.id === variacion);
    agregar({ slug: producto.slug, variacionId: variacion, cantidad: 1 });
    enviarEvento("add_to_quote", {
      item_id: producto.slug,
      item_name: producto.name,
      item_category: categoria,
      variacion: elegida ? (Object.values(elegida.attributes)[0] ?? null) : null,
    });
    setAviso({ tipo: "exito", texto: "Agregado a tu lista de cotización." });
  };

  return (
    <>
      {necesitaVariacion && atributo ? (
        <fieldset ref={grupo} className={estilos.variaciones}>
          <legend className={estilos.variacionesEtiqueta}>{atributo.name}</legend>
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
                    className={estilos.opcionRadio}
                    onChange={() => {
                      setVariacion(variante.id);
                      setAviso(null);
                    }}
                  />
                  {valor}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <p className={estilos.nota}>Configúrala según tu proyecto. Medidas, colores y acabados personalizables.</p>

      <div className={estilos.acciones}>
        <button type="button" className={estilos.boton} onClick={cotizar}>
          Solicitar Cotización
        </button>
        <BotonContacto className={`${estilos.boton} ${estilos.botonSecundario}`} />
      </div>

      {aviso ? (
        <p className={estilos.aviso} data-tipo={aviso.tipo} role="status">
          {aviso.texto}
        </p>
      ) : null}
    </>
  );
}
