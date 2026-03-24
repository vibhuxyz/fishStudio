import { prisma } from "@repo/db";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "@repo/error-handlers";

type Period = "week" | "month" | "year";

function getPeriodStart(period: Period): Date {
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

function computeStats(orders: any[]) {
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

  const productMap: Record<
    string,
    {
      title: string;
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

    // Pincode grouping from store pincode
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

    // Product grouping
    for (const item of order.orderItems ?? []) {
      const pid = item.productId;
      const product = item.product;
      const qty = item.quantity;
      const price = item.price;
      const itemRevenue = price * qty;
      const itemDiscount = (discount / (order.orderItems.length || 1)); // Naive split

      // Also track in pincode breakdown
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

      // Also track in per-shop product breakdown
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
      productMap[pid].quantaSale += qty;
      productMap[pid].orderIds.push(order.id);

      // Repeat customer tracking
      if (!productMap[pid].customerOrders[userId]) {
        productMap[pid].customerOrders[userId] = 0;
      }
      productMap[pid].customerOrders[userId]++;
      
      // Breakdown by product
      if (!productMap[pid].pincodeBreakdown[pincode]) {
        productMap[pid].pincodeBreakdown[pincode] = 0;
      }
      productMap[pid].pincodeBreakdown[pincode]++;

      // Quantities and Revenue
      if (order.status === "DELIVERED") {
        productMap[pid].deliveredQty += qty;
        productMap[pid].revenue += itemRevenue;
        productMap[pid].couponSpend += itemDiscount;
      } else if (order.status === "CANCELLED" || order.status === "REJECTED") {
        productMap[pid].cancelledQty += qty;
      } else if (order.status === "PENDING") {
        productMap[pid].pendingQty += qty;
      } else if (order.status === "ACCEPTED" || order.status === "SHIPPED") {
        productMap[pid].deliveredQty += qty; 
        productMap[pid].revenue += itemRevenue;
        productMap[pid].couponSpend += itemDiscount;
      }

      if (order.paymentStatus === "REFUNDED") {
        productMap[pid].refundedAmount += itemRevenue;
        productMap[pid].refundedQty += qty;
      }
    }
  }

  // Sort products and attach computed stats
  const allProducts = Object.entries(productMap)
    .map(([id, data]) => {
      const repeatCustomers = Object.values(data.customerOrders).filter(v => v > 1).length;
      const avgPrice = data.deliveredQty > 0 ? data.revenue / data.deliveredQty : 0;
      return { 
        id, 
        ...data, 
        repeatCustomers, 
        avgPrice 
      };
    })
    .sort((a, b) => b.orders - a.orders);

  const heroProducts = allProducts.slice(0, 5);
  const needsImprovement = allProducts
    .filter((p) => p.orders > 0 && p.orders <= 3)
    .slice(0, 5);
  const toRemove = allProducts
    .filter((p) => p.orders === 0)
    .slice(0, 5);

  // Sort pincodes
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
    allProductsBreakdown: allProducts, // Full detailed product list for Admin UI
  };
}

/* ─────────────── SELLER STATS ─────────────── */
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
    const store = await prisma.stores.findUnique({ where: { sellerId } });
    if (!store) {
      return res.status(200).json({ success: true, stats: null, message: "No store found" });
    }

    const since = getPeriodStart(period);

    const orders = await prisma.order.findMany({
      where: { storeId: store.id, createdAt: { gte: since } },
      include: {
        store: { select: { pincode: true } },
        orderItems: {
          include: {
            product: { select: { id: true, title: true, images: { take: 1 } } },
          },
        },
      },
    });

    const stats = computeStats(orders);

    return res.status(200).json({ success: true, period, stats });
  } catch (error) {
    return next(error);
  }
};

/* ─────────────── ADMIN STATS (ALL or PER SELLER) ─────────────── */
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
        store: { select: { pincode: true, seller: { select: { id: true, name: true, email: true } } } },
        orderItems: {
          include: {
            product: { select: { id: true, title: true, images: { take: 1 } } },
          },
        },
      },
    });

    const stats = computeStats(orders);

    // Per-seller breakdown (only for all-sellers admin call)
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

    return res.status(200).json({
      success: true,
      period,
      stats,
      ...(perSellerBreakdown.length ? { perSellerBreakdown } : {}),
    });
  } catch (error) {
    return next(error);
  }
};
