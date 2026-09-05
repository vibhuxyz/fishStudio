import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const subCategorySchema = z.object({
  category: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Subcategory name is required"),
});

export const deleteCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  newName: z.string().min(1).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const updateSubCategorySchema = z.object({
  category: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Subcategory name is required"),
  newName: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Which map backend every client uses. "osm" needs no key and no billing, so it
 * is the safe fallback whenever Google is unavailable or unaffordable.
 */
export const mapProviderSchema = z.object({
  mapProvider: z.enum(["osm", "google"]),
});
