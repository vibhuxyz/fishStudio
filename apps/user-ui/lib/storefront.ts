import type { BackendProduct, Product, ProductSizePricing } from "@repo/types";
import { frontendEnv } from "@/lib/env";

export interface StorefrontBanner {
  id: string;
  imageUrl: string;
  fileId: string;
  isActive: boolean;
  sellerId: string;
}

export interface StorefrontCategories {
  categories: string[];
  subCategories: Record<string, string[]>;
}

export const storefrontKeys = {
  products: ["storefront", "products"] as const,
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

export const transformProduct = (bp: BackendProduct): Product => {
  const normalizedPricing = normalizeSizePricing(
    bp.sizePricing,
    bp.sizes || [],
    bp.sale_price,
    bp.regular_price,
  );
  const defaultSize = normalizedPricing[0]?.size || bp.sizes?.[0] || "1kg";
  const defaultPricing = normalizedPricing[0];

  return {
    id: bp.id,
    name: bp.title,
    slug: bp.slug,
    description: bp.short_description,
    image: bp.images?.[0]?.url || "/placeholder.svg",
    images: bp.images?.map((img) => img.url) || [],
    price: defaultPricing?.salePrice ?? bp.sale_price,
    originalPrice:
      (defaultPricing?.regularPrice ?? bp.regular_price) >
      (defaultPricing?.salePrice ?? bp.sale_price)
        ? defaultPricing?.regularPrice ?? bp.regular_price
        : undefined,
    weight: defaultSize,
    sizes: bp.sizes || [],
    sizePricing: normalizedPricing,
    rating: bp.ratings || 0,
    totalSold: bp.totalSold || 0,
    subCategory: bp.subCategory,
    category: bp.category,
    stock: bp.stock,
    cuttingTypes: bp.cuttingTypes || [],
    pieceSizes: bp.pieceSizes || [],
    processingWeightLoss: bp.processingWeightLoss,
    isBestseller: (bp.totalSold || 0) > 50,
    isFavorite: Array.isArray(bp.favorites) && bp.favorites.length > 0,
  };
};

export async function fetchStorefrontProducts(
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<Product[]> {
  const response = await fetch(getStorefrontUrl("/product/api/get-all-products"), {
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

export async function fetchStorefrontCategories(): Promise<StorefrontCategories> {
  const response = await fetch(getStorefrontUrl("/product/api/get-categories"), {
    next: { revalidate: 600 },
  });
  const data = await parseJson<{
    success?: boolean;
    categories?: string[];
    subCategories?: Record<string, string[]>;
  }>(response);

  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    subCategories:
      data.subCategories && typeof data.subCategories === "object"
        ? data.subCategories
        : {},
  };
}
