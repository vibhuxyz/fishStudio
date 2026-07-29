import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { prismaPostgres } from "@repo/db-postgres";
import { NotFoundError } from "@repo/error-handlers";
import { isCatalogRootProduct, getRequiredParam } from "./utils.js";
import { computeBadges } from "./badges.js";
import {
  parseStorefrontLimit,
  parseStorefrontPage,
  buildStorefrontCacheKey,
  getCachedPayload,
  setCachedPayload,
  resolvePreferredStore,
  mergeCatalogWithVariant,
  pickBestVariantPerCatalog,
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
  };
}

interface StorefrontProductPayload {
  success: true;
  product: Record<string, unknown>;
  relatedProducts: Record<string, unknown>[];
  coupon: unknown;
  store: Record<string, unknown> | null;
}

type CouponLike = { id: string; maxUsesPerUser: number };

// Removes coupons a specific user has already used up to their per-user
// limit. Shared by getStoreProductBySlug (single product coupon) and
// getStorePublicOffers (store-wide offer list) — both need the same
// Postgres usage lookup, just against different candidate lists.
async function filterByPerUserUsage<T extends CouponLike>(
  codes: T[],
  userId: string,
): Promise<T[]> {
  try {
    const usages = await prismaPostgres.couponUsage.groupBy({
      by: ["couponId"],
      where: { userId, couponId: { in: codes.map((c) => c.id) } },
      _count: { couponId: true },
    });
    const usageMap = new Map<string, number>(
      usages.map((u) => [u.couponId, u._count.couponId]),
    );
    return codes.filter((c) => {
      const used = usageMap.get(c.id) ?? 0;
      return used < (c.maxUsesPerUser ?? 1);
    });
  } catch {
    // Non-fatal: if Postgres is unavailable, fall back to showing all eligible codes
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
      scope, page, limit,
      sortBy: normalizedSortBy,
      onSale: filterOnSale || undefined,
      hasVariants: filterHasVariants || undefined,
      minPrice, maxPrice,
    });
    const cached = await getCachedPayload<StorefrontListingPayload>(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

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

    const [total, catalogWindow] = await Promise.all([
      prisma.products.count({ where: catalogWhere }),
      prisma.products.findMany({
        where: catalogWhere,
        include: { images: true },
        orderBy: catalogOrderBy,
        skip,
        take: windowSize,
      }),
    ]);
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
          include: {
            images: true,
            store: {
              select: {
                id: true,
                name: true,
                pincode: true,
                city: true,
                seller: { include: { events: true } },
              },
            },
            favorites: { take: 1, select: { id: true } },
          },
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
        hasMore: skip + products.length < filteredTotal,
      },
    };

    setCachedPayload(cacheKey, payload);

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
          include: {
            images: true,
            store: { include: { seller: { include: { events: true } } } },
          },
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

    const discountIds = (product as any).discount_codes || [];
    const nowLocal = new Date();
    const userId = req.query.userId as string | undefined;

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

      // Filter out globally exhausted coupons
      let eligible = candidates.filter(
        (c) => c.maxUses === null || c.usedCount < c.maxUses,
      );

      // Filter out coupons this specific user has already fully used
      if (userId && eligible.length > 0) {
        eligible = await filterByPerUserUsage(eligible, userId);
      }

      coupon = eligible[0] ?? null;
    }

    (product as any).badges = computeBadges(product as any);
    for (const rp of relatedProducts as any[]) {
      rp.badges = computeBadges(rp);
    }

    const payload = {
      success: true,
      product,
      relatedProducts,
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
    const userId = req.query.userId as string | undefined;

    const [discountCodes, activeEvents] = await Promise.all([
      prisma.discount_codes.findMany({
        where: { sellerId: store.sellerId },
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

    // Filter: inactive, expired, or globally exhausted coupons are never shown
    let validCodes = discountCodes.filter((dc) => {
      if (!dc.isActive) return false;
      if (dc.expiresAt && new Date(dc.expiresAt) <= now) return false;
      if (dc.maxUses !== null && dc.usedCount >= dc.maxUses) return false;
      return true;
    });

    // If the caller is a logged-in user, additionally filter out coupons this
    // specific user has already used up to their per-user limit.
    if (userId && validCodes.length > 0) {
      validCodes = await filterByPerUserUsage(validCodes, userId);
    }

    return res
      .status(200)
      .json({ success: true, discountCodes: validCodes, activeEvents });
  } catch (error) {
    return next(error);
  }
};
