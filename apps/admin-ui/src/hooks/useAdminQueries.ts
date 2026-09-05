import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import type {
  AdminProfile,
  AdminProduct,
  DiscountCode,
  CategoriesResponse,
  AdminSellerSummary,
  AdminSellerAccessCode,
  AdminSellerDetail,
  SellerOrder,
  SlugValidationResponse,
  DiscountCodePayload,
  UpdateDiscountCodePayload,
  UpdateProductPayload,
  AdminBanner,
  StatsPeriod,
  StatsPayload,
  PincodeRow,
  ProductRow,
  AdminStatsResponse,
  SellerStatsResponse,
  DetailedProductRow,
  SellerBreakdownRow,
} from "@repo/zod-schema";

export type {
  AdminProfile,
  AdminProduct,
  DiscountCode,
  CategoriesResponse,
  AdminSellerSummary,
  AdminSellerAccessCode,
  AdminSellerDetail,
  SellerOrder,
  SlugValidationResponse,
  DiscountCodePayload,
  UpdateDiscountCodePayload,
  UpdateProductPayload,
  AdminBanner,
  StatsPeriod,
  StatsPayload,
  PincodeRow,
  ProductRow,
  AdminStatsResponse,
  SellerStatsResponse,
  DetailedProductRow,
  SellerBreakdownRow,
};

export const adminQueryKeys = {
  account: ["admin", "account"] as const,
  products: ["admin", "products"] as const,
  productsList: (params: Record<string, string>) => ["admin", "products", params] as const,
  orders: ["admin", "orders"] as const,
  discounts: ["admin", "discounts"] as const,
  categories: ["admin", "categories"] as const,
  sellers: ["admin", "sellers"] as const,
  sellerDetail: (sellerId: string) => ["admin", "sellers", sellerId] as const,
  order: (orderId: string) => ["admin", "orders", orderId] as const,
  adminOrder: (orderId: string) => ["admin", "admin-orders", orderId] as const,
  adminOrderList: (params: Record<string, string>) => ["admin", "admin-orders", params] as const,
  sellerInventory: (params: Record<string, string>) => ["admin", "seller-inventory", params] as const,
  seller: ["admin", "account"] as const,
  sellerCodes: ["admin", "sellerCodes"] as const,
  banners: ["admin", "banners"] as const,
  sellerEvents: (sellerId: string) => ["admin", "seller-events", sellerId] as const,
};

export const getCategoryConfigKey = (category: string) =>
  category
    .trim()
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((segment, index) =>
      index === 0
        ? segment.toLowerCase()
        : `${segment.charAt(0).toUpperCase()}${segment.slice(1).toLowerCase()}`,
    )
    .join("");

export const fetchAdminProfile = async (): Promise<AdminProfile | null> => {
  const response = await axiosInstance.get("/auth/api/logged-in-admin", isProtected);
  return response.data.admin ?? null;
};

