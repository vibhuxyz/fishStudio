"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  FileText,
  Gift,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Pencil,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { useAuth, logoutUser, deleteAccount } from "@/lib/auth-store";
import { useModals } from "@/components/providers/modal-provider";
import { toast } from "sonner";

type Row = { label: string; href: string; icon: React.ElementType };

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Orders & Activity",
    rows: [
      { label: "Order History", href: "/orders", icon: ShoppingBag },
      { label: "Wish List", href: "/wishlist", icon: Heart },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    title: "Payments & Rewards",
    rows: [
      { label: "Wallet", href: "/wallet", icon: Wallet },
      { label: "Refer & Earn", href: "/refer", icon: Gift },
    ],
  },
  {
    title: "Addresses",
    rows: [{ label: "Saved Addresses", href: "/addresses", icon: MapPin }],
  },
  {
    title: "Support",
    rows: [
      { label: "Help Centre", href: "/help", icon: HelpCircle },
      { label: "FAQs", href: "/faqs", icon: HelpCircle },
    ],
  },
  {
    title: "Legal",
    rows: [
      { label: "Privacy Policy", href: "/privacy", icon: ShieldCheck },
      { label: "Terms & Conditions", href: "/terms", icon: FileText },
    ],
  },
];

export default function AccountPage() {
  const { user, isLoggedIn } = useAuth();
  const modals = useModals();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isLoggedIn || !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <User className="h-12 w-12 text-primary" />
        <h1 className="text-xl font-bold text-foreground">My Account</h1>
        <p className="text-sm text-muted-foreground">
          Log in to view your profile, orders, addresses and more.
        </p>
        <button
          onClick={modals.openLogin}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Log in / Sign up
        </button>
      </div>
    );
  }

  const initial = (user.name || user.phone || "U").charAt(0).toUpperCase();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success("Your account has been deleted");
      router.push("/");
    } catch {
      toast.error("Could not delete account. Please try again.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-6 md:pb-10">
      <h1 className="mb-4 text-xl font-bold text-foreground md:text-2xl">
        My Account
      </h1>

      {/* Profile card */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-[#F8F8FA] p-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-foreground">
            {user.name || "Fish Studio Customer"}
          </p>
          {user.phone && (
            <p className="truncate text-sm text-muted-foreground">{user.phone}</p>
          )}
          {user.email && (
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
        <Link
          href="/account/edit"
          className="flex items-center gap-1.5 rounded-xl border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      {/* Menu groups */}
      <div className="space-y-5">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title}
            </p>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {group.rows.map((row, i) => {
                const Icon = row.icon;
                return (
                  <Link
                    key={row.label}
                    href={row.href}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 ${
                      i > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {row.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Account actions */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Account
          </p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <button
              onClick={() => logoutUser()}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
            >
              <LogOut className="h-5 w-5 text-foreground" />
              <span className="flex-1 text-sm font-medium text-foreground">
                Logout
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center gap-3 border-t border-border px-4 py-3.5 text-left transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5 text-red-600" />
              <span className="flex-1 text-sm font-medium text-red-600">
                Delete Account
              </span>
              <ChevronRight className="h-4 w-4 text-red-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleting && setConfirmDelete(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground">Delete account?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This permanently deletes your profile, saved addresses, wishlist
              and activity. This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
