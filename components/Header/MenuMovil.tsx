"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CategoriaMenu, EnlaceMenu } from "./tipos";
import estilos from "./MenuMovil.module.css";

type Props = {
  id: string;
  abierto: boolean;
  colecciones: EnlaceMenu[];
  categorias: CategoriaMenu[];
  // Se llama al cerrarse el diálogo por cualquier vía (X, Escape, fuera, enlace).
  onCerrar: () => void;
  onCotizar: () => void;
  onContacto: () => void;
};

type Seccion = "productos" | "colecciones";

// Menú de la hamburguesa. Es un diálogo modal: el navegador atrapa el foco, deja inerte el
// resto y cierra con Escape. Los datos llegan armados del servidor (Header.tsx).
export function MenuMovil({ id, abierto, colecciones, categorias, onCerrar, onCotizar, onContacto }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const prefijo = useId();
  // Un solo acordeón abierto por nivel: una sección y, dentro de Productos, una categoría.
  const [seccion, setSeccion] = useState<Seccion | null>(null);
  const [categoria, setCategoria] = useState<string | null>(null);

  useLayoutEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) {
      setSeccion(null);
      setCategoria(null);
      elemento.showModal();
    }
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  // Si la ventana pasa a escritorio con el menú abierto, se cierra: allí no se ve.
  useEffect(() => {
    const escritorio = window.matchMedia("(min-width: 768px)");
    const alCambiar = () => {
      if (escritorio.matches) dialogo.current?.close();
    };
    escritorio.addEventListener("change", alCambiar);
    return () => escritorio.removeEventListener("change", alCambiar);
  }, []);

  const cerrar = () => dialogo.current?.close();

  const alternarSeccion = (elegida: Seccion) => {
    setSeccion(seccion === elegida ? null : elegida);
    setCategoria(null);
  };

  const panel = (abiertoPanel: boolean, idPanel: string, contenido: React.ReactNode) => (
    <div id={idPanel} className={estilos.panel} data-open={abiertoPanel}>
      <div className={estilos.panelInterior}>{contenido}</div>
    </div>
  );

  return (
    <dialog
      ref={dialogo}
      id={id}
      className={estilos.menu}
      aria-label="Menú"
      onClose={onCerrar}
      onClick={(evento) => {
        // Fuera del menú (el fondo) o al seguir un enlace, se cierra.
        if (evento.target === dialogo.current || (evento.target as HTMLElement).closest("a")) cerrar();
      }}
    >
      <div className={estilos.marco}>
        <div className={estilos.barra}>
          {/* El mismo buscador que el del escritorio: GET a /buscar/. */}
          <form className={estilos.buscador} role="search" action="/buscar/" method="get">
            <label htmlFor={`${prefijo}-buscar`} className="sm-oculto">
              Buscar en el sitio
            </label>
            <input id={`${prefijo}-buscar`} type="search" name="q" className={estilos.campo} placeholder="Buscar" />
            <button type="submit" className={estilos.botonBuscar} aria-label="Buscar">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
              </svg>
            </button>
          </form>
          <button type="button" className={estilos.cerrar} aria-label="Cerrar menú" onClick={cerrar}>
            ×
          </button>
        </div>

        <nav aria-label="Menú móvil" className={estilos.navegacion}>
          <div className={estilos.acordeon}>
            <button
              type="button"
              className={estilos.acordeonBoton}
              aria-expanded={seccion === "productos"}
              aria-controls={`${prefijo}-productos`}
              onClick={() => alternarSeccion("productos")}
            >
              Productos
            </button>
            {panel(
              seccion === "productos",
              `${prefijo}-productos`,
              <ul className={estilos.lista}>
                {categorias.map((item) => {
                  const abiertaCategoria = categoria === item.slug;
                  const idSub = `${prefijo}-${item.slug}`;
                  return (
                    <li key={item.slug}>
                      <div className={estilos.fila}>
                        <Link href={item.path} className={estilos.enlace}>
                          {item.name}
                        </Link>
                        {item.subcategorias.length > 0 ? (
                          <button
                            type="button"
                            className={estilos.desplegar}
                            aria-expanded={abiertaCategoria}
                            aria-controls={idSub}
                            aria-label={`Subcategorías de ${item.name}`}
                            onClick={() => setCategoria(abiertaCategoria ? null : item.slug)}
                          />
                        ) : null}
                      </div>
                      {item.subcategorias.length > 0
                        ? panel(
                            abiertaCategoria,
                            idSub,
                            <ul className={`${estilos.lista} ${estilos.sublista}`}>
                              {item.subcategorias.map((sub) => (
                                <li key={sub.path}>
                                  <Link href={sub.path} className={estilos.enlace}>
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>,
                          )
                        : null}
                    </li>
                  );
                })}
              </ul>,
            )}
          </div>

          <div className={estilos.acordeon}>
            <button
              type="button"
              className={estilos.acordeonBoton}
              aria-expanded={seccion === "colecciones"}
              aria-controls={`${prefijo}-colecciones`}
              onClick={() => alternarSeccion("colecciones")}
            >
              Colecciones
            </button>
            {panel(
              seccion === "colecciones",
              `${prefijo}-colecciones`,
              <ul className={estilos.lista}>
                {colecciones.map((coleccion) => (
                  <li key={coleccion.path}>
                    <Link href={coleccion.path} className={estilos.enlace}>
                      {coleccion.name}
                    </Link>
                  </li>
                ))}
              </ul>,
            )}
          </div>

          <Link href="/catalogo/" className={estilos.boton}>
            Ver todo el catálogo
          </Link>

          <Link href="/venta-empresarial/" className={estilos.destacado}>
            Proyectos integrales <span aria-hidden="true">→</span>
          </Link>

          <div className={estilos.volumen}>
            <p className={estilos.volumenTexto}>
              ¿Compras por volumen? A partir de 10 piezas mejoramos precios y tiempos de entrega.
            </p>
            <button type="button" className={estilos.boton} onClick={onCotizar}>
              Cotizar por volumen
            </button>
          </div>

          <Link href="/blog/" className={estilos.destacado}>
            Recursos
          </Link>
        </nav>

        <button type="button" className={`${estilos.boton} ${estilos.contacto}`} onClick={onContacto}>
          Contáctanos
        </button>
      </div>
    </dialog>
  );
}
