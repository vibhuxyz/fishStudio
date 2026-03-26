import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const subCategorySchema = z.object({
  category: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Subcategory name is required"),
});
