import React from "react";
import type { Metadata, Viewport } from "next";
// 1. Import Poppins from next/font/google
import { Playfair_Display, Inter, Poppins } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

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

// 2. Configure the Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 3. Add the poppins variable to the className
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${poppins.variable}`}
    >
      <body className="font-sans antialiased">
        <QueryProvider>
          <ModalProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1">{children}</div>
              <SiteFooter />
            </div>
          </ModalProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
