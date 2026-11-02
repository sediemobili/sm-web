import { sinWordPress } from "@/lib/jsonld";

// Inserta un bloque JSON-LD. El JSON se serializa con JSON.stringify, así que no hay
// comas colgantes; se escapan los caracteres que podrían cerrar la etiqueta. Antes se quita
// cualquier URL de sediemobili.com/wp-content/ (lib/jsonld.ts).
export function JsonLd({ datos }: { datos: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(sinWordPress(datos)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
