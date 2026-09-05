import { z } from "zod";

export const riderVehicleTypeValues = ["BIKE", "SCOOTER", "BICYCLE", "OTHER"] as const;
export const riderStatusValues = ["AVAILABLE", "DELIVERING", "OFFLINE", "ON_LEAVE"] as const;

// Rider CRUD (create/update/status/active-toggle) now lives under the staff
// module (see staff.schema.ts) — riders are staffs with role: RIDER. This
// file keeps only what order-service's rider-assignment flow still needs.
export const assignRiderSchema = z.object({
  riderId: z.string().min(1, "riderId is required"),
});

/**
 * Handing a batch of nearby drops to one rider in a single action.
 *
 * Capped at 25 because the whole batch is checked against the rider's
 * remaining capacity in one pass — a larger list would mostly be rejections.
 */
export const bulkAssignRiderSchema = z.object({
  riderId: z.string().min(1, "riderId is required"),
  orderIds: z
    .array(z.string().min(1))
    .min(1, "Select at least one order")
    .max(25, "Assign at most 25 orders at a time"),
});

/**
 * A manager acknowledging cash handed over by a rider.
 *
 * The collections to settle are named explicitly rather than implied by
 * "everything outstanding": a rider commonly hands over part of what they hold,
 * and settling the whole balance because that was easier to implement would
 * quietly write off cash that never arrived.
 */
export const settleCodSchema = z.object({
  riderId: z.string().min(1, "riderId is required"),
  collectionIds: z
    .array(z.string().min(1))
    .min(1, "Select at least one collection to settle"),
  notes: z.string().max(500).optional(),
});

/** Rider shift check-in: a selfie and where it was taken. */
export const attendanceCheckInSchema = z.object({
  // Base64 data URL, the same shape the delivery-proof upload accepts.
  photo: z.string().min(1, "A selfie is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
