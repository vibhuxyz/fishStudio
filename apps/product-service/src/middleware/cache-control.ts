import type { RequestHandler } from "express";

/**
 * Marks a response as publicly cacheable.
 *
 * Express already emits a weak ETag for every `res.json()` and answers a
 * matching `If-None-Match` with a 304, so revalidation works today — but a 304
 * still costs a full round trip. `max-age` is what removes the request
 * entirely, and `stale-while-revalidate` lets a client serve the stale copy
 * instantly while it refreshes in the background. That combination is the part
 * that was missing.
 *
 * ONLY for responses that are identical for every caller. Anything that varies
 * by the authenticated user must not use this — `public` allows shared caches
 * (CDN, proxy) to hand one user's response to another. Query parameters are
 * part of the cache key, so varying by those is fine.
 */
export const publicCache = (
  maxAgeSeconds: number,
  staleWhileRevalidateSeconds: number,
): RequestHandler => {
  const directive =
    `public, max-age=${maxAgeSeconds}, ` +
    `stale-while-revalidate=${staleWhileRevalidateSeconds}`;

  return (_req, res, next) => {
    // Applied at header-flush time rather than here, so it lands only on a
    // successful response. Setting it up front would also mark a 500 from the
    // error handler as cacheable, which would pin an outage in every client's
    // cache for the duration of max-age.
    const writeHead = res.writeHead.bind(res);
    res.writeHead = function patchedWriteHead(
      this: typeof res,
      ...args: Parameters<typeof res.writeHead>
    ) {
      if (res.statusCode >= 200 && res.statusCode < 300 && !res.getHeader("Cache-Control")) {
        res.setHeader("Cache-Control", directive);
      }
      return writeHead(...args);
    } as typeof res.writeHead;

    next();
  };
};

/**
 * Site-wide catalog structure. Rarely changes, and a stale category list for a
 * few minutes is harmless — it is already served from a 10-minute Redis cache
 * behind this.
 */
export const CATEGORY_CACHE: RequestHandler = publicCache(300, 600);

/** Merchandising content — changes more often than categories, still not per-user. */
export const BANNER_CACHE: RequestHandler = publicCache(120, 300);
