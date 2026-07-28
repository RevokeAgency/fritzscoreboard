import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Alle Schriften werden lokal eingebunden (self-hosted). Damit ist der Build
// unabhaengig von externen Font-CDNs und laeuft deterministisch, u. a. auf Vercel.

// Archivo 800 – ausschliesslich fuer Zahlen-/Datenwerte (tabellarische Ziffern).
const archivo = localFont({
  src: "./fonts/Archivo-800.woff2",
  weight: "800",
  variable: "--font-archivo",
  display: "swap",
});

// Inter – Fliesstext und Bedienoberflaeche.
const inter = localFont({
  src: "./fonts/Inter.woff2",
  weight: "100 700",
  variable: "--font-inter",
  display: "swap",
});

// Offizielle Markenschrift von fritz-kola – ausschliesslich fuer Ueberschriften.
const fritz = localFont({
  src: "./fonts/FritzKolaInternational.ttf",
  variable: "--font-fritz",
  display: "swap",
});

export const metadata: Metadata = {
  title: "fritz-kola Scoreboard",
  description:
    "Bewertung von Neulistungen und Kundenverlusten im Gastro-Aussendienst",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${archivo.variable} ${inter.variable} ${fritz.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
