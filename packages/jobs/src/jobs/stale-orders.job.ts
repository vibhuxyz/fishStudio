import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { publishToQueue } from "@repo/libs";

/**
 * Cancel online-payment orders that were never paid.
 *
 * Stock is reserved in Mongo BEFORE the order is created, so an abandoned
 * Razorpay checkout (user closes the tab, payment fails and is never retried)
 * holds that stock forever unless something releases it. COD orders are
 * excluded — they stay PENDING until the seller accepts or rejects them.
 */
const UNPAID_ORDER_TTL_MS = 30 * 60 * 1000;

export async function cancelStaleUnpaidOrders() {
  const threshold = new Date(Date.now() - UNPAID_ORDER_TTL_MS);

  try {
    const staleOrders = await prismaPostgres.order.findMany({
      where: {
        status: "PENDING",
        paymentStatus: { in: ["PENDING", "FAILED"] },
        paymentMethod: { not: "COD" },
        createdAt: { lt: threshold },
      },
      include: { orderItems: true },
    });

    for (const order of staleOrders) {
      // Conditional update so a payment webhook landing between the findMany
      // and this write doesn't get clobbered — if the payment completed in
      // the meantime, count is 0 and we leave the order alone.
      const updated = await prismaPostgres.order.updateMany({
        where: {
          id: order.id,
          status: "PENDING",
          paymentStatus: { in: ["PENDING", "FAILED"] },
        },
        data: {
          status: "CANCELLED",
          rejectionReason: "Payment was not completed in time",
        },
      });
      if (updated.count === 0) continue;

      await prismaPostgres.payment.updateMany({
        where: { orderId: order.id, status: "PENDING" },
        data: { status: "FAILED" },
      });

      // Release the reserved Mongo stock
      await Promise.allSettled(
        order.orderItems.map((item) =>
          prismaMongo.products.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              totalSold: { decrement: item.quantity },
            },
          }),
        ),
      );

      try {
        const shortId = order.id.slice(-6).toUpperCase();
        await publishToQueue("NOTIFICATION_QUEUE", {
          userId: order.userId,
          title: "Order Cancelled",
          message: `Your order #${shortId} was cancelled because payment was not completed. Reserved items have been released.`,
          type: "INFO",
          category: "ORDER",
          metadata: { orderId: order.id },
          channels: ["IN_APP"],
        });
      } catch {
        /* non-critical */
      }

      console.log(
        `[JOB] 🧹 Cancelled stale unpaid order ${order.id} (${order.orderItems.length} items restocked)`,
      );
    }
  } catch (error) {
    console.error("[JOB] ❌ Error cancelling stale unpaid orders:", error);
  }
}
