// Punto de entrada: LEADS_SINK elige dónde se guarda el lead.

import { consoleSink } from "./console";
import { dbSink } from "./db";
import type { Lead, LeadsSink } from "./types";

function selectSink(): LeadsSink {
  // Sin definir o vacío se toma console, el valor por defecto del proyecto.
  const sink = process.env.LEADS_SINK?.trim() || "console";
  if (sink === "console") return consoleSink;
  if (sink === "db") return dbSink;
  throw new Error(`LEADS_SINK no reconocido: "${sink}". Valores válidos: console, db.`);
}

export const guardarLead = (lead: Lead) => selectSink().guardarLead(lead);

export type { Lead, LeadsSink };
