import estilos from "./Presentacion.module.css";

// Presentación de marca bajo el hero: isotipo decorativo y un párrafo grande. Sin encabezado:
// el texto es un párrafo y no cambia la jerarquía de la página.
export function Presentacion() {
  return (
    <section className={estilos.presentacion}>
      {/* Isotipo de public/media/marca/isotipo-06.svg, incrustado para pintarlo con el color del texto. */}
      <svg className={estilos.isotipo} viewBox="0 0 1080 1080" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M882.63,548.64v66.18c0,7.21-3.82,13.8-10.05,17.38l-220.11,127.12c-6.27,3.59-10.05,10.17-10.05,17.38v26.09c0,7.13,3.78,13.76,10.05,17.38l138.13,79.74c4.66,2.69,7.52,7.65,7.52,13.03v47.64c0,11.58-12.54,18.82-22.57,13.03l-162.42-93.76c-6.19-3.55-13.87-3.55-20.06,0l-161.04,93.03c-10.03,5.79-22.57-1.44-22.57-13.03v-47.71c0-5.37,2.87-10.34,7.52-13.03l139.86-80.76c6.23-3.55,10.05-10.21,10.05-17.34v-22.55c0-7.17-3.82-13.8-10.05-17.42l-137.73-79.5c-13.4-7.77-13.4-27.04,0-34.77l32.28-18.64c5.52-3.19,12.34-3.19,17.9,0l123.3,71.15c6.5,3.74,14.55,3.74,21.05,0l173.52-100.16c13.4-7.77,13.4-27.04,0-34.77l-173.99-100.48c-6.23-3.59-13.84-3.59-20.1,0l-265.44,153.26c-6.19,3.59-13.88,3.59-20.06,0l-57.31-33.07c-6.27-3.59-10.05-10.25-10.05-17.38v-299.57c0-7.21,3.78-13.8,10.05-17.38l271.47-156.68c6.19-3.67,13.84-3.67,20.06,0l41.15,23.72c8.78,5.06,14.19,14.43,14.19,24.56v142.73c0,7.77-4.45,14.78-11.43,18.17l-31.18,14.94c-13.36,6.43-28.81-3.27-28.81-18.09v-113.48c0-5.52-6.03-8.99-10.8-6.23l-187.51,108.28c-6.07,3.47-9.89,9.89-10.05,16.91l-4.89,203.71c-.43,15.65,16.52,25.74,30.12,17.86l250.5-144.62c6.27-3.63,13.88-3.63,20.1,0l259.41,149.75c6.23,3.59,10.05,10.25,10.05,17.38Z"
        />
      </svg>
      <p className={estilos.texto}>
        El éxito de su compañía comienza donde su equipo trabaja. Por eso, en Sedie Mobili llevamos más de 25 años
        fabricando las sillas y el mobiliario que sostienen ese trabajo: jornadas largas, equipos que crecen y espacios
        que cambian.
      </p>
    </section>
  );
}
