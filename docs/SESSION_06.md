# SESSION_06: Code Style & Structure Audit — apps/product-service

Scope: `apps/product-service/` in full (17 files under `src/`, plus `flush-cache.ts`, `env.example`, `README.md`). Zod schema review limited to files directly imported by this service: `product.schema.ts`, `category.schema.ts`, `coupon.schema.ts`, `event.schema.ts`, `banner.schema.ts`, `image.schema.ts` (and the `schemas/index.ts` / `index.ts` barrels that re-export them). No other shared package inspected.

# Executive Summary

- Domain logic is genuinely sophisticated and correct-looking: catalog/variant merge model, location-scored store resolution, coupon eligibility (first-order, per-user, global-usage, min-order), delivery-window math, recency-weighted "for you" recommendations. This is not beginner work.
- The dominant structural problem is `src/controllers/product/product.controller.ts` — **2,363 lines, 18 exported handlers** covering catalog CRUD, storefront listing, cart validation, homepage sections, and user-activity tracking (view tracking, recently-viewed, recommendations, guest→user activity merge). These are at least 4 separable concerns living in one file.
- Real dead code: `weight-pricing.utils.ts` (293 lines, fully-built auto-pricing engine) is never imported anywhere. `flush-cache.ts` at the service root imports from a path (`./src/lib/redis`) that doesn't exist in this service — it would fail immediately if run, and it's wired into no `package.json` script.
- Duplicated logic that should be shared helpers: the `hasAccess` ownership check is copy-pasted identically 3× in `product.controller.ts`; the inline admin-or-seller middleware `(req: any, res: any, next: any) => req.role === "admin" ? next() : isApprovedSeller(...)` is copy-pasted 6× in `product.routes.ts`, always with `any`-typed params.
- Two independent `AuthRequest` interfaces exist (`controllers/product/utils.ts` and `controllers/search.controller.ts`) — the second is a narrower, out-of-sync duplicate of the first.
- Configuration is under-documented: the service reads 5 env vars (`PRODUCT_SERVICE_PORT`, `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `CLOUDINARY_FOLDER`, `ACCESS_TOKEN_JWT_SECRET_KEY`) but `env.example` lists only 1. `README.md` is still the default `bun init` template and calls the service "bank-service".
- Zod is used consistently at the controller boundary for every mutating endpoint (good, matches the codebase-wide pattern) — one weak spot: `addCatalogProductToStoreSchema.sizePricing` is typed `z.array(z.any())` even though `productSizePricingSchema` already exists in the same file and could type it properly.
- No service/repository layer — controllers call Prisma directly. Consistent with the pattern already documented for `auth-service` ([[SESSION_04]]) and `worker-service` ([[SESSION_05]]), so this reads as an established platform convention rather than a one-off shortcut.
- Logging is 100% raw `console.log`/`console.error` (29 call sites) — same platform-wide gap noted in both prior sessions.

# File Reviews

### src/main.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Clean bootstrap: helmet, compression, rate limiting, 20MB JSON limit with a documented reason (base64 images), `trust proxy` set with a documented reason. Better than the sibling services audited so far.
- No graceful shutdown (SIGINT/SIGTERM) — cron jobs and the Meilisearch client aren't torn down on exit.

### src/routes/product.routes.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- 325 lines of flat route wiring — reasonable for the route count, no complaint there.
- The `(req: any, res: any, next: any) => req.role === "admin" ? next() : isApprovedSeller(req, res, next)` inline middleware is repeated verbatim 6 times (lines 154, 174, 294, 302, 312, 320), each with `any`-typed params — should be one named, properly-typed middleware (e.g. `allowAdminOrApprovedSeller`) exported from `utils.ts` or `@repo/middlewares`.
- `isSeller` is imported from `@repo/middlewares` (line 71) but never used anywhere in the file.

### src/lib/meilisearch.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Well-organized: index config, doc mapping, and reindex helpers are cleanly separated with load-bearing comments explaining non-obvious choices (canonical slug priority, id prefixing to avoid catalog/variant collisions).
- `indexProduct`/`updateIndexedProduct` are identical function bodies under two names — genuine duplication, not just similar-looking code.
- Hardcoded fallback placeholder image URL (Cloudinary account-specific) embedded directly in `toMeiliDoc` rather than sourced from config.

### src/jobs/product.cron.jobs.ts
**Quality** — ⭐⭐☆☆☆ (2/5)
- `(console.log("(Cron Job) Error during deleting product"), error)` (line 15) — the comma operator here means `error` is evaluated and discarded; the caught error's actual message/stack is never logged. Looks like a typo for `console.log(..., error)`.
- No import-time registration boundary — the cron starts as a side effect of `import "./jobs/product.cron.jobs.js"` in `main.ts`, which is a common but implicit pattern (harmless here, worth being aware of if the service ever needs conditional cron startup, e.g. in tests).

### src/controllers/search.controller.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Good defensive design: Meilisearch-first with a MongoDB regex fallback, cache-then-compute, background self-healing indexing on fallback hits. This is thoughtful, production-grade code.
- Defines its own local `AuthRequest extends Request { role?; admin?: {id} }` (lines 12-15) instead of importing the richer one from `controllers/product/utils.ts` — a second, narrower, silently-diverging copy of the same concept.
- `reindexProducts`'s Redis flush block (lines 261-280) is a lot of stream/promise plumbing embedded directly in the controller — would read better as a named helper (e.g. alongside `invalidateSearchCache` in `product.controller.ts`, which does the same kind of SCAN+delete for a subset of these key patterns).

### src/controllers/product/product.controller.ts
**Quality** — ⭐⭐☆☆☆ (2/5)
- **God file**: 2,363 lines, 18 exported handlers. Distinct concerns currently living together: catalog CRUD (`createProduct`, `updateProduct`, `deleteProduct`, `restoreProduct`, `getOwnedProduct*`), storefront listing/detail (`getStoreProducts`, `getStoreProductBySlug`, `getStorePublicOffers`), cart (`validateCart`), homepage sections (`getHomepageSections` + section-building helpers), and user activity (`trackProductView`, `getRecentlyViewed`, `getForYou`, `mergeActivity`). Each is independently substantial and would be a reasonable standalone controller.
- `hasAccess` ownership check duplicated identically in `updateProduct`, `deleteProduct`, `restoreProduct` (lines 1219, 1485, 1528) — same two-line boolean expression, same shape, never factored into `utils.ts` alongside `getOwnedProductFilter`.
- `getStoreProducts` re-implements its own best-variant-selection loop (lines 776-793) even though the near-identical logic already exists as a named, reusable step inside `buildMergedFromCatalogs` (lines 1905-1922) — the second one was clearly extracted later (used by homepage sections, recently-viewed, for-you) but the original call site was never migrated to use it.
- `restoreProduct`'s catch block returns `res.status(500).json({ message: "Eror restoring product", error })` (line 1548, note the typo) directly instead of calling `next(error)` like every other handler in this file — inconsistent error-propagation pattern, and it leaks the raw `error` object into the JSON response.
- Heavy use of `any` (catalog/variant merge helpers, `updateData: Record<string, any>`, `.map((img: any) => ...)`) — acceptable for the genuinely-dynamic Prisma update-payload shapes, but several (`mergeCatalogWithVariant(catalog: any, variant: any, ...)`) could be typed against actual Prisma-generated types with modest effort.
- Positive: the caching layer (`buildStorefrontCacheKey`, `getCachedPayload`/`setCachedPayload`) is a clean, reusable pattern applied consistently across every storefront-read endpoint in this file.

### src/controllers/product/utils.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Good grouping of genuinely-shared pricing/slug/auth helpers with real domain names (`normalizeSizePricing`, `buildUniqueSlug`, `getOwnedProductFilter`). This is the file the duplicated `hasAccess` logic above should live in.
- `AuthRequest` here is the canonical, fuller definition — `search.controller.ts`'s local copy should import this one instead.

### src/controllers/product/weight-pricing.utils.ts
**Quality** — N/A — **dead file**
- 293 lines implementing a complete weight-based auto-pricing engine (`parseWeightRange`, `calculateAutoPrice`, `generateSizePricingFromWeights`, `generateCuttingTypePricing`, `generatePieceSizePricing`, `validateProductPricing`). Confirmed via grep: zero imports of this file or any of its exports anywhere in the service. Either a shipped-but-never-wired feature or leftover from an abandoned approach — the equivalent pricing logic that *is* live (`normalizeSizePricing` etc.) lives separately in `utils.ts` with a different, simpler algorithm.

### src/controllers/product/badges.ts
**Quality** — ⭐⭐⭐⭐⭐ (5/5)
- Best file in the service. Clear separation of auto-derived vs. marketing badges, tunable thresholds pulled to named constants, genuinely useful why-comments (e.g. mutual exclusivity between "Best Seller" and "Trending"). Nothing to flag.

### src/controllers/product/admin.inventory.controller.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Single-purpose, well-commented query/shape/cache flow. Reasonable size for what it does.
- Post-hydration `search` filtering (lines 175-183) runs in JS after the DB query already ran with `skip`/`take` applied — for a search request, pagination is computed against the unfiltered page, so `pagination.total` / `hasNextPage` can be wrong once the text filter is applied. Minor correctness gap, not just style.

### src/controllers/product/banner.controller.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- Handles a genuinely complex domain (announcement vs. image banners, admin vs. seller ownership, per-category upload caps) reasonably clearly.
- `uploadBanner` mixes three responsibilities in one 140-line handler: validation, Cloudinary upload looping, and RabbitMQ event publishing. Not unreasonable at this size, but it's the second-largest handler in the service after `product.controller.ts`'s worst offenders.
- `getAnnouncementBanners` casts `prisma as any` (line 574) for no apparent reason — `prisma.stores.findMany` is used untyped elsewhere in the same file without the cast.

### src/controllers/product/category.controller.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Small, focused, consistent cache-read/cache-invalidate pattern. No complaints beyond the platform-wide `console`-only logging.

### src/controllers/product/coupon.controller.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- The multi-stage `validateCoupon` eligibility chain (first-order → global usage → per-user usage → min-order → discount calc) is clearly sequenced and each branch returns a distinct, user-facing message. Good handler.
- `discountType !== "free_delivery" && discountValue <= 0` business-rule check (line 37) duplicates part of what a zod `.superRefine` could express directly in `createCouponSchema` — not wrong, but validation ownership is split between the schema and the handler for this one field.

### src/controllers/product/event.controller.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Clean CRUD, correct ownership checks on update/delete. The auto-created first-order coupon path in `createSellerEvent` is a small cross-domain reach (events creating coupons) but it's intentional and schema-validated (`firstOrderCouponSchema`), not a boundary violation.

### src/controllers/product/image.controller.ts
**Quality** — ⭐⭐⭐⭐⭐ (5/5)
- `assertSafeImageSource`'s SSRF-prevention comment and base64-only allowlist is exactly the kind of load-bearing why-comment this audit framework asks for. Strong file.

### src/controllers/product/review.controller.ts
**Quality** — ⭐⭐⭐⭐⭐ (5/5)
- Small, correct, well-commented (upsert semantics, rating recompute on delete). Nothing to flag.

### src/controllers/product/stock.controller.ts
**Quality** — ⭐⭐⭐⭐⭐ (5/5)
- Minimal, single-purpose, cache-with-short-TTL — appropriately sized for "called on every + click."

### flush-cache.ts (service root)
**Quality** — N/A — **broken/dead script**
- `import { redis } from "./src/lib/redis"` — this path does not exist; `src/lib/` only contains `meilisearch.ts`. The real Redis client lives at `@repo/libs/redis`, which every controller in this service imports correctly. This script would fail on the first line if executed. It is not referenced by any `package.json` script.

### env.example
**Quality** — ⭐☆☆☆☆ (1/5)
- Lists only `PRODUCT_SERVICE_PORT`. The service actually reads `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `CLOUDINARY_FOLDER`, and `ACCESS_TOKEN_JWT_SECRET_KEY` as well (confirmed via grep across `src/`).

### README.md
**Quality** — ⭐☆☆☆☆ (1/5)
- Unedited `bun init` template. Calls the service "bank-service" and documents `bun run index.ts`, which doesn't match this service's actual scripts (`tsx watch src/main.ts` / `tsup` / `node dist/main.js`).

# Zod Schema Review

Files reviewed: `product.schema.ts`, `category.schema.ts`, `coupon.schema.ts`, `event.schema.ts`, `banner.schema.ts`, `image.schema.ts`.

- **Import paths** — clean. Every controller imports from the package root `@repo/zod-schema`; no deep imports into `@repo/zod-schema/schemas/*` or `dist/*` found anywhere in this service.
- **Public exports** — `schemas/index.ts` barrels all six files correctly; `index.ts` additionally re-exports inferred `z.infer` types for cross-service reuse (`ProductInput`, `CreateReviewInput`, etc.) — good pattern, keeps type duplication down.
- **Weak typing** — `addCatalogProductToStoreSchema.sizePricing: z.array(z.any()).optional()` (product.schema.ts) is untyped despite `productSizePricingSchema` existing 80 lines earlier in the same file and being exactly the right shape.
- **Duplicate validation** — `discountType !== "free_delivery" && discountValue <= 0` is re-checked imperatively in `coupon.controller.ts` after `createCouponSchema` already validates `discountValue` — see file review above. Not a large duplication, but validation ownership for this one rule is split.
- **Naming** — consistent `xSchema` convention throughout; domain-specific names (`sellerResetPasswordSchema`-style specificity carries over as `addCatalogProductToStoreSchema`, `toggleCouponStatusSchema`). No complaints.
- **Schema organisation** — one file per domain concept (product/category/coupon/event/banner/image), matches controller boundaries 1:1. Good modularity.
- **Notable oddity, not a bug**: `image.schema.ts`'s `folder` enum includes `"categriy"` (misspelled "category") — and `image.controller.ts` mirrors the same misspelling in its `validFolders` array and `targetBaseFolder === "categriy"` check. Schema and controller are internally consistent with each other, but the typo is now a de facto part of the Cloudinary folder contract and will confuse anyone reading either file in isolation.
- **Validation ownership** — `productSchema` requires `stock`, `sale_price`, `regular_price` as non-optional numbers, but `createProduct` (the only handler that validates against the full `productSchema`) never uses any of the three — it always sets `stock: 0, sale_price: 0, regular_price: 0` via `catalogRootData` regardless of what's submitted. The schema is stricter than the one call site that uses it actually needs.
- **Package boundary** — respected. No reach into `packages/zod-schema/src/schemas/*` internals from the service; only the public barrel is touched.

# Folder Structure

- `src/controllers/product/` mixes controller files with two non-controller utility modules (`utils.ts`, `weight-pricing.utils.ts`, `badges.ts`) — reasonable for a service this size, but `product.controller.ts`'s size (see below) is the real problem this structure is hiding.
- `search.controller.ts` sits directly under `src/controllers/`, one level up from every other controller (which live under `src/controllers/product/`) — inconsistent nesting for what is conceptually a sibling of the other product-domain controllers.
- No `services/` or `repositories/` layer — matches the platform-wide pattern already documented in [[SESSION_04]] / [[SESSION_05]], not a regression specific to this service.
- `flush-cache.ts` living at the service root (not under `src/`) alongside a broken import is the one genuinely misplaced file.

# Naming

- File naming is consistent kebab-case/dot-case (`admin.inventory.controller.ts`, `weight-pricing.utils.ts`) throughout — no mixed conventions found in this service, unlike the mixed `otpWorker.ts`/`order.worker.ts` pattern flagged in [[SESSION_05]].
- Function and schema naming is domain-specific throughout (`buildStorefrontCacheKey`, `resolvePreferredStore`, `mergeCatalogWithVariant`) — no generic `handleX`/`processY` names found.
- The "categriy" typo (see Zod Schema Review) is the one real naming defect, and it's load-bearing (part of the folder-routing contract), not cosmetic.

# Module Responsibilities

- `product.controller.ts` is the service's one clear god file — see File Reviews above for the full breakdown of the ≥4 concerns it currently holds.
- Everything else in the service is appropriately single-purpose: `stock.controller.ts`, `review.controller.ts`, `category.controller.ts`, `image.controller.ts` are all tightly scoped to their name.
- No business logic embedded in `product.routes.ts` beyond the repeated inline middleware already flagged — routing stays declarative.

# Code Style

- Comment density and style is consistent with what [[SESSION_04]]/[[SESSION_05]] describe as the platform norm: sparse, load-bearing why-comments (`image.controller.ts`, `meilisearch.ts`, `badges.ts` are the strongest examples), not narration.
- `getStorePublicOffers`'s and `getStoreProductBySlug`'s coupon-eligibility filtering logic (per-user usage via `prismaPostgres.couponUsage.groupBy`) is duplicated near-verbatim in both handlers — same query shape, same `usageMap` construction, same `maxUsesPerUser ?? 1` fallback. Candidate for a shared helper (e.g. `filterEligibleCoupons(codes, userId)`).
- No evidence of AI-generated boilerplate patterns (no generic `IProductService` interfaces, no unnecessary wrapper classes, no uniform JSDoc-everywhere). Under-abstraction where present (e.g. no repository layer) reads as an intentional, consistent platform choice rather than a red flag.

# Architecture

- Routes → Controllers → Prisma directly, no service/repository layer — consistent with `auth-service` and `worker-service`.
- Caching is treated as a controller-level concern throughout (Redis get/set inline in nearly every read handler) rather than abstracted — consistent within this service, though it means the same cache-key-building and get/set-with-catch pattern is retyped per handler rather than wrapped once.
- Search has a real fallback architecture (Meilisearch → MongoDB regex → background re-index) — the most architecturally mature piece of this service.

# Dependency Review

- No circular imports found between `src/controllers/product/*.ts` and `src/lib/meilisearch.ts` (one-directional: controllers → lib).
- `flush-cache.ts`'s broken relative import (`./src/lib/redis`) is the only import-correctness defect found.
- Package boundaries are respected — no deep imports into `@repo/zod-schema/dist/*` or `@repo/*` internals; everything comes through public package entrypoints (`@repo/db-mongo`, `@repo/db-postgres`, `@repo/libs/redis`, `@repo/libs/rabbitmq`, `@repo/libs/cloudinary`, `@repo/libs/queues`, `@repo/error-handlers`, `@repo/middlewares`, `@repo/env-config`).
- `QUEUE_NAMES.ORDER_EVENTS` / `QUEUE_NAMES.ADMIN_EVENTS` are correctly sourced from `@repo/libs/queues` in this service (unlike the raw string literals flagged in `worker-service` in [[SESSION_05]]) — this service is the well-behaved side of that cross-service inconsistency.

# Configuration

- `env.example` covers 1 of 5 env vars actually read — see File Reviews.
- No feature flags or runtime config toggles found in this service; all thresholds (`STOREFRONT_CACHE_TTL`, `MAX_STOREFRONT_LIMIT`, `RECENT_VIEW_CAP`, badge thresholds, etc.) are hardcoded module-level constants, which is appropriate for values that are business rules rather than deployment-environment differences.

# Error Handling

- Dominant pattern is `try { ... } catch (error) { return next(error); }` — consistent across nearly every handler.
- `restoreProduct` breaks the pattern with a direct `res.status(500).json({ message: "Eror restoring product", error })` instead of `next(error)` — see File Reviews.
- `product.cron.jobs.ts`'s comma-operator logging bug means the cron's actual failure reason is never captured — see File Reviews.
- Fire-and-forget patterns (`indexProduct(...)`, `invalidateSearchCache()`, `redis.setex(...).catch(...)`) are used consistently and appropriately for non-critical side effects (search indexing, cache writes) — errors there are correctly treated as non-fatal to the request.

# Logging

- 29 raw `console.log`/`console.error` call sites, zero use of a structured/leveled logger — matches the platform-wide gap already documented in [[SESSION_04]] and [[SESSION_05]] (a leveled logger reportedly exists in `@repo/libs` but isn't used here either).
- No duplicate logging found (unlike some patterns flagged in other services) — each error is logged once at the point it's caught.
- Missing context in a few spots: `product.cron.jobs.ts`'s logging bug (above) and `invalidateSearchCache`'s generic `console.error("[Cache Invalidation Error]", error)` without which key pattern failed.

# Type Safety

- 45 `: any` parameter/return annotations and 36 `as any` casts across the service, concentrated almost entirely in `product.controller.ts`'s merge/normalize helpers and Prisma `include`-shaped objects.
- Some of this is defensible (genuinely dynamic Prisma include/update payloads); some is avoidable (`mergeCatalogWithVariant(catalog: any, variant: any, preferredStore?: any)` could reference actual Prisma-generated types).
- Two independent `AuthRequest` types (see File Reviews) is the clearest type-organisation defect — one should be deleted in favor of importing the other.
- `getAnnouncementBanners`'s `prisma as any` cast (banner.controller.ts:574) appears to serve no purpose — the same `prisma.stores.findMany` call is made untyped elsewhere in the same file.

# Dead Code

- `src/controllers/product/weight-pricing.utils.ts` — entire file, 293 lines, zero imports anywhere.
- `flush-cache.ts` — broken import, not wired into any script; effectively unreachable/unrunnable as-is.
- `isSeller` import in `product.routes.ts` — imported, never used.
- `indexProduct` / `updateIndexedProduct` in `meilisearch.ts` are identical implementations under two names — not unused, but duplicated rather than aliased.

# Scalability

- The storefront caching pattern (cache-key-from-params → get → compute → set) scales fine for more read endpoints of the same shape, but each handler re-implements the get/set/catch boilerplate; a small `withCache(key, ttl, compute)` wrapper would reduce the marginal cost of adding more.
- `product.controller.ts`'s size is the main scalability risk for a larger team — merge conflicts and review difficulty will compound as more storefront/activity features are added to the same file. Splitting along the four concerns already identified (catalog CRUD, storefront read, cart, activity/homepage) would let different engineers own different files.
- The repeated inline admin-or-seller middleware (6× in routes) will keep getting copy-pasted for new routes unless extracted now — the more routes added, the more copies drift.
- Search's Meilisearch→Mongo fallback architecture scales well to more query types without structural change.

# Human Code Quality

- Reads like real engineers under real time pressure, not generated code: comment density is uneven in exactly the way genuine incremental development produces (badges.ts and image.controller.ts are meticulously commented; admin.inventory.controller.ts and stock.controller.ts have light comments; several handlers have none).
- The `buildMergedFromCatalogs` helper being added later and not backported into `getStoreProducts`'s pre-existing inline duplicate (see File Reviews) is a very human artifact — someone extracted the pattern for new features without going back to refactor the original call site.
- No detectable AI-authorship signals: no uniform docstrings, no generic `IRepository<T>`-style scaffolding, no suspiciously exhaustive error-message catalogs, naming is domain-specific and inconsistent in the ways real multi-author codebases are (e.g. `getRequiredParam` vs. `getRequiredField`-style naming isn't standardized, but reads as organic).
- The "categriy" typo shipping identically into both a zod enum and controller logic is itself a strong human-authorship signal — it's the kind of copy-paste-then-forget error that doesn't occur in generated code, which would spell the word correctly by default.

# Prioritised Fixes

See TODO Checklist below — same content, actionable form, ordered most-to-least structurally significant.

# TODO Checklist

- [x] 🔴 `src/controllers/product/product.controller.ts` Split into separate controllers by concern: catalog CRUD, storefront read (listing/detail/offers), cart validation, and homepage/activity (sections, recently-viewed, for-you, track-view, merge-activity) — currently one 2,363-line file with 18 exported handlers.
- [x] 🔴 `flush-cache.ts` Fix the broken import (`./src/lib/redis` doesn't exist — use `@repo/libs/redis` like every controller does) or delete the script if it's no longer needed.
- [x] 🟠 `src/controllers/product/weight-pricing.utils.ts` Delete — confirmed via grep to be unused anywhere in the service, or wire it in if the auto-pricing feature it implements was meant to ship.
- [x] 🟠 `src/routes/product.routes.ts` Extract the 6× repeated `(req: any, res: any, next: any) => req.role === "admin" ? next() : isApprovedSeller(req, res, next)` inline middleware into one named, properly-typed export (`utils.ts` or `@repo/middlewares`).
- [x] 🟠 `src/controllers/product/product.controller.ts` Extract the `hasAccess` ownership check (duplicated in `updateProduct`, `deleteProduct`, `restoreProduct`) into a shared helper in `utils.ts`, next to `getOwnedProductFilter`.
- [x] 🟠 `src/controllers/search.controller.ts` Delete the local `AuthRequest` interface and import the canonical one from `controllers/product/utils.ts`.
- [x] 🟠 `env.example` Document the 4 missing env vars actually read by this service: `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `CLOUDINARY_FOLDER`, `ACCESS_TOKEN_JWT_SECRET_KEY`.
- [x] 🟡 `src/controllers/product/product.controller.ts` Migrate `getStoreProducts`'s inline best-variant-selection loop to call `buildMergedFromCatalogs`/its internal helper instead of maintaining a second copy.
- [x] 🟡 `src/controllers/product/product.controller.ts` Change `restoreProduct`'s catch block to `next(error)` instead of `res.status(500).json({ message: "Eror restoring product", error })`, matching every other handler in the file; fix the "Eror" typo either way.
- [x] 🟡 `src/jobs/product.cron.jobs.ts` Fix `(console.log("(Cron Job) Error during deleting product"), error)` — the comma operator discards `error`; should be `console.log("(Cron Job) Error during deleting product", error)`.
- [x] 🟡 `src/controllers/product/product.controller.ts`, `src/controllers/product/coupon.controller.ts` Extract the duplicated per-user coupon-eligibility filter (`prismaPostgres.couponUsage.groupBy` + `usageMap` construction) used in `getStoreProductBySlug` and `getStorePublicOffers` into a shared helper.
- [x] 🟡 `packages/zod-schema/src/schemas/product.schema.ts` Type `addCatalogProductToStoreSchema.sizePricing` — **changed from plan**: not typed with `productSizePricingSchema` (that schema is stricter than what `normalizeSizePricing()` actually accepts — camelCase/snake_case key aliases, partial entries — so reusing it would reject previously-valid payloads). Used `z.array(z.record(z.string(), z.unknown()))` instead: rules out non-object entries without over-constraining the shape.
- [x] 🟡 `src/lib/meilisearch.ts` Collapse `indexProduct` and `updateIndexedProduct` (identical bodies) into one function, or make one call the other.
- [x] 🟢 `src/routes/product.routes.ts` Remove the unused `isSeller` import.
- [x] 🟢 `src/controllers/product/banner.controller.ts` Remove the unnecessary `prisma as any` cast in `getAnnouncementBanners` (line 574) — `prisma.stores.findMany` is used untyped elsewhere in the same file.
- [x] 🟢 `src/controllers/product/admin.inventory.controller.ts` Fix pagination correctness when `search` is set — `pagination.total`/`hasNextPage` are computed from `totalStores` (pre-filter) even though results are filtered post-query.
- [x] 🟢 `packages/zod-schema/src/schemas/image.schema.ts`, `src/controllers/product/image.controller.ts` Fix the "categriy" → "category" typo in the shared folder enum — **investigated, not changed**: see Completed Changes. This is a live cross-service API contract, not an internal-only typo.
- [x] 🟢 `README.md` Replace the default `bun init` template ("bank-service", `bun run index.ts`) with an actual description of this service and its real scripts (`tsx watch src/main.ts`, `tsup`, `node dist/main.js`).
- [x] 🟢 `src/main.ts` Add graceful shutdown (SIGINT/SIGTERM) to stop the cron job and close the server cleanly, matching the pattern noted as present in `worker-service`'s `main.ts` ([[SESSION_05]]).

## Newly discovered while fixing (appended)

- [x] 🟢 `src/controllers/product/product.controller.ts` (pre-split) `storefrontCatalogInclude` was defined but never referenced anywhere in the file — dead code, found while mapping symbol usage for the split. Dropped; not carried into any of the new files.
- [x] 🟢 `src/controllers/product/product.controller.ts` (pre-split) `getStorefrontSort` was defined but never called anywhere — dead code, same discovery pass. Dropped; not carried into any of the new files.

# Completed Changes

- **`product.controller.ts` split** (2,363 lines / 18 handlers → 905 lines / 10 handlers): extracted `getStoreProducts`, `getStoreProductBySlug`, `getStorePublicOffers` into new `storefront.controller.ts`; `validateCart` into new `cart.controller.ts`; `getHomepageSections`, `trackProductView`, `getRecentlyViewed`, `getForYou`, `mergeActivity` into new `activity.controller.ts`. Shared machinery (`resolvePreferredStore`, `mergeCatalogWithVariant`, `pickBestVariantPerCatalog`, storefront cache helpers, `StoreLocationInput`) moved into a new `storefront.utils.ts` imported by all three. `product.controller.ts` now holds only catalog CRUD (`slugValidator`, `createProduct`, `getCatalogProducts`, `addCatalogProductToStore`, `getOwnedProducts`, `getOwnedProductById`, `updateProduct`, `deleteProduct`, `restoreProduct`, `updateProductStock`). `product.routes.ts` updated to import from the four files. Verified with `tsc --noEmit` (no new errors vs. the pre-refactor baseline) and `tsup` build (succeeds, `dist/main.js` ~137 KB).
- **Best-variant-selection loop deduplicated**: while splitting, found that `getStoreProducts` (now in `storefront.controller.ts`) and `buildMergedFromCatalogs` (now in `activity.controller.ts`) still each had their own copy of the same "prefer in-stock, then cheapest" selection loop — the original audit's "migrate to the shared helper" fix would otherwise have just moved the duplication into two different files instead of removing it. Extracted `pickBestVariantPerCatalog()` into `storefront.utils.ts`; both call sites now use it.
- **`flush-cache.ts` fixed**: `import { redis } from "./src/lib/redis"` (nonexistent path) → `import { redis } from "@repo/libs/redis"`, matching every controller in the service.
- **`weight-pricing.utils.ts` deleted**: confirmed zero references anywhere in the service before removing.
- **Admin-or-approved-seller middleware deduplicated**: added `allowAdminOrApprovedSeller` to `product.routes.ts` (typed `req: any, res: Response, next: NextFunction` — matching the typing convention already used by every export in `@repo/middlewares/src/authorizeRole.ts`, since the duplication was the actual problem, not that convention). Replaced all 6 inline copies. Also removed the now-unused `isSeller` import from the same file.
- **`hasProductOwnerAccess` extracted**: added to `controllers/product/utils.ts` next to `getOwnedProductFilter`; `updateProduct`, `deleteProduct`, `restoreProduct` in `product.controller.ts` now call it instead of repeating the ownership check inline.
- **`AuthRequest` deduplicated**: `search.controller.ts` now imports the canonical `AuthRequest` from `controllers/product/utils.ts` instead of declaring its own narrower copy.
- **`env.example` updated**: added `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `CLOUDINARY_FOLDER`, `ACCESS_TOKEN_JWT_SECRET_KEY`.
- **`restoreProduct` error handling fixed**: catch block now calls `next(error)` like every other handler in the file, instead of `res.status(500).json({ message: "Eror restoring product", error })` (which also leaked the raw error object into the response and had a typo in the message).
- **Cron logging bug fixed**: `product.cron.jobs.ts`'s comma-operator expression (which silently discarded the caught `error`) is now a proper `console.log(msg, error)` call. Also exported the scheduled task (`productCleanupTask`) so `main.ts` can stop it on shutdown.
- **Coupon eligibility filter deduplicated**: `getStoreProductBySlug` and `getStorePublicOffers` (both now in `storefront.controller.ts`) share a new `filterByPerUserUsage()` helper for the `prismaPostgres.couponUsage.groupBy` + usage-map lookup, instead of each having its own copy of the try/catch and map-building logic.
- **`indexProduct`/`updateIndexedProduct` collapsed**: `updateIndexedProduct` is now `export const updateIndexedProduct = indexProduct;` — same upsert logic, two names kept so call sites can still say create-vs-update, but only one implementation.
- **`prisma as any` cast removed** in `banner.controller.ts`'s `getAnnouncementBanners` — unnecessary; `prisma.stores.findMany` is called untyped elsewhere in the same file with no cast.
- **Admin inventory pagination bug fixed**: when `search` is set, `admin.inventory.controller.ts` no longer paginates stores at the DB level (`skip`/`take`) before the post-hydration text filter runs. Instead it scans a bounded window (`SEARCH_SCAN_LIMIT = 500` candidate stores), applies the search filter, then paginates the filtered array in memory and computes `pagination.total`/`totalPages`/`hasNextPage` from the filtered count. Non-search requests are unaffected (still DB-paginated as before).
- **"categriy" typo — investigated, not changed**: grepped the full repo (not just product-service) and found `admin-ui/src/app/(routes)/dashboard/categories/page.tsx` and `seller-ui/src/shared/components/inventory/management-list.tsx` both send/read the literal string `"categriy"` as an API value — it's a live cross-service contract, not an internal-only misspelling. Renaming it in the shared `@repo/zod-schema` enum would 400 those two apps' category-image uploads unless updated in the same change, and both are outside this audit's stated scope (product-service + imported zod-schema files only). Asked the user; decision was to leave the value as-is and record the finding rather than make an uncoordinated cross-service change.
- **`sizePricing` typed without `z.any()`**: see TODO Checklist note above — used `z.array(z.record(z.string(), z.unknown()))` rather than the stricter `productSizePricingSchema`, to avoid silently rejecting payloads `normalizeSizePricing()` currently accepts.
- **README.md rewritten**: replaced the leftover `bun init` template (wrong service name "bank-service", wrong run command) with an actual description of the service and its real `dev`/`build`/`start` scripts.
- **Graceful shutdown added** to `main.ts`: `SIGINT`/`SIGTERM` now stop the cron task and close the HTTP server before exit, matching the pattern already present in `worker-service`'s `main.ts` ([[SESSION_05]]).

All changes verified with `tsc --noEmit` on `apps/product-service` (same 7 pre-existing errors as the pre-refactor baseline — all in `@repo/db-postgres` missing type declarations, `stock.controller.ts`'s pre-existing `req.params` typing, and `meilisearch.ts`'s pre-existing `toMeiliDoc` argument typing; none introduced by this session) and `tsup` build (`bun run build`, succeeds). `packages/zod-schema` typechecks clean.
