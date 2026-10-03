import Image from "next/image";
import Link from "next/link";
import { Carrusel } from "@/components/Home/Carrusel";
import type { Category } from "@/lib/data";
import { CintaCategorias } from "./CintaCategorias";
import estilos from "./categorias.module.css";

function Tarjeta({ categoria, copia = false }: { categoria: Category; copia?: boolean }) {
  return (
    <li className={estilos.categoriaItem} aria-hidden={copia || undefined}>
      <Link href={categoria.path} className={estilos.categoria} tabIndex={copia ? -1 : undefined}>
        {categoria.image ? (
          <Image
            src={categoria.image}
            alt=""
            fill
            sizes="(max-width: 767px) 80vw, 360px"
            className={estilos.categoriaImagen}
          />
        ) : null}
        <h3 className={estilos.categoriaNombre}>{categoria.name}</h3>
        <span className={estilos.categoriaEnlace}>Ver Colección</span>
        <span className={estilos.categoriaIndicador}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </li>
  );
}

// Carrusel de tarjetas de categoría, igual en la home y en /venta-empresarial/.
// Con `automatico` (solo la home) la cinta avanza sola; las copias de las tarjetas
// cierran el ciclo y quedan fuera del árbol accesible y del orden de tabulación.
export function CarruselCategorias({ categorias, automatico = false }: { categorias: Category[]; automatico?: boolean }) {
  if (categorias.length === 0) return null;

  const tarjetas = categorias.map((categoria) => <Tarjeta key={categoria.slug} categoria={categoria} />);

  if (automatico) {
    return (
      <CintaCategorias
        etiqueta="categorías"
        copia={categorias.map((categoria) => (
          <Tarjeta key={`copia-${categoria.slug}`} categoria={categoria} copia />
        ))}
      >
        {tarjetas}
      </CintaCategorias>
    );
  }

  return (
    <Carrusel etiqueta="categorías" claseLista={estilos.listaCategorias}>
      {tarjetas}
    </Carrusel>
  );
}
