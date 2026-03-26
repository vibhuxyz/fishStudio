import { z } from "zod";

export const uploadProductImageSchema = z.object({
  fileName: z.string().min(1, "File data is required"),
});

export const uploadCloudinaryImageSchema = z.object({
  images: z.array(z.string()).optional(),
  fileName: z.string().optional(),
  folder: z.enum(["banners", "products", "categriy"]).optional().default("products"),
  productTitle: z.string().optional(),
  category: z.string().optional(),
});

export const deleteCloudinaryImageSchema = z.object({
  fileId: z.string().min(1, "fileId is required for deletion"),
});
