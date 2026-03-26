import { z } from "zod";

export const uploadBannerSchema = z.object({
  fileName: z.string().optional(),
  images: z.array(z.string()).optional(),
  category: z.string().optional().nullable(),
});

export const updateBannerSchema = z.object({
  fileName: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const reviewBannerSchema = z.object({
  bannerId: z.string().min(1, "Banner ID is required"),
  action: z.enum(["APPROVE", "REJECT"]),
});
