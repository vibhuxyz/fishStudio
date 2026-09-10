/**
 * One-off backfill for Order.orderNumber (FS-NOI-30082026-001).
 *
 * Sequential order numbers are allocated at checkout (allocateOrderNumber),
 * but only for orders placed after the feature shipped AND at a store whose
 * `locationCode` was set at the time. Every other order carries a NULL
 * orderNumber and falls back to the id-derived form (FSFIO0BQ6QP0) on every
 * screen. This assigns real numbers to those orders.
 *
 * Method — matches what allocateOrderNumber would have done, in bulk:
 *   1. Take every order with a NULL orderNumber, oldest first.
 *   2. Resolve each order's store location code from Mongo (skip stores that
 *      still have none — nothing to build a number from).
 *   3. Group by (locationCode, IST calendar day of createdAt).
 *   4. Number each group in chronological order, CONTINUING from whatever
 *      OrderNumberSequence.lastSeq already holds for that (location, day) so a
 *      backfilled day that also saw live traffic never reuses a number.
 *   5. Write the orders and bump OrderNumberSequence in one transaction per
 *      group.
 *
 * Idempotent: it only ever touches NULL orderNumbers and always advances the
 * sequence, so a second run is a no-op (bar any orders that became eligible in
 * between — e.g. an admin set a store's code).
 *
 * Caveat: for a day that already has live orders, backfilled orders from
 * earlier that same day will get numbers AFTER the live ones — the sequence
 * only moves forward. Past days (the overwhelming majority) are unaffected.
 *
 * Dry run by default. Pass --apply to write.
 *
 *   bunx dotenv -e .env -- bun run scripts/backfill-order-numbers.ts
 *   bunx dotenv -e .env -- bun run scripts/backfill-order-numbers.ts --apply
 *
 * Delete this file once it has been run in production.
 */
// Relative imports (not @repo/*) so this one-off runs from the repo root
// without new workspace deps — same pattern as the other scripts/ files.
import { PrismaClient } from "../packages/db-postgres/prisma/generated-client/index.js";
import { prismaMongo } from "@repo/db-mongo";
import {
  buildOrderNumber,
  orderDateKey,
  resolveOrderLocationCode,
} from "../packages/shared/dist/order-id/index.js";

// The city string on older orders was whatever the address form held at the
// time — often the locality ("Pari chowk") or a mistyped city, so it misses
// the store's per-city code map. The delivery pincode is reliable, so fall
// back to the registered area that owns that pincode and use its real city.
function cityFromPincode(
  store: { areaPincodes?: unknown; areaCities?: unknown },
  pincode: string | null,
): string | null {
  if (!pincode) return null;
  const areaPincodes = (store.areaPincodes ?? {}) as Record<string, string>;
  const areaCities = (store.areaCities ?? {}) as Record<string, string>;
  for (const [area, pin] of Object.entries(areaPincodes)) {
    if (pin === pincode && areaCities[area]) return areaCities[area];
  }
  return null;
}

const prismaPostgres = new PrismaClient();

const APPLY = process.argv.includes("--apply");

async function main() {
  const orders = await prismaPostgres.order.findMany({
    where: { orderNumber: null },
    select: {
      id: true,
      storeId: true,
      createdAt: true,
      deliveryCity: true,
      deliveryPincode: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (orders.length === 0) {
    console.log("\n  ✓ No orders with a missing order number. Nothing to do.\n");
    return;
  }

  const storeIds = [...new Set(orders.map((o) => o.storeId))];
  const stores = await prismaMongo.stores.findMany({
    where: { id: { in: storeIds } },
    select: {
      id: true,
      name: true,
      locationCode: true,
      cityLocationCodes: true,
      areaPincodes: true,
      areaCities: true,
    },
  });
  const storeById = new Map(stores.map((s) => [s.id, s]));

  // group key -> { locationCode, dateKey, orderIds[] } in chronological order
  const groups = new Map<
    string,
    { locationCode: string; dateKey: string; orderIds: string[] }
  >();
  let skippedNoCode = 0;

  for (const order of orders) {
    const store = storeById.get(order.storeId);
    const locationCode = store
      ? resolveOrderLocationCode(store, order.deliveryCity) ||
        resolveOrderLocationCode(
          store,
          cityFromPincode(store, order.deliveryPincode),
        )
      : null;
    if (!locationCode) {
      skippedNoCode++;
      continue;
    }
    const dateKey = orderDateKey(order.createdAt);
    const key = `${locationCode}|${dateKey}`;
    let group = groups.get(key);
    if (!group) {
      group = { locationCode, dateKey, orderIds: [] };
      groups.set(key, group);
    }
    group.orderIds.push(order.id);
  }

  console.log(
    `\n  ${orders.length} order(s) without a number` +
      `\n  ${skippedNoCode} skipped — store has no locationCode` +
      `\n  ${groups.size} (location, day) group(s) to number` +
      `\n  mode: ${APPLY ? "APPLY" : "DRY RUN"}\n`,
  );

  let numbered = 0;

  for (const { locationCode, dateKey, orderIds } of groups.values()) {
    const existing = await prismaPostgres.orderNumberSequence.findUnique({
      where: { locationCode_dateKey: { locationCode, dateKey } },
      select: { lastSeq: true },
    });
    let seq = existing?.lastSeq ?? 0;

    const assignments = orderIds.map((id) => {
      seq += 1;
      return { id, orderNumber: buildOrderNumber({ locationCode, dateKey, seq }) };
    });

    const first = assignments[0];
    const last = assignments[assignments.length - 1];
    console.log(
      `  FS-${locationCode}-${dateKey}: ${assignments.length} order(s) → ` +
        `${first.orderNumber}` +
        (last !== first ? ` … ${last.orderNumber}` : ""),
    );

    if (APPLY) {
      await prismaPostgres.$transaction([
        ...assignments.map((a) =>
          prismaPostgres.order.update({
            where: { id: a.id },
            data: { orderNumber: a.orderNumber },
          }),
        ),
        prismaPostgres.orderNumberSequence.upsert({
          where: { locationCode_dateKey: { locationCode, dateKey } },
          create: { locationCode, dateKey, lastSeq: seq },
          update: { lastSeq: seq },
        }),
      ]);
    }

    numbered += assignments.length;
  }

  console.log(
    `\n  ${APPLY ? "✓ Wrote" : "Would write"} ${numbered} order number(s) ` +
      `across ${groups.size} group(s).` +
      (APPLY ? "" : "\n  Re-run with --apply to commit.") +
      "\n",
  );
}

main()
  .catch((error) => {
    console.error("\n  ✖ Backfill failed. Nothing left half-written.\n", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prismaPostgres.$disconnect();
    await prismaMongo.$disconnect();
  });
