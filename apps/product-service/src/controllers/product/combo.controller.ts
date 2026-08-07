import { Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { createComboSchema, updateComboSchema, validate } from "@repo/zod-schema";
import { AuthRequest, getSellerStore, getRequiredParam } from "./utils.js";
import { resolvePreferredStore } from "./storefront.utils.js";

type ComboItemInput = {
  productId: string;
  quantity: number;
  cuttingType?: string;
  pieceSize?: string;
};

// Fetches the component products and checks they all belong to this store,
// are sellable, and that the combo price is a genuine discount off their
// combined regular price — a seller shouldn't be able to "bundle" a single
// product at a markup and call it a combo.
const validateComboItems = async (
  storeId: string,
  items: ComboItemInput[],
  comboPrice: number,
) => {
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.products.findMany({
    where: { id: { in: productIds }, isDeleted: { not: true } },
    select: {
      id: true,
      title: true,
      storeId: true,
      regular_price: true,
      sale_price: true,
      cuttingTypes: true,
      pieceSizes: true,
      status: true,
    },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  let regularTotal = 0;
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new ValidationError(`Product ${item.productId} not found`);
    }
    if (product.storeId !== storeId) {
      throw new ValidationError(`"${product.title}" doesn't belong to your store`);
    }
    if (product.status !== "Active") {
      throw new ValidationError(`"${product.title}" is not active`);
    }
    if (item.cuttingType && !product.cuttingTypes.includes(item.cuttingType)) {
      throw new ValidationError(`"${product.title}" doesn't offer cutting type "${item.cuttingType}"`);
    }
    if (item.pieceSize && !product.pieceSizes.includes(item.pieceSize)) {
      throw new ValidationError(`"${product.title}" doesn't offer piece size "${item.pieceSize}"`);
    }
    regularTotal += (product.regular_price || product.sale_price) * item.quantity;
  }

  if (comboPrice >= regularTotal) {
    throw new ValidationError(
      "Combo price must be less than the combined regular price of its items",
    );
  }

  return regularTotal;
};

export const createCombo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const store = getSellerStore(req);
    const { title, description, images, items, comboPrice } = validate(
      createComboSchema,
      req.body,
    );

    const regularTotal = await validateComboItems(store.id, items, comboPrice);

    const combo = await prisma.combos.create({
      data: {
        title,
        description,
        images: images ?? [],
        items,
        regularTotal,
        comboPrice,
        storeId: store.id,
      },
    });

    res.status(201).json({ success: true, message: "Combo created successfully!", combo });
  } catch (error) {
    next(error);
  }
};

export const updateCombo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const store = getSellerStore(req);
    const comboId = getRequiredParam(req.params.comboId, "Combo id");
    const existing = await prisma.combos.findUnique({ where: { id: comboId } });
    if (!existing) return next(new NotFoundError("Combo not found"));
    if (existing.storeId !== store.id) {
      return next(new ValidationError("You can only manage combos for your own store"));
    }

    const data = validate(updateComboSchema, req.body);
    const items = data.items ?? (existing.items as unknown as ComboItemInput[]);
    const comboPrice = data.comboPrice ?? existing.comboPrice;
    const regularTotal = await validateComboItems(store.id, items, comboPrice);

    const combo = await prisma.combos.update({
      where: { id: comboId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.images !== undefined && { images: data.images }),
        items,
        comboPrice,
        regularTotal,
      },
    });

    res.status(200).json({ success: true, message: "Combo updated successfully!", combo });
  } catch (error) {
    next(error);
  }
};

export const deleteCombo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const store = getSellerStore(req);
    const comboId = getRequiredParam(req.params.comboId, "Combo id");
    const existing = await prisma.combos.findUnique({ where: { id: comboId } });
    if (!existing) return next(new NotFoundError("Combo not found"));
    if (existing.storeId !== store.id) {
      return next(new ValidationError("You can only manage combos for your own store"));
    }

    await prisma.combos.delete({ where: { id: comboId } });
    res.status(200).json({ success: true, message: "Combo deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

export const toggleComboStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const store = getSellerStore(req);
    const comboId = getRequiredParam(req.params.comboId, "Combo id");
    const existing = await prisma.combos.findUnique({ where: { id: comboId } });
    if (!existing) return next(new NotFoundError("Combo not found"));
    if (existing.storeId !== store.id) {
      return next(new ValidationError("You can only manage combos for your own store"));
    }

    const combo = await prisma.combos.update({
      where: { id: comboId },
      data: { isActive: !existing.isActive },
    });
    res.status(200).json({ success: true, combo });
  } catch (error) {
    next(error);
  }
};

