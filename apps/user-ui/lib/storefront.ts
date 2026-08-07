import type {
  BackendProduct,
  Product,
  ProductSizePricing,
} from "@repo/zod-schema";
import {
  normalizeSizePricing as sharedNormalizeSizePricing,
  parseWeightToGrams,
  resolvePriceFromSizePricing,
  resolveSizePricing,
} from "@repo/shared/pricing";
import { frontendEnv } from "@/lib/env";

export interface StorefrontBanner {
  id: string;
  imageUrl: string;
  fileId: string;
  isActive: boolean;
  sellerId: string;
  bannerType?: string;
  title?: string;
  subtitle?: string;
  price?: string;
}

export interface AnnouncementBanner extends StorefrontBanner {
  title: string;
  subtitle?: string;
  price?: string;
  seller?: {
    id: string;
    name: string;
    store?: { id: string; name: string; availableCities: string[] } | null;
  };
}

export interface StorefrontCategories {
  categories: string[];
  subCategories: Record<string, string[]>;
  categoryImages: Record<string, string>;
}

export interface StorefrontPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface StorefrontProductListingParams {
  storeId?: string;
  pincode?: string;
  city?: string;
  category?: string;
  subCategory?: string;
  page?: number;
  cursor?: string;
  limit?: number;
  scope?: "homepage" | "listing" | "category";
  sortBy?: "price_asc" | "price_desc" | "popular" | "newest";
  onSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasVariants?: boolean;
}

export interface StorefrontProductListingResponse {
  products: Product[];
  store?: {
    id: string;
    name: string;
    pincode: string;
    city: string;
  } | null;
  isServiceable: boolean;
  pagination: StorefrontPagination;
}

export const storefrontKeys = {
  products: (storeId?: string, pincode?: string, city?: string) =>
    ["storefront", "products", storeId, pincode, city].filter(
      Boolean,
    ) as string[],
  productListing: (params: StorefrontProductListingParams) =>
    [
      "storefront",
      "product-listing",
      params.scope || "listing",
      params.category || "",
      params.subCategory || "",
      params.storeId || "",
      params.pincode || "",
      params.city || "",
      params.page || 1,
      params.cursor || "",
      params.limit || "",
      params.sortBy || "",
      params.onSale ?? "",
      params.minPrice ?? "",
      params.maxPrice ?? "",
      params.hasVariants ?? "",
    ] as const,
  product: (slug: string) => ["storefront", "product", slug] as const,
  categories: ["storefront", "categories"] as const,
  banners: ["storefront", "banners"] as const,
  userSession: ["user", "session"] as const,
};

const getStorefrontUrl = (path: string) => `${frontendEnv.apiUrl}${path}`;

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
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

export { parseWeightToGrams };

export const normalizeSizePricing = (
  sizePricing: ProductSizePricing[] | null | undefined,
  sizes: string[],
  salePrice: number,
  regularPrice: number,
): ProductSizePricing[] => sharedNormalizeSizePricing(sizePricing, sizes, salePrice, regularPrice);

export const resolveProductSizePricing = (
  product: Pick<Product, "sizes" | "sizePricing" | "price" | "originalPrice">,
  size?: string,
) =>
  resolveSizePricing(
    product.sizePricing,
    product.sizes,
    product.price,
    product.originalPrice ?? product.price,
    size,
  );

/**
 * Resolves the displayed price based on selected size.
 * If sizePricing has an entry for the selected size, uses it; otherwise falls back to product.price.
 */
export const resolvePrice = (
  product: Pick<Product, "sizes" | "sizePricing" | "price" | "originalPrice">,
  selectedSize?: string,
): { salePrice: number; regularPrice: number; unit: string } =>
  resolvePriceFromSizePricing(
    product.sizePricing,
    product.price,
    product.originalPrice ?? product.price,
    selectedSize,
  );

/**
 * Computes the default price for a product using the first available size.
 */
export const resolveDefaultPrice = (
  product: Pick<Product, "sizes" | "sizePricing" | "price" | "originalPrice">,
): { salePrice: number; regularPrice: number; unit: string } => {
  return resolvePrice(product, product.sizes?.[0]);
};

