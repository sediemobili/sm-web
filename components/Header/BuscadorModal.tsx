"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { normalizar, terminos } from "@/lib/buscar";
import { ChispaIcono, LupaIcono } from "./iconos";
import type { EnlaceMenu, ProductoIndice } from "./tipos";
import estilos from "./BuscadorModal.module.css";

const MAXIMO = 8;

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  indice: ProductoIndice[];
  categorias: EnlaceMenu[];
  colecciones: EnlaceMenu[];
};

// La palabra buscada coincide con una palabra completa del texto, en singular o plural.
const palabraCompleta = (texto: string, palabra: string) =>
  texto
    .split(" ")
    .some((w) => w === palabra || w === `${palabra}s` || w === `${palabra}es` || palabra === `${w}s` || palabra === `${w}es`);

const rutaBusqueda = (consulta: string) => `/buscar/?q=${encodeURIComponent(consulta.trim())}`;

// Modal de búsqueda del header. Es un diálogo modal: el navegador atrapa el foco, deja inerte
// el resto y cierra con Escape. Los resultados en vivo salen del índice que llega del servidor
// (Header.tsx): al escribir no se pide nada. Enter en el campo envía el formulario a /buscar/.
export function BuscadorModal({ abierto, onCerrar, indice, categorias, colecciones }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const [consulta, setConsulta] = useState("");
  const router = useRouter();
  const id = useId();

  // Nombres normalizados una vez: "sillón" y "sillon" buscan lo mismo. Las claves (categorías y
  // colecciones) ya llegan normalizadas del servidor.
  const normalizados = useMemo(() => indice.map((producto) => normalizar(producto.nombre)), [indice]);

  // Cada palabra tiene que estar en el nombre o en las claves. El orden, de más a menos peso:
  //   1. palabras completas del nombre ("eugenia" en "Eugenia"),
  //   2. palabras completas de la categoría o colección, admitiendo plural ("mesa" en "Mesas"),
  //   3. dentro del nombre ("mesa" en "Mesabanco"),
  //   4. dentro de la categoría o colección.
  const palabras = useMemo(() => terminos(consulta), [consulta]);
  const resultados = useMemo(() => {
    if (palabras.length === 0) return [];
    const grupos: ProductoIndice[][] = [[], [], [], []];
    indice.forEach((producto, i) => {
      const nombre = normalizados[i];
      if (!palabras.every((palabra) => `${nombre} ${producto.claves}`.includes(palabra))) return;
      const enNombre = palabras.every((palabra) => nombre.includes(palabra));
      if (enNombre && palabras.every((palabra) => palabraCompleta(nombre, palabra))) grupos[0].push(producto);
      else if (palabras.every((palabra) => palabraCompleta(producto.claves, palabra))) grupos[1].push(producto);
      else if (enNombre) grupos[2].push(producto);
      else grupos[3].push(producto);
    });
    return grupos.flat().slice(0, MAXIMO);
  }, [palabras, indice, normalizados]);

  useLayoutEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) {
      setConsulta("");
      elemento.showModal();
      campo.current?.focus();
    }
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  const cerrar = () => dialogo.current?.close();

  // Abajo desde el campo entra en los resultados; arriba y abajo los recorren, y arriba desde
  // el primero vuelve al campo. Enter sobre un resultado lo abre (es un enlace).
  const enlaces = () => [...(lista.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
  const alTeclaCampo = (evento: React.KeyboardEvent) => {
    // En un campo de búsqueda con texto, Escape solo lo vaciaría: aquí cierra siempre.
    if (evento.key === "Escape") {
      evento.preventDefault();
      cerrar();
      return;
    }
    if (evento.key !== "ArrowDown") return;
    evento.preventDefault();
    enlaces()[0]?.focus();
  };
  const alTeclaResultado = (evento: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;
    evento.preventDefault();
    const todos = enlaces();
    const actual = todos.indexOf(evento.currentTarget);
    const siguiente = actual + (evento.key === "ArrowDown" ? 1 : -1);
    if (siguiente < 0) campo.current?.focus();
    else todos[Math.min(siguiente, todos.length - 1)]?.focus();
  };

  return (
    <dialog
      ref={dialogo}
      className={estilos.modal}
      aria-label="Buscar en el sitio"
      onClose={onCerrar}
      onClick={(evento) => {
        // Fuera del modal (el fondo) o al seguir un enlace, se cierra.
        if (evento.target === dialogo.current || (evento.target as HTMLElement).closest("a")) cerrar();
      }}
    >
      <div className={estilos.marco}>
        <form
          className={estilos.formulario}
          role="search"
          action="/buscar/"
          method="get"
          onSubmit={(evento) => {
            // Con JavaScript se navega sin recargar; sin él, el GET del formulario hace lo mismo.
            evento.preventDefault();
            if (!consulta.trim()) return;
            cerrar();
            router.push(rutaBusqueda(consulta));
          }}
        >
          <span className={estilos.lupa}>
            <LupaIcono />
          </span>
          <label htmlFor={`${id}-campo`} className="sm-oculto">
            Buscar en el sitio
          </label>
          <input
            ref={campo}
            id={`${id}-campo`}
            type="search"
            name="q"
            className={estilos.campo}
            placeholder="Buscar productos, categorías…"
            autoComplete="off"
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            onKeyDown={alTeclaCampo}
          />
          <span className={estilos.asistida}>
            <ChispaIcono />
          </span>
        </form>

        {/* Anuncia el número de resultados a los lectores de pantalla. */}
        <p className="sm-oculto" role="status">
          {palabras.length ? `${resultados.length} resultados` : ""}
        </p>

        {palabras.length === 0 ? (
          <div className={estilos.accesos}>
            <div className={estilos.grupo}>
              <span className={estilos.grupoTitulo}>Categorías</span>
              <ul className={estilos.pildoras}>
                {categorias.map((categoria) => (
                  <li key={categoria.path}>
                    <Link href={categoria.path} className={estilos.pildora}>
                      {categoria.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={estilos.grupo}>
              <span className={estilos.grupoTitulo}>Colecciones</span>
              <ul className={estilos.pildoras}>
                {colecciones.map((coleccion) => (
                  <li key={coleccion.path}>
                    <Link href={coleccion.path} className={estilos.pildora}>
                      {coleccion.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className={estilos.resultados}>
            {resultados.length > 0 ? (
              <ul ref={lista} className={estilos.lista}>
                {resultados.map((producto) => (
                  <li key={producto.slug}>
                    <Link href={`/product/${producto.slug}/`} className={estilos.resultado} onKeyDown={alTeclaResultado}>
                      <span className={estilos.miniatura}>
                        {producto.imagen ? (
                          <Image src={producto.imagen} alt="" width={50} height={50} sizes="50px" className={estilos.imagen} />
                        ) : null}
                      </span>
                      <span className={estilos.textoResultado}>
                        <span className={estilos.nombre}>{producto.nombre}</span>
                        {producto.categoria ? <span className={estilos.categoria}>{producto.categoria}</span> : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={estilos.vacio}>No encontramos productos con «{consulta.trim()}».</p>
            )}
            <Link href={rutaBusqueda(consulta)} className={estilos.todos}>
              Ver todos los resultados
            </Link>
          </div>
        )}
      </div>
    </dialog>
  );
}
