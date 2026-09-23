import Image from "next/image";
import Link from "next/link";
import { BotonContacto } from "@/components/ContactoModal/BotonContacto";
import { CarruselCategorias } from "@/components/categorias/CarruselCategorias";
import { Carrusel } from "@/components/home/Carrusel";
import { Hero, type Diapositiva } from "@/components/home/Hero";
import estilos from "@/components/home/home.module.css";
import { getCategories, getPosts, getProductBySlug, type Category, type Product } from "@/lib/data";

// Lo que el original elige a mano y no está en los datos: el orden de las tarjetas,
// los productos de cada carrusel y los textos de plantilla de cada sección.
const CATEGORIAS = ["sillas-de-oficina", "recepciones", "mesas", "escritorios", "taburetes", "sofas"];
const SILLAS = ["flight", "eugenia", "felicita", "space-plegable", "solar", "visio"];
const ESCRITORIOS = [
  "dinamo-1",
  "versatil-v8-mesa",
  "versatil-v7-met",
  "versatil-v4-met",
  "versatil-v3-hyblsp",
  "versatil-v3-hyb",
];

const HERO: Diapositiva[] = [
  {
    antetitulo: "Nuevo Producto",
    titulo: "Eugenia",
    texto:
      "Confort directivo y ergonomía superior para jornadas largas. Respaldo en malla, opción de cabecera, brazos ajustables y más.",
    cta: { label: "Ver Eugenia", href: "/product/eugenia/" },
    medio: { tipo: "video", src: "/media/video/eugenia.mp4", poster: "/media/productos/Eugenia-con-cabecera-gris-2.webp" },
    variante: "eugenia",
  },
  {
    antetitulo: "Colección Italiana",
    titulo: "Zero",
    texto:
      "Descubre nuestra línea de escritorios italiana, sofisticados y elegantes, se convierten en el statement de cualquier espacio de oficina.",
    cta: { label: "Ver Colección", href: "/coleccion/uno-zero/" },
    medio: { tipo: "imagen", src: "/media/fondos/ZERO.webp" },
    variante: "zero",
  },
  {
    antetitulo: "LARUS escritorios italiano",
    titulo: "LARUS",
    texto: "Fusionando estética, funcionalidad y tecnología; ideal para oficinas directivas y ejecutivas.",
    cta: { label: "Ver Colección", href: "/coleccion/larus/" },
    medio: { tipo: "video", src: "/media/video/larus.mp4", poster: "/media/productos/Larus-LAR-3-1.webp" },
    variante: "larus",
  },
];

async function porSlug(slugs: string[]) {
  const productos = await Promise.all(slugs.map((slug) => getProductBySlug(slug)));
  return productos.filter((producto) => producto !== null);
}

function TarjetaProducto({ producto, categoria }: { producto: Product; categoria: string | null }) {
  return (
    <li className={estilos.productoItem}>
      <article className={estilos.producto}>
        {producto.images[0] ? (
          <figure className={estilos.productoFigura}>
            <Image
              src={producto.images[0].src}
              alt={producto.images[0].alt}
              width={258}
              height={258}
              sizes="(max-width: 767px) 80vw, 260px"
              className={estilos.productoImagen}
            />
          </figure>
        ) : null}
        {categoria ? <p className={estilos.productoCategoria}>{categoria}</p> : null}
        <h3 className={estilos.productoNombre}>{producto.name}</h3>
        <Link href={producto.path} className={estilos.boton}>
          Más información
        </Link>
      </article>
    </li>
  );
}

