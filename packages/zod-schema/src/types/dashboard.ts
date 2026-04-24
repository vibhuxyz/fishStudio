export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  detailed_description?: string | null;
  sale_price: number;
  regular_price?: number | null;
  stock: number;
  category: string;
  subCategory?: string | null;
  tags?: string[];
  status?: string;
  isDeleted?: boolean | null;
  deletedAt?: string | null;
  ratings?: number | null;
  starting_date?: string | null;
  images: Array<{
    url?: string | null;
    file_url?: string | null;
  }>;
};

export type DiscountCode = {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type CategoriesResponse = {
  categories: string[];
  subCategories: Record<string, string[]>;
  categoryImages: Record<string, string>;
};

export type AdminSellerSummary = {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  createdAt?: string;
  totalProducts?: number;
  totalCoupons?: number;
  totalBanners?: number;
  totalReviews?: number;
  isApprovedByAdmin?: boolean;
  permissions?: string[];
  store?: {
    id: string;
    name: string;
    city?: string;
    address?: string;
  } | null;
};

export type AdminSellerDetail = AdminSellerSummary & {
  coupons: DiscountCode[];
  banners: Array<{
    id: string;
    imageUrl: string;
    fileId: string;
    isActive: boolean;
  }>;
  store?: {
    id: string;
    name: string;
    bio?: string;
    city?: string;
    address?: string;
    pincode?: string;
    opening_hours?: string;
    products: AdminProduct[];
    storeReviews: Array<{
      id: string;
      rating: number;
      reviews?: string | null;
      user?: {
        id: string;
        name: string;
      } | null;
    }>;
  } | null;
};

export type OrderStatus = "New" | "Processing" | "Ready" | "Completed" | "Rejected" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "ACCEPTED" | "PENDING";

export type ShippingAddress = {
  name?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
};

export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
  selectedOptions?: Record<string, any>;
  product?: {
    id?: string;
    title?: string;
    slug?: string;
    images?: Array<{
      url?: string | null;
    }>;
  } | null;
};

export type SellerOrder = {
  id: string;
  total: number;
  totalAmount?: number;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  paymentRef?: string | null;
  status: OrderStatus | string;
  deliveryStatus?: string;
  createdAt: string;
  updatedAt?: string;
  discountAmount: number;
  user?: {
    id?: string;
    name?: string | null;
    phone_number?: string | null;
    email?: string | null;
  } | null;
  couponCode?: string | {
    public_name?: string;
    discountType?: string;
    discountValue?: number;
  } | null;
  shippingAddress?: ShippingAddress | null;
  items: OrderItem[];
  deliveryName?: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPincode?: string;
  deliveryCharge?: number;
  billDetails?: any;
  rejectionReason?: string | null;
  deliverySlot?: string;
};

export type PincodeRow = { 
  pincode: string; 
  orders: number; 
  revenue: number;
  products?: Record<string, { title: string; qty: number; revenue: number }>;
  shops?: Array<{ 
    id: string; 
    name: string; 
    sales: number; 
    repetition: number;
    products: Record<string, { title: string; qty: number; revenue: number; couponSpend: number }>;
  }>;
};

export type ProductRow = { id: string; title: string; orders: number; revenue: number; image?: string };

export type DetailedProductRow = ProductRow & {
  deliveredQty: number;
  cancelledQty: number;
  pendingQty: number;
  refundedQty: number;
  refundedAmount: number;
  couponSpend: number;
  quantaSale: number;
  repeatCustomers: number;
  avgPrice: number;
  orderIds: string[];
  pincodeBreakdown: Record<string, number>;
};

export type StatsPayload = {
  totalOrders: number;
  totalDelivered: number;
  totalCancelled: number;
  totalRefunded: number;
  totalPending: number;
  totalAccepted: number;
  totalRevenue: number;
  totalRefundedAmount: number;
  totalCouponSpend: number;
  pincodeBreakdown: PincodeRow[];
  heroProducts: ProductRow[];
  needsImprovement: ProductRow[];
  toRemove: ProductRow[];
  allProductsBreakdown?: DetailedProductRow[];
};

export type SellerBreakdownRow = StatsPayload & { sellerId: string; name: string; email: string };
export type AdminStatsResponse = { period: string; stats: StatsPayload; perSellerBreakdown?: SellerBreakdownRow[]; categoryBreakdown?: Array<{ name: string; revenue: number; orders: number }> };
export type SellerStatsResponse = { period: string; stats: StatsPayload };
export type StatsPeriod = "week" | "month" | "year";

export type SizePricingRow = {
  size: string;
  weightGrams: number;
  regularPrice: number;
  salePrice: number;
};

export type SellerOwnedProduct = {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  tags: string[];
  regular_price: number;
  sale_price: number;
  stock: number;
  sizes: string[];
  sizePricing?: SizePricingRow[] | null;
  cuttingTypes?: string[] | null;
  pieceSizes?: string[] | null;
  cuttingTypePricing?: Array<{ cuttingType: string; salePrice: number; regularPrice: number }> | null;
  pieceSizePricing?: Array<{ pieceSize: string; salePrice: number; regularPrice: number }> | null;
  cashOnDelivery?: string | null;
  status: "Active" | "NonActive";
  basePricePerKg?: number | null;
  discount_codes: string[];
  images: Array<{ id: string; url: string }>;
  catalogProduct?: {
    id: string;
    title: string;
    slug: string;
  } | null;
};

export type SellerProductFormValues = {
  productId: string;
  title: string;
  slug: string;
  short_description: string;
  tags: string;
  stock: number;
  cash_on_delivery: "yes" | "no";
  status: "Active" | "NonActive";
  discountCodes: string[];
  sizePricing: SizePricingRow[];
  cuttingTypePricing: Array<{ cuttingType: string; salePrice: number; regularPrice: number }>;
  pieceSizePricing: Array<{ pieceSize: string; salePrice: number; regularPrice: number }>;
  regular_price: number;
  sale_price: number;
  basePricePerKg?: number;
};

export type AdminSellerAccessCode = {
  id: string;
  email?: string | null;
  role: string;
  code: string;
  plainCode?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
};

export type SlugValidationResponse = {
  available: boolean;
  slug: string;
  suggestedSlug?: string | null;
};

export type DiscountCodePayload = {
  public_name: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
  minOrderValue?: number;
  expiresAt?: string | null;
  maxUses?: number | null;
  maxUsesPerUser?: number;
};

export type UpdateProductPayload = {
  productId: string;
  title?: string;
  slug?: string;
  category?: string;
  subCategory?: string;
  short_description?: string;
  regular_price?: number;
  sale_price?: number;
  stock?: number;
  status?: string;
  images?: Array<{ url: string; file_id: string }>;
};

export type AdminBanner = {
  id: string;
  imageUrl: string;
  fileId: string;
  isActive: boolean;
  adminId?: string | null;
  sellerId?: string | null;
};
