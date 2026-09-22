// Inserta un bloque JSON-LD. El JSON se serializa con JSON.stringify, así que no hay
// comas colgantes; se escapan los caracteres que podrían cerrar la etiqueta.
export function JsonLd({ datos }: { datos: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(datos).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
