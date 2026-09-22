import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VistaListado } from "@/components/Analytics/VistaListado";
import { JsonLd } from "@/components/Seo/JsonLd";
import { migas as migasLd } from "@/lib/jsonld";
import { descripcionListado, metadataDe } from "@/lib/seo";
import { getProcedenciaBySlug, getProcedencias, getProducts } from "@/lib/data";
import estilos from "./procedencia.module.css";

export async function generateStaticParams() {
  return (await getProcedencias()).map((procedencia) => ({ slug: procedencia.slug }));
}

export async function generateMetadata({ params }: PageProps<"/procedencia/[slug]">) {
  const { slug } = await params;
  const procedencia = await getProcedenciaBySlug(slug);
  if (!procedencia) return {};
  const { total } = await getProducts({ procedencia: procedencia.slug });
  return metadataDe({
    title: procedencia.seo.title ?? `Mobiliario de procedencia ${procedencia.name}`,
    description: procedencia.seo.description ?? descripcionListado(procedencia.name, total),
    canonical: procedencia.path,
    ogImage: procedencia.seo.ogImage,
  });
}

export default async function ProcedenciaPage({ params }: PageProps<"/procedencia/[slug]">) {
  const { slug } = await params;
  const procedencia = await getProcedenciaBySlug(slug);
  if (!procedencia) notFound();

  const { items } = await getProducts({ procedencia: procedencia.slug });
  const productos = [...items].sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <main className="sm-pagina">
      <VistaListado nombre={procedencia.name} total={productos.length} />
      <JsonLd
        datos={migasLd([
          { name: "Inicio", path: "/" },
          { name: procedencia.name, path: procedencia.path },
        ])}
      />

      <nav aria-label="Migas de pan" className="sm-migas">
        <ol className="sm-migas-lista">
          <li>
            <Link href="/">Inicio</Link>
          </li>
          {/* No existe una página /procedencia/ en el sitio actual: la miga va sin enlace. */}
          <li>Procedencia</li>
          <li aria-current="page">{procedencia.name}</li>
        </ol>
      </nav>

      <header className={estilos.encabezado}>
        <h1 className="sm-titulo-pagina">{procedencia.name}</h1>
        {procedencia.description ? (
          <div className="sm-prosa" dangerouslySetInnerHTML={{ __html: procedencia.description }} />
        ) : null}
      </header>

      {productos.length > 0 ? (
        <section aria-label={`Productos de procedencia ${procedencia.name}`}>
          <p className="sm-conteo">
            {productos.length} {productos.length === 1 ? "producto" : "productos"}
          </p>
          <ul className="sm-rejilla">
            {productos.map((producto) => (
              <li key={producto.slug}>
                <Link href={producto.path} className="sm-tarjeta">
                  {producto.images[0] ? (
                    <Image
                      src={producto.images[0].src}
                      alt={producto.images[0].alt}
                      width={400}
                      height={400}
                      className="sm-tarjeta-imagen"
                    />
                  ) : null}
                  <span className="sm-tarjeta-nombre">{producto.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="sm-vacio">
          <p>Todavía no hay productos con esta procedencia.</p>
          <Link href="/catalogo/" className="sm-boton">
            Ver todo el catálogo
          </Link>
        </div>
      )}
    </main>
  );
}
