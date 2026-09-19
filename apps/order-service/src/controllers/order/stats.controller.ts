import { prismaPostgres, toMoney, type Prisma } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { Response, NextFunction } from "express";
import { ValidationError } from "@repo/error-handlers";
import { redis } from "@repo/libs/redis";
import { 
  Period, 
  getPeriodStart, 
  computeStats, 
  statsCacheTtl 
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

  // Money arrives from Postgres as Decimal. computeStats sums these with `+`
  // and `*`, which on a Decimal would concatenate strings instead of adding,
  // so the conversion happens here — the single funnel both stats endpoints
  // pass through — rather than being repeated at every arithmetic site.
  return orders.map(o => ({
    ...o,
    totalAmount: toMoney(o.totalAmount),
    discountAmount: toMoney(o.discountAmount),
    deliveryCharge: toMoney(o.deliveryCharge),
    store: storeMap.get(o.storeId),
    orderItems: o.orderItems.map((oi: any) => ({
      ...oi,
      price: toMoney(oi.price),
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
      // Only the columns the rollup actually reads. `include` pulled all 49
      // columns of Order — delivery coordinates, landmarks, staff photos,
      // invoice numbers — for every order in the period, to compute totals
      // that touch seven of them. On a metered database that is paid for
      // twice, in the scan and in the bytes shipped back.
      select: {
        id: true,
        userId: true,
        storeId: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        discountAmount: true,
        deliveryCharge: true,
        orderItems: {
          select: { productId: true, quantity: true, price: true },
        },
      },
    });

    const orders = await hydrateOrders(ordersRaw);
    const stats = computeStats(orders);

    try {
      await redis.set(cacheKey, JSON.stringify({ stats }), "EX", statsCacheTtl(period));
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
      // Only the columns the rollup actually reads. `include` pulled all 49
      // columns of Order — delivery coordinates, landmarks, staff photos,
      // invoice numbers — for every order in the period, to compute totals
      // that touch seven of them. On a metered database that is paid for
      // twice, in the scan and in the bytes shipped back.
      select: {
        id: true,
        userId: true,
        storeId: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        discountAmount: true,
        deliveryCharge: true,
        orderItems: {
          select: { productId: true, quantity: true, price: true },
        },
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
      await redis.set(cacheKey, JSON.stringify(payload), "EX", statsCacheTtl(period));
    } catch {
      // Non-fatal
    }

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

const ADMIN_ORDERS_DEFAULT_LIMIT = 20;
const ADMIN_ORDERS_MAX_LIMIT = 100;

/** Enum values whose name contains the search term, for the free-text box. */
function matchEnum<T extends string>(values: readonly T[], term: string): T[] {
  return values.filter((value) => value.toLowerCase().includes(term));
}

const ORDER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED_TO_RIDER",
  "REJECTED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const PAYMENT_METHODS = ["COD", "RAZORPAY", "ONLINE"] as const;

/**
 * The seller's order history, one page at a time.
 *
 * Paginated and searched in Postgres rather than in the browser. This used to
 * return every order the store had ever taken — all 49 columns, every order
 * item, every one of them hydrated against Mongo — so that the admin page could
 * filter the array client-side. That is a query with no upper bound: it gets
 * slower and more expensive every day the seller trades, and it was re-run on
 * every visit to two different pages.
 *
 * The headline figures are the reason this could not simply be truncated: they
 * are sums over the seller's whole history, and a page of twenty orders cannot
 * produce them. They come back as SQL aggregates instead — one extra round trip
 * that reads an index and returns four numbers, rather than shipping the table
 * to Node to be added up there.
 */
export const getAdminSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId) return next(new ValidationError("sellerId is required"));

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      ADMIN_ORDERS_MAX_LIMIT,
      Math.max(1, Number(req.query.limit) || ADMIN_ORDERS_DEFAULT_LIMIT),
    );
    const search = String(req.query.search ?? "").trim().toLowerCase();
    const status = String(req.query.status ?? "").trim().toUpperCase();

    if (status && !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
      return next(new ValidationError(`Unknown order status: ${status}`));
    }

    // Stores are in Mongo
    const store = await prismaMongo.stores.findUnique({ 
      where: { sellerId },
      include: { seller: { select: { id: true, name: true, email: true } } }
    });
    if (!store) {
      return res.status(200).json({
        success: true,
        orders: [],
        seller: null,
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        totals: { totalOrders: 0, totalEarned: 0, totalRefunded: 0, pendingCOD: 0 },
      });
    }

    /* The search box is one free-text field over an id and two enums, so it is
       matched the way each column allows: a prefix match on the id, and an
       expansion of the term to the enum values whose names contain it. Prisma
       cannot do `contains` on an enum column, and casting one to text per row
       would give up the index for a search that is really over nine constants. */
    const searchFilter: Prisma.OrderWhereInput[] = [];
    if (search) {
      const statuses = matchEnum(ORDER_STATUSES, search);
      const methods = matchEnum(PAYMENT_METHODS, search);

      searchFilter.push({ id: { contains: search, mode: "insensitive" } });
      searchFilter.push({ orderNumber: { contains: search, mode: "insensitive" } });
      if (statuses.length > 0) searchFilter.push({ status: { in: statuses } });
      if (methods.length > 0) searchFilter.push({ paymentMethod: { in: methods } });
    }

    const where: Prisma.OrderWhereInput = {
      storeId: store.id,
      ...(status ? { status: status as (typeof ORDER_STATUSES)[number] } : {}),
      ...(searchFilter.length > 0 ? { OR: searchFilter } : {}),
    };

    const [ordersRaw, total, totals] = await Promise.all([
      prismaPostgres.order.findMany({
        where,
        include: { orderItems: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismaPostgres.order.count({ where }),
      // Whole-history figures for the summary tiles, unaffected by the search
      // or the page — same scope the client-side reduce had. One statement with
      // FILTER clauses rather than four aggregate queries, because each one
      // would be its own round trip for a single number.
      prismaPostgres.$queryRaw<
        Array<{
          totalOrders: number;
          totalEarned: Prisma.Decimal;
          totalRefunded: Prisma.Decimal;
          pendingCOD: number;
        }>
      >`
        SELECT
          count(*)::int AS "totalOrders",
          COALESCE(sum("totalAmount") FILTER (
            WHERE ("paymentMethod" = 'COD' AND "status" = 'DELIVERED')
               OR ("paymentMethod" IS DISTINCT FROM 'COD' AND "paymentStatus" = 'COMPLETED')
          ), 0) AS "totalEarned",
          COALESCE(sum("totalAmount") FILTER (
            WHERE "paymentStatus" = 'REFUNDED'
          ), 0) AS "totalRefunded",
          count(*) FILTER (
            WHERE "paymentMethod" = 'COD'
              AND "status" NOT IN ('DELIVERED', 'REJECTED', 'CANCELLED')
          )::int AS "pendingCOD"
        FROM "Order"
        WHERE "storeId" = ${store.id}
      `,
    ]);

    const orders = await hydrateOrders(ordersRaw);
    const summary = totals[0];

    return res.status(200).json({
      success: true,
      orders,
      seller: store.seller || null,
      store,
      // Same shape as the admin order list, so the console's existing pager
      // component works against this endpoint unchanged.
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      totals: {
        totalOrders: summary?.totalOrders ?? 0,
        totalEarned: toMoney(summary?.totalEarned),
        totalRefunded: toMoney(summary?.totalRefunded),
        pendingCOD: summary?.pendingCOD ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
