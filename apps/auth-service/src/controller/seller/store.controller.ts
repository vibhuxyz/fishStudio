import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { ValidationError } from "@repo/error-handlers";

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
      sellerId,
      city,
      pincode,
      state,
      availableCities,
      cityDeliveryTimes,
    } = req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !city ||
      !sellerId ||
      !pincode ||
      !availableCities
    ) {
      return next(new ValidationError("All fields are required"));
    }

    const storeData: any = {
      name,
      bio,
      address,
      city,
      pincode,
      opening_hours,
      availableCities,
      sellerId,
      ...(state !== undefined && { state }),
      ...(cityDeliveryTimes !== undefined && { cityDeliveryTimes: cityDeliveryTimes }),
    };

    await prisma.stores.create({
      data: storeData,
    });

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
    const sellerId = req.user?.id;
    const {
      name,
      bio,
      address,
      opening_hours,
      city,
      pincode,
      state,
      availableCities,
      cityDeliveryTimes,
    } = req.body;

    const store = await prisma.stores.findUnique({ where: { sellerId } });
    if (!store) {
      return next(new ValidationError("Store not found for this seller"));
    }

    const updatedStore = await prisma.stores.update({
      where: { id: store.id },
      data: {
        name: name || store.name,
        bio: bio || store.bio,
        address: address || store.address,
        opening_hours: opening_hours || store.opening_hours,
        city: city || store.city,
        pincode: pincode || store.pincode,
        ...(state !== undefined && { state: state || store.state }),
        availableCities: availableCities || store.availableCities,
        ...(cityDeliveryTimes !== undefined && { cityDeliveryTimes: cityDeliveryTimes }),
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
      where: { pincode: String(pincode) },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
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

    res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    next(error);
  }
};
