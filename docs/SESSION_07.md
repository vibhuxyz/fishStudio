# SESSION_07: Code Style & Structure Audit — apps/order-service

Scope: `apps/order-service/` in full (12 files under `src/`, plus `package.json`, `README.md`, `tsconfig.json`, `tsup.config.ts`; no `env.example` exists). Zod schema review limited to the one schema file this service imports: `order.schema.ts` (plus the `schemas/index.ts` / `index.ts` barrels that re-export it). No other shared package inspected in depth — `@repo/db-postgres`, `@repo/db-mongo`, `@repo/middlewares`, `@repo/libs`, `@repo/error-handlers`, `@repo/env-config` were only traced far enough to confirm import correctness.

# Executive Summary

- Core order-creation logic is genuinely production-grade: idempotency keys on `POST /create`, an atomic conditional stock decrement with rollback-on-failure, a Postgres `Serializable` transaction wrapping order + coupon-usage + payment creation, and a re-checked per-user coupon-usage guard *inside* the transaction to close a race window. This is not beginner work.
- **Confirmed correctness gap**: `admin.controller.ts::updateAdminOrderStatus` never restores product stock when an admin cancels an order, while the equivalent seller-side path (`seller.controller.ts::updateOrderStatus`, `CANCELLED` branch) and the user-side path (`user.controller.ts::cancelOrder`) both do. Admin-cancelled orders silently leak reserved stock.
- **Confirmed dead conditional**: `user.controller.ts:271` — `paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING"` evaluates to the same value on both branches. No code path anywhere in this service moves a `RAZORPAY`/`ONLINE` order's payment status off `PENDING` except a seller/admin manually marking it `DELIVERED` — online payment confirmation looks unimplemented.
- **Confirmed dead/unrouted file**: `src/controller/cart.controller.ts` (singular `controller/`, git-untracked) exports `saveCart`/`getCart`/`clearCart`; none are imported by `order.route.ts` or anywhere else in the service.
- **Confirmed dead code**: `src/utils/send-email/index.ts::sendEmail` (nodemailer + ejs) has zero call sites in the service; its sole template, `order-confirmation.ejs`, is consequently unused too. It also contains a real bug were it ever wired up: `` from: `<${ENV.SMTP_USER}` `` is missing the closing `>`.
- **Confirmed 3x-duplicated business logic**: the "restore stock + `totalSold` for cancelled/rejected order items" operation is independently reimplemented in `user.controller.ts::cancelOrder`, `seller.controller.ts::acceptOrRejectOrder` (reject branch), and `seller.controller.ts::updateOrderStatus` (`CANCELLED` branch) — three different concurrency styles, three different log-message prefixes, no shared helper. The admin path above is effectively a fourth call site that's missing entirely.
- Queue-name discipline is half-fixed: `QUEUE_NAMES.ORDER_EVENTS` (from `@repo/libs/queues`) is used correctly everywhere, per the platform-wide cleanup already recorded in [[SESSION_05]]. But `"NOTIFICATION_QUEUE"` — used at 5 call sites across `user.controller.ts` and `seller.controller.ts` — was outside that cleanup's scope and is still a raw string literal with no entry in `QUEUE_NAMES` at all.
- `@repo/libs/logger` is now genuinely reachable (the export-map bug that made it unreachable platform-wide was fixed in [[SESSION_05]]) — order-service simply hasn't adopted it yet; still 100% `console.log`/`console.error`, matching the gap already flagged for `auth-service` ([[SESSION_04]]) and `product-service` ([[SESSION_06]]).
- No service/repository layer — controllers call `prismaPostgres`/`prismaMongo` directly, consistent with the established platform-wide pattern.
- Zod is used consistently in the two write-heavy domains (`user.controller.ts`, `seller.controller.ts`) but skipped entirely in `admin.controller.ts` (hand-rolled array checks, duplicated within the same file) and `cart.controller.ts` (manual `Array.isArray` check) — inconsistent validation ownership within one service.
- Configuration is undocumented: 8 env vars are read; zero are documented — there is no `env.example` file for this service at all (worse than the "partially documented" gap found in `auth-service`/`product-service`).

# File Reviews

### src/main.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- Clean, minimal bootstrap: helmet, compression, global rate limit, CORS with documented allowed headers.
- `app.use(compression() as any)` (line 19) — casts around a type mismatch instead of resolving it.
- No graceful shutdown (SIGINT/SIGTERM) — the HTTP server is never closed cleanly on exit.
- `// Fix #21: trust gateway's X-Forwarded-* so req.ip is the real client IP.` (line 13) is a genuine why-comment despite the odd "Fix #N" numbering (no issue tracker reference exists elsewhere in the service to explain the numbering).

### src/routes/order.route.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- Route groups are clearly sectioned with header comments (`── User Orders ──`, `── Seller Orders ──`, etc.) and each middleware chain reads its authorization intent at a glance.
- Line 52: `require("../controllers/order/stats.controller.js").getAdminSellerOrders` with a `// @ts-ignore` — the only `require()` call in an otherwise fully-ESM (`"type": "module"`, `NodeNext`) codebase. `getSellerStats`/`getAdminStats` are imported normally from the same file two lines above; `getAdminSellerOrders` was apparently added later and patched in around a stale import list instead of the import being fixed.