export const transformProduct = (bp: BackendProduct): Product => {
  // Catalog-only products (not yet added to any store) may have null prices
  const salePrice = bp.sale_price ?? 0;
  const regularPrice = bp.regular_price ?? 0;

  const normalizedSizePricingData = normalizeSizePricing(
    bp.sizePricing,
    bp.sizes || [],
    salePrice,
    regularPrice,
  );

  const defaultSize = normalizedSizePricingData[0]?.size || bp.sizes?.[0] || "";

  const partial = {
    sizes: bp.sizes || [],
    sizePricing: normalizedSizePricingData,
    price: salePrice,
    originalPrice: regularPrice > salePrice ? regularPrice : undefined,
  };

  const defaultResolved = resolvePrice(partial, defaultSize);

  return {
    id: bp.id,
    name: bp.title,
    slug: bp.slug,
    description: bp.short_description,
    image: bp.images?.[0]?.url || "/placeholder.svg",
    images: bp.images?.map((img) => img.url) || [],
    price: defaultResolved.salePrice,
    originalPrice:
      defaultResolved.regularPrice > defaultResolved.salePrice
        ? defaultResolved.regularPrice
        : undefined,
    weight: defaultSize || defaultResolved.unit,
    sizes: bp.sizes || [],
    sizePricing: normalizedSizePricingData,
    cuttingTypePricing: Array.isArray(bp.cuttingTypePricing)
      ? bp.cuttingTypePricing
      : [],
    pieceSizePricing: Array.isArray(bp.pieceSizePricing)
      ? bp.pieceSizePricing
      : [],
    rating: bp.ratings || 0,
    totalSold: bp.totalSold || 0,
    subCategory: bp.subCategory,
    category: bp.category,
    stock: bp.stock,
    storeId: (bp as any).storeId ?? undefined,
    cuttingTypes: bp.cuttingTypes || [],
    pieceSizes: bp.pieceSizes || [],
    processingWeightLoss: bp.processingWeightLoss,
    status: bp.status === "NonActive" ? "NonActive" : "Active",
    basePricePerKg: bp.basePricePerKg ?? null,
    isBestseller: (bp.totalSold || 0) > 50,
    isFavorite: Array.isArray(bp.favorites) && bp.favorites.length > 0,
    badges: Array.isArray(bp.badges) ? bp.badges : [],
    origin: bp.origin,
    source: bp.source,
    shelfLife: bp.shelfLife,
    storageInstructions: bp.storageInstructions,
    cookingTips: Array.isArray(bp.cookingTips) ? bp.cookingTips : [],
    highlightDescription: bp.highlightDescription,
    nutritionProtein: bp.nutritionProtein,
    nutritionOmega3: bp.nutritionOmega3,
    nutritionCalories: bp.nutritionCalories,
  };
};

