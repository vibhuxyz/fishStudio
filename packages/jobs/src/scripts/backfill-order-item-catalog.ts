import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";

/**
 * One-off backfill of OrderItem.catalogProductId for orders placed before the
 * column existed (migration 20260810000000).
 *
 * Checkout writes the column for every new order, but the co-purchase job skips
 * rows where it is null — without this, every order in the existing history is
 * invisible to Frequently Bought Together. Run once after deploying:
 *
 *   pnpm --filter @repo/jobs backfill:order-item-catalog
 *
 * Idempotent: only rows still null are touched, so a partial run can simply be
 * repeated. Rows whose product has since been hard-deleted from Mongo stay null
 * and are reported at the end — they are unrecoverable, not a failure.
 *
 * Run this BEFORE the first aggregation, or the orders it repairs will already
 * sit behind the watermark and never be counted.
 */

const BATCH_SIZE = 500;

async function backfillOrderItemCatalog() {
  let scanned = 0;
  let updated = 0;
  let unresolved = 0;
  // Paginated by id rather than by re-querying the null rows: a row whose
  // product is gone from Mongo stays null forever, so a filter-only loop would
  // keep handing back the same unresolvable rows.
  let cursor: string | undefined;

  for (;;) {
    const items = await prismaPostgres.orderItem.findMany({
      where: { catalogProductId: null },
      select: { id: true, productId: true },
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    if (items.length === 0) break;

    cursor = items[items.length - 1]!.id;
    scanned += items.length;

    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await prismaMongo.products.findMany({
      where: { id: { in: productIds } },
      select: { id: true, catalogProductId: true },
    });
    // A catalog root ordered directly has no catalogProductId of its own — it
    // is the root, same rule checkout applies when writing new rows.
    const catalogRootById = new Map(
      products.map((product) => [product.id, product.catalogProductId ?? product.id]),
    );

    const resolvable = items.filter((item) => catalogRootById.has(item.productId));
    unresolved += items.length - resolvable.length;

    // Grouped by catalog root so this is one UPDATE per distinct product rather
    // than one per order item.
    const itemIdsByCatalog = new Map<string, string[]>();
    for (const item of resolvable) {
      const catalogId = catalogRootById.get(item.productId)!;
      const existing = itemIdsByCatalog.get(catalogId);
      if (existing) {
        existing.push(item.id);
      } else {
        itemIdsByCatalog.set(catalogId, [item.id]);
      }
    }

    for (const [catalogProductId, ids] of itemIdsByCatalog) {
      const result = await prismaPostgres.orderItem.updateMany({
        where: { id: { in: ids } },
        data: { catalogProductId },
      });
      updated += result.count;
    }

    console.log(`[Backfill] ${updated} row(s) updated, ${scanned} scanned...`);
  }

  return { scanned, updated, unresolved };
}

backfillOrderItemCatalog()
  .then(async ({ scanned, updated, unresolved }) => {
    console.log(
      `\nDone. Scanned ${scanned}, updated ${updated}, ${unresolved} unresolvable (product no longer in Mongo).`,
    );
    await Promise.all([prismaPostgres.$disconnect(), prismaMongo.$disconnect()]);
  })
  .catch(async (error) => {
    console.error("Backfill failed:", error);
    await Promise.all([prismaPostgres.$disconnect(), prismaMongo.$disconnect()]);
    process.exit(1);
  });
