import { redis } from "@repo/libs/redis";
import { prismaMongo } from "@repo/db-mongo";
import { prismaPostgres, toMoney, toMoneyOrNull, type Prisma } from "@repo/db-postgres";
import { logger } from "@repo/libs/logger";

export const STATS_CACHE_TTL = 120; // 2 minutes

/**
 * The order id shown to customers is never the raw cuid — every client
 * (mobile, user-ui, admin-ui, seller-ui) derives its own display string from
 * it, e.g. "#" + last 6/8 chars, or mobile's "FS" + last 10 chars. Users
 * paste these display strings straight into search boxes, so a raw
 * `contains` match against `Order.id` fails unless the known display
 * affordances are stripped first.
 */
export function normalizeOrderIdFragment(raw: string): string {
  return raw.trim().replace(/^#/, "").replace(/^FS/i, "");
}

// Shared Mongo `select` shapes for admin order endpoints — identical fields
// requested by both the list and detail views, kept in one place so the two
// don't silently drift out of sync.
export const ADMIN_ORDER_CUSTOMER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone_number: true,
  addresses: true,
  createdAt: true,
} as const;

export const ADMIN_ORDER_SELLER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone_number: true,
  isApprovedByAdmin: true,
  createdAt: true,
} as const;

/**
 * Self-heals orders that are DELIVERED but still show a PENDING payment
 * (e.g. a COD order whose delivery-triggered payment update never landed).
 * Fire-and-forget: called after the response data has already been read,
 * so a failure here just means the fix is retried next time the order is read.
 */
export function queueStalePaymentFix(orderIds: string[]) {
  if (orderIds.length === 0) return;
  prismaPostgres.order
    .updateMany({
      where: { id: { in: orderIds } },
      data: { paymentStatus: "COMPLETED" },
    })
    .catch(() => {});
}

/**
 * Order responses are assembled by spreading the Prisma row (`{ ...order }`),
 * which carries the numeric(12,2) columns through as Decimal objects. Those
 * JSON-encode as strings, so every such response spreads these overrides on
 * top to restore the numbers clients already parse.
 */
export const orderMoneyFields = (order: {
  totalAmount: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  deliveryCharge: Prisma.Decimal;
  deliveryLatitude?: Prisma.Decimal | null;
  deliveryLongitude?: Prisma.Decimal | null;
}) => ({
  totalAmount: toMoney(order.totalAmount),
  discountAmount: toMoney(order.discountAmount),
  deliveryCharge: toMoney(order.deliveryCharge),
  // toMoneyOrNull (not toMoney) — 0,0 is a real coordinate (Gulf of Guinea),
  // so a missing pin must stay null rather than coerce to it.
  deliveryLatitude: toMoneyOrNull(order.deliveryLatitude),
  deliveryLongitude: toMoneyOrNull(order.deliveryLongitude),
});

/** Same, for a spread OrderItem row. */
export const orderItemMoneyFields = (item: { price: Prisma.Decimal }) => ({
  price: toMoney(item.price),
});

/**
 * Attaches Mongo-side User/Product/Rider data to a page of Postgres orders.
 * Shared by every order-list endpoint (seller, rider, cutting-staff) so the
 * user/product/rider lookup and money-field mapping stay in one place.
 */
export async function hydrateOrders(orders: any[]) {
  const userIds = [...new Set(orders.map((o) => o.userId))];
  const productIds = [...new Set(orders.flatMap((o) => o.orderItems.map((oi: any) => oi.productId)))];
  const riderIds = [...new Set(orders.map((o) => o.riderId).filter((id): id is string => Boolean(id)))];

  const [users, products, riders] = await Promise.all([
    prismaMongo.users.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, phone_number: true, email: true },
    }),
    prismaMongo.products.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        sale_price: true,
        images: { select: { url: true }, take: 1 },
        // A store variant usually carries no images of its own — the photos
        // are authored once on the catalog root and inherited, so without
        // this fallback every order line renders as a blank placeholder.
        catalogProduct: { select: { images: { select: { url: true }, take: 1 } } },
      },
    }),
    riderIds.length
      ? prismaMongo.staffs.findMany({
          where: { id: { in: riderIds }, role: "RIDER" },
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            vehicleNumber: true,
            riderStatus: true,
            photo: true,
          },
        })
      : [],
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));
  // Keep the response shape unchanged — callers read product.images[0].url —
  // by resolving the inherited catalog image into `images` here.
  const productMap = new Map(
    products.map(({ catalogProduct, ...p }) => [
      p.id,
      { ...p, images: p.images.length > 0 ? p.images : catalogProduct?.images ?? [] },
    ]),
  );
  const riderMap = new Map(riders.map((r) => [r.id, r]));

  return orders.map((o: any) => ({
    ...o,
    ...orderMoneyFields(o),
    user: userMap.get(o.userId),
    rider: o.riderId ? riderMap.get(o.riderId) ?? null : null,
    items: o.orderItems.map((oi: any) => ({
      ...oi,
      ...orderItemMoneyFields(oi),
      product: productMap.get(oi.productId),
    })),
    total: toMoney(o.totalAmount),
  }));
}

