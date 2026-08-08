import { z } from "zod";
import { riderVehicleTypeValues } from "./rider.schema.js";

export const staffRoleValues = ["ORDER_MANAGER", "RIDER", "CUTTING_STAFF"] as const;

// Seller-direct-create path for RIDER/CUTTING_STAFF — no OTP, active immediately.
// The ORDER_MANAGER role keeps using registerStaffSchema/verifyStaffSchema (OTP flow).
export const createOperationalStaffSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscore and dot"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
    photoId: z.string().optional(),
    role: z.enum(["RIDER", "CUTTING_STAFF"]),
    vehicleType: z.enum(riderVehicleTypeValues).optional(),
    vehicleNumber: z.string().optional(),
    deliveryZone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "RIDER" && !data.vehicleType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vehicleType"],
        message: "Vehicle type is required for riders",
      });
    }
    if (data.role === "RIDER" && !data.vehicleNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vehicleNumber"],
        message: "Vehicle number is required for riders",
      });
    }
  });

export const updateOperationalStaffSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  photoId: z.string().optional(),
  vehicleType: z.enum(riderVehicleTypeValues).optional(),
  vehicleNumber: z.string().optional(),
  deliveryZone: z.string().optional(),
});

export const staffLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const resetStaffPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

// Manual status set (Offline / On Leave / back to Available) — deliberately
// excludes DELIVERING, which only happens as a side effect of the
// assign-rider endpoint, mirroring why ASSIGNED_TO_RIDER is excluded from
// the seller-facing order status schema.
export const updateStaffRiderStatusSchema = z.object({
  riderStatus: z.enum(["AVAILABLE", "OFFLINE", "ON_LEAVE"]),
});

export const toggleStaffActiveSchema = z.object({
  isActive: z.boolean(),
});
