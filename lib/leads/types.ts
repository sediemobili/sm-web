// Contrato de guardado de leads. Hoy solo hay console; el día que exista la base,
// se implementa db y se cambia LEADS_SINK.

// Cada origen pide campos distintos (el newsletter solo email, WhatsApp solo nombre y
// teléfono), así que todo lo que no sea origen es opcional.
export type Lead = {
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  empresa: string | null;
  interes: string | null;
  mensaje: string | null;
  origen: "modal-contacto" | "newsletter" | "cotizacion" | "whatsapp";
  // Respuestas del asistente del modal de contacto; null en los demás orígenes.
  destino: string | null;
  categorias: string[] | null;
  volumen: string | null;
  plazo: string | null;
  // Renglones de la lista de cotización; null en los demás orígenes.
  renglones: { slug: string; variacionId: number | null; cantidad: number }[] | null;
  creadoEn: string;
};

export type LeadsSink = {
  guardarLead(lead: Lead): Promise<void>;
};
