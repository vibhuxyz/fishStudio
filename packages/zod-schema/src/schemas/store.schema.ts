import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
  avatarId: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(1, "Pincode is required"),
  opening_hours: z.string().min(1, "Opening hours are required"),
  closing_hours: z.string().min(1, "Closing hours are required"),
  is_instant_delivery_enabled: z.boolean().optional(),
  instant_delivery_fee: z.number().optional(),
  instant_delivery_window_start: z.string().optional(),
  instant_delivery_window_end: z.string().optional(),
  availableCities: z.array(z.string()).min(1, "At least one serviceable city is required"),
  cityDeliveryTimes: z.record(z.string(), z.string().or(z.number())).optional(),
  state: z.string().optional(),
  sellerId: z.string().optional(),
});

export const updateStoreSchema = storeSchema.partial();
