import { z } from "zod";

export const riderVehicleTypeValues = ["BIKE", "SCOOTER", "BICYCLE", "OTHER"] as const;
export const riderStatusValues = ["AVAILABLE", "DELIVERING", "OFFLINE", "ON_LEAVE"] as const;

export const createRiderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email().optional().or(z.literal("")),
  avatarId: z.string().optional(),
  vehicleType: z.enum(riderVehicleTypeValues),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  deliveryZone: z.string().optional(),
  notes: z.string().optional(),
});

export const updateRiderSchema = createRiderSchema.partial();

// Manual status set (Offline / On Leave / back to Available) — deliberately
// excludes DELIVERING, which only happens as a side effect of the
// assign-rider endpoint, mirroring why ASSIGNED_TO_RIDER is excluded from
// the seller-facing order status schema.
export const updateRiderStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "OFFLINE", "ON_LEAVE"]),
});

export const toggleRiderActiveSchema = z.object({
  isActive: z.boolean(),
});

export const assignRiderSchema = z.object({
  riderId: z.string().min(1, "riderId is required"),
});
