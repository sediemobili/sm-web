// Implementación con Resend: avisa por correo a ventas de cada lead y manda los suscriptores del
// newsletter a los contactos de Resend. Usa la API REST directamente, sin SDK.
//
// El correo nunca hace fallar el formulario: el lead se escribe primero en el log del servidor
// (así no se pierde aunque Resend falle) y cualquier error del envío se registra y se traga.

import { headers } from "next/headers";
import { ETIQUETAS_DESTINO, type Destino } from "@/components/ContactoModal/esquema";
import { getProductBySlug } from "@/lib/data";
import { SITE } from "@/lib/seo";
import { AVISOS_LEADS } from "@/lib/sitio";
import type { Lead, LeadsSink } from "./types";

const API = "https://api.resend.com";

export const resendSink: LeadsSink = {
  async guardarLead(lead: Lead) {
    console.info("[lead]", JSON.stringify(lead));
    try {
      if (lead.origen === "newsletter") await crearContacto(lead);
      else await enviarAviso(lead, await paginaDeOrigen());
    } catch (error) {
      console.error(`[lead] Resend falló (${lead.origen}); el lead queda solo en este log`, error);
    }
  },
};

async function llamar(ruta: string, cuerpo: unknown) {
  const clave = process.env.RESEND_API_KEY?.trim();
  if (!clave) throw new Error("Falta RESEND_API_KEY.");
  const respuesta = await fetch(`${API}${ruta}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  if (!respuesta.ok) throw new Error(`Resend ${ruta} respondió ${respuesta.status}: ${await respuesta.text()}`);
}

// Newsletter: el suscriptor entra a los contactos de Resend y, si está definido, al segmento.
async function crearContacto(lead: Lead) {
  if (!lead.email) throw new Error("Suscripción sin correo.");
  const segmento = process.env.RESEND_SEGMENT_ID?.trim();
  await llamar("/contacts", {
    email: lead.email,
    unsubscribed: false,
    ...(segmento ? { segments: [{ id: segmento }] } : {}),
  });
}

// La Server Action llega como POST a la página donde está el formulario: el Referer es esa página.
async function paginaDeOrigen() {
  try {
    return (await headers()).get("referer");
  } catch {
    return null;
  }
}

// Aviso a ventas ------------------------------------------------------------------

const ORIGENES: Record<Exclude<Lead["origen"], "newsletter">, string> = {
  cotizacion: "Solicitud de cotización",
  "modal-contacto": "Formulario de contacto",
  "venta-empresarial": "Formulario de contacto (Venta empresarial)",
  whatsapp: "Botón de WhatsApp",
  mariana: "Asistente Mariana",
};

type Fila = [etiqueta: string, valor: string | null, enlace?: string];
type Renglon = { producto: string; variante: string | null; cantidad: number; url: string | null };

async function enviarAviso(lead: Lead, pagina: string | null) {
  const origen = ORIGENES[lead.origen as keyof typeof ORIGENES];
  const quien = [lead.nombre, lead.empresa].filter(Boolean).join(" · ") || "sin nombre";

  const contacto: Fila[] = [
    ["Nombre", lead.nombre],
    ["Correo", lead.email, lead.email ? `mailto:${lead.email}` : undefined],
    ["Teléfono", lead.telefono, lead.telefono ? `tel:${lead.telefono.replace(/[^\d+]/g, "")}` : undefined],
    ["Empresa", lead.empresa],
  ];
  const respuestas: Fila[] = [
    ["Es para", lead.destino ? (ETIQUETAS_DESTINO[lead.destino as Destino] ?? lead.destino) : null],
    ["Qué busca", lead.categorias?.join(", ") || lead.interes],
    ["Para cuántas personas", lead.volumen],
    ["Para cuándo", lead.plazo],
    ["Mensaje", lead.mensaje],
  ];
  const envio: Fila[] = [
    ["Fecha", fecha(lead.creadoEn)],
    ["Página", pagina, pagina ?? undefined],
  ];
  const renglones = lead.renglones ? await describirRenglones(lead.renglones) : null;

  await llamar("/emails", {
    from: AVISOS_LEADS.remitente,
    to: AVISOS_LEADS.para,
    cc: AVISOS_LEADS.copia,
    ...(lead.email ? { reply_to: lead.email } : {}),
    subject: `${origen}: ${quien}`,
    html: html(origen, contacto, respuestas, renglones, envio),
    text: texto(origen, contacto, respuestas, renglones, envio),
  });
}

async function describirRenglones(renglones: NonNullable<Lead["renglones"]>): Promise<Renglon[]> {
  return Promise.all(
    renglones.map(async ({ slug, variacionId, cantidad }) => {
      const producto = await getProductBySlug(slug).catch(() => null);
      const variacion = producto?.variations.find((v) => v.id === variacionId);
      return {
        producto: producto?.name ?? slug,
        variante: variacion ? Object.values(variacion.attributes).join(" · ") || null : null,
        cantidad,
        url: producto ? new URL(producto.path, SITE).toString() : null,
      };
    }),
  );
}

const fecha = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short", timeZone: "America/Mexico_City" }).format(
    new Date(iso),
  ) + " (hora del centro de México)";

const llenas = (filas: Fila[]) => filas.filter(([, valor]) => valor);
const piezas = (renglones: Renglon[]) => renglones.reduce((suma, r) => suma + r.cantidad, 0);

// HTML de correo: estilos en línea y tablas, que es lo que respetan los clientes de correo.
const escapar = (valor: string) =>
  valor.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function html(origen: string, contacto: Fila[], respuestas: Fila[], renglones: Renglon[] | null, envio: Fila[]) {
  const celda = 'style="padding:6px 12px 6px 0;vertical-align:top;text-align:left"';
  const seccion = (titulo: string, contenido: string) =>
    `<h2 style="font-size:16px;margin:24px 0 8px">${escapar(titulo)}</h2>${contenido}`;
  const tabla = (filas: Fila[]) =>
    `<table style="border-collapse:collapse">${llenas(filas)
      .map(([etiqueta, valor, enlace]) => {
        const contenido = escapar(valor!).replace(/\n/g, "<br>");
        const dato = enlace ? `<a href="${escapar(enlace)}">${contenido}</a>` : contenido;
        return `<tr><th ${celda}>${escapar(etiqueta)}</th><td ${celda}>${dato}</td></tr>`;
      })
      .join("")}</table>`;

  const partes = [seccion("Contacto", tabla(contacto))];
  if (llenas(respuestas).length) partes.push(seccion("Lo que respondió", tabla(respuestas)));
  if (renglones) {
    const filas = renglones
      .map((r) => {
        const nombre = r.url ? `<a href="${escapar(r.url)}">${escapar(r.producto)}</a>` : escapar(r.producto);
        return `<tr><td ${celda}>${nombre}</td><td ${celda}>${escapar(r.variante ?? "—")}</td><td ${celda}>${r.cantidad}</td></tr>`;
      })
      .join("");
    partes.push(
      seccion(
        "Productos",
        `<table style="border-collapse:collapse"><tr><th ${celda}>Producto</th><th ${celda}>Variante</th><th ${celda}>Cantidad</th></tr>${filas}<tr><th ${celda} colspan="2">Total de piezas</th><th ${celda}>${piezas(renglones)}</th></tr></table>`,
      ),
    );
  }
  partes.push(seccion("Envío", tabla(envio)));

  return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5"><h1 style="font-size:20px;margin:0 0 8px">${escapar(origen)}</h1>${partes.join("")}</div>`;
}

function texto(origen: string, contacto: Fila[], respuestas: Fila[], renglones: Renglon[] | null, envio: Fila[]) {
  const bloque = (titulo: string, filas: Fila[]) =>
    [titulo.toUpperCase(), ...llenas(filas).map(([etiqueta, valor]) => `${etiqueta}: ${valor}`)].join("\n");

  const partes = [origen, bloque("Contacto", contacto)];
  if (llenas(respuestas).length) partes.push(bloque("Lo que respondió", respuestas));
  if (renglones) {
    partes.push(
      [
        "PRODUCTOS",
        ...renglones.map((r) => `- ${r.cantidad} × ${r.producto}${r.variante ? ` (${r.variante})` : ""}`),
        `Total de piezas: ${piezas(renglones)}`,
      ].join("\n"),
    );
  }
  partes.push(bloque("Envío", envio));
  return partes.join("\n\n");
}
