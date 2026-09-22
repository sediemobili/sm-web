import { getCategories, getCollections } from "@/lib/data";
import { HeaderNav } from "./HeaderNav";

// Los 6 bloques de "Catálogos descargables" del mega-menú actual, en su orden.
// En WordPress ninguno tiene PDF todavía, así que cada uno enlaza a su categoría;
// cuando existan los archivos, el href pasa a ser el del catálogo.
const CATALOGO_SLUGS = ["escritorios", "bancas", "sofas", "sillas-de-oficina", "recepciones", "mesas"];

export async function Header() {
  const [categories, collections] = await Promise.all([getCategories(), getCollections()]);
  const principales = categories.filter((category) => category.parentSlug === null);
  const catalogos = CATALOGO_SLUGS.map((slug) => principales.find((category) => category.slug === slug)).filter(
    (category) => category !== undefined,
  );

  return (
    <HeaderNav
      categorias={principales.map(({ name, path }) => ({ name, path }))}
      colecciones={collections.map(({ name, path }) => ({ name, path }))}
      catalogos={catalogos.map(({ name, path }) => ({ name, path }))}
    />
  );
}
