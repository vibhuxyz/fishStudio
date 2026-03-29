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
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { getCategoryConfigKey } from "@/lib/storefront";
import { normalizeSlug } from "@/lib/normalize-slug";

// Per-category accent colours (bg gradient + icon colour)
const categoryTheme: Record<string, { gradient: string; iconBg: string; badge: string }> = {
  "Fresh Water":      { gradient: "from-sky-50 to-blue-50",    iconBg: "bg-sky-100",    badge: "bg-sky-100 text-sky-700" },
  "Sea Fish":         { gradient: "from-teal-50 to-cyan-50",   iconBg: "bg-teal-100",   badge: "bg-teal-100 text-teal-700" },
  "Premium Sea Food": { gradient: "from-violet-50 to-purple-50", iconBg: "bg-violet-100", badge: "bg-violet-100 text-violet-700" },
  "Meat & Poultry":  { gradient: "from-orange-50 to-amber-50", iconBg: "bg-orange-100", badge: "bg-orange-100 text-orange-700" },
  "Fry Ready":        { gradient: "from-red-50 to-rose-50",    iconBg: "bg-red-100",    badge: "bg-red-100 text-red-700" },
  "Moms Magic":       { gradient: "from-pink-50 to-fuchsia-50",iconBg: "bg-pink-100",   badge: "bg-pink-100 text-pink-700" },
  "Rice & Spice":     { gradient: "from-yellow-50 to-lime-50", iconBg: "bg-yellow-100", badge: "bg-yellow-100 text-yellow-700" },
  "Pet Serve":        { gradient: "from-green-50 to-emerald-50",iconBg: "bg-green-100", badge: "bg-green-100 text-green-700" },
};

const fallbackTheme = { gradient: "from-gray-50 to-slate-50", iconBg: "bg-gray-100", badge: "bg-gray-100 text-gray-600" };

const categoryIcons: Record<string, React.ReactNode> = {
  "Fresh Water":      <Fish className="h-5 w-5" />,
  "Sea Fish":         <Fish className="h-5 w-5" />,
  "Premium Sea Food": <Fish className="h-5 w-5" />,
  "Meat & Poultry":  <Drumstick className="h-5 w-5" />,
  "Fry Ready":        <Flame className="h-5 w-5" />,
  "Moms Magic":       <Heart className="h-5 w-5" />,
  "Rice & Spice":     <Wheat className="h-5 w-5" />,
  "Pet Serve":        <PawPrint className="h-5 w-5" />,
};

function getCategorySlug(cat: string) {
  return normalizeSlug(cat);
}

interface CategoryMenuProps {
  variant?: "horizontal" | "dropdown" | "mega";
  onClose?: () => void;
}

