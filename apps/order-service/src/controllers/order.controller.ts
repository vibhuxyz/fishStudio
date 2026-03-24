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

export const createOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const {
      storeId,
      items,
      deliveryDetails,
      billDetails,
      paymentMethod,
      totalAmount,
      discountAmount,
      couponCode,
      deliverySlot,
    } = req.body;

    if (!storeId || !items || !items.length || !deliveryDetails) {
      return next(new ValidationError("Missing required order fields"));
    }

    const order = await prisma.order.create({
      data: {
        userId,
        storeId,
        totalAmount,
        discountAmount: discountAmount || 0,
        couponCode,
        deliveryName: deliveryDetails.name,
        deliveryPhone: deliveryDetails.phone,
        deliveryAddress: deliveryDetails.address,
        deliveryCity: deliveryDetails.city,
        deliveryPincode: deliveryDetails.pincode,
        deliveryCharge: billDetails.deliveryCharge || 0,
        billDetails,
        deliverySlot: deliverySlot || "evening",
        paymentMethod: paymentMethod || "COD",
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // ── SMS Notification ──────────────────────────────────────────────────────
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { phone_number: true, name: true },
      });

      const shortId = order.id.slice(-6).toUpperCase();
      const slotLabel =
        order.deliverySlot === "instant" ? "Instant (30-45 min)" :
        order.deliverySlot === "morning" ? "Morning (6AM-10AM)" :
        order.deliverySlot === "evening" ? "Evening (5PM-9PM)" : "Scheduled";

      const smsMessage =
        `Hi ${user?.name || "there"}! Your FishStudio order #${shortId} has been placed. ` +
        `Total: ₹${order.totalAmount} | Slot: ${slotLabel} | Payment: ${order.paymentMethod}. ` +
        `We'll notify you once it's accepted.`;

      if (process.env.NODE_ENV !== "production") {
        console.log("\n📱 ─────────────────────────────────────────");
        console.log(`   SMS → ${user?.phone_number}`);
        console.log(`   ${smsMessage}`);
        console.log("─────────────────────────────────────────\n");
      } else {
        // TODO: Replace with actual SMS provider (Twilio / AWS SNS / MSG91)
        console.log(`[SMS] Order #${shortId} confirmation queued for ${user?.phone_number}`);
      }
    } catch (smsErr) {
      // Non-fatal: do not fail the order if SMS logging fails
      console.error("[SMS] Failed to log SMS notification:", smsErr);
    }
    // ─────────────────────────────────────────────────────────────────────────

    res.status(201).json({ success: true, orderId: order.id, order });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        store: true,
        orderItems: {
          include: {
            product: {
              include: { images: true }
            }
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
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

    return res.status(200).json({ success: true, order: updated });
  } catch (error) {
    return next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: orderId as string },
      include: {
        store: true,
        orderItems: {
          include: {
            product: {
              include: { images: true }
            }
          }
        },
      },
    });

    if (!order) return next(new NotFoundError("Order not found"));
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
