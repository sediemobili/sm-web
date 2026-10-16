// Datos públicos y fijos de la empresa. Única fuente: el footer, el JSON-LD (Organization y
// LocalBusiness), el SEO y el botón de WhatsApp los leen de aquí. Para añadir una sede basta
// con sumarla a SEDES; ningún componente cambia.
//
// PROVISIONALES (marcados también abajo con "PROVISIONAL"):
// - Sede Monterrey, `localidad`: "test city" es un error heredado de WordPress que se copia tal
//   cual hasta que se corrija en origen.
// - Correos por sede: el sitio actual no los publica en ninguna parte, así que no hay ninguno.
//   El campo existe para cuando lleguen.

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
  // Sin datos en el sitio actual: se omite mientras esté vacío. El teléfono y el horario no van
  // por sede: son los de TELEFONO, que atiende a todas.
  correos?: string[];
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

// Número único de Sedie: lada de país (52) y número, solo dígitos. Es a la vez el teléfono y el
// WhatsApp; si cambia, se cambia solo aquí.
const NUMERO = "525584210902";

// Teléfono del sitio: un conmutador de CloudTalk, sin extensiones, que atiende a las dos sedes.
export const TELEFONO = {
  // Para el enlace tel: y el JSON-LD.
  marcar: `+${NUMERO}`,
  // "+52 55 8421 0902": lada de país, lada de ciudad y el número en dos grupos de cuatro.
  visible: `+${NUMERO.slice(0, 2)} ${NUMERO.slice(2, 4)} ${NUMERO.slice(4, 8)} ${NUMERO.slice(8)}`,
  horario: {
    texto: "Lunes a viernes, 9:00 a 18:00",
    // Para schema.org (OpeningHoursSpecification y openingHours).
    dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    abre: "09:00",
    cierra: "18:00",
    corto: "Mo-Fr 09:00-18:00",
  },
} as const;

// Número de WhatsApp en formato de wa.me: el mismo número, sin "+".
export const WHATSAPP = NUMERO;

// Avisos de leads por correo (LEADS_SINK=resend). El remitente sale del subdominio verificado
// en la cuenta de Resend de Sedie. El newsletter no avisa aquí: va a los contactos de Resend.
export const AVISOS_LEADS = {
  remitente: "Sedie & Mobili <no-reply@mail.sediemobili.com>",
  para: ["ventas1mx@ergocomp.com", "ventas2mx@ergocomp.com", "egarza@ergocomp.com", "eduardodlg92@gmail.com"],
  copia: ["hola@scndal.com", "michel.l@scndal.com", "andrea.r@scndal.com", "andrea.m@scndal.com"],
};
