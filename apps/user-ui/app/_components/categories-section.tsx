"use client";

import Image from "next/image";
import Link from "next/link";
import { Fish } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { normalizeSlug } from "@repo/shared/slug";
import type { StorefrontCategories } from "@/lib/storefront";

// Home "Categories" section — a horizontally scrollable strip of category tiles
// (image + name) linking into each category page.
export function CategoriesSection({
  initialData,
}: {
  initialData?: StorefrontCategories;
}) {
  // initialData comes from the server-rendered fetch in page.tsx, so the
  // first client render already has data (isLoading false) and matches the
  // server HTML exactly — without it, the server always renders the loading
  // skeleton (effects don't run during SSR) while a client with a warm
  // query cache can render real content, causing a hydration mismatch.
  const { data, isLoading } = useCategories(initialData);
  const categories: string[] = data?.categories ?? [];
  const categoryImages: Record<string, string> = data?.categoryImages ?? {};

  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="px-4 py-3 md:px-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-foreground md:text-xl">
          Shop by Category
        </h2>
        <Link
          href="/categories"
          className="text-xs font-semibold text-primary hover:underline"
        >
          See all
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex w-[72px] flex-shrink-0 flex-col items-center gap-1.5">
                <div className="h-[72px] w-[72px] animate-pulse rounded-2xl bg-muted" />
                <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              </div>
            ))
          : categories.map((cat) => {
              const img = categoryImages[cat];
              return (
                <Link
                  key={cat}
                  href={`/category/${normalizeSlug(cat)}`}
                  className="group flex w-[72px] flex-shrink-0 flex-col items-center gap-1.5"
                >
                  <div className="relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#F8F8FA] transition-shadow group-hover:shadow-md">
                    {img ? (
                      <Image
                        src={img}
                        alt={cat}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    ) : (
                      <Fish className="h-7 w-7 text-primary" />
                    )}
                  </div>
                  <span className="line-clamp-1 text-center text-[11px] font-medium text-foreground">
                    {cat}
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
