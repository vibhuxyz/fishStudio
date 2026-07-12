/**
 * One-off data repair before the unique-index migration can succeed.
 *
 *   1. Backfills stores with null/missing opening_hours & closing_hours
 *      (the schema requires non-null String → Prisma P2032 on read).
 *   2. De-duplicates the images collection on (productId, file_id) so the
 *      new @@unique([productId, file_id]) index can be built.
 *
 * Uses raw Mongo commands on purpose: Prisma cannot read or filter the
 * invalid null rows through the typed client, so the typed API is useless here.
 *
 * Run from the package dir so its .env (DATABASE_URL) loads:
 *   cd packages/db-mongo && bun scripts/fix-data.ts
 */
import { prismaMongo } from "@repo/db-mongo";

async function main() {
  // ── 1. Backfill missing/null store hours ──────────────────────────────────
  // `{ field: null }` matches both explicit null and missing fields in Mongo.
  const storeFix = (await prismaMongo.$runCommandRaw({
    update: "stores",
    updates: [
      { q: { opening_hours: null }, u: { $set: { opening_hours: "09:00" } }, multi: true },
      { q: { closing_hours: null }, u: { $set: { closing_hours: "23:00" } }, multi: true },
    ],
  })) as any;
  console.log(`✓ Store hours backfilled (modified: ${storeFix?.nModified ?? 0})`);

  // ── 2. De-duplicate images on (productId, file_id) ────────────────────────
  const groups = (await prismaMongo.images.aggregateRaw({
    pipeline: [
      {
        $group: {
          _id: { productId: "$productId", file_id: "$file_id" },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ],
  })) as unknown as Array<{ ids: Array<{ $oid: string }> }>;

  // Keep the first doc in each group, collect the rest for deletion.
  const idsToDelete: string[] = [];
  for (const g of groups) {
    g.ids.slice(1).forEach((o) => idsToDelete.push(o.$oid));
  }
  console.log(
    `Found ${groups.length} duplicate image group(s); deleting ${idsToDelete.length} extra doc(s)`,
  );

  if (idsToDelete.length > 0) {
    const del = (await prismaMongo.$runCommandRaw({
      delete: "images",
      deletes: [
        { q: { _id: { $in: idsToDelete.map((id) => ({ $oid: id })) } }, limit: 0 },
      ],
    })) as any;
    console.log(`✓ Deleted duplicate images (removed: ${del?.n ?? 0})`);
  }

  console.log("\n✅ Data repaired. Now run:  bun run db:migrate");
}

main()
  .catch((e) => {
    console.error("❌ Repair failed:", e);
    process.exit(1);
  })
  .finally(() => prismaMongo.$disconnect());
