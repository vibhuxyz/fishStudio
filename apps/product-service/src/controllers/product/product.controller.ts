import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { prismaPostgres } from "@repo/db-postgres";
import { publishToQueue, redis } from "@repo/libs";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import {
  indexProduct,
  updateIndexedProduct,
  removeIndexedProduct,
  reindexCatalogVariants,
} from "../../lib/meilisearch.js";
import {
  productSchema,
  updateProductSchema,
  slugSchema,
  addCatalogProductToStoreSchema,
  updateProductStockSchema,
  validateCartSchema,
  validate,
} from "@repo/zod-schema";

import {
  AuthRequest,
  getOwnedProductFilter,
  getSellerStore,
  isCatalogRootProduct,
  normalizeDynamicValues,
  normalizeSizePricing,
  getDisplayPricesFromSizePricing,
  normalizeCuttingTypePricing,
  normalizePieceSizePricing,
  getRequiredParam,
  buildUniqueSlug,
  NormalizedSizePricing,
} from "./utils.js";

export const slugValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { slug } = validate(slugSchema, req.body);
    slug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.products.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return res.status(200).json({
      available: uniqueSlug === slug,
      slug: uniqueSlug,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Helper to invalidate search and suggestion cache.
 * Uses SCAN to find all keys matching 'search:*' and 'suggest:*'
 * and deletes them to ensure fresh data after product updates.
 */
async function invalidateSearchCache() {
  try {
    const stream = (redis as any).scanStream({ match: "search:*" });
    stream.on("data", (keys: string[]) => {
      if (keys.length) redis.del(...keys);
    });

    const suggestStream = (redis as any).scanStream({ match: "suggest:*" });
    suggestStream.on("data", (keys: string[]) => {
      if (keys.length) redis.del(...keys);
    });
  } catch (error) {
    console.error("[Cache Invalidation Error]", error);
  }
}

type StoreLocationInput = {
  storeId?: string;
  pincode?: string;
  city?: string;
};

const normalizeLocationValue = (value?: string | null) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const buildStoreLocationWhere = ({
  storeId,
  pincode,
  city,
}: StoreLocationInput) => {
  const filters: Record<string, unknown>[] = [];

  if (storeId) {
    filters.push({ id: String(storeId) });
  }
  if (pincode) {
    filters.push({ pincode: String(pincode) });
    filters.push({ availableCities: { has: String(pincode) } });
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
  },
  location: StoreLocationInput,
) => {
  const normalizedPincode = normalizeLocationValue(location.pincode);
  const normalizedCity = normalizeLocationValue(location.city);
  const normalizedStoreCity = normalizeLocationValue(store.city);
  const normalizedAvailableCities = Array.isArray(store.availableCities)
    ? store.availableCities.map(normalizeLocationValue)
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
    normalizedAvailableCities.includes(normalizedPincode)
  ) {
    return 700;
  }
  if (normalizedCity && normalizedAvailableCities.includes(normalizedCity)) {
    return 600;
  }

  return 0;
};

const resolvePreferredStore = async (location: StoreLocationInput) => {
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

const mergeCatalogWithVariant = (
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
    storeId: variant.storeId,
    inStock: (variant.stock ?? 0) > 0,
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

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "admin" || !req.admin?.id) {
      return next(
        new ValidationError("Only admin can create catalog products!"),
      );
    }
    const {
      title,
      short_description,
      sizes,
      cuttingTypes,
      pieceSizes,
      processingWeightLoss,
      slug,
      tags = [],
      category,
      subCategory,
      images,
    } = validate(productSchema, req.body);

    const cash_on_delivery = req.body.cash_on_delivery;

    const slugChecking = await prisma.products.findUnique({ where: { slug } });
    if (slugChecking) {
      return next(
        new ValidationError(
          "Slug already exists! Please use a different slug!",
        ),
      );
    }

    const normalizedSizes = sizes ? normalizeDynamicValues(sizes) : [];
    const normalizedPieceSizes = pieceSizes
      ? normalizeDynamicValues(pieceSizes)
      : [];
    const normalizedCuttingTypes = cuttingTypes
      ? normalizeDynamicValues(cuttingTypes)
      : [];
    const catalogRootData = {
      isCatalog: true,
      stock: 0,
      sale_price: 0,
      regular_price: 0,
    } as const;

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        category,
        subCategory,
        sizes: normalizedSizes,
        sizePricing: null,
        pieceSizes: normalizedPieceSizes,
        cuttingTypes: normalizedCuttingTypes,
        ...(processingWeightLoss && { processingWeightLoss }),
        cashOnDelivery: cash_on_delivery || "yes",
        slug,
        ...catalogRootData,
        admin: { connect: { id: req.admin.id } },
        isDeleted: false,
        tags: tags as string[],
        discount_codes: [],
        images: {
          create: Array.from(
            new Map(images.map((img: any) => [img.file_id, img])).values(),
          ).map((img: any) => ({
            file_id: img.file_id,
            url: img.url,
            type: "PRODUCT",
          })),
        },
      },
      include: {
        images: true,
        catalogProduct: { include: { images: true } },
      },
    });

    indexProduct(newProduct as any);
    invalidateSearchCache();
    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      newProduct,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const getCatalogProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerStoreId = req.role === "seller" ? req.seller?.store?.id : null;
    const [adminProducts, sellerProducts] = await Promise.all([
      prisma.products.findMany({
        where: { adminId: { not: null }, isDeleted: false },
        include: { images: true },
        orderBy: { createdAt: "desc" },
      }),
      sellerStoreId
        ? prisma.products.findMany({
            where: { storeId: sellerStoreId, catalogProductId: { not: null } },
            select: { id: true, catalogProductId: true },
          })
        : Promise.resolve([]),
    ]);
    const catalogProducts = adminProducts.filter(isCatalogRootProduct);
    const sellerProductMap = new Map(
      sellerProducts.map((p) => [p.catalogProductId, p.id]),
    );
    return res.status(200).json({
      success: true,
      products: catalogProducts.map((p) => ({
        ...p,
        alreadyAdded: sellerProductMap.has(p.id),
        sellerProductId: sellerProductMap.get(p.id) ?? null,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const addCatalogProductToStore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const catalogProductId = getRequiredParam(
      req.params.catalogProductId,
      "Catalog product id",
    );
    const sellerStore = getSellerStore(req);
    const catalogProductCandidate = await prisma.products.findFirst({
      where: { id: catalogProductId, adminId: { not: null }, isDeleted: false },
      include: { images: true },
    });

    if (
      !catalogProductCandidate ||
      !isCatalogRootProduct(catalogProductCandidate)
    ) {
      return next(new NotFoundError("Catalog product not found!"));
    }

    const catalogProduct = catalogProductCandidate;
    const existingStoreProduct = await prisma.products.findFirst({
      where: { storeId: sellerStore.id, catalogProductId },
    });

    if (existingStoreProduct) {
      return next(
        new ValidationError(
          "This product is already added to the seller store!",
        ),
      );
    }

    const {
      regular_price,
      sale_price,
      sizePricing,
      stock,
      cash_on_delivery,
      discountCodes,
      short_description,
      tags,
      status,
      processingWeightLoss,
    } = validate(addCatalogProductToStoreSchema, req.body);

    if (!catalogProduct.slug) {
      return;
    }

    const uniqueSlug = await buildUniqueSlug(
      catalogProduct.slug,
      sellerStore.id.slice(-6),
    );
    const hasSizes =
      Array.isArray(catalogProduct.sizes) && catalogProduct.sizes.length > 0;

    let normalizedSizePricing: NormalizedSizePricing[] = [];
    let displayPrices: { salePrice: number; regularPrice: number };

    if (hasSizes) {
      normalizedSizePricing = normalizeSizePricing(
        sizePricing,
        catalogProduct.sizes as string[],
        Number(sale_price ?? 0),
        Number(regular_price ?? sale_price ?? 0),
      );
      displayPrices = getDisplayPricesFromSizePricing(normalizedSizePricing);
    } else {
      displayPrices = {
        salePrice: Number(sale_price ?? 0),
        regularPrice: Number(regular_price ?? sale_price ?? 0),
      };
    }

    const storeProduct = await prisma.products.create({
      data: {
        title: catalogProduct.title,
        slug: uniqueSlug,
        category: catalogProduct.category,
        subCategory: catalogProduct.subCategory,
        short_description:
          typeof short_description === "string" && short_description.trim()
            ? short_description
            : catalogProduct.short_description,
        tags:
          typeof tags === "string"
            ? tags
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean)
            : Array.isArray(tags)
              ? tags
              : catalogProduct.tags,
        sizes: catalogProduct.sizes,
        sizePricing:
          normalizedSizePricing.length > 0 ? normalizedSizePricing : undefined,
        cuttingTypes: catalogProduct.cuttingTypes,
        pieceSizes: catalogProduct.pieceSizes,
        processingWeightLoss:
          typeof processingWeightLoss === "string" &&
          processingWeightLoss.trim()
            ? processingWeightLoss
            : catalogProduct.processingWeightLoss,
        stock: Number(stock ?? 0),
        sale_price: displayPrices.salePrice,
        regular_price: displayPrices.regularPrice,
        cashOnDelivery:
          typeof cash_on_delivery === "string"
            ? cash_on_delivery
            : catalogProduct.cashOnDelivery,
        discount_codes: Array.isArray(discountCodes) ? discountCodes : [],
        status: status === "NonActive" ? "NonActive" : "Active",
        store: { connect: { id: sellerStore.id } },
        catalogProduct: { connect: { id: catalogProduct.id } },
        // Do not copy images - use catalog product reference in UI
      },
      include: { images: true },
    });

    indexProduct(storeProduct as any);
    invalidateSearchCache();
    return res.status(201).json({
      success: true,
      message: "Product added to seller store successfully!",
      product: storeProduct,
    });
  } catch (error) {
    return next(error);
  }
};

export const getStoreProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, pincode, city } = req.query;
    const isLocalRequest = Boolean(storeId || pincode || city);
    const preferredStore = isLocalRequest
      ? await resolvePreferredStore({
          storeId: storeId ? String(storeId) : undefined,
          pincode: pincode ? String(pincode) : undefined,
          city: city ? String(city) : undefined,
        })
      : null;

    const adminProducts = await prisma.products.findMany({
      where: { adminId: { not: null }, isDeleted: false },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });
    const catalogProducts = adminProducts.filter(isCatalogRootProduct);

    const variants = await prisma.products.findMany({
      where: {
        catalogProductId: { not: null },
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
      },
    });

    const bestVariantMap = new Map<string, any>();
    variants.forEach((v) => {
      const catalogId = v.catalogProductId!;
      const existing = bestVariantMap.get(catalogId);
      if (!existing || (v.sale_price ?? 0) < (existing.sale_price ?? 0)) {
        bestVariantMap.set(catalogId, v);
      }
    });

    const mergedProducts = catalogProducts.map((catalog) =>
      mergeCatalogWithVariant(
        catalog,
        bestVariantMap.get(catalog.id),
        isLocalRequest ? preferredStore : null,
      ),
    );

    return res.status(200).json({
      success: true,
      products: mergedProducts,
      store: preferredStore,
      isServiceable: isLocalRequest ? Boolean(preferredStore) : true,
    });
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
    const preferredStore = await resolvePreferredStore({
      storeId: req.query.storeId ? String(req.query.storeId) : undefined,
      pincode: req.query.pincode ? String(req.query.pincode) : undefined,
      city: req.query.city ? String(req.query.city) : undefined,
    });

    const slugMatch = await prisma.products.findFirst({
      where: { slug, isDeleted: false, status: "Active" },
      include: {
        images: true,
        catalogProduct: { include: { images: true } },
        store: { include: { seller: { include: { events: true } } } },
      },
    });

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
        try {
          const usages = await prismaPostgres.couponUsage.groupBy({
            by: ["couponId"],
            where: { userId, couponId: { in: eligible.map((c) => c.id) } },
            _count: { couponId: true },
          });
          const usageMap = new Map(usages.map((u) => [u.couponId, u._count.couponId]));
          eligible = eligible.filter((c) => {
            const used = usageMap.get(c.id) ?? 0;
            return used < (c.maxUsesPerUser ?? 1);
          });
        } catch {
          // Non-fatal
        }
      }

      coupon = eligible[0] ?? null;
    }

    return res.status(200).json({
      success: true,
      product,
      relatedProducts,
      coupon,
      store: preferredStore,
    });
  } catch (error) {
    return next(error);
  }
};

