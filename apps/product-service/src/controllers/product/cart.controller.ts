import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma, Prisma } from "@repo/db-mongo";
import { validateCartSchema, validate } from "@repo/zod-schema";
import { distributeComboPrice, comboItemsMatchDefinition, ComboDefinitionItem } from "@repo/shared/pricing";
import { isStoreOpenNow, isInstantDeliveryAvailableNow } from "@repo/shared/store-hours";
import {
  buildAvailableSlots,
  parseDeliverySlotConfig,
  type AvailableSlot,
} from "@repo/shared/delivery-slots";
import { prismaPostgres } from "@repo/db-postgres";
import { optionalUserId, resolvePreferredStore } from "./storefront.utils.js";

/**
 * The user's saved cart, for a client that has just signed in on a new device.
 *
 * Returns only the stored line identities — product id, quantity, and the
 * cutting/size options. It deliberately does not resolve titles, prices,
 * images or stock: the caller merges these lines into its local cart and then
 * runs its normal validate-cart pass, which is the one place that pricing
 * lives. Rehydrating here would duplicate that logic and let a restored cart
 * show a price checkout would not honour.
 */
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = optionalUserId(req);
    // Not a 401: this is called opportunistically on sign-in, and a guest (or
    // an expired access token mid-refresh) simply has no server cart to
    // restore. An error here would surface as a spurious toast.
    if (!userId) {
      return res.status(200).json({ success: true, items: [], storeId: null });
    }

    const cart = await prisma.carts.findUnique({ where: { userId } });

    // isConverted means the cart was checked out; the row is kept only so the
    // reminder job can tell "ordered" from "still open". Restoring it would
    // put an already-purchased basket back in front of the customer.
    if (!cart || cart.isConverted || !Array.isArray(cart.items)) {
      return res.status(200).json({ success: true, items: [], storeId: null });
    }

    return res.status(200).json({
      success: true,
      items: cart.items,
      storeId: cart.storeId ?? null,
      storeName: cart.storeName ?? null,
      updatedAt: cart.lastUpdatedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Empty the user's saved cart.
 *
 * Needed because validateCart — the normal write path — requires at least one
 * item, so a cart the customer emptied by hand has no way to reach the server
 * and would otherwise sit there until the reminder job nagged them about a
 * basket they had already cleared.
 *
 * Marks the row converted as well as empty: `isConverted` is what the reminder
 * job reads, and "the customer deliberately emptied this" is as good a reason
 * to stop reminding as "they ordered it".
 */
export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = optionalUserId(req);
    if (!userId) {
      return res.status(200).json({ success: true });
    }

    await prisma.carts.updateMany({
      where: { userId },
      data: { items: [], totalAmount: 0, isConverted: true },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Persists the cart on every mutation, and keeps the abandoned-cart reminder
// flow (see checkAbandonedCarts) in step with it. validateCart is the only
// server touchpoint every cart mutation on either platform already goes
// through, so it doubles as the write path here instead of adding a dedicated
// endpoint the two clients would have to remember to call.
async function syncAbandonedCart(params: {
  userId: string;
  cartItems: Prisma.InputJsonValue[];
  storeId: string;
  storeName: string;
  totalAmount: number;
}) {
  const { userId, cartItems, storeId, storeName, totalAmount } = params;

  const existing = await prisma.carts.findUnique({ where: { userId } });
  const itemsChanged =
    !existing || JSON.stringify(existing.items) !== JSON.stringify(cartItems);

  await prisma.carts.upsert({
    where: { userId },
    create: { userId, items: cartItems, storeId, storeName, totalAmount },
    update: {
      items: cartItems,
      storeId,
      storeName,
      totalAmount,
      isConverted: false,
      // Only a real edit restarts the reminder sequence — re-validating an
      // unchanged cart (e.g. reopening the cart screen) shouldn't reset it.
      ...(itemsChanged && { notifyStage: 0, notifiedAt: null }),
    },
  });
}

export const validateCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cartItems, pincode, city, area, storeId } = validate(
      validateCartSchema,
      req.body,
    ) as any;
    const now = new Date();

    // A single pincode can span several localities with very different real
    // delivery times, so a seller-configured area entry (e.g. "Sector 62")
    // takes precedence over the coarser city/pincode entries when present.
    const deliveryTimeForStore = (store: { cityDeliveryTimes: unknown }) =>
      (store.cityDeliveryTimes as any)?.[area] ??
      (store.cityDeliveryTimes as any)?.[city || pincode] ??
      (store.cityDeliveryTimes as any)?.[pincode] ??
      45;

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
      // Whole-fish style products track stock per exact weight rather than
      // one shared pool — resolve against that bucket when the seller opted in.
      const sizeStockEntries = variant?.sizeStock as
        | Array<{ size: string; qty: number }>
        | null
        | undefined;
      const availableQty =
        variant?.trackStockPerSize && item.size
          ? Number(sizeStockEntries?.find((entry) => entry.size === item.size)?.qty ?? 0)
          : variant
            ? (variant.stock ?? 0)
            : 0;
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
        deliveryTime: deliveryTimeForStore(store),
      };
    });

    // 2b. Combo pricing preview — reprice bundle members to the combo's
    // price so the cart shows the same total checkout will actually charge
    // (order-service enforces this same math, see distributeComboPrice).
    const comboGroups = new Map<string, number[]>();
    cartItems.forEach((item: any, i: number) => {
      if (item.comboId) {
        if (!comboGroups.has(item.comboId)) comboGroups.set(item.comboId, []);
        comboGroups.get(item.comboId)!.push(i);
      }
    });

    if (comboGroups.size > 0) {
      const combos = await prisma.combos.findMany({
        where: { id: { in: [...comboGroups.keys()] }, isActive: true },
      });
      const comboMap = new Map(combos.map((c) => [c.id, c]));

      for (const [comboId, indexes] of comboGroups) {
        const combo = comboMap.get(comboId);
        if (!combo || combo.storeId !== store.id) continue; // stale/foreign combo — leave catalog price as a safe fallback

        const submitted = indexes.map((i) => ({
          productId: cartItems[i].productId,
          quantity: cartItems[i].quantity,
          cuttingType: cartItems[i].cuttingType,
          pieceSize: cartItems[i].pieceSize,
        }));
        if (!comboItemsMatchDefinition(submitted, combo.items as unknown as ComboDefinitionItem[])) {
          continue;
        }

        const linePrices = distributeComboPrice(
          combo.comboPrice,
          indexes.map((i) => ({
            catalogUnitPrice: validatedItems[i].price,
            quantity: cartItems[i].quantity,
          })),
        );
        indexes.forEach((i, idx) => {
          const line = validatedItems[i];
          const oldLineTotal = line.price * Math.min(line.requestedQty, line.availableQty);
          line.price = linePrices[idx]!;
          const newLineTotal = line.price * Math.min(line.requestedQty, line.availableQty);
          subtotal += newLineTotal - oldLineTotal;
        });
      }
    }

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

    const cartDeliveryTime = deliveryTimeForStore(store);

    const isStoreOpen = isStoreOpenNow(store);
    const isInstantAvailable = isInstantDeliveryAvailableNow(store);

    // Scheduled slots are capacity-limited per store per day, so what's on
    // offer depends on what's already booked. Orders live in Postgres and the
    // catalogue in Mongo, so this is a second hop by construction — cheap
    // enough (one indexed range scan on a table with a row per store/day/slot)
    // and it keeps the cart screen from offering a slot checkout would refuse.
    const slotDefinitions = parseDeliverySlotConfig(store.deliverySlotConfig);
    let deliverySlots: AvailableSlot[] = [];
    try {
      const bookings = await prismaPostgres.deliverySlotBooking.findMany({
        where: { storeId: store.id },
        select: { deliveryDate: true, slotKey: true, booked: true },
      });
      deliverySlots = buildAvailableSlots({
        slots: slotDefinitions,
        bookedCounts: new Map(
          bookings.map((b) => [`${b.deliveryDate}:${b.slotKey}`, b.booked]),
        ),
      });
    } catch (error) {
      // Showing every slot as open is the safer failure: checkout re-checks
      // capacity atomically anyway, so the worst case is one customer being
      // told at the last step. Hiding all slots would block checkout outright.
      console.error("[validateCart] slot availability unavailable", error);
      deliverySlots = buildAvailableSlots({ slots: slotDefinitions, bookedCounts: new Map() });
    }

    // The existing string[] contract, kept as-is — user-ui and mobile both
    // compare against these literals. `deliverySlots` below is the dated,
    // capacity-aware view; clients move over to it as they're updated.
    const bookableSlotKeys = [...new Set(
      deliverySlots.filter((slot) => slot.isBookable).map((slot) => slot.key),
    )];
    const availableSlots = isInstantAvailable
      ? ["instant", ...bookableSlotKeys]
      : bookableSlotKeys;

    const userId = optionalUserId(req);
    if (userId) {
      try {
        await syncAbandonedCart({
          userId,
          cartItems,
          storeId: store.id,
          storeName: store.name,
          totalAmount: subtotal,
        });
      } catch (error) {
        // Best-effort — a reminder-tracking failure must not fail cart validation.
        console.error("[AbandonedCart] Failed to sync cart state", error);
      }
    }

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
      deliverySlots,
      isInstantAvailable,
      instantFee: store.instant_delivery_fee || 20,
      // Seller-set bill config (Store settings in seller-ui) — the cart/checkout
      // screens display these instead of guessing, so the preview always
      // matches what order-service actually charges via computeCartSummary.
      gstRate: store.gst_rate ?? 0,
      packagingCharge: store.packaging_charge ?? 0,
      baseDeliveryCharge: store.base_delivery_charge ?? 49,
      freeDeliveryThreshold: store.free_delivery_threshold ?? 500,
      coupons,
      events: activeEvents,
      subtotal,
    });
  } catch (error) {
    next(error);
  }
};
