import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { redis } from "@repo/libs";
import { NotFoundError } from "@repo/error-handlers";

const STOCK_CACHE_TTL = 15; // 15 seconds — short TTL for accuracy

/*
  GET /api/stock/:productId
  Public endpoint — called by the cart UI on every + click.
  Returns: { productId, stock, status, isOutOfStock, isLowStock }
  Cached in Redis for 15 seconds. Fast path so the cart feels instant.
*/
export const getProductStock = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    if (!productId) return next(new NotFoundError("Product not found"));

    const cacheKey = `stock:${productId}`;

    // Try Redis first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({ ...JSON.parse(cached), cached: true });
      }
    } catch { /* Redis unavailable — fall through to DB */ }

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, status: true, isDeleted: true },
    });

    if (!product || product.isDeleted) {
      return next(new NotFoundError("Product not found"));
    }

    const payload = {
      productId: product.id,
      stock:       product.stock,
      status:      product.status,
      isOutOfStock: product.stock === 0,
      isLowStock:   product.stock > 0 && product.stock <= 10,
    };

    // Cache briefly
    redis.set(cacheKey, JSON.stringify(payload), "EX", STOCK_CACHE_TTL).catch(() => {});

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};
