import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { Response, NextFunction } from "express";
import { ValidationError } from "@repo/error-handlers";
import { redis } from "@repo/libs";
import { 
  Period, 
  getPeriodStart, 
  computeStats, 
  STATS_CACHE_TTL 
} from "./utils.js";

async function hydrateOrders(orders: any[]) {
  if (orders.length === 0) return [];

  const storeIds = [...new Set(orders.map(o => o.storeId))];
  const productIds = [...new Set(orders.flatMap(o => o.orderItems.map((oi: any) => oi.productId)))];

  const [stores, products] = await Promise.all([
    prismaMongo.stores.findMany({
      where: { id: { in: storeIds } },
      include: { seller: { select: { id: true, name: true, email: true } } }
    }),
    prismaMongo.products.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, category: true, images: { take: 1 } }
    })
  ]);

  const storeMap = new Map(stores.map(s => [s.id, s]));
  const productMap = new Map(products.map(p => [p.id, p]));

  return orders.map(o => ({
    ...o,
    store: storeMap.get(o.storeId),
    orderItems: o.orderItems.map((oi: any) => ({
      ...oi,
      product: productMap.get(oi.productId)
    }))
  }));
}

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

    const ordersRaw = await prismaPostgres.order.findMany({
      where: { storeId, createdAt: { gte: since } },
      include: {
        orderItems: true
      },
    });

    const orders = await hydrateOrders(ordersRaw);
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
      // Stores are in Mongo
      const store = await prismaMongo.stores.findUnique({ where: { sellerId } });
      storeId = store?.id;
    }

    const ordersRaw = await prismaPostgres.order.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        createdAt: { gte: since },
      },
      include: {
        orderItems: true
      },
    });

    const orders = await hydrateOrders(ordersRaw);
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
