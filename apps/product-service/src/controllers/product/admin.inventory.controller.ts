import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { redis } from "@repo/libs";

const INVENTORY_CACHE_TTL = 120; // 2 minutes

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/admin/seller-inventory
   Query params:
     search    string  — filter by seller name, store name, or product title
     sellerId  string  — scope to a single seller
     category  string  — filter products by category
     lowStock  "true"  — only return products with stock <= 10
     page      number  (default 1)
     limit     number  (default 30, max 100)

   Returns: paginated list of sellers, each with:
     seller info → store info → products (title, category, stock, price, totalSold, status)
───────────────────────────────────────────────────────────────────────── */
export const getAdminSellerInventory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search, sellerId, category, lowStock } = req.query as Record<string, string>;
    const page  = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 30));
    const skip  = (page - 1) * limit;

    const cacheKey = `admin:inventory:${sellerId ?? "all"}:${category ?? "all"}:${lowStock ?? "all"}:${page}:${limit}:${search ?? ""}`;

    // Try cache first (skip on search to always get fresh results)
    if (!search) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return res.status(200).json({ ...JSON.parse(cached), cached: true });
      } catch { /* Redis unavailable */ }
    }

    /* ── 1. Fetch stores (+ seller relation) ──────────────────────────── */
    const storeWhere: any = {
      ...(sellerId ? { sellerId } : {}),
    };

    const stores = await prisma.stores.findMany({
      where: storeWhere,
      select: {
        id: true,
        name: true,
        city: true,
        pincode: true,
        sellerId: true,
        opening_hours: true,
        closing_hours: true,
        is_instant_delivery_enabled: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
            isApprovedByAdmin: true,
            createdAt: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const totalStores = await prisma.stores.count({ where: storeWhere });
    const storeIds = stores.map((s) => s.id);

    /* ── 2. Fetch products for these stores ───────────────────────────── */
    const productWhere: any = {
      storeId: { in: storeIds },
      isDeleted: false,
      ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
      ...(lowStock === "true" ? { stock: { lte: 10 } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const products = await prisma.products.findMany({
      where: productWhere,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        sale_price: true,
        regular_price: true,
        stock: true,
        totalSold: true,
        status: true,
        isDeleted: true,
        storeId: true,
        createdAt: true,
        updatedAt: true,
        images: { take: 1, select: { url: true } },
      },
      orderBy: { stock: "asc" }, // lowest stock first (most urgent)
    });

    /* ── 3. Group products by storeId ─────────────────────────────────── */
    const productsByStore = new Map<string, typeof products>();
    for (const product of products) {
      if (!product.storeId) continue;
      if (!productsByStore.has(product.storeId)) {
        productsByStore.set(product.storeId, []);
      }
      productsByStore.get(product.storeId)!.push(product);
    }

    /* ── 4. Shape response ────────────────────────────────────────────── */
    let sellers = stores.map((store) => {
      const storeProducts = productsByStore.get(store.id) ?? [];
      const totalStock    = storeProducts.reduce((s, p) => s + p.stock, 0);
      const totalSold     = storeProducts.reduce((s, p) => s + p.totalSold, 0);
      const outOfStock    = storeProducts.filter((p) => p.stock === 0).length;
      const lowStockCount = storeProducts.filter((p) => p.stock > 0 && p.stock <= 10).length;
      const activeCount   = storeProducts.filter((p) => p.status === "Active").length;

      const sellerData = store.seller
        ? { ...store.seller, phone: (store.seller as any).phone_number }
        : null;

      return {
        seller: sellerData,
        store: {
          id:                       store.id,
          name:                     store.name,
          city:                     store.city,
          pincode:                  store.pincode,
          openingHours:             store.opening_hours,
          closingHours:             store.closing_hours,
          instantDeliveryEnabled:   store.is_instant_delivery_enabled,
        },
        summary: {
          totalProducts:  storeProducts.length,
          activeProducts: activeCount,
          totalStock,
          totalSold,
          outOfStock,
          lowStockCount,
        },
        products: storeProducts.map((p) => ({
          id:           p.id,
          title:        p.title,
          slug:         p.slug,
          category:     p.category,
          salePrice:    p.sale_price,
          regularPrice: p.regular_price,
          stock:        p.stock,
          totalSold:    p.totalSold,
          status:       p.status,
          image:        p.images?.[0]?.url ?? null,
          createdAt:    p.createdAt,
          updatedAt:    p.updatedAt,
          // Computed helper flags for the UI
          isOutOfStock: p.stock === 0,
          isLowStock:   p.stock > 0 && p.stock <= 10,
        })),
      };
    });

    // If searching by seller name or store name, filter after hydration
    if (search) {
      const q = search.toLowerCase();
      sellers = sellers.filter(
        (s) =>
          s.seller?.name?.toLowerCase().includes(q) ||
          s.store.name?.toLowerCase().includes(q) ||
          s.products.some((p) => p.title.toLowerCase().includes(q)),
      );
    }

    const payload = {
      success: true,
      sellers,
      pagination: {
        page,
        limit,
        total:      totalStores,
        totalPages: Math.ceil(totalStores / limit),
        hasNextPage: page * limit < totalStores,
        hasPrevPage: page > 1,
      },
    };

    // Cache only non-search results
    if (!search) {
      redis.set(cacheKey, JSON.stringify(payload), "EX", INVENTORY_CACHE_TTL).catch(() => {});
    }

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};
