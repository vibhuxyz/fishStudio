import { Request } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { ValidationError } from "@repo/error-handlers";

export interface AuthRequest extends Request {
  role?: "admin" | "seller" | "user" | "staff";
  admin?: {
    id: string;
  };
  seller?: {
    id: string;
    store?: {
      id: string;
      name?: string;
    } | null;
  };
  staff?: {
    id: string;
    sellerId: string;
  }
  user?: {
    id: string;
  };
}

export const getSellerDiscountOwnerData = (req: AuthRequest) => {
  if (req.role === "seller" && req.seller?.id) {
    return { sellerId: req.seller.id };
  }
  throw new ValidationError("Only seller can manage discount codes!");
};

export const getOwnedProductFilter = (req: AuthRequest) => {
  if (req.role === "admin" && req.admin?.id) {
    return { adminId: req.admin.id, isDeleted: false };
  }
  if ((req.role === "seller" || req.role === "staff") && req.seller?.store?.id) {
    return { storeId: req.seller.store.id, isDeleted: false };
  }
  throw new ValidationError("Only admin, seller, or authorized staff can manage products!");
};

export const getSellerStore = (req: AuthRequest) => {
  if ((req.role === "seller" || req.role === "staff") && req.seller?.store?.id) {
    return req.seller.store;
  }
  throw new ValidationError("Seller store is required");
};

export const interleaveBanners = <
  T extends {
    sellerId?: string | null;
    adminId?: string | null;
  },
>(
  items: T[],
) => {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const key = item.sellerId || item.adminId || "admin-global";
    const memberItems = grouped.get(key) ?? [];
    memberItems.push(item);
    grouped.set(key, memberItems);
  }
  const groupedArrays = Array.from(grouped.values());
  const maxLength = groupedArrays.reduce(
    (longest, sellerItems) => Math.max(longest, sellerItems.length),
    0,
  );
  const interleaved: T[] = [];
  for (let index = 0; index < maxLength; index++) {
    for (const sellerItems of groupedArrays) {
      const item = sellerItems[index];
      if (item) {
        interleaved.push(item);
      }
    }
  }
  return interleaved;
};

export const isEventLive = (startTime: Date, endTime: Date) => {
  const now = Date.now();
  return startTime.getTime() <= now && endTime.getTime() >= now;
};

export const mapProductWithActiveEvents = (product: any) => {
  const sellerEvents =
    product?.store?.seller?.events && Array.isArray(product.store.seller.events)
      ? product.store.seller.events.filter((event: any) =>
          isEventLive(new Date(event.startTime), new Date(event.endTime)),
        )
      : [];
  return {
    ...product,
    activeEvents: sellerEvents,
  };
};

export const isCatalogRootProduct = (
  product:
    | {
        adminId?: string | null;
        storeId?: string | null;
        catalogProductId?: string | null;
        isDeleted?: boolean | null;
      }
    | null
    | undefined,
) => {
  if (!product) return false;
  return (
    Boolean(product.adminId) &&
    !product.storeId &&
    !product.catalogProductId &&
    product.isDeleted !== true
  );
};

export const normalizeDynamicValues = (items: unknown) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "value" in item) {
        return String((item as { value: unknown }).value ?? "");
      }
      return "";
    })
    .map((item) => item.trim())
    .filter(Boolean);
};

export type NormalizedSizePricing = {
  size: string;
  weightGrams: number;
  salePrice: number;
  regularPrice: number;
};

export const parseWeightToGrams = (value: string) => {
  const normalized = value.toLowerCase();
  const matches = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)/g);
  if (!matches || matches.length === 0) return 0;
  const firstMatch = matches[0]?.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)/);
  if (!firstMatch) return 0;
  const amount = Number(firstMatch[1]);
  const unit = firstMatch[2];
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return unit === "kg" ? Math.round(amount * 1000) : Math.round(amount);
};

