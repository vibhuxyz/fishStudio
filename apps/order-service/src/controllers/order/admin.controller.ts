import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prismaPostgres, toMoney } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { Response, NextFunction } from "express";
import { adminOrderListQuerySchema, updateAdminOrderStatusSchema, validate } from "@repo/zod-schema";
import {
  restoreOrderStock,
  queueStalePaymentFix,
  normalizeOrderIdFragment,
  ADMIN_ORDER_CUSTOMER_SELECT,
  ADMIN_ORDER_SELLER_SELECT,
} from "./utils.js";

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin/orders
   Query params:
     page       number  (default 1)
     limit      number  (default 20, max 100)
     status     OrderStatus filter  (PENDING | ACCEPTED | SHIPPED | DELIVERED | CANCELLED | REJECTED)
     from       ISO date string — orders created after this date
     to         ISO date string — orders created before this date
     search     string  — matches against orderId, userId, storeId, deliveryPhone, deliveryPincode
                          (leading "#"/"FS" display-prefixes are stripped before matching orderId)
     sellerId   string  — filter orders belonging to a specific seller's store
     paymentMethod  string  (COD | RAZORPAY)
     paymentStatus  string  (PENDING | COMPLETED | FAILED | REFUNDED)
     sortBy     createdAt | totalAmount  (default createdAt)
     sortDir    asc | desc  (default desc)

   Returns: paginated orders with customer + seller + store + items hydrated.
