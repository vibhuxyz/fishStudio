import { Request } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "@repo/env-config";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { redis } from "@repo/libs/redis";

// Shared by storefront reads, cart validation, and homepage/activity
// sections — all of them resolve a preferred store from location and cache
// their payloads under the same "storefront:*" key namespace.

export const STOREFRONT_CACHE_TTL = 300;
export const MAX_STOREFRONT_LIMIT = 48;

// Best-effort, non-throwing user id extraction. Unlike isAuthenticated this
// never rejects the request — anonymous callers fall back to guest handling.
export const optionalUserId = (req: Request): string | null => {
  try {
    const bearer = (req.headers.authorization as string | undefined)?.split(" ")[1];
    const token = bearer || (req as any).cookies?.access_token;
    if (!token) return null;
    const decoded = jwt.verify(token, ENV.ACCESS_TOKEN_JWT_SECRET_KEY as string) as {
      id?: string;
      role?: string;
    };
    return decoded?.id ?? null;
  } catch {
    return null;
  }
};

/**
 * The only variant fields mergeCatalogWithVariant and pickBestVariantPerCatalog
 * actually read.
 *
 * A `select`, not an `include`: every descriptive field on a product (nutrition,
 * cooking tips, storage, the long marketing copy) is taken from the catalog root
 * during the merge, so including them per variant moved ~40 unused fields per
 * row on the hottest storefront queries. The seller was previously `include`d
 * whole — which fetched its password hash — when only its events are read.
 *
 * Keep this in step with the fields mergeCatalogWithVariant touches; it takes
 * `any`, so dropping one here fails at runtime rather than at compile time.
 */
export const storefrontVariantSelect = {
  id: true,
  catalogProductId: true,
  stock: true,
  // Per-size stock, for products sold by weight tier. Without these the
  // storefront has no way to know a single size is sold out and offers it
  // anyway, which the customer only discovers at checkout.
  trackStockPerSize: true,
  sizeStock: true,
  sale_price: true,
  regular_price: true,
  sizePricing: true,
  cuttingTypePricing: true,
  pieceSizePricing: true,
  basePricePerKg: true,
  slug: true,
  storeId: true,
  discount_codes: true,
  images: true,
  store: {
    select: {
      id: true,
      name: true,
      pincode: true,
      city: true,
      seller: { select: { events: true } },
    },
  },
} as const;

export const parseStorefrontLimit = (value: unknown, fallback: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return Math.min(Math.floor(numeric), MAX_STOREFRONT_LIMIT);
};

export const parseStorefrontPage = (value: unknown, fallback = 1) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return Math.floor(numeric);
};

