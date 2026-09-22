"use client";

import { useActionState } from "react";
import estilos from "./Newsletter.module.css";
import { estadoInicialNewsletter, suscribir } from "./acciones";

export function Newsletter() {
  const [estado, accion, enviando] = useActionState(suscribir, estadoInicialNewsletter);

  return (
    <section className={estilos.newsletter} aria-labelledby="newsletter">
      <div className={estilos.texto}>
        <h2 id="newsletter" className={estilos.titulo}>
          Entérate de todo, <span className={estilos.destacado}>antes que todos</span>
        </h2>
        <p>Suscríbete al newsletter.</p>
      </div>

      {estado.estado === "exito" ? (
        <p className={estilos.exito} role="status">
          {estado.mensaje}
        </p>
      ) : (
        <form action={accion} className={estilos.formulario} noValidate>
          <label htmlFor="newsletter-email" className={estilos.etiqueta}>
            Correo electrónico
          </label>
          <div className={estilos.campos}>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              className={estilos.campo}
              aria-invalid={estado.estado === "error" ? true : undefined}
              aria-describedby={estado.estado === "error" ? "newsletter-error" : undefined}
            />
            <button type="submit" className="sm-boton" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </div>
          {estado.estado === "error" ? (
            <p id="newsletter-error" className={estilos.error} role="alert">
              {estado.mensaje}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
