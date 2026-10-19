"use client";

import Link from "next/link";
import { useEffect } from "react";
import estilos from "@/components/estado/estado.module.css";

// Error dentro del layout. Al usuario no se le enseña el detalle técnico: va al log.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[error]", error);
  }, [error]);

  return (
    <main className={estilos.pagina}>
      <meta name="robots" content="noindex, follow" />

      <h1 className={estilos.titulo}>Algo salió mal</h1>
      <p className={estilos.texto}>
        No pudimos cargar esta página. Puedes intentarlo de nuevo o volver al inicio; si vuelve a
        pasar, escríbenos y lo revisamos.
      </p>

      <div className={estilos.acciones}>
        <button type="button" className="sm-boton" onClick={reset}>
          Intentar de nuevo
        </button>
        <Link href="/" className="sm-boton sm-boton--secundario">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
