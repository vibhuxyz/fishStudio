import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { redis } from "@repo/libs/redis";
import { isCatalogRootProduct } from "./utils.js";
import { computeBadges } from "./badges.js";
import {
  storefrontVariantSelect,
  buildStorefrontCacheKey,
  getCachedPayload,
  setCachedPayload,
  resolvePreferredStore,
  mergeCatalogWithVariant,
  pickBestVariantPerCatalog,
  optionalUserId,
  StoreLocationInput,
} from "./storefront.utils.js";

// Given a list of catalog-root products (already ordered), fetches the best
// in-area variant for each, merges them, and attaches badges. Order of the
// input list is preserved in the output. Shared by sections / recently-viewed /
// for-you so the storefront card shape stays identical everywhere.
const buildMergedFromCatalogs = async (
  catalogProducts: any[],
  preferredStore: any,
  isLocalRequest: boolean,
) => {
  const catalogIds = catalogProducts.map((p: any) => p.id);
  const variants = catalogIds.length
    ? await prisma.products.findMany({
        where: {
          catalogProductId: { in: catalogIds },
          status: "Active",
          isDeleted: false,
          ...(preferredStore ? { storeId: preferredStore.id } : {}),
        },
        select: storefrontVariantSelect,
      })
    : [];

  const bestVariantMap = pickBestVariantPerCatalog(variants);

  const merged = catalogProducts.map((catalog: any) =>
    mergeCatalogWithVariant(
      catalog,
      bestVariantMap.get(catalog.id),
      isLocalRequest ? preferredStore : null,
    ),
  );
  for (const p of merged as any[]) {
    if (!p.inStock) p.stock = 0;
    p.badges = computeBadges(p);
  }
  return merged;
};

// Fetches catalog roots matching `where`, ordered by `orderBy`, then merges
// with the best variant. Oversamples so the catalog-root JS filter still yields
// a full section.
const fetchSectionProducts = async (opts: {
  where: any;
  orderBy?: any;
  take: number;
  preferredStore: any;
  isLocalRequest: boolean;
}) => {
  const { where, orderBy, take, preferredStore, isLocalRequest } = opts;
  const catalogRaw = await prisma.products.findMany({
    where,
    include: { images: true },
    ...(orderBy ? { orderBy } : {}),
    take: Math.min(take * 3, take + 40),
  });
  const catalogProducts = catalogRaw.filter(isCatalogRootProduct).slice(0, take);
  return buildMergedFromCatalogs(catalogProducts, preferredStore, isLocalRequest);
};

const parseLocation = (req: Request): StoreLocationInput => ({
  storeId: req.query.storeId ? String(req.query.storeId) : undefined,
  pincode: req.query.pincode ? String(req.query.pincode) : undefined,
  city: req.query.city ? String(req.query.city) : undefined,
});

const SECTION_BASE_WHERE = { adminId: { not: null }, isDeleted: false };

// Membership rules for the home carousels. Kept in one place because the
// carousel and its "See all" page have to agree on what's in a section —
// otherwise the rail shows products the full listing doesn't.
const SECTION_DEFINITIONS: Record<
  string,
  { title: string; where: any; orderBy: any; fallbackOrderBy?: any }
> = {
  "fresh-arrivals": {
    title: "Fresh Arrivals",
    where: {
      OR: [{ tags: { has: "fresh-today" } }, { tags: { has: "fresh-arrival" } }],
    },
    orderBy: [{ createdAt: "desc" as const }],
    // Nothing tagged yet on a new install — fall back to the newest products.
    fallbackOrderBy: [{ createdAt: "desc" as const }],
  },
  "best-sellers": {
    title: "Best Sellers",
    where: {},
    orderBy: [{ totalSold: "desc" as const }, { createdAt: "desc" as const }],
  },
  combos: {
    title: "Combos",
    where: {
      OR: [
        { category: { equals: "Combos", mode: "insensitive" } },
        { tags: { has: "combo" } },
      ],
    },
    orderBy: [{ totalSold: "desc" as const }, { createdAt: "desc" as const }],
  },
  seasonal: {
    title: "Seasonal Specials",
    where: {
      OR: [
        { category: { equals: "Seasonal Specials", mode: "insensitive" } },
        { tags: { has: "seasonal" } },
      ],
    },
    orderBy: [{ createdAt: "desc" as const }],
  },
};

const loadSection = async (
  key: string,
  opts: { take: number; preferredStore: any; isLocalRequest: boolean },
) => {
  const definition = SECTION_DEFINITIONS[key]!;
  const products = await fetchSectionProducts({
    where: { ...SECTION_BASE_WHERE, ...definition.where },
    orderBy: definition.orderBy,
    ...opts,
  });
  if (products.length || !definition.fallbackOrderBy) return products;
  return fetchSectionProducts({
    where: SECTION_BASE_WHERE,
    orderBy: definition.fallbackOrderBy,
    ...opts,
  });
};