export const buildStorefrontCacheKey = (
  key: string,
  payload: Record<string, unknown>,
) => {
  const serialized = Object.entries(payload)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}=${String(value)}`)
    .join("&");

  return `storefront:${key}:${serialized || "default"}`;
};

export const getCachedPayload = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redis.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch (error) {
    console.error("[Storefront Cache Read Error]", error);
    return null;
  }
};

export const setCachedPayload = (key: string, payload: unknown) => {
  redis
    .setex(key, STOREFRONT_CACHE_TTL, JSON.stringify(payload))
    .catch((error) => console.error("[Storefront Cache Write Error]", error));
};

export type StoreLocationInput = {
  storeId?: string;
  pincode?: string;
  city?: string;
};

const normalizeLocationValue = (value?: string | null) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

// storeId arrives straight from a query string, and Prisma rejects anything
// that isn't a 24-char hex ObjectId with P2023 — which surfaces as a 500 on a
// storefront page rather than as a plain "no store here". A stale or hand-typed
// id is dropped from the filter so pincode/city can still resolve a store.
const isObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

const buildStoreLocationWhere = ({
  storeId,
  pincode,
  city,
}: StoreLocationInput) => {
  const filters: Record<string, unknown>[] = [];

  if (storeId && isObjectId(storeId)) {
    filters.push({ id: String(storeId) });
  }
  if (pincode) {
    filters.push({ pincode: String(pincode) });
    filters.push({ availableCities: { has: String(pincode) } });
    filters.push({ servicePincodes: { has: String(pincode) } });
  }
  if (city) {
    filters.push({ city: { equals: String(city), mode: "insensitive" } });
    filters.push({ availableCities: { has: String(city) } });
  }

  return filters.length > 0 ? { OR: filters } : undefined;
};

const scoreStoreForLocation = (
  store: {
    id: string;
    pincode: string;
    city: string;
    availableCities: string[];
    servicePincodes?: string[];
  },
  location: StoreLocationInput,
) => {
  const normalizedPincode = normalizeLocationValue(location.pincode);
  const normalizedCity = normalizeLocationValue(location.city);
  const normalizedStoreCity = normalizeLocationValue(store.city);
  const normalizedAvailableCities = Array.isArray(store.availableCities)
    ? store.availableCities.map(normalizeLocationValue)
    : [];
  const normalizedServicePincodes = Array.isArray(store.servicePincodes)
    ? store.servicePincodes.map(normalizeLocationValue)
    : [];

  if (location.storeId && store.id === location.storeId) return 1000;
  if (
    normalizedPincode &&
    normalizeLocationValue(store.pincode) === normalizedPincode
  ) {
    return 900;
  }
  if (normalizedCity && normalizedStoreCity === normalizedCity) {
    return 800;
  }
  if (
    normalizedPincode &&
    (normalizedAvailableCities.includes(normalizedPincode) ||
      normalizedServicePincodes.includes(normalizedPincode))
  ) {
    return 700;
  }
  if (normalizedCity && normalizedAvailableCities.includes(normalizedCity)) {
    return 600;
  }

  return 0;
};

export const resolvePreferredStore = async (location: StoreLocationInput) => {
  const where = buildStoreLocationWhere(location);
  if (!where) return null;

  const stores = await prisma.stores.findMany({
    where,
    select: {
      id: true,
      name: true,
      city: true,
      pincode: true,
      opening_hours: true,
      closing_hours: true,
      is_instant_delivery_enabled: true,
      instant_delivery_fee: true,
      instant_delivery_window_start: true,
      instant_delivery_window_end: true,
      cityDeliveryTimes: true,
      availableCities: true,
      servicePincodes: true,
      sellerId: true,
    },
  });

  if (stores.length === 0) return null;

  return stores
    .slice()
    .sort(
      (a, b) =>
        scoreStoreForLocation(b, location) - scoreStoreForLocation(a, location),
    )[0]!;
};

// Picks the best variant per catalog product: prefer in-stock (stock > 0)
// first, then cheapest sale_price. Shared by getStoreProducts and
// buildMergedFromCatalogs, which both merge a catalog-root list against a
// same-page variant list using this exact selection rule.
export const pickBestVariantPerCatalog = <
  T extends {
    catalogProductId: string | null;
    stock: number | null;
    sale_price: number | null;
  },
>(
  variants: T[],
) => {
  const bestVariantMap = new Map<string, T>();
  for (const v of variants) {
    const cid = v.catalogProductId!;
    const existing = bestVariantMap.get(cid);
    if (!existing) {
      bestVariantMap.set(cid, v);
      continue;
    }
    const vInStock = (v.stock ?? 0) > 0;
    const exInStock = (existing.stock ?? 0) > 0;
    if (
      (vInStock && !exInStock) ||
      (vInStock === exInStock && (v.sale_price ?? 0) < (existing.sale_price ?? 0))
    ) {
      bestVariantMap.set(cid, v);
    }
  }
  return bestVariantMap;
};

/**
 * One entry per size the product is sold in, with whether it can be bought.
 *
 * `sizeStock` is an array of {size, qty} rather than a map — size labels like
 * "1.1 kg" contain dots, which Mongo would read as nested-path separators.
 */
const buildSizeAvailability = (catalog: any, variant: any) => {
  const sizes: string[] = catalog.sizes ?? variant.sizes ?? [];
  if (sizes.length === 0) return [];

  if (!variant.trackStockPerSize) {
    const inStock = (variant.stock ?? 0) > 0;
    return sizes.map((size) => ({ size, qty: variant.stock ?? 0, inStock }));
  }

  const qtyBySize = new Map(
    ((variant.sizeStock ?? []) as Array<{ size: string; qty: number }>).map(
      (entry) => [entry.size, Number(entry.qty) || 0],
    ),
  );
  // A size with no entry is treated as sold out, not as unlimited — the
  // safe direction when the seller has opted into per-size tracking.
  return sizes.map((size) => {
    const qty = qtyBySize.get(size) ?? 0;
    return { size, qty, inStock: qty > 0 };
  });
};

export const mergeCatalogWithVariant = (
  catalog: any,
  variant: any,
  preferredStore?: any,
) => {
  if (!variant) {
    return {
      ...catalog,
      catalogProductId: catalog.id,
      stock: 0,
      inStock: false,
      // No variant means no store stocks it here, so every size is unavailable
      // rather than unknown.
      sizeAvailability: (catalog.sizes ?? []).map((size: string) => ({
        size,
        qty: 0,
        inStock: false,
      })),
      sale_price: null,
      regular_price: null,
      storeId: preferredStore?.id ?? null,
      store: preferredStore
        ? {
            id: preferredStore.id,
            name: preferredStore.name,
            pincode: preferredStore.pincode,
            city: preferredStore.city,
          }
        : null,
      activeEvents: [],
      availabilityStatus: preferredStore
        ? "Out of stock in your area"
        : "Check local availability",
      nearbyHint: preferredStore ? null : "Try another location",
    };
  }

  const now = new Date();
  const activeEvents =
    variant.store?.seller?.events?.filter(
      (event: any) =>
        event.isActive &&
        new Date(event.startTime) <= now &&
        new Date(event.endTime) >= now,
    ) ?? [];

  return {
    ...catalog,
    id: variant.id,
    catalogProductId: catalog.id,
    stock: variant.stock,
    sale_price: variant.sale_price,
    regular_price: variant.regular_price,
    sizePricing: variant.sizePricing ?? catalog.sizePricing,
    cuttingTypePricing:
      variant.cuttingTypePricing ?? catalog.cuttingTypePricing,
    pieceSizePricing: variant.pieceSizePricing ?? catalog.pieceSizePricing,
    basePricePerKg: variant.basePricePerKg ?? catalog.basePricePerKg ?? null,
    storeId: variant.storeId,
    inStock: (variant.stock ?? 0) > 0,
    // Per-size availability, so the picker can disable a sold-out weight
    // instead of letting the customer choose it and fail at checkout.
    //
    // Disabled rather than hidden: a size that silently disappears makes the
    // product look broken and throws away the signal that someone wanted it.
    // When the seller does not track stock per size, every listed size follows
    // the variant's single pool.
    sizeAvailability: buildSizeAvailability(catalog, variant),
    discount_codes: variant.discount_codes ?? [],
    images: catalog.images?.length ? catalog.images : variant.images,
    activeEvents,
    store: variant.store
      ? {
          id: variant.store.id,
          name: variant.store.name,
          pincode: variant.store.pincode,
          city: variant.store.city,
        }
      : null,
    slug: catalog.slug ?? variant.slug,
  };
};
