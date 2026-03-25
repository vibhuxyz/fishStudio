import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { imagekit, cloudinary } from "@repo/libs";
import { ENV } from "@repo/env-config";

interface AuthRequest extends Request {
  role?: "admin" | "seller" | "user";
  admin?: {
    id: string;
  };
  seller?: {
    id: string;
    store?: {
      id: string;
      name?: string;
    } | null;
  };
}

const getSellerDiscountOwnerData = (req: AuthRequest) => {
  if (req.role === "seller" && req.seller?.id) {
    return { sellerId: req.seller.id };
  }

  throw new ValidationError("Only seller can manage discount codes!");
};

const getOwnedProductFilter = (req: AuthRequest) => {
  if (req.role === "admin" && req.admin?.id) {
    return { adminId: req.admin.id, isDeleted: false };
  }

  if (req.role === "seller" && req.seller?.store?.id) {
    return { storeId: req.seller.store.id, isDeleted: false };
  }

  throw new ValidationError("Only admin or seller can manage products!");
};

const getSellerStore = (req: AuthRequest) => {
  if (req.role === "seller" && req.seller?.store?.id) {
    return req.seller.store;
  }

  throw new ValidationError("Seller store is required");
};

const interleaveBanners = <
  T extends {
    sellerId?: string | null;
    adminId?: string | null;
  },
>(
  items: T[],
) => {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = item.sellerId || item.adminId || "admin-global";
    const memberItems = grouped.get(key) ?? [];
    memberItems.push(item);
    grouped.set(key, memberItems);
  }

  const groupedArrays = Array.from(grouped.values());
  const maxLength = groupedArrays.reduce(
    (longest, sellerItems) => Math.max(longest, sellerItems.length),
    0,
  );

  const interleaved: T[] = [];

  for (let index = 0; index < maxLength; index++) {
    for (const sellerItems of groupedArrays) {
      const item = sellerItems[index];
      if (item) {
        interleaved.push(item);
      }
    }
  }

  return interleaved;
};

const isEventLive = (startTime: Date, endTime: Date) => {
  const now = Date.now();
  return startTime.getTime() <= now && endTime.getTime() >= now;
};

const mapProductWithActiveEvents = (product: any) => {
  const sellerEvents =
    product?.store?.seller?.events && Array.isArray(product.store.seller.events)
      ? product.store.seller.events.filter((event: any) =>
          isEventLive(new Date(event.startTime), new Date(event.endTime)),
        )
      : [];

  return {
    ...product,
    activeEvents: sellerEvents,
  };
};

const isCatalogRootProduct = (
  product:
    | {
        adminId?: string | null;
        storeId?: string | null;
        catalogProductId?: string | null;
        isDeleted?: boolean | null;
      }
    | null
    | undefined,
) => {
  if (!product) return false;

  return (
    Boolean(product.adminId) &&
    !product.storeId &&
    !product.catalogProductId &&
    product.isDeleted !== true
  );
};

const normalizeDynamicValues = (items: unknown) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "value" in item) {
        return String((item as { value: unknown }).value ?? "");
      }
      return "";
    })
    .map((item) => item.trim())
    .filter(Boolean);
};

type NormalizedSizePricing = {
  size: string;
  weightGrams: number;
  salePrice: number;
  regularPrice: number;
};

const parseWeightToGrams = (value: string) => {
  const normalized = value.toLowerCase();
  const matches = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)/g);

  if (!matches || matches.length === 0) {
    return 0;
  }

  const firstMatch = matches[0]?.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)/);
  if (!firstMatch) {
    return 0;
  }

  const amount = Number(firstMatch[1]);
  const unit = firstMatch[2];

  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return unit === "kg" ? Math.round(amount * 1000) : Math.round(amount);
};

const normalizeSizePricing = (
  value: unknown,
  allowedSizes: string[],
  fallbackSalePrice = 0,
  fallbackRegularPrice = 0,
): NormalizedSizePricing[] => {
  const allowedSizeSet = new Set(allowedSizes.filter(Boolean));

  if (!Array.isArray(value)) {
    return allowedSizes.map((size) => ({
      size,
      weightGrams: parseWeightToGrams(size),
      salePrice: Number(fallbackSalePrice || 0),
      regularPrice: Number(fallbackRegularPrice || fallbackSalePrice || 0),
    }));
  }

  const normalized = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const size = String((entry as Record<string, unknown>).size ?? "").trim();
      if (!size || !allowedSizeSet.has(size)) {
        return null;
      }

      const rawSalePrice =
        (entry as Record<string, unknown>).salePrice ??
        (entry as Record<string, unknown>).sale_price;
      const rawRegularPrice =
        (entry as Record<string, unknown>).regularPrice ??
        (entry as Record<string, unknown>).regular_price;
      const rawWeightGrams =
        (entry as Record<string, unknown>).weightGrams ??
        (entry as Record<string, unknown>).weight_grams;

      const salePrice = Number(rawSalePrice ?? fallbackSalePrice ?? 0);
      const regularPrice = Number(
        rawRegularPrice ??
          rawSalePrice ??
          fallbackRegularPrice ??
          fallbackSalePrice ??
          0,
      );
      const weightGrams = Number(
        rawWeightGrams ?? parseWeightToGrams(size) ?? 0,
      );

      return {
        size,
        salePrice: Number.isFinite(salePrice) ? salePrice : 0,
        regularPrice: Number.isFinite(regularPrice) ? regularPrice : 0,
        weightGrams:
          Number.isFinite(weightGrams) && weightGrams > 0
            ? Math.round(weightGrams)
            : parseWeightToGrams(size),
      };
    })
    .filter((entry): entry is NormalizedSizePricing => Boolean(entry));

  if (normalized.length > 0) {
    return allowedSizes.map((size) => {
      const matching = normalized.find((entry) => entry.size === size);
      return (
        matching ?? {
          size,
          weightGrams: parseWeightToGrams(size),
          salePrice: Number(fallbackSalePrice || 0),
          regularPrice: Number(fallbackRegularPrice || fallbackSalePrice || 0),
        }
      );
    });
  }

  return allowedSizes.map((size) => ({
    size,
    weightGrams: parseWeightToGrams(size),
    salePrice: Number(fallbackSalePrice || 0),
    regularPrice: Number(fallbackRegularPrice || fallbackSalePrice || 0),
  }));
};