// GET /get-homepage-sections — titled carousels for the home screen.
export const getHomepageSections = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const location = parseLocation(req);
    const isLocalRequest = Boolean(
      location.storeId || location.pincode || location.city,
    );
    const cacheKey = buildStorefrontCacheKey("home-sections", { ...location });
    const cached = await getCachedPayload<Record<string, unknown>>(cacheKey);
    if (cached) return res.status(200).json(cached);

    const preferredStore = isLocalRequest
      ? await resolvePreferredStore(location)
      : null;

    const SECTION_LIMIT = 10;
    const keys = Object.keys(SECTION_DEFINITIONS);
    const loaded = await Promise.all(
      keys.map((key) =>
        loadSection(key, {
          take: SECTION_LIMIT,
          preferredStore,
          isLocalRequest,
        }),
      ),
    );

    const sections = keys
      .map((key, index) => ({
        key,
        title: SECTION_DEFINITIONS[key]!.title,
        products: loaded[index]!,
      }))
      .filter((s) => s.products.length > 0);

    const payload = {
      success: true,
      sections,
      store: preferredStore
        ? {
            id: preferredStore.id,
            name: preferredStore.name,
            pincode: preferredStore.pincode,
            city: preferredStore.city,
          }
        : null,
      isServiceable: isLocalRequest ? Boolean(preferredStore) : true,
    };

    setCachedPayload(cacheKey, payload);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

// GET /get-section-products — the full list behind a carousel's "See all".
// Served as one generous page like the category listing: the catalog-root
// filter runs in JS after the query, so an offset would skip rows unevenly.
export const getSectionProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const key = String(req.query.key ?? "");
    const definition = SECTION_DEFINITIONS[key];
    if (!definition) {
      return res
        .status(400)
        .json({ success: false, message: `Unknown section "${key}"` });
    }

    const location = parseLocation(req);
    const isLocalRequest = Boolean(
      location.storeId || location.pincode || location.city,
    );
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const cacheKey = buildStorefrontCacheKey(`section:${key}:${limit}`, {
      ...location,
    });
    const cached = await getCachedPayload<Record<string, unknown>>(cacheKey);
    if (cached) return res.status(200).json(cached);

    const preferredStore = isLocalRequest
      ? await resolvePreferredStore(location)
      : null;

    const products = await loadSection(key, {
      take: limit,
      preferredStore,
      isLocalRequest,
    });

    const payload = {
      success: true,
      key,
      title: definition.title,
      products,
      isServiceable: isLocalRequest ? Boolean(preferredStore) : true,
    };

    setCachedPayload(cacheKey, payload);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

// ── Activity helpers ───────────────────────────────────────────────────────

const RECENT_VIEW_CAP = 20;
const RECENT_VIEW_TTL = 60 * 60 * 24 * 60; // 60 days

const getActivityIdentity = (req: Request) => {
  const userId = optionalUserId(req);
  const deviceId =
    (req.headers["x-device-id"] as string | undefined) ||
    (req.body && (req.body.deviceId as string)) ||
    (req.query.deviceId as string | undefined) ||
    null;
  return { userId, deviceId };
};

const recentlyViewedKey = (userId: string | null, deviceId: string | null) =>
  userId ? `recently_viewed:u:${userId}` : `recently_viewed:d:${deviceId}`;

