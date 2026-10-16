import Image from "next/image";
import Link from "next/link";
import { CarruselCategorias } from "@/components/categorias/CarruselCategorias";
import { BotonContacto } from "@/components/ContactoModal/BotonContacto";
import { getCategories } from "@/lib/data";
import { metadataDe } from "@/lib/seo";
import { TELEFONO, WHATSAPP } from "@/lib/sitio";
import estilos from "./page.module.css";

const CTA = "Cuéntanos tu proyecto";

type Foto = { src: string; alt: string } | null;

const AUDIENCIAS: { titulo: string; texto: string; foto: Foto }[] = [
  {
    titulo: "Empresas y corporativos",
    texto:
      "Necesitas amueblar un piso nuevo, renovar un área o estandarizar varias sedes. Armamos la propuesta completa, con una sola cotización y un solo responsable del proyecto.",
    foto: { src: "/media/paginas/volumen.webp", alt: "Hileras de sillas operativas iguales" },
  },
  {
    titulo: "Arquitectos e interioristas",
    texto:
      "Respetamos tu partido de diseño. Adaptamos medidas, acabados y telas a tu especificación, y te damos fichas técnicas para tus entregables.",
    foto: { src: "/media/paginas/personalizacion.webp", alt: "Muestrario de telas abierto sobre planos de un proyecto" },
  },
  {
    titulo: "Contratistas y gerentes de proyecto",
    texto:
      "Fechas, etapas y entregas parciales. Coordinamos la instalación con el avance de obra, para que el mobiliario llegue cuando el espacio está listo.",
    // FOTO PENDIENTE: instalación de mobiliario en una oficina en obra o recién terminada.
    foto: null,
  },
];

const PASOS: { titulo: string; texto: string }[] = [
  {
    titulo: "Levantamiento",
    texto: "Visitamos el espacio o partimos de tus planos. Definimos áreas, aforo y necesidades por puesto.",
  },
  {
    titulo: "Propuesta",
    texto:
      "Entregamos la selección de piezas, la distribución y la cotización por partidas, para que puedas comparar y ajustar.",
  },
  {
    titulo: "Muestras y acabados",
    texto:
      "Ves y pruebas las piezas clave antes de producir. Eliges telas, maderas y metales sobre muestra física.",
  },
  {
    titulo: "Fabricación",
    texto: "Producimos en nuestras instalaciones. Las piezas a medida se fabrican bajo tu especificación.",
  },
  {
    titulo: "Entrega e instalación",
    texto: "Entregamos, armamos y dejamos el espacio listo para usarse. Por etapas si la obra lo pide.",
  },
];

const MOTIVOS: { titulo: string; texto: string }[] = [
  {
    titulo: "Fabricación propia",
    texto:
      "No revendemos. Al fabricar podemos cambiar medidas, acabados y configuraciones sin que el proyecto se vuelva inviable.",
  },
  {
    titulo: "Personalización real",
    texto:
      "Medidas especiales, telas por referencia y acabados a juego con tu paleta. Si la pieza existe, la adaptamos; si no, la desarrollamos.",
  },
  {
    titulo: "Dos puntos de atención",
    texto: "Monterrey y Ciudad de México, con cobertura en todo el país.",
  },
  {
    titulo: "Catálogo amplio",
    texto:
      "Sillería, escritorios, mesas, recepciones, bancas y sofás, de una misma fábrica y con lenguaje visual consistente entre áreas.",
  },
];

export const metadata = metadataDe({
  title: "Venta empresarial y proyectos a medida - Sedie & Mobili",
  description:
    "Amueblamos oficinas completas: levantamiento, propuesta, fabricación e instalación. Trabajamos con empresas, arquitectos e interioristas en todo México.",
  canonical: "/venta-empresarial/",
});

