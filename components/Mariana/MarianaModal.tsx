"use client";

import Link from "next/link";
import { startTransition, useActionState, useId, useLayoutEffect, useRef, useState } from "react";
import { validarMariana, type ErroresMariana } from "@/components/ContactoModal/esquema";
import { enviarEvento } from "@/lib/analytics";
import { enviarMariana } from "./acciones";
import { estadoInicialMariana, type EstadoMariana } from "./estado";
import { OjosMariana } from "./OjosMariana";
import estilos from "./Mariana.module.css";

type Props = {
  abierto: boolean;
  onCerrar: () => void;
};

const EJEMPLOS = [
  "Busco islas de trabajo para 20 personas",
  "Necesito sillas ergonómicas para oficina",
  "Quiero renovar la recepción de mi empresa",
] as const;

// Panel de Mariana. Es un diálogo modal, con la misma mecánica que el de búsqueda: el
// navegador atrapa el foco, deja inerte el resto y cierra con Escape. Todavía no responde
// nada por su cuenta: el mensaje se guarda como lead y lo contesta el equipo.
export function MarianaModal({ abierto, onCerrar }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  // Tras un envío correcto, la siguiente apertura empieza un formulario nuevo.
  const enviado = useRef(false);
  const [ronda, setRonda] = useState(0);

  useLayoutEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) {
      elemento.showModal();
      elemento.querySelector<HTMLElement>("textarea")?.focus();
    }
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  const cerrar = () => dialogo.current?.close();

  return (
    <dialog
      ref={dialogo}
      className={estilos.modal}
      aria-label="Mariana, asistente de Sedie"
      onClose={() => {
        if (enviado.current) {
          enviado.current = false;
          setRonda((previa) => previa + 1);
        }
        onCerrar();
      }}
      onClick={(evento) => {
        // Fuera del panel (el fondo) o al seguir un enlace, se cierra.
        if (evento.target === dialogo.current || (evento.target as HTMLElement).closest("a")) cerrar();
      }}
    >
      <div className={estilos.marco}>
        <div className={estilos.saludo}>
          <span className={estilos.marca}>
            <OjosMariana />
          </span>
          <p>
            Hola, soy Mariana, la asistente de Sedie &amp; Mobili. No soy una persona, pero puedo ayudarte a encontrar
            lo que necesitas y pasarte con el equipo.
          </p>
        </div>

        <Formulario key={ronda} onExito={() => (enviado.current = true)} />
      </div>
    </dialog>
  );
}

function Formulario({ onExito }: { onExito: () => void }) {
  const formulario = useRef<HTMLFormElement>(null);
  const confirmacion = useRef<HTMLDivElement>(null);
  const [texto, setTexto] = useState("");
  const [errores, setErrores] = useState<ErroresMariana>({});
  const id = useId();

  const [estado, accion, enviando] = useActionState(async (previo: EstadoMariana, formData: FormData) => {
    const resultado = await enviarMariana(previo, formData);
    setErrores(resultado.errores);
    if (resultado.estado === "exito") {
      // El evento se dispara solo cuando el lead ya se guardó, nunca antes.
      enviarEvento("generate_lead", { origen: "mariana" });
      onExito();
      // El formulario desaparece: el foco pasa a la confirmación para que se anuncie.
      requestAnimationFrame(() => confirmacion.current?.focus());
    }
    return resultado;
  }, estadoInicialMariana);

  const valores = () => (formulario.current ? Object.fromEntries(new FormData(formulario.current)) : {});

  const revalidar = (campo: keyof ErroresMariana) => {
    const { errores: nuevos } = validarMariana(valores());
    setErrores((previos) => ({ ...previos, [campo]: nuevos[campo] }));
  };

  // Un campo que sigue vacío no se marca al salir de él (cerrar el panel también lo deja):
  // eso lo avisa el envío.
  const alSalir = (campo: keyof ErroresMariana) => (evento: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (evento.target.value.trim() || errores[campo]) revalidar(campo);
  };

  // Un error se quita mientras se escribe, no al salir del campo: si se quitara al pulsar
  // "Enviar", el botón subiría bajo el cursor y el clic se perdería.
  const alEscribir = (campo: keyof ErroresMariana) => () => {
    if (errores[campo]) revalidar(campo);
  };

  // Sin action en el formulario: React lo vaciaría tras un error de validación del servidor.
  const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const { errores: nuevos } = validarMariana(valores());
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

  const campo = (nombre: keyof ErroresMariana) => ({
    id: `${id}-${nombre}`,
    name: nombre,
    required: true,
    onBlur: alSalir(nombre),
    onChange: alEscribir(nombre),
    "aria-invalid": errores[nombre] ? true : undefined,
    "aria-describedby": errores[nombre] ? `${id}-${nombre}-error` : undefined,
    className: estilos.campo,
  });

  const error = (nombre: keyof ErroresMariana) =>
    errores[nombre] ? (
      <p id={`${id}-${nombre}-error`} className={estilos.error}>
        {errores[nombre]}
      </p>
    ) : null;

  if (estado.estado === "exito") {
    return (
      <div ref={confirmacion} className={estilos.confirmacion} role="status" tabIndex={-1}>
        <p>Gracias. El equipo de Sedie &amp; Mobili te contesta en menos de 24 horas.</p>
        <Link href="/catalogo/" className={estilos.enlace}>
          Mientras tanto, mira el catálogo
        </Link>
      </div>
    );
  }

  return (
    <form ref={formulario} className={estilos.formulario} onSubmit={enviar} noValidate aria-busy={enviando}>
      <div className={estilos.grupo}>
        <label htmlFor={`${id}-mensaje`} className={estilos.pregunta}>
          Cuéntame qué necesitas para tu espacio.
        </label>
        <textarea
          rows={5}
          value={texto}
          {...campo("mensaje")}
          onChange={(evento) => {
            setTexto(evento.target.value);
            alEscribir("mensaje")();
          }}
          className={`${estilos.campo} ${estilos.mensaje}`}
        />
        {error("mensaje")}
      </div>

      {/* Ejemplos: rellenan el campo y devuelven el foco a él. */}
      <ul className={estilos.ejemplos} aria-label="Ejemplos">
        {EJEMPLOS.map((ejemplo) => (
          <li key={ejemplo}>
            <button
              type="button"
              className={estilos.ejemplo}
              onClick={() => {
                setTexto(ejemplo);
                setErrores((previos) => ({ ...previos, mensaje: undefined }));
                formulario.current?.querySelector<HTMLElement>("textarea")?.focus();
              }}
            >
              {ejemplo}
            </button>
          </li>
        ))}
      </ul>

      <div className={estilos.datos}>
        <div className={estilos.grupo}>
          <label htmlFor={`${id}-nombre`}>Nombre *</label>
          <input type="text" autoComplete="name" {...campo("nombre")} />
          {error("nombre")}
        </div>
        <div className={estilos.grupo}>
          <label htmlFor={`${id}-contacto`}>Correo o teléfono *</label>
          <input type="text" autoComplete="email" {...campo("contacto")} />
          {error("contacto")}
        </div>
      </div>

      {estado.estado === "error" && estado.mensaje ? (
        <p className={estilos.error} role="alert">
          {estado.mensaje}
        </p>
      ) : null}

      <button type="submit" className={estilos.enviar} disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
