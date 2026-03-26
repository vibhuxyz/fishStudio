import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { cloudinary } from "@repo/libs";
import { ENV } from "@repo/env-config";
import { AuthRequest, getRequiredParam, interleaveBanners } from "./utils.js";

export const uploadBanner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName, images, category } = req.body;
    const sellerId = req.seller?.id;
    const adminId = req.admin?.id;
    const imageList = Array.isArray(images)
      ? images
      : fileName
        ? [fileName]
        : [];
    if (imageList.length === 0) {
      return next(new ValidationError("Banner image data is required"));
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
      if (existingBannerCount + imageList.length > 3) {
        return next(
          new ValidationError(
            `A seller can upload a maximum of 3 banners per category. You already have ${existingBannerCount} for ${category}.`,
          ),
        );
      }
    }
    const createdBanners = [];
    for (const img of imageList) {
      const baseFolder = `${ENV.CLOUDINARY_FOLDER || "fishStudio-app"}/banners`;
      const cloudFolder = category 
        ? `${baseFolder}/category/${category}/images` 
        : `${baseFolder}/homepage`;
      const response = await cloudinary.uploader.upload(img, {
        folder: cloudFolder,
        resource_type: "auto",
        quality: "auto:good",
        fetch_format: "auto",
        transformation: [{ width: 1600, crop: "limit" }],
      });
      const newBanner = await prisma.banners.create({
        data: {
          imageUrl: response.secure_url,
          fileId: response.public_id,
          category: category || null,
          sellerId: sellerId || undefined,
          adminId: adminId || undefined,
          status: adminId ? "APPROVED" : "PENDING",
          isActive: adminId ? true : false,
        },
      });
      createdBanners.push(newBanner);
    }
    res.status(201).json({
      success: true,
      data: createdBanners.length === 1 ? createdBanners[0] : createdBanners,
    });
  } catch (error) {
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
    const { fileName, isActive } = req.body;
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
        category: { not: null },
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
    const { bannerId, action } = req.body;
    if (!bannerId || !action) {
      return next(new ValidationError("Banner ID and action are required"));
    }
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
    const { category } = req.query;
    const banners = await prisma.banners.findMany({
      where: {
        isActive: true,
        status: "APPROVED",
        category: category ? String(category) : null,
      },
      orderBy: [{ sellerId: "asc" }, { createdAt: "asc" }],
    });
    res.status(200).json({
      success: true,
      banners: interleaveBanners(banners),
    });
  } catch (error) {
    next(error);
  }
};
