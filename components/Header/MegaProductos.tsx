"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import estilos from "./MegaProductos.module.css";

export type EnlaceMenu = { name: string; path: string };

type ProductoMenu = EnlaceMenu & { imagen: string | null };

export type CategoriaMenu = EnlaceMenu & {
  slug: string;
  subcategorias: EnlaceMenu[];
  productos: ProductoMenu[];
};

// Retardos del cursor: abrir no salta al cruzar de paso y cerrar perdona salidas breves.
const RETARDO_ABRIR = 150;
const RETARDO_CERRAR = 250;

type Props = {
  colecciones: EnlaceMenu[];
  categorias: CategoriaMenu[];
  claseBoton: string;
  refBoton: React.RefObject<HTMLButtonElement | null>;
  onCotizar: () => void;
};

// Mega-menú de "Productos" en escritorio: tarjeta de cuatro columnas. Todo el contenido llega
// armado desde el servidor (Header.tsx); al pasar el cursor no se pide nada.
export function MegaProductos({ colecciones, categorias, claseBoton, refBoton, onCotizar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(0);
  const contenedor = useRef<HTMLDivElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enlacesCategoria = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuId = useId();
  const tituloId = useId();

  const programar = (accion: () => void, retardo: number) => {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(accion, retardo);
  };

  // Al abrir, la categoría activa es siempre la primera.
  const abrir = () => {
    clearTimeout(temporizador.current);
    if (!abierto) setActiva(0);
    setAbierto(true);
  };

  const cerrar = () => {
    clearTimeout(temporizador.current);
    setAbierto(false);
  };

  useEffect(() => () => clearTimeout(temporizador.current), []);

  // Escape cierra siempre y devuelve el foco al botón; un clic fuera cierra sin mover el foco.
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape") return;
      cerrar();
      refBoton.current?.focus();
    };
    const alTocar = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) cerrar();
    };
    document.addEventListener("keydown", alPulsar);
    document.addEventListener("pointerdown", alTocar);
    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.removeEventListener("pointerdown", alTocar);
    };
  }, [abierto, refBoton]);

  // Arriba y abajo recorren las categorías; el foco nuevo actualiza la columna 3.
  const alTeclaCategoria = (indice: number) => (evento: React.KeyboardEvent) => {
    if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;
    evento.preventDefault();
    const paso = evento.key === "ArrowDown" ? 1 : -1;
    const siguiente = (indice + paso + categorias.length) % categorias.length;
    enlacesCategoria.current[siguiente]?.focus();
  };

  return (
    <div
      ref={contenedor}
      className={estilos.productos}
      onPointerEnter={(evento) => {
        if (evento.pointerType === "mouse") programar(abrir, RETARDO_ABRIR);
      }}
      onPointerLeave={(evento) => {
        if (evento.pointerType === "mouse") programar(cerrar, RETARDO_CERRAR);
      }}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) cerrar();
      }}
    >
      <button
        ref={refBoton}
        type="button"
        className={claseBoton}
        aria-expanded={abierto}
        aria-controls={menuId}
        onClick={() => (abierto ? cerrar() : abrir())}
      >
        Productos
      </button>

      <div
        id={menuId}
        className={estilos.tarjeta}
        data-open={abierto}
        onClick={(evento) => {
          // Al seguir un enlace, el menú se cierra.
          if ((evento.target as HTMLElement).closest("a")) cerrar();
        }}
      >
        <div className={estilos.columna} role="group" aria-labelledby={`${tituloId}-colecciones`}>
          <span id={`${tituloId}-colecciones`} className={estilos.titulo}>
            Colecciones
          </span>
          <ul className={estilos.lista}>
            {colecciones.map((coleccion) => (
              <li key={coleccion.path}>
                <Link href={coleccion.path} className={estilos.enlace}>
                  {coleccion.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={estilos.columna} role="group" aria-labelledby={`${tituloId}-categorias`}>
          <span id={`${tituloId}-categorias`} className={estilos.titulo}>
            Categorías
          </span>
          <ul className={estilos.lista}>
            {categorias.map((categoria, indice) => (
              <li key={categoria.slug}>
                <Link
                  ref={(nodo) => {
                    enlacesCategoria.current[indice] = nodo;
                  }}
                  href={categoria.path}
                  className={estilos.categoria}
                  data-activa={indice === activa}
                  onPointerEnter={() => setActiva(indice)}
                  onFocus={() => setActiva(indice)}
                  onKeyDown={alTeclaCategoria(indice)}
                >
                  {categoria.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/catalogo/" className={estilos.catalogo}>
            Ver todo el catálogo
          </Link>
        </div>

        {/* Todas las categorías ocupan la misma celda y solo se ve la activa: la celda toma el
            alto de la más larga y al cambiar de categoría no se mueve nada. */}
        <div className={estilos.paneles}>
          {categorias.map((categoria, indice) => (
            <div
              key={categoria.slug}
              className={estilos.panel}
              data-activa={indice === activa}
              role="group"
              aria-labelledby={`${tituloId}-${categoria.slug}`}
            >
              <span id={`${tituloId}-${categoria.slug}`} className={estilos.titulo}>
                {categoria.name}
              </span>
              {categoria.subcategorias.length > 0 ? (
                <ul className={estilos.subcategorias}>
                  {categoria.subcategorias.map((subcategoria) => (
                    <li key={subcategoria.path}>
                      <Link href={subcategoria.path} className={estilos.subcategoria}>
                        {subcategoria.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <ul className={estilos.productosLista}>
                {categoria.productos.map((producto) => (
                  <li key={producto.path}>
                    <Link href={producto.path} className={estilos.producto}>
                      {producto.imagen ? (
                        <Image
                          src={producto.imagen}
                          alt=""
                          width={60}
                          height={60}
                          sizes="60px"
                          className={estilos.productoImagen}
                        />
                      ) : (
                        <span className={estilos.productoImagen} />
                      )}
                      {producto.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={estilos.columna} role="group" aria-labelledby={`${tituloId}-proyectos`}>
          <Link id={`${tituloId}-proyectos`} href="/venta-empresarial/" className={`${estilos.titulo} ${estilos.proyectos}`}>
            Proyectos integrales <span aria-hidden="true">→</span>
          </Link>
          <div className={estilos.volumen}>
            <p className={estilos.volumenTexto}>
              ¿Compras por volumen? A partir de 10 piezas mejoramos precios y tiempos de entrega.
            </p>
            <button
              type="button"
              className={estilos.volumenBoton}
              onClick={() => {
                cerrar();
                onCotizar();
              }}
            >
              Cotizar por volumen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
