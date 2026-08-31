/**
 * One-off: move the Mongo `abandoned_carts` collection to `carts`.
 *
 * The collection was always the user's cart — it just predated the cart being
 * read back across devices, so it was named after the only job it then had.
 * The Prisma model now maps to `carts`, so this must run once against each
 * environment before deploying that change, or every cart read hits an empty
 * collection.
 *
 * Idempotent: safe to re-run, and a no-op once the move has happened.
 *
 *   bun run scripts/rename-abandoned-carts-collection.ts
 *
 * Afterwards, recreate the indexes (see the note at the end of main):
 *
 *   cd packages/db-mongo && bunx prisma db push
 *
 * Implemented with Prisma's $runCommandRaw rather than the Mongo driver, so it
 * needs no dependency the repo doesn't already have. Note that means a copy
 * ($out) plus a drop rather than a true renameCollection — `renameCollection`
 * may only be run against the `admin` database, which Prisma's connection is
 * not attached to.
 */
import { prismaMongo as prisma } from "@repo/db-mongo";

const OLD_NAME = "abandoned_carts";
const NEW_NAME = "carts";

/** $runCommandRaw is typed as a JSON value; read one numeric field off it. */
const numberField = (result: unknown, key: string): number => {
  if (typeof result === "object" && result !== null) {
    const value = (result as Record<string, unknown>)[key];
    if (typeof value === "number") return value;
  }
  return 0;
};

async function listCollectionNames(): Promise<Set<string>> {
  // Unfiltered: Atlas rejects a `$in` filter here ("can't get regex from
  // filter doc"), and the collection count is small enough that matching the
  // two names client-side is simpler than finding a filter every deployment
  // target accepts.
  const result = await prisma.$runCommandRaw({
    listCollections: 1,
    nameOnly: true,
  });

  const batch =
    typeof result === "object" && result !== null
      ? (result as { cursor?: { firstBatch?: unknown } }).cursor?.firstBatch
      : undefined;

  const names = new Set<string>();
  if (Array.isArray(batch)) {
    for (const entry of batch) {
      const name = (entry as { name?: unknown })?.name;
      if (typeof name === "string") names.add(name);
    }
  }
  return names;
}

async function countDocuments(collection: string): Promise<number> {
  const result = await prisma.$runCommandRaw({ count: collection });
  return numberField(result, "n");
}

async function main() {
  const names = await listCollectionNames();
  const hasOld = names.has(OLD_NAME);
  const hasNew = names.has(NEW_NAME);

  if (hasOld && hasNew) {
    // Both existing is the normal case, not an error: `prisma db push` creates
    // `carts` (with its unique index) from the schema, so the target is
    // usually already there and empty before this ever runs.
    const targetCount = await countDocuments(NEW_NAME);
    if (targetCount > 0) {
      // Genuinely ambiguous. Merging would need a per-user conflict rule on a
      // unique userId index — which cart wins when the same user has one in
      // each? That is a decision this script must not make on its own.
      throw new Error(
        `Both "${OLD_NAME}" and "${NEW_NAME}" hold documents ` +
          `(${await countDocuments(OLD_NAME)} and ${targetCount}). Refusing to ` +
          `guess how to merge them — inspect both collections and consolidate ` +
          `by hand.`,
      );
    }
    // Empty target: nothing to lose. $out replaces it wholesale anyway, so
    // dropping first only makes that explicit.
    console.log(`[rename-carts] "${NEW_NAME}" exists but is empty — proceeding`);
    await prisma.$runCommandRaw({ drop: NEW_NAME });
  }

  if (!hasOld) {
    console.log(
      hasNew
        ? `[rename-carts] already done — "${NEW_NAME}" exists, nothing to do`
        : `[rename-carts] no "${OLD_NAME}" collection — fresh database, nothing to do`,
    );
    return;
  }

  const sourceCount = await countDocuments(OLD_NAME);

  if (sourceCount === 0) {
    // $out on an empty pipeline is a no-op in some server versions, so an
    // empty source is handled by simply dropping it — Prisma creates `carts`
    // on the first write.
    await prisma.$runCommandRaw({ drop: OLD_NAME });
    console.log(`[rename-carts] "${OLD_NAME}" was empty — dropped, nothing to copy`);
    return;
  }

  // $out writes the whole result set into the target atomically from the
  // reader's point of view: the target does not exist until the copy is
  // complete, so a crash midway leaves the source untouched and nothing half
  // written for the app to read.
  await prisma.$runCommandRaw({
    aggregate: OLD_NAME,
    pipeline: [{ $out: NEW_NAME }],
    cursor: {},
  });

  const copiedCount = await countDocuments(NEW_NAME);
  if (copiedCount !== sourceCount) {
    // Source is deliberately left in place: a partial copy is recoverable,
    // dropping the only complete copy is not.
    throw new Error(
      `Copy verification failed — ${sourceCount} document(s) in "${OLD_NAME}" ` +
        `but ${copiedCount} in "${NEW_NAME}". "${OLD_NAME}" has been left ` +
        `untouched; investigate before re-running.`,
    );
  }

  await prisma.$runCommandRaw({ drop: OLD_NAME });

  console.log(
    `[rename-carts] moved ${copiedCount} document(s) "${OLD_NAME}" → "${NEW_NAME}"`,
  );
  // $out copies documents, not indexes, and the unique userId index is what
  // stops a user ending up with two carts. db push recreates it from the
  // schema; until then, cart upserts are not protected by it.
  console.log(
    `[rename-carts] NEXT: cd packages/db-mongo && bunx prisma db push  ` +
      `(recreates the unique userId index, which $out does not copy)`,
  );
}

main()
  .catch((err) => {
    console.error("[rename-carts] failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