const getDisplayPricesFromSizePricing = (
  sizePricing: NormalizedSizePricing[],
) => {
  if (sizePricing.length === 0) {
    return {
      salePrice: 0,
      regularPrice: 0,
    };
  }

  const cheapestEntry = sizePricing.reduce((lowest, entry) =>
    entry.salePrice < lowest.salePrice ? entry : lowest,
  );

  return {
    salePrice: cheapestEntry.salePrice,
    regularPrice:
      cheapestEntry.regularPrice > 0
        ? cheapestEntry.regularPrice
        : cheapestEntry.salePrice,
  };
};

const normalizeCuttingTypePricing = (
  value: unknown,
  allowedTypes: string[],
): { cuttingType: string; salePrice: number; regularPrice: number }[] => {
  if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) return [];

  const incoming = Array.isArray(value) ? value : [];
  const map = new Map(
    incoming.map((entry: any) => [entry?.cuttingType, entry]),
  );

  return allowedTypes.map((cuttingType) => {
    const entry = map.get(cuttingType);
    return {
      cuttingType,
      salePrice: Number(entry?.salePrice ?? 0),
      regularPrice: Number(entry?.regularPrice ?? 0),
    };
  });
};

const normalizePieceSizePricing = (
  value: unknown,
  allowedPieceSizes: string[],
): { pieceSize: string; salePrice: number; regularPrice: number }[] => {
  if (!Array.isArray(allowedPieceSizes) || allowedPieceSizes.length === 0) return [];

  const incoming = Array.isArray(value) ? value : [];
  const map = new Map(
    incoming.map((entry: any) => [entry?.pieceSize, entry]),
  );

  return allowedPieceSizes.map((pieceSize) => {
    const entry = map.get(pieceSize);
    return {
      pieceSize,
      salePrice: Number(entry?.salePrice ?? 0),
      regularPrice: Number(entry?.regularPrice ?? 0),
    };
  });
};

const getRequiredParam = (
  value: string | string[] | undefined,
  label: string,
) => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  throw new ValidationError(`${label} is required`);
};

const buildUniqueSlug = async (
  baseSlug: string,
  suffix?: string,
  excludeId?: string,
) => {
  const normalizedBase = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);

  const slugBase = suffix ? `${normalizedBase}-${suffix}` : normalizedBase;
  let uniqueSlug = slugBase.substring(0, 60);
  let counter = 1;

  while (
    await prisma.products.findFirst({
      where: {
        slug: uniqueSlug,
        ...(excludeId
          ? {
              NOT: {
                id: excludeId,
              },
            }
          : {}),
      },
      select: { id: true },
    })
  ) {
    uniqueSlug = `${slugBase}-${counter}`.substring(0, 60);
    counter++;
  }

  return uniqueSlug;
};

const getCategoryConfigKey = (category: string) =>
  category
    .trim()
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((segment, index) =>
      index === 0
        ? segment.toLowerCase()
        : `${segment.charAt(0).toUpperCase()}${segment.slice(1).toLowerCase()}`,
    )
    .join("");