export const getOwnedProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 20),
    );
    const skip = (page - 1) * limit;
    const filter = getOwnedProductFilter(req);

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filter,
        include: {
          images: true,
          store: { select: { id: true, name: true, sellerId: true } },
          catalogProduct: { include: { images: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.products.count({ where: filter }),
    ]);

    const sellerIds = [
      ...new Set(
        products.map((p) => p.store?.sellerId).filter(Boolean) as string[],
      ),
    ];
    const now = new Date();
    const activeEvents =
      sellerIds.length > 0
        ? await prisma.seller_events.findMany({
            where: {
              sellerId: { in: sellerIds },
              startTime: { lte: now },
              endTime: { gte: now },
              isActive: true,
            },
          })
        : [];

    const eventsBySellerId = new Map<string, typeof activeEvents>();
    for (const event of activeEvents) {
      const list = eventsBySellerId.get(event.sellerId) ?? [];
      list.push(event);
      eventsBySellerId.set(event.sellerId, list);
    }

    const productsWithEvents = products.map((p) => {
      const { catalogProduct, ...rest } = p as any;
      return {
        ...rest,
        // Fall back to catalog product images when the store product has none
        images: rest.images.length > 0 ? rest.images : (catalogProduct?.images ?? []),
        activeEvents: p.store?.sellerId
          ? (eventsBySellerId.get(p.store.sellerId) ?? [])
          : [],
      };
    });

    return res.status(200).json({
      success: true,
      products: productsWithEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getOwnedProductById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = getRequiredParam(req.params.productId, "Product id");
    const ownerFilter = getOwnedProductFilter(req);
    const product = await prisma.products.findFirst({
      where: { id: productId, ...ownerFilter },
      include: {
        images: true,
        catalogProduct: { include: { images: true } },
        store: { select: { id: true, name: true, sellerId: true } },
      },
    });
    if (!product) return next(new NotFoundError("Product not found!"));
    const sellerId = product.store?.sellerId;
    const now = new Date();
    const activeEvents = sellerId
      ? await prisma.seller_events.findMany({
          where: {
            sellerId,
            startTime: { lte: now },
            endTime: { gte: now },
            isActive: true,
          },
        })
      : [];

    // Fall back to catalog product images when the store product has none
    const images =
      product.images.length > 0
        ? product.images
        : ((product as any).catalogProduct?.images ?? []);

    return res
      .status(200)
      .json({ success: true, product: { ...product, images, activeEvents } });
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = getRequiredParam(req.params.productId, "Product id");
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        storeId: true,
        adminId: true,
        sizes: true,
        cuttingTypes: true,
        pieceSizes: true,
      },
    });

    if (!product) return next(new NotFoundError("Product not found!"));
    const ownerFilter = getOwnedProductFilter(req);
    const hasAccess =
      ("storeId" in ownerFilter && product.storeId === ownerFilter.storeId) ||
      ("adminId" in ownerFilter && product.adminId === ownerFilter.adminId);

    if (!hasAccess)
      return next(
        new ValidationError("You are not authorized to update this product!"),
      );

    const validated = validate(updateProductSchema, req.body);
    const {
      title,
      short_description,
      tags,
      category,
      subCategory,
      stock,
      sale_price,
      regular_price,
      sizePricing,
      cuttingTypePricing,
      pieceSizePricing,
      slug,
      sizes,
      pieceSizes,
      cuttingTypes,
      discountCodes,
      cash_on_delivery,
      processingWeightLoss,
      status,
      images,
    } = validated;

    let resolvedSlug: string | null = null;
    if (slug) {
      const slugChecking = await prisma.products.findFirst({
        where: { slug, NOT: { id: productId } },
      });
      if (slugChecking) {
        if (req.role === "seller" && req.seller?.store?.id) {
          resolvedSlug = await buildUniqueSlug(
            slug,
            req.seller.store.id.slice(-6),
            productId,
          );
        } else {
          return next(
            new ValidationError(
              "Slug already exists! Please use a different slug!",
            ),
          );
        }
      } else {
        resolvedSlug = slug;
      }
    }

    const updateData: Record<string, any> = {};
    if (typeof title === "string" && title.trim()) updateData.title = title;
    if (typeof short_description === "string" && short_description.trim())
      updateData.short_description = short_description;
    if (typeof category === "string" && category.trim())
      updateData.category = category;
    if (typeof subCategory === "string" && subCategory.trim())
      updateData.subCategory = subCategory;
    if (typeof resolvedSlug === "string" && resolvedSlug.trim())
      updateData.slug = resolvedSlug;
    if (typeof processingWeightLoss === "string")
      updateData.processingWeightLoss = processingWeightLoss;
    if (Array.isArray(tags)) updateData.tags = tags;
    if (typeof status === "string" && ["Active", "NonActive"].includes(status))
      updateData.status = status;

    if (req.role === "seller") {
      if (typeof stock !== "undefined") updateData.stock = Number(stock);
      if (typeof cash_on_delivery === "string")
        updateData.cashOnDelivery = cash_on_delivery;
      if (typeof discountCodes !== "undefined")
        updateData.discount_codes = Array.isArray(discountCodes)
          ? discountCodes
          : [];
    }

    const normalizedSizes = normalizeDynamicValues(sizes);
    const normalizedPieceSizes = normalizeDynamicValues(pieceSizes);
    const normalizedCuttingTypes = normalizeDynamicValues(cuttingTypes);

    if (typeof sizes !== "undefined") updateData.sizes = normalizedSizes;
    if (typeof pieceSizes !== "undefined")
      updateData.pieceSizes = normalizedPieceSizes;
    if (typeof cuttingTypes !== "undefined")
      updateData.cuttingTypes = normalizedCuttingTypes;

    if (req.role === "seller") {
      const effectiveSizes =
        normalizedSizes.length > 0
          ? normalizedSizes
          : Array.isArray(product.sizes)
            ? product.sizes
            : [];
      if (Array.isArray(sizePricing) && effectiveSizes.length > 0) {
        const nSizePricing = normalizeSizePricing(
          sizePricing,
          effectiveSizes as string[],
          Number(sale_price ?? 0),
          Number(regular_price ?? sale_price ?? 0),
        );
        const dPrices = getDisplayPricesFromSizePricing(nSizePricing);
        updateData.sizePricing = nSizePricing;
        updateData.sale_price = dPrices.salePrice;
        updateData.regular_price = dPrices.regularPrice;
      } else {
        if (typeof sale_price !== "undefined")
          updateData.sale_price = Number(sale_price);
        if (typeof regular_price !== "undefined")
          updateData.regular_price = Number(regular_price);
      }

      if (Array.isArray(cuttingTypePricing)) {
        const effectiveCuttingTypes =
          normalizedCuttingTypes.length > 0
            ? normalizedCuttingTypes
            : Array.isArray(product.cuttingTypes)
              ? product.cuttingTypes
              : [];
        updateData.cuttingTypePricing = normalizeCuttingTypePricing(
          cuttingTypePricing,
          effectiveCuttingTypes as string[],
        );
      }
      if (Array.isArray(pieceSizePricing)) {
        const effectivePieceSizes =
          normalizedPieceSizes.length > 0
            ? normalizedPieceSizes
            : Array.isArray(product.pieceSizes)
              ? product.pieceSizes
              : [];
        updateData.pieceSizePricing = normalizePieceSizePricing(
          pieceSizePricing,
          effectivePieceSizes as string[],
        );
      }
    }

    if (Array.isArray(images)) {
      const uniqueImages = Array.from(
        new Map(images.map((img: any) => [img.file_id, img])).values(),
      );
      updateData.images = {
        deleteMany: {},
        create: uniqueImages.map((img: any) => ({
          file_id: img.file_id,
          url: img.url,
          type: "PRODUCT",
        })),
      };
    }

    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: updateData,
      include: {
        images: true,
        catalogProduct: { include: { images: true } },
      },
    });
    updateIndexedProduct(updatedProduct as any);

    // If a catalog product (template) is updated, we must re-index all its adopted variants
    // across different stores to ensure search results reflect the new data/images.
    if (product.adminId) {
      reindexCatalogVariants(productId);
    }

    invalidateSearchCache();

    // Broadcast real-time stock update when a seller changes the stock level
    if (req.role === "seller" && typeof updateData.stock !== "undefined") {
      try {
        // Include catalogProductId so user-ui can match both variant and catalog products
        const fullProduct = await prisma.products.findUnique({
          where: { id: productId },
          select: { id: true, stock: true, catalogProductId: true },
        });
        await publishToQueue("ORDER_EVENTS", {
          type: "STOCK_UPDATE",
          productId: updatedProduct.id,
          catalogProductId: fullProduct?.catalogProductId || null,
          stock: updatedProduct.stock,
          message: `Stock for product ${updatedProduct.id} updated to ${updatedProduct.stock}`,
        });
      } catch (publishError) {
        console.error(
          "[updateProduct] Failed to publish stock update:",
          publishError,
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role === "seller")
      return next(
        new ValidationError(
          "Sellers cannot delete products. Use Active/NonActive status instead.",
        ),
      );
    const productId = getRequiredParam(req.params.productId, "Product id");
    const ownerFilter = getOwnedProductFilter(req);
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, storeId: true, adminId: true, isDeleted: true },
    });
    if (!product) return next(new NotFoundError("Product not found!"));

    const hasAccess =
      ("storeId" in ownerFilter && product.storeId === ownerFilter.storeId) ||
      ("adminId" in ownerFilter && product.adminId === ownerFilter.adminId);
    if (!hasAccess)
      return next(
        new ValidationError("You are not authorized to delete this product!"),
      );
    if (product.isDeleted)
      return next(new ValidationError("Product is already in delete state!"));

    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    removeIndexedProduct(productId);
    invalidateSearchCache();
    return res.status(200).json({
      message:
        "Product is scheduled for deletion in 24 hours.You can restore it within this time.",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = getRequiredParam(req.params.productId, "Product id");
    const ownerFilter = getOwnedProductFilter(req);
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, storeId: true, adminId: true, isDeleted: true },
    });
    if (!product) return next(new NotFoundError("Product not found!"));

    const hasAccess =
      ("storeId" in ownerFilter && product.storeId === ownerFilter.storeId) ||
      ("adminId" in ownerFilter && product.adminId === ownerFilter.adminId);
    if (!hasAccess)
      return next(
        new ValidationError("You are not authorized to restore this product!"),
      );
    if (!product.isDeleted)
      return res
        .status(400)
        .json({ message: "Product is not in deleted state!" });

    const restoredProduct = await prisma.products.update({
      where: { id: productId },
      data: { isDeleted: false, deletedAt: null },
    });
    return res.status(200).json({
      message: "Product is restored successfully!",
      restoreProduct: restoredProduct,
    });
  } catch (error) {
    return res.status(500).json({ message: "Eror restoring product", error });
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
      try {
        const usages = await prismaPostgres.couponUsage.groupBy({
          by: ["couponId"],
          where: {
            userId,
            couponId: { in: validCodes.map((c) => c.id) },
          },
          _count: { couponId: true },
        });
        const usageMap = new Map(usages.map((u) => [u.couponId, u._count.couponId]));
        validCodes = validCodes.filter((dc) => {
          const used = usageMap.get(dc.id) ?? 0;
          return used < (dc.maxUsesPerUser ?? 1);
        });
      } catch {
        // Non-fatal: if Postgres is unavailable, fall back to showing all valid codes
      }
    }

    return res.status(200).json({ success: true, discountCodes: validCodes, activeEvents });
  } catch (error) {
    return next(error);
  }
};

