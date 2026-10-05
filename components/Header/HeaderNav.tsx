"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ContactoModal } from "@/components/ContactoModal/ContactoModal";
import { useCotizacion } from "@/lib/cotizacion";
import { BuscadorModal } from "./BuscadorModal";
import estilos from "./Header.module.css";
import { ChispaIcono, CotizacionIcono, LupaIcono } from "./iconos";
import { EnlaceDestacado, MenuNiveles } from "./MenuNiveles";
import { MenuMovil } from "./MenuMovil";
import { TextoTecleado } from "./TextoTecleado";
import type { CategoriaMenu, EnlaceMenu, NodoMenu, ProductoIndice } from "./tipos";

type Props = {
  colecciones: EnlaceMenu[];
  categoriasMenu: CategoriaMenu[];
  coleccionesNiveles: NodoMenu[];
  categoriasNiveles: NodoMenu[];
  indice: ProductoIndice[];
};

type MenuAbierto = "colecciones" | "categorias" | null;

// Ejemplos que se escriben solos en el botón de buscar.
const FRASES_BUSCADOR = [
  "Busco escritorios y mesas para mis nuevas oficinas…",
  "Necesito 20 sillas ergonómicas para mi equipo…",
  "Quiero renovar la recepción de mi empresa…",
  "Busco mobiliario para una sala de juntas de 12 personas…",
] as const;

