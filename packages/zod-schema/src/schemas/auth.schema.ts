import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
});

export const verifyStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

export const updateStaffAccessSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  isActive: z.boolean(),
});

export const sellerSignupCodeSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().min(1, "Code is required"),
});

export const registerSellerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  code: z.string().min(1, "Access code is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const verifySellerSchema = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().length(4, "OTP must be 4 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  phone_number: z.string().min(10, "Invalid phone number"),
  code: z.string().min(1, "Access code is required"),
  shop: z.any().optional(),
  store: z.any().optional(),
});

export const updateSellerApprovalSchema = z.object({
  isApprovedByAdmin: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

export const forgetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(4, "OTP must be 4 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
