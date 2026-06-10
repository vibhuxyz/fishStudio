import { Request, Response, NextFunction } from "express";
import { ValidationError } from "@repo/error-handlers";
import { redis } from "@repo/libs";
import { prismaMongo as prisma } from "@repo/db-mongo";
import {
  meiliClient,
  PRODUCTS_INDEX,
  clearAndReindexAll,
  initMeilisearchIndex,
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
  opts: { storeId?: string; category?: string; sort?: string; limit: number },
) {
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const where: any = {
    isDeleted: false,
    // Only store variants have a product detail page
    storeId: opts.storeId ? opts.storeId : { not: null },
    catalogProductId: { not: null },
    OR: [
      { title: { startsWith: escaped, mode: "insensitive" } },
      { short_description: { contains: ` ${escaped}`, mode: "insensitive" } }, // Match as a word start in description
      { subCategory: { startsWith: escaped, mode: "insensitive" } },
      { category: { startsWith: escaped, mode: "insensitive" } },
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
    include: {
      images: { take: 1 },
      catalogProduct: {
        select: { id: true, slug: true, images: { take: 1 } },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.catalogProduct?.slug || p.slug,
    category: p.category,
    subCategory: p.subCategory ?? "",
    sale_price: p.sale_price,
    regular_price: p.regular_price,
    imageUrl: p.images?.[0]?.url || p.catalogProduct?.images?.[0]?.url || null,
    ratings: p.ratings ?? 0,
    catalogId: p.catalogProductId || p.id,
  }));
}

function dedupeHits<T extends {
  slug?: string | null;
  catalogId?: string | null;
  sale_price?: number | null;
}>(hits: T[]) {
  const unique = new Map<string, T>();

  for (const hit of hits) {
    const key = hit.catalogId || hit.slug || "";
    if (!key) continue;

    const existing = unique.get(key);
    if (
      !existing ||
      Number(hit.sale_price ?? Number.MAX_SAFE_INTEGER) <
        Number(existing.sale_price ?? Number.MAX_SAFE_INTEGER)
    ) {
      unique.set(key, hit);
    }
  }

  return Array.from(unique.values());
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
    const storeId = (req.query.storeId as string) || "";

    if (!q) {
      return res.json({ success: true, hits: [], query: "", estimatedTotalHits: 0 });
    }

    const cacheKey = `search:${q.toLowerCase()}:${category}:${sort}:${limit}:${storeId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, ...JSON.parse(cached), fromCache: true });
    }

    const escapeFilter = (str: string) => str.replace(/"/g, '\\"');

    const filters: string[] = ["isDeleted = false", "isStoreVariant = true"];
    if (category) filters.push(`category = "${escapeFilter(category)}"`);
    if (storeId) filters.push(`storeId = "${escapeFilter(storeId)}"`);

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
          "short_description", "ratings", "catalogId",
        ],
      });

      hits = result.hits ?? [];
      estimatedTotalHits = result.estimatedTotalHits ?? hits.length;
    } catch {
      // Meilisearch unavailable — fall through to MongoDB
    }

    // Fallback to MongoDB if Meilisearch returned nothing
    if (hits.length === 0) {
      hits = await mongoSearch(q, { storeId, category, sort, limit });
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

    hits = dedupeHits(hits).slice(0, limit);
    estimatedTotalHits = hits.length;

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
    const storeId = (req.query.storeId as string) || "";

    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const cacheKey = `suggest:${q.toLowerCase()}:${storeId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, suggestions: JSON.parse(cached) });
    }

    let suggestions: any[] = [];

    try {
      const index = meiliClient.index(PRODUCTS_INDEX);
      const escapeFilter = (str: string) => str.replace(/"/g, '\\"');
      const filters = ["isDeleted = false", "isStoreVariant = true"];
      if (storeId) filters.push(`storeId = "${escapeFilter(storeId)}"`);

        const result = await index.search(q, {
          limit: 6,
          filter: filters.join(" AND "),
          attributesToRetrieve: ["id", "title", "slug", "category", "imageUrl", "sale_price", "catalogId"],
        });
      suggestions = result.hits.map((h: any) => ({
        id: h.id,
        title: h.title,
        slug: h.slug,
        category: h.category,
        imageUrl: h.imageUrl,
        sale_price: h.sale_price,
        catalogId: h.catalogId,
      }));
    } catch {
      // Meilisearch unavailable — fall through to MongoDB
    }

    // MongoDB fallback
    if (suggestions.length === 0) {
      const products = await mongoSearch(q, { storeId, limit: 6 });
      suggestions = products.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        imageUrl: p.imageUrl,
        sale_price: p.sale_price,
        catalogId: p.catalogId,
      }));
    }

    suggestions = dedupeHits(suggestions).slice(0, 6);

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
    
    // 1. Flush Redis cache first to avoid stale results during/after reindexing
    // Non-blocking: SCAN in chunks and UNLINK (async delete) instead of KEYS/DEL
    try {
      let flushed = 0;
      for (const pattern of ["search:*", "suggest:*"]) {
        const stream = (redis as any).scanStream({ match: pattern, count: 500 });
        await new Promise<void>((resolve, reject) => {
          stream.on("data", (batch: string[]) => {
            if (batch.length === 0) return;
            // unlink is non-blocking delete; fall back to del if unavailable
            const del = (redis as any).unlink ?? redis.del.bind(redis);
            del.call(redis, ...batch).catch(() => {});
            flushed += batch.length;
          });
          stream.on("end", () => resolve());
          stream.on("error", reject);
        });
      }
      if (flushed > 0) console.log(`[Cache] Flushed ${flushed} search/suggest keys`);
    } catch (err) {
      console.error("[Cache] Flush failed during reindex:", err);
    }

    // 2. Clear Meilisearch and rebuild from scratch
    await initMeilisearchIndex(); // Ensure settings like typo tolerance are updated
    const count = await clearAndReindexAll();
    
    return res.json({
      success: true,
      message: `Reindexed ${count} products and flushed cache successfully`,
    });
  } catch (error) {
    return next(error);
  }
};
