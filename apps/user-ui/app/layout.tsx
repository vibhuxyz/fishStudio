import React from "react"
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fish Studio - Fresh Fish & Meat Marketplace",
  description:
    "Order freshly cut chicken, mutton, fish online. Delivered chilled and ready to cook. Premium quality, same day delivery.",
  keywords: [
    "fresh fish",
    "fresh meat",
    "online fish market",
    "buy fish online",
    "fresh seafood",
    "chicken delivery",
    "mutton delivery",
  ],
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <ModalProvider>{children}</ModalProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
