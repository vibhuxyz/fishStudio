import React from "react";

// Visual style per badge. Mirrors the mobile palette so badges read the same
// across platforms. Brand purple anchors premium/social-proof badges.
const BADGE_STYLES: Record<string, string> = {
  "Best Seller": "bg-[#5A2C96] text-white",
  Trending: "bg-[#7C3AED] text-white",
  "Limited Stock": "bg-[#EF4444] text-white",
  "New Arrival": "bg-[#16A34A] text-white",
  "Fresh Today": "bg-[#0EA5E9] text-white",
  "Packed Today": "bg-[#0EA5E9] text-white",
  "Cut Fresh After Order": "bg-[#1C1C1C] text-white",
  "Temperature Controlled": "bg-[#1C1C1C] text-white",
  "Vacuum Packed": "bg-[#1C1C1C] text-white",
};

const DEFAULT_STYLE = "bg-[#5A2C96] text-white";

export function ProductBadge({ label }: { label: string }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold leading-tight tracking-wide shadow-sm ${
        BADGE_STYLES[label] ?? DEFAULT_STYLE
      }`}
    >
      {label}
    </span>
  );
}

// Overlay rendered on the product image (top-left). Shows up to `max` badges.
export function ProductBadges({
  badges,
  max = 2,
}: {
  badges?: string[] | null;
  max?: number;
}) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
      {badges.slice(0, max).map((b) => (
        <ProductBadge key={b} label={b} />
      ))}
    </div>
  );
}
