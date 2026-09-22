// Tipos de dominio, derivados de lo extraído en data/*.json.

export type Seo = {
  title: string | null;
  description: string | null;
  ogImage: string | null;
};

export type ProductImage = {
  src: string;
  alt: string;
};

export type DownloadTipo = "modelo3d" | "dwg" | "instructivo" | "ficha_tecnica" | "video" | "otro";

export type Download = {
  tipo: DownloadTipo;
  label: string;
  url: string;
  extension: string | null;
};

export type Spec = {
  label: string;
  value: string;
};

export type StockStatus = "instock" | "outofstock" | "onbackorder";

export type ProductAttribute = {
  name: string;
  options: string[];
};

export type Variant = {
  id: number;
  sku: string | null;
  // Un valor por atributo de variación, con el nombre visible: { Tipo: "Con Cabecera" }.
  attributes: Record<string, string>;
  price: number | null;
  stockStatus: StockStatus;
  image: string | null;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  path: string;
  shortDescription: string | null;
  description: string | null;
  sku: string | null;
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  currency: string;
  stockStatus: StockStatus;
  attributes: ProductAttribute[];
  variations: Variant[];
  images: ProductImage[];
  categories: string[];
  collections: string[];
  procedencia: string | null;
  tags: string[];
  specs: Spec[] | null;
  downloads: Download[] | null;
  seo: Seo;
};

// Base común de las tres taxonomías; solo product_cat tiene jerarquía e imagen.
export type Term = {
  id: number;
  slug: string;
  name: string;
  parentSlug: string | null;
  path: string;
  description: string | null;
  image: string | null;
  count: number;
  // Orden curado del mega-menú, asignado por scripts/extract/taxonomias.ts.
  orden: number;
  seo: Seo;
};

export type Category = Term;
export type Collection = Term;
export type Procedencia = Term;

export type Breadcrumb = {
  name: string;
  path: string;
};

export type CategoryWithHierarchy = Category & {
  parent: Category | null;
  children: Category[];
  breadcrumbs: Breadcrumb[];
};

export type Post = {
  id: number;
  slug: string;
  path: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  date: string;
  modified: string;
  author: string | null;
  featuredImage: ProductImage | null;
  categories: string[];
  tags: string[];
  seo: Seo;
};

export type Section = {
  heading: string | null;
  body: string | null;
  image: ProductImage | null;
  cta: { label: string; href: string } | null;
};

export type Page = {
  id: number;
  slug: string;
  path: string;
  title: string;
  excerpt: string | null;
  // Las páginas de Elementor llegan por secciones; las demás, como HTML en content.
  content: string | null;
  sections: Section[] | null;
  date: string;
  modified: string;
  featuredImage: ProductImage | null;
  tags: string[];
  seo: Seo;
};

export type ProductQuery = {
  category?: string;
  collection?: string;
  procedencia?: string;
  limit?: number;
  offset?: number;
};

// getProducts pagina: items es la página pedida y total cuenta todo lo que pasa el filtro.
export type ProductPage = {
  items: Product[];
  total: number;
};

export type DataRepository = {
  getProducts(query?: ProductQuery): Promise<ProductPage>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductsByCategory(slug: string): Promise<Product[]>;
  getProductsByCollection(slug: string): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<CategoryWithHierarchy | null>;
  getCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<Collection | null>;
  getProcedencias(): Promise<Procedencia[]>;
  getProcedenciaBySlug(slug: string): Promise<Procedencia | null>;
  getPosts(): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getPages(): Promise<Page[]>;
  getPageBySlug(slug: string): Promise<Page | null>;
};
