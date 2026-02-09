"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Fish,
  Drumstick,
  Flame,
  Heart,
  Wheat,
  PawPrint,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import type { CategoryKey } from "@/lib/types";

const categoryKeyMap: Record<string, string> = {
  "Fresh Water": "freshWater",
  "Sea Fish": "seaFish",
  "Premium Sea Food": "premiumSeaFood",
  "Meat & Poultry": "meatPoultry",
  "Fry Ready": "fryReady",
  "Moms Magic": "momsMagic",
  "Rice & Spice": "riceSpice",
  "Pet Serve": "petServe",
};

const categoryIcons: Record<string, React.ReactNode> = {
  "Fresh Water": <Fish className="h-5 w-5" />,
  "Sea Fish": <Fish className="h-5 w-5" />,
  "Premium Sea Food": <Fish className="h-5 w-5" />,
  "Meat & Poultry": <Drumstick className="h-5 w-5" />,
  "Fry Ready": <Flame className="h-5 w-5" />,
  "Moms Magic": <Heart className="h-5 w-5" />,
  "Rice & Spice": <Wheat className="h-5 w-5" />,
  "Pet Serve": <PawPrint className="h-5 w-5" />,
};

function getCategorySlug(cat: string) {
  return encodeURIComponent(cat.toLowerCase().replace(/[\s&]+/g, "-"));
}

interface CategoryMenuProps {
  variant?: "horizontal" | "dropdown";
  onClose?: () => void;
}

interface CategoryMenuProps {
  variant?: "horizontal" | "dropdown";
  onClose?: () => void;
}

export function CategoryMenu({
  variant = "horizontal",
  onClose,
}: CategoryMenuProps) {
  const { data, isLoading } = useCategories();

  const categories: string[] = data?.categories ?? [];
  const subCategoriesData: Record<string, string[]> = data?.subCategories ?? {};

  const getSubCategories = useCallback(
    (cat: string) => {
      const key = categoryKeyMap[cat];
      if (!key) return [];
      return subCategoriesData[key] || [];
    },
    [subCategoriesData],
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const keepOpen = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const startClose = useCallback(() => {
    keepOpen();
    closeTimerRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300);
  }, [keepOpen]);

  const openCategory = useCallback(
    (cat: string) => {
      keepOpen();
      setActiveCategory(cat);
    },
    [keepOpen],
  );

  const checkScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Check on mount + resize
    checkScrollButtons();
    const obs = new ResizeObserver(() => checkScrollButtons());
    obs.observe(el);
    el.addEventListener("scroll", checkScrollButtons, { passive: true });
    return () => {
      obs.disconnect();
      el.removeEventListener("scroll", checkScrollButtons);
    };
  }, [checkScrollButtons]);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return <CategoryMenuSkeleton />;
  }

  /* Horizontal variant */
  if (variant === "horizontal") {
    const subCats = activeCategory ? getSubCategories(activeCategory) : [];

    return (
      <div className="relative" onMouseLeave={startClose}>
        {/* Category nav row */}
        <div className="relative flex h-12 items-center border-t border-border bg-background">
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 z-10 h-full w-8 rounded-none bg-background/95 text-muted-foreground hover:text-primary"
              onClick={() => scroll("left")}
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <nav
            ref={scrollRef}
            className="hide-scrollbar mx-auto flex h-full items-center justify-center gap-1 overflow-x-auto px-10"
            aria-label="Product categories"
          >
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${getCategorySlug(cat)}`}
                className={`flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                onMouseEnter={() => openCategory(cat)}
                onFocus={() => openCategory(cat)}
              >
                <span className="text-primary">{categoryIcons[cat]}</span>
                <span className="whitespace-nowrap">{cat}</span>
              </Link>
            ))}
          </nav>

          {canScrollRight && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 z-10 h-full w-8 rounded-none bg-background/95 text-muted-foreground hover:text-primary"
              onClick={() => scroll("right")}
              aria-label="Scroll categories right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Subcategory panel - positioned so it connects seamlessly with the nav row above */}
        <AnimatePresence>
          {activeCategory && subCats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 right-0 top-12 z-50 overflow-hidden border-b border-border bg-background shadow-lg"
              onMouseEnter={keepOpen}
              onMouseLeave={startClose}
            >
              <div className="mx-auto max-w-5xl px-6 py-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  {activeCategory}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {subCats.map((sub) => (
                    <Link
                      key={sub}
                      href={`/category/${getCategorySlug(activeCategory)}?sub=${encodeURIComponent(sub)}`}
                      className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      onClick={onClose}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* Dropdown variant (header icon when scrolled) */
  const subCats = activeCategory ? getSubCategories(activeCategory) : [];

  return (
    <div className="flex min-h-[350px] w-[520px]" onMouseLeave={startClose}>
      {/* Left column - categories */}
      <div className="w-56 border-r border-border bg-background py-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
              activeCategory === cat
                ? "bg-secondary font-semibold text-foreground"
                : "text-muted-foreground hover:bg-secondary/50"
            }`}
            onMouseEnter={() => openCategory(cat)}
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
              {categoryIcons[cat]}
            </span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Right column - subcategories */}
      <div
        className="w-64 bg-secondary/30 p-4"
        onMouseEnter={keepOpen}
        onMouseLeave={startClose}
      >
        <AnimatePresence mode="wait">
          {activeCategory && subCats.length > 0 ? (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {activeCategory}
              </h3>
              <div className="flex flex-col gap-1">
                {subCats.map((sub) => (
                  <Link
                    key={sub}
                    href={`/category/${getCategorySlug(activeCategory)}?sub=${encodeURIComponent(sub)}`}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    onClick={onClose}
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Hover over a category to see items
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function CategoryMenuSkeleton() {
  return (
    <div className="flex justify-center h-12 items-center gap-2 px-10">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-28 rounded-full" />
      ))}
    </div>
  );
}
