"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  MapPin,
  FileText,
  Gift,
  HelpCircle,
  ShieldCheck,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, logoutUser } from "@/lib/auth-store";
import { useModals } from "@/components/providers/modal-provider";

// Mock QR code (base64 small data URI placeholder)
const QR_MOCK = "https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://fishstudio.app/download&bgcolor=ffffff";

const MENU_ITEMS = [
  { label: "My Orders", icon: ShoppingBag, href: "/orders" },
  { label: "Saved Addresses", icon: MapPin, href: "/addresses" },
  { label: "FAQ's", icon: HelpCircle, href: "/faqs" },
  { label: "Account Privacy", icon: ShieldCheck, href: "/privacy" },
] as const;

interface UserProfileDropdownProps {
  onAddressClick?: () => void;
}

export function UserProfileDropdown({ onAddressClick }: UserProfileDropdownProps) {
  const { user, isLoggedIn } = useAuth();
  const modals = useModals();
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!hydrated) return null;

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        onClick={modals.openLogin}
      >
        <User className="h-5 w-5" />
        <span className="hidden md:inline">Log in/Sign up</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
        onClick={() => setOpen(!open)}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden max-w-[80px] truncate md:block">{user?.name?.split(" ")[0] ?? "Account"}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            {/* Close button */}
            <button
              type="button"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-secondary"
              onClick={() => setOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* User info */}
            <div className="flex items-center gap-3 px-5 pb-4 pt-5">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-foreground">{user?.name ?? "My Account"}</p>
                {user?.phone && (
                  <p className="text-xs text-muted-foreground">+91 {user.phone}</p>
                )}
                {user?.email && (
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Menu items */}
            <nav className="py-1">
              {MENU_ITEMS.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 px-5 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}

              <div className="h-px bg-border" />

              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                onClick={() => {
                  setOpen(false);
                  logoutUser();
                }}
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </nav>

            {/* QR Code footer */}
            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={QR_MOCK}
                  alt="Download Fish Studio App QR Code"
                  className="h-16 w-16 flex-shrink-0 rounded-lg"
                  crossOrigin="anonymous"
                />
                <div>
                  <p className="font-semibold leading-snug text-foreground">
                    Simple way to get groceries
                  </p>
                  <p className="font-semibold leading-snug text-offer-green">
                    at your doorstep
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Scan the QR code and download Fish Studio app
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
