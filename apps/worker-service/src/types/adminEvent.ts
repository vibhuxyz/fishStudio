export type AdminEvent =
  | { type: "BANNER_SUBMITTED"; sellerId?: string; bannerCount?: number; message?: string }
  | { type: "SELLER_APPROVED"; storeId?: string; sellerId?: string }
  | { type: "SELLER_PERMISSIONS_UPDATED"; storeId?: string; sellerId?: string }
  | { type: "STAFF_ACCESS_GRANTED"; staffId?: string };

/**
 * Type guard to validate admin queue messages.
 */
export function isValidAdminEvent(data: any): data is AdminEvent {
  if (!data || typeof data !== "object" || typeof data.type !== "string") return false;

  return (
    data.type === "BANNER_SUBMITTED" ||
    data.type === "SELLER_APPROVED" ||
    data.type === "SELLER_PERMISSIONS_UPDATED" ||
    data.type === "STAFF_ACCESS_GRANTED"
  );
}
