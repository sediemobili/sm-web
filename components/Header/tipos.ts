// Datos de navegación que arma Header.tsx en el servidor y usan los menús del header.

export type EnlaceMenu = { name: string; path: string };

// Categoría de primer nivel con sus subcategorías: la usa el menú móvil.
export type CategoriaMenu = EnlaceMenu & {
  slug: string;
  subcategorias: EnlaceMenu[];
};

// Nodo del menú por niveles: lo que cuelga de él son subniveles (hijos) o, en el último
// nivel, productos. Un nodo sin nada debajo es una hoja.
export type NodoMenu = EnlaceMenu & {
  slug: string;
  hijos?: NodoMenu[];
};

// Entrada del índice de búsqueda en vivo: lo mínimo para listar un producto.
export type ProductoIndice = {
  nombre: string;
  slug: string;
  categoria: string | null;
  imagen: string | null;
  // Categorías (con sus madres) y colecciones del producto, ya normalizadas: el modal también
  // busca por ellas, así "silla" o "escritorio" encuentran productos llamados por modelo.
  claves: string;
};
