import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { prismaPostgres } from "@repo/db-postgres";
import { NotFoundError } from "@repo/error-handlers";
import { isCatalogRootProduct, getRequiredParam, type AuthRequest } from "./utils.js";
import { computeBadges } from "./badges.js";
import { fetchFrequentlyBoughtTogether } from "./co-purchase.js";
import { cached } from "@repo/libs/cache";
import { logger } from "@repo/libs/logger";
import { PLACED_ORDER_STATUSES } from "@repo/shared/pricing";
import {
  parseStorefrontLimit,
  parseStorefrontPage,
  buildStorefrontCacheKey,
  getCachedPayload,
  setCachedPayload,
  STOREFRONT_CACHE_TTL,
  resolvePreferredStore,
  mergeCatalogWithVariant,
  pickBestVariantPerCatalog,
  storefrontVariantSelect,
} from "./storefront.utils.js";

interface StorefrontListingPayload {
  success: true;
  products: Record<string, unknown>[];
  store: Record<string, unknown> | null;
  isServiceable: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
  // How many products sit under each subcategory of the requested category,
  // counted across the whole category rather than the returned page. Only
  // present when a category was asked for.
  subCategoryCounts?: Record<string, number>;
  // The same facet's grand total, including products with no subcategory —
  // what the sidebar's "All" row should read.
  categoryTotal?: number;
}

interface StorefrontProductPayload {
  success: true;
  product: Record<string, unknown>;
  relatedProducts: Record<string, unknown>[];
  frequentlyBoughtTogether: Record<string, unknown>[];
  coupon: unknown;
  store: Record<string, unknown> | null;
}

/** The fields coupon eligibility is decided from; a full discount_codes row satisfies it. */
interface CouponEligibilityFields {
  id: string;
  maxUses: number | null;
  maxUsesPerUser: number;
  isFirstOrder: boolean;
  sellerId: string | null;
}

interface CouponAudience {
  /** The signed-in shopper, or null when browsing anonymously. */
  userId: string | null;
  /** Which store the offers are being listed for; scopes the first-order check. */
  storeId: string | null;
}

/**
 * Narrows a candidate list to the coupons this shopper can actually redeem now.
 *
 * Three separate rules, all of which the checkout would enforce anyway — the
 * point of applying them here is that a coupon a shopper can never use should
 * not appear in their offer list at all:
 *
 *  - global cap: counted from Postgres CouponUsage, never from the Mongo
 *    `usedCount` mirror. That mirror is incremented best-effort after commit
 *    and never decremented, so it drifts; CouponUsage is what the order
 *    transaction actually writes and re-checks.
 *  - per-user cap: how many times this shopper has already redeemed it.
 *  - first order: a store's coupon means first order at that store; a
 *    platform-wide coupon (no seller) means first order anywhere.
 *
 * Anonymous shoppers skip the last two — there is no one to check them
 * against, and checkout will ask again once they log in.
 */
async function filterRedeemableCoupons<T extends CouponEligibilityFields>(
  codes: T[],
  { userId, storeId }: CouponAudience,
): Promise<T[]> {
  if (codes.length === 0) return codes;

  const couponIds = codes.map((c) => c.id);
  const needsGlobalCount = codes.some((c) => c.maxUses !== null);
  const needsFirstOrderCheck = userId !== null && codes.some((c) => c.isFirstOrder);

  try {
    const [globalUsages, userUsages, placedOrders] = await Promise.all([
      needsGlobalCount
        ? prismaPostgres.couponUsage.groupBy({
            by: ["couponId"],
            where: { couponId: { in: couponIds } },
            _count: { couponId: true },
          })
        : Promise.resolve([]),
      userId
        ? prismaPostgres.couponUsage.groupBy({
            by: ["couponId"],
            where: { userId, couponId: { in: couponIds } },
            _count: { couponId: true },
          })
        : Promise.resolve([]),
      needsFirstOrderCheck && userId
        ? prismaPostgres.order.groupBy({
            by: ["storeId"],
            where: { userId, status: { in: [...PLACED_ORDER_STATUSES] } },
            _count: { storeId: true },
          })
        : Promise.resolve([]),
    ]);

    const globalCount = new Map(globalUsages.map((u) => [u.couponId, u._count.couponId]));
    const userCount = new Map(userUsages.map((u) => [u.couponId, u._count.couponId]));

    // One groupBy answers both first-order questions: the total is the
    // platform-wide count, and this store's bucket is the store-level one.
    const platformOrderCount = placedOrders.reduce((sum, row) => sum + row._count.storeId, 0);
    const storeOrderCount = storeId
      ? (placedOrders.find((row) => row.storeId === storeId)?._count.storeId ?? 0)
      : 0;

    return codes.filter((c) => {
      if (c.maxUses !== null && (globalCount.get(c.id) ?? 0) >= c.maxUses) return false;
      if (userId && (userCount.get(c.id) ?? 0) >= c.maxUsesPerUser) return false;
      if (c.isFirstOrder && userId) {
        const priorOrders = c.sellerId === null ? platformOrderCount : storeOrderCount;
        if (priorOrders > 0) return false;
      }
      return true;
    });
  } catch (error) {
    // Non-fatal: Postgres being down must not empty the storefront's offer
    // strip. Checkout still enforces every one of these rules, so the worst
    // case is a shopper being told at apply time that a code is spent.
    logger.warn("Coupon eligibility filter fell back to unfiltered list", {
      storeId,
      couponIds,
      error,
    });
    return codes;
  }
}

