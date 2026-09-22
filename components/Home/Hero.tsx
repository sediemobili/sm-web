"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import estilos from "./Home.module.css";

export type Diapositiva = {
  antetitulo: string;
  titulo: string;
  texto: string;
  cta: { label: string; href: string };
  imagen: { src: string; alt: string } | null;
};

// Sin autoplay a propósito: evita mareos y que el contenido cambie mientras se lee.
export function Hero({ diapositivas }: { diapositivas: Diapositiva[] }) {
  const [activa, setActiva] = useState(0);
  const diapositiva = diapositivas[activa];
  if (!diapositiva) return null;

  const mover = (paso: number) => setActiva((indice) => (indice + paso + diapositivas.length) % diapositivas.length);

  return (
    <section
      className={estilos.hero}
      aria-roledescription="carrusel"
      aria-label="Destacados"
      onKeyDown={(evento) => {
        if (evento.key === "ArrowRight") mover(1);
        if (evento.key === "ArrowLeft") mover(-1);
      }}
    >
      {diapositivas.map((slide, indice) => (
        <div
          key={slide.titulo}
          className={estilos.diapositiva}
          data-activa={indice === activa}
          role="group"
          aria-roledescription="diapositiva"
          aria-label={`${indice + 1} de ${diapositivas.length}: ${slide.titulo}`}
        >
          {slide.imagen ? (
            <Image
              src={slide.imagen.src}
              alt={slide.imagen.alt}
              width={1200}
              height={800}
              priority={indice === 0}
              className={estilos.heroImagen}
            />
          ) : null}

          <div className={estilos.heroTexto}>
            <p className={estilos.antetitulo}>{slide.antetitulo}</p>
            {indice === 0 ? (
              <h1 className={estilos.heroTitulo}>{slide.titulo}</h1>
            ) : (
              <p className={estilos.heroTitulo}>{slide.titulo}</p>
            )}
            <p className={estilos.heroDescripcion}>{slide.texto}</p>
            <Link href={slide.cta.href} className="sm-boton" tabIndex={indice === activa ? undefined : -1}>
              {slide.cta.label}
            </Link>
          </div>
        </div>
      ))}

      <div className={estilos.puntos} role="tablist" aria-label="Diapositivas">
        {diapositivas.map((slide, indice) => (
          <button
            key={slide.titulo}
            type="button"
            role="tab"
            className={estilos.punto}
            data-activa={indice === activa}
            aria-selected={indice === activa}
            aria-label={`Ir a la diapositiva ${indice + 1}: ${slide.titulo}`}
            onClick={() => setActiva(indice)}
          />
        ))}
      </div>
    </section>
  );
}