### src/middlewares/perUserRateLimit.ts
**Quality** — ⭐⭐⭐⭐⭐ (5/5)
- Small, correct, well-reasoned. Fails open on Redis unavailability with an explicit comment explaining why (don't block real orders), sets `X-RateLimit-*`/`Retry-After` headers, atomic `INCR`+`EXPIRE`. Nothing to flag.

### src/controllers/order/user.controller.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- `createOrder` (lines 85–468, ~380 lines) is the strongest piece of domain logic in the service: idempotency-key short-circuit, parallel product/store/coupon fetch, atomic per-item conditional stock decrement with full rollback on partial failure, `Serializable` Postgres transaction for order+coupon-usage+payment, background notification/audit-log fan-out after the response is already sent. Well-sectioned with numbered comments (`── 0.`–`── 9.`), but still a single function doing seven distinct jobs — a strong candidate for extracting named steps (e.g. `reserveStock`/`rollbackStock`, `computeOrderTotals`).
- Line 271: `paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING"` — dead conditional, see Executive Summary.
- `cancelOrder`'s stock-restore block (lines 642–653) duplicates logic also present in `seller.controller.ts` twice — see Executive Summary / Module Responsibilities.
- `"NOTIFICATION_QUEUE"` hardcoded 3× (lines 426, 448, 663) instead of a shared constant.
- Comment quality is genuinely good elsewhere: the coupon-error-message comment (line 57, "don't distinguish 'wrong scope'/'maxed out'/'expired' — each leaks info about a valid code") is a real load-bearing why-comment.

### src/controllers/order/seller.controller.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Clean, appropriately-sized handlers; validates via `acceptOrRejectOrderSchema`/`updateOrderStatusSchema` consistently (unlike `admin.controller.ts`).
- `acceptOrRejectOrder`'s reject-branch stock restore (lines 127–140, sequential `for...await` + try/catch) and `updateOrderStatus`'s `CANCELLED`-branch stock restore (lines 211–223, `Promise.all(...).catch(...)`) are two more copies of the same operation duplicated in `user.controller.ts::cancelOrder` — three total, two different concurrency styles.
- `"NOTIFICATION_QUEUE"` hardcoded 2× (lines 148, 291).
- `let orderMetadata: any = { orderId }` (line 242) — untyped where a proper shape would be straightforward to express.

### src/controllers/order/admin.controller.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- `getAdminOrderList`'s header comment (lines 6–22) documenting every query param, type, and default is genuinely good practice — the strongest documentation in the service.
- Manual `validStatuses`/`validPayStatuses` array validation instead of zod — and the exact same `validStatuses` array literal (`["PENDING","ACCEPTED","REJECTED","SHIPPED","DELIVERED","CANCELLED"]`) is duplicated verbatim at line 52 (`getAdminOrderList`) and line 525 (`updateAdminOrderStatus`) within this one file.
- `updateAdminOrderStatus` (lines 516–546) does not restore stock on cancellation — see Executive Summary. `status: status as any` (line 536) also bypasses whatever Prisma-generated `OrderStatus` type exists.
- `getAdminOrderList` (lines 183–232) and `getAdminOrderDetail` (lines 356–467) independently build near-identical customer/store/seller/items shapes from the same three Mongo collections — different field selections, same structural pattern, no shared helper.
- The stale-`PENDING`-payment-status self-heal (delivered order with unfinished COD payment record) is implemented separately in both `getAdminOrderList` (bulk `updateMany` over the current page) and `getAdminOrderDetail` (single-row update) — a third variant of the same "delivered ⇒ payment completed" rule that `updateOrderStatus`/`updateAdminOrderStatus` also encode via their `status === "DELIVERED"` branches.

### src/controllers/order/stats.controller.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Clean caching pattern (`redis.get` → compute → `redis.set`, fails open with a comment on Redis unavailability) applied consistently across all three exported handlers.
- Seller stats are actively invalidated on every order status change (`invalidateSellerStatsCache`, called from `seller.controller.ts`); admin stats cache keys (`stats:admin:seller:*`, `stats:admin:all:*`) are never invalidated anywhere and only expire passively via `STATS_CACHE_TTL` (2 min) — acceptable given the short TTL, but an asymmetry worth knowing about.
- `getAdminSellerOrders` (exported here) is the function reached via the `require()` workaround in `order.route.ts` — see that file's review.

### src/controllers/order/utils.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- `computeStats` (lines 36–277) is a single ~240-line function building four nested accumulator maps (pincode, shop, product, category) in one pass over `orders`. Correct-looking and reasonably typed (real `Record<...>` shapes, not `any`), but dense enough that extracting one accumulator-update function per map would materially help readability.
- `getPeriodStart`/`invalidateSellerStatsCache` are small and clear.

### src/controller/cart.controller.ts
**Quality** — N/A — **dead/unrouted file**
- Three handlers (`saveCart`, `getCart`, `clearCart`) reading/writing `prismaMongo.abandoned_carts`, well-commented with clear route/body documentation headers — but confirmed via grep to have zero importers anywhere in the service. Git-untracked (`??` in `git status`), suggesting unfinished work rather than a recent deliberate removal.
- The one file in the service with no zod validation (`if (!Array.isArray(items))` manual check) and untyped body (`items: any[]`) — consistent with it being work-in-progress rather than a shipped, reviewed endpoint.
- Lives in `src/controller/` (singular) — the only file in the service under that directory; every routed controller lives under `src/controllers/order/` (plural).

### src/utils/send-email/index.ts
**Quality** — N/A — **dead code, with a bug**
- `sendEmail` (nodemailer + ejs) has zero call sites anywhere in the service — confirmed via grep.
- Line 46: `` from: `<${ENV.SMTP_USER}`, `` — missing closing `>`, would produce a malformed From header if this path were ever exercised.
- `nodemailer`, `ejs`, `@types/nodemailer`, `@types/ejs` are real `package.json` dependencies that exist solely to support this unused path.

### src/utils/email-templates/order-confirmation.ejs
**Quality** — N/A — **dead (sole consumer is dead)**
- Well-formed HTML email template; unreachable because `sendEmail` (its only caller) is never invoked.

### Config files (package.json, tsconfig.json, tsup.config.ts, README.md — no env.example)
**Quality** — ⭐⭐☆☆☆ (2/5)
- `README.md` is the unedited `bun init` template (`bun run index.ts`), which doesn't match the actual scripts (`bun --watch src/main.ts` / `tsup` / `node dist/main.js`) — same gap already flagged and fixed in `product-service` ([[SESSION_06]]).
- No `env.example` at all — the service reads 8 env vars (`CORS_ORIGINS`, `ORDER_SERVICE_PORT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SERVICE`, `SMTP_USER`, `SMTP_PASS`, `NODE_ENV`) and documents none of them.
- `tsconfig.json`/`tsup.config.ts` are unremarkable and consistent with sibling services.

# Zod Schema Review

Files reviewed: `packages/zod-schema/src/schemas/order.schema.ts` (the only schema file this service imports), plus `schemas/index.ts` and `src/index.ts` barrels.

- **Import paths** — clean. `user.controller.ts`/`seller.controller.ts` import `validate` and the order schemas from the package root `@repo/zod-schema`; no deep imports into `@repo/zod-schema/schemas/*` or `dist/*` found anywhere in this service.
- **Public exports** — `schemas/index.ts` barrels `order.schema.ts` correctly alongside the other domain schemas; `src/index.ts` re-exports `CreateOrderInput`/`AcceptOrRejectOrderInput`/`UpdateOrderStatusInput` as inferred `z.infer` types, but none of the three are imported anywhere in `order-service` — validated data is destructured straight into untyped locals instead (`items: any`, etc. in the calling controllers).
- **Validation ownership / schema-controller drift** — `createOrderSchema` requires `billDetails` (a full nested object), `totalAmount`, and `items[].price` as part of the request body, but `createOrder` never reads any of the three: it recomputes `itemTotal`/`totalAmount`/discount entirely from DB-fetched product prices and ignores the client-submitted values. This is the right security posture (never trust client-supplied pricing), but it means the schema forces the client to construct and send data that has zero effect on the resulting order — either the schema is stale relative to the handler, or these fields were meant to be used as a client/server cross-check and never were.
- **Weak typing** — `orderItemSchema.selectedOptions: z.record(z.any())` and `billDetailsSchema.discountBreakdown: z.array(z.any())` are both open-ended `any`.
- **Weak validation** — `deliveryDetailsSchema.phone`/`.pincode` only enforce a minimum string length (`.min(10, ...)`, `.min(6, ...)`), not that the value is actually numeric — a 10-character non-numeric string currently passes.
- **Naming** — consistent `xSchema` convention (`createOrderSchema`, `acceptOrRejectOrderSchema`, `updateOrderStatusSchema`), domain-specific throughout. No complaints.
- **Schema organisation** — one file for the order domain, matching the one-file-per-domain pattern already noted in `product-service` ([[SESSION_06]]). Good modularity.
- **Duplicate validation** — the order-status enum this schema expresses (`updateOrderStatusSchema`: `SHIPPED | DELIVERED | CANCELLED`) is re-implemented by hand, with a *different* value set (`PENDING | ACCEPTED | REJECTED | SHIPPED | DELIVERED | CANCELLED`), twice in `admin.controller.ts` instead of being derived from or referencing this schema — see File Reviews.
- **Package boundary** — respected. Only the public `@repo/zod-schema` barrel is touched; no reach into package internals.

# Folder Structure

- `src/controller/` (singular, one file: the dead `cart.controller.ts`) vs `src/controllers/order/` (plural, nested, four routed controllers) — a direct naming/depth collision, the same category of issue as the `src/middleware/` vs `@repo/middlewares` collision flagged in `auth-service` ([[SESSION_04]]).
- `src/controllers/order/` nested one level inside a service that *is* the order service is mildly redundant naming (`order-service/src/controllers/order/`), though harmless.
- No `services/`/`repositories/` layer — consistent with the platform-wide pattern already documented in [[SESSION_04]]/[[SESSION_05]]/[[SESSION_06]], not a regression specific to this service.
- `src/utils/send-email/` is a nested folder for a single file, while `src/utils/email-templates/` sits flat as a sibling — minor asymmetry, low priority, and moot if the dead email path is removed instead.

# Naming

- `perUserRateLimit.ts` (camelCase) sits in `src/middlewares/` while every controller file uses dot-case (`user.controller.ts`, `stats.controller.ts`) — two conventions across the small tree, the same category of drift flagged as normal/expected in prior sessions rather than a defect worth chasing.
- Function naming is domain-specific throughout (`prefetchCoupon`, `computeCouponDiscount`, `invalidateSellerStatsCache`, `getPeriodStart`) — no generic `handleX`/`processY` names found.
- `src/controller/` vs `src/controllers/order/` (see Folder Structure) is the one real naming defect in this service, not just cosmetic drift — it signals an unfinished/unmerged addition.

# Module Responsibilities

- No god files by the standard set in `product-service` ([[SESSION_06]], 2,363-line `product.controller.ts`) — the largest file here is `user.controller.ts` at 683 lines across 4 handlers, all within one coherent domain.
- `createOrder` is the one god *function* — ~380 lines covering idempotency, pricing, coupon validation, stock reservation + rollback, transaction, notifications, and audit logging. Well-sectioned, but still seven jobs in one function body.
- The stock-restore operation is the clearest "never extracted into a shared helper" case in the service: three independent implementations (`user.controller.ts::cancelOrder`, `seller.controller.ts::acceptOrRejectOrder`, `seller.controller.ts::updateOrderStatus`) plus one call site that's missing it entirely (`admin.controller.ts::updateAdminOrderStatus`).
- `getAdminOrderList`/`getAdminOrderDetail` independently re-derive the same customer/store/seller/items shape from Mongo — a second candidate for a shared shaping helper.
- Business rules (coupon eligibility math, delivery-window checks, stale-payment self-heal) live directly in controllers, no domain/service layer — consistent with the rest of the platform.
- `cart.controller.ts` is a domain-boundary question mark: cart is conceptually closer to checkout/product than to post-purchase order management, and it's currently orphaned rather than deliberately placed here.

# Code Style

- Comment density mirrors the platform norm already described in [[SESSION_04]]/[[SESSION_06]]: sparse but load-bearing why-comments (the coupon-error-message reasoning in `user.controller.ts:57`, the "still PENDING until seller accepts" reasoning in `cancelOrder`), not narration.
- The "Fix #21"/"Fix #22" numbered comments (`main.ts:13`, `user.controller.ts:57`) are an odd, unexplained numbering convention, but each one carries genuine why-content rather than being pure process narration.
- `paymentMethod === "COD" ? "PENDING" : "PENDING"` (user.controller.ts:271) is the clearest "incomplete edit left behind" artifact in the service.
- The duplicated `validStatuses` array (admin.controller.ts, 2×) and the duplicated stock-restore loop (3× across two files, two different concurrency idioms) are the two concrete, evidenced duplication defects.
- `order.route.ts`'s `require()` + `@ts-ignore` mid-file is the single sharpest style inconsistency in the service — everything else in the codebase is ESM `import`.

# Architecture

- Routes → Middleware (auth/role/rate-limit) → Controller → Prisma (both `prismaPostgres` and `prismaMongo`) directly. No service/repository layer.
- Cross-database joins are hand-hydrated consistently and correctly: every read handler fetches related Mongo documents (users/stores/products) in parallel via `Promise.all` and joins by `Map`, no N+1 query patterns found.
- Notification/event publishing (RabbitMQ) is called directly and inline from controllers — consistent with the pattern already established platform-wide, not a service-specific issue.
- The idempotency-key + `Serializable`-transaction + atomic-conditional-stock-decrement combination in `createOrder` is the most architecturally mature piece of this service — genuine concurrency-safety engineering.

# Dependency Review

- No circular imports found.
- No deep imports into `@repo/zod-schema/dist/*` or `/schemas/*` — only the public barrel is used.
- `order.route.ts`'s `require()` call is the one import-correctness oddity: mixing a CJS `require` into a `"type": "module"` / `NodeNext` package. It may work if `tsup`/esbuild injects a `createRequire` shim for the ESM output, but it should be verified rather than assumed, and there's no reason for it to exist when the target function is already exported the same way as its neighbors.
- `QUEUE_NAMES.ORDER_EVENTS` is correctly sourced from `@repo/libs/queues` (the platform-wide fix recorded in [[SESSION_05]]) at every relevant call site in this service. `"NOTIFICATION_QUEUE"` is not in `QUEUE_NAMES` at all (`packages/libs/src/queues/index.ts` only defines `OTP_QUEUE`, `ORDER_EVENTS`, `ADMIN_EVENTS`) and is hardcoded as a raw string 5× across `user.controller.ts`/`seller.controller.ts` — this is a gap [[SESSION_05]]'s cleanup didn't cover, not a regression of it.

# Configuration

- No `env.example` for this service at all — 8 env vars read (`CORS_ORIGINS`, `ORDER_SERVICE_PORT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SERVICE`, `SMTP_USER`, `SMTP_PASS`, `NODE_ENV`), 0 documented.
- No feature flags. `STATS_CACHE_TTL` (utils.ts) and `IDEMPOTENCY_TTL_SEC` (user.controller.ts) are hardcoded module constants, appropriate for business-rule values rather than deployment config, consistent with the pattern already endorsed in [[SESSION_06]].

# Error Handling

- Dominant pattern is `try { ... } catch (error) { return next(error); }`, consistent with `@repo/error-handlers`'s custom classes (`ValidationError`, `NotFoundError`) used correctly throughout.
- Non-critical side effects (notifications, cache invalidation, audit logs, stock-restore-on-cancel) are correctly isolated in their own try/catch or `.catch()` so they can't fail the main request — the same good defensive pattern praised in `auth-service` ([[SESSION_04]]).
- Inconsistent even within the isolation pattern: most `.catch()` blocks log with context (e.g. `.catch((err) => console.error("[cancelOrder] stock restore failed:", err))`), but `cancelOrder`'s own notification try/catch (line 672) swallows silently with `catch { /* non-critical */ }` and no log line at all — two different swallow styles in the same function.
- The missing stock-restore in `updateAdminOrderStatus`'s `CANCELLED` path (see Executive Summary) is the one error-handling-adjacent gap that's a real correctness defect, not just an exception-handling style choice.

# Logging

- 100% `console.log`/`console.error`, zero use of a structured logger. Note this is now purely an *adoption* gap, not a package-level defect: [[SESSION_05]] already fixed `@repo/libs`'s export-map bug that made `@repo/libs/logger` unreachable platform-wide, so the logger is genuinely usable here — order-service just hasn't picked it up yet.
- The 3 duplicated stock-restore blocks have 3 different log-message prefixes (`[cancelOrder]`, no prefix, `[updateOrderStatus]`) — a direct symptom of the logic being copy-pasted rather than shared.
- No request/correlation ID anywhere in the request path — same gap already noted in `auth-service` ([[SESSION_04]]).

# Type Safety

- `req: any` in every handler instead of an augmented `Express.Request` — consistent with the platform-wide gap already flagged in [[SESSION_04]]/[[SESSION_06]].
- `status: status as any` (admin.controller.ts:536) bypasses whatever Prisma-generated `OrderStatus` enum type exists.
- `app.use(compression() as any)` (main.ts:19).
- `let orderMetadata: any = { orderId }` (seller.controller.ts:242).
- `items: any[]` in the dead `cart.controller.ts` — the least-typed file in the service, consistent with it being unfinished work.
- Zod-inferred types (`CreateOrderInput`, `AcceptOrRejectOrderInput`, `UpdateOrderStatusInput`) are exported from `@repo/zod-schema` but not imported anywhere in this service — validated data is destructured into untyped locals instead of typed ones.

# Dead Code

- `src/controller/cart.controller.ts` — entire file, 3 handlers, zero importers, git-untracked.
- `src/utils/send-email/index.ts::sendEmail` — zero call sites.
- `src/utils/email-templates/order-confirmation.ejs` — sole consumer (`sendEmail`) is itself dead.
- `paymentMethod === "COD" ? "PENDING" : "PENDING"` (user.controller.ts:271) — not unreachable, but a conditional with no actual branching.

# Scalability

- Adding a new order status requires touching it in at least 3 disconnected places: `updateOrderStatusSchema` (zod), the `validStatuses` array in `admin.controller.ts` (×2, duplicated within itself), and presumably the Prisma schema's own enum — no single source of truth, so this will keep drifting.
- The stock-restore duplication (3 copies + 1 missing) means every future cancellation-adjacent code path has to remember to reimplement — or, as the admin path shows, will silently omit — the compensating stock action.
- The idempotency + Serializable-transaction + atomic-stock-decrement pattern in `createOrder` will scale to more order traffic without rework — a genuine strength, not a risk.
- `computeStats`'s single-pass multi-map aggregation is already handling four dimensions (pincode, shop, product, category) in one function body; adding more reporting dimensions will make it harder to follow without decomposition.
- No service layer means new business rules get added straight into controllers — fine at current size, consistent with the rest of the platform, will need revisiting only if team size grows materially.

# Human Code Quality

- The core `createOrder` flow (idempotency keys, Serializable transactions, atomic conditional stock decrements with rollback, race-safe coupon-usage re-check inside the transaction) reflects real experience with concurrency bugs in production commerce systems — not default or generated-looking code.
- The dead-end artifacts (unrouted cart controller, always-`PENDING` ternary, unused email pipeline, `require()`-patched route import) read as classic incremental-development residue — features started and abandoned mid-flight, imports patched around rather than fixed at the source — not uniform machine-generated style.
- The stock-restore logic being reimplemented 3 different ways (two different concurrency idioms, three different log prefixes) is itself a strong human-authorship signal: a single generation pass would likely produce one consistent helper, not three organically-diverged copies plus a fourth call site that forgot it entirely.
- No detectable AI-authorship signals: no generic `IOrderService`/`IOrderRepository` interfaces, no uniform JSDoc-everywhere, no suspiciously exhaustive error-message catalogs. If anything the service under-abstracts (no service layer), consistent with every other service audited in this series.

# Prioritised Fixes

See TODO Checklist below — same content, actionable form, ordered most-to-least structurally significant.

# TODO Checklist

- [x] 🔴 `apps/order-service/src/controllers/order/admin.controller.ts` (`updateAdminOrderStatus`) Restore product stock when an admin cancels an order — currently the only cancellation path in the service that doesn't, unlike `seller.controller.ts::updateOrderStatus` and `user.controller.ts::cancelOrder`. Stock is silently leaked when an order is cancelled via the admin endpoint.
- [x] 🔴 `apps/order-service/src/routes/order.route.ts` (line 52) Replace `require("../controllers/order/stats.controller.js").getAdminSellerOrders` + `// @ts-ignore` with a normal top-of-file import alongside `getSellerStats`/`getAdminStats` — the only CJS `require()` in an otherwise fully-ESM service.
- [x] 🔴 `apps/order-service/src/controllers/order/user.controller.ts` (line 271) Fix `paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING"` — both branches are identical; online/Razorpay payment confirmation appears unimplemented and needs a real status transition path.
- [x] 🟠 `apps/order-service/src/controllers/order/user.controller.ts`, `seller.controller.ts`, `admin.controller.ts` Extract a shared `restoreOrderStock(orderItems)` helper (e.g. in `utils.ts`) — currently reimplemented independently in `cancelOrder`, `acceptOrRejectOrder`, and `updateOrderStatus`, and would also supply the fix for the admin gap above.
- [x] 🟠 `apps/order-service/src/controllers/order/admin.controller.ts` Replace the manual `validStatuses`/`validPayStatuses` array checks (duplicated verbatim between `getAdminOrderList` and `updateAdminOrderStatus`) with the zod schemas already used by `seller.controller.ts` — validation ownership is currently split between zod and hand-rolled arrays within the same domain.
- [x] 🟠 `apps/order-service/src/controller/cart.controller.ts` Wire into `order.route.ts` if the feature is meant to ship, or delete it — currently dead, unrouted, and untracked in git.
- [x] 🟠 `apps/order-service/src/utils/send-email/index.ts`, `src/utils/email-templates/order-confirmation.ejs` Wire up or delete — `sendEmail` has zero call sites in the service; if kept, fix the missing `>` in the `from` header first (line 46).
- [x] 🟠 `packages/libs/src/queues/index.ts`, `apps/order-service/src/controllers/order/user.controller.ts`, `seller.controller.ts` Add a `NOTIFICATION_QUEUE` key to `QUEUE_NAMES` and replace the 5 hardcoded `"NOTIFICATION_QUEUE"` string literals with it — the platform-wide `ORDER_EVENTS`/`ADMIN_EVENTS` cleanup in [[SESSION_05]] didn't cover this queue name.
- [x] 🟡 `apps/order-service/src/controllers/order/admin.controller.ts` (`getAdminOrderList`, `getAdminOrderDetail`) Extract a shared order-shaping/hydration helper — both independently build near-identical customer/store/seller/items shapes from the same Mongo collections. **Scoped down during fix**: the two endpoints' JSON response shapes are genuinely different contracts (`admin-ui` consumes each separately — list returns raw hydrated docs, detail returns a fully reshaped/renamed object) so they were *not* merged into one shaping function to avoid silently changing either API's output. What actually was duplicated — the `select` clauses and the stale-payment self-heal — was extracted instead; see Completed Changes.
- [x] 🟡 `apps/order-service/env.example` Create this file — service reads 8 env vars (`CORS_ORIGINS`, `ORDER_SERVICE_PORT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SERVICE`, `SMTP_USER`, `SMTP_PASS`, `NODE_ENV`), none currently documented. **Changed from plan**: the SMTP vars are gone (the dead `send-email` code that read them was deleted, see above), so the actual list is now `ORDER_SERVICE_PORT`, `CORS_ORIGINS`, `NODE_ENV` plus the infra vars (`POSTGRES_URL`, `MONGO_URL`, `REDIS_DATABASE_URL`, `RABBITMQ_*`) consumed transitively via `@repo/db-postgres`/`@repo/db-mongo`/`@repo/libs`, matching how `auth-service/env.example` documents its own transitive vars.
- [x] 🟡 `apps/order-service/README.md` Replace the default `bun init` template (`bun run index.ts`) with real docs matching the actual scripts (`bun --watch src/main.ts` / `tsup` / `node dist/main.js`).
- [x] 🟡 `apps/order-service/src/controllers/order/admin.controller.ts` (line 536) Type `status` against the actual Prisma `OrderStatus` type instead of `status as any`.
- [x] 🟡 `apps/order-service/src/controllers/order/user.controller.ts` (`createOrder`) Extract named steps (e.g. `reserveStock`/`rollbackStock`, `computeOrderTotals`) out of the ~380-line handler to make it easier to review and modify safely.
- [x] 🟡 `apps/order-service/src/main.ts`, `src/controllers/order/*.ts` Replace `console.log`/`console.error` with `@repo/libs/logger` — now genuinely reachable after the [[SESSION_05]] export-map fix, just not adopted here yet.
- [x] 🟢 `apps/order-service/src/main.ts` (line 19) Investigate the type mismatch behind `compression() as any` instead of casting.
- [x] 🟢 `apps/order-service/src/main.ts` Add graceful shutdown (SIGINT/SIGTERM) for the HTTP server, matching the pattern already added to `product-service` ([[SESSION_06]]).
- [x] 🟢 `apps/order-service/src/controller/` Rename to match the `src/controllers/order/` (plural) convention once `cart.controller.ts` is either wired up or removed.
- [x] 🟢 `apps/order-service/src/controllers/order/seller.controller.ts` (line 242) Type `orderMetadata` instead of `any`.
- [x] 🟢 `packages/zod-schema/src/schemas/order.schema.ts` Type `orderItemSchema.selectedOptions` and `billDetailsSchema.discountBreakdown` beyond `z.any()`, or note why they're intentionally open-ended.
- [x] 🟢 `packages/zod-schema/src/schemas/order.schema.ts` (`createOrderSchema`) Decide whether `billDetails`, `totalAmount`, and `items[].price` should be dropped from the schema (currently required but never read by `createOrder`, which recomputes everything server-side) or actually used as a client/server cross-check. **Resolved**: user chose to keep the fields required (no contract change — confirmed `user-ui`/`mobile` both already send them) and add a non-blocking mismatch log instead; see Completed Changes.
- [x] 🟢 `packages/zod-schema/src/schemas/order.schema.ts` (`deliveryDetailsSchema`) Validate `phone`/`pincode` as numeric (e.g. regex), not just minimum length. **Resolved**: user chose to leave as-is — couldn't confirm every client (beyond the two checked) always sends pure digits, and the risk of rejecting real checkout requests outweighed the validation-strictness gain.

# Completed Changes

- **Stock-restore logic centralized, and the admin cancel bug fixed**: added `restoreOrderStock(orderItems, context)` to `controllers/order/utils.ts` (fire-and-forget, logs with a `[context]` prefix on failure). `user.controller.ts::cancelOrder`, `seller.controller.ts::acceptOrRejectOrder` (reject branch), and `seller.controller.ts::updateOrderStatus` (`CANCELLED` branch) now all call it instead of each having their own copy. `admin.controller.ts::updateAdminOrderStatus` now also calls it when `status === "CANCELLED"` — this was the actual bug: admin-cancelled orders previously never released their reserved stock. Fetching `existing` in that handler now includes `orderItems` so the restore has data to work with.
- **`admin.controller.ts` validation moved to zod**: added `orderStatusValues`, `paymentStatusValues`, `updateAdminOrderStatusSchema`, and `adminOrderListQuerySchema` to `packages/zod-schema/src/schemas/order.schema.ts` (plus `UpdateAdminOrderStatusInput`/`AdminOrderListQueryInput` inferred-type exports in `src/index.ts`, matching the existing barrel convention). `getAdminOrderList` and `updateAdminOrderStatus` now validate `status`/`paymentStatus`/`sortBy`/`sortDir` through these schemas instead of two duplicated hand-rolled `validStatuses`/`validPayStatuses` arrays. Rebuilt `packages/zod-schema` (`tsup`) so the new exports resolve.
- **`status as any` removed**: since `validate(updateAdminOrderStatusSchema, req.body)` now returns a properly-typed literal union matching Prisma's `OrderStatus` values, the cast in `updateAdminOrderStatus`'s `prismaPostgres.order.update` call is gone.
- **`order.route.ts` `require()` removed**: `getAdminSellerOrders` is now imported normally at the top of the file alongside `getSellerStats`/`getAdminStats`; the `// @ts-ignore` is gone too.
- **Dead COD ternary fixed**: `user.controller.ts::createOrder` no longer has `paymentMethod === "COD" ? "PENDING" : "PENDING"` (both branches were identical). Replaced with a flat `"PENDING"` plus a comment explaining why: there's no payment-gateway callback in this service yet to move non-COD orders off `PENDING` automatically. Business behavior is unchanged (both branches always evaluated to `"PENDING"` before); this only removes the misleading conditional.
- **`NOTIFICATION_QUEUE` centralized**: added `NOTIFICATION_QUEUE: "NOTIFICATION_QUEUE"` to `QUEUE_NAMES` in `packages/libs/src/queues/index.ts`. Replaced all 5 hardcoded `"NOTIFICATION_QUEUE"` string literals (3 in `user.controller.ts`, 2 in `seller.controller.ts`) with `QUEUE_NAMES.NOTIFICATION_QUEUE`. Rebuilt `packages/libs` (`npm run build`) so the new export resolves.
- **`cart.controller.ts` deleted**: user confirmed this dead, unrouted, git-untracked file (`saveCart`/`getCart`/`clearCart`) should be removed rather than wired up. Deleted; `src/controller/` no longer exists, which also resolves the singular-vs-plural naming collision with `src/controllers/order/`.
- **Dead email pipeline deleted**: user confirmed `sendEmail`/`order-confirmation.ejs` should be removed rather than wired up. Deleted `src/utils/send-email/index.ts`, `src/utils/email-templates/order-confirmation.ejs`, and the now-empty `src/utils/` tree. Removed the now-unused `nodemailer`, `ejs`, `@types/nodemailer`, `@types/ejs` dependencies from `package.json`.
- **Admin order-list/detail duplication reduced (without merging the two response shapes)**: added `ADMIN_ORDER_CUSTOMER_SELECT`, `ADMIN_ORDER_SELLER_SELECT`, and `queueStalePaymentFix(orderIds)` to `utils.ts`. `getAdminOrderList` and `getAdminOrderDetail` now both use the two shared `select` constants (previously byte-identical inline objects in each file) and both call `queueStalePaymentFix` for the "DELIVERED but still PENDING payment" self-heal instead of each having its own `updateMany`/`update` call. The two endpoints' actual JSON output shaping was left untouched — they're different, separately-consumed API contracts (verified via `admin-ui/src/hooks/useAdminQueries.ts`), not accidental duplication. Note: `utils.ts` now imports `prismaPostgres`, which surfaces the same pre-existing `@repo/db-postgres` missing-declaration `tsc` warning already present on every other file that imports it in this service — not a new issue.
- **`env.example` created**: documents `ORDER_SERVICE_PORT`, `CORS_ORIGINS`, `NODE_ENV`, and the transitively-consumed infra vars (`POSTGRES_URL`, `MONGO_URL`, `REDIS_DATABASE_URL`, `RABBITMQ_*`), matching the pattern in `auth-service/env.example`.
- **`README.md` rewritten**: replaced the default `bun init` template with real docs — routes grouped by role, the two-database model (Postgres source-of-truth + Mongo hydration), the `createOrder` concurrency-safety summary, and the actual env vars/scripts/dependencies.
- **`createOrder` broken into named steps**: extracted `assertInstantDeliveryAvailable(store, deliverySlot)`, `computeOrderTotals({...})`, `reserveStock(items, productMap)`, and `rollbackStock(decrementedItems)` as module-level functions in `user.controller.ts` (same file, same pattern as the existing `prefetchCoupon`/`computeCouponDiscount` helpers — not moved to `utils.ts` since they're specific to order creation). `createOrder` itself now just calls them in sequence instead of inlining ~150 lines of delivery-window/totals/stock logic. Kept the transaction block and the post-response notification/audit-log fan-out inline, since both close over most of the function's state and extracting them would add risk without much readability gain. **Bonus dedup found while doing this**: the stock-rollback loop (`Promise.allSettled(...)` restoring stock/`totalSold`) was already duplicated twice inside `createOrder` itself (once in the stock-reservation catch, once in the Postgres-transaction-failure catch) — both now call the single `rollbackStock` helper. No behavior change: `assertInstantDeliveryAvailable` throws instead of the original's inline `return next(new ValidationError(...))`, but since it's called inside the same try/catch that already forwards thrown errors to `next(error)`, and several lines later in this exact function already used throw-based validation (`if (!couponRaw) throw new ValidationError(...)`), this aligns with the function's own existing mixed convention rather than introducing a new one.
- **`@repo/libs/logger` adopted**: replaced every `console.log`/`console.error`/`console.warn` call in the service (9 call sites across `main.ts`, `perUserRateLimit.ts`, `utils.ts`, `user.controller.ts`, `seller.controller.ts`) with `logger.info`/`logger.error`/`logger.warn`. Error call sites now pass the caught error as structured `{ err }`/`{ notifyErr }` metadata instead of string-concatenating it, matching `logger.error(message, meta?)`'s signature. Zero raw `console.*` calls remain in `apps/order-service/src`.
- **`selectedOptions`/`discountBreakdown` typed**: `orderItemSchema.selectedOptions` is now `z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))` (confirmed via `user-ui`'s and the mobile app's actual checkout payloads that every value sent today is a string/number, never nested) instead of `z.record(z.any())`. `billDetailsSchema.discountBreakdown` is now `z.array(z.object({ code: z.string(), amount: z.number() }))`, matching what `user-ui` actually sends, instead of `z.array(z.any())`. Rebuilt `packages/zod-schema`.
- **Client/server `totalAmount` mismatch logging added**: `createOrder` now destructures the client-submitted `totalAmount` (previously validated but discarded entirely) and, after recomputing the real total server-side, logs a `logger.warn` if the two differ by more than ₹1. The server-recomputed value is still the only one ever charged — this is observability only, not a new validation gate, so it can't block or change any order. User confirmed this was the preferred resolution over dropping the fields from the schema, since real frontends already send them and removing the requirement would give up a free payload-completeness check for no benefit.
- Verified after each step with `tsc --noEmit` on `apps/order-service`, diffed against the pre-fix baseline (38 errors, all pre-existing `@repo/db-postgres` missing-declaration / implicit-`any` issues unrelated to this work): no new errors introduced. Two pre-existing implicit-`any` errors (on the old inline `.map((item) => ...)` stock-restore callbacks) were incidentally fixed since `restoreOrderStock`'s parameter is explicitly typed. Also verified with `tsup` build (`bun run build`) — succeeds.
