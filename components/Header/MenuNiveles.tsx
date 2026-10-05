"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { NodoMenu } from "./tipos";
import estilos from "./MenuNiveles.module.css";

// Retardos del cursor: abrir no salta al cruzar de paso y cerrar perdona salidas breves.
const RETARDO_ABRIR = 150;
const RETARDO_CERRAR = 250;

type Props = {
  etiqueta: string;
  raiz: NodoMenu[];
  abierto: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
  claseBoton: string;
  // Lo que va al final de la primera columna (en Categorías, "Ver todo el catálogo").
  pie?: React.ReactNode;
};

// Menú por columnas progresivas: un panel anclado a la izquierda bajo el header que crece
// hacia la derecha. Pasar el cursor o enfocar un elemento con "+" abre su nivel siguiente;
// las columnas anteriores siguen a la vista con el elemento activo marcado. Solo existen en
// el DOM las columnas abiertas, así que lo que no se ve no se puede enfocar.
export function MenuNiveles({ etiqueta, raiz, abierto, onAbrir, onCerrar, claseBoton, pie }: Props) {
  // Índice del elemento activo en cada nivel.
  const [ruta, setRuta] = useState<number[]>([]);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);
  const panelId = useId();

  const abrir = () => {
    clearTimeout(temporizador.current);
    if (!abierto) setRuta([]);
    onAbrir();
  };

  const cerrar = () => {
    clearTimeout(temporizador.current);
    onCerrar();
  };

  const programar = (accion: () => void, retardo: number) => {
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(accion, retardo);
  };

  useEffect(() => () => clearTimeout(temporizador.current), []);

  // Escape cierra siempre y devuelve el foco al disparador; un clic fuera cierra sin moverlo.
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape") return;
      onCerrar();
      boton.current?.focus();
    };
    const alTocar = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) onCerrar();
    };
    document.addEventListener("keydown", alPulsar);
    document.addEventListener("pointerdown", alTocar);
    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.removeEventListener("pointerdown", alTocar);
    };
  }, [abierto, onCerrar]);

  const activar = (nivel: number, indice: number) =>
    setRuta((previa) => (previa[nivel] === indice && previa.length === nivel + 1 ? previa : [...previa.slice(0, nivel), indice]));

  // Arriba y abajo recorren la columna; el foco nuevo abre el nivel siguiente.
  const alTecla = (evento: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;
    evento.preventDefault();
    const enlaces = [...(evento.currentTarget.closest("ul")?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
    const actual = enlaces.indexOf(evento.currentTarget);
    const paso = evento.key === "ArrowDown" ? 1 : -1;
    enlaces[(actual + paso + enlaces.length) % enlaces.length]?.focus();
  };

  // Columnas visibles: la raíz y, por cada elemento activo con algo debajo, su nivel siguiente.
  const columnas: { titulo: string; nodos: NodoMenu[] }[] = [{ titulo: etiqueta, nodos: raiz }];
  let nivelActual = raiz;
  for (const indice of ruta) {
    const nodo = nivelActual[indice];
    if (!nodo?.hijos?.length) break;
    columnas.push({ titulo: nodo.name, nodos: nodo.hijos });
    nivelActual = nodo.hijos;
  }

  return (
    <>
      <div
        ref={contenedor}
        className={estilos.contenedor}
        onPointerEnter={(evento) => {
          if (evento.pointerType === "mouse") programar(abrir, RETARDO_ABRIR);
        }}
        onPointerLeave={(evento) => {
          if (evento.pointerType === "mouse") programar(cerrar, RETARDO_CERRAR);
        }}
        onBlur={(evento) => {
          if (abierto && !evento.currentTarget.contains(evento.relatedTarget)) cerrar();
        }}
      >
        <button
          ref={boton}
          type="button"
          className={claseBoton}
          aria-expanded={abierto}
          aria-controls={panelId}
          onClick={() => (abierto ? cerrar() : abrir())}
        >
          {etiqueta}
        </button>

        <div
          id={panelId}
          className={estilos.panel}
          data-open={abierto}
          onClick={(evento) => {
            // Al seguir un enlace, el menú se cierra.
            if ((evento.target as HTMLElement).closest("a")) cerrar();
          }}
        >
          {columnas.map((columna, nivel) => (
            <div key={`${nivel}-${columna.titulo}`} className={estilos.columna} role="group" aria-labelledby={`${panelId}-${nivel}`}>
              <span id={`${panelId}-${nivel}`} className={estilos.titulo}>
                {columna.titulo}
              </span>
              <ul className={estilos.lista}>
                {columna.nodos.map((nodo, indice) => {
                  const conHijos = Boolean(nodo.hijos?.length);
                  return (
                    <li key={nodo.path}>
                      <Link
                        href={nodo.path}
                        className={estilos.item}
                        data-activo={ruta[nivel] === indice && conHijos}
                        onPointerEnter={() => activar(nivel, indice)}
                        onFocus={() => activar(nivel, indice)}
                        onKeyDown={alTecla}
                      >
                        {nodo.name}
                        {conHijos ? (
                          <span className={estilos.mas} aria-hidden="true">
                            +
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {nivel === 0 && pie ? <div className={estilos.pie}>{pie}</div> : null}
            </div>
          ))}
        </div>
      </div>

      {/* Velo sobre el resto de la página: destaca el panel y un clic en él lo cierra. */}
      <div className={estilos.velo} data-open={abierto} aria-hidden="true" onClick={cerrar} />
    </>
  );
}

// Enlace destacado del pie de la primera columna; usa la clase del módulo.
export function EnlaceDestacado({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={estilos.destacado}>
      {children}
    </Link>
  );
}