export interface AdminProductsParams {
  scope?: "catalog" | "store";
  storeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminProductsPage {
  products: AdminProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const EMPTY_PAGINATION: AdminProductsPage["pagination"] = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export const fetchAdminProducts = async (
  params: AdminProductsParams = {},
): Promise<AdminProductsPage> => {
  const query = new URLSearchParams();
  if (params.scope) query.set("scope", params.scope);
  if (params.storeId) query.set("storeId", params.storeId);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const response = await axiosInstance.get(
    `/product/api/get-owned-products?${query.toString()}`,
    isProtected,
  );
  const products = Array.isArray(response.data.products) ? response.data.products : [];
  return {
    products: products.filter((product: AdminProduct) => !product.starting_date),
    pagination: response.data.pagination ?? { ...EMPTY_PAGINATION, total: products.length },
  };
};

export const deleteAdminProduct = async (productId: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${productId}`, isProtected);
};

export const restoreAdminProduct = async (productId: string) => {
  await axiosInstance.put(`/product/api/restore-product/${productId}`, {}, isProtected);
};

export const updateAdminProduct = async ({
  productId,
  ...payload
}: UpdateProductPayload) => {
  await axiosInstance.put(
    `/product/api/update-product/${productId}`,
    payload,
    isProtected,
  );
};

export const fetchSellerOrders = async (): Promise<SellerOrder[]> => {
  const response = await axiosInstance.get("/order/api/get-seller-orders", isProtected);
  return Array.isArray(response.data.orders) ? response.data.orders : [];
};

export const fetchOrderDetail = async (orderId: string): Promise<SellerOrder | null> => {
  const response = await axiosInstance.get(`/order/api/get-order-details/${orderId}`, isProtected);
  return response.data.order ?? null;
};

export const updateOrderDeliveryStatus = async (orderId: string, deliveryStatus: string) => {
  await axiosInstance.put(
    `/order/api/update-status/${orderId}`,
    { deliveryStatus },
    isProtected,
  );
};

export const fetchDiscountCodes = async (): Promise<DiscountCode[]> => {
  const response = await axiosInstance.get("/product/api/get-discount-codes", isProtected);
  return Array.isArray(response.data.discount_codes) ? response.data.discount_codes : [];
};

export const createDiscountCode = async (payload: DiscountCodePayload) => {
  await axiosInstance.post("/product/api/create-discount-code", payload, isProtected);
};

/** Admin may edit any coupon, including one a seller created. */
export const updateDiscountCode = async ({
  discountId,
  payload,
}: {
  discountId: string;
  payload: UpdateDiscountCodePayload;
}) => {
  await axiosInstance.put(
    `/product/api/update-discount-code/${discountId}`,
    payload,
    isProtected,
  );
};

export const toggleDiscountCode = async ({
  discountId,
  isActive,
}: {
  discountId: string;
  isActive: boolean;
}) => {
  await axiosInstance.patch(
    `/product/api/toggle-discount-code/${discountId}`,
    { isActive },
    isProtected,
  );
};

export const deleteDiscountCode = async (discountId: string) => {
  await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`, isProtected);
};

// ── Seller Events (Master Admin acts on a chosen seller's store) ──────────

export type AdminSellerEventType = "FREE_DELIVERY" | "DISCOUNT" | "FLASH_SALE";

export interface AdminSellerEvent {
  id: string;
  sellerId: string;
  title: string;
  description?: string | null;
  type: AdminSellerEventType;
  minOrder?: number | null;
  discount?: number | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface AdminSellerEventPayload {
  sellerId: string;
  title: string;
  description?: string;
  type: AdminSellerEventType;
  minOrder?: number | null;
  discount?: number | null;
  startTime: string;
  endTime: string;
}

export const fetchAdminSellerEvents = async (
  sellerId: string,
): Promise<AdminSellerEvent[]> => {
  const response = await axiosInstance.get(
    `/product/api/get-seller-events?sellerId=${encodeURIComponent(sellerId)}`,
    isProtected,
  );
  return Array.isArray(response.data.events) ? response.data.events : [];
};

export const createAdminSellerEvent = async (payload: AdminSellerEventPayload) => {
  await axiosInstance.post("/product/api/create-event", payload, isProtected);
};

export const updateAdminSellerEvent = async ({
  eventId,
  payload,
}: {
  eventId: string;
  payload: Partial<AdminSellerEventPayload> & { isActive?: boolean };
}) => {
  await axiosInstance.put(`/product/api/update-event/${eventId}`, payload, isProtected);
};

export const deleteAdminSellerEvent = async (eventId: string) => {
  await axiosInstance.delete(`/product/api/delete-event/${eventId}`, isProtected);
};

export const useAdminSellerEvents = (sellerId?: string) =>
  useQuery({
    queryKey: sellerId
      ? adminQueryKeys.sellerEvents(sellerId)
      : ["admin", "seller-events", "none"],
    queryFn: () => fetchAdminSellerEvents(sellerId as string),
    enabled: Boolean(sellerId),
  });

export const fetchCategories = async (): Promise<CategoriesResponse> => {
  // /get-categories is sent with `Cache-Control: public, max-age=300,
  // stale-while-revalidate=600` for the storefront. That HTTP cache is why a
  // just-saved category image kept showing the old one here for minutes — the
  // browser answered React Query's refetch from disk without hitting the
  // server. The admin panel edits this data, so it must always read through.
  const response = await axiosInstance.get("/product/api/get-categories", {
    params: { _ts: Date.now() },
  });
  return {
    categories: Array.isArray(response.data.categories) ? response.data.categories : [],
    subCategories:
      response.data.subCategories && typeof response.data.subCategories === "object"
        ? response.data.subCategories
        : {},
    categoryImages:
      response.data.categoryImages && typeof response.data.categoryImages === "object"
        ? response.data.categoryImages
        : {},
    categoryStatus:
      response.data.categoryStatus && typeof response.data.categoryStatus === "object"
        ? response.data.categoryStatus
        : {},
    subCategoryStatus:
      response.data.subCategoryStatus && typeof response.data.subCategoryStatus === "object"
        ? response.data.subCategoryStatus
        : {},
    mapProvider:
      response.data.mapProvider === "google" || response.data.mapProvider === "osm"
        ? response.data.mapProvider
        : null,
  };
};

export const createAdminCategory = async (name: string, imageUrl?: string) => {
  await axiosInstance.post(
    "/product/api/create-category",
    { name, imageUrl },
    isProtected,
  );
};

export const createAdminSubCategory = async (category: string, name: string) => {
  await axiosInstance.post(
    "/product/api/create-subcategory",
    { category, name },
    isProtected,
  );
};

export const deleteAdminCategory = async (name: string) => {
  await axiosInstance.delete("/product/api/delete-category", {
    data: { name },
    ...isProtected,
  });
};

export const deleteAdminSubCategory = async (category: string, name: string) => {
  await axiosInstance.delete("/product/api/delete-subcategory", {
    data: { category, name },
    ...isProtected,
  });
};

export type UpdateCategoryPayload = {
  name: string;
  newName?: string;
  imageUrl?: string;
  isActive?: boolean;
};

/**
 * Switch the map backend for the storefront and the app.
 *
 * "osm" needs no key and no billing, so it is the safe fallback if a Google key
 * is revoked or a billing account lapses — which is the whole reason this is a
 * setting rather than a build-time env var.
 */
export const updateMapProvider = async (mapProvider: "osm" | "google") => {
  await axiosInstance.put("/product/api/update-map-provider", { mapProvider }, isProtected);
};

export const updateAdminCategory = async (payload: UpdateCategoryPayload) => {
  await axiosInstance.put("/product/api/update-category", payload, isProtected);
};

export type UpdateSubCategoryPayload = {
  category: string;
  name: string;
  newName?: string;
  isActive?: boolean;
};

export const updateAdminSubCategory = async (payload: UpdateSubCategoryPayload) => {
  await axiosInstance.put("/product/api/update-subcategory", payload, isProtected);
};

export const fetchAdminSellers = async (): Promise<AdminSellerSummary[]> => {
  const response = await axiosInstance.get("/auth/api/admin/sellers", isProtected);
  return Array.isArray(response.data.sellers) ? response.data.sellers : [];
};

export const fetchSellerAccessCodes = async (): Promise<AdminSellerAccessCode[]> => {
  const response = await axiosInstance.get("/auth/api/admin/seller-codes", isProtected);
  return Array.isArray(response.data.codes) ? response.data.codes : [];
};

export const fetchAdminSellerDetail = async (
  sellerId: string,
): Promise<AdminSellerDetail | null> => {
  const response = await axiosInstance.get(
    `/auth/api/admin/sellers/${sellerId}`,
    isProtected,
  );
  return response.data.seller ?? null;
};

export const fetchAdminSellerOrders = async (sellerId: string): Promise<{
  orders: SellerOrder[];
  seller: any;
  store: any;
}> => {
  const response = await axiosInstance.get(
    `/order/api/admin-orders/${sellerId}`,
    isProtected,
  );
  return response.data;
};

export const validateProductSlug = async (
  slug: string,
): Promise<SlugValidationResponse> => {
  const response = await axiosInstance.post(
    "/product/api/slug-validator",
    { slug },
    isProtected,
  );
  return response.data ?? {};
};

export const updateSellerApproval = async ({
  sellerId,
  isApprovedByAdmin,
  permissions,
  isActive,
}: {
  sellerId: string;
  isApprovedByAdmin: boolean;
  permissions: string[];
  isActive?: boolean;
}) => {
  const response = await axiosInstance.put(
    `/auth/api/admin/sellers/${sellerId}/approval`,
    { isApprovedByAdmin, permissions, ...(isActive !== undefined && { isActive }) },
    isProtected
  );
  return response.data;
};

export const useAdminProducts = (params: AdminProductsParams = {}) =>
  useQuery({
    queryKey: adminQueryKeys.productsList(params as Record<string, string>),
    queryFn: () => fetchAdminProducts(params),
    // A page of rows shouldn't blank out while the next page loads.
    placeholderData: (previous) => previous,
  });

export const useAdminAccount = () =>
  useQuery({
    queryKey: adminQueryKeys.account,
    queryFn: fetchAdminProfile,
  });

export const useSellerOrders = () =>
  useQuery({
    queryKey: adminQueryKeys.orders,
    queryFn: fetchSellerOrders,
  });

export const useDiscountCodes = () =>
  useQuery({
    queryKey: adminQueryKeys.discounts,
    queryFn: fetchDiscountCodes,
  });

export const useAdminCategories = () =>
  useQuery({
    queryKey: adminQueryKeys.categories,
    queryFn: fetchCategories,
  });

export const useAdminSellers = () =>
  useQuery({
    queryKey: adminQueryKeys.sellers,
    queryFn: fetchAdminSellers,
  });

export const useSellerAccessCodes = () =>
  useQuery({
    queryKey: adminQueryKeys.sellerCodes,
    queryFn: fetchSellerAccessCodes,
  });

export const useAdminSellerDetail = (sellerId?: string) =>
  useQuery({
    queryKey: sellerId
      ? adminQueryKeys.sellerDetail(sellerId)
      : ["admin", "sellers", "unknown"],
    queryFn: () => fetchAdminSellerDetail(sellerId as string),
    enabled: Boolean(sellerId),
  });

export const useAdminSellerOrders = (sellerId?: string) =>
  useQuery({
    queryKey: sellerId ? ["admin", "seller-orders", sellerId] : ["admin", "seller-orders"],
    queryFn: () => fetchAdminSellerOrders(sellerId as string),
    enabled: Boolean(sellerId),
  });

export const useOrderDetail = (orderId?: string) =>
  useQuery({
    queryKey: orderId ? adminQueryKeys.order(orderId) : ["admin", "orders", "unknown"],
    queryFn: () => fetchOrderDetail(orderId as string),
    enabled: Boolean(orderId),
  });

import { useMutation, useQueryClient } from "@tanstack/react-query";
export const useUpdateSellerApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSellerApproval,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.sellers });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.sellerDetail(variables.sellerId) });
    },
  });
};

