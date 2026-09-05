import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
  avatarId: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(1, "Pincode is required"),
  // Both or neither — a lone coordinate is not a location, and the same
  // pairing rule the user address endpoints already enforce.
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
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
  // COD orders at or below this are auto-accepted; above it the seller phones
  // the customer first. The store's own risk appetite, so the seller sets it.
  // Omitted entirely falls back to DEFAULT_COD_AUTO_ACCEPT_LIMIT server-side.
  codAutoAcceptLimit: z.number().min(0).nullable().optional(),
  // Orders one rider may carry at once. 1 reproduces the old single-delivery
  // rule; the upper bound is a sanity check, not a business limit.
  maxConcurrentDeliveries: z.number().int().min(1).max(20).nullable().optional(),
  // Attendance check-in radius, metres. The floor is 20 because consumer GPS is
  // routinely 10-30m out and a tighter fence would reject honest check-ins —
  // and a control people have to work around measures nothing.
  attendanceGeofenceMeters: z.number().int().min(20).max(2000).nullable().optional(),
  // Scheduled delivery slots this store offers. Omitted entirely falls back to
  // DEFAULT_DELIVERY_SLOTS server-side, which reproduces the morning/evening
  // pair that used to be hardcoded.
  //
  // `key` is what lands on the order and what capacity is counted against, so
  // it must stay stable — renaming a key orphans that day's bookings against
  // the old one. The label is the part meant to be edited freely.
  deliverySlotConfig: z
    .array(
      z.object({
        key: z.string().regex(/^[a-z0-9_-]{1,32}$/, "Use lowercase letters, digits, - or _"),
        label: z.string().min(1, "Slot label is required"),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm"),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm"),
        cutoffMinutesBefore: z.number().int().min(0).max(1440),
        capacity: z.number().int().min(1, "Capacity must be at least 1"),
      }),
    )
    .max(12, "That is more slots than a day can hold")
    .optional(),
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

export const updateStoreSchema = storeSchema.partial().refine(
  (data) => (data.latitude === undefined) === (data.longitude === undefined),
  { message: "Latitude and longitude must be set together", path: ["latitude"] },
);

/**
 * Store settings only an admin may change.
 *
 * `locationCode` is deliberately not in storeSchema above: it is the middle
 * segment of every order number this store issues (FS-NOI-30082026-001), so a
 * seller editing it would renumber their own invoices. It is set once, centrally.
 */
export const adminStoreSettingsSchema = z.object({
  locationCode: z
    .string()
    .max(4, "Location code max 4 letters")
    .regex(/^[A-Za-z]*$/, "Letters only")
    .nullable()
    .optional(),
  codAutoAcceptLimit: z.number().min(0).nullable().optional(),

  // ── Tax invoice identity ──────────────────────────────────────────────
  // Compliance data rather than shop settings, which is why it lives on the
  // admin-only surface: a wrong GSTIN on an issued invoice is the platform's
  // problem, not something to leave editable from the seller dashboard.
  legalName: z.string().max(200).nullable().optional(),
  gstin: z
    .string()
    // 2-digit state code, 10-char PAN, entity digit, "Z", checksum. Validated
    // because an invoice carrying a malformed GSTIN is invalid, and the error
    // is far cheaper to catch here than after a month of issued invoices.
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Not a valid GSTIN",
    )
    .nullable()
    .optional()
    .or(z.literal("")),
  fssaiLicenseNumber: z
    .string()
    .regex(/^[0-9]{14}$/, "FSSAI licence is 14 digits")
    .nullable()
    .optional()
    .or(z.literal("")),
  registeredAddress: z.string().max(500).nullable().optional(),
  invoiceJurisdiction: z.string().max(100).nullable().optional(),
});
