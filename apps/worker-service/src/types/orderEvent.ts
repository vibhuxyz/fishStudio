export type OrderEvent =
  | {
      type: "ORDER_PLACED";
      storeId?: string;
      sellerId?: string;
      orderId?: string;
      order: unknown;
    }
  | {
      type: "ORDER_STATUS_UPDATE";
      orderId: string;
      status: string;
      userId?: string;
      storeId?: string;
      sellerId?: string;
      // Set when this transition hands the order to one specific staff member
      // (rider assignment, cutting assignment). Everyone in the store room
      // still gets the sync event; only this person gets the personal alert.
      assignedStaffId?: string;
      orderCode?: string;
    }
  | {
      // Domain event, separate from ORDER_STATUS_UPDATE (which drives the
      // live-tracking UI) — for consumers that care about "a cancellation
      // happened" specifically, e.g. analytics/loyalty/CRM, without having to
      // filter status-update traffic for status === "CANCELLED".
      type: "ORDER_CANCELLED";
      orderId: string;
      storeId?: string;
      userId?: string;
      cancelledBy: "CUSTOMER" | "SELLER" | "STAFF" | "SYSTEM";
      reason?: string | null;
      refundRequested: boolean;
    }
  | {
      type: "BANNER_REVIEWED";
      sellerId?: string;
      bannerId: string;
      status: string;
    }
  | {
      type: "STOCK_UPDATE";
      productId: string;
      catalogProductId?: string | null;
      stock: number;
      message?: string;
    };

/**
 * Type guard to validate order queue messages.
 */
export function isValidOrderEvent(data: any): data is OrderEvent {
  if (!data || typeof data !== "object" || typeof data.type !== "string") return false;

  switch (data.type) {
    case "ORDER_PLACED":
      return "order" in data;
    case "ORDER_STATUS_UPDATE":
      return typeof data.orderId === "string" && typeof data.status === "string";
    case "ORDER_CANCELLED":
      return typeof data.orderId === "string" && typeof data.cancelledBy === "string";
    case "BANNER_REVIEWED":
      return typeof data.bannerId === "string" && typeof data.status === "string";
    case "STOCK_UPDATE":
      return typeof data.productId === "string" && typeof data.stock === "number";
    default:
      return false;
  }
}
