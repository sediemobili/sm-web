import Image from "next/image";
import { BotonContacto } from "@/components/ContactoModal/BotonContacto";
import estilos from "./Home.module.css";

// Bloque "Personaliza tu Experiencia": el CTA abre el modal de contacto.
export function PersonalizaContacto() {
  return (
    <section className={estilos.personaliza} aria-labelledby="personaliza">
      <Image
        src="/media/fondos/background-sillas2.webp"
        alt=""
        fill
        sizes="100vw"
        className={estilos.bannerImagen}
      />
      <h2 id="personaliza" className={estilos.bannerTitulo}>
        Personaliza tu Experiencia
      </h2>
      <p className={estilos.bannerTexto}>
        Adaptamos nuestros diseños y manejamos grandes volúmenes para tu compañía.
      </p>
      <BotonContacto />
    </section>
  );
}
