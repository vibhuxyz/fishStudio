"use client";

import Image from "next/image";
import Link from "next/link";
import { Fish } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { normalizeSlug } from "@repo/slug";

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const categories: string[] = data?.categories ?? [];
  const categoryImages: Record<string, string> = data?.categoryImages ?? {};

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 md:px-6 md:pb-10">
      <h1 className="mb-5 text-xl font-bold text-foreground md:text-2xl">
        All Categories
      </h1>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
                <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              </div>
            ))
          : categories.map((cat) => {
              const img = categoryImages[cat];
              return (
                <Link
                  key={cat}
                  href={`/category/${normalizeSlug(cat)}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#F8F8FA] transition-shadow group-hover:shadow-md">
                    {img ? (
                      <Image
                        src={img}
                        alt={cat}
                        fill
                        sizes="(max-width: 768px) 33vw, 160px"
                        className="object-cover"
                      />
                    ) : (
                      <Fish className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <span className="line-clamp-1 text-center text-xs font-medium text-foreground">
                    {cat}
                  </span>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