export const validateCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cartItems, pincode, city, storeId } = validate(
      validateCartSchema,
      req.body,
    ) as any;
    const now = new Date();

    const resolvedStore = await resolvePreferredStore({
      storeId: storeId ? String(storeId) : undefined,
      pincode: String(pincode),
      city: city ? String(city) : undefined,
    });
    const store = resolvedStore
      ? await prisma.stores.findUnique({
          where: { id: resolvedStore.id },
          include: { seller: { include: { events: true } } },
        })
      : null;

    if (!store) {
      const nearbyStore = await prisma.stores.findFirst({
        select: { name: true, city: true },
      });

      return res.status(200).json({
        success: false,
        message: "We don't deliver to this location yet",
        isServiceable: false,
        cartDeliveryTime: null,
        store: null,
        nearbyHint: nearbyStore
          ? `Available in nearby area: ${nearbyStore.city}`
          : null,
        items: [],
      });
    }

    const productIds = cartItems.map((item: any) => item.productId);
    const variants = await prisma.products.findMany({
      where: {
        storeId: store.id,
        isDeleted: { not: true },
        status: "Active",
        OR: [
          { id: { in: productIds } },
          { catalogProductId: { in: productIds } },
        ],
      },
      include: {
        images: true,
        catalogProduct: { select: { slug: true } },
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const catalogVariantMap = new Map(
      variants
        .filter((variant) => Boolean(variant.catalogProductId))
        .map((variant) => [variant.catalogProductId!, variant]),
    );
    let subtotal = 0;
    const productSpecificCouponIds: string[] = [];
    let hasCartChanged = false;

    const validatedItems = cartItems.map((item: any) => {
      const variant =
        variantMap.get(item.productId) ?? catalogVariantMap.get(item.productId);
      const availableQty = variant ? (variant.stock ?? 0) : 0;
      const inStock = variant ? availableQty > 0 : false;
      const price = variant ? variant.sale_price || variant.regular_price : 0;

      // Detection if this specific item caused a cart change
      if (!variant || !inStock || availableQty < item.quantity) {
        hasCartChanged = true;
      }

      if (variant) {
        subtotal += price * Math.min(item.quantity, availableQty);
        if (variant.discount_codes) {
          productSpecificCouponIds.push(...variant.discount_codes);
        }
      }

      return {
        productId: item.productId,
        resolvedProductId: variant?.id || null,
        title: variant?.title || "Unknown Product",
        slug: variant?.catalogProduct?.slug || variant?.slug || "",
        inStock: inStock && availableQty >= item.quantity,
        availableQty,
        requestedQty: item.quantity,
        price,
        image: variant?.images[0]?.url || "",
        deliveryTime:
          (store.cityDeliveryTimes as any)?.[city || pincode] ||
          (store.cityDeliveryTimes as any)?.[pincode] ||
          45,
      };
    });

    // 3. Fetch and filter applicable coupons (store-specific, global, or product-specific)
    const coupons = await prisma.discount_codes.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        AND: [
          {
            OR: [
              { adminId: { not: null } },
              { sellerId: store.sellerId },
              { id: { in: productSpecificCouponIds } },
            ],
          },
          { minOrderValue: { lte: subtotal } },
        ],
      },
    });

    // 4. Extract active events
    const activeEvents = (store.seller?.events || []).filter(
      (e: any) =>
        e.isActive &&
        new Date(e.startTime) <= now &&
        new Date(e.endTime) >= now,
    );

    const cartDeliveryTime =
      (store.cityDeliveryTimes as any)?.[city || pincode] ||
      (store.cityDeliveryTimes as any)?.[pincode] ||
      45;

    // Helper: Convert "HH:MM" to minutes from midnight
    const toMins = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const nowH = now.getHours();
    const nowM = now.getMinutes();
    const nowTotal = nowH * 60 + nowM;

    // 1. Store Opening Hours Check
    const openMins = toMins(store.opening_hours || "09:00");
    const closeMins = toMins(store.closing_hours || "23:00");
    const isStoreOpen = nowTotal >= openMins && nowTotal <= closeMins;

    // 2. Instant Delivery Window Check
    const instantStartMins = toMins(
      store.instant_delivery_window_start || "11:00",
    );
    const instantEndMins = toMins(store.instant_delivery_window_end || "19:00");

    const isInstantWindow =
      nowTotal >= instantStartMins && nowTotal <= instantEndMins;
    const isInstantAvailable =
      isStoreOpen && store.is_instant_delivery_enabled && isInstantWindow;

    // 3. Define Available Slots
    const availableSlots = isInstantAvailable
      ? ["instant", "morning", "evening"]
      : ["morning", "evening"];

    return res.status(200).json({
      success: true,
      items: validatedItems,
      store: {
        id: store.id,
        name: store.name,
        city: store.city,
        pincode: store.pincode,
        isOpen: isStoreOpen,
      },
      cartDeliveryTime,
      storeName: store.name,
      storeId: store.id,
      isStoreOpen,
      openingHours: store.opening_hours,
      closingHours: store.closing_hours,
      isServiceable: true,
      hasCartChanged,
      availableSlots,
      isInstantAvailable,
      instantFee: store.instant_delivery_fee || 20,
      coupons,
      events: activeEvents,
      subtotal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params as { productId: string };
    const { stockAdjustment } = validate(updateProductStockSchema, req.body);
    const adjustment = Number(stockAdjustment);
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, storeId: true, adminId: true, stock: true },
    });
    if (!product) return next(new NotFoundError("Product not found"));
    const hasAccess =
      req.role === "admin" ||
      (req.role === "seller" && product.storeId === req.seller?.store?.id);
    if (!hasAccess)
      return next(
        new ValidationError("Unauthorized to update this product's stock"),
      );
    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: { stock: { increment: adjustment } },
      select: { id: true, stock: true, catalogProductId: true },
    });

    // Broadcast stock update via RabbitMQ -> Worker -> WebSocket
    try {
      await publishToQueue("ORDER_EVENTS", {
        type: "STOCK_UPDATE",
        productId: updatedProduct.id,
        catalogProductId: updatedProduct.catalogProductId || null,
        stock: updatedProduct.stock,
        message: `Stock for product ${productId} updated to ${updatedProduct.stock}`,
      });
    } catch (publishError) {
      console.error(
        "[updateProductStock] ❌ Failed to publish stock update:",
        publishError,
      );
    }

    invalidateSearchCache();
    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      newStock: updatedProduct.stock,
    });
  } catch (error) {
    next(error);
  }
};