export const slugValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { slug } = req.body;

    if (!slug || typeof slug !== "string") {
      return next(
        new ValidationError("Slug is required and must be a string."),
      );
    }

    // Slugify manually (no slugify lib)
    slug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50); // cap to 50 chars

    let uniqueSlug = slug;
    let counter = 1;

    while (
      await prisma.products.findUnique({
        where: { slug: uniqueSlug },
      })
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return res.status(200).json({
      available: uniqueSlug === slug,
      slug: uniqueSlug,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCategories = async (
  req: Request,
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
      });
    }

    const subCategories =
      config.subCategories && typeof config.subCategories === "object"
        ? (config.subCategories as Record<string, string[]>)
        : {};

    // Transform subCategories to use camelCase keys based on category names
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
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return next(new ValidationError("Category name is required"));
    }

    const categoryName = name.trim();
    const categoryKey = getCategoryConfigKey(categoryName);

    let config = await prisma.site_config.findFirst();

    if (!config) {
      config = await prisma.site_config.create({
        data: {
          categories: [],
          subCategories: {},
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

    if (
      categories.some(
        (category) => category.toLowerCase() === categoryName.toLowerCase(),
      )
    ) {
      return next(new ValidationError("Category already exists"));
    }

    categories.push(categoryName);
    subCategories[categoryName] = []; // Use display name as key for storage

    const updatedConfig = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        categories,
        subCategories,
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
    const { category, name } = req.body;

    if (!category || typeof category !== "string" || !category.trim()) {
      return next(new ValidationError("Category is required"));
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return next(new ValidationError("Subcategory name is required"));
    }

    const config = await prisma.site_config.findFirst();

    if (!config) {
      return next(new NotFoundError("Site config not found"));
    }

    const categoryName = category.trim();
    const subCategoryName = name.trim();
    const categoryKey = getCategoryConfigKey(categoryName);
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

    const categorySubCategories = subCategories[categoryName] || []; // Use display name as key

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

// Create Discount Code
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

//get discount codes
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

//delete discount code

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

export const createSellerEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "seller" || !req.seller?.id) {
      return next(new ValidationError("Only seller can create events!"));
    }

    const { title, description, type, minOrder, discount, startTime, endTime } =
      req.body;

    if (!title || !type || !startTime || !endTime) {
      return next(
        new ValidationError(
          "Title, type, start time, and end time are required.",
        ),
      );
    }

    if (!["FREE_DELIVERY", "DISCOUNT", "FLASH_SALE"].includes(type)) {
      return next(new ValidationError("Unsupported event type."));
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return next(new ValidationError("Invalid event date range."));
    }

    if (endDate <= startDate) {
      return next(new ValidationError("End time must be after start time."));
    }

    if (
      (type === "DISCOUNT" || type === "FLASH_SALE") &&
      (discount === undefined || discount === null || Number(discount) <= 0)
    ) {
      return next(
        new ValidationError("Discount amount is required for this event."),
      );
    }

    const event = await prisma.seller_events.create({
      data: {
        sellerId: req.seller.id,
        title: String(title).trim(),
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
        type,
        minOrder:
          minOrder === undefined || minOrder === null || minOrder === ""
            ? null
            : Number(minOrder),
        discount:
          discount === undefined || discount === null || discount === ""
            ? null
            : Number(discount),
        startTime: startDate,
        endTime: endDate,
      },
    });

    return res.status(201).json({
      success: true,
      event,
      message: "Seller event created successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerEvents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "seller" || !req.seller?.id) {
      return next(new ValidationError("Only seller can view events!"));
    }

    const events = await prisma.seller_events.findMany({
      where: {
        sellerId: req.seller.id,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSellerEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "seller" || !req.seller?.id) {
      return next(new ValidationError("Only seller can update events!"));
    }

    const eventId = getRequiredParam(req.params.eventId, "Event id");
    const existingEvent = await prisma.seller_events.findUnique({
      where: {
        id: eventId,
      },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!existingEvent) {
      return next(new NotFoundError("Event not found!"));
    }

    if (existingEvent.sellerId !== req.seller.id) {
      return next(
        new ValidationError("You are not authorized to update this event!"),
      );
    }

    const {
      title,
      description,
      type,
      minOrder,
      discount,
      startTime,
      endTime,
      isActive,
    } = req.body;

    const updateData: Record<string, unknown> = {};

    if (typeof title === "string" && title.trim()) {
      updateData.title = title.trim();
    }
    if (typeof description === "string") {
      updateData.description = description.trim() || null;
    }
    if (
      typeof type === "string" &&
      ["FREE_DELIVERY", "DISCOUNT", "FLASH_SALE"].includes(type)
    ) {
      updateData.type = type;
    }
    if (minOrder !== undefined) {
      updateData.minOrder =
        minOrder === null || minOrder === "" ? null : Number(minOrder);
    }
    if (discount !== undefined) {
      updateData.discount =
        discount === null || discount === "" ? null : Number(discount);
    }
    if (startTime) {
      const nextStart = new Date(startTime);
      if (Number.isNaN(nextStart.getTime())) {
        return next(new ValidationError("Invalid event start time."));
      }
      updateData.startTime = nextStart;
    }
    if (endTime) {
      const nextEnd = new Date(endTime);
      if (Number.isNaN(nextEnd.getTime())) {
        return next(new ValidationError("Invalid event end time."));
      }
      updateData.endTime = nextEnd;
    }
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    const updatedEvent = await prisma.seller_events.update({
      where: {
        id: eventId,
      },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      event: updatedEvent,
      message: "Event updated successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteSellerEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "seller" || !req.seller?.id) {
      return next(new ValidationError("Only seller can delete events!"));
    }

    const eventId = getRequiredParam(req.params.eventId, "Event id");

    const event = await prisma.seller_events.findUnique({
      where: {
        id: eventId,
      },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!event) {
      return next(new NotFoundError("Event not found!"));
    }

    if (event.sellerId !== req.seller.id) {
      return next(
        new ValidationError("You are not authorized to delete this event!"),
      );
    }

    await prisma.seller_events.delete({
      where: {
        id: eventId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

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
          status: { not: "REJECTED" }, // Active or pending
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
      let imageUrl, fileId;

      // Dynamic folder logic: homepage or category-specific
      const baseFolder = `${ENV.CLOUDINARY_FOLDER || "fishStudio-app"}/banners`;
      const cloudFolder = category 
        ? `${baseFolder}/category/${category}/images` 
        : `${baseFolder}/homepage`;

      const response = await cloudinary.uploader.upload(img, {
        folder: cloudFolder,
        resource_type: "auto",
      });
      imageUrl = response.secure_url;
      fileId = response.public_id;

      const newBanner = await prisma.banners.create({
        data: {
          imageUrl,
          fileId,
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
      where: {
        id: bannerId,
      },
      select: {
        id: true,
        sellerId: true,
        category: true,
      },
    });

    if (!existingBanner) {
      return next(new NotFoundError("Banner not found!"));
    }

    if (req.role === "seller" && existingBanner.sellerId !== req.seller?.id) {
      return next(
        new ValidationError("You are not authorized to update this banner!"),
      );
    }

    const updateData: Record<string, unknown> = {};

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
      });

      updateData.imageUrl = response.secure_url;
      updateData.fileId = response.public_id;
    }

    const banner = await prisma.banners.update({
      where: {
        id: bannerId,
      },
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
      where: {
        id: bannerId,
      },
    });

    if (!existingBanner) {
      return next(new NotFoundError("Banner not found!"));
    }

    if (req.role === "seller" && existingBanner.sellerId !== req.seller?.id) {
      return next(
        new ValidationError("You are not authorized to delete this banner!"),
      );
    }

    // Delete from Cloudinary if fileId exists
    if (existingBanner.fileId) {
      try {
        // Since we are moving to Cloudinary for all banners
        await cloudinary.uploader.destroy(existingBanner.fileId);
      } catch (err) {
        console.error("Cloudinary deletion failed for banner", err);
      }
    }

    await prisma.banners.delete({
      where: {
        id: bannerId,
      },
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
        category: {
          not: null,
        },
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            store: {
              select: {
                name: true,
              },
            },
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
            store: {
              select: {
                name: true,
              },
            },
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

    const { bannerId, action, rejectionReason } = req.body;

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
      // Delete from Cloudinary
      if (banner.fileId) {
        try {
          await cloudinary.uploader.destroy(banner.fileId);
        } catch (err) {
          console.error("Cloudinary deletion failed during rejection", err);
        }
      }

      // Delete from DB as per request: "if he rejected that banner then that will be deleted"
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

// // GET BANNERS (Public)
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

//upload product image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ⚠️ Note: 'fileName' here actually contains the base64 image data string
    const { fileName } = req.body;

    if (!fileName) {
      return next(new ValidationError("File data is required"));
    }

    const response = await imagekit.upload({
      file: fileName, // Base64 string
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });

    res.status(201).json({
      success: true,
      file_url: response.url,
      // 👇 CHANGE: Return 'fileId' clearly so frontend can use it
      fileId: response.fileId,
    });
  } catch (error) {
    next(error);
  }
};

// Upload image to Cloudinary (Specifically for Admin Panel)
export const uploadCloudinaryImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { images, fileName, folder = "products", productTitle, category } = req.body;

    // Support both single 'fileName' (for backward compat) and multiple 'images'
    const imageList = Array.isArray(images)
      ? images
      : fileName
        ? [fileName]
        : [];

    if (imageList.length === 0) {
      return next(new ValidationError("At least one image is required"));
    }

    const validFolders = ["banners", "products"];
    const targetBaseFolder = validFolders.includes(folder)
      ? folder
      : "products";

    // Create subfolder for products based on title
    let cloudFolder = `${ENV.CLOUDINARY_FOLDER || "fishStudio-app"}/${targetBaseFolder}`;
    if (targetBaseFolder === "products" && productTitle) {
      const safeTitle = productTitle
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-]/g, "");
      cloudFolder += `/${safeTitle}`;
    } else if (targetBaseFolder === "banners") {
      if (category) {
        cloudFolder += `/category/${category}/images`;
      } else {
        cloudFolder += `/homepage`;
      }
    }

    const uploadPromises = imageList.map(async (base64, index) => {
      const response = await cloudinary.uploader.upload(base64, {
        folder: cloudFolder,
        public_id: `image${index + 1}`,
        resource_type: "auto",
        overwrite: true,
      });
      return {
        file_url: response.secure_url,
        fileId: response.public_id,
      };
    });

    const results = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      images: results,
      // For single image compat
      file_url: results[0]?.file_url,
      fileId: results[0]?.fileId,
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    next(error);
  }
};

export const deleteCloudinaryImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return next(new ValidationError("fileId is required for deletion"));
    }

    const result = await cloudinary.uploader.destroy(fileId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    next(error);
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "admin" || !req.admin?.id) {
      return next(
        new ValidationError("Only admin can create catalog products!"),
      );
    }

    /**
     * 1️⃣ Extract fields from request body
     */
    const {
      title,
      short_description,
      sizes,
      cuttingTypes,
      pieceSizes,
      processingWeightLoss,
      slug,
      tags,
      cash_on_delivery,
      category,
      subCategory,
      stock,
      sale_price,
      regular_price,
      images = [],
    } = req.body;

    /**
     * 2️⃣ Validate required fields
     */
    const requiredFields = {
      title,
      slug,
      short_description,
      category,
      subCategory,
      tags,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => {
        if (value === undefined || value === null) return true;

        // handle strings
        if (typeof value === "string" && value.trim() === "") return true;

        // handle arrays (THIS FIXES YOUR BUG)
        if (Array.isArray(value) && value.length === 0) return true;

        return false;
      })
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return next(
        new ValidationError(
          `Missing required fields: ${missingFields.join(", ")}`,
        ),
      );
    }

    /**
     * 3️⃣ Seller & store validation
     */
    const ownerData = { adminId: req.admin.id };

    /**
     * 4️⃣ Slug uniqueness check
     */
    const slugChecking = await prisma.products.findUnique({
      where: { slug },
    });

    if (slugChecking) {
      return next(
        new ValidationError(
          "Slug already exists! Please use a different slug!",
        ),
      );
    }

    /**
     * 5️⃣ Normalize dynamic fields
     * Convert [{ value: "500g" }] → ["500g"]
     */
    const normalizedSizes = sizes ? normalizeDynamicValues(sizes) : [];
    const normalizedPieceSizes = pieceSizes
      ? normalizeDynamicValues(pieceSizes)
      : [];
    const normalizedCuttingTypes = cuttingTypes
      ? normalizeDynamicValues(cuttingTypes)
      : [];

    /**
     * 6️⃣ Create product
     */
    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,

        category,
        subCategory,

        sizes: normalizedSizes,
        sizePricing: null,
        pieceSizes: normalizedPieceSizes,
        cuttingTypes: normalizedCuttingTypes,

        ...(processingWeightLoss && { processingWeightLoss }),

        cashOnDelivery: cash_on_delivery || "yes",
        slug,
        ...ownerData,
        storeId: null,
        catalogProductId: null,
        isDeleted: false,

        tags: Array.isArray(tags)
          ? tags
          : tags.split(",").map((t: string) => t.trim()),

        discount_codes: [],

        stock: Number(stock ?? 0),
        sale_price: Number(sale_price ?? 0),
        regular_price: Number(regular_price ?? 0),

        /**
         * 7️⃣ Images (optional)
         * Expecting pre-uploaded images with fileId & file_url
         */
        images: {
          create: images.map((img: any) => ({
            // Schema field: file_id | Frontend data: img.fileId
            file_id: img.fileId,

            // Schema field: url | Frontend data: img.file_url
            url: img.file_url,

            // Schema field: type | Default is PRODUCT, so we can skip or force it
            type: "PRODUCT",
          })),
        },
      },
      include: { images: true },
    });

    /**
     * 8️⃣ Success response
     */
    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      newProduct,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const getCatalogProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerStoreId = req.role === "seller" ? req.seller?.store?.id : null;

    const [adminProducts, sellerProducts] = await Promise.all([
      prisma.products.findMany({
        where: {
          adminId: {
            not: null,
          },
          isDeleted: false,
        },
        include: {
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      sellerStoreId
        ? prisma.products.findMany({
            where: {
              storeId: sellerStoreId,
              catalogProductId: {
                not: null,
              },
            },
            select: {
              id: true,
              catalogProductId: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const catalogProducts = adminProducts.filter(isCatalogRootProduct);

    const sellerProductMap = new Map(
      sellerProducts.map((product) => [product.catalogProductId, product.id]),
    );

    return res.status(200).json({
      success: true,
      products: catalogProducts.map((product) => ({
        ...product,
        alreadyAdded: sellerProductMap.has(product.id),
        sellerProductId: sellerProductMap.get(product.id) ?? null,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const addCatalogProductToStore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const catalogProductId = getRequiredParam(
      req.params.catalogProductId,
      "Catalog product id",
    );
    const sellerStore = getSellerStore(req);

    const catalogProductCandidate = await prisma.products.findFirst({
      where: {
        id: catalogProductId,
        adminId: {
          not: null,
        },
        isDeleted: false,
      },
      include: {
        images: true,
      },
    });

    if (
      !catalogProductCandidate ||
      !isCatalogRootProduct(catalogProductCandidate)
    ) {
      return next(new NotFoundError("Catalog product not found!"));
    }

    const catalogProduct = catalogProductCandidate;

    const existingStoreProduct = await prisma.products.findFirst({
      where: {
        storeId: sellerStore.id,
        catalogProductId,
      },
      select: { id: true },
    });

    if (existingStoreProduct) {
      return next(
        new ValidationError(
          "This product is already added to the seller store!",
        ),
      );
    }

    const {
      regular_price,
      sale_price,
      sizePricing,
      cuttingTypePricing,
      pieceSizePricing,
      stock,
      cash_on_delivery,
      discountCodes,
      short_description,
      tags,
      status,
      processingWeightLoss,
    } = req.body;

    const uniqueSlug = await buildUniqueSlug(
      catalogProduct.slug,
      sellerStore.id.slice(-6),
    );

    const hasSizes = Array.isArray(catalogProduct.sizes) && catalogProduct.sizes.length > 0;

    let normalizedSizePricing: NormalizedSizePricing[] = [];
    let displayPrices: { salePrice: number; regularPrice: number };

    if (hasSizes) {
      normalizedSizePricing = normalizeSizePricing(
        sizePricing,
        catalogProduct.sizes,
        Number(sale_price ?? 0),
        Number(regular_price ?? sale_price ?? 0),
      );
      displayPrices = getDisplayPricesFromSizePricing(normalizedSizePricing);
    } else {
      displayPrices = {
        salePrice: Number(sale_price ?? 0),
        regularPrice: Number(regular_price ?? sale_price ?? 0),
      };
    }

    const storeProduct = await prisma.products.create({
      data: {
        title: catalogProduct.title,
        slug: uniqueSlug,
        category: catalogProduct.category,
        subCategory: catalogProduct.subCategory,
        short_description:
          typeof short_description === "string" && short_description.trim()
            ? short_description
            : catalogProduct.short_description,
        tags:
          typeof tags === "string"
            ? tags
                .split(",")
                .map((tag: string) => tag.trim())
                .filter(Boolean)
            : Array.isArray(tags)
              ? tags
              : catalogProduct.tags,
        sizes: catalogProduct.sizes,
        sizePricing: normalizedSizePricing.length > 0 ? normalizedSizePricing : undefined,
        cuttingTypes: catalogProduct.cuttingTypes,
        pieceSizes: catalogProduct.pieceSizes,
        processingWeightLoss:
          typeof processingWeightLoss === "string" &&
          processingWeightLoss.trim()
            ? processingWeightLoss
            : catalogProduct.processingWeightLoss,
        stock: Number(stock ?? 0),
        sale_price: displayPrices.salePrice,
        regular_price: displayPrices.regularPrice,
        cashOnDelivery:
          typeof cash_on_delivery === "string"
            ? cash_on_delivery
            : catalogProduct.cashOnDelivery,
        discount_codes: Array.isArray(discountCodes) ? discountCodes : [],
        status: status === "NonActive" ? "NonActive" : "Active",
        storeId: sellerStore.id,
        catalogProductId: catalogProduct.id,
        images: {
          create: catalogProduct.images.map((image) => ({
            file_id: image.file_id,
            url: image.url,
            type: image.type,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product added to seller store successfully!",
      product: storeProduct,
    });
  } catch (error) {
    return next(error);
  }
};

//get logged in seller products
export const getStoreProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, pincode } = req.query;

    let effectiveStoreId = storeId ? String(storeId) : null;

    // If no storeId but pincode is provided, try to find a store for that pincode
    if (!effectiveStoreId && pincode) {
      const store = await prisma.stores.findFirst({
        where: {
          OR: [
            { pincode: String(pincode) },
            { availableCities: { has: String(pincode) } }, // Assuming pincode or city name
          ],
        },
        select: { id: true },
      });
      if (store) {
        effectiveStoreId = store.id;
      }
    }

    // 1. Fetch all catalog products (those created by admin)
    //    Always fetch ALL active/nonactive store variants — we will prefer the
    //    user's storeId in JS, but fall back to the first available variant so
    //    a product never wrongly shows "Out of Stock" due to a stale storeId.
    const catalogProducts = await prisma.products.findMany({
      where: {
        adminId: { not: null },
        catalogProductId: null,
        isDeleted: false,
        status: "Active",
      },
      include: {
        images: true,
        storeVariants: {
          where: {
            isDeleted: false,
            status: { in: ["Active", "NonActive"] },
          },
          include: {
            images: true,
            store: {
              include: {
                seller: {
                  include: {
                    events: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. Transform: prefer the variant for the user's selected store.
    //    If no exact match (stale storeId, different store, etc.) fall back
    //    to the first available variant from any store.
    //    Only return catalog-product-as-out-of-stock when NO store sells it yet.
    const normalizedStoreId = effectiveStoreId ? String(effectiveStoreId) : null;

    const finalProducts = catalogProducts.map((catalogProduct) => {
      const variants = catalogProduct.storeVariants ?? [];

      // Prefer the user's specific store; otherwise take the first available variant
      const variant =
        (normalizedStoreId
          ? variants.find((v) => v.storeId === normalizedStoreId)
          : undefined) ?? variants[0];

      // Base fields from the catalog root (Master Product)
      const baseProductData = {
        ...catalogProduct,
        title: catalogProduct.title,
        short_description: catalogProduct.short_description,
        images: catalogProduct.images,
      };

      if (variant) {
        return { 
          ...baseProductData,
          ...variant,
          // Ensure we don't accidentally override the master title/images with variant ones
          // unless your business logic says variants can have custom names/images.
          // For now, let's keep catalog root as the brand source.
          title: catalogProduct.title,
          images: catalogProduct.images?.length ? catalogProduct.images : variant.images,
        };
      }

      // No seller has added this catalog product yet — show as out of stock
      return {
        ...baseProductData,
        stock: 0,
        store: null,
      };
    });

    res.status(200).json({
      success: true,
      products: finalProducts.map(mapProductWithActiveEvents),
    });
  } catch (error) {
    return next(error);
  }
};

export const getStoreProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = getRequiredParam(req.params.slug, "Product slug");

    const product = await prisma.products.findFirst({
      where: {
        slug,
        storeId: {
          not: null,
        },
        catalogProductId: {
          not: null,
        },
        isDeleted: false,
        status: "Active",
      },
      include: {
        images: true,
        store: {
          include: {
            seller: {
              include: {
                events: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return next(new NotFoundError("Product not found!"));
    }

    return res.status(200).json({
      success: true,
      product: mapProductWithActiveEvents(product),
    });
  } catch (error) {
    return next(error);
  }
};

export const getOwnedProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await prisma.products.findMany({
      where: getOwnedProductFilter(req),
      include: {
        images: true,
        store: {
          include: {
            seller: {
              include: {
                events: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      products: products.map(mapProductWithActiveEvents),
    });
  } catch (error) {
    return next(error);
  }
};

export const getOwnedProductById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = getRequiredParam(req.params.productId, "Product id");
    const ownerFilter = getOwnedProductFilter(req);

    const product = await prisma.products.findFirst({
      where: {
        id: productId,
        ...ownerFilter,
      },
      include: {
        images: true,
        catalogProduct: {
          include: {
            images: true,
          },
        },
        store: {
          include: {
            seller: {
              include: {
                events: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return next(new NotFoundError("Product not found!"));
    }

    return res.status(200).json({
      success: true,
      product: mapProductWithActiveEvents(product),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = getRequiredParam(req.params.productId, "Product id");
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        storeId: true,
        adminId: true,
        sizes: true,
        cuttingTypes: true,
        pieceSizes: true,
      },
    });

    if (!product) {
      return next(new NotFoundError("Product not found!"));
    }

    const ownerFilter = getOwnedProductFilter(req);
    const hasAccess =
      ("storeId" in ownerFilter && product.storeId === ownerFilter.storeId) ||
      ("adminId" in ownerFilter && product.adminId === ownerFilter.adminId);

    if (!hasAccess) {
      return next(
        new ValidationError("You are not authorized to update this product!"),
      );
    }

    const {
      title,
      short_description,
      tags,
      category,
      subCategory,
      stock,
      sale_price,
      regular_price,
      sizePricing,
      cuttingTypePricing,
      pieceSizePricing,
      slug,
      sizes,
      pieceSizes,
      cuttingTypes,
      discountCodes,
      cash_on_delivery,
      processingWeightLoss,
      status,
    } = req.body;

    let resolvedSlug: string | null = null;

    if (slug) {
      const slugChecking = await prisma.products.findFirst({
        where: {
          slug,
          NOT: {
            id: productId,
          },
        },
      });

      if (slugChecking) {
        if (req.role === "seller" && req.seller?.store?.id) {
          resolvedSlug = await buildUniqueSlug(
            slug,
            req.seller.store.id.slice(-6),
            productId,
          );
        } else {
          return next(
            new ValidationError(
              "Slug already exists! Please use a different slug!",
            ),
          );
        }
      } else {
        resolvedSlug = slug;
      }
    }

    const updateData: Record<string, unknown> = {};

    if (typeof title === "string" && title.trim()) updateData.title = title;
    if (typeof short_description === "string" && short_description.trim()) {
      updateData.short_description = short_description;
    }
    if (typeof category === "string" && category.trim())
      updateData.category = category;
    if (typeof subCategory === "string" && subCategory.trim()) {
      updateData.subCategory = subCategory;
    }
    if (typeof resolvedSlug === "string" && resolvedSlug.trim()) {
      updateData.slug = resolvedSlug;
    }
    if (typeof processingWeightLoss === "string") {
      updateData.processingWeightLoss = processingWeightLoss;
    }
    if (typeof tags === "string") {
      updateData.tags = tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean);
    } else if (Array.isArray(tags)) {
      updateData.tags = tags;
    }
    if (
      typeof status === "string" &&
      ["Active", "NonActive"].includes(status)
    ) {
      updateData.status = status;
    }

    if (req.role === "seller") {
      if (typeof stock !== "undefined") updateData.stock = Number(stock);
      if (typeof cash_on_delivery === "string") {
        updateData.cashOnDelivery = cash_on_delivery;
      }
      if (typeof discountCodes !== "undefined") {
        updateData.discount_codes = Array.isArray(discountCodes)
          ? discountCodes
          : [];
      }
    }

    const normalizedSizes = normalizeDynamicValues(sizes);
    const normalizedPieceSizes = normalizeDynamicValues(pieceSizes);
    const normalizedCuttingTypes = normalizeDynamicValues(cuttingTypes);

    if (typeof sizes !== "undefined") {
      updateData.sizes = sizes ? normalizeDynamicValues(sizes) : [];
    }
    if (typeof pieceSizes !== "undefined") {
      updateData.pieceSizes = pieceSizes
        ? normalizeDynamicValues(pieceSizes)
        : [];
    }
    if (typeof cuttingTypes !== "undefined") {
      updateData.cuttingTypes = cuttingTypes
        ? normalizeDynamicValues(cuttingTypes)
        : [];
    }

    if (req.role === "seller") {
      const effectiveSizes =
        normalizedSizes.length > 0
          ? normalizedSizes
          : Array.isArray(product.sizes)
            ? product.sizes
            : [];

      if (Array.isArray(sizePricing) && effectiveSizes.length > 0) {
        const normalizedSizePricing = normalizeSizePricing(
          sizePricing,
          effectiveSizes,
          Number(sale_price ?? 0),
          Number(regular_price ?? sale_price ?? 0),
        );
        const displayPrices = getDisplayPricesFromSizePricing(
          normalizedSizePricing,
        );
        updateData.sizePricing = normalizedSizePricing;
        updateData.sale_price = displayPrices.salePrice;
        updateData.regular_price = displayPrices.regularPrice;
      } else {
        if (typeof sale_price !== "undefined") {
          updateData.sale_price = Number(sale_price);
        }
        if (typeof regular_price !== "undefined") {
          updateData.regular_price = Number(regular_price);
        }
      }

      if (Array.isArray(cuttingTypePricing)) {
        const effectiveCuttingTypes =
          normalizedCuttingTypes.length > 0
            ? normalizedCuttingTypes
            : Array.isArray(product.cuttingTypes)
              ? product.cuttingTypes
              : [];
        updateData.cuttingTypePricing = normalizeCuttingTypePricing(
          cuttingTypePricing,
          effectiveCuttingTypes,
        );
      }

      if (Array.isArray(pieceSizePricing)) {
        const effectivePieceSizes =
          normalizedPieceSizes.length > 0
            ? normalizedPieceSizes
            : Array.isArray(product.pieceSizes)
              ? product.pieceSizes
              : [];
        updateData.pieceSizePricing = normalizePieceSizePricing(
          pieceSizePricing,
          effectivePieceSizes,
        );
      }
    }

    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: updateData,
      include: {
        images: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    return next(error);
  }
};

//delete product
export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role === "seller") {
      return next(
        new ValidationError("Sellers cannot delete products. Use Active/NonActive status instead."),
      );
    }

    const productId = getRequiredParam(req.params.productId, "Product id");
    const ownerFilter = getOwnedProductFilter(req);

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, storeId: true, adminId: true, isDeleted: true },
    });

    if (!product) {
      return next(new NotFoundError("Product not found!"));
    }

    const hasAccess =
      ("storeId" in ownerFilter && product.storeId === ownerFilter.storeId) ||
      ("adminId" in ownerFilter && product.adminId === ownerFilter.adminId);

    if (!hasAccess) {
      return next(
        new ValidationError("You are not authorized to delete this product!"),
      );
    }

    if (product.isDeleted) {
      return next(new ValidationError("Product is already in delete state!"));
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
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = getRequiredParam(req.params.productId, "Product id");
    const ownerFilter = getOwnedProductFilter(req);
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, storeId: true, adminId: true, isDeleted: true },
    });
    if (!product) {
      return next(new NotFoundError("Product not found!"));
    }

    const hasAccess =
      ("storeId" in ownerFilter && product.storeId === ownerFilter.storeId) ||
      ("adminId" in ownerFilter && product.adminId === ownerFilter.adminId);

    if (!hasAccess) {
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

export const getStorePublicOffers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = req.params.storeId as string;
    if (!storeId) {
      return res
        .status(400)
        .json({ success: false, message: "storeId required" });
    }

    // Get store -> sellerId
    const store = await prisma.stores.findUnique({
      where: { id: storeId },
      select: { sellerId: true },
    });

    if (!store) {
      return res.status(200).json({ success: true, coupons: [], events: [] });
    }

    const now = new Date();

    // Get active discount codes for this seller
    const discountCodes = await prisma.discount_codes.findMany({
      where: { sellerId: store.sellerId },
      orderBy: { createdAt: "desc" },
    });

    // Get active seller events (currently running)
    const activeEvents = await prisma.seller_events.findMany({
      where: {
        sellerId: store.sellerId,
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      orderBy: { startTime: "desc" },
    });

    return res.status(200).json({
      success: true,
      discountCodes,
      activeEvents,
    });
  } catch (error) {
    return next(error);
  }
};

export const validateCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(200).json({ success: true, products: [] });
    }

    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds },
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        stock: true,
        sale_price: true,
        regular_price: true,
        images: {
          take: 1,
          select: { url: true },
        },
      },
    });

    const validatedProducts = products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      stock: p.stock,
      price: p.sale_price || p.regular_price,
      image: p.images[0]?.url || "",
    }));

    res.status(200).json({
      success: true,
      products: validatedProducts,
    });
  } catch (error) {
    next(error);
  }
};
