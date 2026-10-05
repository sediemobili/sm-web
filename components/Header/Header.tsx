import { normalizar } from "@/lib/buscar";
import { getCategories, getCollections, getProducts } from "@/lib/data";
import { HeaderNav } from "./HeaderNav";
import type { CategoriaMenu, NodoMenu, ProductoIndice } from "./tipos";

// Productos de muestra en el último nivel del menú por niveles.
const PRODUCTOS_POR_NIVEL = 5;

async function productos(filtro: { category: string } | { collection: string }): Promise<NodoMenu[]> {
  const { items } = await getProducts({ ...filtro, limit: PRODUCTOS_POR_NIVEL });
  return items.map((product) => ({ slug: product.slug, name: product.name, path: product.path }));
}

export async function Header() {
  const [categories, collections, { items: todos }] = await Promise.all([
    getCategories(),
    getCollections(),
    getProducts(),
  ]);
  const principales = categories.filter((category) => category.parentSlug === null);
  const hijasDe = (slug: string) => categories.filter((category) => category.parentSlug === slug);

  // Todo el menú se arma aquí y viaja con la página: al abrirlo no se pide nada.
  const [coleccionesNiveles, categoriasNiveles] = await Promise.all([
    // Colecciones: cada una con 5 de sus productos.
    Promise.all(
      collections.map(async (collection) => ({
        slug: collection.slug,
        name: collection.name,
        path: collection.path,
        hijos: await productos({ collection: collection.slug }),
      })),
    ),
    // Categorías: con subcategorías (y 5 productos en cada una) o, si no tienen, 5 productos.
    Promise.all(
      principales.map(async (category) => {
        const subcategorias = hijasDe(category.slug);
        const hijos = subcategorias.length
          ? await Promise.all(
              subcategorias.map(async (sub) => ({
                slug: sub.slug,
                name: sub.name,
                path: sub.path,
                hijos: await productos({ category: sub.slug }),
              })),
            )
          : await productos({ category: category.slug });
        return { slug: category.slug, name: category.name, path: category.path, hijos };
      }),
    ),
  ]);

  // Índice de la búsqueda en vivo del modal: lo mínimo de cada producto. La categoría es la
  // más profunda, como en el resto del sitio; las claves suman categorías, sus madres y
  // colecciones para buscar también por ellas.
  const nombreCategoria = new Map(categories.map((category) => [category.slug, category]));
  const nombreColeccion = new Map(collections.map((collection) => [collection.slug, collection.name]));
  const indice: ProductoIndice[] = todos.map((product) => {
    const suyas = categories.filter((category) => product.categories.includes(category.slug));
    const categoria = suyas.find((category) => category.parentSlug !== null) ?? suyas[0];
    const madres = suyas.map((category) => category.parentSlug && nombreCategoria.get(category.parentSlug)?.name);
    const claves = new Set([
      ...suyas.map((category) => category.name),
      ...madres.filter((nombre): nombre is string => Boolean(nombre)),
      ...product.collections.map((slug) => nombreColeccion.get(slug) ?? slug),
    ]);
    return {
      nombre: product.name,
      slug: product.slug,
      categoria: categoria?.name ?? null,
      imagen: product.images[0]?.src ?? null,
      claves: normalizar([...claves].join(" ")),
    };
  });

  // El menú móvil solo usa las categorías con sus subcategorías.
  const categoriasMenu: CategoriaMenu[] = principales.map((category) => ({
    slug: category.slug,
    name: category.name,
    path: category.path,
    subcategorias: hijasDe(category.slug).map(({ name, path }) => ({ name, path })),
  }));

  return (
    <HeaderNav
      colecciones={collections.map(({ name, path }) => ({ name, path }))}
      categoriasMenu={categoriasMenu}
      coleccionesNiveles={coleccionesNiveles}
      categoriasNiveles={categoriasNiveles}
      indice={indice}
    />
  );
}
