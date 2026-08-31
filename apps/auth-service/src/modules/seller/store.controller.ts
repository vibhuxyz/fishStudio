import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { ValidationError } from "@repo/error-handlers";
import { storeSchema, updateStoreSchema, validate } from "@repo/zod-schema";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { redis } from "@repo/libs/redis";
import { logger } from "@repo/libs/logger";
import {
  isStoreOpenNow,
  isInstantDeliveryAvailableNow,
} from "@repo/shared/store-hours";
import type { AuthenticatedRequest } from "../../types/auth-request.js";

export const createStore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller?.id;
    if (!sellerId) {
      return next(new ValidationError("Only authenticated sellers can create a store"));
    }

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
      gst_rate,
      packaging_charge,
      base_delivery_charge,
      free_delivery_threshold,
      city,
      pincode,
      state,
      availableCities,
      cityDeliveryTimes,
      areaPincodes,
      areaCities,
    } = validate(storeSchema, req.body);

    const existing = await prisma.stores.findFirst({ where: { sellerId } });
    if (existing) {
      return next(new ValidationError("A store already exists for this seller"));
    }

    // Every serviceable area must carry the pincode it falls under and the
    // real city it sits in — a pincode can span areas in different cities
    // (e.g. a Noida store's 201001 pincode covers a Ghaziabad locality).
    const missingPincode = availableCities.find((area) => !areaPincodes?.[area]);
    if (missingPincode) {
      return next(new ValidationError(`"${missingPincode}" is missing a pincode`));
    }
    const missingCity = availableCities.find((area) => !areaCities?.[area]);
    if (missingCity) {
      return next(new ValidationError(`"${missingCity}" is missing a city`));
    }
    const servicePincodes = Array.from(new Set(Object.values(areaPincodes ?? {})));

    const storeData: Parameters<typeof prisma.stores.create>[0]["data"] = {
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
      gst_rate,
      packaging_charge,
      base_delivery_charge,
      free_delivery_threshold,
      availableCities,
      areaPincodes,
      areaCities,
      servicePincodes,
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
      logger.error("Failed to notify admins of new store creation", notifyErr);
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
  req: AuthenticatedRequest,
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

    const availableCities = validatedData.availableCities || store.availableCities;
    const areaPincodes = validatedData.areaPincodes ?? (store.areaPincodes as Record<string, string> | null) ?? {};
    const areaCities = validatedData.areaCities ?? (store.areaCities as Record<string, string> | null) ?? {};
    if (validatedData.availableCities || validatedData.areaPincodes) {
      const missingPincode = availableCities.find((area) => !areaPincodes[area]);
      if (missingPincode) {
        return next(new ValidationError(`"${missingPincode}" is missing a pincode`));
      }
    }
    if (validatedData.availableCities || validatedData.areaCities) {
      const missingCity = availableCities.find((area) => !areaCities[area]);
      if (missingCity) {
        return next(new ValidationError(`"${missingCity}" is missing a city`));
      }
    }
    const servicePincodes = Array.from(new Set(Object.values(areaPincodes)));

    const updatedStore = await prisma.stores.update({
      where: { id: store.id },
      data: {
        ...validatedData,
        // Never seller-settable, even if a client sends it: it is the middle
        // segment of this store's order numbers. Admin-only, via
        // updateAdminStoreSettings.
        locationCode: undefined,
        name: validatedData.name || store.name,
        bio: validatedData.bio || store.bio,
        address: validatedData.address || store.address,
        opening_hours: validatedData.opening_hours || store.opening_hours,
        closing_hours: validatedData.closing_hours || store.closing_hours,
        city: validatedData.city || store.city,
        pincode: validatedData.pincode || store.pincode,
        availableCities,
        areaPincodes,
        areaCities,
        servicePincodes,
      },
    });

    // Bust the slim-store Redis cache so the next getSeller call returns
    // fresh data with all store fields populated.
    await redis.set(`cache:bypass:seller:${sellerId}`, "1", "EX", 30).catch(() => {});

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
        servicePincodes: true,
      },
    });

    const citySet = new Set<string>();
    const pincodeSet = new Set<string>();

    for (const store of stores) {
      citySet.add(store.city);
      store.availableCities.forEach((c) => citySet.add(c));
      pincodeSet.add(store.pincode);
      store.servicePincodes.forEach((p) => pincodeSet.add(p));
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
          { servicePincodes: { has: String(pincode) } },
        ],
      },
          select: {
          id: true,
          name: true,
          city: true,
          state: true,
          opening_hours: true,
          closing_hours: true,
          is_instant_delivery_enabled: true,
          instant_delivery_window_start: true,
          instant_delivery_window_end: true,
          availableCities: true,
          cityDeliveryTimes: true,
          areaPincodes: true,
          areaCities: true,
        },
      });

      if (!store) {
        return res.status(200).json({
          success: false,
          message: "No store found for this pincode",
        });
      }

      const isOpen = isStoreOpenNow(store);
      const isInstantAvailable = isInstantDeliveryAvailableNow(store);

      // A pincode can contain several areas, each with its own delivery
      // time — surface which ones so the client can prompt for area
      // selection instead of guessing a single time for the whole pincode.
      const areaPincodes = (store.areaPincodes as Record<string, string> | null) ?? {};
      const matchedAreas = Object.entries(areaPincodes)
        .filter(([, p]) => p === String(pincode))
        .map(([area]) => area);

      res.status(200).json({
        success: true,
        store: {
          ...store,
          isOpen,
          isInstantAvailable,
        },
        matchedAreas,
      });
  } catch (error) {
    next(error);
  }
};
