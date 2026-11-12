import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Bowlby_One } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const bowlby = Bowlby_One({ weight: "400", subsets: ["latin"], variable: "--font-poster" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Beams · Menu",
  description: "The Beams Specialty Coffee menu, Tripoli. Hot or iced, your kind of coffee is always at Beams.",
};

export const viewport: Viewport = {
  themeColor: "#1b29eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${bowlby.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
