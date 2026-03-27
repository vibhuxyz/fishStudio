import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { sendEmail, sendPhoneOtp, redis } from "@repo/libs";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { ENV } from "@repo/env-config";

const expo = new Expo();

/** Resolve email + phone for any userId, checking users → sellers → admins */
async function resolveUserContact(userId: string): Promise<{ name: string; email?: string | null; phone_number?: string | null } | null> {
  // 1. Regular users
  const user = await prismaMongo.users.findUnique({
    where: { id: userId },
    select: { email: true, phone_number: true, name: true },
  });
  if (user) return user;

  // 2. Sellers
  const seller = await prismaMongo.sellers.findUnique({
    where: { id: userId },
    select: { email: true, phone_number: true, name: true },
  });
  if (seller) return seller;

  // 3. Admins
  const admin = await prismaMongo.admins.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (admin) return { ...admin, phone_number: null };

  return null;
}

export class NotificationService {
  /**
   * Send a notification to a user via multiple channels.
   */
  static async send({
    userId,
    title,
    message,
    type = "INFO",
    category,
    metadata,
    channels = ["IN_APP"],
  }: {
    userId: string;
    title: string;
    message: string;
    type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
    category?: string;
    metadata?: any;
    channels?: ("IN_APP" | "EMAIL" | "SMS" | "PUSH")[];
  }) {
    const results: any = {};

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
      console.warn(`[Notification] No user/seller/admin found with id ${userId} — skipping email/SMS`);
      return results;
    }

    // 2. Email
    if (channels.includes("EMAIL") && contact.email) {
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
        console.error(`[Notification] Failed to send email to ${contact.email}:`, error);
        results.email = "failed";
      }
    }

    // 3. SMS
    if (channels.includes("SMS") && contact.phone_number) {
      try {
        if (ENV.NODE_ENV === "production") {
          await sendPhoneOtp(contact.name, contact.phone_number, message);
        } else {
          console.log(`[SMS][DEV] To ${contact.phone_number}: ${message}`);
        }
        results.sms = "sent";
      } catch (error) {
        console.error(`[Notification] Failed to send SMS to ${contact.phone_number}:`, error);
        results.sms = "failed";
      }
    }

    // 4. Push Notification
    if (channels.includes("PUSH")) {
      try {
        // Push tokens not yet implemented — log and skip
        console.log(`[PUSH] No push tokens found for user ${userId}`);
        results.push = "no_tokens";
      } catch (error) {
        console.error(`[Notification] Failed to send push to user ${userId}:`, error);
        results.push = "failed";
      }
    }

    return results;
  }

  static async getUserNotifications(userId: string) {
    return prismaPostgres.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prismaPostgres.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  static async markAllAsRead(userId: string) {
    return prismaPostgres.notification.deleteMany({
      where: { userId },
    });
  }

  /**
   * Send OTP via email or SMS
   */
  static async sendOtp(data: any) {
    const { userType, name, email, phone_number, template, otp } = data;
    let sent = false;

    // 1. Phone OTP (users only)
    if (userType === "user" && phone_number) {
      const result = await sendPhoneOtp(name, phone_number, otp);
      sent = result.success;
      if (!result.success) {
        console.warn(`[OTP] Phone OTP failed for ${phone_number}: ${result.message}`);
      }
    }

    // 2. Email OTP (fallback if phone failed or email provided)
    if (email && template && !sent) {
      try {
        await sendEmail(email, "Verify your Account", template, { name, otp });
        sent = true;
        console.log(`[OTP] Email OTP sent to ${email} for ${userType}`);
      } catch (error: any) {
        console.error(`[OTP] ❌ Email OTP failed for ${email}:`, error?.message ?? error);
        console.error(`[OTP] Stack:`, error?.stack);
      }
    }

    if (!sent) {
      console.error(`[OTP] ❌ All channels failed for ${userType} — email: ${email}, phone: ${phone_number}`);
    }

    if (sent) {
      try {
        await redis.set(`otp_status:${userType}:${phone_number || email}`, "sent", "EX", 120);
      } catch (e) {
        console.warn("⚠️ Redis not available for OTP status tracking");
      }
    }

    return sent;
  }
}
