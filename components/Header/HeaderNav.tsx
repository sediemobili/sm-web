"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ContactoModal } from "@/components/ContactoModal/ContactoModal";
import { useCotizacion } from "@/lib/cotizacion";
import estilos from "./Header.module.css";
import { MegaProductos, type CategoriaMenu, type EnlaceMenu } from "./MegaProductos";
import { MenuMovil } from "./MenuMovil";

type Props = {
  colecciones: EnlaceMenu[];
  categoriasMenu: CategoriaMenu[];
};

export function HeaderNav({ colecciones, categoriasMenu }: Props) {
  const [menuMovil, setMenuMovil] = useState(false);
  const [contacto, setContacto] = useState(false);
  const movilId = useId();
  const botonProductos = useRef<HTMLButtonElement>(null);
  const botonContacto = useRef<HTMLButtonElement>(null);
  const botonHamburguesa = useRef<HTMLButtonElement>(null);
  const [contactoDesdeMovil, setContactoDesdeMovil] = useState(false);
  // "Cotizar por volumen" del mega-menú abre el mismo modal; al cerrarlo el foco vuelve a "Productos".
  const [contactoDesdeMega, setContactoDesdeMega] = useState(false);
  const { total } = useCotizacion();
  const [pegado, setPegado] = useState(false);
  const cabecera = useRef<HTMLElement>(null);
  // En la home el header va por dentro de la tarjeta del hero mientras el hero se ve.
  const enInicio = usePathname() === "/";
  const [heroPasado, setHeroPasado] = useState(false);

  // Tras unos 300px de scroll el header pasa a pegado: solo cambian el vidrio y la sombra.
  useEffect(() => {
    const alDesplazar = () => setPegado(window.scrollY > 300);
    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  // Separado del vidrio: el doble margen dura mientras el borde inferior del hero siga por
  // debajo del header. El margen superior del observador es fijo (el borde inferior del
  // header al montar), así que el cambio de margen no vuelve a disparar el cruce.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- al volver a la home se olvida el cruce anterior y el observador decide de nuevo con el hero de esta página.
    setHeroPasado(false);
    if (!enInicio) return;
    // El hero se marca con data-hero (components/Home/Hero.tsx). Sin él, margen normal.
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

  // Mientras el menú móvil está abierto, el fondo de la página no se desplaza.
  // Escape, el foco atrapado y el fondo inerte los da el diálogo modal (MenuMovil).
  useEffect(() => {
    document.documentElement.classList.toggle("is-scroll-locked", menuMovil);
    return () => document.documentElement.classList.remove("is-scroll-locked");
  }, [menuMovil]);

  const abrirContactoDesdeMovil = () => {
    setContactoDesdeMovil(true);
    setMenuMovil(false);
    setContacto(true);
  };

  return (
    <header ref={cabecera} className={estilos.header} data-pegado={pegado} data-sobre-hero={enInicio && !heroPasado}>
      <Link href="/" className={estilos.logo} aria-label="Sedie &amp; Mobili, ir al inicio">
        <Image
          src="/media/marca/sediemobili.svg"
          alt="Sedie &amp; Mobili"
          width={1750}
          height={323}
          sizes="200px"
          className={estilos.logoImagen}
        />
      </Link>

      <nav className={estilos.navegacion} aria-label="Principal">
        <MegaProductos
          colecciones={colecciones}
          categorias={categoriasMenu}
          claseBoton={estilos.enlace}
          refBoton={botonProductos}
          onCotizar={() => {
            setContactoDesdeMega(true);
            setContacto(true);
          }}
        />

        <Link href="/blog/" className={estilos.enlace}>
          Recursos
        </Link>
      </nav>

      {/* GET a /buscar/: funciona sin JavaScript. El evento search lo dispara esa página. */}
      <form className={estilos.buscador} role="search" action="/buscar/" method="get">
        <label htmlFor="buscador-header" className={estilos.etiquetaOculta}>
          Buscar en el sitio
        </label>
        <input id="buscador-header" type="search" name="q" className={estilos.campo} placeholder="Buscar" />
        <button type="submit" className={estilos.botonBuscar} aria-label="Buscar">
          <LupaIcono />
        </button>
      </form>

      {total > 0 ? (
        <Link href="/cotizacion/" className={estilos.cotizacion} aria-label={`Lista de cotización: ${total}`}>
          <ListaIcono />
          <span className={estilos.cotizacionTexto}>Cotización</span>
          <span className={estilos.contador}>{total}</span>
        </Link>
      ) : null}

      <button
        ref={botonContacto}
        type="button"
        className={estilos.contacto}
        onClick={() => setContacto(true)}
      >
        Contáctanos
      </button>

      <ContactoModal
        abierto={contacto}
        onCerrar={() => {
          setContacto(false);
          // El botón del menú móvil deja de ser enfocable al cerrarse el menú:
          // el foco vuelve a la hamburguesa, que siempre está visible.
          if (contactoDesdeMovil) botonHamburguesa.current?.focus();
          else if (contactoDesdeMega) botonProductos.current?.focus();
          else botonContacto.current?.focus();
          setContactoDesdeMovil(false);
          setContactoDesdeMega(false);
        }}
      />

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

function ListaIcono() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    </svg>
  );
}

function LupaIcono() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
    </svg>
  );
}
