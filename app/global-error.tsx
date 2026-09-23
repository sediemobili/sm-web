"use client";

import { useEffect } from "react";
import estilos from "@/components/estado/estado.module.css";

// Error que tumba el layout: esta página trae su propio <html> y sus estilos mínimos,
// porque no puede apoyarse en el layout raíz.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="es-MX">
      <head>
        <meta name="robots" content="noindex, follow" />
        <title>Algo salió mal - Sedie &amp; Mobili</title>
      </head>
      <body>
        <main className={estilos.pagina}>
          <h1 className={estilos.titulo}>Algo salió mal</h1>
          <p className={estilos.texto}>
            No pudimos cargar el sitio. Puedes intentarlo de nuevo o volver al inicio.
          </p>
          <div className={estilos.acciones}>
            <button type="button" className="sm-boton" onClick={reset}>
              Intentar de nuevo
            </button>
            <a href="/" className="sm-boton sm-boton--secundario">
              Volver al inicio
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
