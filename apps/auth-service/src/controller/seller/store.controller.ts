import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { ValidationError } from "@repo/error-handlers";
import { storeSchema, updateStoreSchema, validate } from "@repo/zod-schema";
import { publishToQueue } from "@repo/libs";

export const createStore = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      bio,
      address,
      opening_hours,
      closing_hours,
      is_instant_delivery_enabled,
      instant_delivery_fee,
      instant_delivery_window_start,
      instant_delivery_window_end,
      sellerId,
      city,
      pincode,
      state,
      availableCities,
      cityDeliveryTimes,
    } = validate(storeSchema, req.body);

    const storeData: any = {
      name,
      bio,
      address,
      city,
      pincode,
      opening_hours,
      closing_hours,
      is_instant_delivery_enabled,
      instant_delivery_fee,
      instant_delivery_window_start,
      instant_delivery_window_end,
      availableCities,
      sellerId,
      ...(state !== undefined && { state }),
      ...(cityDeliveryTimes !== undefined && { cityDeliveryTimes: cityDeliveryTimes }),
    };

    await prisma.stores.create({
      data: storeData,
    });

    // Notify all admins that this seller has set up their shop and needs approval
    try {
      const seller = await prisma.sellers.findUnique({
        where: { id: sellerId },
        select: { name: true, email: true },
      });
      const admins = await prisma.admins.findMany({ select: { id: true } });
      for (const admin of admins) {
        await publishToQueue("NOTIFICATION_QUEUE", {
          userId: admin.id,
          title: "Seller Shop Created",
          message: `Seller ${seller?.name ?? "Unknown"} (${seller?.email ?? sellerId}) has set up their shop and is awaiting approval.`,
          type: "WARNING",
          category: "SYSTEM",
          metadata: { sellerId },
          channels: ["IN_APP", "EMAIL"],
        });
      }
    } catch (notifyErr) {
      console.error("Failed to notify admins of new store creation:", notifyErr);
    }

    res.status(201).json({
      success: true,
      message: "Store created successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller?.id;
    const validatedData = validate(updateStoreSchema, req.body);

    const store = await prisma.stores.findUnique({ where: { sellerId } });
    if (!store) {
      return next(new ValidationError("Store not found for this seller"));
    }

    const updatedStore = await prisma.stores.update({
      where: { id: store.id },
      data: {
        ...validatedData,
        name: validatedData.name || store.name,
        bio: validatedData.bio || store.bio,
        address: validatedData.address || store.address,
        opening_hours: validatedData.opening_hours || store.opening_hours,
        closing_hours: validatedData.closing_hours || store.closing_hours,
        city: validatedData.city || store.city,
        pincode: validatedData.pincode || store.pincode,
        availableCities: validatedData.availableCities || store.availableCities,
      },
    });

    res.status(200).json({
      success: true,
      message: "Store updated successfully!",
      store: updatedStore,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceableAreas = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stores = await prisma.stores.findMany({
      select: {
        city: true,
        availableCities: true,
        pincode: true,
      },
    });

    const citySet = new Set<string>();
    const pincodeSet = new Set<string>();

    for (const store of stores) {
      citySet.add(store.city);
      store.availableCities.forEach((c) => citySet.add(c));
      pincodeSet.add(store.pincode);
    }

    return res.status(200).json({
      success: true,
      cities: Array.from(citySet).sort(),
      pincodes: Array.from(pincodeSet),
    });
  } catch (error) {
    return next(error);
  }
};

export const checkPincode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { pincode } = req.query;
    if (!pincode) {
      return next(new ValidationError("Pincode is required"));
    }

    const store = await prisma.stores.findFirst({
      where: {
        OR: [
          { pincode: String(pincode) },
          { availableCities: { has: String(pincode) } },
        ],
      },
          select: {
          id: true,
          name: true,
          city: true,
          state: true,
          opening_hours: true,
          closing_hours: true,
          availableCities: true,
          cityDeliveryTimes: true,
        },
      });

      if (!store) {
        return res.status(200).json({
          success: false,
          message: "No store found for this pincode",
        });
      }

      // Calculate openness
      const now = new Date();
      const nowTotal = now.getHours() * 60 + now.getMinutes();
      const toMins = (timeStr: string) => {
        const [h, m] = timeStr.split(":").map(Number);
        return (h || 0) * 60 + (m || 0);
      };
      
      const openTotal = toMins(store.opening_hours || "09:00");
      const closeTotal = toMins(store.closing_hours || "23:00");
      const isOpen = nowTotal >= openTotal && nowTotal <= closeTotal;

      res.status(200).json({
        success: true,
        store: {
          ...store,
          isOpen,
        },
      });
  } catch (error) {
    next(error);
  }
};
