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
    case "BANNER_REVIEWED":
      return typeof data.bannerId === "string" && typeof data.status === "string";
    case "STOCK_UPDATE":
      return typeof data.productId === "string" && typeof data.stock === "number";
    default:
      return false;
  }
}
