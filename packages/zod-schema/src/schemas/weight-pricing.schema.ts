import { z } from "zod";

/**
 * Extended product schemas with weight-based pricing support
 * 
 * These schemas extend the base product schemas to support
 * automatic price calculation from weight ranges.
 */

// Base price configuration schema
export const weightPricingConfigSchema = z.object({
  basePricePerKg: z.number().positive("Base price per kg must be positive").nullable().optional(),
  basePricePerUnit: z.number().positive("Base price per unit must be positive").nullable().optional(),
  pricingMethod: z.enum(["per_kg", "per_piece", "fixed"]).default("per_kg"),
});

// Weight range schema
export const weightRangeSchema = z.object({
  label: z.string(),
  min: z.number(),
  max: z.number(),
  avg: z.number(),
  unit: z.enum(["grams", "pieces_per_kg"]),
});

// Extended product schema with weight pricing
export const extendedProductSchema = z.object({
  // Weight-based pricing fields
  basePricePerKg: z.number().positive().nullable().optional(),
  basePricePerUnit: z.number().positive().nullable().optional(),
  pricingMethod: z.enum(["per_kg", "per_piece", "fixed"]).default("per_kg"),
  
  // Weight ranges (used as sizes)
  weights: z.array(z.string()).optional(),
  
  // Existing fields (for reference)
  sizes: z.array(z.string()).optional(),
  sizePricing: z.array(z.object({
    size: z.string(),
    weightGrams: z.number(),
    salePrice: z.number(),
    regularPrice: z.number(),
  })).nullable().optional(),
  
  cuttingTypes: z.array(z.string()).optional(),
  cuttingTypePricing: z.array(z.object({
    cuttingType: z.string(),
    salePrice: z.number(),
    regularPrice: z.number(),
  })).nullable().optional(),
  
  pieceSizes: z.array(z.string()).optional(),
  pieceSizePricing: z.array(z.object({
    pieceSize: z.string(),
    salePrice: z.number(),
    regularPrice: z.number(),
  })).nullable().optional(),
  
  stock: z.number().int().nonnegative(),
  sale_price: z.number().nonnegative(),
  regular_price: z.number().nonnegative(),
});

// Product creation schema with auto-pricing
export const productWithAutoPricingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "SubCategory is required"),
  short_description: z.string().min(1, "Short description is required"),
  
  // Weight-based pricing
  basePricePerKg: z.number().positive("Base price per kg is required"),
  weights: z.array(z.string()).min(1, "At least one weight range is required"),
  
  // Optional pricing overrides
  sizePricing: z.array(z.object({
    size: z.string(),
    weightGrams: z.number(),
    salePrice: z.number(),
    regularPrice: z.number(),
  })).optional(),
  
  cuttingTypes: z.array(z.string()).optional(),
  cuttingTypePricing: z.array(z.object({
    cuttingType: z.string(),
    salePrice: z.number(),
    regularPrice: z.number(),
  })).optional(),
  
  pieceSizes: z.array(z.string()).optional(),
  pieceSizePricing: z.array(z.object({
    pieceSize: z.string(),
    salePrice: z.number(),
    regularPrice: z.number(),
  })).optional(),
  
  stock: z.number().int().nonnegative(),
  status: z.enum(["Active", "NonActive"]).optional(),
});

// Bulk price update schema
export const bulkPriceUpdateSchema = z.object({
  productIds: z.array(z.string()),
  basePricePerKg: z.number().positive().optional(),
  priceIncreasePercent: z.number().optional(),
  priceIncreaseFixed: z.number().optional(),
  updateSizePricing: z.boolean().default(true),
  updateCuttingPricing: z.boolean().default(false),
  updatePiecePricing: z.boolean().default(false),
});

// Excel import schema
export const excelImportSchema = z.object({
  filePath: z.string(),
  defaultBasePrices: z.record(z.string(), z.number()).optional(),
  defaultStock: z.number().int().nonnegative().default(100),
  autoGeneratePricing: z.boolean().default(true),
});

// Export types
export type WeightPricingConfig = z.infer<typeof weightPricingConfigSchema>;
export type WeightRange = z.infer<typeof weightRangeSchema>;
export type ExtendedProduct = z.infer<typeof extendedProductSchema>;
export type ProductWithAutoPricing = z.infer<typeof productWithAutoPricingSchema>;
export type BulkPriceUpdate = z.infer<typeof bulkPriceUpdateSchema>;
export type ExcelImport = z.infer<typeof excelImportSchema>;
