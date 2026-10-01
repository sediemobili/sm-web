"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { enviarEvento } from "@/lib/analytics";
import { enviarContacto, estadoInicial, type EstadoContacto } from "./acciones";
import estilos from "./ContactoModal.module.css";
import {
  CATEGORIAS,
  DESTINOS,
  ETIQUETAS_DESTINO,
  leerAsistente,
  pasosPara,
  pideEmpresa,
  pidePlazo,
  pideVolumen,
  PLAZOS,
  validarPaso,
  VOLUMENES,
  type CampoAsistente,
  type Destino,
  type ErroresAsistente,
  type Paso,
} from "./esquema";
import { ICONOS_DESTINO } from "./iconos";

const TITULOS: Record<Paso, string> = {
  destino: "¿Para dónde es?",
  categorias: "¿Qué estás buscando?",
  detalles: "Detalles",
  datos: "Tus datos",
};

const CONTROLES = "input:not([type='hidden']), button, select, textarea";

type Props = {
  // El foco solo se mueve con el modal abierto.
  activo: boolean;
  onExito: () => void;
};

// Asistente de 4 pasos del modal de contacto. Todos los pasos viven en el mismo formulario
// y los que no tocan se ocultan con hidden, así el envío final lleva todas las respuestas.
export function Asistente({ activo, onExito }: Props) {
  const formulario = useRef<HTMLFormElement>(null);
  const [destino, setDestino] = useState<Destino | null>(null);
  const [indice, setIndice] = useState(0);
  const [errores, setErrores] = useState<ErroresAsistente>({});
  // Sube cada vez que un intento de avanzar o enviar falla, para llevar el foco al error.
  const [intento, setIntento] = useState(0);

  const pasos = pasosPara(destino);
  const paso = pasos[Math.min(indice, pasos.length - 1)];

  const [estado, accion, enviando] = useActionState(
    async (previo: EstadoContacto, formData: FormData) => {
      const resultado = await enviarContacto(previo, formData);
      if (resultado.estado === "exito") {
        // El evento se dispara solo cuando el envío ya fue correcto, nunca antes.
        enviarEvento("generate_lead", {
          origen: "modal-contacto",
          destino: resultado.destino,
          interes: resultado.interes,
        });
        onExito();
      }
      if (resultado.estado === "error") {
        setErrores(resultado.errores);
        setIntento((previo) => previo + 1);
        if (resultado.paso) setIndice(pasosPara(destino).indexOf(resultado.paso));
      }
      return resultado;
    },
    estadoInicial,
  );

  // Al cambiar de paso o fallar un intento, el foco va al primer campo con error o al primer control.
  useEffect(() => {
    if (!activo) return;
    const contenedor = formulario.current?.querySelector<HTMLElement>(`[data-paso="${paso}"]`);
    const destinoFoco =
      contenedor?.querySelector<HTMLElement>("[aria-invalid='true']") ??
      contenedor?.querySelector<HTMLElement>(CONTROLES);
    destinoFoco?.focus();
  }, [activo, paso, intento]);

  const valores = () => (formulario.current ? leerAsistente(new FormData(formulario.current)) : {});

  const avanzar = () => {
    const nuevos = validarPaso(paso, valores());
    setErrores(nuevos);
    if (Object.keys(nuevos).length === 0) setIndice(indice + 1);
    else setIntento(intento + 1);
  };

  const regresar = () => {
    setErrores({});
    setIndice(indice - 1);
  };

  const elegirDestino = (elegido: Destino) => {
    setDestino(elegido);
    setErrores({});
    setIndice(1);
  };

  const limpiar = (campo: CampoAsistente) => () => {
    if (errores[campo]) setErrores((previos) => ({ ...previos, [campo]: undefined }));
  };

  // En "Tus datos" el mensaje aparece al salir del campo, con el mismo esquema que el servidor.
  const validarCampo = (campo: CampoAsistente) => () => {
    const nuevos = validarPaso("datos", valores());
    setErrores((previos) => ({ ...previos, [campo]: nuevos[campo] }));
  };

  // El formulario no usa action: React lo vaciaría tras cada envío y se perderían los pasos.
  const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    // Enter en un paso intermedio avanza en vez de enviar.
    if (paso !== "datos") return avanzar();
    const nuevos = validarPaso("datos", valores());
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return setIntento(intento + 1);
    if (!formulario.current) return;
    const formData = new FormData(formulario.current);
    startTransition(() => accion(formData));
  };

  const descrito = (campo: CampoAsistente) => (errores[campo] ? `contacto-${campo}-error` : undefined);

  const error = (campo: CampoAsistente) =>
    errores[campo] ? (
      <p id={`contacto-${campo}-error`} className={estilos.error}>
        {errores[campo]}
      </p>
    ) : null;

  const campo = (nombre: CampoAsistente) => ({
    id: `contacto-${nombre}`,
    name: nombre,
    onBlur: validarCampo(nombre),
    "aria-invalid": errores[nombre] ? true : undefined,
    "aria-describedby": descrito(nombre),
    className: estilos.campo,
  });

  const opciones = (nombre: "volumen" | "plazo", lista: readonly string[], titulo: string) => (
    <fieldset className={estilos.pregunta} aria-describedby={descrito(nombre)}>
      <legend className={estilos.subtitulo}>{titulo}</legend>
      <div className={estilos.chips}>
        {lista.map((valor) => (
          <label key={valor} className={estilos.chip}>
            <input
              type="radio"
              name={nombre}
              value={valor}
              className={estilos.marca}
              onChange={limpiar(nombre)}
              aria-invalid={errores[nombre] ? true : undefined}
            />
            {valor}
          </label>
        ))}
      </div>
      {error(nombre)}
    </fieldset>
  );

  if (estado.estado === "exito") {
    return (
      <p className={estilos.exito} role="status">
        {estado.mensaje}
      </p>
    );
  }

  const numero = indice + 1;

  return (
    <form ref={formulario} className={estilos.formulario} onSubmit={enviar} noValidate aria-busy={enviando}>
      <div className={estilos.progreso}>
        <p role="status" className={estilos.contador}>
          Paso {numero} de {pasos.length}
          <span className="sm-oculto">: {TITULOS[paso]}</span>
        </p>
        <div className={estilos.barra} aria-hidden="true">
          <span style={{ "--avance": numero / pasos.length } as React.CSSProperties} />
        </div>
      </div>

      <input type="hidden" name="destino" value={destino ?? ""} />

      <fieldset data-paso="destino" hidden={paso !== "destino"} aria-describedby={descrito("destino")}>
        <legend className={estilos.tituloPaso}>{TITULOS.destino}</legend>
        <div className={estilos.tarjetas}>
          {DESTINOS.map((opcion) => {
            const Icono = ICONOS_DESTINO[opcion];
            return (
              <button
                key={opcion}
                type="button"
                className={estilos.tarjeta}
                aria-pressed={destino === opcion}
                onClick={() => elegirDestino(opcion)}
              >
                <Icono />
                {ETIQUETAS_DESTINO[opcion]}
              </button>
            );
          })}
        </div>
        {error("destino")}
      </fieldset>

      <fieldset data-paso="categorias" hidden={paso !== "categorias"} aria-describedby={descrito("categorias")}>
        <legend className={estilos.tituloPaso}>{TITULOS.categorias}</legend>
        <p className={estilos.ayuda}>Elige una o varias opciones.</p>
        <div className={estilos.chips}>
          {CATEGORIAS.map((categoria) => (
            <label key={categoria} className={estilos.chip}>
              <input
                type="checkbox"
                name="categorias"
                value={categoria}
                className={estilos.marca}
                onChange={limpiar("categorias")}
                aria-invalid={errores.categorias ? true : undefined}
              />
              {categoria}
            </label>
          ))}
        </div>
        {error("categorias")}
      </fieldset>

      {pidePlazo(destino) ? (
        <fieldset data-paso="detalles" hidden={paso !== "detalles"}>
          <legend className={estilos.tituloPaso}>{TITULOS.detalles}</legend>
          {pideVolumen(destino) ? opciones("volumen", VOLUMENES, "¿Para cuántas personas?") : null}
          {opciones("plazo", PLAZOS, "¿Para cuándo?")}
        </fieldset>
      ) : null}

      <fieldset data-paso="datos" hidden={paso !== "datos"}>
        <legend className={estilos.tituloPaso}>{TITULOS.datos}</legend>
        <div className={estilos.campos}>
          <div className={estilos.grupo}>
            <label htmlFor="contacto-nombre">Nombre *</label>
            <input type="text" required autoComplete="name" {...campo("nombre")} />
            {error("nombre")}
          </div>

          <div className={estilos.grupo}>
            <label htmlFor="contacto-telefono">Teléfono *</label>
            <input type="tel" required autoComplete="tel" {...campo("telefono")} />
            {error("telefono")}
          </div>

          <div className={estilos.grupo}>
            <label htmlFor="contacto-email">Correo *</label>
            <input type="email" required autoComplete="email" {...campo("email")} />
            {error("email")}
          </div>

          {pideEmpresa(destino) ? (
            <div className={estilos.grupo}>
              <label htmlFor="contacto-empresa">Empresa</label>
              <input type="text" autoComplete="organization" {...campo("empresa")} />
              {error("empresa")}
            </div>
          ) : null}

          <div className={`${estilos.grupo} ${estilos.ancho}`}>
            <label htmlFor="contacto-mensaje">Mensaje (opcional)</label>
            <textarea rows={3} {...campo("mensaje")} />
            {error("mensaje")}
          </div>
        </div>
      </fieldset>

      {estado.estado === "error" && estado.mensaje && paso === "datos" ? (
        <p className={estilos.error} role="alert">
          {estado.mensaje}
        </p>
      ) : null}

      <div className={estilos.navegacion}>
        {indice > 0 ? (
          <button type="button" className={estilos.regresar} onClick={regresar}>
            Regresar
          </button>
        ) : null}
        {paso === "datos" ? (
          <button type="submit" className={estilos.siguiente} disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar Solicitud"}
          </button>
        ) : paso !== "destino" ? (
          <button type="submit" className={estilos.siguiente}>
            Siguiente
          </button>
        ) : null}
      </div>
    </form>
  );
}
