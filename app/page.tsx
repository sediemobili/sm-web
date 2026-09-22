import Image from "next/image";
import Link from "next/link";
import { Carrusel } from "@/components/Home/Carrusel";
import { Hero, type Diapositiva } from "@/components/Home/Hero";
import estilos from "@/components/Home/Home.module.css";
import { PersonalizaContacto } from "@/components/Home/PersonalizaContacto";
import { Newsletter } from "@/components/Newsletter/Newsletter";
import {
  getCategories,
  getCollections,
  getPosts,
  getProductBySlug,
  getProductsByCollection,
  type Category,
  type Product,
} from "@/lib/data";

// Slugs que el sitio actual elige a mano en la home. Los datos siguen saliendo de lib/data;
// si un slug deja de existir, la sección lo salta en lugar de romper la página.
const HERO = [
  {
    antetitulo: "Nuevo Producto",
    titulo: "Eugenia",
    texto:
      "Confort directivo y ergonomía superior para jornadas largas. Respaldo en malla, opción de cabecera, brazos ajustables y más.",
    cta: { label: "Ver Eugenia", href: "/product/eugenia/" },
    fuente: { tipo: "producto", slug: "eugenia" },
    variante: "clara",
  },
  {
    antetitulo: "Colección Italiana",
    titulo: "Zero",
    texto:
      "Descubre nuestra línea de escritorios italiana, sofisticados y elegantes, se convierten en el statement de cualquier espacio de oficina.",
    cta: { label: "Ver Colección", href: "/coleccion/uno-zero/" },
    fondo: "/media/fondos/ZERO.webp",
    variante: "zero",
  },
  {
    antetitulo: "LARUS escritorios italiano",
    titulo: "LARUS",
    texto: "Fusionando estética, funcionalidad y tecnología; ideal para oficinas directivas y ejecutivas.",
    cta: { label: "Ver Colección", href: "/coleccion/larus/" },
    fuente: { tipo: "coleccion", slug: "larus" },
    variante: "larus",
  },
] as const;

const CATEGORIAS_HOME = ["taburetes", "sofas", "sillas-de-oficina", "recepciones", "mesas", "escritorios"];
const SILLAS_HOME = ["flight", "eugenia", "felicita", "space-plegable", "solar", "visio"];
const ESCRITORIOS_HOME = [
  "dinamo-1",
  "versatil-v8-mesa",
  "versatil-v7-met",
  "versatil-v4-met",
  "versatil-v3-hyblsp",
  "versatil-v3-hyb",
];

async function porSlug(slugs: string[]) {
  const productos = await Promise.all(slugs.map((slug) => getProductBySlug(slug)));
  return productos.filter((producto) => producto !== null);
}

