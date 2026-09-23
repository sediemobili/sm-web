"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import estilos from "./home.module.css";

export type Diapositiva = {
  antetitulo: string;
  titulo: string;
  texto: string;
  cta: { label: string; href: string };
  medio: { tipo: "video"; src: string; poster: string } | { tipo: "imagen"; src: string };
  variante: "eugenia" | "zero" | "larus";
};

// El hero del original son tres diapositivas a sangre de 75vh con vídeo o imagen de fondo,
// que rotan solas cada 5 s (autoplay_speed del Swiper original).
const INTERVALO = 5000;

export function Hero({ diapositivas }: { diapositivas: Diapositiva[] }) {
  const [activa, setActiva] = useState(0);
  const [pausado, setPausado] = useState(false);
  const seccion = useRef<HTMLElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  const total = diapositivas.length;
  const mover = (paso: number) => setActiva((i) => (i + paso + total) % total);

  // Rotación automática. Se detiene con el cursor encima, con el foco dentro, al tocar
  // en móvil y si el sistema pide reducir movimiento.
  useEffect(() => {
    if (total < 2 || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const temporizador = window.setInterval(() => setActiva((i) => (i + 1) % total), INTERVALO);
    return () => window.clearInterval(temporizador);
  }, [total, pausado]);

  // Solo reproduce el vídeo de la diapositiva visible: los demás se pausan y se rebobinan.
  useEffect(() => {
    videos.current.forEach((video, indice) => {
      if (!video) return;
      if (indice === activa) void video.play().catch(() => undefined);
      else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activa]);

  if (total === 0) return null;

  return (
    <section
      ref={seccion}
      className={estilos.hero}
      aria-roledescription="carrusel"
      aria-label="Destacados"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setPausado(false);
      }}
      onTouchStart={() => setPausado(true)}
      onKeyDown={(evento) => {
        if (evento.key === "ArrowRight") mover(1);
        if (evento.key === "ArrowLeft") mover(-1);
      }}
    >
      {diapositivas.map((slide, indice) => (
        <article
          key={slide.titulo}
          className={estilos.slide}
          data-activa={indice === activa}
          data-variante={slide.variante}
          aria-roledescription="diapositiva"
          aria-label={`${indice + 1} de ${diapositivas.length}: ${slide.titulo}`}
        >
          {slide.medio.tipo === "video" ? (
            <video
              ref={(nodo) => {
                videos.current[indice] = nodo;
              }}
              className={estilos.slideMedio}
              src={slide.medio.src}
              poster={slide.medio.poster}
              autoPlay={indice === 0}
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
          ) : (
            <Image
              className={estilos.slideMedio}
              src={slide.medio.src}
              alt=""
              fill
              sizes="100vw"
              priority={indice === 0}
            />
          )}

          <div className={estilos.slideTexto}>
            <p className={estilos.slideAntetitulo}>{slide.antetitulo}</p>
            {indice === 0 ? (
              <h1 className={estilos.slideTitulo}>{slide.titulo}</h1>
            ) : (
              <p className={estilos.slideTitulo}>{slide.titulo}</p>
            )}
            <p className={estilos.slideParrafo}>{slide.texto}</p>
            <Link
              href={slide.cta.href}
              className={estilos.boton}
              tabIndex={indice === activa ? undefined : -1}
            >
              {slide.cta.label}
            </Link>
          </div>
        </article>
      ))}

      <button
        type="button"
        className={estilos.heroFlechaPrev}
        aria-label="Diapositiva anterior"
        onClick={() => mover(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className={estilos.heroFlechaNext}
        aria-label="Diapositiva siguiente"
        onClick={() => mover(1)}
      >
        ›
      </button>

      <div className={estilos.puntos} role="group" aria-label="Elegir diapositiva">
        {diapositivas.map((slide, indice) => (
          <button
            key={slide.titulo}
            type="button"
            className={estilos.punto}
            data-activa={indice === activa}
            aria-current={indice === activa}
            aria-label={`Ver ${slide.titulo}`}
            onClick={() => setActiva(indice)}
          />
        ))}
      </div>
    </section>
  );
}
