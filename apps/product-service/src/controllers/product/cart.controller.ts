import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { validateCartSchema, validate } from "@repo/zod-schema";
import { resolvePreferredStore } from "./storefront.utils.js";

export const validateCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cartItems, pincode, city, storeId } = validate(
      validateCartSchema,
      req.body,
    ) as any;
    const now = new Date();

    const resolvedStore = await resolvePreferredStore({
      storeId: storeId ? String(storeId) : undefined,
      pincode: String(pincode),
      city: city ? String(city) : undefined,
    });
    const store = resolvedStore
      ? await prisma.stores.findUnique({
          where: { id: resolvedStore.id },
          include: { seller: { include: { events: true } } },
        })
      : null;

    if (!store) {
      const nearbyStore = await prisma.stores.findFirst({
        select: { name: true, city: true },
      });

      return res.status(200).json({
        success: false,
        message: "We don't deliver to this location yet",
        isServiceable: false,
        cartDeliveryTime: null,
        store: null,
        nearbyHint: nearbyStore
          ? `Available in nearby area: ${nearbyStore.city}`
          : null,
        items: [],
      });
    }

    const productIds = cartItems.map((item: any) => item.productId);
    const variants = await prisma.products.findMany({
      where: {
        storeId: store.id,
        isDeleted: { not: true },
        status: "Active",
        OR: [
          { id: { in: productIds } },
          { catalogProductId: { in: productIds } },
        ],
      },
      include: {
        images: true,
        catalogProduct: { select: { slug: true } },
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const catalogVariantMap = new Map(
      variants
        .filter((variant) => Boolean(variant.catalogProductId))
        .map((variant) => [variant.catalogProductId!, variant]),
    );
    let subtotal = 0;
    const productSpecificCouponIds: string[] = [];
    let hasCartChanged = false;

    const validatedItems = cartItems.map((item: any) => {
      const variant =
        variantMap.get(item.productId) ?? catalogVariantMap.get(item.productId);
      const availableQty = variant ? (variant.stock ?? 0) : 0;
      const inStock = variant ? availableQty > 0 : false;
      const price = variant ? variant.sale_price || variant.regular_price : 0;

      // Detection if this specific item caused a cart change
      if (!variant || !inStock || availableQty < item.quantity) {
        hasCartChanged = true;
      }

      if (variant) {
        subtotal += price * Math.min(item.quantity, availableQty);
        if (variant.discount_codes) {
          productSpecificCouponIds.push(...variant.discount_codes);
        }
      }

      return {
        productId: item.productId,
        resolvedProductId: variant?.id || null,
        title: variant?.title || "Unknown Product",
        slug: variant?.catalogProduct?.slug || variant?.slug || "",
        inStock: inStock && availableQty >= item.quantity,
        availableQty,
        requestedQty: item.quantity,
        price,
        image: variant?.images[0]?.url || "",
        deliveryTime:
          (store.cityDeliveryTimes as any)?.[city || pincode] ||
          (store.cityDeliveryTimes as any)?.[pincode] ||
          45,
      };
    });

    // 3. Fetch and filter applicable coupons (store-specific, global, or product-specific)
    const coupons = await prisma.discount_codes.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        AND: [
          {
            OR: [
              { adminId: { not: null } },
              { sellerId: store.sellerId },
              { id: { in: productSpecificCouponIds } },
            ],
          },
          { minOrderValue: { lte: subtotal } },
        ],
      },
    });

    // 4. Extract active events
    const activeEvents = (store.seller?.events || []).filter(
      (e: any) =>
        e.isActive &&
        new Date(e.startTime) <= now &&
        new Date(e.endTime) >= now,
    );

    const cartDeliveryTime =
      (store.cityDeliveryTimes as any)?.[city || pincode] ||
      (store.cityDeliveryTimes as any)?.[pincode] ||
      45;

    // Helper: Convert "HH:MM" to minutes from midnight
    const toMins = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const nowH = now.getHours();
    const nowM = now.getMinutes();
    const nowTotal = nowH * 60 + nowM;

    // 1. Store Opening Hours Check
    const openMins = toMins(store.opening_hours || "09:00");
    const closeMins = toMins(store.closing_hours || "23:00");
    const isStoreOpen = nowTotal >= openMins && nowTotal <= closeMins;

    // 2. Instant Delivery Window Check
    const instantStartMins = toMins(
      store.instant_delivery_window_start || "11:00",
    );
    const instantEndMins = toMins(store.instant_delivery_window_end || "19:00");

    const isInstantWindow =
      nowTotal >= instantStartMins && nowTotal <= instantEndMins;
    const isInstantAvailable =
      isStoreOpen && store.is_instant_delivery_enabled && isInstantWindow;

    // 3. Define Available Slots
    const availableSlots = isInstantAvailable
      ? ["instant", "morning", "evening"]
      : ["morning", "evening"];

    return res.status(200).json({
      success: true,
      items: validatedItems,
      store: {
        id: store.id,
        name: store.name,
        city: store.city,
        pincode: store.pincode,
        isOpen: isStoreOpen,
      },
      cartDeliveryTime,
      storeName: store.name,
      storeId: store.id,
      isStoreOpen,
      openingHours: store.opening_hours,
      closingHours: store.closing_hours,
      isServiceable: true,
      hasCartChanged,
      availableSlots,
      isInstantAvailable,
      instantFee: store.instant_delivery_fee || 20,
      coupons,
      events: activeEvents,
      subtotal,
    });
  } catch (error) {
    next(error);
  }
};
