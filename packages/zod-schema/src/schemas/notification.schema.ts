import { z } from "zod";

/** Schema for notification queue messages published by other services */
export const notificationMessageSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  title: z.string().min(1, "title is required"),
  message: z.string().min(1, "message is required"),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]).default("INFO"),
  category: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  channels: z
    .array(z.enum(["IN_APP", "EMAIL", "SMS", "PUSH"]))
    .default(["IN_APP"]),
});

/** Schema for OTP queue messages published by auth-service */
export const otpMessageSchema = z.object({
  userType: z.string().min(1, "userType is required"),
  name: z.string().min(1, "name is required"),
  email: z.string().email().optional(),
  phone_number: z.string().optional(),
  template: z.string().optional(),
  otp: z.string().min(1, "otp is required"),
});
