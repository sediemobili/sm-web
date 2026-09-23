"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { INTERESES } from "@/components/ContactoModal/esquema";
import { enviarEvento } from "@/lib/analytics";
import { useCotizacion } from "@/lib/cotizacion";
import { enviarCotizacion, estadoInicialCotizacion } from "./acciones";
import estilos from "./cotizacion.module.css";

export type ProductoResumen = {
  slug: string;
  name: string;
  path: string;
  categoria: string | null;
  imagen: { src: string; alt: string } | null;
  variaciones: { id: number; etiqueta: string }[];
};

// Con NEXT_PUBLIC_COMMERCE_ENABLED=true estos textos pasarían a carrito y pago.
// Hoy el flag está en false y todo el flujo es de cotización.
const COMERCIO = process.env.NEXT_PUBLIC_COMMERCE_ENABLED === "true";

export function ListaCotizacion({ productos }: { productos: ProductoResumen[] }) {
  const { renglones, quitar, cambiarCantidad, vaciar } = useCotizacion();
  const [estado, accion, enviando] = useActionState(enviarCotizacion, estadoInicialCotizacion);
  const [listo, setListo] = useState(false);
  const router = useRouter();

  const porSlug = new Map(productos.map((producto) => [producto.slug, producto]));
  // Un producto que ya no existe (se borró en WordPress) se ignora en la tabla.
  const filas = renglones.flatMap((renglon) => {
    const producto = porSlug.get(renglon.slug);
    if (!producto) return [];
    const variacion = producto.variaciones.find((opcion) => opcion.id === renglon.variacionId);
    return [{ renglon, producto, variacion }];
  });
  const huerfanos = renglones.length - filas.length;

  // La Server Action no puede vaciar el localStorage: se limpia aquí y se navega a /gracias/.
  useEffect(() => {
    if (estado.estado !== "exito" || listo) return;
    setListo(true);
    enviarEvento("generate_lead", { origen: "cotizacion", interes: estado.interes });
    vaciar();
    router.push("/gracias/");
  }, [estado.estado, estado.interes, listo, vaciar, router]);

  useEffect(() => setListo(false), [renglones.length]);

  if (filas.length === 0) {
    return (
      <main className="sm-pagina">
        <h1 className="sm-titulo-pagina">Tu lista de cotización</h1>
        <div className="sm-vacio">
          <p>Todavía no has agregado productos a tu lista.</p>
          <Link href="/catalogo/" className="sm-boton">
            Ver el catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="sm-pagina">
      <h1 className="sm-titulo-pagina">Tu lista de cotización</h1>

      {huerfanos > 0 ? (
        <p className={estilos.aviso} role="status">
          {huerfanos === 1
            ? "Quitamos un producto que ya no está disponible."
            : `Quitamos ${huerfanos} productos que ya no están disponibles.`}
        </p>
      ) : null}

      <table className={estilos.tabla}>
        <caption className={estilos.subtitulo}>
          {filas.length} {filas.length === 1 ? "producto" : "productos"} en tu lista
        </caption>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Opción</th>
            <th scope="col">Cantidad</th>
            <th scope="col">
              <span className={estilos.oculto}>Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map(({ renglon, producto, variacion }) => (
            <tr key={`${renglon.slug}-${renglon.variacionId ?? "base"}`}>
              <td>
                <Link href={producto.path} className={estilos.producto}>
                  {producto.imagen ? (
                    <Image
                      src={producto.imagen.src}
                      alt={producto.imagen.alt}
                      width={80}
                      height={80}
                      sizes="80px"
                      className={estilos.miniatura}
                    />
                  ) : null}
                  {producto.name}
                </Link>
              </td>
              <td>{variacion?.etiqueta ?? "—"}</td>
              <td>
                <label className={estilos.oculto} htmlFor={`cantidad-${renglon.slug}-${renglon.variacionId ?? "base"}`}>
                  Cantidad de {producto.name}
                </label>
                <input
                  id={`cantidad-${renglon.slug}-${renglon.variacionId ?? "base"}`}
                  type="number"
                  min={1}
                  value={renglon.cantidad}
                  className={estilos.cantidad}
                  onChange={(evento) =>
                    cambiarCantidad(renglon.slug, renglon.variacionId, Number(evento.target.value))
                  }
                />
              </td>
              <td>
                <button
                  type="button"
                  className={estilos.quitar}
                  onClick={() => {
                    quitar(renglon.slug, renglon.variacionId);
                    enviarEvento("remove_from_quote", {
                      item_id: producto.slug,
                      item_name: producto.name,
                      item_category: producto.categoria,
                      variacion: variacion?.etiqueta ?? null,
                    });
                  }}
                >
                  Quitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form action={accion} className={estilos.formulario} noValidate>
        <input type="hidden" name="renglones" value={JSON.stringify(filas.map(({ renglon }) => renglon))} />

        <h2 className="sm-seccion-titulo">{COMERCIO ? "Tus datos" : "Solicita tu cotización"}</h2>

        <div className={estilos.campos}>
          <Campo nombre="nombre" etiqueta="Nombre *" tipo="text" error={estado.errores.nombre} requerido />
          <Campo nombre="email" etiqueta="Email *" tipo="email" error={estado.errores.email} requerido />
          <Campo nombre="telefono" etiqueta="Teléfono *" tipo="tel" error={estado.errores.telefono} requerido />
          <Campo nombre="empresa" etiqueta="Empresa" tipo="text" error={estado.errores.empresa} />

          <div className={estilos.grupo}>
            <label htmlFor="cotizacion-interes">¿Qué estás buscando?</label>
            <select id="cotizacion-interes" name="interes" defaultValue={INTERESES[0]} className={estilos.campo}>
              {INTERESES.map((interes) => (
                <option key={interes} value={interes}>
                  {interes}
                </option>
              ))}
            </select>
          </div>

          <div className={`${estilos.grupo} ${estilos.ancho}`}>
            <label htmlFor="cotizacion-mensaje">Mensaje</label>
            <textarea id="cotizacion-mensaje" name="mensaje" rows={4} className={estilos.campo} />
          </div>
        </div>

        {estado.estado === "error" && estado.mensaje ? (
          <p className={estilos.error} role="alert">
            {estado.mensaje}
          </p>
        ) : null}

        <div className={estilos.acciones}>
          <button type="submit" className="sm-boton" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar solicitud de cotización"}
          </button>
          <button type="button" className="sm-boton sm-boton--secundario" onClick={vaciar}>
            Vaciar lista
          </button>
        </div>
      </form>
    </main>
  );
}

function Campo({
  nombre,
  etiqueta,
  tipo,
  error,
  requerido,
}: {
  nombre: string;
  etiqueta: string;
  tipo: string;
  error?: string;
  requerido?: boolean;
}) {
  const id = `cotizacion-${nombre}`;
  return (
    <div className={estilos.grupo}>
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        name={nombre}
        type={tipo}
        required={requerido}
        className={estilos.campo}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className={estilos.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
