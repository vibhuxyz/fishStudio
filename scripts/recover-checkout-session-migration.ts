/**
 * One-off recovery for the failed `20260907212652_new` migration.
 *
 * Background: the checkout-sessions migration was applied, then a stray
 * auto-generated migration failed against it and left an unfinished row in
 * `_prisma_migrations`, which blocks every later Prisma command. The migration
 * directory was also renamed afterwards, so the database now records two
 * migrations the directory does not contain — the state that makes
 * `migrate dev` offer to reset the whole schema.
 *
 * This clears exactly that, and only that: the CheckoutSession table, its enum,
 * and the two history rows. Every other table, type and migration record is
 * untouched. Afterwards, `bun run db:deploy` lays the table down again from
 * `20260907190000_checkout_sessions`.
 *
 * Safe ONLY while CheckoutSession is empty, which it re-checks itself and
 * refuses to proceed without. Delete this file once it has been run.
 *
 *   bunx dotenv -e .env -- bun run scripts/recover-checkout-session-migration.ts
 */
import { PrismaClient } from "../packages/db-postgres/prisma/generated-client/index.js";

const prisma = new PrismaClient();

const STALE_MIGRATIONS = ["20260907212652_new", "20260908120000_checkout_sessions"];

async function main() {
  const exists = await prisma.$queryRawUnsafe<Array<{ present: boolean }>>(
    `SELECT to_regclass('public."CheckoutSession"') IS NOT NULL AS present`,
  );

  // Re-checked here rather than trusted from an earlier look: the entire reason
  // this is safe is that the table is empty, and that has to be true at the
  // moment of the drop, not a minute before it.
  if (exists[0]?.present) {
    const counted = await prisma.$queryRawUnsafe<Array<{ n: bigint }>>(
      `SELECT count(*)::bigint AS n FROM "CheckoutSession"`,
    );
    const rows = Number(counted[0]?.n ?? 0);
    if (rows !== 0) {
      console.error(
        `\n  ✖ ABORT: CheckoutSession holds ${rows} row(s).\n` +
          "    Dropping it would destroy live checkouts. Nothing was changed.\n",
      );
      process.exitCode = 1;
      return;
    }
  }

  await prisma.$transaction([
    prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "CheckoutSession"`),
    prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "CheckoutSessionStatus"`),
    prisma.$executeRawUnsafe(
      `DELETE FROM "_prisma_migrations" WHERE migration_name = ANY($1::text[])`,
      STALE_MIGRATIONS,
    ),
  ]);

  const leftover = await prisma.$queryRawUnsafe<Array<{ migration_name: string }>>(
    `SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = ANY($1::text[])`,
    STALE_MIGRATIONS,
  );

  console.log("\n  ✓ Dropped CheckoutSession + CheckoutSessionStatus");
  console.log(`  ✓ Cleared history rows: ${STALE_MIGRATIONS.join(", ")}`);
  console.log(
    leftover.length === 0
      ? "  ✓ No stale checkout-session migration records remain\n"
      : `  ⚠ Unexpected leftovers: ${leftover.map((r) => r.migration_name).join(", ")}\n`,
  );
  console.log("  Next:  bun run db:deploy\n");
}

main()
  .catch((error) => {
    console.error("\n  ✖ Recovery failed. Nothing was committed.\n", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
