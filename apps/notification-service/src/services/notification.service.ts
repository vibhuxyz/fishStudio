import { prismaPostgres } from "@repo/db-postgres";
import { sendEmail } from "@repo/libs/sendMail";
import { sendPhoneOtp } from "@repo/libs/sendOtp";
import { logger } from "@repo/libs/logger";
import { ENV } from "@repo/env-config";
import { resolveUserContact } from "../utils/resolve-contact.js";
import { MAX_NOTIFICATIONS_PER_PAGE } from "../config/constants.js";
import type { SendNotificationPayload } from "../types/notification.types.js";

// Re-export OTP service for backward compatibility with consumer imports
export { sendOtp } from "./otp.service.js";

/**
 * Send a notification to a user via multiple channels.
 */
export async function send({
  userId,
  title,
  message,
  type = "INFO",
  category,
  metadata,
  channels = ["IN_APP"],
}: SendNotificationPayload) {
  const results: Record<string, string | object> = {};

  // 1. In-App Notification (stored in Postgres)
  if (channels.includes("IN_APP")) {
    results.inApp = await prismaPostgres.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        category,
        metadata: metadata || {},
      },
    });
  }

  // Fetch contact details from the appropriate table
  const contact = await resolveUserContact(userId);

  if (!contact) {
    logger.warn(`[Notification] No user/seller/admin found with id ${userId} — skipping email/SMS`);
    return results;
  }

  // 2. Email — customer accounts can opt out (emailNotificationsEnabled ===
  // false); sellers/admins and accounts that never set the preference
  // (undefined/null) keep the previous always-on behavior.
  if (channels.includes("EMAIL") && contact.email && contact.emailNotificationsEnabled !== false) {
    try {
      const template = metadata?.template || "notification-template";
      await sendEmail(contact.email, title, template, {
        name: contact.name,
        title,
        message,
        metadata: metadata || {}
      });
      results.email = "sent";
    } catch (error) {
      logger.error(`[Notification] Failed to send email to ${contact.email}`, error);
      results.email = "failed";
    }
  }

  // 3. SMS
  if (channels.includes("SMS") && contact.phone_number) {
    try {
      if (ENV.NODE_ENV === "production") {
        await sendPhoneOtp(contact.name, contact.phone_number, message);
      } else {
        logger.info(`[SMS][DEV] To ${contact.phone_number}: ${message}`);
      }
      results.sms = "sent";
    } catch (error) {
      logger.error(`[Notification] Failed to send SMS to ${contact.phone_number}`, error);
      results.sms = "failed";
    }
  }

  // 4. Push Notification — not yet implemented (no push token storage)
  if (channels.includes("PUSH")) {
    logger.info(`[PUSH] No push tokens found for user ${userId} — skipping`);
    results.push = "no_tokens";
  }

  return results;
}

/**
 * A page of a user's notifications, newest first.
 *
 * Cursor rather than offset because this is an infinite-scroll feed whose head
 * moves: new notifications arrive while a user is scrolling, and with an offset
 * every insert shifts the window and duplicates a row onto the next page. The
 * cursor is a notification id, so paging stays anchored to a real position.
 *
 * Purely additive — the endpoint previously took no pagination parameters at
 * all and simply capped the result, so callers that pass nothing still get the
 * same first page they always did.
 */
export async function getUserNotifications(
  userId: string,
  options: { cursor?: string; limit?: number } = {},
) {
  const limit = Math.min(
    Math.max(options.limit ?? MAX_NOTIFICATIONS_PER_PAGE, 1),
    MAX_NOTIFICATIONS_PER_PAGE,
  );

  const rows = await prismaPostgres.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    // One extra row is fetched purely to answer "is there another page?"
    // without a second count query, then dropped before returning.
    take: limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > limit;
  const notifications = hasMore ? rows.slice(0, limit) : rows;

  return {
    notifications,
    hasMore,
    nextCursor: hasMore ? (notifications[notifications.length - 1]?.id ?? null) : null,
  };
}

export async function markAsRead(notificationId: string, userId: string) {
  return prismaPostgres.notification.updateMany({
    where: { id: notificationId, userId, isRead: false },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prismaPostgres.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
