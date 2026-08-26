import { prismaPostgres } from "@repo/db-postgres";

/**
 * One-off backfill of Order.paymentStatus = NOT_PAID for orders cancelled or
 * rejected before that enum value existed (migration
 * 20260826120000_add_payment_status_not_paid).
 *
 * Until then every cancellation path left paymentStatus on PENDING, so a
 * cancelled COD order and an abandoned online checkout both read "Pending" —
 * i.e. money outstanding — on every dashboard, forever. Run once after
 * deploying:
 *
 *   pnpm --filter @repo/jobs backfill:not-paid-orders
 *
 * Idempotent: only CANCELLED/REJECTED rows still on PENDING are touched, so a
 * partial run can simply be repeated. Orders that were actually paid are
 * COMPLETED (or already in a refund state) and are never matched.
 */

async function backfillNotPaidOrders() {
  const result = await prismaPostgres.order.updateMany({
    where: {
      status: { in: ["CANCELLED", "REJECTED"] },
      paymentStatus: "PENDING",
    },
    data: { paymentStatus: "NOT_PAID" },
  });

  // The Payment rows behind them, for the same reason — the order detail view
  // lists them individually.
  const payments = await prismaPostgres.payment.updateMany({
    where: {
      status: "PENDING",
      order: { status: { in: ["CANCELLED", "REJECTED"] } },
    },
    data: { status: "NOT_PAID" },
  });

  console.log(
    `[BACKFILL] ✅ ${result.count} orders and ${payments.count} payment rows moved from PENDING to NOT_PAID`,
  );
}

backfillNotPaidOrders()
  .catch((error) => {
    console.error("[BACKFILL] ❌ Failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prismaPostgres.$disconnect());
