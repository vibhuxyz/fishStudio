import { prisma } from "@repo/db";
import { Response, NextFunction } from "express";
import { ValidationError } from "@repo/error-handlers";
import { redis } from "@repo/libs";
import { 
  Period, 
  getPeriodStart, 
  computeStats, 
  STATS_CACHE_TTL 
} from "./utils.js";

export const getSellerStats = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const period = (req.query.period as Period) || "month";
    if (!["week", "month", "year"].includes(period)) {
      return next(new ValidationError("period must be week, month, or year"));
    }

    const sellerId = req.seller?.id;
    const cacheKey = `stats:seller:${sellerId}:${period}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const { stats } = JSON.parse(cached);
        return res.status(200).json({ success: true, period, stats, cached: true });
      }
    } catch {
      // Redis unavailable
    }

    const storeId = req.seller?.store?.id;
    if (!storeId) {
      return res.status(200).json({ success: true, stats: null, message: "No store found" });
    }

    const since = getPeriodStart(period);

    const orders = await prisma.order.findMany({
      where: { storeId, createdAt: { gte: since } },
      include: {
        store: { select: { pincode: true, name: true, id: true } },
        orderItems: {
          include: {
            product: { select: { id: true, title: true, images: { take: 1 } } },
          },
        },
      },
    });

    const stats = computeStats(orders);

    try {
      await redis.set(cacheKey, JSON.stringify({ stats }), "EX", STATS_CACHE_TTL);
    } catch {
      // Non-fatal
    }

    return res.status(200).json({ success: true, period, stats });
  } catch (error) {
    return next(error);
  }
};

export const getAdminStats = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const period = (req.query.period as Period) || "month";
    const sellerId = req.params.sellerId as string | undefined;

    if (!["week", "month", "year"].includes(period)) {
      return next(new ValidationError("period must be week, month, or year"));
    }

    const cacheKey = sellerId
      ? `stats:admin:seller:${sellerId}:${period}`
      : `stats:admin:all:${period}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({ ...JSON.parse(cached), cached: true });
      }
    } catch {
      // Redis unavailable
    }

    const since = getPeriodStart(period);

    let storeId: string | undefined;
    if (sellerId) {
      const store = await prisma.stores.findUnique({ where: { sellerId } });
      storeId = store?.id;
    }

    const orders = await prisma.order.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        createdAt: { gte: since },
      },
      include: {
        store: { select: { pincode: true, name: true, id: true, seller: { select: { id: true, name: true, email: true } } } },
        orderItems: {
          include: {
            product: { select: { id: true, title: true, images: { take: 1 } } },
          },
        },
      },
    });

    const stats = computeStats(orders);

    let perSellerBreakdown: any[] = [];
    if (!sellerId) {
      const sellerMap: Record<string, { name: string; email: string; orders: any[] }> = {};
      for (const order of orders) {
        const seller = (order as any).store?.seller;
        if (!seller) continue;
        if (!sellerMap[seller.id]) {
          sellerMap[seller.id] = { name: seller.name, email: seller.email, orders: [] };
        }
        sellerMap[seller.id]?.orders.push(order);
      }

      perSellerBreakdown = Object.entries(sellerMap).map(([sid, data]) => ({
        sellerId: sid,
        name: data.name,
        email: data.email,
        ...computeStats(data.orders),
      }));

      perSellerBreakdown.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    const payload = {
      success: true,
      period,
      stats,
      ...(perSellerBreakdown.length ? { perSellerBreakdown } : {}),
    };

    try {
      await redis.set(cacheKey, JSON.stringify(payload), "EX", STATS_CACHE_TTL);
    } catch {
      // Non-fatal
    }

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};