/** Store settings only an admin controls — see adminStoreSettingsSchema. */
export type AdminStoreSettingsPayload = {
  storeId: string;
  sellerId: string;
  locationCode?: string | null;
  codAutoAcceptLimit?: number | null;
  legalName?: string | null;
  gstin?: string | null;
  fssaiLicenseNumber?: string | null;
  registeredAddress?: string | null;
  invoiceJurisdiction?: string | null;
};

export const updateAdminStoreSettings = async ({
  storeId,
  sellerId: _sellerId,
  ...settings
}: AdminStoreSettingsPayload) => {
  // Only the keys actually present are sent, so a form that edits one section
  // never blanks a field it wasn't showing.
  const res = await axiosInstance.put(
    `/auth/api/admin/stores/${storeId}/settings`,
    settings,
    isProtected,
  );
  return res.data;
};

export const useUpdateAdminStoreSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminStoreSettings,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.sellerDetail(variables.sellerId),
      });
    },
  });
};

// ── Analytics Fetch Functions ──────────────────────────────────────────────
export const fetchAdminStats = async (period: StatsPeriod, sellerId?: string): Promise<AdminStatsResponse> => {
  const url = sellerId ? `/order/api/admin-stats/${sellerId}?period=${period}` : `/order/api/admin-stats?period=${period}`;
  const res = await axiosInstance.get(url, isProtected);
  return res.data;
};

