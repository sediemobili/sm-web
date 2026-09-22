import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonContacto } from "@/components/ContactoModal/BotonContacto";
import estilos from "@/components/Paginas/Paginas.module.css";
import { getPageBySlug, type Section } from "@/lib/data";

// La sección "Atención Especializada" llega mezclada desde Elementor: un carrusel de 4 imágenes
// y las 3 ventajas en un mismo bloque. Se separan por su estructura: cada ventaja es
// una imagen seguida de un párrafo, con su título cuando lo tiene.
function separarAtencion(body: string, tituloSeccion: string | null) {
  const figuras = [...body.matchAll(/<figure><img src="([^"]*)" alt="([^"]*)"><\/figure>/g)];
  const parrafos = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)];
  const titulos = [...body.matchAll(/<h3>([\s\S]*?)<\/h3>/g)];

  const ventajas = parrafos.map((parrafo, orden) => {
    const figura = figuras.filter((f) => f.index < parrafo.index).at(-1);
    const titulo = titulos.filter((t) => t.index < parrafo.index).at(-1);
    return {
      imagen: figura ? { src: figura[1], alt: figura[2] } : null,
      // La primera ventaja perdió su <h3>: en Elementor ese título es el de la sección.
      titulo: titulo && (!figura || titulo.index > figura.index) ? titulo[1] : orden === 0 ? tituloSeccion : null,
      texto: parrafo[1],
    };
  });

  const usadas = new Set(ventajas.map((ventaja) => ventaja.imagen?.src));
  const galeria = figuras
    .filter((figura) => !usadas.has(figura[1]))
    .map((figura) => ({ src: figura[1], alt: figura[2] }));

  return { galeria, ventajas };
}

// Los CTA de Elementor apuntan al dominio actual; se pasan a rutas internas.
function rutaInterna(href: string) {
  const ruta = href.replace(/^https?:\/\/(www\.)?sediemobili\.com/, "");
  if (!ruta.startsWith("/")) return null;
  return ruta.endsWith("/") || ruta.includes("#") ? ruta : `${ruta}/`;
}

function SeccionSimple({ seccion, titulo }: { seccion: Section; titulo: "h1" | "h2" }) {
  const Titulo = titulo;
  const enlace = seccion.cta ? rutaInterna(seccion.cta.href) : null;
  return (
    <section className={estilos.seccion}>
      {seccion.heading ? (
        <Titulo className={titulo === "h1" ? "sm-titulo-pagina" : "sm-seccion-titulo"}>{seccion.heading}</Titulo>
      ) : null}
      {seccion.image ? (
        <Image
          src={seccion.image.src}
          alt={seccion.image.alt}
          width={1200}
          height={800}
          className={estilos.imagen}
        />
      ) : null}
      {seccion.body ? <div className="sm-prosa" dangerouslySetInnerHTML={{ __html: seccion.body }} /> : null}
      {enlace ? (
        <Link href={enlace} className="sm-boton sm-boton--secundario">
          {seccion.cta?.label}
        </Link>
      ) : null}
    </section>
  );
}

export default async function VentaEmpresarialPage() {
  const pagina = await getPageBySlug("venta-empresarial");
  if (!pagina) notFound();

  const secciones = pagina.sections ?? [];
  const [portada, atencion, ...resto] = secciones;

  return (
    <main className="sm-pagina">
      <nav aria-label="Migas de pan" className="sm-migas">
        <ol className="sm-migas-lista">
          <li>
            <Link href="/">Inicio</Link>
          </li>
          <li aria-current="page">{pagina.title}</li>
        </ol>
      </nav>

      {portada ? (
        <section className={estilos.seccion}>
          <h1 className="sm-titulo-pagina">{portada.heading}</h1>
          {portada.body ? <div className="sm-prosa" dangerouslySetInnerHTML={{ __html: portada.body }} /> : null}
          {/* El CTA original abre el popup de Elementor: aquí abre el modal de contacto. */}
          <BotonContacto label={portada.cta?.label ?? "Contáctanos"} />
        </section>
      ) : null}

      {atencion?.body ? <Atencion seccion={atencion} /> : null}

      {resto.map((seccion) =>
        // Las secciones que en Elementor eran solo un listado dinámico quedaron sin contenido.
        seccion.body || seccion.image || seccion.cta ? (
          <SeccionSimple key={seccion.heading} seccion={seccion} titulo="h2" />
        ) : null,
      )}
    </main>
  );
}

function Atencion({ seccion }: { seccion: Section }) {
  const { galeria, ventajas } = separarAtencion(seccion.body ?? "", seccion.heading);

  return (
    <section className={estilos.seccion} aria-labelledby="atencion">
      <h2 id="atencion" className="sm-seccion-titulo">
        {seccion.heading}
      </h2>

      {galeria.length > 0 ? (
        <ul className={estilos.galeria}>
          {galeria.map((imagen) => (
            <li key={imagen.src}>
              <Image src={imagen.src} alt={imagen.alt} width={600} height={600} className={estilos.imagen} />
            </li>
          ))}
        </ul>
      ) : null}

      {ventajas.length > 0 ? (
        <ul className={estilos.ventajas}>
          {ventajas.map((ventaja) => (
            <li key={ventaja.texto} className={estilos.ventaja}>
              {ventaja.imagen ? (
                <Image
                  src={ventaja.imagen.src}
                  alt={ventaja.imagen.alt}
                  width={400}
                  height={400}
                  className={estilos.imagen}
                />
              ) : null}
              {ventaja.titulo ? <h3 className={estilos.ventajaTitulo}>{ventaja.titulo}</h3> : null}
              <p className="sm-prosa">{ventaja.texto}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
