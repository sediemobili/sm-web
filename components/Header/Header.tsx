import { getCategories, getCollections, getProducts } from "@/lib/data";
import { HeaderNav } from "./HeaderNav";
import type { CategoriaMenu } from "./MegaProductos";

// Productos de muestra por categoría en el mega-menú.
const PRODUCTOS_POR_CATEGORIA = 4;

export async function Header() {
  const [categories, collections] = await Promise.all([getCategories(), getCollections()]);
  const principales = categories.filter((category) => category.parentSlug === null);

  // El mega-menú y el menú móvil se arman aquí y viajan con la página: subcategorías y
  // 4 productos por categoría (el menú móvil no usa los productos).
  const categoriasMenu: CategoriaMenu[] = await Promise.all(
    principales.map(async (category) => {
      const { items } = await getProducts({ category: category.slug, limit: PRODUCTOS_POR_CATEGORIA });
      return {
        slug: category.slug,
        name: category.name,
        path: category.path,
        subcategorias: categories
          .filter((child) => child.parentSlug === category.slug)
          .map(({ name, path }) => ({ name, path })),
        productos: items.map((product) => ({
          name: product.name,
          path: product.path,
          imagen: product.images[0]?.src ?? null,
        })),
      };
    }),
  );

  return (
    <HeaderNav
      colecciones={collections.map(({ name, path }) => ({ name, path }))}
      categoriasMenu={categoriasMenu}
    />
  );
}
