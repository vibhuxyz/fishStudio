import { z } from "zod";

export const productImageSchema = z.object({
  file_id: z.string(),
  url: z.string().url(),
});

export const productSizePricingSchema = z.object({
  size: z.string(),
  weightGrams: z.number(),
  salePrice: z.number(),
  regularPrice: z.number(),
});

export const productCuttingTypePricingSchema = z.object({
  cuttingType: z.string(),
  salePrice: z.number(),
  regularPrice: z.number(),
});

export const productPieceSizePricingSchema = z.object({
  pieceSize: z.string(),
  salePrice: z.number(),
  regularPrice: z.number(),
});

export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "SubCategory is required"),
  short_description: z.string().min(1, "Short description is required"),
  images: z.array(productImageSchema),
  tags: z.preprocess((val) => {
    if (typeof val === "string") return val.split(",").map((t) => t.trim());
    return val;
  }, z.array(z.string())).optional(),
  sizes: z.array(z.string()).optional(),
  sizePricing: z.array(productSizePricingSchema).nullable().optional(),
  cuttingTypePricing: z.array(productCuttingTypePricingSchema).nullable().optional(),
  pieceSizePricing: z.array(productPieceSizePricingSchema).nullable().optional(),
  cuttingTypes: z.array(z.string()).optional(),
  pieceSizes: z.array(z.string()).optional(),
  processingWeightLoss: z.string().nullable().optional(),
  stock: z.number().int().nonnegative(),
  sale_price: z.number().nonnegative(),
  regular_price: z.number().nonnegative(),
  status: z.enum(["Active", "NonActive"]).optional(),
  cash_on_delivery: z.enum(["yes", "no"]).optional().default("yes"),
  discountCodes: z.array(z.string()).optional(),
});

export const slugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const addCatalogProductToStoreSchema = z.object({
  regular_price: z.preprocess((val) => Number(val), z.number().nonnegative()).optional(),
  sale_price: z.preprocess((val) => Number(val), z.number().nonnegative()).optional(),
  sizePricing: z.array(z.any()).optional(),
  stock: z.preprocess((val) => Number(val), z.number().nonnegative()).optional(),
  cash_on_delivery: z.enum(["yes", "no"]).optional(),
  discountCodes: z.array(z.string()).optional(),
  short_description: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  status: z.enum(["Active", "NonActive"]).optional(),
  processingWeightLoss: z.string().optional(),
});

export const updateProductStockSchema = z.object({
  stockAdjustment: z.preprocess((val) => Number(val), z.number()),
});

export const validateCartSchema = z.object({
  productIds: z.array(z.string()).min(1, "At least one product ID is required"),
});

export const updateProductSchema = productSchema.partial();
