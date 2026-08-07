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
  // Fraction, not percent (0.05 = 5%) — matches computeCartSummary's gstRate.
  gst_rate: z.number().min(0).max(1).optional(),
  packaging_charge: z.number().min(0).optional(),
  base_delivery_charge: z.number().min(0).optional(),
  free_delivery_threshold: z.number().min(0).optional(),
  availableCities: z.array(z.string()).min(1, "At least one serviceable area is required"),
  cityDeliveryTimes: z.record(z.string(), z.string().or(z.number())).optional(),
  // Every serviceable area must be pinned to the pincode it falls under —
  // this is what lets a customer's raw pincode resolve to the right store.
  areaPincodes: z.record(z.string(), z.string().min(6, "Pincode must be 6 digits")).optional(),
  // And its real city, since one pincode can span areas in different cities
  // (e.g. a Noida store's 201001 pincode covers a Ghaziabad locality).
  areaCities: z.record(z.string(), z.string().min(1, "City is required")).optional(),
  servicePincodes: z.array(z.string()).optional(),
  state: z.string().optional(),
  sellerId: z.string().optional(),

  // Support / Contact Configuration — shown to customers on order-detail
  // screens (Call Support / Chat on WhatsApp).
  supportPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  whatsappLink: z.string().optional(),
  whatsappMessageTemplate: z.string().optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
  supportHours: z.string().optional(),
  supportDescription: z.string().optional(),
  faqLink: z.string().optional(),
});

export const updateStoreSchema = storeSchema.partial();
