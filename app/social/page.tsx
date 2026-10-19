import type { Metadata } from "next";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Tiktok, Youtube } from "@/components/Footer/redes";
import { metadataDe, NOMBRE } from "@/lib/seo";
import { REDES, SEDES, TELEFONO, WHATSAPP, type Red } from "@/lib/sitio";
import estilos from "./social.module.css";

const LEMA =
  "Mobiliario de oficina y sillería profesional. Fabricación propia desde Monterrey y Ciudad de México.";

export const metadata: Metadata = metadataDe({
  title: NOMBRE,
  description: LEMA,
  canonical: "/social/",
  noindex: true,
});

// Solo los enlaces que salen del sitio llevan utm_source; los internos quedan limpios.
const conUtm = (url: string) => {
  const destino = new URL(url);
  destino.searchParams.set("utm_source", "social");
  return destino.toString();
};

const ICONOS_REDES: Record<Red, () => React.ReactNode> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Tiktok,
  linkedin: Linkedin,
};

// Íconos de los botones, de trazo, a 24px de caja; el color lo pone currentColor.
function Icono({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={estilos.icono}
    >
      {children}
    </svg>
  );
}

// El de WhatsApp es el del botón flotante (components/WhatsApp), relleno.
function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={estilos.icono}>
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 1 1-5.03 18.65L2 22l1.38-4.87A10 10 0 0 1 12 2Zm0 1.7a8.3 8.3 0 1 0 0 16.6 8.3 8.3 0 0 0 0-16.6Z"
      />
      <path
        transform="translate(12 12) scale(0.42) translate(-12 -12)"
        d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"
      />
    </svg>
  );
}

const IconoTelefono = () => (
  <Icono>
    <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
  </Icono>
);

const IconoCatalogo = () => (
  <Icono>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icono>
);

const IconoProyectos = () => (
  <Icono>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
  </Icono>
);

const IconoCotizacion = () => (
  <Icono>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" />
  </Icono>
);

export default function Social() {
  return (
    <main className={estilos.pagina}>
      <div className={estilos.columna}>
        <header className={estilos.cabecera}>
          <div className={estilos.isotipo}>
            {/* Isotipo de public/media/marca/isotipo-06.svg, en línea para que tome el color de tinta. */}
            <svg viewBox="0 0 1080 1080" fill="currentColor" role="img" aria-label={NOMBRE}>
              <path d="M882.63,548.64v66.18c0,7.21-3.82,13.8-10.05,17.38l-220.11,127.12c-6.27,3.59-10.05,10.17-10.05,17.38v26.09c0,7.13,3.78,13.76,10.05,17.38l138.13,79.74c4.66,2.69,7.52,7.65,7.52,13.03v47.64c0,11.58-12.54,18.82-22.57,13.03l-162.42-93.76c-6.19-3.55-13.87-3.55-20.06,0l-161.04,93.03c-10.03,5.79-22.57-1.44-22.57-13.03v-47.71c0-5.37,2.87-10.34,7.52-13.03l139.86-80.76c6.23-3.55,10.05-10.21,10.05-17.34v-22.55c0-7.17-3.82-13.8-10.05-17.42l-137.73-79.5c-13.4-7.77-13.4-27.04,0-34.77l32.28-18.64c5.52-3.19,12.34-3.19,17.9,0l123.3,71.15c6.5,3.74,14.55,3.74,21.05,0l173.52-100.16c13.4-7.77,13.4-27.04,0-34.77l-173.99-100.48c-6.23-3.59-13.84-3.59-20.1,0l-265.44,153.26c-6.19,3.59-13.88,3.59-20.06,0l-57.31-33.07c-6.27-3.59-10.05-10.25-10.05-17.38v-299.57c0-7.21,3.78-13.8,10.05-17.38l271.47-156.68c6.19-3.67,13.84-3.67,20.06,0l41.15,23.72c8.78,5.06,14.19,14.43,14.19,24.56v142.73c0,7.77-4.45,14.78-11.43,18.17l-31.18,14.94c-13.36,6.43-28.81-3.27-28.81-18.09v-113.48c0-5.52-6.03-8.99-10.8-6.23l-187.51,108.28c-6.07,3.47-9.89,9.89-10.05,16.91l-4.89,203.71c-.43,15.65,16.52,25.74,30.12,17.86l250.5-144.62c6.27-3.63,13.88-3.63,20.1,0l259.41,149.75c6.23,3.59,10.05,10.25,10.05,17.38Z" />
            </svg>
          </div>
          <h1 className={estilos.nombre}>{NOMBRE}</h1>
          <p className={estilos.lema}>{LEMA}</p>
        </header>

        <ul className={estilos.botones}>
          <li>
            <a
              href={conUtm(`https://wa.me/${WHATSAPP}`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`sm-boton ${estilos.boton}`}
            >
              <IconoWhatsApp />
              <span>Escríbenos por WhatsApp</span>
            </a>
          </li>
          <li>
            <a href={`tel:${TELEFONO.marcar}`} className={`sm-boton ${estilos.boton}`}>
              <IconoTelefono />
              <span className={estilos.etiqueta}>
                <span>Llámanos</span>
                <small className={estilos.horario}>{TELEFONO.horario.texto}</small>
              </span>
            </a>
          </li>
          <li>
            <Link href="/catalogo/" className={`sm-boton ${estilos.boton}`}>
              <IconoCatalogo />
              <span>Ver catálogo</span>
            </Link>
          </li>
          <li>
            <Link href="/venta-empresarial/" className={`sm-boton ${estilos.boton}`}>
              <IconoProyectos />
              <span>Proyectos y venta empresarial</span>
            </Link>
          </li>
          <li>
            <Link href="/cotizacion/" className={`sm-boton ${estilos.boton}`}>
              <IconoCotizacion />
              <span>Armar mi cotización</span>
            </Link>
          </li>
        </ul>

        <ul className={estilos.redes}>
          {REDES.map(({ red, nombre, url }) => {
            const IconoRed = ICONOS_REDES[red];
            return (
              <li key={red}>
                <a
                  href={conUtm(url)}
                  aria-label={nombre}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={estilos.red}
                >
                  <IconoRed />
                </a>
              </li>
            );
          })}
        </ul>

        <footer className={estilos.sedes}>
          {SEDES.map((sede) => (
            <p key={sede.slug} className={estilos.sede}>
              <span className={estilos.ciudad}>{sede.ciudad}</span>
              {sede.calle}, {sede.cp} {sede.localidad}, {sede.region}
            </p>
          ))}
        </footer>
      </div>
    </main>
  );
}
