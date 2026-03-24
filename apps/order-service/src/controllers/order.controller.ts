import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prisma } from "@repo/db";
import { NextFunction, Request, Response } from "express";

export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller?.id;
    const store = await prisma.stores.findUnique({ where: { sellerId } });
    
    // fetch all orders for this shop
    const orders = await prisma.order.findMany({
      where: { storeId: store?.id },
      include: {
        user: true,
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    
    res.status(200).json({ success: true, orders });
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

    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
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
    }

    return res.status(200).json({
      success: true,
      message: action === "accept" ? "Order accepted successfully" : "Order rejected and refund initiated",
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};
