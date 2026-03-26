import { Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { AuthRequest, getRequiredParam } from "./utils.js";
import { createEventSchema, updateEventSchema, validate } from "@repo/zod-schema";

export const createSellerEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "seller" || !req.seller?.id) {
      return next(new ValidationError("Only seller can create events!"));
    }
    const { title, description, type, minOrder, discount, startTime, endTime, firstOrderCoupon } =
      validate(createEventSchema, req.body) as any;
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Auto-create a first-order coupon if provided with this event
    let createdCoupon = null;
    if (firstOrderCoupon) {
      const existing = await prisma.discount_codes.findUnique({
        where: { discountCode: firstOrderCoupon.discountCode },
      });
      if (existing) {
        return next(
          new ValidationError(
            `Coupon code "${firstOrderCoupon.discountCode}" already exists. Choose a different code.`,
          ),
        );
      }
      createdCoupon = await prisma.discount_codes.create({
        data: {
          public_name: firstOrderCoupon.public_name,
          discountType: firstOrderCoupon.discountType,
          discountValue: firstOrderCoupon.discountValue,
          discountCode: firstOrderCoupon.discountCode,
          minOrderValue: firstOrderCoupon.minOrderValue ?? 0,
          expiresAt: firstOrderCoupon.expiresAt ? new Date(firstOrderCoupon.expiresAt) : null,
          maxUsesPerUser: 1, // always once per user
          isFirstOrder: true,
          sellerId: req.seller.id,
        },
      });
    }

    const event = await prisma.seller_events.create({
      data: {
        sellerId: req.seller.id,
        title: String(title).trim(),
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
        type: type as "FREE_DELIVERY" | "DISCOUNT" | "FLASH_SALE",
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
      ...(createdCoupon ? { firstOrderCoupon: createdCoupon } : {}),
      message: createdCoupon
        ? "Event and first-order coupon created successfully!"
        : "Seller event created successfully!",
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
      where: { id: eventId },
      select: { id: true, sellerId: true },
    });
    if (!existingEvent) {
      return next(new NotFoundError("Event not found!"));
    }
    if (existingEvent.sellerId !== req.seller.id) {
      return next(
        new ValidationError("You are not authorized to update this event!"),
      );
    }
    const updateData = validate(updateEventSchema, req.body);
    if (updateData.startTime) {
      (updateData as any).startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime) {
      (updateData as any).endTime = new Date(updateData.endTime);
    }
    const updatedEvent = await prisma.seller_events.update({
      where: { id: eventId },
      data: updateData as any,
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
      where: { id: eventId },
      select: { id: true, sellerId: true },
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
      where: { id: eventId },
    });
    return res.status(200).json({
      success: true,
      message: "Event deleted successfully!",
    });
  } catch (error) {
    return next(error);
  }
};
