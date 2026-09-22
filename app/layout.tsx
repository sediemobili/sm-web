import type { Metadata } from "next";
import { Albert_Sans, Archivo, Raleway } from "next/font/google";
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
  title: "Sedie & Mobili",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${raleway.variable} ${albertSans.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
