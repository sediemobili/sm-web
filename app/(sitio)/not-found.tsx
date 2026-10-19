import Link from "next/link";
import estilos from "@/components/estado/estado.module.css";
import { TELEFONO, WHATSAPP } from "@/lib/sitio";

// Es la página que ve quien llega a una URL que no existe, y también la que muestran
// notFound() en producto, categoría, colección, procedencia y post.
// Estática a propósito: sin async ni datos, para que el servidor la pinte entera y se vea
// sin JavaScript. Los enlaces van a rutas fijas; el teléfono y el WhatsApp, de lib/sitio.ts.
export default function NoEncontrado() {
  return (
    <main className={estilos.pagina}>
      {/* not-found.tsx no admite export const metadata: el robots va en la propia página. */}
      <meta name="robots" content="noindex, follow" />

      <h1 className={estilos.titulo}>No encontramos esta página</h1>
      <p className={estilos.texto}>
        La dirección que abriste no existe o cambió de sitio. Busca lo que necesitas o entra al
        catálogo: seguimos teniendo todo el mobiliario.
      </p>

      <form className={estilos.buscador} role="search" action="/buscar/" method="get">
        <label htmlFor="buscar-404" className="sm-oculto">
          Buscar en el sitio
        </label>
        <input id="buscar-404" type="search" name="q" placeholder="Buscar" className={estilos.campo} />
        <button type="submit" className="sm-boton sm-boton--secundario">
          Buscar
        </button>
      </form>

      <div className={estilos.acciones}>
        <Link href="/" className="sm-boton">
          Volver al inicio
        </Link>
        <Link href="/catalogo/" className="sm-boton sm-boton--secundario">
          Ver el catálogo
        </Link>
        <Link href="/venta-empresarial/" className="sm-boton sm-boton--secundario">
          Venta empresarial
        </Link>
        <a href={`tel:${TELEFONO.marcar}`} className="sm-boton sm-boton--secundario">
          Llámanos al {TELEFONO.visible}
        </a>
        <a
          href={`https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className="sm-boton sm-boton--secundario"
        >
          Escríbenos por WhatsApp
        </a>
      </div>
    </main>
  );
}
