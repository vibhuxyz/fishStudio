export interface SelectedOptions {
  cuttingType?: string;
  pieceSize?: string;
  size?: string;
  weightGrams?: number;
  baseRatePerKg?: number;
  cuttingCharge?: number;
  sizeMultiplier?: number;
  effectiveRatePerKg?: number;
  [key: string]: any;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  selectedOptions?: SelectedOptions;
  product?: {
    id: string;
    title: string;
    images: { url: string }[];
    sale_price?: number;
    regular_price?: number;
  };
}

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  total?: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  couponCode?: string;
  discountAmount?: number;
  deliveryCharge?: number;
  billDetails?: { itemTotal?: number; deliveryCharge?: number; discount?: number; gstAmount?: number; totalAmount?: number } | null;
  deliveryName?: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPincode?: string;
  deliverySlot?: string;
  cancellationReason?: string | null;
  cancelledBy?: "CUSTOMER" | "SELLER" | "STAFF" | "SYSTEM" | null;
  cancelledAt?: string | null;
  refundStatus?: "NONE" | "REQUESTED" | "PROCESSING" | "COMPLETED" | "FAILED";
  items: OrderItem[];
  store?: {
    id: string;
    name: string;
    cityDeliveryTimes?: Record<string, number>;
    city?: string;
    pincode?: string;
    // Falls back to this seller number for "call for help" until a rider is
    // actually assigned (order.rider below), the only real contact before that.
    sellerPhone?: string | null;
    supportPhone?: string | null;
    whatsappNumber?: string | null;
    whatsappLink?: string | null;
    whatsappMessageTemplate?: string | null;
  };
  rider?: {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    vehicleNumber: string;
    avatar?: { url: string } | null;
  } | null;
}

export const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; icon: string; label: string; description: string }
> = {
  PENDING:   { bg: "#FEF3C7", text: "#D97706", icon: "time-outline",             label: "Order Placed", description: "Your order has been placed and is awaiting confirmation" },
  ACCEPTED:  { bg: "#DBEAFE", text: "#2563EB", icon: "checkmark-circle-outline", label: "Preparing",    description: "Your order is being prepared" },
  PREPARING: { bg: "#DBEAFE", text: "#2563EB", icon: "cube-outline",             label: "Preparing",    description: "Your order is being prepared" },
  READY_FOR_PICKUP:  { bg: "#CCFBF1", text: "#0D9488", icon: "bag-check-outline", label: "Ready for Pickup", description: "Your order is packed and ready for pickup" },
  ASSIGNED_TO_RIDER: { bg: "#FAE8FF", text: "#A21CAF", icon: "bicycle-outline",   label: "Rider Assigned",  description: "A delivery rider is on the way to pick up your order" },
  SHIPPED:   { bg: "#EDE9FE", text: "#5A2C96", icon: "car-outline",              label: "On the Way",    description: "Your order is on its way to you" },
  DELIVERED: { bg: "#D1FAE5", text: "#059669", icon: "bag-check-outline",        label: "Delivered", description: "Your order has been delivered successfully" },
  REJECTED:  { bg: "#FEE2E2", text: "#DC2626", icon: "close-circle-outline",     label: "Rejected",  description: "Your order was rejected by the store" },
  CANCELLED: { bg: "#F3F4F6", text: "#6B7280", icon: "ban-outline",              label: "Cancelled", description: "Your order has been cancelled" },
};

export const PAYMENT_STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: "#D1FAE5", text: "#059669" },
  PENDING:   { bg: "#FEF3C7", text: "#D97706" },
  FAILED:    { bg: "#FEE2E2", text: "#DC2626" },
  REFUNDED:  { bg: "#EDE9FE", text: "#5A2C96" },
};