export type Period = "week" | "month" | "year";

export const invalidateSellerStatsCache = async (sellerId: string) => {
  try {
    await Promise.all([
      redis.del(`stats:seller:${sellerId}:week`),
      redis.del(`stats:seller:${sellerId}:month`),
      redis.del(`stats:seller:${sellerId}:year`),
    ]);
  } catch {
    // Non-fatal
  }
};

// Whole-fish style products track stock per exact weight instead of one
// shared pool (see `products.trackStockPerSize`/`sizeStock` in the Mongo
// schema). `sizeStock` is stored as an array of { size, qty } rather than a
// { [size]: qty } map because size labels (e.g. "1.1 kg") can contain
// literal dots, which Mongo would otherwise misparse as a nested-path
// separator in a dot-notation update — so the size value is only ever
// compared, never used as a path segment, via `arrayFilters`.
export async function decrementStockItem(
  productId: string,
  quantity: number,
  size: string | undefined,
): Promise<boolean> {
  if (size) {
    const result: Record<string, unknown> = await prismaMongo.$runCommandRaw({
      update: "products",
      updates: [
        {
          q: {
            _id: { $oid: productId },
            sizeStock: { $elemMatch: { size, qty: { $gte: quantity } } },
          },
          u: {
            $inc: {
              "sizeStock.$[elem].qty": -quantity,
              stock: -quantity,
              totalSold: quantity,
            },
          },
          arrayFilters: [{ "elem.size": size }],
        },
      ],
    });
    return Number(result.nModified ?? 0) > 0;
  }

  const result = await prismaMongo.products.updateMany({
    where: { id: productId, stock: { gte: quantity } },
    data: { stock: { decrement: quantity }, totalSold: { increment: quantity } },
  });
  return result.count > 0;
}

export async function restoreStockItem(
  productId: string,
  quantity: number,
  size: string | undefined,
) {
  if (size) {
    await prismaMongo.$runCommandRaw({
      update: "products",
      updates: [
        {
          q: { _id: { $oid: productId }, "sizeStock.size": size },
          u: {
            $inc: {
              "sizeStock.$[elem].qty": quantity,
              stock: quantity,
              totalSold: -quantity,
            },
          },
          arrayFilters: [{ "elem.size": size }],
        },
      ],
    });
    return;
  }

  await prismaMongo.products.update({
    where: { id: productId },
    data: {
      stock: { increment: quantity },
      totalSold: { decrement: quantity },
    },
  });
}

/**
 * Restores stock + totalSold for cancelled/rejected order items.
 * Fire-and-forget: called after the status change is already committed,
 * so a failure here shouldn't fail the request — it's logged and left
 * for manual reconciliation instead.
 */
export function restoreOrderStock(
  orderItems: {
    productId: string;
    quantity: number;
    selectedOptions?: unknown;
  }[],
  context: string,
) {
  return Promise.all(
    orderItems.map((item) => {
      const size =
        item.selectedOptions &&
        typeof item.selectedOptions === "object" &&
        typeof (item.selectedOptions as Record<string, unknown>).size === "string"
          ? ((item.selectedOptions as Record<string, unknown>).size as string)
          : undefined;
      return restoreStockItem(item.productId, item.quantity, size || undefined);
    }),
  ).catch((err) => logger.error(`[${context}] stock restore failed`, { err }));
}

/**
 * Releases a rider's claim on one delivery — decrements activeDeliveryCount
 * and, if that was their only active delivery, flips them back to AVAILABLE
 * so they reappear in the assignment list. Shared by changeRider, removeRider,
 * and updateOrderStatus's DELIVERED/CANCELLED branches — one implementation
 * of this bookkeeping instead of four copies.
 */
