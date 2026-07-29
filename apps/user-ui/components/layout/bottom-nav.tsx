"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useModals } from "@/components/providers/modal-provider";
import { isUserLoggedIn } from "@/lib/auth-store";

// Mobile-only fixed bottom navigation (hidden on md+). Mirrors the app's
// primary destinations: Home, Categories, Search, Cart, Account.
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const modals = useModals();
  const { totalItems } = useCart();

  // Hide on flows where a bottom bar gets in the way.
  if (pathname?.startsWith("/checkout")) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const itemClass = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
      active ? "text-primary" : "text-muted-foreground"
    }`;

  const handleAccount = () => {
    if (isUserLoggedIn()) router.push("/account");
    else modals.openLogin();
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="flex h-14 items-stretch">
        <Link href="/" className={itemClass(isActive("/"))}>
          <Home className="h-5 w-5" />
          Home
        </Link>
        <Link href="/categories" className={itemClass(isActive("/categories"))}>
          <LayoutGrid className="h-5 w-5" />
          Categories
        </Link>
        <Link href="/search" className={itemClass(isActive("/search"))}>
          <Search className="h-5 w-5" />
          Search
        </Link>
        <button type="button" onClick={modals.openCart} className={itemClass(false)}>
          <span className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </span>
          Cart
        </button>
        <button
          type="button"
          onClick={handleAccount}
          className={itemClass(isActive("/account"))}
        >
          <User className="h-5 w-5" />
          Account
        </button>
      </div>
    </nav>
  );
}
