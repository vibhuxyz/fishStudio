import type {
  BackendProduct,
  Product,
  ProductSizePricing,
} from "@repo/zod-schema";
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
}

export interface StorefrontProductListingParams {
  storeId?: string;
  pincode?: string;
  city?: string;
  category?: string;
  subCategory?: string;
  page?: number;
  limit?: number;
  scope?: "homepage" | "listing" | "category";
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
      params.limit || "",
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

export const parseWeightToGrams = (value: string) => {
  const normalized = value.toLowerCase().replace(/\s+/g, " ").trim();

  const sameUnitRangeMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(kg|g|gm)/,
  );
  if (sameUnitRangeMatch) {
    const min = Number(sameUnitRangeMatch[1]);
    const max = Number(sameUnitRangeMatch[2]);
    const unit = sameUnitRangeMatch[3];
    const average = (min + max) / 2;
    return unit === "kg" ? Math.round(average * 1000) : Math.round(average);
  }

  const repeatedUnitRangeMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*(kg|g|gm)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(kg|g|gm)/,
  );
  if (repeatedUnitRangeMatch) {
    const min = Number(repeatedUnitRangeMatch[1]);
    const minUnit = repeatedUnitRangeMatch[2];
    const max = Number(repeatedUnitRangeMatch[3]);
    const maxUnit = repeatedUnitRangeMatch[4];
    if (minUnit === maxUnit) {
      const average = (min + max) / 2;
      return minUnit === "kg"
        ? Math.round(average * 1000)
        : Math.round(average);
    }
  }

  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)/);
  if (!match) return 0;

  const amount = Number(match[1]);
  return match[2] === "kg" ? Math.round(amount * 1000) : Math.round(amount);
};

export const normalizeSizePricing = (
  sizePricing: ProductSizePricing[] | null | undefined,
  sizes: string[],
  salePrice: number,
  regularPrice: number,
): ProductSizePricing[] => {
  if (Array.isArray(sizePricing) && sizePricing.length > 0) {
    return sizes.map((size) => {
      const matched = sizePricing.find((entry) => entry.size === size);
      return (
        matched ?? {
          size,
          weightGrams: parseWeightToGrams(size),
          salePrice,
          regularPrice,
        }
      );
    });
  }

  return sizes.map((size) => ({
    size,
    weightGrams: parseWeightToGrams(size),
    salePrice,
    regularPrice,
  }));
};

export const resolveProductSizePricing = (
  product: Pick<Product, "sizes" | "sizePricing" | "price" | "originalPrice">,
  size?: string,
) => {
  const normalizedPricing = normalizeSizePricing(
    product.sizePricing,
    product.sizes,
    product.price,
    product.originalPrice ?? product.price,
  );
  const targetSize =
    size || normalizedPricing[0]?.size || product.sizes[0] || "";
  const selected = normalizedPricing.find(
    (entry) => entry.size === targetSize,
  ) ||
    normalizedPricing[0] || {
      size: targetSize,
      weightGrams: parseWeightToGrams(targetSize),
      salePrice: product.price,
      regularPrice: product.originalPrice ?? product.price,
    };

  return {
    normalizedPricing,
    selected,
  };
};

/**
 * Resolves the displayed price based on selected size.
 * If sizePricing has an entry for the selected size, uses it; otherwise falls back to product.price.
 */
export const resolvePrice = (
  product: Pick<Product, "sizes" | "sizePricing" | "price" | "originalPrice">,
  selectedSize?: string,
): { salePrice: number; regularPrice: number; unit: string } => {
  const fallback = {
    salePrice: product.price,
    regularPrice: product.originalPrice ?? product.price,
    unit: selectedSize || "unit",
  };

  if (
    selectedSize &&
    Array.isArray(product.sizePricing) &&
    product.sizePricing.length > 0
  ) {
    const entry = product.sizePricing.find((e) => e.size === selectedSize);
    if (entry && entry.salePrice > 0) {
      return {
        salePrice: entry.salePrice,
        regularPrice:
          entry.regularPrice > 0 ? entry.regularPrice : entry.salePrice,
        unit: entry.size,
      };
    }
  }

  return fallback;
};

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
  if (params.limit) queryParams.append("limit", String(limit));
  if (params.scope) queryParams.append("scope", params.scope);

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
    getStorefrontUrl("/product/api/get-categories"),
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
