import type { Metadata } from "next";
import "./globals.css";
import { inter, cormorant } from "./fonts";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "LUXE MOTORS — Véhicules d'Exception",
  description: "La référence en véhicules hauts de gamme. Découvrez notre collection exclusive de supercars et de gran tourismo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${cormorant.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
