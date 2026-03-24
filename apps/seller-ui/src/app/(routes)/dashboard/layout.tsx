"use client";

import SidebarBarWrapper from "@/shared/components/sidebar/sidebar";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full bg-black min-h-screen">
      {/* ── Mobile top bar ────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-[300] flex items-center justify-between h-14 px-4 bg-black border-b border-slate-800 lg:hidden">
        <span className="text-white font-bold text-lg tracking-tight">Fish Studio</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-slate-400 hover:text-white p-1 transition active:scale-95"
          aria-label="Open navigation"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* ── Mobile overlay ────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[310] bg-black/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop: always visible | mobile: drawer) ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-[320] bg-black border-r border-slate-800
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:block lg:z-auto
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 text-slate-400 hover:text-white lg:hidden z-10"
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
        <SidebarBarWrapper onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
