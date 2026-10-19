import { BotonContacto } from "@/components/ContactoModal/BotonContacto";
import estilos from "./listado.module.css";

// Banda crema común a categoría, colección y procedencia. El h1 es el nombre de la página;
// el resto de textos son de plantilla.
const CONTACTO = "¡Reciba una llamada de un ejecutivo de ventas!";

export function Banda({ prefijo, nombre }: { prefijo: string; nombre: string }) {
  return (
    <section className={estilos.banda}>
      <div className={estilos.bandaTextos}>
        <h1 className={estilos.titulo}>{nombre}</h1>
        <p className={estilos.subtitulo}>
          {prefijo}: {nombre}
        </p>
      </div>
      <div className={estilos.bandaContacto}>
        <BotonContacto label="Contáctanos" className={estilos.contactoEnlace} />
        <p className={estilos.contactoTexto}>{CONTACTO}</p>
      </div>
    </section>
  );
}
