import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { imagekit } from "@repo/libs/imagekit/index";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({
        message: "Categories not found!",
      });
    }

    return res.status(200).json({
      success: true,
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// Create Discount Code
export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

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
        sellerId: req.seller.id,
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
//get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
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

//delete discount code

export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }

    if (discountCode.sellerId !== sellerId) {
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

//upload product image
export const uploadProductImage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return next(new ValidationError("File name is required"));
    }

    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });

    res.status(201).json({
      file_url: response.url,
      fileName: response.fileId,
    });
  } catch (error) {
    next(error);
  }
};

//delete product image
export const deleteProductImage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return next(new ValidationError("File id is required"));
    }

    const response = await imagekit.deleteFile(fileId);

    res.status(201).json({
      success: true,
      message: "Product image deleted successfully!",
      response,
    });
  } catch (error) {
    next(error);
  }
};

//create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      casn_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      size = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = [],
      images = [],
    } = req.body;

    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !tags ||
      !images ||
      !regular_price ||
      !stock ||
      !detailed_description
    ) {
      return next(new ValidationError("Midding required fields!"));
    }
    if (!req.seller.id) {
      return next(new ValidationError("Only seller can create products!"));
    }

    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      },
    });

    if (slugChecking) {
      return next(
        new ValidationError(
          "Slug already exists! Please use a different slug!",
        ),
      );
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: casn_on_delivery,
        slug,
        storeId: req.sellers?.store?.id,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: discountCodes.map((codeId: String) => codeId),
        sizes: size || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: customProperties || {},
        custom_specifications: custom_specifications || {},
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      newProduct,
    });
  } catch (error) {}
};

//get logged in seller products
export const getStoreProducts = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        storeId: req.sellers?.store?.id,
      },
      include: {
        images: true,
      },
    });
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

//delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.store?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, storeId: true, isDeleted: true },
    });
    if (!product) {
      return next(new NotFoundError("Product not found!"));
    }
    if (product.storeId !== sellerId) {
      return next(
        new ValidationError("You are not authorized to delete this product!"),
      );
    }
    if (product.isDeleted) {
      return next(new ValidationError("Product is not deleted!"));
    }
    const deleteProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    return res.status(200).json({
      message:
        "Product is scheduled for deletion in 24 hours.You can restore it within this time.",
      deletedAt: deleteProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

//restore product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.is;
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, storeId: true, isDeleted: true },
    });
    if (!product) {
      return next(new NotFoundError("Product not found!"));
    }
    if (product.storeId !== sellerId) {
      return next(
        new ValidationError("You are not authorized to restore this product!"),
      );
    }
    if (!product.isDeleted) {
      return res.status(400).json({
        message: "Product is not in deleted state!",
      });
    }
    const restoreProduct = await prisma.products.update({
      where: { id: productId },
      data: { isDeleted: false, deletedAt: null },
    });
    return res.status(200).json({
      message: "Product is restored successfully!",
      restoreProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Eror restoring product",
      error,
    });
  }
};
