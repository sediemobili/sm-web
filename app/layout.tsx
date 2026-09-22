import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Albert_Sans, Archivo, Raleway } from "next/font/google";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { JsonLd } from "@/components/Seo/JsonLd";
import { CotizacionProvider } from "@/lib/cotizacion";
import { organizacion } from "@/lib/jsonld";
import { NOMBRE, SITE } from "@/lib/seo";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/patrones.css";
import "./styles/interacciones.css";

// Los pesos son los que usa el sitio actual; Inter, Roboto y Roboto Slab quedaron fuera.
// next/font exige que los argumentos sean literales, así que se repiten en cada llamada.
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
});

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: NOMBRE, template: `%s - ${NOMBRE}` },
  description:
    "Fabricante de mobiliario para oficina y sillería profesional con sedes en Monterrey y Ciudad de México.",
  icons: { icon: "/favicon.ico" },
  // Canonical de la home; cada página define el suyo.
  alternates: { canonical: "/" },
  openGraph: {
    siteName: NOMBRE,
    locale: "es_MX",
    type: "website",
    url: `${SITE}/`,
  },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${raleway.variable} ${albertSans.variable} ${archivo.variable}`}>
      {/* Sin NEXT_PUBLIC_GTM_ID no se carga nada. */}
      {GTM_ID ? <GoogleTagManager gtmId={GTM_ID} /> : null}
      <body>
        {GTM_ID ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <JsonLd datos={organizacion()} />
        <CotizacionProvider>
          <Header />
          {children}
          <Footer />
        </CotizacionProvider>
      </body>
    </html>
  );
}
