import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { sendEmail, sendPhoneOtp, redis } from "@repo/libs";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { ENV } from "@repo/env-config";

const expo = new Expo();

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

    // 1. In-App Notification (Always stored in Postgres if requested)
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

    // Fetch user details from Mongo for other channels
    const user = await prismaMongo.users.findUnique({
      where: { id: userId },
      select: { email: true, phone_number: true, name: true },
    });

    if (!user) {
      console.warn(`User ${userId} not found in Mongo for notification`);
      return results;
    }

    // 2. Email
    if (channels.includes("EMAIL") && user.email) {
      try {
        await sendEmail(user.email, title, "notification-template", {
          name: user.name,
          title,
          message,
          qty: 1, // Placeholder if needed
        });
        results.email = "sent";
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        results.email = "failed";
      }
    }

    // 3. SMS
    if (channels.includes("SMS") && user.phone_number) {
      try {
        console.log(`[SMS] Sending to ${user.phone_number}: ${message}`);
        results.sms = "sent";
      } catch (error) {
        console.error(`Failed to send SMS to ${user.phone_number}:`, error);
        results.sms = "failed";
      }
    }

    // 4. Push Notification (Mobile)
    if (channels.includes("PUSH")) {
      try {
        const pushTokens = await prismaMongo.users.findUnique({
          where: { id: userId },
          select: { id: true }
        }).then(async (u) => {
          // Assuming push tokens are stored in a separate field or relation in Mongo
          // For now, let's just log and simulate if we don't have a formal schema for tokens yet
          return []; 
        });

        if (pushTokens && pushTokens.length > 0) {
          const messages: ExpoPushMessage[] = pushTokens.map(token => ({
            to: token,
            sound: "default",
            title,
            body: message,
            data: metadata || {},
          }));

          const chunks = expo.chunkPushNotifications(messages);
          for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
          }
          results.push = "sent";
        } else {
          console.log(`[PUSH] No push tokens found for user ${userId}`);
          results.push = "no_tokens";
        }
      } catch (error) {
        console.error(`Failed to send push notification to user ${userId}:`, error);
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
    return prismaPostgres.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prismaPostgres.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Consolidate OTP logic from rabbitMQ-service
   */
  static async sendOtp(data: any) {
    const { userType, name, email, phone_number, template, otp } = data;
    let sent = false;

    // 1. Phone OTP
    if (userType === "user" && phone_number) {
        if (ENV.NODE_ENV === "production") {
            await sendPhoneOtp(name, phone_number, otp);
        } else {
            console.log(`📱 [DEV] OTP for ${phone_number}: ${otp}`);
        }
        sent = true;
    }

    // 2. Email OTP
    if (email && template && !sent) {
        await sendEmail(email, "Verify your Account", template, {
            name,
            otp,
        });
        sent = true;
    }

    if (sent) {
        try {
            await redis.set(`otp_status:${userType}`, "sent", "EX", 300);
        } catch (e) {
            console.warn("⚠️ Redis not available for status tracking");
        }
    }
    
    return sent;
  }
}
