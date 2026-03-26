import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prisma } from "@repo/db";
import { NextFunction, Response } from "express";
import { invalidateSellerStatsCache } from "./utils.js";

export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = req.seller?.store?.id;
    if (!storeId) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { storeId },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          totalAmount: true,
          discountAmount: true,
          couponCode: true,
          deliverySlot: true,
          deliveryName: true,
          deliveryPhone: true,
          deliveryAddress: true,
          deliveryCity: true,
          deliveryPincode: true,
          deliveryCharge: true,
          billDetails: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, name: true, phone_number: true, email: true },
          },
          orderItems: {
            select: {
              id: true,
              quantity: true,
              price: true,
              selectedOptions: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  sale_price: true,
                  images: { select: { url: true }, take: 1 },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where: { storeId } }),
    ]);

    const mappedOrders = orders.map((o: any) => ({
      ...o,
      items: o.orderItems,
      total: o.totalAmount,
    }));

    res.status(200).json({
      success: true,
      orders: mappedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    next(error);
  }
};

export const acceptOrRejectOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const { action, rejectionReason } = req.body;

    if (!orderId || !action) return next(new ValidationError("orderId and action are required"));
    if (action !== "accept" && action !== "reject") return next(new ValidationError("action must be 'accept' or 'reject'"));
    if (action === "reject" && !rejectionReason?.trim()) return next(new ValidationError("A rejection reason is required"));

    const existingOrder = await prisma.order.findUnique({ 
      where: { id: orderId },
      include: { orderItems: true }
    });
    if (!existingOrder) return next(new NotFoundError("Order not found"));

    let updatedOrder;
    if (action === "accept") {
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: "ACCEPTED", rejectionReason: null, updatedAt: new Date() },
      });
    } else {
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: "REJECTED", rejectionReason: rejectionReason.trim(), paymentStatus: "REFUNDED", updatedAt: new Date() },
      });

      try {
        for (const item of existingOrder.orderItems) {
          await prisma.products.update({
            where: { id: item.productId },
            data: { 
              stock: { increment: item.quantity },
              totalSold: { decrement: item.quantity }
            }
          });
        }
      } catch (stockError) {
        console.error("Failed to restore stock during order rejection:", stockError);
      }
    }

    await invalidateSellerStatsCache(req.seller?.id);

    return res.status(200).json({
      success: true,
      message: action === "accept" ? "Order accepted successfully" : "Order rejected and refund initiated",
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatus = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowed = ["SHIPPED", "DELIVERED", "CANCELLED"];
    if (!allowed.includes(status)) {
      return next(new ValidationError(`Status must be one of: ${allowed.join(", ")}`));
    }

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) return next(new NotFoundError("Order not found"));

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status, updatedAt: new Date() },
    });

    await invalidateSellerStatsCache(req.seller?.id);

    return res.status(200).json({ success: true, order: updated });
  } catch (error) {
    return next(error);
  }
};
