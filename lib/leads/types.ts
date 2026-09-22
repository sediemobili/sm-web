// Contrato de guardado de leads. Hoy solo hay console; el día que exista la base,
// se implementa db y se cambia LEADS_SINK.

// El newsletter solo pide email, así que todo lo que no sea email ni origen es opcional.
export type Lead = {
  nombre: string | null;
  email: string;
  telefono: string | null;
  empresa: string | null;
  interes: string | null;
  mensaje: string | null;
  origen: "modal-contacto" | "newsletter";
  creadoEn: string;
};

export type LeadsSink = {
  guardarLead(lead: Lead): Promise<void>;
};
