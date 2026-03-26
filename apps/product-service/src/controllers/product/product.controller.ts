import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import {
  indexProduct,
  updateIndexedProduct,
  removeIndexedProduct,
} from "../../lib/meilisearch.js";

import {
  AuthRequest,
  getOwnedProductFilter,
  getSellerStore,
  mapProductWithActiveEvents,
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
    let { slug } = req.body;
    if (!slug || typeof slug !== "string") {
      return next(new ValidationError("Slug is required and must be a string."));
    }
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

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "admin" || !req.admin?.id) {
      return next(new ValidationError("Only admin can create catalog products!"));
    }
    const {
      title,
      short_description,
      sizes,
      cuttingTypes,
      pieceSizes,
      processingWeightLoss,
      slug,
      tags,
      cash_on_delivery,
      category,
      subCategory,
      stock,
      sale_price,
      regular_price,
      images = [],
    } = req.body;

    const requiredFields = { title, slug, short_description, category, subCategory, tags };
    const missingFields = Object.entries(requiredFields).filter(([_, value]) => {
      if (value === undefined || value === null) return true;
      if (typeof value === "string" && value.trim() === "") return true;
      if (Array.isArray(value) && value.length === 0) return true;
      return false;
    }).map(([key]) => key);

    if (missingFields.length > 0) {
      return next(new ValidationError(`Missing required fields: ${missingFields.join(", ")}`));
    }

    const slugChecking = await prisma.products.findUnique({ where: { slug } });
    if (slugChecking) {
      return next(new ValidationError("Slug already exists! Please use a different slug!"));
    }

    const normalizedSizes = sizes ? normalizeDynamicValues(sizes) : [];
    const normalizedPieceSizes = pieceSizes ? normalizeDynamicValues(pieceSizes) : [];
    const normalizedCuttingTypes = cuttingTypes ? normalizeDynamicValues(cuttingTypes) : [];

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
        adminId: req.admin.id,
        storeId: null,
        catalogProductId: null,
        isDeleted: false,
        tags: Array.isArray(tags) ? tags : tags.split(",").map((t: string) => t.trim()),
        discount_codes: [],
        stock: Number(stock ?? 0),
        sale_price: Number(sale_price ?? 0),
        regular_price: Number(regular_price ?? 0),
        images: {
          create: images.map((img: any) => ({
            file_id: img.fileId,
            url: img.file_url,
            type: "PRODUCT",
          })),
        },
      },
      include: { images: true },
    });

    indexProduct(newProduct as any);
    res.status(201).json({ success: true, message: "Product created successfully!", newProduct });
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
    const sellerProductMap = new Map(sellerProducts.map((p) => [p.catalogProductId, p.id]));
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
    const catalogProductId = getRequiredParam(req.params.catalogProductId, "Catalog product id");
    const sellerStore = getSellerStore(req);
    const catalogProductCandidate = await prisma.products.findFirst({
      where: { id: catalogProductId, adminId: { not: null }, isDeleted: false },
      include: { images: true },
    });

    if (!catalogProductCandidate || !isCatalogRootProduct(catalogProductCandidate)) {
      return next(new NotFoundError("Catalog product not found!"));
    }

    const catalogProduct = catalogProductCandidate;
    const existingStoreProduct = await prisma.products.findFirst({
      where: { storeId: sellerStore.id, catalogProductId },
      select: { id: true },
    });

    if (existingStoreProduct) {
      return next(new ValidationError("This product is already added to the seller store!"));
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
    } = req.body;

    const uniqueSlug = await buildUniqueSlug(catalogProduct.slug, sellerStore.id.slice(-6));
    const hasSizes = Array.isArray(catalogProduct.sizes) && catalogProduct.sizes.length > 0;

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
        short_description: typeof short_description === "string" && short_description.trim() ? short_description : catalogProduct.short_description,
        tags: typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : Array.isArray(tags) ? tags : catalogProduct.tags,
        sizes: catalogProduct.sizes,
        sizePricing: normalizedSizePricing.length > 0 ? normalizedSizePricing : undefined,
        cuttingTypes: catalogProduct.cuttingTypes,
        pieceSizes: catalogProduct.pieceSizes,
        processingWeightLoss: typeof processingWeightLoss === "string" && processingWeightLoss.trim() ? processingWeightLoss : catalogProduct.processingWeightLoss,
        stock: Number(stock ?? 0),
        sale_price: displayPrices.salePrice,
        regular_price: displayPrices.regularPrice,
        cashOnDelivery: typeof cash_on_delivery === "string" ? cash_on_delivery : catalogProduct.cashOnDelivery,
        discount_codes: Array.isArray(discountCodes) ? discountCodes : [],
        status: status === "NonActive" ? "NonActive" : "Active",
        storeId: sellerStore.id,
        catalogProductId: catalogProduct.id,
        images: {
          create: catalogProduct.images.map((img) => ({
            file_id: img.file_id,
            url: img.url,
            type: img.type,
          })),
        },
      },
      include: { images: true },
    });

    indexProduct(storeProduct as any);
    return res.status(201).json({ success: true, message: "Product added to seller store successfully!", product: storeProduct });
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
    const { storeId, pincode } = req.query;
    let effectiveStoreId = storeId ? String(storeId) : null;

    if (!effectiveStoreId && pincode) {
      const store = await prisma.stores.findFirst({
        where: { OR: [{ pincode: String(pincode) }, { availableCities: { has: String(pincode) } }] },
        select: { id: true },
      });
      if (store) effectiveStoreId = store.id;
    }

    const catalogProducts = await prisma.products.findMany({
      where: { adminId: { not: null }, catalogProductId: null, isDeleted: false, status: "Active" },
      include: {
        images: true,
        storeVariants: {
          where: { isDeleted: false, status: { in: ["Active", "NonActive"] } },
          include: {
            images: true,
            store: { include: { seller: { include: { events: true } } } },
          },
        },
      },
    });

    const normalizedStoreId = effectiveStoreId ? String(effectiveStoreId) : null;
    const finalProducts = catalogProducts.map((catalogProduct) => {
      const variants = catalogProduct.storeVariants ?? [];
      const variant = (normalizedStoreId ? variants.find((v) => v.storeId === normalizedStoreId) : undefined) ?? variants[0];
      const baseProductData = { ...catalogProduct, title: catalogProduct.title, short_description: catalogProduct.short_description, images: catalogProduct.images };
      if (variant) {
        return { ...baseProductData, ...variant, title: catalogProduct.title, images: catalogProduct.images?.length ? catalogProduct.images : variant.images };
      }
      return { ...baseProductData, stock: 0, store: null };
    });

    res.status(200).json({ success: true, products: finalProducts.map(mapProductWithActiveEvents) });
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
    const product = await prisma.products.findFirst({
      where: { slug, storeId: { not: null }, catalogProductId: { not: null }, isDeleted: false, status: "Active" },
      include: {
        images: true,
        store: { include: { seller: { include: { events: true } } } },
      },
    });
    if (!product) return next(new NotFoundError("Product not found!"));
    return res.status(200).json({ success: true, product: mapProductWithActiveEvents(product) });
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
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const filter = getOwnedProductFilter(req);

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filter,
        include: {
          images: true,
          store: { select: { id: true, name: true, sellerId: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.products.count({ where: filter }),
    ]);

    const sellerIds = [...new Set(products.map((p) => p.store?.sellerId).filter(Boolean) as string[])];
    const now = new Date();
    const activeEvents = sellerIds.length > 0
      ? await prisma.seller_events.findMany({
          where: { sellerId: { in: sellerIds }, startTime: { lte: now }, endTime: { gte: now }, isActive: true },
        })
      : [];

    const eventsBySellerId = new Map<string, typeof activeEvents>();
    for (const event of activeEvents) {
      const list = eventsBySellerId.get(event.sellerId) ?? [];
      list.push(event);
      eventsBySellerId.set(event.sellerId, list);
    }

    const productsWithEvents = products.map((p) => ({
      ...p,
      activeEvents: p.store?.sellerId ? (eventsBySellerId.get(p.store.sellerId) ?? []) : [],
    }));

    return res.status(200).json({
      success: true,
      products: productsWithEvents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
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
          where: { sellerId, startTime: { lte: now }, endTime: { gte: now }, isActive: true },
        })
      : [];
    return res.status(200).json({ success: true, product: { ...product, activeEvents } });
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
      select: { id: true, storeId: true, adminId: true, sizes: true, cuttingTypes: true, pieceSizes: true },
    });

    if (!product) return next(new NotFoundError("Product not found!"));
    const ownerFilter = getOwnedProductFilter(req);
    const hasAccess =
      ("storeId" in ownerFilter && product.storeId === ownerFilter.storeId) ||
      ("adminId" in ownerFilter && product.adminId === ownerFilter.adminId);

    if (!hasAccess) return next(new ValidationError("You are not authorized to update this product!"));

    const {
      title, short_description, tags, category, subCategory, stock, sale_price, regular_price, sizePricing, cuttingTypePricing, pieceSizePricing,
      slug, sizes, pieceSizes, cuttingTypes, discountCodes, cash_on_delivery, processingWeightLoss, status
    } = req.body;

    let resolvedSlug: string | null = null;
    if (slug) {
      const slugChecking = await prisma.products.findFirst({ where: { slug, NOT: { id: productId } } });
      if (slugChecking) {
        if (req.role === "seller" && req.seller?.store?.id) {
          resolvedSlug = await buildUniqueSlug(slug, req.seller.store.id.slice(-6), productId);
        } else {
          return next(new ValidationError("Slug already exists! Please use a different slug!"));
        }
      } else {
        resolvedSlug = slug;
      }
    }

    const updateData: Record<string, any> = {};
    if (typeof title === "string" && title.trim()) updateData.title = title;
    if (typeof short_description === "string" && short_description.trim()) updateData.short_description = short_description;
    if (typeof category === "string" && category.trim()) updateData.category = category;
    if (typeof subCategory === "string" && subCategory.trim()) updateData.subCategory = subCategory;
    if (typeof resolvedSlug === "string" && resolvedSlug.trim()) updateData.slug = resolvedSlug;
    if (typeof processingWeightLoss === "string") updateData.processingWeightLoss = processingWeightLoss;
    if (typeof tags === "string") updateData.tags = tags.split(",").map((t: string) => t.trim()).filter(Boolean);
    else if (Array.isArray(tags)) updateData.tags = tags;
    if (typeof status === "string" && ["Active", "NonActive"].includes(status)) updateData.status = status;

    if (req.role === "seller") {
      if (typeof stock !== "undefined") updateData.stock = Number(stock);
      if (typeof cash_on_delivery === "string") updateData.cashOnDelivery = cash_on_delivery;
      if (typeof discountCodes !== "undefined") updateData.discount_codes = Array.isArray(discountCodes) ? discountCodes : [];
    }

    const normalizedSizes = normalizeDynamicValues(sizes);
    const normalizedPieceSizes = normalizeDynamicValues(pieceSizes);
    const normalizedCuttingTypes = normalizeDynamicValues(cuttingTypes);

    if (typeof sizes !== "undefined") updateData.sizes = normalizedSizes;
    if (typeof pieceSizes !== "undefined") updateData.pieceSizes = normalizedPieceSizes;
    if (typeof cuttingTypes !== "undefined") updateData.cuttingTypes = normalizedCuttingTypes;

    if (req.role === "seller") {
      const effectiveSizes = normalizedSizes.length > 0 ? normalizedSizes : (Array.isArray(product.sizes) ? product.sizes : []);
      if (Array.isArray(sizePricing) && effectiveSizes.length > 0) {
        const nSizePricing = normalizeSizePricing(sizePricing, effectiveSizes as string[], Number(sale_price ?? 0), Number(regular_price ?? sale_price ?? 0));
        const dPrices = getDisplayPricesFromSizePricing(nSizePricing);
        updateData.sizePricing = nSizePricing;
        updateData.sale_price = dPrices.salePrice;
        updateData.regular_price = dPrices.regularPrice;
      } else {
        if (typeof sale_price !== "undefined") updateData.sale_price = Number(sale_price);
        if (typeof regular_price !== "undefined") updateData.regular_price = Number(regular_price);
      }

      if (Array.isArray(cuttingTypePricing)) {
        const effectiveCuttingTypes = normalizedCuttingTypes.length > 0 ? normalizedCuttingTypes : (Array.isArray(product.cuttingTypes) ? product.cuttingTypes : []);
        updateData.cuttingTypePricing = normalizeCuttingTypePricing(cuttingTypePricing, effectiveCuttingTypes as string[]);
      }
      if (Array.isArray(pieceSizePricing)) {
        const effectivePieceSizes = normalizedPieceSizes.length > 0 ? normalizedPieceSizes : (Array.isArray(product.pieceSizes) ? product.pieceSizes : []);
        updateData.pieceSizePricing = normalizePieceSizePricing(pieceSizePricing, effectivePieceSizes as string[]);
      }
    }

    const updatedProduct = await prisma.products.update({ where: { id: productId }, data: updateData, include: { images: true } });
    updateIndexedProduct(updatedProduct as any);
    return res.status(200).json({ success: true, message: "Product updated successfully!", product: updatedProduct });
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
    if (req.role === "seller") return next(new ValidationError("Sellers cannot delete products. Use Active/NonActive status instead."));
    const productId = getRequiredParam(req.params.productId, "Product id");
    const ownerFilter = getOwnedProductFilter(req);
    const product = await prisma.products.findUnique({ where: { id: productId }, select: { id: true, storeId: true, adminId: true, isDeleted: true } });
    if (!product) return next(new NotFoundError("Product not found!"));

    const hasAccess = ("storeId" in ownerFilter && product.storeId === ownerFilter.storeId) || ("adminId" in ownerFilter && product.adminId === ownerFilter.adminId);
    if (!hasAccess) return next(new ValidationError("You are not authorized to delete this product!"));
    if (product.isDeleted) return next(new ValidationError("Product is already in delete state!"));

    const deletedProduct = await prisma.products.update({ where: { id: productId }, data: { isDeleted: true, deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    removeIndexedProduct(productId);
    return res.status(200).json({ message: "Product is scheduled for deletion in 24 hours.You can restore it within this time.", deletedAt: deletedProduct.deletedAt });
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
    const product = await prisma.products.findUnique({ where: { id: productId }, select: { id: true, storeId: true, adminId: true, isDeleted: true } });
    if (!product) return next(new NotFoundError("Product not found!"));

    const hasAccess = ("storeId" in ownerFilter && product.storeId === ownerFilter.storeId) || ("adminId" in ownerFilter && product.adminId === ownerFilter.adminId);
    if (!hasAccess) return next(new ValidationError("You are not authorized to restore this product!"));
    if (!product.isDeleted) return res.status(400).json({ message: "Product is not in deleted state!" });

    const restoredProduct = await prisma.products.update({ where: { id: productId }, data: { isDeleted: false, deletedAt: null } });
    return res.status(200).json({ message: "Product is restored successfully!", restoreProduct: restoredProduct });
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
    if (!storeId) return res.status(400).json({ success: false, message: "storeId required" });
    const store = await prisma.stores.findUnique({ where: { id: storeId }, select: { sellerId: true } });
    if (!store) return res.status(200).json({ success: true, coupons: [], events: [] });
    const now = new Date();
    const [discountCodes, activeEvents] = await Promise.all([
      prisma.discount_codes.findMany({ where: { sellerId: store.sellerId }, orderBy: { createdAt: "desc" } }),
      prisma.seller_events.findMany({ where: { sellerId: store.sellerId, isActive: true, startTime: { lte: now }, endTime: { gte: now } }, orderBy: { startTime: "desc" } }),
    ]);
    return res.status(200).json({ success: true, discountCodes, activeEvents });
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
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) return res.status(200).json({ success: true, products: [] });
    const products = await prisma.products.findMany({
      where: { id: { in: productIds }, isDeleted: false },
      select: { id: true, title: true, slug: true, status: true, stock: true, sale_price: true, regular_price: true, images: { take: 1, select: { url: true } } },
    });
    const validatedProducts = products.map((p) => ({ id: p.id, title: p.title, slug: p.slug, status: p.status, stock: p.stock, price: p.sale_price || p.regular_price, image: p.images[0]?.url || "" }));
    res.status(200).json({ success: true, products: validatedProducts });
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
    const { stockAdjustment } = req.body;
    if (stockAdjustment === undefined || isNaN(Number(stockAdjustment))) return next(new ValidationError("Valid stockAdjustment is required"));
    const adjustment = Number(stockAdjustment);
    const product = await prisma.products.findUnique({ where: { id: productId }, select: { id: true, storeId: true, adminId: true, stock: true } });
    if (!product) return next(new NotFoundError("Product not found"));
    const hasAccess = req.role === "admin" || (req.role === "seller" && product.storeId === req.seller?.store?.id);
    if (!hasAccess) return next(new ValidationError("Unauthorized to update this product's stock"));
    const updatedProduct = await prisma.products.update({ where: { id: productId }, data: { stock: { increment: adjustment } } });
    res.status(200).json({ success: true, message: "Stock updated successfully", newStock: updatedProduct.stock });
  } catch (error) {
    next(error);
  }
};
