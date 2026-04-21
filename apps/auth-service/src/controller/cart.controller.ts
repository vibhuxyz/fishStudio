import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/save-cart
   Upserts (creates or updates) the user's server-side cart snapshot.
   Called by the frontend whenever the cart changes (debounced, ~5s).
   Body: { items, storeId?, storeName?, totalAmount }
───────────────────────────────────────────────────────────────────────── */
export const saveCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { items, storeId, storeName, totalAmount } = req.body as {
      items: any[];
      storeId?: string;
      storeName?: string;
      totalAmount?: number;
    };

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "items must be an array" });
    }

    // If cart is empty, clear it — the user removed everything
    if (items.length === 0) {
      await prisma.abandoned_carts.deleteMany({ where: { userId } });
      return res.status(200).json({ success: true, message: "Cart cleared" });
    }

    const existing = await prisma.abandoned_carts.findFirst({ where: { userId } });

    if (existing) {
      await prisma.abandoned_carts.update({
        where: { id: existing.id },
        data: {
          items,
          storeId: storeId ?? existing.storeId,
          storeName: storeName ?? existing.storeName,
          totalAmount: totalAmount ?? existing.totalAmount,
          isConverted: false, // user edited the cart → reset conversion flag
          notifiedAt: null,   // reset notification so reminder can be sent again
        },
      });
    } else {
      await prisma.abandoned_carts.create({
        data: {
          userId,
          items,
          storeId: storeId ?? null,
          storeName: storeName ?? null,
          totalAmount: totalAmount ?? 0,
        },
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/clear-cart
   Marks the user's cart as converted (order placed).
   Called by the frontend after a successful order creation.
───────────────────────────────────────────────────────────────────────── */
export const clearCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    await prisma.abandoned_carts.updateMany({
      where: { userId },
      data: { isConverted: true },
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};
