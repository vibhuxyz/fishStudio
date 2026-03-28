import React from "react";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AnnouncementProvider } from "@/components/providers/announcement-provider";
import { AnnouncementTopBar } from "@/components/layout/announcement-top-bar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fish Studio - Fresh Fish Marketplace",
  description:
    "Order freshly fish online. Delivered chilled and ready to cook. Premium quality, same day delivery.",
  metadataBase: new URL("https://fishstudio.in"), // Assuming the production URL
  keywords: [
    "fresh fish",
    "fresh meat",
    "online fish market",
    "buy fish online",
    "fresh seafood",
    "chicken delivery",
    "mutton delivery",
    "fish studio",
  ],

  openGraph: {
    title: "Fish Studio - Fresh Fish Marketplace",
    description:
      "Order freshly cut fish online. Delivered chilled and ready to cook.",
    url: "https://fishstudio.in",
    siteName: "Fish Studio",
    type: "website",
    images: [
      {
        url: "/og-image.png", // Or .svg if available
        width: 1200,
        height: 630,
        alt: "Fish Studio - Fresh Fish & Meat Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fish Studio - Fresh Fish & Meat Marketplace",
    description:
      "Order freshly cut chicken, mutton, fish online. Delivered chilled and ready to cook.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ModalProvider>
              <AnnouncementProvider hasContent={false}>
                <AnnouncementTopBar />
                <div className="flex min-h-screen flex-col">
                  <SiteHeader />
                  <div className="flex-1">{children}</div>
                  <SiteFooter />
                </div>
              </AnnouncementProvider>
            </ModalProvider>
          </QueryProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
