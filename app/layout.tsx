import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

// Offizielle Markenschrift von fritz-kola (lokal eingebunden).
// Wird fuer die Poster-Ueberschriften verwendet; Zahlenwerte laufen weiter
// ueber Archivo (tabellarische Ziffern).
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
