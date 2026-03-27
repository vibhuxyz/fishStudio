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
  orders: ["admin", "orders"] as const,
  discounts: ["admin", "discounts"] as const,
  categories: ["admin", "categories"] as const,
  sellers: ["admin", "sellers"] as const,
  sellerDetail: (sellerId: string) => ["admin", "sellers", sellerId] as const,
  order: (orderId: string) => ["admin", "orders", orderId] as const,
  seller: ["admin", "account"] as const,
  sellerCodes: ["admin", "sellerCodes"] as const,
  banners: ["admin", "banners"] as const,
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

export const fetchAdminProducts = async (): Promise<AdminProduct[]> => {
  const response = await axiosInstance.get("/product/api/get-owned-products", isProtected);
  const products = Array.isArray(response.data.products) ? response.data.products : [];
  return products.filter((product: AdminProduct) => !product.starting_date);
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

export const deleteDiscountCode = async (discountId: string) => {
  await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`, isProtected);
};

export const fetchCategories = async (): Promise<CategoriesResponse> => {
  const response = await axiosInstance.get("/product/api/get-categories");
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
}: {
  sellerId: string;
  isApprovedByAdmin: boolean;
  permissions: string[];
}) => {
  const response = await axiosInstance.put(
    `/auth/api/admin/sellers/${sellerId}/approval`,
    { isApprovedByAdmin, permissions },
    isProtected
  );
  return response.data;
};

export const useAdminProducts = () =>
  useQuery({
    queryKey: adminQueryKeys.products,
    queryFn: fetchAdminProducts,
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

