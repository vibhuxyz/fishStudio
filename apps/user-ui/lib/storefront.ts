import type { BackendProduct, Product, ProductSizePricing } from "@repo/zod-schema";
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

export const storefrontKeys = {
  products: (storeId?: string, pincode?: string, city?: string) =>
    ["storefront", "products", storeId, pincode, city].filter(Boolean) as string[],
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
  const match = value.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)/);
  if (!match) {
    return 0;
  }

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
  const targetSize = size || normalizedPricing[0]?.size || product.sizes[0] || "";
  const selected =
    normalizedPricing.find((entry) => entry.size === targetSize) ||
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

  if (selectedSize && Array.isArray(product.sizePricing) && product.sizePricing.length > 0) {
    const entry = product.sizePricing.find((e) => e.size === selectedSize);
    if (entry && entry.salePrice > 0) {
      return {
        salePrice: entry.salePrice,
        regularPrice: entry.regularPrice > 0 ? entry.regularPrice : entry.salePrice,
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
  const normalizedSizePricingData = normalizeSizePricing(
    bp.sizePricing,
    bp.sizes || [],
    bp.sale_price,
    bp.regular_price,
  );

  const defaultSize = normalizedSizePricingData[0]?.size || bp.sizes?.[0] || "";

  const partial = {
    sizes: bp.sizes || [],
    sizePricing: normalizedSizePricingData,
    price: bp.sale_price,
    originalPrice: bp.regular_price > bp.sale_price ? bp.regular_price : undefined,
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
    originalPrice: defaultResolved.regularPrice > defaultResolved.salePrice ? defaultResolved.regularPrice : undefined,
    weight: defaultSize || defaultResolved.unit,
    sizes: bp.sizes || [],
    sizePricing: normalizedSizePricingData,
    cuttingTypePricing: Array.isArray(bp.cuttingTypePricing) ? bp.cuttingTypePricing : [],
    pieceSizePricing: Array.isArray(bp.pieceSizePricing) ? bp.pieceSizePricing : [],
    rating: bp.ratings || 0,
    totalSold: bp.totalSold || 0,
    subCategory: bp.subCategory,
    category: bp.category,
    stock: bp.stock,
    cuttingTypes: bp.cuttingTypes || [],
    pieceSizes: bp.pieceSizes || [],
    processingWeightLoss: bp.processingWeightLoss,
    status: bp.status === "NonActive" ? "NonActive" : "Active",
    isBestseller: (bp.totalSold || 0) > 50,
    isFavorite: Array.isArray(bp.favorites) && bp.favorites.length > 0,
  };
};

export async function fetchStorefrontProducts(
  storeId?: string,
  pincode?: string,
  city?: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<Product[]> {
  const queryParams = new URLSearchParams();
  if (storeId) queryParams.append("storeId", storeId);
  if (pincode) queryParams.append("pincode", pincode);
  if (city) queryParams.append("city", city);

  const queryString = queryParams.toString();
  const url = getStorefrontUrl(`/product/api/get-all-products${queryString ? `?${queryString}` : ""}`);

  const response = await fetch(url, {
    ...init,
    next: init?.next ?? { revalidate: 300 },
  });
  const data = await parseJson<{ success: boolean; products?: BackendProduct[] }>(
    response,
  );

  return Array.isArray(data.products) ? data.products.map(transformProduct) : [];
}

export async function fetchStorefrontProductBySlug(
  slug: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<Product | null> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await fetch(
    getStorefrontUrl(`/product/api/get-product/${encodedSlug}`),
    {
      ...init,
      next: init?.next ?? { revalidate: 300 },
    },
  );

  if (response.status === 404) {
    return null;
  }

  const data = await parseJson<{ success: boolean; product?: BackendProduct }>(
    response,
  );

  return data.product ? transformProduct(data.product) : null;
}

export async function fetchStorefrontBanners(): Promise<StorefrontBanner[]> {
  const response = await fetch(getStorefrontUrl("/product/api/get-banners"), {
    next: { revalidate: 600 },
  });
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

export async function fetchAnnouncementBanners(
  params?: { city?: string; storeId?: string },
): Promise<AnnouncementBanner[]> {
  const query = new URLSearchParams();
  if (params?.city) query.set("city", params.city);
  if (params?.storeId) query.set("storeId", params.storeId);
  const qs = query.toString();
  const url = getStorefrontUrl(`/product/api/get-announcement-banners${qs ? `?${qs}` : ""}`);
  const response = await fetch(url, { next: { revalidate: 120 } });
  const data = await parseJson<{ success: boolean; banners?: AnnouncementBanner[] }>(response);
  return Array.isArray(data.banners) ? data.banners.filter((b) => b.isActive) : [];
}

export async function fetchStorefrontCategories(): Promise<StorefrontCategories> {
  const response = await fetch(getStorefrontUrl("/product/api/get-categories"), {
    next: { revalidate: 600 },
  });
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
