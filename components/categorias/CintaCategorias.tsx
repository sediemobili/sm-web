"use client";

import { Children, Fragment, useEffect, useRef, useState } from "react";
import home from "@/components/Home/Home.module.css";
import estilos from "./categorias.module.css";

// Tras desplazar a mano, la cinta espera esto antes de volver a moverse sola.
const ESPERA_TRAS_INTERACCION = 2000;

// Cinta de categorías que avanza sola a velocidad constante. Tras la tanda real van tantas
// copias como hagan falta para cubrir el ancho visible: al recorrer una vuelta completa se
// resta su ancho y el salto no se ve, por ancha que sea la pantalla.
// Es scroll nativo, así que el táctil, la rueda y las flechas siguen funcionando igual
// que en Carrusel; mientras se usan, el avance automático espera.
export function CintaCategorias({
  etiqueta,
  copia,
  children,
}: {
  etiqueta: string;
  copia: React.ReactNode;
  children: React.ReactNode;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const encima = useRef(false);
  const ultimaInteraccion = useRef(-Infinity);
  // Tarjetas reales (la primera tanda) y copias detrás. En el servidor, una copia.
  const reales = Children.count(children);
  const [copias, setCopias] = useState(1);

  // Copias necesarias para tener siempre por delante al menos el ancho visible de la cinta.
  // Se recalcula al cambiar el tamaño; quitar o poner copias detrás no mueve la posición.
  useEffect(() => {
    const nodo = lista.current;
    if (!nodo) return;
    const observador = new ResizeObserver(() => {
      const primera = nodo.children[0] as HTMLElement | undefined;
      const primeraCopia = nodo.children[reales] as HTMLElement | undefined;
      const vuelta = primera && primeraCopia ? primeraCopia.offsetLeft - primera.offsetLeft : 0;
      if (vuelta <= 0) return;
      const necesarias = Math.max(1, Math.ceil(nodo.clientWidth / vuelta));
      setCopias((actuales) => (actuales === necesarias ? actuales : necesarias));
    });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, [reales]);

  useEffect(() => {
    const nodo = lista.current;
    const caja = contenedor.current;
    if (!nodo || !caja) return;

    // La velocidad (px/s) vive en el módulo CSS, que la pone a 0 con prefers-reduced-motion.
    const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
    let velocidad = 0;
    const leerVelocidad = () => {
      velocidad = parseFloat(getComputedStyle(caja).getPropertyValue("--cinta-velocidad")) || 0;
    };
    leerVelocidad();
    movimientoReducido.addEventListener("change", leerVelocidad);

    let posicion = nodo.scrollLeft;
    let fijada = posicion;
    let anterior: number | null = null;
    let cuadro = 0;

    // Distancia entre la primera tarjeta y su primera copia: una vuelta completa de la cinta.
    const vuelta = () => {
      const primera = nodo.children[0] as HTMLElement | undefined;
      const primeraCopia = nodo.children[reales] as HTMLElement | undefined;
      return primera && primeraCopia ? primeraCopia.offsetLeft - primera.offsetLeft : 0;
    };

    const avanzar = (ahora: number) => {
      const delta = anterior === null ? 0 : Math.min(ahora - anterior, 100) / 1000;
      anterior = ahora;

      const enPausa =
        velocidad <= 0 ||
        encima.current ||
        nodo.matches(":focus-within") ||
        ahora - ultimaInteraccion.current < ESPERA_TRAS_INTERACCION;

      if (enPausa) {
        // Retoma desde donde esté la lista, sin reiniciar.
        posicion = nodo.scrollLeft;
      } else {
        posicion += velocidad * delta;
        const ancho = vuelta();
        if (ancho > 0 && posicion >= ancho) posicion -= ancho;
        fijada = posicion;
        nodo.scrollLeft = posicion;
      }
      cuadro = requestAnimationFrame(avanzar);
    };
    cuadro = requestAnimationFrame(avanzar);

    const interaccion = () => {
      ultimaInteraccion.current = performance.now();
    };
    // Un scroll que no viene del avance automático (barra, inercia, flechas) cuenta como manual.
    const desplazamiento = () => {
      if (Math.abs(nodo.scrollLeft - fijada) > 1) interaccion();
    };
    const opciones = { passive: true };
    nodo.addEventListener("wheel", interaccion, opciones);
    nodo.addEventListener("touchstart", interaccion, opciones);
    nodo.addEventListener("touchmove", interaccion, opciones);
    nodo.addEventListener("pointerdown", interaccion, opciones);
    nodo.addEventListener("scroll", desplazamiento, opciones);

    return () => {
      cancelAnimationFrame(cuadro);
      movimientoReducido.removeEventListener("change", leerVelocidad);
      nodo.removeEventListener("wheel", interaccion);
      nodo.removeEventListener("touchstart", interaccion);
      nodo.removeEventListener("touchmove", interaccion);
      nodo.removeEventListener("pointerdown", interaccion);
      nodo.removeEventListener("scroll", desplazamiento);
    };
  }, [reales]);

  const mover = (direccion: 1 | -1) => {
    const nodo = lista.current;
    if (!nodo) return;
    ultimaInteraccion.current = performance.now();
    nodo.scrollBy({ left: direccion * nodo.clientWidth * 0.8, behavior: "smooth" });
  };

  // Solo el ratón pausa al pasar por encima: en táctil el "hover" se queda pegado tras tocar.
  const alEntrar = (evento: React.PointerEvent) => {
    if (evento.pointerType === "mouse") encima.current = true;
  };
  const alSalir = () => {
    encima.current = false;
  };

  return (
    <div
      ref={contenedor}
      className={`${home.carrusel} ${estilos.cinta}`}
      onPointerEnter={alEntrar}
      onPointerLeave={alSalir}
    >
      <ul ref={lista} className={`${home.carruselLista} ${estilos.listaCategorias} ${estilos.cintaLista}`}>
        {children}
        {/* Las copias son la misma tanda repetida: mismas imágenes, que el navegador reutiliza. */}
        {Array.from({ length: copias }, (_, indice) => (
          <Fragment key={indice}>{copia}</Fragment>
        ))}
      </ul>
      <button type="button" className={home.flechaPrev} aria-label={`Anteriores de ${etiqueta}`} onClick={() => mover(-1)}>
        ‹
      </button>
      <button type="button" className={home.flechaNext} aria-label={`Siguientes de ${etiqueta}`} onClick={() => mover(1)}>
        ›
      </button>
    </div>
  );
}