export const getStoreProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, pincode, city, category, subCategory, scope, sortBy, onSale, hasVariants } = req.query;
    const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
    const normalizedSortBy = typeof sortBy === "string" && ["price_asc","price_desc","popular","newest"].includes(sortBy) ? sortBy : undefined;
    const filterOnSale = onSale === "true";
    const filterHasVariants = hasVariants === "true";
    const page = parseStorefrontPage(req.query.page, 1);
    const limit = parseStorefrontLimit(
      req.query.limit,
      scope === "homepage" ? 24 : 20,
    );
    const skip = (page - 1) * limit;
    // Cursor is the catalog product `id` of the last item returned on the previous
    // page. When present it replaces skip-based paging so deep pages don't drift
    // when items are inserted/removed ahead of them mid-scroll.
    const cursor =
      typeof req.query.cursor === "string" && req.query.cursor.trim()
        ? req.query.cursor.trim()
        : undefined;
    const isLocalRequest = Boolean(storeId || pincode || city);

    const normalizedCategory =
      typeof category === "string" && category.trim()
        ? category.trim()
        : undefined;
    const normalizedSubCategory =
      typeof subCategory === "string" && subCategory.trim()
        ? subCategory.trim()
        : undefined;

    const cacheKey = buildStorefrontCacheKey("products", {
      storeId, pincode, city,
      category: normalizedCategory,
      subCategory: normalizedSubCategory,
      scope, page, limit, cursor,
      sortBy: normalizedSortBy,
      onSale: filterOnSale || undefined,
      hasVariants: filterHasVariants || undefined,
      minPrice, maxPrice,
    });
    // Wrapped in `cached` rather than a bare get/miss/set: this is the busiest
    // query in the app, so when a hot key expires every concurrent request used
    // to run this whole block against Mongo at once. Now one caller refreshes
    // while the rest are served the previous value.
    const payload = await cached<StorefrontListingPayload>(cacheKey, async () => {
      // Resolve preferred store only on cache miss
      const preferredStore = isLocalRequest
        ? await resolvePreferredStore({
            storeId: storeId ? String(storeId) : undefined,
            pincode: pincode ? String(pincode) : undefined,
            city: city ? String(city) : undefined,
          })
        : null;

      const categoryFilter = normalizedCategory
        ? { category: normalizedCategory }
        : {};
      const subCategoryFilter = normalizedSubCategory
        ? { subCategory: normalizedSubCategory }
        : {};

      // ── Step 1: Paginate catalog products in the DB ──────────────────────────
      // Previously we loaded the ENTIRE catalog into memory and sliced at the
      // end. Now DB does the sort + pagination. We fetch a window larger than
      // `limit` so the in-memory in-stock priority sort has room to shuffle
      // in-stock items ahead of OOS within the page. Tradeoff: if the category
      // has extremely sparse in-stock products, later pages may still be needed
      // — acceptable given the performance win from removing the full scan.
      const isHomepage = typeof scope === "string" && scope === "homepage";
      // Match original semantics (adminId set, not deleted). Catalog-root check
       // (!storeId && !catalogProductId) stays in JS because Prisma/Mongo `null`
       // filters don't match missing fields — older docs may have these absent.
      const catalogWhere = {
        adminId: { not: null },
        isDeleted: false,
        ...categoryFilter,
        ...subCategoryFilter,
      };
      const catalogOrderBy = isHomepage
        ? [{ totalSold: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

      // Oversample so the JS catalog-root filter + in-stock priority sort
      // still return a full page even after dropping non-root entries.
      const windowSize = Math.min(Math.max(limit * 3, 60), limit + 80);

      // Counted over the category with the subcategory filter left off: a
      // sidebar built from the returned page would zero out every option the
      // moment one of them is selected, since the page then only contains that
      // one subcategory.
      const subCategoryCountsPromise = normalizedCategory
        ? prisma.products.groupBy({
            by: ["subCategory"],
            where: { adminId: { not: null }, isDeleted: false, ...categoryFilter },
            _count: { _all: true },
          })
        : Promise.resolve(null);

      const [total, catalogWindowRaw, subCategoryGroups] = await Promise.all([
        prisma.products.count({ where: catalogWhere }),
        cursor
          ? prisma.products.findMany({
              where: catalogWhere,
              include: { images: true },
              orderBy: catalogOrderBy,
              cursor: { id: cursor },
              skip: 1, // exclude the cursor row itself
              take: windowSize + 1, // +1 sentinel to detect a next window without a second query
            })
          : prisma.products.findMany({
              where: catalogWhere,
              include: { images: true },
              orderBy: catalogOrderBy,
              skip,
              take: windowSize,
            }),
        subCategoryCountsPromise,
      ]);

      const subCategoryCounts = subCategoryGroups
        ? Object.fromEntries(
            subCategoryGroups
              .filter((group) => Boolean(group.subCategory))
              .map((group) => [group.subCategory as string, group._count._all]),
          )
        : undefined;
      const categoryTotal = subCategoryGroups
        ? subCategoryGroups.reduce((sum, group) => sum + group._count._all, 0)
        : undefined;
      // Peel off the sentinel row before processing — it only exists to tell us
      // whether another window is available after this one.
      const hasNextWindow = cursor ? catalogWindowRaw.length > windowSize : false;
      const catalogWindow = cursor
        ? catalogWindowRaw.slice(0, windowSize)
        : catalogWindowRaw;
      const catalogProducts = catalogWindow.filter(isCatalogRootProduct);
      const catalogIds = catalogProducts.map((p: any) => p.id);

      // ── Step 2: Fetch best variant per catalog product (page-scoped) ─────────
      const variants = catalogIds.length
        ? await prisma.products.findMany({
            where: {
              catalogProductId: { in: catalogIds },
              status: "Active",
              isDeleted: false,
              ...(preferredStore ? { storeId: preferredStore.id } : {}),
            },
            select: { ...storefrontVariantSelect, favorites: { take: 1, select: { id: true } } },
          })
        : [];

      // Pick the best variant per catalog product:
      // prefer in-stock (stock > 0) first, then cheapest sale_price
      const bestVariantMap = pickBestVariantPerCatalog(variants);

      // ── Step 3: Merge + in-stock priority sort within the page window ───────
      const windowMerged = catalogProducts.map((catalog: any) =>
        mergeCatalogWithVariant(
          catalog,
          bestVariantMap.get(catalog.id),
          isLocalRequest ? preferredStore : null,
        ),
      );

      windowMerged.sort((a: any, b: any) => {
        const aIn = Boolean(a.inStock);
        const bIn = Boolean(b.inStock);
        if (aIn !== bIn) return aIn ? -1 : 1;
        // secondary sort: user-chosen sortBy
        const aPrice = (a.sale_price ?? a.regular_price ?? 0) as number;
        const bPrice = (b.sale_price ?? b.regular_price ?? 0) as number;
        if (normalizedSortBy === "price_asc") return aPrice - bPrice;
        if (normalizedSortBy === "price_desc") return bPrice - aPrice;
        if (normalizedSortBy === "popular" || isHomepage) return (b.totalSold ?? 0) - (a.totalSold ?? 0);
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      });

      // ── Post-merge filters (price / offer / variant) ──────────────────────────
      let filtered = windowMerged as any[];
      if (filterOnSale) {
        filtered = filtered.filter((p) => p.sale_price != null && Number(p.sale_price) < Number(p.regular_price ?? p.sale_price + 1));
      }
      if (minPrice !== undefined && !Number.isNaN(minPrice)) {
        filtered = filtered.filter((p) => (p.sale_price ?? p.regular_price ?? 0) >= minPrice);
      }
      if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
        filtered = filtered.filter((p) => (p.sale_price ?? p.regular_price ?? 0) <= maxPrice);
      }
      if (filterHasVariants) {
        filtered = filtered.filter((p) =>
          (Array.isArray(p.sizePricing) && p.sizePricing.length > 0) ||
          (Array.isArray(p.cuttingTypePricing) && p.cuttingTypePricing.length > 0) ||
          (Array.isArray(p.pieceSizePricing) && p.pieceSizePricing.length > 0),
        );
      }
      const products = filtered.slice(0, limit);
      const filteredTotal = filterOnSale || filterHasVariants || minPrice !== undefined || maxPrice !== undefined
        ? filtered.length  // approximate post-filter count for filtered requests
        : total;
      const hasMore = cursor
        ? filtered.length > limit || hasNextWindow
        : skip + products.length < filteredTotal;
      const nextCursor =
        hasMore && products.length > 0
          ? ((products[products.length - 1] as any).catalogProductId as string)
          : null;

      // Ensure stock is 0 for OOS entries so the frontend renders them correctly
      for (const p of products as any[]) {
        if (!p.inStock) p.stock = 0;
        p.badges = computeBadges(p);
      }

      const payload: StorefrontListingPayload = {
        success: true,
        products: products as Record<string, unknown>[],
        store: preferredStore
          ? {
              id: preferredStore.id,
              name: preferredStore.name,
              pincode: preferredStore.pincode,
              city: preferredStore.city,
            }
          : null,
        isServiceable: isLocalRequest ? Boolean(preferredStore) : true,
        pagination: {
          page,
          limit,
          total: filteredTotal,
          hasMore,
          nextCursor,
        },
        ...(subCategoryCounts ? { subCategoryCounts, categoryTotal } : {}),
      };

      return payload;
    }, { ttlSeconds: STOREFRONT_CACHE_TTL });

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const getStoreProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = getRequiredParam(req.params.slug, "Product slug");

    // Build cache key from input params only — no DB query needed
    const cacheKey = buildStorefrontCacheKey("product", {
      slug,
      storeId: req.query.storeId,
      pincode: req.query.pincode,
      city: req.query.city,
    });
    const cached = await getCachedPayload<StorefrontProductPayload>(cacheKey);

    if (cached) {
      return res.status(200).json(cached);
    }

    // Resolve store + slug lookup in parallel on cache miss
    const [preferredStore, slugMatch] = await Promise.all([
      resolvePreferredStore({
        storeId: req.query.storeId ? String(req.query.storeId) : undefined,
        pincode: req.query.pincode ? String(req.query.pincode) : undefined,
        city: req.query.city ? String(req.query.city) : undefined,
      }),
      prisma.products.findFirst({
        where: { slug, isDeleted: false, status: "Active" },
        include: {
          images: true,
          catalogProduct: { include: { images: true } },
          store: { include: { seller: { include: { events: true } } } },
        },
      }),
    ]);

    if (!slugMatch) return next(new NotFoundError("Product not found!"));

    const catalogProduct = isCatalogRootProduct(slugMatch)
      ? slugMatch
      : slugMatch.catalogProduct;

    if (!catalogProduct)
      return next(new NotFoundError("Catalog product not found!"));

    const resolvedVariant = preferredStore
      ? await prisma.products.findFirst({
          where: {
            catalogProductId: catalogProduct.id,
            storeId: preferredStore.id,
            status: "Active",
            isDeleted: false,
          },
          include: {
            images: true,
            store: { include: { seller: { include: { events: true } } } },
          },
        })
      : !isCatalogRootProduct(slugMatch) && slugMatch.catalogProductId
        ? slugMatch
        : await prisma.products.findFirst({
            where: {
              catalogProductId: catalogProduct.id,
              status: "Active",
              isDeleted: false,
            },
            orderBy: { sale_price: "asc" },
            include: {
              images: true,
              store: { include: { seller: { include: { events: true } } } },
            },
          });

    const product = mergeCatalogWithVariant(
      catalogProduct,
      resolvedVariant,
      preferredStore,
    );

    // Started here rather than awaited inline below: it hits Postgres and Mongo
    // and shares nothing with the related-products chain, so the two overlap.
    const frequentlyBoughtTogetherPromise = fetchFrequentlyBoughtTogether(
      catalogProduct.id,
      preferredStore,
    );

    const relatedCatalogsRaw = await prisma.products.findMany({
      where: {
        adminId: { not: null },
        category: catalogProduct.category,
        isDeleted: false,
        status: "Active",
        NOT: { id: catalogProduct.id },
      },
      take: 8,
      include: {
        images: true,
        catalogProduct: { select: { slug: true } },
      },
    });
    const relatedCatalogs = relatedCatalogsRaw
      .filter(isCatalogRootProduct)
      .slice(0, 4);
    const relatedCatalogIds = relatedCatalogs.map((item) => item.id);

    const relatedVariants = relatedCatalogIds.length
      ? await prisma.products.findMany({
          where: {
            catalogProductId: { in: relatedCatalogIds },
            status: "Active",
            isDeleted: false,
            ...(preferredStore ? { storeId: preferredStore.id } : {}),
          },
          select: storefrontVariantSelect,
          orderBy: { sale_price: "asc" },
        })
      : [];
    const relatedVariantMap = new Map<string, any>();
    relatedVariants.forEach((variant) => {
      const existing = relatedVariantMap.get(variant.catalogProductId!);
      if (!existing || (variant.sale_price ?? 0) < (existing.sale_price ?? 0)) {
        relatedVariantMap.set(variant.catalogProductId!, variant);
      }
    });

    const relatedProducts = relatedCatalogs.map((catalog) =>
      mergeCatalogWithVariant(
        catalog,
        relatedVariantMap.get(catalog.id),
        preferredStore,
      ),
    );

    // Observed co-purchases, which is a different question from the
    // same-category list above and routinely returns nothing — the block is
    // hidden until enough delivered orders back it.
    const frequentlyBoughtTogether = await frequentlyBoughtTogetherPromise;

    const discountIds = (product as any).discount_codes || [];
    const nowLocal = new Date();

    let coupon: any = null;
    if (discountIds.length > 0) {
      const candidates = await prisma.discount_codes.findMany({
        where: {
          id: { in: discountIds },
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: nowLocal } }],
        },
        orderBy: { createdAt: "desc" },
      });

      // Store-wide rules only. This response is cached under a key with no
      // shopper in it (see cacheKey above), so filtering by who is asking
      // would serve one shopper's answer to everybody. Per-user limits and
      // first-order eligibility are applied by the offer sheet and enforced
      // again at checkout — both of which are per-request.
      const eligible = await filterRedeemableCoupons(candidates, {
        userId: null,
        storeId: preferredStore?.id ?? null,
      });

      coupon = eligible[0] ?? null;
    }

    (product as any).badges = computeBadges(product as any);
    for (const rp of relatedProducts as any[]) {
      rp.badges = computeBadges(rp);
    }
    for (const fbt of frequentlyBoughtTogether as any[]) {
      fbt.badges = computeBadges(fbt);
    }

    const payload = {
      success: true,
      product,
      relatedProducts,
      frequentlyBoughtTogether,
      coupon,
      store: preferredStore,
    };

    setCachedPayload(cacheKey, payload);

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const getStorePublicOffers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = req.params.storeId as string;
    if (!storeId)
      return res
        .status(400)
        .json({ success: false, message: "storeId required" });
    const store = await prisma.stores.findUnique({
      where: { id: storeId },
      select: { sellerId: true },
    });
    if (!store)
      return res.status(200).json({ success: true, coupons: [], events: [] });
    const now = new Date();
    // From the session, never `req.query.userId` — that let anyone list a
    // stranger's personally-issued reward codes by guessing their id.
    const userId = (req as AuthRequest).user?.id ?? null;

    const [discountCodes, activeEvents] = await Promise.all([
      prisma.discount_codes.findMany({
        // This store's own coupons, plus any platform-wide one (no seller of
        // its own). Admin-created coupons normally carry the sellerId the
        // admin picked at creation, so they land in the first branch.
        where: {
          isActive: true,
          OR: [{ sellerId: store.sellerId }, { sellerId: null }],
          AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.seller_events.findMany({
        where: {
          sellerId: store.sellerId,
          isActive: true,
          startTime: { lte: now },
          endTime: { gte: now },
        },
        orderBy: { startTime: "desc" },
      }),
    ]);

    // Personally-issued coupons (referral rewards, etc.) are hidden from
    // everyone except the account they were generated for. Active/expiry are
    // already handled by the query above; the caps and first-order rules run
    // against the signed-in shopper below.
    const ownCodes = discountCodes.filter(
      (dc) => !dc.restrictedToUserId || dc.restrictedToUserId === userId,
    );

    const validCodes = await filterRedeemableCoupons(ownCodes, { userId, storeId });

    return res
      .status(200)
      .json({ success: true, discountCodes: validCodes, activeEvents });
  } catch (error) {
    return next(error);
  }
};
