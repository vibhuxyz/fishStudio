import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { cloudinary, redis } from "@repo/libs";
import { ENV } from "@repo/env-config";
import { AuthRequest, getRequiredParam, interleaveBanners } from "./utils.js";
import { uploadBannerSchema, updateBannerSchema, reviewBannerSchema, validate } from "@repo/zod-schema";
import { publishToQueue } from "@repo/libs";

const ANNOUNCEMENT_CACHE_TTL = 120; // 2 minutes
const announcementCacheKey = (storeId?: string, city?: string, pincode?: string) =>
  `announcement_banners:${storeId || ""}:${city || ""}:${pincode || ""}`;


export const uploadBanner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName, images, category, bannerType, title, subtitle, price } = validate(uploadBannerSchema, req.body);
    const sellerId = req.seller?.id;
    const adminId = req.admin?.id;
    const imageList = Array.isArray(images)
      ? images
      : fileName
        ? [fileName]
        : [];

    // Announcement banners don't require an image
    const effectiveBannerType = bannerType || (category ? "category" : "homepage");

    if (effectiveBannerType !== "announcement" && imageList.length === 0) {
      return next(new ValidationError("Banner image data is required"));
    }
    if (effectiveBannerType === "announcement" && !title) {
      return next(new ValidationError("Announcement banner requires a title"));
    }
    if (!sellerId && !adminId) {
      return next(
        new ValidationError("Only seller or admin can create banners!"),
      );
    }
    if (sellerId && category) {
      const existingBannerCount = await prisma.banners.count({
        where: {
          sellerId,
          category,
          status: { not: "REJECTED" },
        },
      });
      if (existingBannerCount + Math.max(imageList.length, 1) > 3) {
        return next(
          new ValidationError(
            `A seller can upload a maximum of 3 banners per category. You already have ${existingBannerCount} for ${category}.`,
          ),
        );
      }
    }

    // For announcement banners with no image, create a single record
    if (effectiveBannerType === "announcement" && imageList.length === 0) {
      const newBanner = await prisma.banners.create({
        data: {
          imageUrl: "",
          fileId: "",
          category: category || null,
          seller: sellerId ? { connect: { id: sellerId } } : undefined,
          admin: adminId ? { connect: { id: adminId } } : undefined,
          status: adminId ? "APPROVED" : "PENDING",
          isActive: adminId ? true : false,
          bannerType: "announcement",
          title: title || null,
          subtitle: subtitle || null,
          price: price || null,
        },
      });
      return res.status(201).json({ success: true, data: newBanner });
    }

    const createdBanners = [];
    for (const img of imageList) {
      let imageUrl = "";
      let fileId = "";

      if (typeof img === "object" && img !== null) {
        imageUrl = (img as any).url || (img as any).file_url || "";
        fileId = (img as any).file_id || (img as any).fileId || "";
      }

      if (!imageUrl || !fileId) {
        // If it's a string or an object missing info, try uploading to Cloudinary
        const uploadTarget = typeof img === "string" ? img : (imageUrl || "");
        if (!uploadTarget) continue;

        const baseFolder = `${ENV.CLOUDINARY_FOLDER || "fishStudio-app"}/banners`;
        const cloudFolder = effectiveBannerType === "announcement"
          ? `${baseFolder}/announcement`
          : category
            ? `${baseFolder}/category/${category}/images`
            : `${baseFolder}/homepage`;
            
        const response = await cloudinary.uploader.upload(uploadTarget as string, {
          folder: cloudFolder,
          resource_type: "auto",
          quality: "auto:good",
          fetch_format: "auto",
          transformation: [{ width: 1600, crop: "limit" }],
        });
        imageUrl = response.secure_url;
        fileId = response.public_id;
      }

      const newBanner = await prisma.banners.create({
        data: {
          imageUrl: imageUrl,
          fileId: fileId,
          category: category || null,
          seller: sellerId ? { connect: { id: sellerId } } : undefined,
          admin: adminId ? { connect: { id: adminId } } : undefined,
          status: adminId ? "APPROVED" : "PENDING",
          isActive: adminId ? true : false,
          bannerType: effectiveBannerType,
          title: title || null,
          subtitle: subtitle || null,
          price: price || null,
        },
      });
      createdBanners.push(newBanner);
    }
    // Publish to ADMIN_EVENTS queue for real-time dashboard updates
    try {
      if (sellerId) {
        await publishToQueue("ADMIN_EVENTS", {
          type: "BANNER_SUBMITTED",
          sellerId,
          bannerCount: createdBanners.length,
          timestamp: new Date().toISOString(),
          message: `New banner(s) uploaded by seller ${req.seller?.store?.name || "Unknown"}`,
        });
      }
    } catch (publishError) {
      console.error("[uploadBanner] ❌ Failed to publish banner event:", publishError);
    }

    res.status(201).json({
      success: true,
      data: createdBanners.length === 1 ? createdBanners[0] : createdBanners,
    });
  } catch (error: any) {
    console.error("[uploadBanner] ❌ Error:", error?.message ?? error);
    console.error("[uploadBanner] Stack:", error?.stack);
    next(error);
  }
};