export async function fetchStorefrontProductListing(
  params: StorefrontProductListingParams = {},
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<StorefrontProductListingResponse> {
  const queryParams = new URLSearchParams();
  if (params.storeId) queryParams.append("storeId", params.storeId);
  if (params.pincode) queryParams.append("pincode", params.pincode);
  if (params.city) queryParams.append("city", params.city);
  if (params.category) queryParams.append("category", params.category);
  if (params.subCategory) queryParams.append("subCategory", params.subCategory);
  // Clamp pagination values to safe bounds
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const limit = Math.min(48, Math.max(1, Math.floor(params.limit ?? 20)));
  if (params.page) queryParams.append("page", String(page));
  if (params.cursor) queryParams.append("cursor", params.cursor);
  if (params.limit) queryParams.append("limit", String(limit));
  if (params.scope) queryParams.append("scope", params.scope);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.onSale) queryParams.append("onSale", "true");
  if (params.minPrice !== undefined) queryParams.append("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) queryParams.append("maxPrice", String(params.maxPrice));
  if (params.hasVariants) queryParams.append("hasVariants", "true");

  const queryString = queryParams.toString();
  const url = getStorefrontUrl(
    `/product/api/get-all-products${queryString ? `?${queryString}` : ""}`,
  );

  const response = await fetch(url, {
    ...init,
    next: init?.next ?? { revalidate: 300 },
  });
  const data = await parseJson<{
    success: boolean;
    products?: BackendProduct[];
    store?: StorefrontProductListingResponse["store"];
    isServiceable?: boolean;
    pagination?: Partial<StorefrontPagination>;
  }>(response);

  return {
    products: Array.isArray(data.products)
      ? data.products.map(transformProduct)
      : [],
    store: data.store ?? null,
    isServiceable: data.isServiceable ?? true,
    pagination: {
      page: data.pagination?.page ?? params.page ?? 1,
      limit: data.pagination?.limit ?? params.limit ?? 20,
      total: data.pagination?.total ?? 0,
      hasMore: data.pagination?.hasMore ?? false,
      nextCursor: data.pagination?.nextCursor ?? null,
    },
  };
}

export async function fetchStorefrontProducts(
  storeId?: string,
  pincode?: string,
  city?: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<Product[]> {
  const data = await fetchStorefrontProductListing(
    {
      storeId,
      pincode,
      city,
    },
    init,
  );

  return data.products;
}

export async function fetchStorefrontProductBySlug(
  slug: string,
  params?: {
    storeId?: string;
    pincode?: string;
    city?: string;
    userId?: string;
  },
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<{
  product: Product | null;
  relatedProducts: Product[];
  coupon?: any;
}> {
  const encodedSlug = encodeURIComponent(slug);
  const query = new URLSearchParams();
  if (params?.storeId) query.set("storeId", params.storeId);
  if (params?.pincode) query.set("pincode", params.pincode);
  if (params?.city) query.set("city", params.city);
  if (params?.userId) query.set("userId", params.userId);
  const qs = query.toString();
  const response = await fetch(
    getStorefrontUrl(
      `/product/api/get-product/${encodedSlug}${qs ? `?${qs}` : ""}`,
    ),
    {
      ...init,
      next: init?.next ?? { revalidate: 300 },
    },
  );

  if (response.status === 404) {
    return { product: null, relatedProducts: [] };
  }

  const data = await parseJson<{
    success: boolean;
    product?: BackendProduct;
    relatedProducts?: BackendProduct[];
    coupon?: any;
  }>(response);

  return {
    product: data.product ? transformProduct(data.product) : null,
    relatedProducts: Array.isArray(data.relatedProducts)
      ? data.relatedProducts.map(transformProduct)
      : [],
    coupon: data.coupon || null,
  };
}

export async function fetchStorefrontBanners(params?: {
  storeId?: string;
  pincode?: string;
}): Promise<StorefrontBanner[]> {
  const query = new URLSearchParams();
  if (params?.storeId) query.set("storeId", params.storeId);
  if (params?.pincode) query.set("pincode", params.pincode);
  const response = await fetch(
    getStorefrontUrl(
      `/product/api/get-banners${query.toString() ? `?${query.toString()}` : ""}`,
    ),
    {
      next: { revalidate: 600 },
    },
  );
  const data = await parseJson<{
    success: boolean;
    banners?: StorefrontBanner[];
  }>(response);

  return Array.isArray(data.banners)
    ? data.banners.filter((banner) => banner.isActive)
    : [];
}

export async function fetchStorefrontCategoryBanners(
  category: string,
  params?: { storeId?: string; pincode?: string },
): Promise<StorefrontBanner[]> {
  const query = new URLSearchParams();
  query.set("category", category);
  if (params?.storeId) query.set("storeId", params.storeId);
  if (params?.pincode) query.set("pincode", params.pincode);
  const url = getStorefrontUrl(`/product/api/get-banners?${query.toString()}`);
  const response = await fetch(url, {
    next: { revalidate: 300 },
  });
  const data = await parseJson<{
    success: boolean;
    banners?: StorefrontBanner[];
  }>(response);

  return Array.isArray(data.banners)
    ? data.banners.filter((banner) => banner.isActive)
    : [];
}

export async function fetchAnnouncementBanners(params?: {
  city?: string;
  storeId?: string;
}): Promise<AnnouncementBanner[]> {
  const query = new URLSearchParams();
  if (params?.city) query.set("city", params.city);
  if (params?.storeId) query.set("storeId", params.storeId);
  const qs = query.toString();
  const url = getStorefrontUrl(
    `/product/api/get-announcement-banners${qs ? `?${qs}` : ""}`,
  );
  const response = await fetch(url, { next: { revalidate: 120 } });
  const data = await parseJson<{
    success: boolean;
    banners?: AnnouncementBanner[];
  }>(response);
  return Array.isArray(data.banners)
    ? data.banners.filter((b) => b.isActive)
    : [];
}

export async function fetchStorefrontCategories(): Promise<StorefrontCategories> {
  const response = await fetch(
    getStorefrontUrl("/product/api/get-categories?activeOnly=true"),
    {
      next: { revalidate: 600 },
    },
  );
  const data = await parseJson<{
    success?: boolean;
    categories?: string[];
    subCategories?: Record<string, string[]>;
    categoryImages?: Record<string, string>;
  }>(response);

  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    subCategories:
      data.subCategories && typeof data.subCategories === "object"
        ? data.subCategories
        : {},
    categoryImages:
      data.categoryImages && typeof data.categoryImages === "object"
        ? data.categoryImages
        : {},
  };
}
