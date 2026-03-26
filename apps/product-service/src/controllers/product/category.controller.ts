import { Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { AuthRequest, getCategoryConfigKey } from "./utils.js";
import { categorySchema, subCategorySchema, validate } from "@repo/zod-schema";

export const getCategories = async (
  _req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return res.status(200).json({
        success: true,
        categories: [],
        subCategories: {},
        categoryImages: {},
      });
    }
    const subCategories =
      config.subCategories && typeof config.subCategories === "object"
        ? (config.subCategories as Record<string, string[]>)
        : {};
    const categoryImages =
      config.categoryImages && typeof config.categoryImages === "object"
        ? (config.categoryImages as Record<string, string>)
        : {};
    const transformedSubCategories: Record<string, string[]> = {};
    if (Array.isArray(config.categories)) {
      config.categories.forEach((cat) => {
        const key = getCategoryConfigKey(cat);
        transformedSubCategories[key] = subCategories[cat] || [];
      });
    }
    return res.status(200).json({
      success: true,
      categories: config.categories,
      subCategories: transformedSubCategories,
      categoryImages,
    });
  } catch (error) {
    return next(error);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, imageUrl } = validate(categorySchema, req.body);
    const categoryName = name.trim();
    let config = await prisma.site_config.findFirst();
    if (!config) {
      config = await prisma.site_config.create({
        data: {
          categories: [],
          subCategories: {},
          categoryImages: {},
        },
      });
    }
    const categories = Array.isArray(config.categories)
      ? [...config.categories]
      : [];
    const subCategories =
      config.subCategories && typeof config.subCategories === "object"
        ? { ...(config.subCategories as Record<string, string[]>) }
        : {};
    const categoryImages =
      config.categoryImages && typeof config.categoryImages === "object"
        ? { ...(config.categoryImages as Record<string, string>) }
        : {};
    if (
      categories.some(
        (category) => category.toLowerCase() === categoryName.toLowerCase(),
      )
    ) {
      return next(new ValidationError("Category already exists"));
    }
    categories.push(categoryName);
    subCategories[categoryName] = [];
    if (imageUrl && typeof imageUrl === "string") {
      categoryImages[categoryName] = imageUrl;
    }
    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        categories,
        subCategories,
        categoryImages,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      config: updatedConfig,
    });
  } catch (error) {
    return next(error);
  }
};

export const createSubCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, name } = validate(subCategorySchema, req.body);
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return next(new NotFoundError("Site config not found"));
    }
    const categoryName = category.trim();
    const subCategoryName = name.trim();
    const categories = Array.isArray(config.categories)
      ? [...config.categories]
      : [];
    if (
      !categories.some(
        (existingCategory) =>
          existingCategory.toLowerCase() === categoryName.toLowerCase(),
      )
    ) {
      return next(new ValidationError("Selected category does not exist"));
    }
    const subCategories =
      config.subCategories && typeof config.subCategories === "object"
        ? { ...(config.subCategories as Record<string, string[]>) }
        : {};
    const categorySubCategories = subCategories[categoryName] || [];
    if (
      categorySubCategories.some(
        (sub) => sub.toLowerCase() === subCategoryName.toLowerCase(),
      )
    ) {
      return next(new ValidationError("Subcategory already exists"));
    }
    subCategories[categoryName] = [...categorySubCategories, subCategoryName];
    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        subCategories,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      config: updatedConfig,
    });
  } catch (error) {
    return next(error);
  }
};
