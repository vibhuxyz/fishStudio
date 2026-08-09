export interface OrderItemSelectedOptions {
  cuttingType?: string;
  pieceSize?: string;
  weightGrams?: number;
  baseRatePerKg?: number;
  cuttingCharge?: number;
  sizeMultiplier?: number;
  effectiveRatePerKg?: number;
}

export interface OrderItem {
  id: string;
  productId?: string;
  price: number;
  quantity: number;
  product?: {
    title: string;
    images?: { url: string }[];
  };
  selectedOptions?: OrderItemSelectedOptions;
}

export interface OrderStore {
  name: string;
  city?: string;
  pincode?: string;
  cityDeliveryTimes?: Record<string, number>;
  supportPhone?: string | null;
  whatsappNumber?: string | null;
  whatsappLink?: string | null;
  whatsappMessageTemplate?: string | null;
}

export interface OrderRider {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  photo?: { url: string } | null;
}

export interface OrderPreparationPhoto {
  url: string;
  publicId: string;
  uploadedAt: string;
}

export interface Order {
  id: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  store?: OrderStore | null;
  rider?: OrderRider | null;
  totalAmount: number;
  billDetails?: Record<string, number> | null;
  paymentMethod: string;
  paymentStatus: string;
  deliverySlot?: string;
  deliveryName?: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPincode?: string;
  deliveryCharge?: number;
  discountAmount?: number;
  couponCode?: string;
  cancellationReason?: string | null;
  cancelledBy?: "CUSTOMER" | "SELLER" | "STAFF" | "SYSTEM" | null;
  cancelledAt?: string | null;
  refundStatus?: "NONE" | "REQUESTED" | "PROCESSING" | "COMPLETED" | "FAILED";
  // Cutting/weight photos only — the delivery-proof photo is no longer sent to
  // customers; it lives in the seller dashboard for delivery disputes.
  preparationPhotos?: OrderPreparationPhoto[] | null;
}
