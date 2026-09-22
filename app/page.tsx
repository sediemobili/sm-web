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
  },
  {
    antetitulo: "Colección Italiana",
    titulo: "Zero",
    texto:
      "Descubre nuestra línea de escritorios italiana, sofisticados y elegantes, se convierten en el statement de cualquier espacio de oficina.",
    cta: { label: "Ver Colección", href: "/coleccion/uno-zero/" },
    fuente: { tipo: "coleccion", slug: "uno-zero" },
  },
  {
    antetitulo: "LARUS escritorios italiano",
    titulo: "LARUS",
    texto: "Fusionando estética, funcionalidad y tecnología; ideal para oficinas directivas y ejecutivas.",
    cta: { label: "Ver Colección", href: "/coleccion/larus/" },
    fuente: { tipo: "coleccion", slug: "larus" },
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

  // Las colecciones no tienen imagen propia en WordPress: se usa la del primer producto.
  const diapositivas: Diapositiva[] = [];
  for (const slide of HERO) {
    const producto =
      slide.fuente.tipo === "producto"
        ? await getProductBySlug(slide.fuente.slug)
        : ((await getProductsByCollection(slide.fuente.slug))[0] ?? null);
    const existe =
      slide.fuente.tipo === "producto"
        ? producto !== null
        : colecciones.some((coleccion) => coleccion.slug === slide.fuente.slug);
    if (!existe) continue;
    diapositivas.push({
      antetitulo: slide.antetitulo,
      titulo: slide.titulo,
      texto: slide.texto,
      cta: slide.cta,
      imagen: producto?.images[0] ?? null,
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
          <ul className="sm-rejilla">
            {categoriasHome.map((categoria) => (
              <li key={categoria.slug}>
                <Link href={categoria.path} className="sm-tarjeta">
                  {categoria.image ? (
                    <Image
                      src={categoria.image}
                      alt={categoria.name}
                      width={400}
                      height={400}
                      className="sm-tarjeta-imagen"
                    />
                  ) : null}
                  <span className="sm-tarjeta-nombre">{categoria.name}</span>
                  <span className={estilos.tarjetaEnlace}>Ver Colección</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={estilos.banner} aria-labelledby="corporativos">
          <h2 id="corporativos" className="sm-seccion-titulo">
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
          <h2 id="explora" className="sm-seccion-titulo">
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
                <Link href={post.path} className="sm-tarjeta">
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
