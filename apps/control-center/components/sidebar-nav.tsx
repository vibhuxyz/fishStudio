"use client";

import {
  Activity,
  AlertTriangle,
  BellRing,
  Gauge,
  LayoutDashboard,
  ScrollText,
  Server,
  Target,
  Waypoints,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/traffic", label: "Live Traffic", icon: Activity },
  { href: "/performance", label: "Performance", icon: Gauge },
  { href: "/services", label: "Services", icon: Server },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/errors", label: "Errors", icon: AlertTriangle },
  { href: "/traces", label: "Traces", icon: Waypoints },
  { href: "/slo", label: "SLOs", icon: Target },
  { href: "/alerts", label: "Alerts", icon: BellRing },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {LINKS.map(({ href, label, icon: Icon }) => {
        // "/" would otherwise prefix-match every route.
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
