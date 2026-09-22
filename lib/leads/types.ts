// Contrato de guardado de leads. Hoy solo hay console; el día que exista la base,
// se implementa db y se cambia LEADS_SINK.

export type Lead = {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string | null;
  interes: string;
  mensaje: string | null;
  origen: string;
  creadoEn: string;
};

export type LeadsSink = {
  guardarLead(lead: Lead): Promise<void>;
};