───────────────────────────────────────────────────────────────────────── */
export const getAdminOrderList = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    /* ── 1. Parse + validate query params ────────────────────────────────── */
    const page  = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip  = (page - 1) * limit;

    const {
      from,
      to,
      search,
      sellerId,
      paymentMethod,
      pincode,
      minAmount,
      maxAmount,
    } = req.query as Record<string, string>;

    const { status, paymentStatus, sortBy, sortDir } = validate(adminOrderListQuerySchema, {
      status: req.query.status,
      paymentStatus: req.query.paymentStatus,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir,
    });

    const minAmt = minAmount ? parseFloat(minAmount) : undefined;
    const maxAmt = maxAmount ? parseFloat(maxAmount) : undefined;

    /* ── 2. If sellerId filter is given, resolve storeId from Mongo first ── */
    let storeIdFilter: string | undefined;
    if (sellerId) {
      const store = await prismaMongo.stores.findUnique({ where: { sellerId } });
      if (!store) {
        return res.status(200).json({
          success: true,
          orders: [],
          pagination: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        });
      }
      storeIdFilter = store.id;
    }

    /* ── 3. Build Postgres WHERE clause ──────────────────────────────────── */
    const where: any = {
      ...(status        ? { status }                                            : {}),
      ...(paymentStatus ? { paymentStatus }                                     : {}),
      ...(paymentMethod ? { paymentMethod }                                     : {}),
      ...(storeIdFilter ? { storeId: storeIdFilter }                            : {}),
      ...(pincode       ? { deliveryPincode: { contains: pincode, mode: "insensitive" } } : {}),
      ...(from || to    ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
      ...((minAmt !== undefined || maxAmt !== undefined) ? { totalAmount: { ...(minAmt !== undefined ? { gte: minAmt } : {}), ...(maxAmt !== undefined ? { lte: maxAmt } : {}) } } : {}),
      ...(search
        ? {
            OR: [
              { id:              { contains: normalizeOrderIdFragment(search), mode: "insensitive" } },
              { userId:          { contains: search, mode: "insensitive" } },
              { storeId:         { contains: search, mode: "insensitive" } },
              { deliveryPhone:   { contains: search, mode: "insensitive" } },
              { deliveryPincode: { contains: search, mode: "insensitive" } },
              { couponCode:      { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    /* ── 4. Fetch orders + total count in parallel ───────────────────────── */
    const [ordersRaw, total] = await Promise.all([
      prismaPostgres.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortDir as "asc" | "desc" },
        include: { orderItems: true, payments: true },
      }),
      prismaPostgres.order.count({ where }),
    ]);

    /* ── 5. Hydrate with Mongo (users + stores + sellers + products) ──────── */
    const userIds   = [...new Set(ordersRaw.map((o) => o.userId))];
    const storeIds  = [...new Set(ordersRaw.map((o) => o.storeId))];
    const productIds= [...new Set(ordersRaw.flatMap((o) => o.orderItems.map((oi) => oi.productId)))];

    const [users, stores, products] = await Promise.all([
      prismaMongo.users.findMany({
        where: { id: { in: userIds } },
        select: ADMIN_ORDER_CUSTOMER_SELECT,
      }),
      prismaMongo.stores.findMany({
        where: { id: { in: storeIds } },
        select: {
          id: true,
          name: true,
          pincode: true,
          city: true,
          sellerId: true,
          seller: {
            select: ADMIN_ORDER_SELLER_SELECT,
          },
        },
      }),
      prismaMongo.products.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          title: true,
          category: true,
          sale_price: true,
          images: { take: 1, select: { url: true } },
        },
      }),
    ]);

    const userMap    = new Map(users.map((u) => [u.id, u]));
    const storeMap   = new Map(stores.map((s) => [s.id, s]));
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Fix stale PENDING paymentStatus for delivered orders (background, non-blocking)
    const staleDelivered = ordersRaw.filter(
      (o) => o.status === "DELIVERED" && o.paymentStatus === "PENDING",
    );
    queueStalePaymentFix(staleDelivered.map((o) => o.id));

    const orders = ordersRaw.map((order) => ({
      id:             order.id,
      status:         order.status,
      paymentStatus:  order.status === "DELIVERED" && order.paymentStatus === "PENDING"
                        ? "COMPLETED"
                        : order.paymentStatus,
      paymentMethod:  order.paymentMethod,
      paymentRef:     order.paymentRef,
      totalAmount:    toMoney(order.totalAmount),
      discountAmount: toMoney(order.discountAmount),
      couponCode:     order.couponCode,
      deliverySlot:   order.deliverySlot,
      deliveryCharge: toMoney(order.deliveryCharge),
      billDetails:    order.billDetails,
      rejectionReason:order.rejectionReason,
      createdAt:      order.createdAt,
      updatedAt:      order.updatedAt,

      // Delivery snapshot
      delivery: {
        name:    order.deliveryName,
        phone:   order.deliveryPhone,
        address: order.deliveryAddress,
        city:    order.deliveryCity,
        pincode: order.deliveryPincode,
      },

      // Customer info from Mongo
      customer: userMap.get(order.userId) ?? { id: order.userId },

      // Store + seller info from Mongo
      store:  storeMap.get(order.storeId) ?? { id: order.storeId },
      seller: (() => {
        const s = storeMap.get(order.storeId)?.seller;
        return s ? { ...s, phone: (s as any).phone_number } : null;
      })(),

      // Order items with product details
      items: order.orderItems.map((oi) => ({
        id:              oi.id,
        productId:       oi.productId,
        quantity:        oi.quantity,
        price:           toMoney(oi.price),
        selectedOptions: oi.selectedOptions,
        product:         productMap.get(oi.productId) ?? { id: oi.productId },
      })),

      // Payment records
      payments: order.payments.map((p) => ({ ...p, amount: toMoney(p.amount) })),
    }));

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages:  Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin/orders/:orderId
   Returns full detail for a single order:
     - Complete order fields
     - Customer profile (name, email, phone, full address list, joined date)
     - Order delivery address snapshot
     - Seller profile (name, email, phone, approval status, joined date)
     - Store profile (name, city, pincode)
     - Each order item with full product info
     - Payment records
     - Audit log for this order
───────────────────────────────────────────────────────────────────────── */
export const getAdminOrderDetail = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params as { orderId: string };
    if (!orderId) return next(new ValidationError("orderId is required"));

    /* ── 1. Fetch order from Postgres ────────────────────────────────────── */
    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true, payments: true },
    });

    if (!order) return next(new NotFoundError("Order not found"));

    /* ── Auto-correct stale payment status for delivered COD orders ────────── */
    if (order.status === "DELIVERED" && order.paymentStatus === "PENDING") {
      queueStalePaymentFix([orderId]);
      (order as any).paymentStatus = "COMPLETED";
    }

    /* ── 2. Fetch audit log for this order ───────────────────────────────── */
    const auditLogs = await prismaPostgres.auditLog.findMany({
      where: {
        OR: [
          { entityId: orderId },
          { entityType: "PAYMENT", entityId: orderId },
          { entityType: "COUPON",  metadata: { path: ["orderId"], equals: orderId } },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    /* ── 3. Fetch Mongo data in parallel ─────────────────────────────────── */
    const productIds = order.orderItems.map((oi) => oi.productId);

    const [customer, store, products, rider] = await Promise.all([
      prismaMongo.users.findUnique({
        where: { id: order.userId },
        select: ADMIN_ORDER_CUSTOMER_SELECT,
      }),
      prismaMongo.stores.findUnique({
        where: { id: order.storeId },
        select: {
          id: true,
          name: true,
          pincode: true,
          city: true,
          sellerId: true,
          opening_hours: true,
          closing_hours: true,
          is_instant_delivery_enabled: true,
          seller: {
            select: ADMIN_ORDER_SELLER_SELECT,
          },
        },
      }),
      prismaMongo.products.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          title: true,
          category: true,
          sale_price: true,
          regular_price: true,
          stock: true,
          totalSold: true,
          images: { take: 1, select: { url: true } },
        },
      }),
      order.riderId
        ? prismaMongo.riders.findUnique({
            where: { id: order.riderId },
            select: { id: true, name: true, phone: true, vehicleType: true, vehicleNumber: true, status: true, avatar: true },
          })
        : null,
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));

    /* ── 4. Shape the response ───────────────────────────────────────────── */
    return res.status(200).json({
      success: true,
      order: {
        // Core order fields
        id:              order.id,
        status:          order.status,
        paymentStatus:   order.paymentStatus,
        paymentMethod:   order.paymentMethod,
        paymentRef:      order.paymentRef,
        totalAmount:     toMoney(order.totalAmount),
        discountAmount:  toMoney(order.discountAmount),
        couponCode:      order.couponCode,
        deliverySlot:    order.deliverySlot,
        deliveryCharge:  toMoney(order.deliveryCharge),
        billDetails:     order.billDetails,
        rejectionReason: order.rejectionReason,
        createdAt:       order.createdAt,
        updatedAt:       order.updatedAt,

        // Assigned rider, if any — riderStatus/assignedAt/assignedBy are the
        // order's own audit trail; `rider` below is the live Mongo record.
        riderStatus: order.riderStatus,
        assignedAt:  order.assignedAt,
        rider,

        // Delivery snapshot (what the user entered at checkout)
        delivery: {
          name:    order.deliveryName,
          phone:   order.deliveryPhone,
          address: order.deliveryAddress,
          city:    order.deliveryCity,
          pincode: order.deliveryPincode,
        },

        // Full customer profile
        customer: customer
          ? {
              id:          customer.id,
              name:        customer.name,
              email:       customer.email,
              phone:       customer.phone_number,
              addresses:   customer.addresses,
              memberSince: customer.createdAt,
            }
          : { id: order.userId, note: "Customer record not found" },

        // Store details
        store: store
          ? {
              id:     store.id,
              name:   store.name,
              city:   store.city,
              pincode:store.pincode,
              openingHours: store.opening_hours,
              closingHours: store.closing_hours,
              instantDeliveryEnabled: store.is_instant_delivery_enabled,
            }
          : { id: order.storeId, note: "Store record not found" },

        // Seller details (derived from store → seller relation)
        seller: store?.seller
          ? {
              id:              store.seller.id,
              name:            store.seller.name,
              email:           store.seller.email,
              phone:           (store.seller as any).phone_number,
              isApproved:      store.seller.isApprovedByAdmin,
              memberSince:     store.seller.createdAt,
            }
          : { id: store?.sellerId ?? null, note: "Seller record not found" },

        // Order line items with product snapshot
        items: order.orderItems.map((oi) => {
          const product = productMap.get(oi.productId);
          return {
            id:              oi.id,
            quantity:        oi.quantity,
            unitPrice:       toMoney(oi.price),
            lineTotal:       toMoney(oi.price.mul(oi.quantity)),
            selectedOptions: oi.selectedOptions,
            product: product
              ? {
                  id:           product.id,
                  title:        product.title,
                  category:     product.category,
                  salePrice:    product.sale_price,
                  regularPrice: product.regular_price,
                  currentStock: product.stock,
                  totalSold:    product.totalSold,
                  image:        product.images?.[0]?.url ?? null,
                }
              : { id: oi.productId, note: "Product record not found" },
          };
        }),

        // All payment attempts for this order
        payments: order.payments.map((p) => ({
          id:            p.id,
          amount:        toMoney(p.amount),
          method:        p.method,
          status:        p.status,
          transactionId: p.transactionId,
          metadata:      p.metadata,
          createdAt:     p.createdAt,
          updatedAt:     p.updatedAt,
        })),

        // Full audit trail for this order (financial history)
        auditTrail: auditLogs.map((log) => ({
          id:         log.id,
          entityType: log.entityType,
          action:     log.action,
          actorId:    log.actorId,
          actorType:  log.actorType,
          metadata:   log.metadata,
          timestamp:  log.createdAt,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin/orders/pincodes
   Returns all pincodes from seller stores + distinct delivery pincodes from
   existing orders (merged, sorted, de-duped) for the filter dropdown.
───────────────────────────────────────────────────────────────────────── */
export const getAdminOrderPincodes = async (
  _req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [orderRows, stores] = await Promise.all([
      prismaPostgres.order.findMany({
        where: { deliveryPincode: { not: null } },
        select: { deliveryPincode: true },
        distinct: ["deliveryPincode"],
      }),
      prismaMongo.stores.findMany({
        select: { pincode: true },
      }),
    ]);

    const pincodeSet = new Set<string>();
    for (const r of orderRows) {
      if (r.deliveryPincode) pincodeSet.add(r.deliveryPincode);
    }
    for (const s of stores) {
      if (s.pincode) pincodeSet.add(s.pincode);
    }

    const pincodes = Array.from(pincodeSet).sort();
    return res.status(200).json({ success: true, pincodes });
  } catch (error) {
    return next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   PUT /api/admin/orders/:orderId/status
   Body: { status: OrderStatus }
   Admin can update any order's status; auto-completes payment on DELIVERED.
───────────────────────────────────────────────────────────────────────── */
export const updateAdminOrderStatus = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params as { orderId: string };
    const { status } = validate(updateAdminOrderStatusSchema, req.body);

    const existing = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
    if (!existing) return next(new NotFoundError("Order not found"));

    const updated = await prismaPostgres.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
        ...(status === "DELIVERED" ? { paymentStatus: "COMPLETED" } : {}),
      },
    });

    // Restore stock when admin cancels an order — mirrors the seller-side
    // CANCELLED path in updateOrderStatus, which this admin endpoint had
    // been missing (orders cancelled here previously left stock reserved).
    if (status === "CANCELLED") {
      restoreOrderStock(existing.orderItems, "updateAdminOrderStatus");
    }

    return res.status(200).json({ success: true, order: updated });
  } catch (error) {
    return next(error);
  }
};
