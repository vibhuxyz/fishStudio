import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prisma } from "@repo/db";
import { NextFunction, Request, Response } from "express";

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
            selectedOptions: item.selectedOptions || {},
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

    try {
      for (const item of items) {
        await prisma.products.update({
          where: { id: item.productId },
          data: { 
            stock: { decrement: item.quantity },
            totalSold: { increment: item.quantity }
          }
        });
      }
    } catch (stockError) {
      console.error("Failed to update stock during order creation:", stockError);
    }

    try {
      const user = req.user as { phone_number?: string; name?: string } | undefined;
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
        console.log(`[SMS] Order #${shortId} confirmation queued for ${user?.phone_number}`);
      }
    } catch (smsErr) {
      console.error("[SMS] Failed to log SMS notification:", smsErr);
    }

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
    const mappedOrders = orders.map((o: any) => ({
      ...o,
      items: o.orderItems,
      total: o.totalAmount,
    }));
    res.status(200).json({ success: true, orders: mappedOrders });

  } catch (error) {
    next(error);
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
    
    const orderData = {
      ...order,
      items: order.orderItems,
      total: order.totalAmount,
    };

    res.status(200).json({ success: true, order: orderData });

  } catch (error) {
    next(error);
  }
};
