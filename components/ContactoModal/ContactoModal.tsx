"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { enviarEvento } from "@/lib/analytics";
import { enviarContacto, estadoInicial } from "./acciones";
import estilos from "./ContactoModal.module.css";
import { INTERESES, validarContacto, type ErroresContacto } from "./esquema";

type Props = {
  abierto: boolean;
  onCerrar: () => void;
};

const TEXTO =
  "¿Necesitas mobiliario ergonómico o corporativo? Cuéntanos qué buscas y te llamamos en menos de 24h " +
  "con las mejores opciones para tu oficina.";

export function ContactoModal({ abierto, onCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const [estado, accion, enviando] = useActionState(enviarContacto, estadoInicial);
  const [erroresCliente, setErroresCliente] = useState<ErroresContacto>({});
  const tituloId = useId();

  // showModal() da el modo modal del navegador: foco atrapado, inerte el resto y Escape nativo.
  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) elemento.showModal();
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-scroll-locked", abierto);
    return () => document.documentElement.classList.remove("is-scroll-locked");
  }, [abierto]);

  // El evento se dispara solo cuando el envío ya fue correcto, nunca antes.
  useEffect(() => {
    if (estado.estado !== "exito") return;
    enviarEvento("generate_lead", { origen: "modal-contacto", interes: estado.interes });
  }, [estado.estado, estado.interes]);

  const errores: ErroresContacto = { ...erroresCliente, ...estado.errores };

  // Mismo esquema que el servidor: el mensaje aparece al salir del campo.
  const validarCampo = (campo: keyof ErroresContacto) => () => {
    if (!formulario.current) return;
    const valores = Object.fromEntries(new FormData(formulario.current));
    const { errores: nuevos } = validarContacto(valores);
    setErroresCliente((previos) => ({ ...previos, [campo]: nuevos[campo] }));
  };

  const campo = (nombre: keyof ErroresContacto) => ({
    id: `contacto-${nombre}`,
    name: nombre,
    onBlur: validarCampo(nombre),
    "aria-invalid": errores[nombre] ? true : undefined,
    "aria-describedby": errores[nombre] ? `contacto-${nombre}-error` : undefined,
    className: estilos.campo,
  });

  const error = (nombre: keyof ErroresContacto) =>
    errores[nombre] ? (
      <p id={`contacto-${nombre}-error`} className={estilos.error}>
        {errores[nombre]}
      </p>
    ) : null;

  return (
    <dialog
      ref={dialogo}
      className={estilos.dialogo}
      aria-labelledby={tituloId}
      onClose={onCerrar}
      onClick={(evento) => {
        if (evento.target === dialogo.current) onCerrar();
      }}
    >
      <div className={estilos.contenido}>
        <button type="button" className={estilos.cerrar} aria-label="Cerrar" onClick={onCerrar}>
          ×
        </button>

        <h2 id={tituloId} className={estilos.titulo}>
          Contáctanos
        </h2>

        {estado.estado === "exito" ? (
          <p className={estilos.exito} role="status">
            {estado.mensaje}
          </p>
        ) : (
          <>
            <p className={estilos.texto}>{TEXTO}</p>

            <form ref={formulario} action={accion} className={estilos.formulario} noValidate>
              <div className={estilos.grupo}>
                <label htmlFor="contacto-nombre">Nombre *</label>
                <input type="text" required autoComplete="name" {...campo("nombre")} />
                {error("nombre")}
              </div>

              <div className={estilos.grupo}>
                <label htmlFor="contacto-email">Email *</label>
                <input type="email" required autoComplete="email" {...campo("email")} />
                {error("email")}
              </div>

              <div className={estilos.grupo}>
                <label htmlFor="contacto-telefono">Teléfono *</label>
                <input type="tel" required autoComplete="tel" {...campo("telefono")} />
                {error("telefono")}
              </div>

              <div className={estilos.grupo}>
                <label htmlFor="contacto-empresa">Empresa</label>
                <input type="text" autoComplete="organization" {...campo("empresa")} />
                {error("empresa")}
              </div>

              <div className={estilos.grupo}>
                <label htmlFor="contacto-interes">¿Qué estás buscando?</label>
                <select defaultValue={INTERESES[0]} {...campo("interes")}>
                  {INTERESES.map((interes) => (
                    <option key={interes} value={interes}>
                      {interes}
                    </option>
                  ))}
                </select>
                {error("interes")}
              </div>

              <div className={estilos.grupo}>
                <label htmlFor="contacto-mensaje">Mensaje</label>
                <textarea rows={4} {...campo("mensaje")} />
                {error("mensaje")}
              </div>

              {estado.estado === "error" && estado.mensaje ? (
                <p className={estilos.error} role="alert">
                  {estado.mensaje}
                </p>
              ) : null}

              <button type="submit" className={estilos.enviar} disabled={enviando}>
                {enviando ? "Enviando…" : "Enviar Solicitud"}
              </button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
