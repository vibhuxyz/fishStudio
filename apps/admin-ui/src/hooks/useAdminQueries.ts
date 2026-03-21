import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
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
  selectedOptions?: Record<string, string>;
  product?: {
    title?: string;
    images?: Array<{
      url?: string | null;
    }>;
  } | null;
};

export type SellerOrder = {
  id: string;
  total: number;
  status: string;
  deliveryStatus: string;
  createdAt: string;
  discountAmount: number;
  user?: {
    name?: string | null;
  } | null;
  couponCode?: {
    public_name?: string;
    discountType?: string;
    discountValue?: number;
  } | null;
  shippingAddress?: ShippingAddress | null;
  items: OrderItem[];
};

export type SlugValidationResponse = {
  available?: boolean;
  slug?: string;
  suggestedSlug?: string;
};

export type DiscountCodePayload = {
  public_name: string;
  discountType: string;
  discountValue: string;
  discountCode: string;
};

export type UpdateProductPayload = {
  productId: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  detailed_description: string;
  tags: string;
  regular_price?: number;
  sale_price?: number;
  stock?: number;
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
  };
};

export const createAdminCategory = async (name: string) => {
  await axiosInstance.post(
    "/product/api/create-category",
    { name },
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

export const fetchAdminSellerDetail = async (
  sellerId: string,
): Promise<AdminSellerDetail | null> => {
  const response = await axiosInstance.get(
    `/auth/api/admin/sellers/${sellerId}`,
    isProtected,
  );
  return response.data.seller ?? null;
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

export const useAdminSellerDetail = (sellerId?: string) =>
  useQuery({
    queryKey: sellerId
      ? adminQueryKeys.sellerDetail(sellerId)
      : ["admin", "sellers", "unknown"],
    queryFn: () => fetchAdminSellerDetail(sellerId as string),
    enabled: Boolean(sellerId),
  });

export const useOrderDetail = (orderId?: string) =>
  useQuery({
    queryKey: orderId ? adminQueryKeys.order(orderId) : ["admin", "orders", "unknown"],
    queryFn: () => fetchOrderDetail(orderId as string),
    enabled: Boolean(orderId),
  });
