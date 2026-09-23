import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TarjetaPost } from "@/components/blog/TarjetaPost";
import { CarruselCategorias } from "@/components/categorias/CarruselCategorias";
import { BotonContacto } from "@/components/ContactoModal/BotonContacto";
import estilos from "@/components/Paginas/Paginas.module.css";
import { getCategories, getPageBySlug, getPosts, type Section } from "@/lib/data";
import { metadataDe } from "@/lib/seo";

// Textos de plantilla del original que no están en los datos.
const ANTETITULO = "Proyectos Empresariales";

// La sección "Atención Especializada" llega mezclada desde Elementor: un carrusel de 4 imágenes
// y las 3 ventajas en un mismo bloque. Se separan por su estructura: cada ventaja es una
// imagen seguida de un párrafo, con su título cuando lo tiene.
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
  const galeria = figuras.filter((f) => !usadas.has(f[1])).map((f) => ({ src: f[1], alt: f[2] }));
  return { galeria, ventajas };
}

export async function generateMetadata() {
  const pagina = await getPageBySlug("venta-empresarial");
  return metadataDe({
    title: pagina?.seo.title ?? "Venta empresarial",
    description:
      pagina?.seo.description ??
      "Proyectos de mobiliario a medida, precios por volumen y asesoría para empresas.",
    canonical: "/venta-empresarial/",
    ogImage: pagina?.seo.ogImage ?? null,
  });
}

export default async function VentaEmpresarialPage() {
  const [pagina, categorias, posts] = await Promise.all([
    getPageBySlug("venta-empresarial"),
    getCategories(),
    getPosts(),
  ]);
  if (!pagina) notFound();

  const secciones = pagina.sections ?? [];
  const portada = secciones[0];
  const atencion = secciones[1];
  const vision = secciones[2];
  const principales = categorias.filter((categoria) => categoria.parentSlug === null);
  const { galeria, ventajas } = separarAtencion(atencion?.body ?? "", atencion?.heading ?? null);

  // El cuerpo de la portada trae el título grande como <h2> y el párrafo.
  const tituloPortada = portada?.body?.match(/<h2>([\s\S]*?)<\/h2>/)?.[1] ?? "";
  const textoPortada = portada?.body?.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? "";

  return (
    <main>
      {/* 1. Portada */}
      <section className={estilos.portada}>
        <p className={estilos.antetitulo}>{portada?.heading ?? ANTETITULO}</p>
        <h1 className={estilos.portadaTitulo} dangerouslySetInnerHTML={{ __html: tituloPortada }} />
        <p className={estilos.prosa} dangerouslySetInnerHTML={{ __html: textoPortada }} />
        {/* El CTA del original abre el popup de Elementor: aquí abre nuestro modal. */}
        <BotonContacto label={portada?.cta?.label ?? "Contáctanos"} className={estilos.botonOscuro} />
      </section>

      {/* 2. Galería y ventajas */}
      {galeria.length > 0 ? (
        <ul className={estilos.galeria}>
          {galeria.map((imagen) => (
            <li key={imagen.src}>
              <figure className={estilos.galeriaFigura}>
                <Image
                  src={imagen.src}
                  alt={imagen.alt}
                  width={331}
                  height={331}
                  sizes="(max-width: 767px) 90vw, 331px"
                  className={estilos.galeriaImagen}
                />
              </figure>
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
                  alt=""
                  width={400}
                  height={267}
                  sizes="(max-width: 767px) 90vw, 400px"
                  className={estilos.ventajaImagen}
                />
              ) : null}
              {ventaja.titulo ? <h2 className={estilos.ventajaTitulo}>{ventaja.titulo}</h2> : null}
              <p className={estilos.ventajaTexto}>{ventaja.texto}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {/* 3. Tu visión */}
      {vision ? (
        <section className={estilos.seccion}>
          <h2 className={estilos.seccionTitulo}>{vision.heading}</h2>
          {vision.body ? <div className={estilos.prosa} dangerouslySetInnerHTML={{ __html: vision.body }} /> : null}
        </section>
      ) : null}

      {/* 4. Explore nuestros productos: en Elementor es un carrusel dinámico de categorías. */}
      <section className={estilos.listado} aria-labelledby="categorias">
        <div className={estilos.listadoEncabezado}>
          <h2 id="categorias" className={estilos.seccionTitulo}>
            Explore nuestros productos
          </h2>
        </div>
        <CarruselCategorias categorias={principales} />
      </section>

      {/* 5. Nuestro Blog: también dinámico. */}
      <section className={estilos.listado} aria-labelledby="blog">
        <div className={estilos.listadoEncabezado}>
          <h2 id="blog" className={estilos.blogTitulo}>
            Nuestro Blog
          </h2>
          <Link href="/blog/" className={estilos.botonOscuro}>
            Ver Más
          </Link>
        </div>
        <ul className={estilos.galeria}>
          {posts.slice(0, 4).map((post) => (
            <TarjetaPost key={post.slug} post={post} />
          ))}
        </ul>
      </section>
    </main>
  );
}
