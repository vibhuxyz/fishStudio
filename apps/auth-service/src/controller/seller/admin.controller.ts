import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { ValidationError } from "@repo/error-handlers";
import { updateSellerApprovalSchema, validate } from "@repo/zod-schema";
import { publishToQueue } from "@repo/libs";

export const getAllSellersForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellers = await prisma.sellers.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        store: {
          include: {
            products: {
              include: {
                images: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
        coupons: true,
        banners: true,
      },
    });

    return res.status(200).json({
      success: true,
      sellers: sellers.map((seller) => ({
        ...seller,
        totalProducts: seller.store?.products.length ?? 0,
        totalCoupons: seller.coupons.length,
        totalBanners: seller.banners.length,
        isApprovedByAdmin: seller.isApprovedByAdmin,
        permissions: seller.permissions,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerDetailsForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId =
      typeof req.params.sellerId === "string" ? req.params.sellerId : "";

    if (!sellerId) {
      return next(new ValidationError("Seller id is required"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: {
        store: {
          include: {
            products: {
              include: {
                images: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
        coupons: {
          orderBy: {
            createdAt: "desc",
          },
        },
        banners: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    return res.status(200).json({
      success: true,
      seller: {
        ...seller,
        totalProducts: seller.store?.products.length ?? 0,
        totalCoupons: seller.coupons.length,
        totalBanners: seller.banners.length,
        isApprovedByAdmin: seller.isApprovedByAdmin,
        permissions: seller.permissions,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSellerApproval = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.params.sellerId as string;
    const { isApprovedByAdmin, permissions } = validate(updateSellerApprovalSchema, req.body);

    if (!sellerId) return next(new ValidationError("Seller id is required"));

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
    if (!seller) return next(new ValidationError("Seller not found"));

    const updatedSeller = await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        isApprovedByAdmin: isApprovedByAdmin !== undefined ? isApprovedByAdmin : seller.isApprovedByAdmin,
        permissions: permissions !== undefined ? permissions : seller.permissions,
      },
    });

    /* ── Notify Seller ── */
    try {
      if (isApprovedByAdmin === true && seller.isApprovedByAdmin !== true) {
        await publishToQueue("NOTIFICATION_QUEUE", {
          userId: sellerId,
          title: "Account Approved",
          message: "Congratulations! Your seller account has been approved by the admin. You can now start managing your store.",
          type: "SUCCESS",
          category: "SYSTEM",
          channels: ["IN_APP", "EMAIL", "SMS"],
        });
      } else if (permissions !== undefined) {
         await publishToQueue("NOTIFICATION_QUEUE", {
          userId: sellerId,
          title: "Permissions Updated",
          message: "Your seller permissions have been updated by the admin.",
          type: "INFO",
          category: "SYSTEM",
          channels: ["IN_APP"],
        });
      }
    } catch (notifyErr) {
      console.error("Failed to notify seller of approval/permission update:", notifyErr);
    }

    return res.status(200).json({
      success: true,
      message: "Seller approval and permissions updated",
      seller: updatedSeller,
    });
  } catch (error) {
    return next(error);
  }
};
