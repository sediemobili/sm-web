// Implementación de hoy: el lead queda en el log del servidor.

import type { Lead, LeadsSink } from "./types";

export const consoleSink: LeadsSink = {
  async guardarLead(lead: Lead) {
    console.info("[lead]", JSON.stringify(lead));
  },
};
