// Implementación con Postgres/Drizzle: la firma está lista, la tabla leads todavía no.

import type { LeadsSink } from "./types";

export const dbSink: LeadsSink = {
  async guardarLead() {
    throw new Error("LEADS_SINK=db todavía no está implementado: usa LEADS_SINK=console.");
  },
};