export default async function Home() {
  const [categorias, colecciones, posts] = await Promise.all([getCategories(), getCollections(), getPosts()]);

  // El fondo sale del archivo que usa Elementor cuando existe; si no, de la imagen del
  // producto o del primer producto de la colección, que es lo único que hay en los datos.
  const diapositivas: Diapositiva[] = [];
  for (const slide of HERO) {
    const fuente = "fuente" in slide ? slide.fuente : null;
    const producto =
      fuente?.tipo === "producto"
        ? await getProductBySlug(fuente.slug)
        : fuente
          ? ((await getProductsByCollection(fuente.slug))[0] ?? null)
          : null;
    const existe =
      !fuente ||
      (fuente.tipo === "producto"
        ? producto !== null
        : colecciones.some((coleccion) => coleccion.slug === fuente.slug));
    if (!existe) continue;
    const fondoFijo = "fondo" in slide ? slide.fondo : null;
    diapositivas.push({
      antetitulo: slide.antetitulo,
      titulo: slide.titulo,
      texto: slide.texto,
      cta: slide.cta,
      fondo: fondoFijo
        ? { src: fondoFijo, alt: slide.titulo }
        : (producto?.images[0] ?? null),
      variante: slide.variante,
    });
  }

  const categoriasHome = CATEGORIAS_HOME.map((slug) =>
    categorias.find((categoria) => categoria.slug === slug),
  ).filter((categoria) => categoria !== undefined);
  const [sillas, escritorios] = await Promise.all([porSlug(SILLAS_HOME), porSlug(ESCRITORIOS_HOME)]);

  const nombreCategoria = (producto: Product) => {
    const suyas = categorias.filter((categoria: Category) => producto.categories.includes(categoria.slug));
    return (suyas.find((categoria) => categoria.parentSlug !== null) ?? suyas[0])?.name ?? null;
  };

  return (
    <main>
      <Hero diapositivas={diapositivas} />

      <div className="sm-pagina">
        <section className={estilos.seccion} aria-label="Categorías">
          <ul className={estilos.categorias}>
            {categoriasHome.map((categoria) => (
              <li key={categoria.slug} className={estilos.categoriaItem}>
                <Link href={categoria.path} className={estilos.categoria}>
                  {categoria.image ? (
                    <Image
                      src={categoria.image}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 90vw, 33vw"
                      className={estilos.categoriaImagen}
                    />
                  ) : null}
                  <span className={estilos.categoriaNombre}>{categoria.name}</span>
                  <span className={estilos.categoriaEnlace}>Ver Colección</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={estilos.banner} aria-labelledby="corporativos">
          <Image
            src="/media/fondos/background-sillas1.webp"
            alt=""
            fill
            sizes="100vw"
            className={estilos.bannerImagen}
          />
          <h2 id="corporativos" className={estilos.bannerTitulo}>
            Oficinas y Corporativos
          </h2>
          <p className={estilos.bannerTexto}>
            Soluciones integrales de mobiliario diseñadas para transformar tus espacios de trabajo.
          </p>
          <Link href="/venta-empresarial/" className="sm-boton">
            Más Información
          </Link>
        </section>

        <PersonalizaContacto />

        <section className={estilos.intro} aria-labelledby="explora">
          <h2 id="explora" className={estilos.introTitulo}>
            Explora Nuestro Mobiliario de Oficinas
          </h2>
          <p className={estilos.introTexto}>
            Transforma tu entorno de trabajo con nuestra selección exclusiva de mobiliario. Desde ergonomía avanzada
            hasta diseños de recepción que impactan, ofrecemos soluciones integrales para oficinas que inspiran
            productividad y bienestar.
          </p>
        </section>

        <Carrusel
          id="carrusel-sillas"
          titulo="Descubre el Catálogo de Sillas para oficina"
          productos={sillas}
          categoriaDe={nombreCategoria}
          enlace={{ label: "Ver Sillas", href: "/product-category/sillas-de-oficina/" }}
        />

        <Carrusel
          id="carrusel-escritorios"
          titulo="Nuestros Escritorios para Oficina"
          productos={escritorios}
          categoriaDe={nombreCategoria}
          enlace={{ label: "Ver Escritorios", href: "/product-category/escritorios/" }}
        />

        <section className={estilos.seccion} aria-labelledby="blog">
          <div className={estilos.seccionEncabezado}>
            <h2 id="blog" className="sm-seccion-titulo">
              Nuestro Blog
            </h2>
            <Link href="/blog/" className="sm-boton sm-boton--secundario">
              Ver Más
            </Link>
          </div>
          <ul className="sm-rejilla">
            {posts.slice(0, 6).map((post) => (
              <li key={post.slug}>
                <Link href={post.path} className={`sm-tarjeta ${estilos.blogTarjeta}`}>
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage.src}
                      alt={post.featuredImage.alt}
                      width={400}
                      height={300}
                      className="sm-tarjeta-imagen"
                    />
                  ) : null}
                  <span className="sm-tarjeta-nombre">{post.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Newsletter />
      </div>
    </main>
  );
}
