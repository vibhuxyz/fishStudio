import { z } from "zod";

export const productImageSchema = z.object({
  file_id: z.string().optional(),
  fileId: z.string().optional(),
  url: z.string().url().optional(),
  file_url: z.string().url().optional(),
}).transform((data) => ({
  file_id: data.file_id || data.fileId || "",
  url: data.url || data.file_url || "",
}));

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

const wrapValue = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((val) => {
  if (typeof val === "object" && val !== null && "value" in val) return (val as any).value;
  return val;
}, schema);

const wrapArray = <T extends z.ZodTypeAny>(schema: z.ZodArray<T>) => z.preprocess((val) => {
  if (!Array.isArray(val)) return val;
  return val.map((item) => (typeof item === "object" && item !== null && "value" in item ? (item as any).value : item));
}, schema);

export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  category: wrapValue(z.string().min(1, "Category is required")),
  subCategory: wrapValue(z.string().min(1, "SubCategory is required")),
  short_description: z.string().min(1, "Short description is required"),
  images: z.array(productImageSchema),
  tags: z.preprocess((val) => {
    if (typeof val === "string") return val.split(",").map((t) => t.trim());
    if (Array.isArray(val)) {
        return val.map((item) => (typeof item === "object" && item !== null && "value" in item ? String(item.value) : item));
    }
    return val;
  }, z.array(z.string())).optional(),
  sizes: wrapArray(z.array(z.string())).optional(),
  sizePricing: z.array(productSizePricingSchema).nullable().optional(),
  cuttingTypePricing: z.array(productCuttingTypePricingSchema).nullable().optional(),
  pieceSizePricing: z.array(productPieceSizePricingSchema).nullable().optional(),
  cuttingTypes: wrapArray(z.array(z.string())).optional(),
  pieceSizes: wrapArray(z.array(z.string())).optional(),
  processingWeightLoss: z.string().nullable().optional(),
  stock: z.number().int().nonnegative(),
  sale_price: z.number().nonnegative(),
  regular_price: z.number().nonnegative(),
  status: wrapValue(z.enum(["Active", "NonActive"])).optional(),
  cash_on_delivery: wrapValue(z.enum(["yes", "no"])).optional().default("yes"),
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
  cartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().nonnegative(),
  })).min(1, "At least one item is required"),
  pincode: z.string().min(6, "Pincode is required"),
  city: z.string().optional(),
  storeId: z.string().optional(),
});

export const updateProductSchema = productSchema.partial();
