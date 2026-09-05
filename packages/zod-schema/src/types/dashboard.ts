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
  email?: string | null;
  username?: string | null;
  phone?: string | null;
  role: "ORDER_MANAGER" | "RIDER" | "CUTTING_STAFF";
  isActive: boolean;
  vehicleType?: "BIKE" | "SCOOTER" | "BICYCLE" | "OTHER" | null;
  vehicleNumber?: string | null;
  deliveryZone?: string | null;
  riderStatus?: "AVAILABLE" | "DELIVERING" | "OFFLINE" | "ON_LEAVE" | null;
  activeDeliveryCount?: number | null;
  createdAt: string;
  updatedAt?: string;
};

export type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  // Admin display order. Ascending, lower first; null is unranked and sorts
  // after everything ranked.
  sortOrder?: number | null;
  isFeatured?: boolean;
  // Tax classification, printed on the GST invoice. Authored on the catalog
  // root and inherited by store variants — the code describes the goods, not
  // who sells them.
  hsnCode?: string | null;
  gstRatePercent?: number | null;
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
  storeId?: string | null;
  adminId?: string | null;
  store?: {
    id: string;
    name: string;
    sellerId?: string;
  } | null;
  // Both spellings appear depending on which upload path wrote the record —
  // productImageSchema normalises the pair down to { url, file_id }.
  images: Array<{
    url?: string | null;
    file_url?: string | null;
    file_id?: string | null;
    fileId?: string | null;
  }>;
  origin?: string | null;
  source?: string | null;
  shelfLife?: string | null;
  storageInstructions?: string | null;
  cookingTips?: string[];
  highlightDescription?: string | null;
  nutritionProtein?: string | null;
  nutritionOmega3?: string | null;
  nutritionCalories?: string | null;
  cuttingTypes?: string[];
  pieceSizes?: string[];
  sizes?: string[];
  processingWeightLoss?: string | null;
  trackStockPerSize?: boolean;
};

export type DiscountCode = {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount?: number | null;
  discountCode: string;
  // Returned by get-discount-codes (which selects the whole row) and needed to
  // prefill the edit form — an edit that silently dropped these would reset
  // limits the seller had set.
  minOrderValue?: number;
  expiresAt?: string | null;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  usedCount?: number;
  isFirstOrder?: boolean;
  isActive?: boolean;
  seller?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

/** Partial edit of an existing coupon — see updateCouponSchema. `discountCode`
 *  and `sellerId` are absent because neither can be changed after creation. */
export type UpdateDiscountCodePayload = {
  public_name?: string;
  discountType?: string;
  discountValue?: number;
  maxDiscountAmount?: number | null;
  minOrderValue?: number;
  expiresAt?: string | null;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  isFirstOrder?: boolean;
  isActive?: boolean;
};

export type CategoriesResponse = {
  categories: string[];
  subCategories: Record<string, string[]>;
  categoryImages: Record<string, string>;
  // Keyed by category name. A category absent from this map is active.
  categoryStatus: Record<string, boolean>;
  // Keyed by "<category>::<subCategory>". Absent means active.
  subCategoryStatus: Record<string, boolean>;
  // Which map backend the storefront and app use. Null means the client falls
  // back to whatever its own build was configured with.
  mapProvider?: "osm" | "google" | null;
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
  isActive?: boolean;
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
    // Admin-only store settings — see adminStoreSettingsSchema. Null when the
    // admin has not set them: the store then issues no sequential order
    // numbers and falls back to the default COD auto-accept ceiling.
    locationCode?: string | null;
    codAutoAcceptLimit?: number | null;
    // Tax invoice identity. Without legalName + gstin + locationCode the
    // invoice endpoint refuses to issue, rather than printing a document with
    // a blank registration.
    legalName?: string | null;
    gstin?: string | null;
    fssaiLicenseNumber?: string | null;
    registeredAddress?: string | null;
    invoiceJurisdiction?: string | null;
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
  // UI-only — only meaningful when the product tracks stock per size.
  // totalInventoryGrams is derived from stockQty (what the seller actually
  // types) multiplied by weightGrams; neither is sent as part of sizePricing
  // itself, they're pulled back out into a separate sizeStock submission.
  stockQty?: number;
  totalInventoryGrams?: number;
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
  trackStockPerSize?: boolean;
  sizeStock?: Array<{ size: string; qty: number }> | null;
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
  // Derived from sizePricing's stockQty at submit time, not form-registered
  // directly — see products/[id]/page.tsx's onSubmit.
  sizeStock?: Array<{ size: string; qty: number }>;
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
  maxDiscountAmount?: number | null;
  discountCode: string;
  minOrderValue?: number;
  expiresAt?: string | null;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  /** Only redeemable by a customer with no prior order at this store. */
  isFirstOrder?: boolean;
  /** Admin-only: which seller's store this coupon belongs to. */
  sellerId?: string;
};

export type UpdateProductPayload = {
  productId: string;
  title?: string;
  slug?: string;
  category?: string;
  subCategory?: string;
  short_description?: string;
  hsnCode?: string;
  gstRatePercent?: string | number | null;
  regular_price?: number;
  sale_price?: number;
  stock?: number;
  status?: string;
  tags?: string;
  images?: Array<{ url: string; file_id: string }>;
  origin?: string;
  source?: string;
  shelfLife?: string;
  storageInstructions?: string;
  cookingTips?: string;
  highlightDescription?: string;
  nutritionProtein?: string;
  nutritionOmega3?: string;
  nutritionCalories?: string;
  // Merchandising, admin-only. `null` clears a rank, so this is deliberately
  // nullable rather than merely optional.
  sortOrder?: number | null;
  isFeatured?: boolean;
  cuttingTypes?: Array<{ value: string }>;
  pieceSizes?: Array<{ value: string }>;
  sizes?: Array<{ value: string }>;
  processingWeightLoss?: string;
  trackStockPerSize?: boolean;
};

export type AdminBanner = {
  id: string;
  imageUrl: string;
  fileId: string;
  isActive: boolean;
  adminId?: string | null;
  sellerId?: string | null;
};