// ── Analytics useQuery Hooks ───────────────────────────────────────────────
export const useAdminStats = (period: StatsPeriod, sellerId?: string) =>
  useQuery({
    queryKey: ["admin", "stats", period, sellerId ?? "all"],
    queryFn: () => fetchAdminStats(period, sellerId),
  });

// ── Admin Order List (new rich endpoint) ──────────────────────────────────

export interface AdminOrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  sellerId?: string;
  from?: string;
  to?: string;
  search?: string;
  pincode?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "createdAt" | "totalAmount";
  sortDir?: "asc" | "desc";
  // Multi-select equivalents of `status` above. Serialized comma-joined, which
  // is one of the two shapes parseSellerOrderFilters accepts on the server.
  statuses?: string[];
  slot?: string[];
}

export interface AdminOrderCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  addresses?: any[];
  memberSince?: string;
}

export interface AdminOrderSeller {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isApproved?: boolean;
  memberSince?: string;
}

export interface AdminOrderStore {
  id: string;
  name: string;
  city?: string;
  pincode?: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectedOptions?: any;
  product: {
    id: string;
    title: string;
    category?: string;
    salePrice?: number;
    image?: string;
  };
}

/** One attempt against an order — COD orders get a single COD row, Razorpay
 *  orders can have several (retries). `metadata.method`/`instrumentDetail`
 *  carry the sub-instrument (card/upi/netbanking/wallet) Razorpay reports —
 *  `method` on the row itself is only ever "COD" | "RAZORPAY". */