export function CategoryMenu({ variant = "horizontal", onClose }: CategoryMenuProps) {
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

  // auto-select first category in mega/dropdown on mount
  useEffect(() => {
    if ((variant === "mega" || variant === "dropdown") && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [variant, categories]);

  const keepOpen = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const startClose = useCallback(() => {
    keepOpen();
    closeTimerRef.current = setTimeout(() => setActiveCategory(null), 300);
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
    checkScrollButtons();
    const obs = new ResizeObserver(() => checkScrollButtons());
    obs.observe(el);
    el.addEventListener("scroll", checkScrollButtons, { passive: true });
    return () => {
      obs.disconnect();
      el.removeEventListener("scroll", checkScrollButtons);
    };
  }, [checkScrollButtons]);

  if (isLoading) return <CategoryMenuSkeleton />;

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
  };

  /* ─── Horizontal (header strip) ─────────────────────────────────────────── */
  if (variant === "horizontal") {
    return (
      <div className="relative">
        <div className="relative flex h-20 items-center border-t border-border bg-background">
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 z-10 h-full w-8 rounded-none bg-gradient-to-r from-background to-transparent text-muted-foreground"
              onClick={() => scroll("left")}
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <nav
            ref={scrollRef}
            className="hide-scrollbar mx-auto flex h-full items-center justify-start gap-3 overflow-x-auto px-4 sm:gap-5 sm:px-10"
            aria-label="Product categories"
          >
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${getCategorySlug(cat)}`}
                className="flex flex-col items-center gap-1 group transition-transform duration-200 hover:scale-105"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border bg-muted/20 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:border-primary/30">
                  {categoryImages[cat] ? (
                    <Image src={categoryImages[cat]} alt={cat} fill sizes="48px" className="object-cover" />
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
              className="absolute right-0 z-10 h-full w-8 rounded-none bg-gradient-to-l from-background to-transparent text-muted-foreground"
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

  /* ─── Mega (desktop dropdown from header icon) ───────────────────────────── */
  if (variant === "mega") {
    const activeSubs = activeCategory ? getSubCategories(activeCategory) : [];
    const theme = activeCategory ? (categoryTheme[activeCategory] ?? fallbackTheme) : fallbackTheme;

    return (
      <div className="w-full overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:w-[760px] sm:max-w-[96vw]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/5 to-background px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground sm:text-base">Shop by Categories</span>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            onClick={onClose}
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Body — stacks on mobile, side-by-side on sm+ */}
        <div className="flex flex-col sm:flex-row">
          {/* Category list — horizontal scroll on mobile, vertical sidebar on desktop */}
          <div className="no-scrollbar flex flex-row gap-1.5 overflow-x-auto border-b border-border bg-muted/20 p-2 sm:max-h-[360px] sm:w-52 sm:flex-shrink-0 sm:flex-col sm:gap-0 sm:overflow-x-hidden sm:overflow-y-auto sm:border-b-0 sm:border-r sm:p-0 sm:py-2">
            {categories.map((cat) => {
              const t = categoryTheme[cat] ?? fallbackTheme;
              const isActive = activeCategory === cat;
              const subs = getSubCategories(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  className={`group relative flex flex-shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-150 sm:w-full sm:flex-row sm:gap-3 sm:rounded-none sm:px-3 sm:py-2.5 ${
                    isActive
                      ? "bg-primary/10 sm:bg-background sm:shadow-sm"
                      : "hover:bg-background/60"
                  }`}
                  onMouseEnter={() => openCategory(cat)}
                  onClick={() => openCategory(cat)}
                >
                  {/* Active indicator — desktop only */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 hidden h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-primary sm:block" />
                  )}

                  {/* Image */}
                  <div className={`relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ${t.iconBg} ring-1 ring-border sm:h-9 sm:w-9`}>
                    {categoryImages[cat] ? (
                      <Image src={categoryImages[cat]} alt={cat} fill sizes="36px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        {categoryIcons[cat] || <Fish className="h-4 w-4" />}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 sm:flex-1">
                    <p className={`max-w-[64px] truncate text-[10px] font-semibold leading-tight sm:max-w-none sm:text-[13px] ${isActive ? "text-primary" : "text-foreground"}`}>
                      {cat}
                    </p>
                    <p className="hidden text-[10px] text-muted-foreground sm:block">{subs.length} items</p>
                  </div>

                  <ChevronRight className={`hidden h-3.5 w-3.5 flex-shrink-0 transition-all duration-150 sm:block ${isActive ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground"}`} />
                </button>
              );
            })}
          </div>

          {/* Right — subcategories */}
          <div className={`flex-1 bg-gradient-to-br ${theme.gradient} p-4 sm:p-5`} style={{ minHeight: 220 }}>
            <AnimatePresence mode="wait">
              {activeCategory ? (
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="h-full"
                >
                  {/* Category hero row */}
                  <div className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3">
                    <div className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl ${theme.iconBg} ring-2 ring-white shadow-md sm:h-12 sm:w-12`}>
                      {categoryImages[activeCategory] ? (
                        <Image src={categoryImages[activeCategory]} alt={activeCategory} fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          {categoryIcons[activeCategory] || <Fish className="h-5 w-5" />}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-foreground sm:text-base">{activeCategory}</h3>
                      <p className="text-xs text-muted-foreground">{activeSubs.length} varieties available</p>
                    </div>
                    <Link
                      href={`/category/${getCategorySlug(activeCategory)}`}
                      className="flex flex-shrink-0 items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm transition-colors hover:bg-white sm:px-3"
                      onClick={onClose}
                    >
                      Shop all <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* Subcategory cards */}
                  {activeSubs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                      {activeSubs.map((sub) => (
                        <Link
                          key={sub}
                          href={`/category/${getCategorySlug(activeCategory)}?sub=${encodeURIComponent(sub)}`}
                          className="group flex items-center justify-between gap-2 rounded-xl border border-white/60 bg-white/75 px-3 py-2.5 shadow-sm backdrop-blur-sm transition-all duration-150 hover:border-white hover:bg-white hover:shadow-md active:scale-95 sm:px-4 sm:py-3"
                          onClick={onClose}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className={`flex h-2 w-2 flex-shrink-0 rounded-full ${theme.badge.split(" ")[0]}`} />
                            <span className={`truncate text-xs font-semibold sm:text-sm ${theme.badge.split(" ")[1]}`}>
                              {sub}
                            </span>
                          </div>
                          <ArrowRight className="h-3 w-3 flex-shrink-0 text-muted-foreground/40 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-primary sm:h-3.5 sm:w-3.5" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                      <Sparkles className="h-6 w-6 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">All products in this category</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center"
                >
                  <LayoutGrid className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Tap a category to explore</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer — desktop only */}
        <div className="hidden border-t border-border bg-muted/30 px-5 py-3 sm:block">
          <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto">
            {categories.slice(0, 6).map((cat) => {
              const t = categoryTheme[cat] ?? fallbackTheme;
              return (
                <Link
                  key={cat}
                  href={`/category/${getCategorySlug(cat)}`}
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all hover:scale-105 ${t.badge} bg-white/60 hover:bg-white`}
                  onClick={onClose}
                >
                  <span className="relative h-4 w-4 overflow-hidden rounded-full">
                    {categoryImages[cat] ? (
                      <Image src={categoryImages[cat]} alt={cat} fill sizes="16px" className="object-cover" />
                    ) : (
                      <Fish className="h-3 w-3" />
                    )}
                  </span>
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Dropdown (two-column sidebar) ─────────────────────────────────────── */
  const subCats = activeCategory ? getSubCategories(activeCategory) : [];
  const dropTheme = activeCategory ? (categoryTheme[activeCategory] ?? fallbackTheme) : fallbackTheme;

  return (
    <div
      className="flex overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      style={{ minHeight: 340, width: 480 }}
      onMouseLeave={startClose}
    >
      {/* Left — categories */}
      <div className="w-48 flex-shrink-0 overflow-y-auto border-r border-border bg-muted/10 py-2">
        {categories.map((cat) => {
          const t = categoryTheme[cat] ?? fallbackTheme;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              className={`group relative flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-all duration-150 ${
                isActive ? "bg-background font-semibold" : "text-muted-foreground hover:bg-background/60"
              }`}
              onMouseEnter={() => openCategory(cat)}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <span className={`relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-full ${t.iconBg}`}>
                {categoryImages[cat] ? (
                  <Image src={categoryImages[cat]} alt={cat} fill sizes="28px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                    {categoryIcons[cat] || <Fish className="h-3.5 w-3.5" />}
                  </span>
                )}
              </span>
              <span className={`truncate text-[13px] ${isActive ? "text-primary" : ""}`}>{cat}</span>
              {isActive && <ChevronRight className="ml-auto h-3 w-3 flex-shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>

      {/* Right — subcategories */}
      <div
        className={`flex-1 bg-gradient-to-br ${dropTheme.gradient} p-4`}
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
              transition={{ duration: 0.12 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">{activeCategory}</h3>
                <Link
                  href={`/category/${getCategorySlug(activeCategory)}`}
                  className="text-[11px] font-semibold text-primary hover:underline"
                  onClick={onClose}
                >
                  View all
                </Link>
              </div>
              <div className="flex flex-col gap-0.5">
                {subCats.map((sub) => (
                  <Link
                    key={sub}
                    href={`/category/${getCategorySlug(activeCategory)}?sub=${encodeURIComponent(sub)}`}
                    className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-white/70 hover:text-foreground"
                    onClick={onClose}
                  >
                    <span className="h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/40 transition-colors group-hover:bg-primary" />
                    {sub}
                    <ArrowRight className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 text-primary" />
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground"
            >
              <LayoutGrid className="h-7 w-7 text-muted-foreground/30" />
              Hover over a category
            </motion.p>
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
