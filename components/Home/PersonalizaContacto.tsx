import { BotonContacto } from "@/components/ContactoModal/BotonContacto";
import estilos from "./Home.module.css";

// Bloque "Personaliza tu Experiencia": el CTA abre el modal de contacto.
export function PersonalizaContacto() {
  return (
    <section className={estilos.personaliza} aria-labelledby="personaliza">
      <h2 id="personaliza" className="sm-seccion-titulo">
        Personaliza tu Experiencia
      </h2>
      <p className={estilos.bannerTexto}>
        Adaptamos nuestros diseños y manejamos grandes volúmenes para tu compañía.
      </p>
      <BotonContacto />
    </section>
  );
}
