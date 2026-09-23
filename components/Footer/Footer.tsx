import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/data";
import estilos from "./Footer.module.css";
import { Facebook, Instagram, Linkedin, Tiktok, Youtube } from "./redes";

const TEXTO_INSTITUCIONAL =
  "Con más de 25 años de experiencia, Sedie Mobili México es líder en la fabricación de mobiliario " +
  "para oficina y sillería profesional. Nos especializamos en soluciones integrales que combinan la " +
  "exclusividad con la calidad de la producción nacional.";

const REDES = [
  { nombre: "Facebook", href: "https://www.facebook.com/people/Sedie-Mobili/61581781496052/", Icono: Facebook },
  { nombre: "Instagram", href: "https://www.instagram.com/sediemobili/", Icono: Instagram },
  { nombre: "YouTube", href: "https://www.youtube.com/@SedieMobili", Icono: Youtube },
  { nombre: "TikTok", href: "https://www.tiktok.com/@sedie.mobili", Icono: Tiktok },
  { nombre: "LinkedIn", href: "https://www.linkedin.com/company/sedie-mobili-mexico", Icono: Linkedin },
];

// "Showrooms" está en el footer actual sin enlace, así que queda fuera hasta que tenga destino.
const INFORMACION = [
  { nombre: "Blog", href: "/blog/" },
  { nombre: "Venta Empresarial", href: "/venta-empresarial/" },
  { nombre: "Acerca de SedieMobili", href: "/nosotros/" },
  { nombre: "Aviso de Privacidad", href: "/legal/" },
  { nombre: "Términos y Condiciones", href: "/legal/#tc" },
];

// El "test city" de Monterrey es un error heredado de WordPress: se copia tal cual.
const SEDES = [
  {
    ciudad: "Monterrey",
    calle: "Prol. Ruiz Cortinez 2941",
    cp: "67113",
    localidad: "test city",
    region: "N.L.",
  },
  {
    ciudad: "Ciudad de México",
    calle: "Calle Pte. 128 787-B7, Industrial Vallejo, Azcapotzalco",
    cp: "02300",
    localidad: "Ciudad de México",
    region: "CDMX",
  },
];

export async function Footer() {
  const categorias = (await getCategories()).filter((categoria) => categoria.parentSlug === null);

  return (
    <footer className={estilos.footer}>
      <div className={estilos.tarjeta}>
        <div className={estilos.marca}>
          <Image
            src="/media/marca/sediemobili_white.svg"
            alt="Sedie &amp; Mobili"
            width={1750}
            height={323}
            className={estilos.logo}
          />
          <p className={estilos.institucional}>{TEXTO_INSTITUCIONAL}</p>
          <ul className={estilos.redes}>
            {REDES.map(({ nombre, href, Icono }) => (
              <li key={nombre}>
                <a href={href} aria-label={nombre} target="_blank" rel="noopener noreferrer" className={estilos.red}>
                  <Icono />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className={estilos.columna} aria-label="Categorías">
          <span className={estilos.columnaTitulo}>Categorías</span>
          <ul className={estilos.lista}>
            <li>
              <Link href="/catalogo/" className={estilos.enlace}>
                Catálogo
              </Link>
            </li>
            {categorias.map((categoria) => (
              <li key={categoria.slug}>
                <Link href={categoria.path} className={estilos.enlace}>
                  {categoria.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={estilos.columna} aria-label="Información">
          <span className={estilos.columnaTitulo}>Información</span>
          <ul className={estilos.lista}>
            {INFORMACION.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={estilos.enlace}>
                  {item.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={estilos.sedes}>
          {SEDES.map((sede) => (
            <div key={sede.ciudad} itemScope itemType="https://schema.org/LocalBusiness" className={estilos.sede}>
              <meta itemProp="name" content={`Sedie & Mobili ${sede.ciudad}`} />
              <span className={estilos.sedeCiudad}>{sede.ciudad}</span>
              <p itemProp="address" itemScope itemType="https://schema.org/PostalAddress" className={estilos.direccion}>
                <span itemProp="streetAddress">{sede.calle}</span>,{" "}
                <span itemProp="postalCode">{sede.cp}</span> <span itemProp="addressLocality">{sede.localidad}</span>,{" "}
                <span itemProp="addressRegion">{sede.region}</span>
                <meta itemProp="addressCountry" content="MX" />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Barra inferior del original: la firma de SCNDAL y el copyright. */}
      <div className={estilos.pie}>
        <Image
          src="/media/marca/White-webtag.svg"
          alt="Created by SCNDAL"
          width={1813}
          height={221}
          className={estilos.webtag}
        />
        <small className={estilos.copyright}>Copyright 2026 @Sedie&amp;Mobili</small>
      </div>
    </footer>
  );
}
