import type { Metadata } from "next";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/patrones.css";
import "./styles/interacciones.css";

export const metadata: Metadata = {
  title: "Sedie & Mobili",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
