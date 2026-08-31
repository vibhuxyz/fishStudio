import { prismaMongo } from "@repo/db-mongo";
import { publishToQueue } from "@repo/libs/rabbitmq";

/**
 * Reminder schedule, in hours since the cart was last edited. Index i is
 * fired when notifyStage === i, then notifyStage advances to i + 1. Once
 * notifyStage reaches the schedule's length the cart is left alone — editing
 * it again resets notifyStage to 0 (see validateCart) and restarts the flow.
 */
const REMINDER_SCHEDULE_HOURS = [1, 3, 24, 72, 24 * 7];

/**
 * Abandoned cart job — runs every 30 minutes.
 *
 * Walks carts that aren't converted and haven't exhausted the reminder
 * schedule, and fires the next stage due for each: 1h, 3h, 1d, 3d, then 1w
 * after the last edit. Publishes a NOTIFICATION_QUEUE message per user
 * (email + SMS channels) and advances notifyStage so the same stage never
 * fires twice.
 */
export async function checkAbandonedCarts() {
  const now = new Date();

  try {
    const candidateCarts = await prismaMongo.carts.findMany({
      where: {
        isConverted: false,
        notifyStage: { lt: REMINDER_SCHEDULE_HOURS.length },
      },
      take: 50, // process in batches to avoid overloading the queue
    });

    const dueCarts = candidateCarts.filter((cart) => {
      // A cart can be open but empty — the customer removed the last line
      // rather than ordering. Reminding someone about an empty basket is
      // worse than saying nothing.
      if (!Array.isArray(cart.items) || cart.items.length === 0) return false;
      const thresholdHours = REMINDER_SCHEDULE_HOURS[cart.notifyStage]!;
      const dueAt = new Date(cart.lastUpdatedAt.getTime() + thresholdHours * 60 * 60 * 1000);
      return dueAt <= now;
    });

    if (dueCarts.length === 0) return;
    console.log(`[AbandonedCart] Found ${dueCarts.length} cart(s) to notify`);

    // One lookup for the whole batch. Per-cart findUnique meant 50 sequential
    // round trips before a single notification went out.
    const users = await prismaMongo.users.findMany({
      where: { id: { in: [...new Set(dueCarts.map((cart) => cart.userId))] } },
      select: { id: true, name: true, email: true, phone_number: true },
    });
    const userById = new Map(users.map((user) => [user.id, user]));

    const publishable = dueCarts.flatMap((cart) => {
      const user = userById.get(cart.userId);
      return user ? [{ cart, user }] : [];
    });

    const published = await Promise.allSettled(
      publishable.map(({ cart, user }) => {
        const itemCount = Array.isArray(cart.items) ? cart.items.length : 0;
        const storeName = cart.storeName ?? "your favourite store";
        const total     = cart.totalAmount ? `₹${cart.totalAmount.toFixed(0)}` : "";

        const channels: ("IN_APP" | "EMAIL" | "SMS")[] = ["IN_APP"];
        if (user.email)        channels.push("EMAIL");
        if (user.phone_number) channels.push("SMS");

        return publishToQueue("NOTIFICATION_QUEUE", {
          userId: user.id,
          title: "You left something behind!",
          message:
            `Hi ${user.name ?? "there"}, you have ${itemCount} item${itemCount !== 1 ? "s" : ""} ` +
            `worth ${total} waiting in your cart at ${storeName}. ` +
            `Complete your order before they sell out!`,
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
      }),
    );

    // Only carts whose reminder actually reached the queue advance a stage —
    // marking a failed one would silently skip it for the rest of the schedule.
    const notifiedIds = publishable
      .filter((_, i) => published[i]!.status === "fulfilled")
      .map(({ cart }) => cart.id);

    const failed = published.length - notifiedIds.length;
    if (failed > 0) {
      console.error(`[AbandonedCart] ${failed} reminder(s) failed to publish, leaving them unmarked`);
    }

    if (notifiedIds.length > 0) {
      await prismaMongo.carts.updateMany({
        where: { id: { in: notifiedIds } },
        data: { notifiedAt: now, notifyStage: { increment: 1 } },
      });
      console.log(`[AbandonedCart] Notified ${notifiedIds.length} user(s)`);
    }
  } catch (error) {
    console.error("[AbandonedCart] Job error:", error);
  }
}