export const getSellerBanners = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "seller" || !req.seller?.id) {
      return next(new ValidationError("Only seller can view banners!"));
    }
    const banners = await prisma.banners.findMany({
      where: {
        sellerId: req.seller.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateBanner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "seller" && req.role !== "admin") {
      return next(new ValidationError("Only seller or admin can update banners!"));
    }
    const bannerId = getRequiredParam(req.params.bannerId, "Banner id");
    const { fileName, isActive, title, subtitle, price } = validate(updateBannerSchema, req.body);
    const existingBanner = await prisma.banners.findUnique({
      where: { id: bannerId },
      select: { id: true, sellerId: true, category: true },
    });
    if (!existingBanner) {
      return next(new NotFoundError("Banner not found!"));
    }
    if (req.role === "seller" && existingBanner.sellerId !== req.seller?.id) {
      return next(
        new ValidationError("You are not authorized to update this banner!"),
      );
    }
    const updateData: Record<string, any> = {};
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (price !== undefined) updateData.price = price;
    if (fileName) {
      const baseFolder = `${ENV.CLOUDINARY_FOLDER || "fishStudio-app"}/banners`;
      const cloudFolder = existingBanner.category
        ? `${baseFolder}/category/${existingBanner.category}/images`
        : `${baseFolder}/homepage`;
      const response = await cloudinary.uploader.upload(fileName, {
        folder: cloudFolder,
        resource_type: "auto",
        quality: "auto:good",
        fetch_format: "auto",
        transformation: [{ width: 1600, crop: "limit" }],
      });
      updateData.imageUrl = response.secure_url;
      updateData.fileId = response.public_id;
    }
    const banner = await prisma.banners.update({
      where: { id: bannerId },
      data: updateData,
    });
    return res.status(200).json({
      success: true,
      banner,
      message: "Banner updated successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteBanner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "seller" && req.role !== "admin") {
      return next(new ValidationError("Only seller or admin can delete banners!"));
    }
    const bannerId = getRequiredParam(req.params.bannerId, "Banner id");
    const existingBanner = await prisma.banners.findUnique({
      where: { id: bannerId },
    });
    if (!existingBanner) {
      return next(new NotFoundError("Banner not found!"));
    }
    if (req.role === "seller" && existingBanner.sellerId !== req.seller?.id) {
      return next(
        new ValidationError("You are not authorized to delete this banner!"),
      );
    }
    if (existingBanner.fileId) {
      try {
        await cloudinary.uploader.destroy(existingBanner.fileId);
      } catch (err) {
        console.error("Cloudinary deletion failed for banner", err);
      }
    }
    await prisma.banners.delete({
      where: { id: bannerId },
    });
    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

export const getAdminBanners = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "admin") {
      return next(new ValidationError("Only admin can view all banners!"));
    }
    const banners = await prisma.banners.findMany({
      where: {
        adminId: { not: null },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllCategoryBanners = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "admin") {
      return next(new ValidationError("Only admin can view all banners!"));
    }
    const banners = await prisma.banners.findMany({
      where: {
        OR: [
          { category: { not: null } },
          { bannerType: "announcement" }
        ]
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            store: { select: { name: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    return next(error);
  }
};

export const getPendingBanners = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "admin") {
      return next(new ValidationError("Only admin can view pending banners!"));
    }
    const banners = await prisma.banners.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            store: { select: { name: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    return next(error);
  }
};

export const reviewBanner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "admin") {
      return next(new ValidationError("Only admin can review banners!"));
    }
    const { bannerId, action } = validate(reviewBannerSchema, req.body);
    const banner = await prisma.banners.findUnique({
      where: { id: bannerId },
    });
    if (!banner) {
      return next(new NotFoundError("Banner not found"));
    }
    if (action === "APPROVE") {
      await prisma.banners.update({
        where: { id: bannerId },
        data: {
          status: "APPROVED",
          isActive: true,
        },
      });

      // Notify seller of approval
      if (banner.sellerId) {
        try {
          await publishToQueue("ORDER_EVENTS", {
            type: "BANNER_REVIEWED",
            sellerId: banner.sellerId,
            bannerId,
            status: "APPROVED",
          });
        } catch (publishErr) {
          console.error("Failed to publish BANNER_REVIEWED (APPROVED):", publishErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Banner approved successfully",
      });
    } else if (action === "REJECT") {
      if (banner.fileId) {
        try {
          await cloudinary.uploader.destroy(banner.fileId);
        } catch (err) {
          console.error("Cloudinary deletion failed during rejection", err);
        }
      }
      await prisma.banners.delete({
        where: { id: bannerId },
      });

      // Notify seller of rejection
      if (banner.sellerId) {
        try {
          await publishToQueue("ORDER_EVENTS", {
            type: "BANNER_REVIEWED",
            sellerId: banner.sellerId,
            bannerId,
            status: "REJECTED",
          });
        } catch (publishErr) {
          console.error("Failed to publish BANNER_REVIEWED (REJECTED):", publishErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Banner rejected and deleted successfully",
      });
    } else {
      return next(new ValidationError("Invalid review action"));
    }
  } catch (error) {
    return next(error);
  }
};

export const getActiveBanners = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, storeId, pincode } = req.query;
    const queryCategory = category ? String(category) : null;

    // Resolve which seller IDs match the user's location (for filtering seller banners)
    let matchingSellerIds: string[] | null = null; // null = no location filter
    if (storeId || pincode) {
      const storeWhere: Record<string, any> = {};
      if (storeId) storeWhere.id = String(storeId);
      else if (pincode) {
        storeWhere.OR = [
          { pincode: String(pincode) },
          { availableCities: { has: String(pincode) } },
        ];
      }
      const stores = await prisma.stores.findMany({
        where: storeWhere,
        select: { sellerId: true },
      });
      matchingSellerIds = stores.map((s) => s.sellerId).filter(Boolean) as string[];
    }

    // Build the full WHERE clause in DB — no JS filtering needed
    const sellerCondition =
      matchingSellerIds !== null
        ? // Location provided: admin banners always show + matched seller banners
          { OR: [{ adminId: { not: null } }, { sellerId: { in: matchingSellerIds } }] }
        : // No location: only admin banners (seller banners need a location)
          { adminId: { not: null } };

    const categoryCondition = queryCategory
      ? { category: queryCategory }
      : {
          OR: [
            { category: null },
            { category: "" },
            { bannerType: "homepage" },
            { bannerType: null },
          ],
        };

    const filteredBanners = await prisma.banners.findMany({
      where: {
        isActive: true,
        bannerType: { not: "announcement" },
        ...sellerCondition,
        ...categoryCondition,
      },
      orderBy: [{ sellerId: "asc" }, { createdAt: "asc" }],
    });

    res.status(200).json({
      success: true,
      banners: interleaveBanners(filteredBanners),
    });
  } catch (error) {
    console.error("[getActiveBanners] ❌ Error fetching banners:", error);
    next(error);
  }
};

export const getAnnouncementBanners = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { city, storeId, pincode } = req.query;

    // Announcement banners are seller-specific — require a location to show
    if (!city && !storeId && !pincode) {
      return res.status(200).json({ success: true, banners: [] });
    }

    // Serve from cache when available (2 min TTL)
    const cacheKey = announcementCacheKey(
      storeId ? String(storeId) : undefined,
      city ? String(city) : undefined,
      pincode ? String(pincode) : undefined,
    );
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return res.status(200).json(JSON.parse(cached));
    } catch {}

    // Build where clause for announcement banners
    const baseWhere: Record<string, any> = {
      isActive: true,
      status: "APPROVED",
      bannerType: "announcement",
    };

    // Find sellers whose stores serve the user's location
    const storeWhere: Record<string, any> = {};
    if (storeId) storeWhere.id = String(storeId);
    if (city) storeWhere.availableCities = { has: String(city) };
    if (pincode && !storeId) {
      storeWhere.OR = [
        { pincode: String(pincode) },
        { availableCities: { has: String(pincode) } },
      ];
    }

    const stores = await (prisma as any).stores.findMany({
      where: storeWhere,
      select: { sellerId: true },
    });

    const sellerIds = stores.map((s: any) => s.sellerId).filter(Boolean);
    if (sellerIds.length === 0) {
      return res.status(200).json({ success: true, banners: [] });
    }
    baseWhere.sellerId = { in: sellerIds };

    const banners = await prisma.banners.findMany({
      where: baseWhere,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            store: { select: { id: true, name: true, availableCities: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const payload = { success: true, banners };
    redis.setex(cacheKey, ANNOUNCEMENT_CACHE_TTL, JSON.stringify(payload)).catch(() => {});
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};
