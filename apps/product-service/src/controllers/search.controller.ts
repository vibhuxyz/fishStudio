import { Request, Response, NextFunction } from "express";
import { ValidationError } from "@repo/error-handlers";
import { redis } from "@repo/libs";
import { prisma } from "@repo/db";
import {
  meiliClient,
  PRODUCTS_INDEX,
  reindexAllProducts,
} from "../lib/meilisearch.js";

interface AuthRequest extends Request {
  role?: string;
  admin?: { id: string };
}

const SEARCH_CACHE_TTL = 180;   // 3 min
const SUGGEST_CACHE_TTL = 300;  // 5 min

/** MongoDB regex search — used as fallback when Meilisearch has no results */
async function mongoSearch(
  q: string,
  opts: { category?: string; sort?: string; limit: number },
) {
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const where: any = {
    isDeleted: false,
    // Only store variants have a product detail page
    storeId: { not: null },
    catalogProductId: { not: null },
    OR: [
      { title: { contains: escaped, mode: "insensitive" } },
      { short_description: { contains: escaped, mode: "insensitive" } },
      { subCategory: { contains: escaped, mode: "insensitive" } },
      { category: { contains: escaped, mode: "insensitive" } },
    ],
  };

  if (opts.category) where.category = opts.category;

  let orderBy: any = { totalSold: "desc" };
  if (opts.sort === "price_asc") orderBy = { sale_price: "asc" };
  else if (opts.sort === "price_desc") orderBy = { sale_price: "desc" };
  else if (opts.sort === "rating") orderBy = { ratings: "desc" };

  const products = await prisma.products.findMany({
    where,
    orderBy,
    take: opts.limit,
    include: { images: { take: 1 } },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    subCategory: p.subCategory ?? "",
    sale_price: p.sale_price,
    regular_price: p.regular_price,
    imageUrl: p.images?.[0]?.url ?? null,
    ratings: p.ratings ?? 0,
  }));
}

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = ((req.query.q as string) || "").trim();
    const limit = Math.min(Number(req.query.limit) || 10, 20);
    const category = (req.query.category as string) || "";
    const sort = (req.query.sort as string) || "";

    if (!q) {
      return res.json({ success: true, hits: [], query: "", estimatedTotalHits: 0 });
    }

    const cacheKey = `search:${q.toLowerCase()}:${category}:${sort}:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, ...JSON.parse(cached), fromCache: true });
    }

    const filters: string[] = ["isDeleted = false", "isStoreVariant = true"];
    if (category) filters.push(`category = "${category}"`);

    const sortParam: string[] = [];
    if (sort === "price_asc") sortParam.push("sale_price:asc");
    else if (sort === "price_desc") sortParam.push("sale_price:desc");
    else if (sort === "rating") sortParam.push("ratings:desc");

    let hits: any[] = [];
    let estimatedTotalHits = 0;

    try {
      const index = meiliClient.index(PRODUCTS_INDEX);
      const result = await index.search(q, {
        limit,
        filter: filters.join(" AND "),
        sort: sortParam.length ? sortParam : undefined,
        attributesToRetrieve: [
          "id", "title", "slug", "category", "subCategory",
          "sale_price", "regular_price", "imageUrl", "tags",
          "short_description", "ratings",
        ],
      });

      hits = result.hits ?? [];
      estimatedTotalHits = result.estimatedTotalHits ?? hits.length;
    } catch {
      // Meilisearch unavailable — fall through to MongoDB
    }

    // Fallback to MongoDB if Meilisearch returned nothing
    if (hits.length === 0) {
      hits = await mongoSearch(q, { category, sort, limit });
      estimatedTotalHits = hits.length;

      // Background: index these products so next search uses Meilisearch
      if (hits.length > 0) {
        Promise.all(
          hits.map((h) =>
            meiliClient
              .index(PRODUCTS_INDEX)
              .addDocuments([h])
              .catch(() => {}),
          ),
        );
      }
    }

    const payload = { hits, query: q, estimatedTotalHits };
    await redis.setex(cacheKey, SEARCH_CACHE_TTL, JSON.stringify(payload));

    return res.json({ success: true, ...payload });
  } catch (error) {
    return next(error);
  }
};

export const searchSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = ((req.query.q as string) || "").trim();

    if (!q) {
      return res.json({ success: true, suggestions: [] });
    }

    const cacheKey = `suggest:${q.toLowerCase()}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, suggestions: JSON.parse(cached) });
    }

    let suggestions: any[] = [];

    try {
      const index = meiliClient.index(PRODUCTS_INDEX);
      const result = await index.search(q, {
        limit: 6,
        filter: "isDeleted = false AND isStoreVariant = true",
        attributesToRetrieve: ["id", "title", "slug", "category", "imageUrl", "sale_price"],
      });
      suggestions = result.hits.map((h: any) => ({
        id: h.id,
        title: h.title,
        slug: h.slug,
        category: h.category,
        imageUrl: h.imageUrl,
        sale_price: h.sale_price,
      }));
    } catch {
      // Meilisearch unavailable — fall through to MongoDB
    }

    // MongoDB fallback
    if (suggestions.length === 0) {
      const products = await mongoSearch(q, { limit: 6 });
      suggestions = products.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        imageUrl: p.imageUrl,
        sale_price: p.sale_price,
      }));
    }

    await redis.setex(cacheKey, SUGGEST_CACHE_TTL, JSON.stringify(suggestions));
    return res.json({ success: true, suggestions });
  } catch (error) {
    return next(error);
  }
};

export const reindexProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.role !== "admin") {
      return next(new ValidationError("Only admin can trigger reindex"));
    }
    const count = await reindexAllProducts();
    return res.json({
      success: true,
      message: `Reindexed ${count} products successfully`,
    });
  } catch (error) {
    return next(error);
  }
};
