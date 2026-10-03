"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { validarWhatsApp, type ErroresWhatsApp } from "@/components/ContactoModal/esquema";
import { enviarEvento } from "@/lib/analytics";
import { contactarWhatsApp, estadoInicialWhatsApp, type EstadoWhatsApp } from "./acciones";
import estilos from "./WhatsApp.module.css";

// Botón flotante de WhatsApp. Antes de abrir el chat pide nombre y teléfono y los guarda como lead.
// El número sale de lib/sitio.ts.
export function BotonWhatsApp() {
  const [abierto, setAbierto] = useState(false);
  const [errores, setErrores] = useState<ErroresWhatsApp>({});
  const boton = useRef<HTMLButtonElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const panelId = useId();
  const tituloId = useId();

  const [estado, accion, enviando] = useActionState(async (previo: EstadoWhatsApp, formData: FormData) => {
    const resultado = await contactarWhatsApp(previo, formData);
    setErrores(resultado.errores);
    if (resultado.estado === "exito" && resultado.url) {
      // El evento se dispara solo cuando el lead ya se guardó, nunca antes.
      enviarEvento("generate_lead", { origen: "whatsapp" });
      window.location.assign(resultado.url);
    }
    return resultado;
  }, estadoInicialWhatsApp);

  // Al abrir, el foco entra al primer campo.
  useEffect(() => {
    if (abierto) formulario.current?.querySelector<HTMLElement>("input")?.focus();
  }, [abierto]);

  const cerrar = () => {
    setAbierto(false);
    boton.current?.focus();
  };

  const valores = () => (formulario.current ? Object.fromEntries(new FormData(formulario.current)) : {});

  const validarCampo = (campo: keyof ErroresWhatsApp) => () => {
    const { errores: nuevos } = validarWhatsApp(valores());
    setErrores((previos) => ({ ...previos, [campo]: nuevos[campo] }));
  };

  // Sin action en el formulario: React lo vaciaría tras un error de validación del servidor.
  const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const { errores: nuevos } = validarWhatsApp(valores());
    setErrores(nuevos);
    const primero = Object.keys(nuevos)[0];
    if (primero) {
      formulario.current?.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
      return;
    }
    if (!formulario.current) return;
    const formData = new FormData(formulario.current);
    startTransition(() => accion(formData));
  };

  const campo = (nombre: keyof ErroresWhatsApp) => ({
    id: `whatsapp-${nombre}`,
    name: nombre,
    required: true,
    onBlur: validarCampo(nombre),
    "aria-invalid": errores[nombre] ? true : undefined,
    "aria-describedby": errores[nombre] ? `whatsapp-${nombre}-error` : undefined,
    className: estilos.campo,
  });

  const error = (nombre: keyof ErroresWhatsApp) =>
    errores[nombre] ? (
      <p id={`whatsapp-${nombre}-error`} className={estilos.error}>
        {errores[nombre]}
      </p>
    ) : null;

  return (
    <div
      className={estilos.whatsapp}
      onKeyDown={(evento) => {
        if (evento.key === "Escape" && abierto) cerrar();
      }}
    >
      {abierto ? (
        <section id={panelId} className={estilos.panel} aria-labelledby={tituloId}>
          <h2 id={tituloId} className={estilos.titulo}>
            Escríbenos por WhatsApp
          </h2>
          <form ref={formulario} className={estilos.formulario} onSubmit={enviar} noValidate aria-busy={enviando}>
            <div className={estilos.grupo}>
              <label htmlFor="whatsapp-nombre">Nombre *</label>
              <input type="text" autoComplete="name" {...campo("nombre")} />
              {error("nombre")}
            </div>
            <div className={estilos.grupo}>
              <label htmlFor="whatsapp-telefono">Teléfono *</label>
              <input type="tel" autoComplete="tel" {...campo("telefono")} />
              {error("telefono")}
            </div>
            {estado.estado === "error" && estado.mensaje ? (
              <p className={estilos.error} role="alert">
                {estado.mensaje}
              </p>
            ) : null}
            <button type="submit" className={estilos.enviar} disabled={enviando}>
              {enviando ? "Abriendo…" : "Continuar en WhatsApp"}
            </button>
          </form>
        </section>
      ) : null}

      <button
        ref={boton}
        type="button"
        className={estilos.boton}
        aria-label={abierto ? "Cerrar WhatsApp" : "Escríbenos por WhatsApp"}
        aria-expanded={abierto}
        aria-controls={abierto ? panelId : undefined}
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      >
        {/* Burbuja en anillo (el hueco lo hace evenodd) y auricular sólido, todo relleno. */}
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path
            fillRule="evenodd"
            d="M12 2a10 10 0 1 1-5.03 18.65L2 22l1.38-4.87A10 10 0 0 1 12 2Zm0 1.7a8.3 8.3 0 1 0 0 16.6 8.3 8.3 0 0 0 0-16.6Z"
          />
          <path
            transform="translate(12 12) scale(0.42) translate(-12 -12)"
            d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"
          />
        </svg>
      </button>
    </div>
  );
}
