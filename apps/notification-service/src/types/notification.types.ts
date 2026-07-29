import type { Request } from "express";

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "PUSH";

export interface SendNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: string;
  metadata?: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export interface SendOtpPayload {
  userType: string;
  name: string;
  email?: string;
  phone_number?: string;
  template?: string;
  otp: string;
}

/** Express request with authenticated user populated by isAuthenticated middleware */
export interface AuthenticatedRequest extends Request {
  user?: { id: string; [key: string]: unknown };
  seller?: { id: string; [key: string]: unknown };
  admin?: { id: string; [key: string]: unknown };
}