export const normalizeSizePricing = (
  value: unknown,
  allowedSizes: string[],
  fallbackSalePrice = 0,
  fallbackRegularPrice = 0,
): NormalizedSizePricing[] => {
  const allowedSizeSet = new Set(allowedSizes.filter(Boolean));
  if (!Array.isArray(value)) {
    return allowedSizes.map((size) => ({
      size,
      weightGrams: parseWeightToGrams(size),
      salePrice: Number(fallbackSalePrice || 0),
      regularPrice: Number(fallbackRegularPrice || fallbackSalePrice || 0),
    }));
  }
  const normalized = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const size = String((entry as Record<string, unknown>).size ?? "").trim();
      if (!size || !allowedSizeSet.has(size)) return null;
      const rawSalePrice =
        (entry as Record<string, unknown>).salePrice ??
        (entry as Record<string, unknown>).sale_price;
      const rawRegularPrice =
        (entry as Record<string, unknown>).regularPrice ??
        (entry as Record<string, unknown>).regular_price;
      const rawWeightGrams =
        (entry as Record<string, unknown>).weightGrams ??
        (entry as Record<string, unknown>).weight_grams;
      const salePrice = Number(rawSalePrice ?? fallbackSalePrice ?? 0);
      const regularPrice = Number(
        rawRegularPrice ??
          rawSalePrice ??
          fallbackRegularPrice ??
          fallbackSalePrice ??
          0,
      );
      const weightGrams = Number(
        rawWeightGrams ?? parseWeightToGrams(size) ?? 0,
      );
      return {
        size,
        salePrice: Number.isFinite(salePrice) ? salePrice : 0,
        regularPrice: Number.isFinite(regularPrice) ? regularPrice : 0,
        weightGrams:
          Number.isFinite(weightGrams) && weightGrams > 0
            ? Math.round(weightGrams)
            : parseWeightToGrams(size),
      };
    })
    .filter((entry): entry is NormalizedSizePricing => Boolean(entry));
  if (normalized.length > 0) {
    return allowedSizes.map((size) => {
      const matching = normalized.find((entry) => entry.size === size);
      return (
        matching ?? {
          size,
          weightGrams: parseWeightToGrams(size),
          salePrice: Number(fallbackSalePrice || 0),
          regularPrice: Number(fallbackRegularPrice || fallbackSalePrice || 0),
        }
      );
    });
  }
  return allowedSizes.map((size) => ({
    size,
    weightGrams: parseWeightToGrams(size),
    salePrice: Number(fallbackSalePrice || 0),
    regularPrice: Number(fallbackRegularPrice || fallbackSalePrice || 0),
  }));
};

export const getDisplayPricesFromSizePricing = (
  sizePricing: NormalizedSizePricing[],
) => {
  if (sizePricing.length === 0) {
    return { salePrice: 0, regularPrice: 0 };
  }
  const cheapestEntry = sizePricing.reduce((lowest, entry) =>
    entry.salePrice < lowest.salePrice ? entry : lowest,
  );
  return {
    salePrice: cheapestEntry.salePrice,
    regularPrice:
      cheapestEntry.regularPrice > 0
        ? cheapestEntry.regularPrice
        : cheapestEntry.salePrice,
  };
};

export const normalizeCuttingTypePricing = (
  value: unknown,
  allowedTypes: string[],
): { cuttingType: string; salePrice: number; regularPrice: number }[] => {
  if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) return [];
  const incoming = Array.isArray(value) ? value : [];
  const map = new Map(
    incoming.map((entry: any) => [entry?.cuttingType, entry]),
  );
  return allowedTypes.map((cuttingType) => {
    const entry = map.get(cuttingType);
    return {
      cuttingType,
      salePrice: Number(entry?.salePrice ?? 0),
      regularPrice: Number(entry?.regularPrice ?? 0),
    };
  });
};

export const normalizePieceSizePricing = (
  value: unknown,
  allowedPieceSizes: string[],
): { pieceSize: string; salePrice: number; regularPrice: number }[] => {
  if (!Array.isArray(allowedPieceSizes) || allowedPieceSizes.length === 0) return [];
  const incoming = Array.isArray(value) ? value : [];
  const map = new Map(
    incoming.map((entry: any) => [entry?.pieceSize, entry]),
  );
  return allowedPieceSizes.map((pieceSize) => {
    const entry = map.get(pieceSize);
    return {
      pieceSize,
      salePrice: Number(entry?.salePrice ?? 0),
      regularPrice: Number(entry?.regularPrice ?? 0),
    };
  });
};

export const getRequiredParam = (
  value: string | string[] | undefined,
  label: string,
) => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  throw new ValidationError(`${label} is required`);
};

export const buildUniqueSlug = async (
  baseSlug: string,
  suffix?: string,
  excludeId?: string,
) => {
  const normalizedBase = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
  const slugBase = suffix ? `${normalizedBase}-${suffix}` : normalizedBase;
  let uniqueSlug = slugBase.substring(0, 60);
  let counter = 1;
  while (
    await prisma.products.findFirst({
      where: {
        slug: uniqueSlug,
        ...(excludeId
          ? {
              NOT: {
                id: excludeId,
              },
            }
          : {}),
      },
      select: { id: true },
    })
  ) {
    uniqueSlug = `${slugBase}-${counter}`.substring(0, 60);
    counter++;
  }
  return uniqueSlug;
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
