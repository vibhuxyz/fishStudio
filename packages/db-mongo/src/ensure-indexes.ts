import { prismaMongo } from "./client.js";

/**
 * Mongo indexes Prisma cannot express.
 *
 * Prisma's Mongo connector has no syntax for sparse, partial or TTL indexes, so
 * these used to exist only as comments in schema.prisma saying "create this by
 * hand once". That is not a deployment step anyone reliably performs — a fresh
 * environment silently comes up without the unique constraints on users.email /
 * phone_number, and without the TTL that keeps product_views from growing
 * forever.
 *
 * Run after `prisma db push`, and on deploy:
 *
 *   pnpm --filter @repo/db-mongo db:indexes
 *
 * Idempotent: createIndexes is a no-op for an index that already exists with
 * the same shape and options. An index whose *options* changed must be dropped
 * first — Mongo raises IndexOptionsConflict rather than silently altering it,
 * which this reports and treats as a failure.
 */

const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60;

/**
 * A `type` rather than an `interface` so it carries an implicit index
 * signature and is therefore assignable to Prisma's InputJsonValue, which is
 * what $runCommandRaw takes.
 *
 * `sparse` pairs with `unique` on optional fields: a plain unique index treats
 * every missing value as the same null, so it would allow only one document
 * without one.
 */
type IndexSpec = {
  key: Record<string, 1 | -1>;
  name: string;
  unique?: boolean;
  sparse?: boolean;
  expireAfterSeconds?: number;
};

const INDEXES: { collection: string; indexes: IndexSpec[] }[] = [
  {
    collection: "users",
    indexes: [
      { key: { email: 1 }, name: "users_email_unique", unique: true, sparse: true },
      { key: { phone_number: 1 }, name: "users_phone_unique", unique: true, sparse: true },
      { key: { referralCode: 1 }, name: "users_referralCode_unique", unique: true, sparse: true },
    ],
  },
  {
    collection: "signup_access_codes",
    indexes: [
      {
        key: { email: 1, role: 1 },
        name: "signup_access_codes_email_role_unique",
        unique: true,
        sparse: true,
      },
    ],
  },
  {
    collection: "product_views",
    indexes: [
      {
        // Recently-viewed and the affinity recommendations are only ever
        // computed over a recent window, so views expire instead of
        // accumulating forever.
        key: { createdAt: 1 },
        name: "product_views_ttl",
        expireAfterSeconds: NINETY_DAYS_SECONDS,
      },
    ],
  },
];

// IndexOptionsConflict / IndexKeySpecsConflict — an index of this name or shape
// exists with different options. Changing it is destructive, so it is surfaced
// rather than done implicitly.
const CONFLICT_CODES = new Set([85, 86]);

export async function ensureMongoIndexes(): Promise<number> {
  let conflicts = 0;

  for (const { collection, indexes } of INDEXES) {
    try {
      await prismaMongo.$runCommandRaw({ createIndexes: collection, indexes });
      console.log(`✔ ${collection}: ${indexes.map((i) => i.name).join(", ")}`);
    } catch (err) {
      const code = (err as { code?: number | string })?.code;
      if (CONFLICT_CODES.has(Number(code))) {
        console.warn(
          `⚠ ${collection}: an index exists with different options — ` +
            `drop it manually before re-running to change it.`,
        );
        conflicts++;
        continue;
      }
      throw err;
    }
  }

  return conflicts;
}

// Executed directly (not imported) — run the ensure and set an exit code a
// deploy pipeline can act on.
ensureMongoIndexes()
  .then(async (conflicts) => {
    console.log(`\nDone with ${conflicts} conflict(s).`);
    await prismaMongo.$disconnect();
    // A conflict means the database does not match what this file declares,
    // which a deploy should treat as a failure rather than ignore.
    if (conflicts > 0) process.exitCode = 1;
  })
  .catch(async (err) => {
    console.error("Failed to ensure Mongo indexes:", err);
    await prismaMongo.$disconnect();
    process.exit(1);
  });
