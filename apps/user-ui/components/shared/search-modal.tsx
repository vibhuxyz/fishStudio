"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  Fish,
  Loader2,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";
import { usePageSearch, SearchHit } from "@/hooks/useSearch";
import { useCategories } from "@/hooks/useCategories";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";

const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

function ResultCard({ hit, onClose }: { hit: SearchHit; onClose: () => void }) {
  const disc =
    hit.regular_price > 0 && hit.regular_price > hit.sale_price
      ? Math.round(((hit.regular_price - hit.sale_price) / hit.regular_price) * 100)
      : 0;

  return (
    <Link
      href={`/product/${hit.slug}`}
      onClick={onClose}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {hit.imageUrl ? (
          <Image
            src={hit.imageUrl}
            alt={hit.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Fish className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {disc > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-offer-green px-1.5 py-0.5 text-[10px] font-bold text-white">
            {disc}% OFF
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 px-3 pb-3 pt-2.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-primary">
          {hit.subCategory || hit.category}
        </span>
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {hit.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-bold text-foreground">₹{hit.sale_price}</span>
          {disc > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{hit.regular_price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface SearchModalProps {
  open: boolean;
  initialQuery: string;
  onClose: () => void;
}

export function SearchModal({ open, initialQuery, onClose }: SearchModalProps) {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [sort, setSort] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { hits, totalHits, loading } = usePageSearch(inputValue, {
    category: activeCategory,
    sort,
  });
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];

  // Sync query when opened
  useEffect(() => {
    if (open) {
      setInputValue(initialQuery);
      setActiveCategory("");
      setSort("");
      // Focus input after animation
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open, initialQuery]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleClear = useCallback(() => {
    setInputValue("");
    inputRef.current?.focus();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            className="fixed inset-x-0 top-0 z-[61] flex max-h-screen flex-col overflow-hidden bg-background shadow-2xl"
            style={{ maxHeight: "92dvh" }}
            initial={{ y: "-8%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-8%", opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search bar header */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <button
                type="button"
                className="flex-shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={onClose}
                aria-label="Close search"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="relative flex flex-1 items-center">
                <div className="pointer-events-none absolute left-3">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Search className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search for fish, meat, cuts…"
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-9 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                {inputValue && (
                  <button
                    type="button"
                    className="absolute right-3 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={handleClear}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Mobile filter toggle */}
              <button
                type="button"
                className="flex-shrink-0 rounded-xl border border-border bg-muted/40 p-2.5 text-muted-foreground transition-colors hover:bg-muted md:hidden"
                onClick={() => setShowFilters((v) => !v)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Sidebar */}
              <aside
                className={`flex-shrink-0 overflow-y-auto border-r border-border md:block md:w-52 ${
                  showFilters ? "block w-full absolute inset-0 top-[64px] z-10 bg-background" : "hidden"
                }`}
              >
                <div className="p-4">
                  {showFilters && (
                    <div className="mb-4 flex items-center justify-between md:hidden">
                      <span className="text-sm font-semibold">Filters</span>
                      <button onClick={() => setShowFilters(false)}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Category
                    </h3>
                    <ul className="space-y-0.5">
                      {(["", ...categories] as string[]).map((cat) => (
                        <li key={cat}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCategory(cat);
                              setShowFilters(false);
                            }}
                            className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                              activeCategory === cat
                                ? "bg-primary/10 font-semibold text-primary"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            {cat || "All"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Sort by
                    </h3>
                    <ul className="space-y-0.5">
                      {SORT_OPTIONS.map((opt) => (
                        <li key={opt.value}>
                          <button
                            type="button"
                            onClick={() => {
                              setSort(opt.value);
                              setShowFilters(false);
                            }}
                            className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                              sort === opt.value
                                ? "bg-primary/10 font-semibold text-primary"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            {opt.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {/* Result count + active filters */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    {!inputValue ? (
                      "Start typing to search"
                    ) : loading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Searching…
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold text-foreground">{totalHits}</span>{" "}
                        result{totalHits !== 1 ? "s" : ""} for{" "}
                        <span className="font-semibold text-foreground">"{inputValue}"</span>
                      </>
                    )}
                  </p>

                  {/* Active chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {activeCategory && (
                      <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {activeCategory}
                        <button onClick={() => setActiveCategory("")}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {sort && (
                      <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                        <button onClick={() => setSort("")}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>

                  {/* Desktop sort */}
                  <div className="hidden items-center gap-2 md:flex">
                    <label className="text-xs text-muted-foreground">Sort:</label>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid */}
                {loading ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : !inputValue ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search className="mb-4 h-14 w-14 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">Start typing to search</p>
                  </div>
                ) : hits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Fish className="mb-4 h-16 w-16 text-muted-foreground/20" />
                    <h2 className="mb-1 text-lg font-semibold text-foreground">
                      No results found
                    </h2>
                    <p className="text-sm text-muted-foreground">Try a different keyword</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {hits.map((hit) => (
                      <ResultCard key={hit.id} hit={hit} onClose={onClose} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
