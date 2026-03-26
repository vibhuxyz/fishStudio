import { Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { AuthRequest, getSellerDiscountOwnerData, getRequiredParam } from "./utils.js";

export const createDiscountCodes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      public_name,
      discountType,
      discountValue,
      discountCode,
      minOrderValue,
    } = req.body;
    if (!public_name || !discountType || !discountValue || !discountCode) {
      return next(new ValidationError("All fields are required"));
    }
    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });
    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          "Discount code already exist!  please use a different code! ",
        ),
      );
    }
    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
        ...getSellerDiscountOwnerData(req),
      },
    });
    res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiscountCodes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const discount_codes =
      req.role === "admin"
        ? await prisma.discount_codes.findMany({
            orderBy: {
              createdAt: "desc",
            },
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          })
        : await prisma.discount_codes.findMany({
            where: getSellerDiscountOwnerData(req),
            orderBy: {
              createdAt: "desc",
            },
          });
    res.status(201).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDiscountCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getRequiredParam(req.params.id, "Discount code id");
    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true, adminId: true },
    });
    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }
    const hasAccess =
      req.role === "admin" ||
      (req.role === "seller" && discountCode.sellerId === req.seller?.id);
    if (!hasAccess) {
      return next(new ValidationError("Unauthorized access"));
    }
    await prisma.discount_codes.delete({ where: { id } });
    res.status(201).json({
      success: true,
      message: "Discount code deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};
