import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Albert_Sans, Archivo, Raleway } from "next/font/google";
import { SITE } from "@/lib/seo";
import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/patrones.css";

// Layout raíz propio de /social/, la página de enlaces de las redes: sin header, mega-menú,
// footer ni botón flotante de WhatsApp. Carga solo las fuentes, los tokens, el reset, los
// patrones (por .sm-boton) y GTM. Navegar entre este layout y el del sitio recarga la página.

// Las mismas fuentes que app/(sitio)/layout.tsx; next/font exige literales, así que se repiten.
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
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
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function SocialLayout({ children }: LayoutProps<"/social">) {
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
        {children}
      </body>
    </html>
  );
}
