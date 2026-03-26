"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
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
import { getCategoryConfigKey } from "@/lib/storefront";

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
  variant?: "horizontal" | "dropdown" | "mega";
  onClose?: () => void;
}

export function CategoryMenu({
  variant = "horizontal",
  onClose,
}: CategoryMenuProps) {
  const { data, isLoading } = useCategories();

  const categories: string[] = data?.categories ?? [];
  const subCategoriesData: Record<string, string[]> = data?.subCategories ?? {};
  const categoryImages: Record<string, string> = data?.categoryImages ?? {};

  const getSubCategories = useCallback(
    (cat: string) => {
      const key = getCategoryConfigKey(cat);
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
      <div className="relative">
        {/* Category nav row */}
        <div className="relative flex h-20 items-center border-t border-border bg-background">
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 z-10 h-full w-8 rounded-none bg-muted/20 text-muted-foreground hover:bg-muted/40 transition-colors"
              onClick={() => scroll("left")}
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <nav
            ref={scrollRef}
            className="hide-scrollbar mx-auto flex h-full items-center justify-start gap-5 overflow-x-auto px-10"
            aria-label="Product categories"
          >
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${getCategorySlug(cat)}`}
                className="flex flex-col items-center gap-1 group transition-transform duration-200 hover:scale-105"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border bg-muted/20 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:border-primary/20">
                  {categoryImages[cat] ? (
                    <Image
                      src={categoryImages[cat]}
                      alt={cat}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50">
                      <Fish className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <span className="whitespace-nowrap text-[10px] font-bold tracking-tight text-muted-foreground/80 transition-colors group-hover:text-primary">
                  {cat}
                </span>
              </Link>
            ))}
          </nav>

          {canScrollRight && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 z-10 h-full w-8 rounded-none bg-muted/20 text-muted-foreground hover:bg-muted/40 transition-colors"
              onClick={() => scroll("right")}
              aria-label="Scroll categories right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  /* Mega variant (Grid layout) */
  if (variant === "mega") {
    return (
      <div className="w-[850px] max-w-[95vw] p-6 bg-background rounded-xl overflow-hidden shadow-2xl border border-border">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Shop by Categories
          </h2>
          <p className="text-sm text-muted-foreground">Hover on a category to see more</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((cat) => {
            const subs = getSubCategories(cat);
            return (
              <div 
                key={cat} 
                className="group relative flex flex-col gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-secondary/50"
                onMouseEnter={() => openCategory(cat)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/5 shadow-sm group-hover:shadow-md">
                    {categoryImages[cat] ? (
                      <Image
                        src={categoryImages[cat]}
                        alt={cat}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-primary transition-colors group-hover:text-primary-foreground">
                        {categoryIcons[cat] || <Fish className="h-6 w-6" />}
                      </span>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/category/${getCategorySlug(cat)}`}
                      className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors"
                      onClick={onClose}
                    >
                      {cat}
                    </Link>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {subs.length} items
                    </div>
                  </div>
                </div>

                {/* Subcategories list that appears on hover */}
                <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-40">
                  <div className="flex flex-col gap-1 px-1 pt-2 border-t border-border/20">
                    {subs.slice(0, 4).map((sub) => (
                      <Link
                        key={sub}
                        href={`/category/${getCategorySlug(cat)}?sub=${encodeURIComponent(sub)}`}
                        className="text-[11px] text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200"
                        onClick={onClose}
                      >
                        {sub}
                      </Link>
                    ))}
                    {subs.length > 4 && (
                      <Link
                        href={`/category/${getCategorySlug(cat)}`}
                        className="text-[10px] font-semibold text-primary/70 hover:text-primary mt-1"
                        onClick={onClose}
                      >
                        + View {subs.length - 4} more
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-center">
          <Link 
            href="/categories" 
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 group"
            onClick={onClose}
          >
            Explore All Categories 
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
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
            <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              {categoryImages[cat] ? (
                <Image src={categoryImages[cat]} alt={cat} fill sizes="32px" className="object-cover" />
              ) : (
                categoryIcons[cat]
              )}
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
