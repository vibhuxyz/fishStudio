import { Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { AuthRequest, getRequiredParam } from "./utils.js";

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
    const updateData: Record<string, any> = {};
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
      where: { id: eventId },
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
