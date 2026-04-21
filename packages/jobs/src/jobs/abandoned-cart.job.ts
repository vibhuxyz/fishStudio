import { prismaMongo } from "@repo/db-mongo";
import { publishToQueue } from "@repo/libs";

const ABANDON_THRESHOLD_HOURS = 1;   // Notify after 1 hour of no activity
const MAX_NOTIFY_AGAIN_HOURS  = 24;  // Don't re-notify within 24 hours

/**
 * Abandoned cart job — runs every 30 minutes.
 *
 * Finds users who:
 *   1. Have items in their cart (isConverted = false)
 *   2. Have NOT updated their cart for at least 1 hour
 *   3. Have NOT been notified in the last 24 hours (or never)
 *
 * Publishes a NOTIFICATION_QUEUE message per user (email + SMS channels).
 * Marks each cart with notifiedAt = now() to prevent spam.
 */
export async function checkAbandonedCarts() {
  const now = new Date();
  const abandonThreshold = new Date(now.getTime() - ABANDON_THRESHOLD_HOURS * 60 * 60 * 1000);
  const reNotifyThreshold = new Date(now.getTime() - MAX_NOTIFY_AGAIN_HOURS * 60 * 60 * 1000);

  try {
    const abandonedCarts = await prismaMongo.abandoned_carts.findMany({
      where: {
        isConverted: false,
        lastUpdatedAt: { lt: abandonThreshold }, // idle for 1+ hours
        OR: [
          { notifiedAt: null },                           // never notified
          { notifiedAt: { lt: reNotifyThreshold } },      // notified 24+ hrs ago
        ],
      },
      take: 50, // process in batches to avoid overloading the queue
    });

    if (abandonedCarts.length === 0) return;
    console.log(`[AbandonedCart] Found ${abandonedCarts.length} cart(s) to notify`);

    for (const cart of abandonedCarts) {
      // Fetch user's contact info from MongoDB
      const user = await prismaMongo.users.findUnique({
        where: { id: cart.userId },
        select: { id: true, name: true, email: true, phone_number: true },
      });

      if (!user) continue;

      const itemCount = Array.isArray(cart.items) ? cart.items.length : 0;
      const storeName = cart.storeName ?? "your favourite store";
      const total     = cart.totalAmount ? `₹${cart.totalAmount.toFixed(0)}` : "";

      const title   = "You left something behind!";
      const message =
        `Hi ${user.name ?? "there"}, you have ${itemCount} item${itemCount !== 1 ? "s" : ""} ` +
        `worth ${total} waiting in your cart at ${storeName}. ` +
        `Complete your order before they sell out!`;

      const channels: ("IN_APP" | "EMAIL" | "SMS")[] = ["IN_APP"];
      if (user.email)        channels.push("EMAIL");
      if (user.phone_number) channels.push("SMS");

      await publishToQueue("NOTIFICATION_QUEUE", {
        userId: user.id,
        title,
        message,
        type: "INFO",
        category: "CART",
        metadata: {
          storeId:     cart.storeId,
          storeName:   cart.storeName,
          totalAmount: cart.totalAmount,
          itemCount,
        },
        channels,
      });

      // Mark the cart as notified so we don't spam the user
      await prismaMongo.abandoned_carts.update({
        where: { id: cart.id },
        data: { notifiedAt: now },
      });

      console.log(`[AbandonedCart] Notified user ${user.id} (cart ${cart.id})`);
    }
  } catch (error) {
    console.error("[AbandonedCart] Job error:", error);
  }
}