export default async function VentaEmpresarialPage() {
  const categorias = await getCategories();
  const principales = categorias.filter((categoria) => categoria.parentSlug === null);

  return (
    <main>
      {/* 1. Portada */}
      <section className={estilos.portada}>
        <div className={estilos.portadaTexto}>
          <h1 className={`sm-titulo-pagina ${estilos.titulo}`}>Proyectos de mobiliario, de principio a fin</h1>
          <p className={`sm-prosa ${estilos.entrada}`}>
            Más de 25 años fabricando mobiliario de oficina en México. Acompañamos el proyecto completo:
            levantamiento del espacio, selección y personalización de piezas, fabricación, entrega e instalación.
          </p>
          <div className={estilos.acciones}>
            <BotonContacto label={CTA} origen="venta-empresarial" />
            <Link href="/catalogo/" className="sm-boton sm-boton--secundario">
              Explorar el catálogo
            </Link>
          </div>
        </div>
        <div className={estilos.portadaFoto}>
          <Image
            src="/media/paginas/envato-labs-image-edit-4-2.webp"
            alt="Escritorio ejecutivo de madera con librero a juego en una oficina"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* 2. Con quién trabajamos */}
      <section className={estilos.seccion} aria-labelledby="audiencias">
        <h2 id="audiencias" className="sm-seccion-titulo">
          Con quién trabajamos
        </h2>
        <ul className={estilos.audiencias}>
          {AUDIENCIAS.map((audiencia) => (
            <li key={audiencia.titulo} className={estilos.audiencia}>
              <div className={estilos.audienciaFoto}>
                {audiencia.foto ? (
                  <Image
                    src={audiencia.foto.src}
                    alt={audiencia.foto.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1189px) 33vw, 370px"
                  />
                ) : null}
              </div>
              <h3 className={estilos.subtitulo}>{audiencia.titulo}</h3>
              <p className={estilos.texto}>{audiencia.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Cómo trabajamos */}
      <section className={estilos.seccion} aria-labelledby="pasos">
        <h2 id="pasos" className="sm-seccion-titulo">
          Cómo trabajamos
        </h2>
        <ol className={estilos.pasos}>
          {PASOS.map((paso, indice) => (
            <li key={paso.titulo} className={estilos.paso}>
              <span className={estilos.numero} aria-hidden="true">
                {String(indice + 1).padStart(2, "0")}
              </span>
              <h3 className={estilos.subtitulo}>{paso.titulo}</h3>
              <p className={estilos.texto}>{paso.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Por qué con nosotros */}
      <section className={estilos.seccion} aria-labelledby="motivos">
        <h2 id="motivos" className="sm-seccion-titulo">
          Por qué con nosotros
        </h2>
        <ul className={estilos.motivos}>
          {MOTIVOS.map((motivo) => (
            <li key={motivo.titulo} className={estilos.motivo}>
              <h3 className={estilos.subtitulo}>{motivo.titulo}</h3>
              <p className={estilos.texto}>{motivo.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Categorías: la cinta automática de la home (CintaCategorias, vía la prop automatico). */}
      <section className={estilos.categorias} aria-labelledby="categorias">
        <h2 id="categorias" className="sm-oculto">
          Categorías
        </h2>
        <CarruselCategorias categorias={principales} automatico />
      </section>

      {/* 6. Cierre */}
      <section className={estilos.seccion} aria-labelledby="cierre">
        <div className={estilos.cierre}>
          <h2 id="cierre" className={`sm-seccion-titulo ${estilos.cierreTitulo}`}>
            Cuéntanos del proyecto
          </h2>
          <p className={`sm-prosa ${estilos.entrada}`}>
            Dinos cuántas personas, en qué ciudad y para cuándo. Te respondemos con una propuesta, no con un
            catálogo genérico.
          </p>
          <BotonContacto label={CTA} origen="venta-empresarial" />
          <ul className={estilos.contacto}>
            <li>
              Teléfono: <a href={`tel:${TELEFONO.marcar}`}>{TELEFONO.visible}</a>
              <span className={estilos.horario}>{TELEFONO.horario.texto}</span>
            </li>
            <li>
              WhatsApp:{" "}
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                {TELEFONO.visible}
              </a>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
