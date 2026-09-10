import { prismaPostgres, writeAuditLog } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";

/**
 * Releases what an abandoned checkout was holding.
 *
 * This job is what makes deferring Order creation safe. A CheckoutSession takes
 * real stock and a real delivery slot the moment it is created, and nothing
 * else ever gives them back: the customer who closed the payment sheet is not
 * coming back to tell us. Without this sweep, holding resources before payment
 * would be strictly worse than the PENDING-order arrangement it replaced.
 *
 * The order of operations matters. The session is claimed FIRST, with a
 * conditional update, and only a claim that actually won releases anything.
 * A payment landing at the same moment flips the session to COMPLETED, the
 * claim matches zero rows, and this sweep leaves a paid order's stock alone.
 */

/** One line of a StockReservation's `items` JSON. */
interface ReservedItem {
  productId: string;
  quantity: number;
  size?: string;
}

const EXPIRY_BATCH_SIZE = 200;

export async function releaseExpiredCheckoutSessions() {
  const now = new Date();

  try {
    const expired = await prismaPostgres.checkoutSession.findMany({
      where: { status: "PENDING", expiresAt: { lt: now } },
      select: {
        id: true,
        userId: true,
        storeId: true,
        deliverySlot: true,
        deliveryDate: true,
        stockReservationId: true,
      },
      take: EXPIRY_BATCH_SIZE,
    });

    if (expired.length === 0) return;

    for (const session of expired) {
      // Claim before releasing anything. Conditional on still being PENDING so
      // a verify that landed a millisecond ago wins and this does nothing —
      // releasing the stock of an order that was just paid for would oversell
      // it, which is the one outcome this job must never cause.
      const claimed = await prismaPostgres.checkoutSession.updateMany({
        where: { id: session.id, status: "PENDING", orderId: null },
        data: { status: "EXPIRED" },
      });
      if (claimed.count === 0) continue;

      // Give back the delivery slot. Raw SQL rather than order-service's helper
      // because packages/jobs must not depend on a service; GREATEST guards a
      // double release from driving the count negative and handing out a free
      // place.
      if (session.deliveryDate && session.deliverySlot && session.deliverySlot !== "instant") {
        await prismaPostgres.$executeRaw`
          UPDATE "DeliverySlotBooking"
          SET "booked" = GREATEST("booked" - 1, 0), "updatedAt" = NOW()
          WHERE "storeId" = ${session.storeId}
            AND "deliveryDate" = ${session.deliveryDate}
            AND "slotKey" = ${session.deliverySlot}
        `;
      }

      await releaseReservation(session.stockReservationId);

      writeAuditLog("ORDER", session.id, "CHECKOUT_SESSION_EXPIRED", session.userId, "SYSTEM", {
        storeId: session.storeId,
        deliverySlot: session.deliverySlot,
        deliveryDate: session.deliveryDate,
      });
    }

    console.log(`[CheckoutSessionExpiry] Released ${expired.length} abandoned checkout(s)`);
  } catch (error) {
    console.error("[CheckoutSessionExpiry] Sweep failed", error);
  }
}

/**
 * Puts the reserved units back on the shelf and closes the reservation.
 *
 * Only a reservation still HELD is released, and the status flips before the
 * stock moves — a second sweep pass therefore finds nothing to do rather than
 * crediting the same units twice.
 */
async function releaseReservation(reservationId: string | null): Promise<void> {
  if (!reservationId) return;

  const claimed = await prismaPostgres.stockReservation.updateMany({
    where: { id: reservationId, status: "HELD" },
    data: { status: "RELEASED" },
  });
  if (claimed.count === 0) return;

  const reservation = await prismaPostgres.stockReservation.findUnique({
    where: { id: reservationId },
    select: { items: true },
  });
  const items = (reservation?.items ?? []) as unknown as ReservedItem[];

  await Promise.allSettled(
    items.map((item) => restoreStock(item)),
  );
}

/**
 * Returns one line's units to Mongo.
 *
 * Whole-fish style products track stock per exact weight, so a size-specific
 * line has to credit its own bucket as well as the flat pool — crediting only
 * the pool would make the product look available while every individual size
 * still read as sold out.
 */
async function restoreStock(item: ReservedItem): Promise<void> {
  if (item.size) {
    await prismaMongo.$runCommandRaw({
      update: "products",
      updates: [
        {
          q: { _id: { $oid: item.productId }, "sizeStock.size": item.size },
          u: {
            $inc: {
              "sizeStock.$[elem].qty": item.quantity,
              stock: item.quantity,
              totalSold: -item.quantity,
            },
          },
          arrayFilters: [{ "elem.size": item.size }],
        },
      ],
    });
    return;
  }

  await prismaMongo.products.update({
    where: { id: item.productId },
    data: {
      stock: { increment: item.quantity },
      totalSold: { decrement: item.quantity },
    },
  });
}
