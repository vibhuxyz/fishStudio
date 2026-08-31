import { Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { redis } from "@repo/libs/redis";
import { cached as cachedRead } from "@repo/libs/cache";
import { logger } from "@repo/libs/logger";
import { AuthRequest, getCategoryConfigKey } from "./utils.js";
import {
  categorySchema,
  deleteCategorySchema,
  subCategorySchema,
  updateCategorySchema,
  updateSubCategorySchema,
  validate,
} from "@repo/zod-schema";

const subCategoryStatusKey = (category: string, subCategory: string) =>
  `${category}::${subCategory}`;

const SITE_CONFIG_CACHE_KEY = "site_config:v1";
const SITE_CONFIG_TTL = 600; // 10 minutes

// Read and write of this key now go through `cachedRead` in getCategories,
// which stores its own envelope format — a hand-rolled get/set here would
// write a shape it can't read back.
// Must be awaited before the write responds. Fire-and-forget raced the admin
// UI's refetch, which invalidates its React Query cache the moment the mutation
// resolves — the refetch could reach getCategories before the DEL landed and
// re-populate Redis with the pre-edit document, so a changed category image
// appeared not to save until the 10-minute TTL lapsed.
const invalidateSiteConfigCache = async () => {
  try {
    await redis.del(SITE_CONFIG_CACHE_KEY);
  } catch (err) {
    // A stale category list self-heals at the TTL, so this must not fail the
    // write that already committed — but it is never silent.
    logger.error("[category] failed to invalidate site config cache", { err });
  }
};

// Storefront callers pass ?activeOnly=true to hide inactive categories/subcategories;
// admin tooling omits it so it can still see and re-enable them.
const applyActiveOnlyFilter = (payload: {
  success: boolean;
  categories: string[];
  subCategories: Record<string, string[]>;
  categoryImages: Record<string, string>;
  categoryStatus: Record<string, boolean>;
  subCategoryStatus: Record<string, boolean>;
}) => {
  const activeCategories = payload.categories.filter(
    (cat) => payload.categoryStatus[cat] ?? true,
  );
  const subCategories: Record<string, string[]> = {};
  for (const cat of activeCategories) {
    const key = getCategoryConfigKey(cat);
    const subs = payload.subCategories[key] || [];
    subCategories[key] = subs.filter(
      (sub) => payload.subCategoryStatus[`${cat}::${sub}`] ?? true,
    );
  }
  return {
    ...payload,
    categories: activeCategories,
    subCategories,
  };
};

export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const activeOnly = req.query.activeOnly === "true";

    // Single-flight: the category list is read on nearly every page, so an
    // expiry used to send every concurrent request to Mongo at once. activeOnly
    // is applied after the cache, not inside it, so both variants share one
    // cached document instead of doubling the keys.
    const payload = await cachedRead(SITE_CONFIG_CACHE_KEY, async () => {
      const config = await prisma.site_config.findFirst();
      if (!config) {
        return {
          success: true as const,
          categories: [],
          subCategories: {},
          categoryImages: {},
          categoryStatus: {},
          subCategoryStatus: {},
        };
      }
      const subCategories =
        config.subCategories && typeof config.subCategories === "object"
          ? (config.subCategories as Record<string, string[]>)
          : {};
      const categoryImages =
        config.categoryImages && typeof config.categoryImages === "object"
          ? (config.categoryImages as Record<string, string>)
          : {};
      const categoryStatus =
        config.categoryStatus && typeof config.categoryStatus === "object"
          ? (config.categoryStatus as Record<string, boolean>)
          : {};
      const subCategoryStatus =
        config.subCategoryStatus && typeof config.subCategoryStatus === "object"
          ? (config.subCategoryStatus as Record<string, boolean>)
          : {};
      const transformedSubCategories: Record<string, string[]> = {};
      if (Array.isArray(config.categories)) {
        config.categories.forEach((cat) => {
          const key = getCategoryConfigKey(cat);
          transformedSubCategories[key] = subCategories[cat] || [];
        });
      }
      return {
        success: true as const,
        categories: config.categories,
        subCategories: transformedSubCategories,
        categoryImages,
        categoryStatus,
        subCategoryStatus,
      };
    }, { ttlSeconds: SITE_CONFIG_TTL });

    return res
      .status(200)
      .json(activeOnly ? applyActiveOnlyFilter(payload) : payload);
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
    await invalidateSiteConfigCache();
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
    await invalidateSiteConfigCache();
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
    await invalidateSiteConfigCache();
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
    await invalidateSiteConfigCache();
    return res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
      config: updatedConfig,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, newName, imageUrl, isActive } = validate(
      updateCategorySchema,
      req.body,
    );
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return next(new NotFoundError("Site config not found"));
    }
    const categories = Array.isArray(config.categories)
      ? [...config.categories]
      : [];
    const storedCategory = categories.find(
      (category) => category.toLowerCase() === name.trim().toLowerCase(),
    );
    if (!storedCategory) {
      return next(new NotFoundError("Category not found"));
    }
    const subCategories =
      config.subCategories && typeof config.subCategories === "object"
        ? { ...(config.subCategories as Record<string, string[]>) }
        : {};
    const categoryImages =
      config.categoryImages && typeof config.categoryImages === "object"
        ? { ...(config.categoryImages as Record<string, string>) }
        : {};
    const categoryStatus =
      config.categoryStatus && typeof config.categoryStatus === "object"
        ? { ...(config.categoryStatus as Record<string, boolean>) }
        : {};
    const subCategoryStatus =
      config.subCategoryStatus && typeof config.subCategoryStatus === "object"
        ? { ...(config.subCategoryStatus as Record<string, boolean>) }
        : {};

    let finalName = storedCategory;
    const trimmedNewName = newName?.trim();
    if (trimmedNewName && trimmedNewName.toLowerCase() !== storedCategory.toLowerCase()) {
      if (
        categories.some(
          (category) =>
            category.toLowerCase() === trimmedNewName.toLowerCase() &&
            category !== storedCategory,
        )
      ) {
        return next(new ValidationError("A category with that name already exists"));
      }
      finalName = trimmedNewName;

      const categoryIndex = categories.indexOf(storedCategory);
      categories[categoryIndex] = finalName;

      subCategories[finalName] = subCategories[storedCategory] || [];
      delete subCategories[storedCategory];

      if (storedCategory in categoryImages) {
        categoryImages[finalName] = categoryImages[storedCategory]!;
        delete categoryImages[storedCategory];
      }
      if (storedCategory in categoryStatus) {
        categoryStatus[finalName] = categoryStatus[storedCategory]!;
        delete categoryStatus[storedCategory];
      }
      const oldPrefix = subCategoryStatusKey(storedCategory, "");
      for (const key of Object.keys(subCategoryStatus)) {
        if (key.startsWith(oldPrefix)) {
          const subName = key.slice(oldPrefix.length);
          subCategoryStatus[subCategoryStatusKey(finalName, subName)] =
            subCategoryStatus[key]!;
          delete subCategoryStatus[key];
        }
      }

      // Products carry category as a plain string, not a reference — the
      // rename has to cascade or every product using it becomes unreachable
      // from category browse.
      await prisma.products.updateMany({
        where: { category: storedCategory },
        data: { category: finalName },
      });
    }

    if (typeof imageUrl === "string") {
      if (imageUrl.trim()) {
        categoryImages[finalName] = imageUrl.trim();
      } else {
        delete categoryImages[finalName];
      }
    }

    if (typeof isActive === "boolean") {
      categoryStatus[finalName] = isActive;
    }

    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        categories,
        subCategories,
        categoryImages,
        categoryStatus,
        subCategoryStatus,
      },
    });
    await invalidateSiteConfigCache();
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      config: updatedConfig,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSubCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, name, newName, isActive } = validate(
      updateSubCategorySchema,
      req.body,
    );
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
    const categorySubCategories = [...(subCategories[storedCategory] || [])];
    const storedSubCategory = categorySubCategories.find(
      (sub) => sub.toLowerCase() === name.trim().toLowerCase(),
    );
    if (!storedSubCategory) {
      return next(new NotFoundError("Subcategory not found"));
    }
    const subCategoryStatus =
      config.subCategoryStatus && typeof config.subCategoryStatus === "object"
        ? { ...(config.subCategoryStatus as Record<string, boolean>) }
        : {};

    let finalName = storedSubCategory;
    const trimmedNewName = newName?.trim();
    if (trimmedNewName && trimmedNewName.toLowerCase() !== storedSubCategory.toLowerCase()) {
      if (
        categorySubCategories.some(
          (sub) =>
            sub.toLowerCase() === trimmedNewName.toLowerCase() &&
            sub !== storedSubCategory,
        )
      ) {
        return next(
          new ValidationError("A subcategory with that name already exists"),
        );
      }
      finalName = trimmedNewName;

      const subIndex = categorySubCategories.indexOf(storedSubCategory);
      categorySubCategories[subIndex] = finalName;
      subCategories[storedCategory] = categorySubCategories;

      const oldKey = subCategoryStatusKey(storedCategory, storedSubCategory);
      if (oldKey in subCategoryStatus) {
        subCategoryStatus[subCategoryStatusKey(storedCategory, finalName)] =
          subCategoryStatus[oldKey]!;
        delete subCategoryStatus[oldKey];
      }

      await prisma.products.updateMany({
        where: { category: storedCategory, subCategory: storedSubCategory },
        data: { subCategory: finalName },
      });
    }

    if (typeof isActive === "boolean") {
      subCategoryStatus[subCategoryStatusKey(storedCategory, finalName)] = isActive;
    }

    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        subCategories,
        subCategoryStatus,
      },
    });
    await invalidateSiteConfigCache();
    return res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      config: updatedConfig,
    });
  } catch (error) {
    return next(error);
  }
};
