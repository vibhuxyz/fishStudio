"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

// Wishlist UI. A user-facing wishlist API doesn't exist yet (the `favorites`
// model is unused on web), so this currently shows an empty state. When the
// favorites endpoint lands, render the saved products here using ProductCard.
export default function WishlistPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-6 md:pb-10">
      <h1 className="mb-6 text-xl font-bold text-foreground md:text-2xl">
        Wish List
      </h1>

      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-[#F8F8FA] py-20 text-center">
        <Heart className="h-12 w-12 text-[#5A2C96]" />
        <div>
          <p className="text-base font-semibold text-foreground">
            Your wishlist is empty
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the heart on any product to save it for later.
          </p>
        </div>
        <Link
          href="/search"
          className="rounded-xl bg-[#5A2C96] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Browse products
        </Link>
      </div>
    </div>
  );
}
