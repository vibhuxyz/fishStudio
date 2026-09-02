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

// Sellers always own their own coupons. Admins act on behalf of a seller
// they pick explicitly (there's no "admin's own" store) — adminId records
// who created it, sellerId still decides which store's coupon it is, same
// as one the seller created themselves.
export const getSellerDiscountOwnerData = async (
  req: AuthRequest,
  adminPickedSellerId?: string,
) => {
  if (req.role === "seller" && req.seller?.id) {
    return { sellerId: req.seller.id };
  }
  if (req.role === "admin" && req.admin?.id) {
    if (!adminPickedSellerId) {
      throw new ValidationError("Select a seller for this coupon");
    }
    const seller = await prisma.sellers.findUnique({
      where: { id: adminPickedSellerId },
      select: { id: true },
    });
    if (!seller) {
      throw new ValidationError("Selected seller does not exist");
    }
    return { sellerId: adminPickedSellerId, adminId: req.admin.id };
  }
  throw new ValidationError("Only seller or admin can manage discount codes!");
};

// Same shape as getSellerDiscountOwnerData: a seller acts on their own store,
// an admin acts on a seller they name explicitly. seller_events has no adminId
// column, so the pick is only recorded as the event's sellerId.
export const resolveEventOwnerSellerId = async (
  req: AuthRequest,
  adminPickedSellerId?: string,
): Promise<string> => {
  if (req.role === "seller" && req.seller?.id) {
    return req.seller.id;
  }
  if (req.role === "admin" && req.admin?.id) {
    if (!adminPickedSellerId) {
      throw new ValidationError("Select a seller for this event");
    }
    const seller = await prisma.sellers.findUnique({
      where: { id: adminPickedSellerId },
      select: { id: true },
    });
    if (!seller) {
      throw new ValidationError("Selected seller does not exist");
    }
    return adminPickedSellerId;
  }
  throw new ValidationError("Only seller or admin can manage events!");
};

// An admin may act on any seller's event (same rule as coupons); a seller only
// on their own.
export const assertEventManageAccess = (
  event: { sellerId: string },
  req: AuthRequest,
) => {
  if (req.role === "admin") return;
  if (req.role === "seller" && req.seller?.id === event.sellerId) return;
  throw new ValidationError("You are not authorized to manage this event!");
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

export const hasProductOwnerAccess = (
  product: { storeId?: string | null; adminId?: string | null },
  ownerFilter: ReturnType<typeof getOwnedProductFilter>,
) =>
  ("storeId" in ownerFilter && product.storeId === ownerFilter.storeId) ||
  ("adminId" in ownerFilter && product.adminId === ownerFilter.adminId);

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
  const values = items
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "value" in item) {
        return String((item as { value: unknown }).value ?? "");
      }
      return "";
    })
    .map((item) => item.trim())
    .filter(Boolean);
  // These render as dropdown options keyed by their own value, so a repeated
  // entry breaks the storefront rather than just looking odd.
  return [...new Set(values)];
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
    // A size the seller leaves at 0 weight/price means they don't stock it —
    // drop it instead of resurrecting it with a fallback-priced entry.
    .filter((entry): entry is NormalizedSizePricing => Boolean(entry))
    .filter((entry) => entry.weightGrams > 0 && entry.salePrice > 0);
  if (normalized.length > 0) {
    return allowedSizes
      .map((size) => normalized.find((entry) => entry.size === size))
      .filter((entry): entry is NormalizedSizePricing => Boolean(entry));
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

// One entry per tracked size, whether or not the seller submitted a value
// for it — missing/invalid entries floor to 0 rather than being dropped, so
// a size can never silently keep a stale qty from a previous submission.
export const normalizeSizeStock = (
  sizeStock: Array<{ size: string; qty: number }> | undefined,
  sizes: string[],
): Array<{ size: string; qty: number }> => {
  const submittedQtyBySize = new Map(
    (sizeStock ?? []).map((entry) => [entry.size, entry.qty]),
  );
  return [...new Set(sizes)].map((size) => ({
    size,
    qty: Math.max(0, Math.floor(Number(submittedQtyBySize.get(size)) || 0)),
  }));
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