export const getSellerCombos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const store = getSellerStore(req);
    const combos = await prisma.combos.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, combos });
  } catch (error) {
    next(error);
  }
};

// Hydrates each combo item with its live product data (title, image,
// current price, available cutting types/piece sizes) so the storefront can
// render a variant picker for any item the seller left open.
const hydrateCombo = async (combo: {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  items: unknown;
  regularTotal: number;
  comboPrice: number;
  storeId: string;
}) => {
  const items = combo.items as ComboItemInput[];
  const productIds = [...new Set(items.map((i) => i.productId))];
  // Full BackendProduct-shaped select so the storefront can run this
  // straight through its normal transformProduct(), same as every other
  // product listing — a combo component is a real product, not a stub.
  const products = await prisma.products.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      subCategory: true,
      short_description: true,
      sale_price: true,
      regular_price: true,
      stock: true,
      storeId: true,
      totalSold: true,
      ratings: true,
      sizes: true,
      sizePricing: true,
      cuttingTypePricing: true,
      pieceSizePricing: true,
      cuttingTypes: true,
      pieceSizes: true,
      tags: true,
      processingWeightLoss: true,
      status: true,
      basePricePerKg: true,
      images: { select: { url: true, file_id: true } },
      // Store variants often carry no images of their own — the catalog
      // root product is where they actually live (same precedence as
      // storefront listings and order detail pages).
      catalogProduct: { select: { images: { select: { url: true, file_id: true } } } },
    },
  });
  const productMap = new Map(
    products.map((p) => [
      p.id,
      {
        ...p,
        images: p.images.length > 0 ? p.images : p.catalogProduct?.images ?? [],
        catalogProduct: undefined,
      },
    ]),
  );

  return {
    ...combo,
    items: items.map((item) => ({
      ...item,
      product: productMap.get(item.productId) ?? null,
    })),
  };
};

export const getComboById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const comboId = getRequiredParam(req.params.comboId, "Combo id");
    const combo = await prisma.combos.findUnique({ where: { id: comboId } });
    if (!combo || !combo.isActive) {
      return next(new NotFoundError("Combo not found"));
    }
    res.status(200).json({ success: true, combo: await hydrateCombo(combo) });
  } catch (error) {
    next(error);
  }
};

export const getStoreCombos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = getRequiredParam(req.params.storeId, "Store id");
    const combos = await prisma.combos.findMany({
      where: { storeId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    const hydrated = await Promise.all(combos.map(hydrateCombo));
    res.status(200).json({ success: true, combos: hydrated });
  } catch (error) {
    next(error);
  }
};

// Homepage rail — resolves the store from whatever the customer's session
// already knows (storeId, or failing that pincode/city), the same fallback
// resolvePreferredStore gives every other homepage section. A storeId isn't
// always set yet at first load (no address picked this session), so this
// must not require one the way getStoreCombos does.
export const getHomeCombos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = req.query.storeId ? String(req.query.storeId) : undefined;
    const pincode = req.query.pincode ? String(req.query.pincode) : undefined;
    const city = req.query.city ? String(req.query.city) : undefined;

    if (!storeId && !pincode && !city) {
      return res.status(200).json({ success: true, combos: [] });
    }

    const preferredStore = await resolvePreferredStore({ storeId, pincode, city });
    if (!preferredStore) {
      return res.status(200).json({ success: true, combos: [] });
    }

    const combos = await prisma.combos.findMany({
      where: { storeId: preferredStore.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });
    const hydrated = await Promise.all(combos.map(hydrateCombo));
    res.status(200).json({ success: true, combos: hydrated });
  } catch (error) {
    next(error);
  }
};
