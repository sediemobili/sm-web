"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ContactoModal } from "@/components/ContactoModal/ContactoModal";
import { useCotizacion } from "@/lib/cotizacion";
import estilos from "./Header.module.css";

type Enlace = { name: string; path: string };

type Props = {
  categorias: Enlace[];
  colecciones: Enlace[];
  catalogos: Enlace[];
};

type Columna = { titulo: string; enlaces: Enlace[]; verTodo?: Enlace };

export function HeaderNav({ categorias, colecciones, catalogos }: Props) {
  const [megaAbierto, setMegaAbierto] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);
  const [acordeon, setAcordeon] = useState<string | null>(null);
  const [contacto, setContacto] = useState(false);
  const megaId = useId();
  const movilId = useId();
  const botonProductos = useRef<HTMLButtonElement>(null);
  const botonContacto = useRef<HTMLButtonElement>(null);
  const botonHamburguesa = useRef<HTMLButtonElement>(null);
  const [contactoDesdeMovil, setContactoDesdeMovil] = useState(false);
  const { total } = useCotizacion();
  const [pegado, setPegado] = useState(false);

  const columnas: Columna[] = [
    { titulo: "Productos", enlaces: categorias, verTodo: { name: "↳ Ver Todo", path: "/catalogo/" } },
    { titulo: "Colecciones", enlaces: colecciones },
    { titulo: "Catálogos descargables", enlaces: catalogos },
  ];

  // El original releva la cabecera por otra más alta y fija tras unos 300px de scroll.
  useEffect(() => {
    const alDesplazar = () => setPegado(window.scrollY > 300);
    alDesplazar();
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => window.removeEventListener("scroll", alDesplazar);
  }, []);

  // Escape cierra lo que esté abierto y devuelve el foco al disparador.
  useEffect(() => {
    if (!megaAbierto && !menuMovil) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape") return;
      if (megaAbierto) {
        setMegaAbierto(false);
        botonProductos.current?.focus();
      }
      setMenuMovil(false);
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [megaAbierto, menuMovil]);

  // El menú móvil ocupa la pantalla: se bloquea el scroll del documento.
  useEffect(() => {
    document.documentElement.classList.toggle("is-scroll-locked", menuMovil);
    return () => document.documentElement.classList.remove("is-scroll-locked");
  }, [menuMovil]);

  return (
    <header className={estilos.header} data-pegado={pegado}>
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
        <div
          className={estilos.productos}
          data-open={megaAbierto}
          onMouseEnter={() => setMegaAbierto(true)}
          onMouseLeave={() => setMegaAbierto(false)}
          onBlur={(evento) => {
            if (!evento.currentTarget.contains(evento.relatedTarget)) setMegaAbierto(false);
          }}
        >
          <button
            ref={botonProductos}
            type="button"
            className={estilos.enlace}
            aria-expanded={megaAbierto}
            aria-controls={megaId}
            onClick={() => setMegaAbierto((abierto) => !abierto)}
          >
            Productos
          </button>

          <div id={megaId} className={estilos.mega} data-open={megaAbierto}>
            <div className={estilos.megaColumnas}>
              {columnas.map((columna) => (
                <section key={columna.titulo} className={estilos.columna} aria-label={columna.titulo}>
                  <span className={estilos.columnaTitulo}>{columna.titulo}</span>
                  <ul className={estilos.lista}>
                    {columna.enlaces.map((enlace) => (
                      <li key={enlace.path}>
                        <Link href={enlace.path} className={estilos.enlaceLista}>
                          {enlace.name}
                        </Link>
                      </li>
                    ))}
                    {columna.verTodo ? (
                      <li>
                        <Link href={columna.verTodo.path} className={estilos.verTodo}>
                          {columna.verTodo.name}
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>

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
          else botonContacto.current?.focus();
          setContactoDesdeMovil(false);
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

      <nav id={movilId} className={estilos.movil} data-open={menuMovil} aria-label="Menú móvil">
        {columnas.map((columna) => {
          const abierto = acordeon === columna.titulo;
          return (
            <div key={columna.titulo} className={estilos.acordeon} data-open={abierto}>
              <button
                type="button"
                className={estilos.acordeonBoton}
                aria-expanded={abierto}
                onClick={() => setAcordeon(abierto ? null : columna.titulo)}
              >
                {columna.titulo}
              </button>
              <ul className={estilos.acordeonLista}>
                {columna.enlaces.map((enlace) => (
                  <li key={enlace.path}>
                    <Link href={enlace.path} className={estilos.enlaceLista} onClick={() => setMenuMovil(false)}>
                      {enlace.name}
                    </Link>
                  </li>
                ))}
                {columna.verTodo ? (
                  <li>
                    <Link href={columna.verTodo.path} className={estilos.verTodo} onClick={() => setMenuMovil(false)}>
                      {columna.verTodo.name}
                    </Link>
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}

        <Link href="/blog/" className={estilos.acordeonBoton} onClick={() => setMenuMovil(false)}>
          Recursos
        </Link>

        <button
          type="button"
          className={`${estilos.contacto} ${estilos.contactoMovil}`}
          onClick={() => {
            setContactoDesdeMovil(true);
            setMenuMovil(false);
            setContacto(true);
          }}
        >
          Contáctanos
        </button>
      </nav>
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
