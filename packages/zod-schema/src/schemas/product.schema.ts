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
  // Printed on the GST tax invoice. Optional because most of the catalog
  // predates it, but an invoice line without one shows "—" rather than a
  // guessed code — a wrong HSN is a tax misclassification, not a cosmetic gap.
  hsnCode: z
    .string()
    .regex(/^[0-9]{4,8}$/, "HSN code is 4 to 8 digits")
    .optional()
    .or(z.literal("")),
  // Overrides the store's blanket rate for this product, as a percentage.
  // Fresh fish is 0; other goods may be 5/12/18.
  gstRatePercent: z.preprocess(
    (val) => (val === "" || val == null ? null : Number(val)),
    z.number().min(0).max(28).nullable().optional(),
  ),
  images: z.array(productImageSchema),
  tags: z.preprocess((val) => {
    if (typeof val === "string") return val.split(",").map((t) => t.trim());
    if (Array.isArray(val)) {
        return val.map((item) => (typeof item === "object" && item !== null && "value" in item ? String(item.value) : item));
    }
    return val;
  }, z.array(z.string())).optional(),
  sizes: wrapArray(z.array(z.string())).optional(),
  trackStockPerSize: wrapValue(z.boolean()).optional().default(false),
  sizePricing: z.array(productSizePricingSchema).nullable().optional(),
  // Only meaningful when trackStockPerSize is true — see addCatalogProductToStoreSchema
  // for why this is an array of {size, qty} rather than a {size: qty} map.
  sizeStock: z.array(z.object({
    size: z.string(),
    qty: z.preprocess((val) => Number(val), z.number().nonnegative()),
  })).nullable().optional(),
  cuttingTypePricing: z.array(productCuttingTypePricingSchema).nullable().optional(),
  pieceSizePricing: z.array(productPieceSizePricingSchema).nullable().optional(),
  cuttingTypes: wrapArray(z.array(z.string())).optional(),
  pieceSizes: wrapArray(z.array(z.string())).optional(),
  processingWeightLoss: z.string().nullable().optional(),
  basePricePerKg: z.preprocess((val) => (val === "" || val === null || val === undefined ? null : Number(val)), z.number().nonnegative().nullable().optional()),
  stock: z.number().int().nonnegative(),
  sale_price: z.number().nonnegative(),
  regular_price: z.number().nonnegative(),
  status: wrapValue(z.enum(["Active", "NonActive"])).optional(),
  cash_on_delivery: wrapValue(z.enum(["yes", "no"])).optional().default("yes"),
  discountCodes: z.array(z.string()).optional(),

  // Product detail page content
  origin: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  shelfLife: z.string().nullable().optional(),
  storageInstructions: z.string().nullable().optional(),
  cookingTips: z.preprocess((val) => {
    if (typeof val === "string") return val.split("\n").map((t) => t.trim()).filter(Boolean);
    if (Array.isArray(val)) {
      return val.map((item) => (typeof item === "object" && item !== null && "value" in item ? String(item.value) : item));
    }
    return val;
  }, z.array(z.string())).optional(),
  highlightDescription: z.string().nullable().optional(),
  nutritionProtein: z.string().nullable().optional(),
  nutritionOmega3: z.string().nullable().optional(),
  nutritionCalories: z.string().nullable().optional(),
});

export const slugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const addCatalogProductToStoreSchema = z.object({
  regular_price: z.preprocess((val) => Number(val), z.number().nonnegative()).optional(),
  sale_price: z.preprocess((val) => Number(val), z.number().nonnegative()).optional(),
  // Loosely-shaped: normalizeSizePricing() accepts both camelCase and
  // snake_case keys (salePrice/sale_price etc.) and fills in the rest, so we
  // only rule out non-object entries here rather than pinning exact fields.
  sizePricing: z.array(z.record(z.string(), z.unknown())).optional(),
  // Only meaningful when the catalog product is trackStockPerSize — one
  // entry per stocked size. An array rather than a { size: qty } map because
  // size labels (e.g. "1.1 kg") can contain literal dots, which Mongo would
  // otherwise misparse as a nested-path separator during atomic updates.
  sizeStock: z.array(z.object({
    size: z.string(),
    qty: z.preprocess((val) => Number(val), z.number().nonnegative()),
  })).optional(),
  stock: z.preprocess((val) => Number(val), z.number().nonnegative()).optional(),
  cash_on_delivery: z.enum(["yes", "no"]).optional(),
  discountCodes: z.array(z.string()).optional(),
  short_description: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  status: z.enum(["Active", "NonActive"]).optional(),
  processingWeightLoss: z.string().optional(),
  basePricePerKg: z.preprocess((val) => (val === "" || val === null || val === undefined ? null : Number(val)), z.number().nonnegative().nullable().optional()),
});

export const updateProductStockSchema = z.object({
  stockAdjustment: z.preprocess((val) => Number(val), z.number()),
});

export const validateCartSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().nonnegative(),
    // Present when this line is part of a combo bundle — lets the preview
    // reprice the group to the bundle price instead of catalog price.
    comboId: z.string().optional(),
    cuttingType: z.string().optional(),
    pieceSize: z.string().optional(),
    size: z.string().optional(),
  })).min(1, "At least one item is required"),
  pincode: z.string().min(6, "Pincode is required"),
  city: z.string().optional(),
  area: z.string().optional(),
  storeId: z.string().optional(),
});

export const updateProductSchema = productSchema.partial();

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product id is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  images: z.array(z.string()).optional(),
});