// POST /track-view — records a product view (Redis recency + Mongo log).
export const trackProductView = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, source } = req.body || {};
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    const { userId, deviceId } = getActivityIdentity(req);
    if (!userId && !deviceId) {
      // Nothing to key the activity on — accept silently so the client never
      // sees an error for a fire-and-forget call.
      return res.status(200).json({ success: true });
    }

    const product = await prisma.products.findUnique({
      where: { id: String(productId) },
      select: {
        id: true,
        catalogProductId: true,
        category: true,
        subCategory: true,
      },
    });
    if (!product) return res.status(200).json({ success: true });

    const catalogProductId = product.catalogProductId ?? product.id;
    const key = recentlyViewedKey(userId, deviceId);
    const now = Date.now();

    // Redis recency (capped + TTL) — fire and forget.
    redis
      .zadd(key, now, catalogProductId)
      .then(() => redis.zremrangebyrank(key, 0, -(RECENT_VIEW_CAP + 1)))
      .then(() => redis.expire(key, RECENT_VIEW_TTL))
      .catch(() => {});

    // Durable event log for affinity / analytics — fire and forget.
    prisma.product_views
      .create({
        data: {
          userId: userId ?? null,
          deviceId: userId ? null : deviceId,
          productId: product.id,
          catalogProductId,
          category: product.category ?? null,
          subCategory: product.subCategory ?? null,
          source: typeof source === "string" ? source : null,
        },
      })
      .catch(() => {});

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// GET /recently-viewed — products the caller has recently opened.
export const getRecentlyViewed = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, deviceId } = getActivityIdentity(req);
    if (!userId && !deviceId) {
      return res.status(200).json({ success: true, products: [] });
    }

    const location = parseLocation(req);
    const isLocalRequest = Boolean(
      location.storeId || location.pincode || location.city,
    );

    const key = recentlyViewedKey(userId, deviceId);
    let ids: string[] = [];
    try {
      ids = await redis.zrevrange(key, 0, RECENT_VIEW_CAP - 1);
    } catch {
      ids = [];
    }

    // Redis cold (eviction / restart) → rebuild from the Mongo log.
    if (!ids.length) {
      const rows = await prisma.product_views.findMany({
        where: userId ? { userId } : { deviceId },
        orderBy: { createdAt: "desc" },
        take: 80,
        select: { catalogProductId: true },
      });
      const seen = new Set<string>();
      for (const r of rows) {
        if (r.catalogProductId && !seen.has(r.catalogProductId)) {
          seen.add(r.catalogProductId);
          if (seen.size >= RECENT_VIEW_CAP) break;
        }
      }
      ids = [...seen];
    }
    if (!ids.length) return res.status(200).json({ success: true, products: [] });

    const preferredStore = isLocalRequest
      ? await resolvePreferredStore(location)
      : null;

    const catalogs = await prisma.products.findMany({
      where: { id: { in: ids }, isDeleted: false },
      include: { images: true },
    });
    const byId = new Map<string, any>(
      catalogs.map((c: any) => [c.id as string, c] as [string, any]),
    );
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((c: any) => Boolean(c) && isCatalogRootProduct(c));

    const products = await buildMergedFromCatalogs(
      ordered,
      preferredStore,
      isLocalRequest,
    );
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return next(error);
  }
};

// GET /for-you — content-based recommendations from category affinity.
export const getForYou = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, deviceId } = getActivityIdentity(req);
    if (!userId && !deviceId) {
      return res.status(200).json({ success: true, products: [] });
    }

    const location = parseLocation(req);
    const isLocalRequest = Boolean(
      location.storeId || location.pincode || location.city,
    );

    const rows = await prisma.product_views.findMany({
      where: userId ? { userId } : { deviceId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { category: true, catalogProductId: true },
    });
    if (!rows.length) return res.status(200).json({ success: true, products: [] });

    // Rank categories by recency-weighted view count; collect viewed ids to
    // exclude so we recommend *new* things, not what they already saw.
    const catScore = new Map<string, number>();
    const viewedIds = new Set<string>();
    rows.forEach((r, idx) => {
      const weight = 1 / (1 + idx * 0.05); // mild recency decay
      if (r.category)
        catScore.set(r.category, (catScore.get(r.category) ?? 0) + weight);
      if (r.catalogProductId) viewedIds.add(r.catalogProductId);
    });
    const topCategories = [...catScore.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((e) => e[0]);
    if (!topCategories.length) {
      return res.status(200).json({ success: true, products: [] });
    }

    const preferredStore = isLocalRequest
      ? await resolvePreferredStore(location)
      : null;

    const candidatesRaw = await prisma.products.findMany({
      where: {
        adminId: { not: null },
        isDeleted: false,
        category: { in: topCategories },
        id: { notIn: [...viewedIds] },
      },
      include: { images: true },
      orderBy: [{ totalSold: "desc" as const }, { createdAt: "desc" as const }],
      take: 40,
    });
    const candidates = candidatesRaw.filter(isCatalogRootProduct).slice(0, 12);

    const products = await buildMergedFromCatalogs(
      candidates,
      preferredStore,
      isLocalRequest,
    );
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return next(error);
  }
};

// POST /merge-activity — fold a guest's deviceId history into the user on login.
export const mergeActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = optionalUserId(req);
    const deviceId =
      (req.headers["x-device-id"] as string | undefined) ||
      (req.body && (req.body.deviceId as string)) ||
      null;
    if (!userId || !deviceId) {
      return res.status(200).json({ success: true });
    }

    await prisma.product_views
      .updateMany({
        where: { deviceId, userId: null },
        data: { userId, deviceId: null },
      })
      .catch(() => {});

    try {
      const dKey = `recently_viewed:d:${deviceId}`;
      const uKey = `recently_viewed:u:${userId}`;
      const withScores = await redis.zrange(dKey, 0, -1, "WITHSCORES");
      for (let i = 0; i < withScores.length; i += 2) {
        await redis.zadd(uKey, Number(withScores[i + 1]), withScores[i] as string);
      }
      await redis.zremrangebyrank(uKey, 0, -(RECENT_VIEW_CAP + 1));
      await redis.expire(uKey, RECENT_VIEW_TTL);
      await redis.del(dKey);
    } catch {
      // Redis best-effort; the Mongo merge above is the source of truth.
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};
