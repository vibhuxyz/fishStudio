import { prismaMongo as prisma } from "@repo/db-mongo";
import { prismaPostgres } from "@repo/db-postgres";
import { isCatalogRootProduct } from "./utils.js";
import {
  mergeCatalogWithVariant,
  pickBestVariantPerCatalog,
  storefrontVariantSelect,
} from "./storefront.utils.js";

/**
 * "Frequently Bought Together" — products shoppers actually put in the same
 * order as this one, read from the counters the nightly co-purchase job
 * maintains (packages/jobs/src/jobs/co-purchase.job.ts).
 *
 * Two products can look related for two different reasons, and only one of them
 * belongs here:
 *
 *   coPurchaseRate = P(B | A) — of the orders containing A, how many also had
 *   B. Intuitive, and what the block is ranked by.
 *
 *   lift = P(A and B) / (P(A) * P(B)) — how much more often they appear
 *   together than two unrelated products of the same popularity would. This is
 *   what stops a staple from colonising every product page: something bought in
 *   half of all orders has a high rate against *everything*, but a lift near 1.
 *
 * A pair must clear both a support floor and a lift floor to be shown at all.
 * With little order history that means most products return nothing, which is
 * the intended behaviour — the page hides the block rather than dressing up
 * category filler as observed shopper behaviour.
 */

/**
 * Orders a pair must appear in before it is trusted. Two people buying the same
 * two things once is a coincidence. Lower this as order volume grows — until
 * then it is the main reason the block stays hidden.
 */
const MIN_CO_PURCHASE_ORDERS = 5;

/** Below this a pair is no better than chance, however high its raw rate. */
const MIN_LIFT = 1.2;

/** Pairs pulled before scoring. Wider than the output so filtering has slack. */
const CANDIDATE_LIMIT = 12;

/** Cap on what the API returns; the bundle UI renders the first two. */
const MAX_SUGGESTIONS = 4;

interface ScoredPair {
  catalogProductId: string;
  coPurchaseRate: number;
  lift: number;
}

/**
 * Returns storefront-shaped products, ordered strongest first, restricted to
 * ones actually purchasable in `preferredStore`. Empty whenever the evidence is
 * too thin — callers render nothing rather than falling back to the category.
 */
export async function fetchFrequentlyBoughtTogether(
  catalogProductId: string,
  preferredStore: { id: string } | null,
): Promise<Record<string, unknown>[]> {
  const scored = await scoreCoPurchasePairs(catalogProductId);
  if (scored.length === 0) return [];

  const catalogs = await prisma.products.findMany({
    where: {
      id: { in: scored.map((pair) => pair.catalogProductId) },
      isDeleted: false,
      status: "Active",
    },
    include: {
      images: true,
      catalogProduct: { select: { slug: true } },
    },
  });

  const catalogById = new Map(
    catalogs.filter(isCatalogRootProduct).map((catalog) => [catalog.id, catalog]),
  );
  if (catalogById.size === 0) return [];

  const variants = await prisma.products.findMany({
    where: {
      catalogProductId: { in: [...catalogById.keys()] },
      status: "Active",
      isDeleted: false,
      ...(preferredStore ? { storeId: preferredStore.id } : {}),
    },
    select: storefrontVariantSelect,
  });
  const bestVariantByCatalog = pickBestVariantPerCatalog(variants);

  const suggestions: Record<string, unknown>[] = [];
  for (const pair of scored) {
    const catalog = catalogById.get(pair.catalogProductId);
    const variant = bestVariantByCatalog.get(pair.catalogProductId);
    // No sellable variant nearby: a bundle row the shopper cannot add to the
    // cart is worse than one fewer suggestion, so it is dropped rather than
    // rendered out of stock.
    if (!catalog || !variant || (variant.stock ?? 0) <= 0) continue;

    suggestions.push(mergeCatalogWithVariant(catalog, variant, preferredStore));
    if (suggestions.length === MAX_SUGGESTIONS) break;
  }

  return suggestions;
}

/**
 * Reads the raw counters and applies the support and lift floors. Split out
 * because it is pure scoring over Postgres — no Mongo, no storefront shapes.
 */
async function scoreCoPurchasePairs(
  catalogProductId: string,
): Promise<ScoredPair[]> {
  // The pair is stored once under (catalogA < catalogB), so this product can be
  // on either side. Two queries rather than an OR: each is served outright by
  // its own [side, orderCount DESC] index.
  const pairWhere = { orderCount: { gte: MIN_CO_PURCHASE_ORDERS } };
  const [state, ownStat, asA, asB] = await Promise.all([
    prismaPostgres.coPurchaseState.findUnique({
      where: { id: "singleton" },
      select: { totalOrders: true },
    }),
    prismaPostgres.productOrderStat.findUnique({
      where: { catalogProductId },
      select: { orderCount: true },
    }),
    prismaPostgres.productCoPurchase.findMany({
      where: { catalogA: catalogProductId, ...pairWhere },
      select: { catalogB: true, orderCount: true },
      orderBy: { orderCount: "desc" },
      take: CANDIDATE_LIMIT,
    }),
    prismaPostgres.productCoPurchase.findMany({
      where: { catalogB: catalogProductId, ...pairWhere },
      select: { catalogA: true, orderCount: true },
      orderBy: { orderCount: "desc" },
      take: CANDIDATE_LIMIT,
    }),
  ]);

  // No aggregation has run yet, or this product has never been delivered —
  // either way there is nothing to divide by.
  const totalOrders = state?.totalOrders ?? 0;
  const ownOrders = ownStat?.orderCount ?? 0;
  if (totalOrders === 0 || ownOrders === 0) return [];

  const pairs = [
    ...asA.map((row) => ({ catalogProductId: row.catalogB, orderCount: row.orderCount })),
    ...asB.map((row) => ({ catalogProductId: row.catalogA, orderCount: row.orderCount })),
  ];
  if (pairs.length === 0) return [];

  const otherStats = await prismaPostgres.productOrderStat.findMany({
    where: { catalogProductId: { in: pairs.map((pair) => pair.catalogProductId) } },
    select: { catalogProductId: true, orderCount: true },
  });
  const ordersByProduct = new Map(
    otherStats.map((stat) => [stat.catalogProductId, stat.orderCount]),
  );

  const scored: ScoredPair[] = [];
  for (const pair of pairs) {
    const otherOrders = ordersByProduct.get(pair.catalogProductId) ?? 0;
    // A pair count can never exceed either product's own count, so a zero here
    // means the counters disagree — skip rather than divide by zero.
    if (otherOrders === 0) continue;

    const coPurchaseRate = pair.orderCount / ownOrders;
    const lift = (pair.orderCount * totalOrders) / (ownOrders * otherOrders);
    if (lift < MIN_LIFT) continue;

    scored.push({ catalogProductId: pair.catalogProductId, coPurchaseRate, lift });
  }

  return scored.sort((a, b) => b.coPurchaseRate - a.coPurchaseRate);
}