export interface AdminOrderPayment {
  id: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string | null;
  metadata?: { method?: string; instrumentDetail?: string | null; [key: string]: any } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderRider {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  status: string;
  avatar?: { url: string } | null;
}

export interface AdminOrder {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentRef?: string;
  totalAmount: number;
  discountAmount: number;
  couponCode?: string;
  deliverySlot?: string;
  deliveryCharge: number;
  billDetails?: any;
  rejectionReason?: string;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  refundStatus?: string | null;
  refundFailureReason?: string | null;
  refundFailedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  riderStatus?: string | null;
  assignedAt?: string | null;
  rider?: AdminOrderRider | null;
  delivery: { name?: string; phone?: string; address?: string; city?: string; pincode?: string };
  customer: AdminOrderCustomer;
  store: AdminOrderStore;
  seller: AdminOrderSeller;
  items: AdminOrderItem[];
  payments?: AdminOrderPayment[];
  auditTrail?: any[];
}

export interface AdminOrderListResponse {
  success: boolean;
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const fetchAdminOrderList = async (
  params: AdminOrderListParams = {},
): Promise<AdminOrderListResponse> => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") query.set(k, String(v));
  });
  const res = await axiosInstance.get(`/order/api/admin/orders?${query.toString()}`, isProtected);
  return res.data;
};

export const fetchAdminOrderDetail = async (orderId: string): Promise<AdminOrder | null> => {
  const res = await axiosInstance.get(`/order/api/admin/orders/${orderId}`, isProtected);
  return res.data.order ?? null;
};

