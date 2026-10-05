// Datos públicos y fijos de la empresa. Única fuente: el footer, el JSON-LD (Organization y
// LocalBusiness), el SEO y el botón de WhatsApp los leen de aquí. Para añadir una sede basta
// con sumarla a SEDES; ningún componente cambia.
//
// PROVISIONALES (marcados también abajo con "PROVISIONAL"):
// - WHATSAPP: número de ejemplo; falta el real de Sedie.
// - Sede Monterrey, `localidad`: "test city" es un error heredado de WordPress que se copia tal
//   cual hasta que se corrija en origen.
// - Teléfonos, correos y horarios: el sitio actual no los publica en ninguna parte, así que no
//   hay ninguno. Los campos existen para cuando lleguen.

export const EMPRESA = {
  nombre: "Sedie & Mobili",
  pais: "MX",
} as const;

export type Sede = {
  // Identificador estable: forma el @id del JSON-LD (`/#monterrey`).
  slug: string;
  ciudad: string;
  calle: string;
  cp: string;
  localidad: string;
  region: string;
  // Sin datos en el sitio actual: se omiten mientras estén vacíos.
  telefonos?: string[];
  correos?: string[];
  horario?: string;
};

export const SEDES: Sede[] = [
  {
    slug: "monterrey",
    ciudad: "Monterrey",
    calle: "Prol. Ruiz Cortinez 2941",
    cp: "67113",
    // PROVISIONAL: error heredado de WordPress, se copia tal cual.
    localidad: "test city",
    region: "N.L.",
  },
  {
    slug: "cdmx",
    ciudad: "Ciudad de México",
    calle: "Calle Pte. 128 787-B7, Industrial Vallejo, Azcapotzalco",
    cp: "02300",
    localidad: "Ciudad de México",
    region: "CDMX",
  },
];

export type Red = "facebook" | "instagram" | "youtube" | "tiktok" | "linkedin";

// En el orden en que aparecen en el footer.
export const REDES: { red: Red; nombre: string; url: string }[] = [
  { red: "facebook", nombre: "Facebook", url: "https://www.facebook.com/people/Sedie-Mobili/61581781496052/" },
  { red: "instagram", nombre: "Instagram", url: "https://www.instagram.com/sediemobili/" },
  { red: "youtube", nombre: "YouTube", url: "https://www.youtube.com/@SedieMobili" },
  { red: "tiktok", nombre: "TikTok", url: "https://www.tiktok.com/@sedie.mobili" },
  { red: "linkedin", nombre: "LinkedIn", url: "https://www.linkedin.com/company/sedie-mobili-mexico" },
];

// Número de WhatsApp en formato de wa.me: lada de país y número, solo dígitos y sin "+".
// PROVISIONAL: valor de ejemplo. Falta el número real de Sedie.
export const WHATSAPP = "520000000000";