export async function releaseRiderIfNoOtherDeliveries(riderId: string): Promise<void> {
  const rider = await prismaMongo.staffs.update({
    where: { id: riderId },
    data: { activeDeliveryCount: { decrement: 1 } },
  });
  if ((rider.activeDeliveryCount ?? 0) <= 0) {
    await prismaMongo.staffs.update({
      where: { id: riderId },
      // Clamp to 0 (rather than leaving it negative) — defends against a
      // double-release race decrementing past zero.
      data: { activeDeliveryCount: 0, riderStatus: "AVAILABLE" },
    });
  }
}

export function getPeriodStart(period: Period): Date {
  const now = new Date();
  if (period === "week") {
    const d = new Date(now);
    d.setDate(now.getDate() - 7);
    return d;
  } else if (period === "month") {
    const d = new Date(now);
    d.setMonth(now.getMonth() - 1);
    return d;
  } else {
    const d = new Date(now);
    d.setFullYear(now.getFullYear() - 1);
    return d;
  }
}

export function computeStats(orders: any[]) {
  let totalRevenue = 0;
  let totalRefundedAmount = 0;
  let totalDelivered = 0;
  let totalCancelled = 0;
  let totalRefunded = 0;
  let totalPending = 0;
  let totalAccepted = 0;
  let totalCouponSpend = 0;

  const pincodeMap: Record<
    string,
    {
      orders: number;
      revenue: number;
      products: Record<string, { title: string; qty: number; revenue: number }>;
      shops: Record<string, { 
        name: string; 
        sales: number; 
        customers: Record<string, number>; 
        products: Record<string, { title: string; qty: number; revenue: number; couponSpend: number }> 
      }>;
    }
  > = {};

  const categoryMap: Record<string, { revenue: number, orders: number }> = {};

  const productMap: Record<
    string,
    {
      title: string;
      category: string;
      orders: number;
      revenue: number;
      image?: string;
      deliveredQty: number;
      cancelledQty: number;
      pendingQty: number;
      refundedQty: number;
      refundedAmount: number;
      couponSpend: number;
      quantaSale: number; // total units ordered
      pincodeBreakdown: Record<string, number>;
      customerOrders: Record<string, number>; // userId -> order count for repeat calc
      orderIds: string[]; // for order history
    }
  > = {};

  for (const order of orders) {
    const amount = order.totalAmount ?? 0;
    const discount = order.discountAmount ?? 0;
    totalCouponSpend += discount;

    if (order.status === "DELIVERED") {
      totalDelivered++;
      totalRevenue += amount;
    } else if (order.status === "CANCELLED" || order.status === "REJECTED") {
      totalCancelled++;
    } else if (order.status === "PENDING") {
      totalPending++;
    } else if (order.status === "ACCEPTED" || order.status === "SHIPPED") {
      totalAccepted++;
      totalRevenue += amount;
    }

    if (order.paymentStatus === "REFUNDED") {
      totalRefunded++;
      totalRefundedAmount += amount;
    }

    const pincode = order.store?.pincode ?? "Unknown";
    const shopId = order.store?.id ?? "Unknown";
    const shopName = order.store?.name ?? "Unknown Store";
    const userId = order.userId;

    if (!pincodeMap[pincode]) {
      pincodeMap[pincode] = { orders: 0, revenue: 0, products: {}, shops: {} };
    }
    pincodeMap[pincode].orders++;
    
    if (!pincodeMap[pincode].shops[shopId]) {
      pincodeMap[pincode].shops[shopId] = { name: shopName, sales: 0, customers: {}, products: {} };
    }
    
    if (!pincodeMap[pincode].shops[shopId].customers[userId]) {
      pincodeMap[pincode].shops[shopId].customers[userId] = 0;
    }
    pincodeMap[pincode].shops[shopId].customers[userId]++;

    if (order.status === "DELIVERED" || order.status === "ACCEPTED") {
      pincodeMap[pincode].revenue += amount;
      pincodeMap[pincode].shops[shopId].sales += amount;
    }

    for (const item of order.orderItems ?? []) {
      const pid = item.productId;
      const product = item.product;
      const qty = item.quantity;
      const price = item.price;
      const itemRevenue = price * qty;
      const itemDiscount = (discount / (order.orderItems.length || 1));

      if (!pincodeMap[pincode].products[pid]) {
        pincodeMap[pincode].products[pid] = {
          title: product?.title ?? "Unknown",
          qty: 0,
          revenue: 0,
        };
      }
      pincodeMap[pincode].products[pid].qty += qty;
      if (order.status === "DELIVERED" || order.status === "ACCEPTED") {
        pincodeMap[pincode].products[pid].revenue += itemRevenue;
      }

      if (!pincodeMap[pincode].shops[shopId].products[pid]) {
        pincodeMap[pincode].shops[shopId].products[pid] = {
          title: product?.title ?? "Unknown",
          qty: 0,
          revenue: 0,
          couponSpend: 0,
        };
      }
      pincodeMap[pincode].shops[shopId].products[pid].qty += qty;
      if (order.status === "DELIVERED" || order.status === "ACCEPTED") {
        pincodeMap[pincode].shops[shopId].products[pid].revenue += itemRevenue;
        pincodeMap[pincode].shops[shopId].products[pid].couponSpend += itemDiscount;
      }

      if (!productMap[pid]) {
        productMap[pid] = {
          title: product?.title ?? "Unknown",
          category: product?.category ?? "Uncategorized",
          orders: 0,
          revenue: 0,
          image: product?.images?.[0]?.url ?? null,
          deliveredQty: 0,
          cancelledQty: 0,
          pendingQty: 0,
          refundedQty: 0,
          refundedAmount: 0,
          couponSpend: 0,
          quantaSale: 0,
          pincodeBreakdown: {},
          customerOrders: {},
          orderIds: [],
        };
      }
      
      productMap[pid].orders++;
      
      const category = product?.category ?? "Uncategorized";
      if (!categoryMap[category]) {
        categoryMap[category] = { revenue: 0, orders: 0 };
      }
      categoryMap[category].orders++;

      productMap[pid].quantaSale += qty;
      productMap[pid].orderIds.push(order.id);

      if (!productMap[pid].customerOrders[userId]) {
        productMap[pid].customerOrders[userId] = 0;
      }
      productMap[pid].customerOrders[userId]++;
      
      if (!productMap[pid].pincodeBreakdown[pincode]) {
        productMap[pid].pincodeBreakdown[pincode] = 0;
      }
      productMap[pid].pincodeBreakdown[pincode]++;

      if (order.status === "DELIVERED") {
        productMap[pid].deliveredQty += qty;
        productMap[pid].revenue += itemRevenue;
        productMap[pid].couponSpend += itemDiscount;
        categoryMap[category].revenue += itemRevenue;
      } else if (order.status === "CANCELLED" || order.status === "REJECTED") {
        productMap[pid].cancelledQty += qty;
      } else if (order.status === "PENDING") {
        productMap[pid].pendingQty += qty;
      } else if (order.status === "ACCEPTED" || order.status === "SHIPPED") {
        productMap[pid].deliveredQty += qty; 
        productMap[pid].revenue += itemRevenue;
        productMap[pid].couponSpend += itemDiscount;
        categoryMap[category].revenue += itemRevenue;
      }

      if (order.paymentStatus === "REFUNDED") {
        productMap[pid].refundedAmount += itemRevenue;
        productMap[pid].refundedQty += qty;
      }
    }
  }

  const allProducts = Object.entries(productMap)
    .map(([id, data]) => {
      const repeatCustomers = Object.values(data.customerOrders).filter(v => v > 1).length;
      const avgPrice = data.deliveredQty > 0 ? data.revenue / data.deliveredQty : 0;
      return { id, ...data, repeatCustomers, avgPrice };
    })
    .sort((a, b) => b.orders - a.orders);

  const heroProducts = allProducts.slice(0, 5);
  const needsImprovement = allProducts.filter((p) => p.orders > 0 && p.orders <= 3).slice(0, 5);
  const toRemove = allProducts.filter((p) => p.orders === 0).slice(0, 5);

  const pincodeBreakdown = Object.entries(pincodeMap)
    .map(([pincode, data]) => ({ 
      pincode, 
      orders: data.orders,
      revenue: data.revenue,
      products: data.products,
      shops: Object.entries(data.shops).map(([id, s]) => ({
        id,
        name: s.name,
        sales: s.sales,
        repetition: Object.values(s.customers).filter(v => v > 1).length,
        products: s.products
      }))
    }))
    .sort((a, b) => b.orders - a.orders);

  return {
    totalOrders: orders.length,
    totalDelivered,
    totalCancelled,
    totalRefunded,
    totalPending,
    totalAccepted,
    totalRevenue,
    totalRefundedAmount,
    totalCouponSpend,
    pincodeBreakdown,
    heroProducts,
    needsImprovement,
    toRemove,
    allProductsBreakdown: allProducts,
    categoryBreakdown: Object.entries(categoryMap).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      orders: data.orders,
    })),
  };
}