export const adminUpdateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  await axiosInstance.put(`/order/api/admin/orders/${orderId}/status`, { status }, isProtected);
};

export interface BulkStatusResult {
  updated: string[];
  skipped: { orderId: string; reason: string }[];
}

/** Forward-only workflow moves across every store. Cancellation is not here. */
export const adminBulkUpdateOrderStatus = async (
  orderIds: string[],
  status: string,
): Promise<BulkStatusResult> => {
  const res = await axiosInstance.put(
    "/order/api/admin/orders/bulk-status",
    { orderIds, status },
    isProtected,
  );
  return res.data;
};

export const useAdminOrderList = (params: AdminOrderListParams = {}) =>
  useQuery({
    queryKey: adminQueryKeys.adminOrderList(params as any),
    queryFn: () => fetchAdminOrderList(params),
  });

export const fetchAdminOrderPincodes = async (): Promise<string[]> => {
  const res = await axiosInstance.get("/order/api/admin/orders/pincodes", isProtected);
  return Array.isArray(res.data.pincodes) ? res.data.pincodes : [];
};

export const useAdminOrderPincodes = () =>
  useQuery({
    queryKey: ["admin", "order-pincodes"],
    queryFn: fetchAdminOrderPincodes,
  });

export const useAdminOrderDetail = (orderId?: string) =>
  useQuery({
    queryKey: orderId ? adminQueryKeys.adminOrder(orderId) : ["admin", "admin-orders", "none"],
    queryFn: () => fetchAdminOrderDetail(orderId as string),
    enabled: Boolean(orderId),
  });

// ── Seller Inventory ──────────────────────────────────────────────────────

export interface InventoryProduct {
  id: string;
  title: string;
  slug: string;
  category?: string;
  salePrice: number;
  regularPrice?: number;
  stock: number;
  totalSold: number;
  status: string;
  image?: string;
  isOutOfStock: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SellerInventoryEntry {
  seller: AdminOrderSeller | null;
  store: AdminOrderStore & { openingHours?: string; closingHours?: string; instantDeliveryEnabled?: boolean };
  summary: {
    totalProducts: number;
    activeProducts: number;
    totalStock: number;
    totalSold: number;
    outOfStock: number;
    lowStockCount: number;
  };
  products: InventoryProduct[];
}

export interface SellerInventoryParams {
  search?: string;
  sellerId?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export const fetchSellerInventory = async (
  params: SellerInventoryParams = {},
): Promise<{ sellers: SellerInventoryEntry[]; pagination: any }> => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") query.set(k, String(v));
  });
  const res = await axiosInstance.get(`/product/api/admin/seller-inventory?${query.toString()}`, isProtected);
  return { sellers: res.data.sellers ?? [], pagination: res.data.pagination };
};

export const useSellerInventory = (params: SellerInventoryParams = {}) =>
  useQuery({
    queryKey: adminQueryKeys.sellerInventory(params as any),
    queryFn: () => fetchSellerInventory(params),
  });

// ── Banners ──────────────────────────────────────────────────────────────

export const fetchAdminBanners = async (): Promise<AdminBanner[]> => {
  const response = await axiosInstance.get(
    "/product/api/get-admin-banners",
    isProtected,
  );
  return Array.isArray(response.data.banners) ? response.data.banners : [];
};

export const deleteAdminBanner = async (fileId: string) => {
  await axiosInstance.post(
    "/product/api/admin/delete-cloudinary-image",
    { fileId },
    isProtected,
  );
  // Also need to delete from DB if there's a separate route, but here we'll assume 
  // the backend deleteCloudinaryImage might not delete from DB yet?
  // Actually, I should probably add a route to delete from DB.
};

export const useAdminBanners = () =>
  useQuery({
    queryKey: adminQueryKeys.banners,
    queryFn: fetchAdminBanners,
  });