export function HeaderNav({ colecciones, categoriasMenu, coleccionesNiveles, categoriasNiveles, indice }: Props) {
  const [menuMovil, setMenuMovil] = useState(false);
  const [buscador, setBuscador] = useState(false);
  const botonBuscar = useRef<HTMLAnchorElement>(null);
  const [contacto, setContacto] = useState(false);
  // Solo un panel de la fila 2 abierto a la vez: abrir uno cierra el otro.
  const [menu, setMenu] = useState<MenuAbierto>(null);
  const cerrarMenu = useCallback((cual: MenuAbierto) => setMenu((actual) => (actual === cual ? null : actual)), []);
  const cerrarColecciones = useCallback(() => cerrarMenu("colecciones"), [cerrarMenu]);
  const cerrarCategorias = useCallback(() => cerrarMenu("categorias"), [cerrarMenu]);
  const movilId = useId();
  const botonContacto = useRef<HTMLButtonElement>(null);
  const botonHamburguesa = useRef<HTMLButtonElement>(null);
  // Al cerrar el modal de contacto, el foco vuelve a quien lo abrió.
  const retornoFoco = useRef<HTMLElement | null>(null);
  const { piezas, productos: distintos } = useCotizacion();
  const cabecera = useRef<HTMLElement>(null);
  // En la home el header va transparente sobre el hero mientras el hero se ve.
  const enInicio = usePathname() === "/";
  const [heroPasado, setHeroPasado] = useState(false);

  // El header es transparente mientras el borde inferior del hero siga por debajo de él. El
  // margen superior del observador es fijo (el borde inferior del header al montar).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- al volver a la home se olvida el cruce anterior y el observador decide de nuevo con el hero de esta página.
    setHeroPasado(false);
    if (!enInicio) return;
    // El hero se marca con data-hero (components/Home/Hero.tsx). Sin él, estado sólido.
    const hero = document.querySelector("[data-hero]");
    const header = cabecera.current;
    if (!hero || !header) {
      setHeroPasado(true);
      return;
    }
    const borde = Math.round(header.getBoundingClientRect().bottom);
    const observador = new IntersectionObserver(
      ([entrada]) => setHeroPasado(!entrada.isIntersecting && entrada.boundingClientRect.bottom < borde),
      { rootMargin: `-${borde}px 0px 0px 0px` },
    );
    observador.observe(hero);
    return () => observador.disconnect();
  }, [enInicio]);

  // Mientras el menú móvil o el buscador están abiertos, el fondo de la página no se desplaza.
  // Escape, el foco atrapado y el fondo inerte los dan sus diálogos modales.
  const bloqueado = menuMovil || buscador;
  useEffect(() => {
    document.documentElement.classList.toggle("is-scroll-locked", bloqueado);
    return () => document.documentElement.classList.remove("is-scroll-locked");
  }, [bloqueado]);

  // Atajo "/" para abrir el buscador desde cualquier parte, salvo si se está escribiendo.
  useEffect(() => {
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key !== "/" || evento.ctrlKey || evento.metaKey || evento.altKey) return;
      const objetivo = evento.target as HTMLElement;
      if (objetivo.closest("input, textarea, select, [contenteditable='true']") || document.querySelector("dialog[open]")) return;
      evento.preventDefault();
      setBuscador(true);
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, []);

  const abrirContacto = (origen: HTMLElement | null) => {
    retornoFoco.current = origen;
    setContacto(true);
  };

  const abrirContactoDesdeMovil = () => {
    setMenuMovil(false);
    abrirContacto(botonHamburguesa.current);
  };

  const transparente = enInicio && !heroPasado;

  return (
    <header ref={cabecera} className={estilos.header} data-estado={transparente ? "transparente" : "solido"}>
      <div className={`${estilos.fila} ${estilos.filaPrincipal}`}>
        <Link href="/" className={estilos.logo} aria-label="Sedie &amp; Mobili, ir al inicio">
          <Image
            src={transparente ? "/media/marca/sediemobili_white.svg" : "/media/marca/sediemobili.svg"}
            alt="Sedie &amp; Mobili"
            width={1750}
            height={323}
            sizes="200px"
            className={estilos.logoImagen}
          />
        </Link>

        <div className={estilos.acciones}>
          {/* Sin JavaScript es un enlace a /buscar/; con él abre el modal de búsqueda. El texto
              que se escribe solo es decorativo: el nombre accesible es "Buscar". */}
          <Link
            ref={botonBuscar}
            href="/buscar/"
            role="button"
            aria-haspopup="dialog"
            aria-label="Buscar"
            className={estilos.buscador}
            onClick={(evento) => {
              evento.preventDefault();
              setBuscador(true);
            }}
            onKeyDown={(evento) => {
              if (evento.key !== " ") return;
              evento.preventDefault();
              setBuscador(true);
            }}
          >
            <LupaIcono />
            <TextoTecleado frases={FRASES_BUSCADOR} className={estilos.tecleado} />
            {/* Insignia de la búsqueda asistida por IA, montada en la esquina: solo visual. */}
            <span className={estilos.insignia} aria-hidden="true">
              <ChispaIcono />
            </span>
          </Link>

          {/* Siempre visible para que se sepa que existe; con productos lleva el número de piezas. */}
          <Link
            href="/cotizacion/"
            className={estilos.cotizacion}
            aria-label={
              piezas === 0
                ? "Mi Cotización: vacía"
                : `Mi Cotización: ${piezas} ${piezas === 1 ? "pieza" : "piezas"} de ${distintos} ${distintos === 1 ? "producto" : "productos"}`
            }
          >
            <CotizacionIcono />
            {piezas > 0 ? <span className={estilos.contador}>{piezas}</span> : null}
            {/* Tooltip visual; el nombre accesible ya lo da aria-label. */}
            <span className={estilos.tooltip} aria-hidden="true">
              Mi Cotización
            </span>
          </Link>

          <button
            ref={botonContacto}
            type="button"
            className={estilos.contacto}
            onClick={() => abrirContacto(botonContacto.current)}
          >
            Contáctanos
          </button>

          <button
            ref={botonHamburguesa}
            type="button"
            className={estilos.hamburguesa}
            aria-expanded={menuMovil}
            aria-controls={movilId}
            aria-label={menuMovil ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuMovil((abierto) => !abierto)}
          >
            <span className={estilos.hamburguesaLinea} aria-hidden="true" />
            <span className={estilos.hamburguesaLinea} aria-hidden="true" />
            <span className={estilos.hamburguesaLinea} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={`${estilos.fila} ${estilos.filaNavegacion}`}>
        <nav className={estilos.navegacion} aria-label="Principal">
          <MenuNiveles
            etiqueta="Colecciones"
            raiz={coleccionesNiveles}
            abierto={menu === "colecciones"}
            onAbrir={() => setMenu("colecciones")}
            onCerrar={cerrarColecciones}
            claseBoton={estilos.enlace}
          />

          <MenuNiveles
            etiqueta="Categorías"
            raiz={categoriasNiveles}
            abierto={menu === "categorias"}
            onAbrir={() => setMenu("categorias")}
            onCerrar={cerrarCategorias}
            claseBoton={estilos.enlace}
            pie={<EnlaceDestacado href="/catalogo/">Ver todo el catálogo</EnlaceDestacado>}
          />

          <Link href="/blog/" className={estilos.enlace}>
            Recursos
          </Link>

          {/* Píldora delineada al final de la navegación: se lee como acción comercial. */}
          <Link href="/venta-empresarial/" className={estilos.aviso}>
            Venta empresarial · Proyectos a medida
          </Link>
        </nav>

      </div>

      <ContactoModal
        abierto={contacto}
        onCerrar={() => {
          setContacto(false);
          retornoFoco.current?.focus();
          retornoFoco.current = null;
        }}
      />

      <BuscadorModal
        abierto={buscador}
        onCerrar={() => {
          setBuscador(false);
          botonBuscar.current?.focus();
        }}
        indice={indice}
        categorias={categoriasMenu}
        colecciones={colecciones}
      />

      <MenuMovil
        id={movilId}
        abierto={menuMovil}
        colecciones={colecciones}
        categorias={categoriasMenu}
        onCerrar={() => {
          setMenuMovil(false);
          // Si se cerró para abrir el modal de contacto, la hamburguesa está inerte y esto no hace nada.
          botonHamburguesa.current?.focus();
        }}
        onCotizar={abrirContactoDesdeMovil}
        onContacto={abrirContactoDesdeMovil}
      />
    </header>
  );
}
