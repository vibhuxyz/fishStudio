// Premium badge computation for storefront products.
//
// Two kinds of badges:
//   • Auto-derived  — computed from live product data (sales, age, stock).
//   • Marketing      — opt-in attributes stored as canonical slugs inside the
//                      product's `tags[]` array (set in the admin/seller form).
//
// `computeBadges` returns an ordered list of human-readable labels. The order
// reflects display priority (most conversion-driving first); the frontend caps
// how many it renders.

// Canonical tag slug → display label. Admin/seller product forms write these
// slugs into `tags[]`. Keep this list in sync with MARKETING_BADGE_OPTIONS on
// the clients.
export const MARKETING_BADGE_TAGS: Record<string, string> = {
  "fresh-today": "Fresh Today",
  "packed-today": "Packed Today",
  "cut-fresh": "Cut Fresh After Order",
  "temperature-controlled": "Temperature Controlled",
  "vacuum-packed": "Vacuum Packed",
};

// Auto-badge thresholds. Tunable without touching call sites.
const BESTSELLER_MIN_SOLD = 30;
const TRENDING_MIN_SOLD = 10;
const NEW_ARRIVAL_DAYS = 7;
const LIMITED_STOCK_MAX = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

type BadgeInput = {
  totalSold?: number | null;
  stock?: number | null;
  inStock?: boolean;
  createdAt?: Date | string | null;
  tags?: string[] | null;
};

const isRecent = (createdAt: BadgeInput["createdAt"], days: number) => {
  if (!createdAt) return false;
  const ts = new Date(createdAt).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= days * DAY_MS;
};

/**
 * Returns the ordered list of badge labels for a (merged) storefront product.
 * Safe to call on any product-shaped object; missing fields just yield fewer
 * badges.
 */
export const computeBadges = (product: BadgeInput): string[] => {
  const badges: string[] = [];

  const totalSold = Number(product.totalSold ?? 0);
  const stock = Number(product.stock ?? 0);
  const inStock = product.inStock ?? stock > 0;

  // 1. Urgency first — drives immediate action.
  if (inStock && stock > 0 && stock <= LIMITED_STOCK_MAX) {
    badges.push("Limited Stock");
  }

  // 2. Social proof.
  if (totalSold >= BESTSELLER_MIN_SOLD) {
    badges.push("Best Seller");
  } else if (totalSold >= TRENDING_MIN_SOLD && isRecent(product.createdAt, 30)) {
    // "Trending" = gaining traction recently without being an all-time best
    // seller. Mutually exclusive with Best Seller to avoid redundant labels.
    badges.push("Trending");
  }

  // 3. Freshness / newness.
  if (isRecent(product.createdAt, NEW_ARRIVAL_DAYS)) {
    badges.push("New Arrival");
  }

  // 4. Marketing attributes from tags (preserve the canonical map order).
  const tags = Array.isArray(product.tags)
    ? product.tags.map((t) => String(t).toLowerCase())
    : [];
  for (const [slug, label] of Object.entries(MARKETING_BADGE_TAGS)) {
    if (tags.includes(slug)) badges.push(label);
  }

  return badges;
};
