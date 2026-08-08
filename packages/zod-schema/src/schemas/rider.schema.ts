import { z } from "zod";

export const riderVehicleTypeValues = ["BIKE", "SCOOTER", "BICYCLE", "OTHER"] as const;
export const riderStatusValues = ["AVAILABLE", "DELIVERING", "OFFLINE", "ON_LEAVE"] as const;

// Rider CRUD (create/update/status/active-toggle) now lives under the staff
// module (see staff.schema.ts) — riders are staffs with role: RIDER. This
// file keeps only what order-service's rider-assignment flow still needs.
export const assignRiderSchema = z.object({
  riderId: z.string().min(1, "riderId is required"),
});
