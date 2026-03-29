"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CategoryHeaderProps {
  displayName: string;
  productCount?: number;
}

export function CategoryHeader({ displayName, productCount }: CategoryHeaderProps) {
  return (
    <div className="border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          {displayName}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse our fresh selection of {displayName.toLowerCase()} products.
          {productCount ? ` ${productCount} products available.` : ""}
        </p>
      </div>
    </div>
  );
}
