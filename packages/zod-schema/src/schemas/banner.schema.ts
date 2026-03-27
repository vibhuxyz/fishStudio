import { z } from "zod";

export const bannerImageSchema = z.union([
  z.string(),
  z.object({
    url: z.string().optional(),
    file_id: z.string().optional(),
    fileId: z.string().optional(),
    file_url: z.string().optional(),
  }),
]);

export const uploadBannerSchema = z.object({
  fileName: z.string().optional(),
  images: z.array(bannerImageSchema).optional(),
  category: z.string().optional().nullable(),
  bannerType: z.enum(["homepage", "category", "announcement"]).optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  price: z.string().optional(),
});

export const updateBannerSchema = z.object({
  fileName: z.string().optional(),
  isActive: z.boolean().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  price: z.string().optional(),
});

export const reviewBannerSchema = z.object({
  bannerId: z.string().min(1, "Banner ID is required"),
  action: z.enum(["APPROVE", "REJECT"]),
});