export default async function HomePage() {
  const [categorias, posts, sillas, escritorios] = await Promise.all([
    getCategories(),
    getPosts(),
    porSlug(SILLAS),
    porSlug(ESCRITORIOS),
  ]);

  const categoriasHome = CATEGORIAS.map((slug) => categorias.find((categoria) => categoria.slug === slug)).filter(
    (categoria): categoria is Category => categoria !== undefined,
  );
  const nombreCategoria = (producto: Product) => {
    const suyas = categorias.filter((categoria) => producto.categories.includes(categoria.slug));
    return (suyas.find((categoria) => categoria.parentSlug !== null) ?? suyas[0])?.name ?? null;
  };

  return (
    <main>
      {/* 1. Hero */}
      <Hero diapositivas={HERO} />

      {/* 2. Carrusel de categorías */}
      <section className={estilos.seccionCategorias} aria-label="Categorías">
        <CarruselCategorias categorias={categoriasHome} />
      </section>

      {/* 3. Dos banners */}
      <section className={estilos.seccionBanners} aria-label="Servicios">
        <article className={estilos.banner}>
          <Image src="/media/fondos/background-sillas1.webp" alt="" fill sizes="50vw" className={estilos.bannerImagen} />
          <h2 className={estilos.bannerTitulo}>Oficinas y Corporativos</h2>
          <p className={estilos.bannerTexto}>
            Soluciones integrales de mobiliario diseñadas para transformar tus espacios de trabajo.
          </p>
          <Link href="/venta-empresarial/" className={estilos.boton}>
            Más Información
          </Link>
        </article>

        <article className={estilos.banner}>
          <Image src="/media/fondos/background-sillas2.webp" alt="" fill sizes="50vw" className={estilos.bannerImagen} />
          {/* "Personaliza tus Experiencia" es la errata del sitio actual; se copia tal cual. */}
          <h2 className={estilos.bannerTitulo}>Personaliza tus Experiencia</h2>
          <p className={estilos.bannerTexto}>
            Adaptamos nuestros diseños y manejamos grandes volúmenes para tu compañía.
          </p>
          <BotonContacto className={estilos.boton} />
        </article>
      </section>

      {/* 4. Explora + Sillería Ejecutiva */}
      <section className={estilos.seccionExplora} aria-labelledby="explora">
        <h2 id="explora" className={estilos.tituloSeccion}>
          Explora Nuestro Mobiliario de Oficinas
        </h2>
        <p className={estilos.introTexto}>
          Transforma tu entorno de trabajo con nuestra selección exclusiva de mobiliario. Desde ergonomía avanzada
          hasta diseños de recepción que impactan, ofrecemos soluciones integrales para oficinas que inspiran
          productividad y bienestar.
        </p>

        <article className={estilos.silleria}>
          <Image
            src="/media/fondos/sillas-para-todos.webp"
            alt=""
            fill
            sizes="100vw"
            className={estilos.silleriaImagen}
          />
          <h3 className={estilos.silleriaTitulo}>
            Sillería
            <br />
            Ejecutiva
          </h3>
          <p className={estilos.silleriaTexto}>Descubre nuestras nuevas líneas disponibles.</p>
          <Link href="/product-category/sillas-de-oficina/" className={estilos.boton}>
            Ver Todas las Sillas
          </Link>
        </article>
      </section>

      {/* 5. Carrusel de sillas */}
      <section className={estilos.seccionProductos} aria-labelledby="sillas">
        <h2 id="sillas" className={estilos.tituloSeccion}>
          Descubre el Catálogo de Sillas para oficina
        </h2>
        <Carrusel etiqueta="sillas">
          {sillas.map((producto) => (
            <TarjetaProducto key={producto.slug} producto={producto} categoria={nombreCategoria(producto)} />
          ))}
        </Carrusel>
      </section>

      {/* 6. Escritorios Innovadores */}
      <section className={estilos.seccionEscritorios} aria-label="Escritorios innovadores">
        <Image
          src="/media/fondos/fv-scaled.webp"
          alt=""
          width={1200}
          height={800}
          sizes="(max-width: 767px) 0px, 35vw"
          className={estilos.escritoriosIlustracion}
        />
        <h2 className={estilos.escritoriosTitulo}>
          Escritorios
          <span className={estilos.escritoriosDestacado}>Innovadores</span>
        </h2>
      </section>

      {/* 7. Descubre todas nuestras líneas */}
      <section className={estilos.seccionLineas} aria-labelledby="lineas">
        <Image src="/media/fondos/sala-de-juntas.webp" alt="" fill sizes="100vw" className={estilos.lineasImagen} />
        <h2 id="lineas" className={estilos.lineasTitulo}>
          Descubre todas nuestras líneas
        </h2>
        <Link href="/catalogo/" className={estilos.boton}>
          Ver Todas las Sillas
        </Link>
      </section>

      {/* 8. Carrusel de escritorios */}
      <section
        className={`${estilos.seccionProductos} ${estilos.seccionEscritoriosProductos}`}
        aria-labelledby="escritorios"
      >
        <h2 id="escritorios" className={estilos.tituloSeccion}>
          Nuestros Escritorios para Oficina
        </h2>
        <Carrusel etiqueta="escritorios">
          {escritorios.map((producto) => (
            <TarjetaProducto key={producto.slug} producto={producto} categoria={nombreCategoria(producto)} />
          ))}
        </Carrusel>
      </section>

      {/* 9. Blog */}
      <section className={estilos.seccionBlog} aria-labelledby="blog">
        <div className={estilos.blogEncabezado}>
          <h2 id="blog" className={estilos.blogTitulo}>
            Nuestro Blog
          </h2>
          <Link href="/blog/" className={estilos.boton}>
            Ver Más
          </Link>
        </div>
        <Carrusel etiqueta="blog">
          {posts.map((post) => (
            <li key={post.slug} className={estilos.postItem}>
              <article className={estilos.post}>
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage.src}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 90vw, 320px"
                    className={estilos.postImagen}
                  />
                ) : null}
                <h3 className={estilos.postTitulo}>
                  <Link href={post.path} className={estilos.postEnlace}>
                    {post.title}
                  </Link>
                </h3>
              </article>
            </li>
          ))}
        </Carrusel>
      </section>
    </main>
  );
}
