import type { Metadata } from "next";

import "./globals.css";

import { EnvironmentBadge } from "@/components/environment-badge";
import { SidebarNav } from "@/components/sidebar-nav";
import { Providers } from "@/app/providers";
import { environment } from "@/lib/service-endpoints";

export const metadata: Metadata = {
  title: "FishStudio Engineering",
  description: "Live metrics for the FishStudio microservice platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen">
            <aside className="hidden w-56 shrink-0 border-r bg-card/50 p-4 lg:block">
              <div className="mb-6 px-2">
                <p className="text-sm font-semibold">FishStudio</p>
                <p className="text-xs text-muted-foreground">Engineering Control Center</p>
              </div>
              <SidebarNav />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
                <div className="lg:hidden">
                  <p className="text-sm font-semibold">FishStudio</p>
                </div>
                <div className="ml-auto">
                  <EnvironmentBadge environment={environment()} />
                </div>
              </header>

              <main className="min-w-0 flex-1 p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
