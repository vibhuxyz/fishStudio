import { Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { redis } from "@repo/libs/redis";
import { AuthRequest, getCategoryConfigKey } from "./utils.js";
import {
  categorySchema,
  deleteCategorySchema,
  subCategorySchema,
  validate,
} from "@repo/zod-schema";

const SITE_CONFIG_CACHE_KEY = "site_config:v1";
const SITE_CONFIG_TTL = 600; // 10 minutes

const getSiteConfigCached = async () => {
  try {
    const cached = await redis.get(SITE_CONFIG_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return null;
};

const setSiteConfigCache = (data: unknown) => {
  redis
    .setex(SITE_CONFIG_CACHE_KEY, SITE_CONFIG_TTL, JSON.stringify(data))
    .catch(() => {});
};

const invalidateSiteConfigCache = () => {
  redis.del(SITE_CONFIG_CACHE_KEY).catch(() => {});
};

export const getCategories = async (
  _req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Serve from Redis cache when available (10 min TTL)
    const cached = await getSiteConfigCached();
    if (cached) {
      return res.status(200).json(cached);
    }

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
    const payload = {
      success: true,
      categories: config.categories,
      subCategories: transformedSubCategories,
      categoryImages,
    };
    setSiteConfigCache(payload);
    return res.status(200).json(payload);
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
    invalidateSiteConfigCache();
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
    invalidateSiteConfigCache();
    return res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      config: updatedConfig,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = validate(deleteCategorySchema, req.body);
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return next(new NotFoundError("Site config not found"));
    }
    const categories = Array.isArray(config.categories)
      ? [...config.categories]
      : [];
    // Match on the stored spelling so the config keys below line up — the client
    // may send a different casing than what was originally created.
    const storedCategory = categories.find(
      (category) => category.toLowerCase() === name.trim().toLowerCase(),
    );
    if (!storedCategory) {
      return next(new NotFoundError("Category not found"));
    }
    // Products carry the category as a plain string, so dropping it from the
    // config would leave them live but unreachable from category browse.
    const productCount = await prisma.products.count({
      where: { category: storedCategory, isDeleted: false },
    });
    if (productCount > 0) {
      return next(
        new ValidationError(
          `Cannot delete "${storedCategory}" — ${productCount} product(s) still use it`,
        ),
      );
    }
    const subCategories =
      config.subCategories && typeof config.subCategories === "object"
        ? { ...(config.subCategories as Record<string, string[]>) }
        : {};
    const categoryImages =
      config.categoryImages && typeof config.categoryImages === "object"
        ? { ...(config.categoryImages as Record<string, string>) }
        : {};
    delete subCategories[storedCategory];
    delete categoryImages[storedCategory];
    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        categories: categories.filter((category) => category !== storedCategory),
        subCategories,
        categoryImages,
      },
    });
    invalidateSiteConfigCache();
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      config: updatedConfig,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteSubCategory = async (
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
    const categories = Array.isArray(config.categories)
      ? [...config.categories]
      : [];
    const storedCategory = categories.find(
      (existingCategory) =>
        existingCategory.toLowerCase() === category.trim().toLowerCase(),
    );
    if (!storedCategory) {
      return next(new ValidationError("Selected category does not exist"));
    }
    const subCategories =
      config.subCategories && typeof config.subCategories === "object"
        ? { ...(config.subCategories as Record<string, string[]>) }
        : {};
    const categorySubCategories = subCategories[storedCategory] || [];
    const storedSubCategory = categorySubCategories.find(
      (sub) => sub.toLowerCase() === name.trim().toLowerCase(),
    );
    if (!storedSubCategory) {
      return next(new NotFoundError("Subcategory not found"));
    }
    const productCount = await prisma.products.count({
      where: {
        category: storedCategory,
        subCategory: storedSubCategory,
        isDeleted: false,
      },
    });
    if (productCount > 0) {
      return next(
        new ValidationError(
          `Cannot delete "${storedSubCategory}" — ${productCount} product(s) still use it`,
        ),
      );
    }
    subCategories[storedCategory] = categorySubCategories.filter(
      (sub) => sub !== storedSubCategory,
    );
    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        subCategories,
      },
    });
    invalidateSiteConfigCache();
    return res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
      config: updatedConfig,
    });
  } catch (error) {
    return next(error);
  }
};
