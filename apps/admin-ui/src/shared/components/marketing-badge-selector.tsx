"use client";

import React from "react";

// Canonical badge slug → display label. Keep in sync with the backend
// MARKETING_BADGE_TAGS map (product-service/controllers/product/badges.ts).
export const MARKETING_BADGE_OPTIONS: { slug: string; label: string }[] = [
  { slug: "fresh-today", label: "Fresh Today" },
  { slug: "packed-today", label: "Packed Today" },
  { slug: "cut-fresh", label: "Cut Fresh After Order" },
  { slug: "temperature-controlled", label: "Temperature Controlled" },
  { slug: "vacuum-packed", label: "Vacuum Packed" },
];

const MARKETING_SLUGS = MARKETING_BADGE_OPTIONS.map((o) => o.slug);

const splitTags = (value: string): string[] =>
  value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

/**
 * Toggleable chips for the premium marketing badges. They live inside the
 * product's comma-separated `tags` field, so they coexist with free-form tags
 * without a schema change. `value` is the current raw tags string; `onChange`
 * receives the updated raw tags string.
 */
export function MarketingBadgeSelector({
  value,
  onChange,
}: {
  value?: string;
  onChange: (next: string) => void;
}) {
  const tags = splitTags(value || "");
  const lower = tags.map((t) => t.toLowerCase());

  const toggle = (slug: string) => {
    const isActive = lower.includes(slug);
    let next: string[];
    if (isActive) {
      next = tags.filter((t) => t.toLowerCase() !== slug);
    } else {
      next = [...tags, slug];
    }
    onChange(next.join(","));
  };

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        Premium Badges
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Optional marketing badges shown on the product card. (Best Seller, New
        Arrival, Trending and Limited Stock are applied automatically.)
      </p>
      <div className="flex flex-wrap gap-2">
        {MARKETING_BADGE_OPTIONS.map((opt) => {
          const active = lower.includes(opt.slug);
          return (
            <button
              key={opt.slug}
              type="button"
              onClick={() => toggle(opt.slug)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                active
                  ? "border-[#5A2C96] bg-[#5A2C96] text-white"
                  : "border-gray-600 bg-transparent text-gray-300 hover:border-[#5A2C96]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Helper for callers that need the non-marketing (free-form) tags only — e.g.
// to display them separately. Currently unused but kept alongside the slugs.
export const isMarketingTag = (tag: string) =>
  MARKETING_SLUGS.includes(tag.trim().toLowerCase());
