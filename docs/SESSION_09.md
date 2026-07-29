# SESSION_09: Code Style & Structure Audit — apps/payment-service

Scope: `apps/payment-service/` in full — 6 source files under `src/`, plus `package.json`, `tsconfig.json`, `tsup.config.ts`. Zod review covers `packages/zod-schema` only. Other shared packages (`@repo/db-postgres`, `@repo/env-config`, `@repo/error-handlers`, `@repo/middlewares`, `@repo/libs`) traced only far enough to verify import correctness and cross-service duplication.

> Filename note: the session brief said `docs/SESSION_04.md`, which already exists (auth-service audit, cited by SESSION_08). Written as `SESSION_09.md` to match the session header and avoid overwriting.

# Executive Summary

- **Service is undeployable in the containerised setup.** `payment-service` has no entry in `docker-compose.yml` or `prod.docker-compose.yml`, and no `docker/payment-service/` directory. Every other backend service (api-gateway, auth, product, order, notification, worker) has all three. The gateway proxies `/payment` → `http://localhost:6007`, which resolves to nothing in Docker.
- **`payment.failed` webhook can un-pay a paid order.** `razorpay.controller.ts:281-296` sets `paymentStatus: "FAILED"` with no check on the current status. The `payment.captured` branch guards with `paymentStatus !== "COMPLETED"`; the failed branch does not. A retried/out-of-order `payment.failed` after a successful capture flips a genuinely paid order to FAILED.
- **Webhook swallows all internal errors as HTTP 200.** `razorpay.controller.ts:320-324` catches, logs, and returns `200 {received:true, warning:"Processing error"}`. Razorpay will not retry. A transient DB failure permanently loses the event — no dead-letter, no reconciliation job, no `GET /payment/:orderId` status endpoint to recover from.
- **No webhook replay/idempotency guard.** No dedupe on `x-razorpay-event-id` or payment id. The refund branch (`:303-316`) has no guard at all and re-applies on every retry.
- **Refund leaves the DB internally inconsistent.** `initiateRefund` (`:378-381`) updates `Order.paymentStatus = REFUNDED` but never touches the `Payment` row, which stays `COMPLETED`. `verifyPayment` correctly updates both in a `$transaction`. Same gap in the webhook refund branch. Refund is also not idempotent — two concurrent calls both pass the `paymentStatus === "REFUNDED"` check.
- **The provider abstraction is dead code.** `src/payment/payment.interface.ts` + `src/payment/providers/razorpay.provider.ts` (187 lines) are imported by nothing. Their header comment references `payment.factory.ts`, which does not exist. Meanwhile the controller re-implements the same Razorpay client, HMAC verification, `safeHexEqual`, and webhook parsing inline. Two parallel implementations of the same logic, only one wired up.
- **Zero schema validation.** `@repo/zod-schema` is a declared dependency and is never imported. All four handlers use manual `if (!orderId)` checks. No `payment.schema.ts` exists in the package. Order-service validates the same domain via `validate(createOrderSchema, ...)`.
- **No structured logging.** 6 raw `console.*` calls. `@repo/libs/logger` exists and auth-service has adopted it (`auth-service/src/main.ts:8`).
- Positives: signature verification is timing-safe; the razorpayOrderId↔orderId binding check (`:182-194`) closes a real cross-order payment-substitution hole; amount is computed server-side from the DB, never trusted from the client; raw-body ordering for the webhook is correct.

# File Reviews

> Sections below record the state **as audited**, before any fixes. See _Completed Changes_ at the bottom for what has since been addressed; `razorpay.controller.ts` no longer exists (split into `controllers/payment.controller.ts` + `services/payment.service.ts`).

### package.json
**Quality** — ⭐⭐☆☆☆ (2/5)
- Unused deps: `@repo/db-mongo`, `@repo/libs`, `@repo/zod-schema` — declared, never imported.
- `@types/cookie-parser`, `@types/cors`, `@types/express`, `@types/compression` in `dependencies`; belong in `devDependencies`.
- `dev` uses `bun --watch` while auth/notification/product use `tsx watch`. Cosmetic drift.

### tsconfig.json
**Quality** — ⭐⭐⭐⭐⭐ (5/5)
- Extends shared base, correct `NodeNext`. Nothing to flag.

### tsup.config.ts
**Quality** — ⭐⭐⭐⭐⭐ (5/5)
- Standard, matches siblings. Nothing to flag.

### src/main.ts (76 lines)
**Quality** — ⭐⭐⭐☆☆ (3/5)
- `app.set("trust proxy", 1)` duplicated at lines 20 and 45 (same defect as notification-service, SESSION_08).
- Global `rateLimit` (`:46-54`, 200/15min) sits **above** the router, so it throttles `/api/webhook`. Razorpay retries originate from a small IP pool and share one bucket with the gateway's own `paymentRateLimiter` (also 200/15min). Webhook bursts can be 429'd and dropped.
- `uncaughtException` / `unhandledRejection` handlers (`:1-6`) log and let the process continue in an undefined state. Acceptable for a stateless read service; not for one mid-`$transaction` on money.
- No `SIGTERM`/`SIGINT` graceful shutdown. product-service, notification-service, worker-service all have it.
- `app.use(compression() as any)` (`:32`) — cast around a type mismatch.
- Comment `// Fix #21:` (`:19`) is a changelog reference, not reasoning.
- Webhook raw-body registration (`:56-58`) is correct and well-commented.

### src/routes/payment.routes.ts (33 lines)
**Quality** — ⭐⭐⭐☆☆ (3/5)
- Clean and readable; comments explain the two-step checkout flow well.
- Inline role-branching middleware (`:28-29`) typed `(req: any, res: any, next: any)` — the only inline middleware in the file and the loosest typing in the service. Belongs in `@repo/middlewares` as `isAdminOrApprovedSeller`.
- `allowRoles("admin","seller")` excludes `staff`, but the `isApprovedSeller` it delegates to explicitly admits staff. Dead branch — staff never reach it.
- No validation middleware layer; every handler validates its own body.

### src/controllers/razorpay.controller.ts (399 lines)
**Quality** — ⭐⭐☆☆☆ (2/5)
- Filename is provider-specific but content is generic payment orchestration. Adding Stripe means either a second near-identical file or renaming this one.
- Single file holds: SDK client lifecycle, crypto, audit logging, DB transactions, HTTP responses. No service layer.
- Handler sizes: `createRazorpayOrder` 67, `verifyPayment` 91, `handleWebhook` 98, `initiateRefund` 67. All well past comfortable.
- `handleWebhook` is an `if/else if` chain over three event kinds with duplicated `payload.notes?.orderId` extraction and duplicated transaction shapes. Adding a fourth event extends the chain.
- **`payment.failed` has no current-status guard** (`:281-296`). See Executive Summary.
- **Catch returns 200** (`:320-324`), suppressing Razorpay's retry. Transient DB errors should return 5xx.
- **Refund does not update the Payment row** (`:378-381`), unlike `verifyPayment` (`:197-210`).
- **Refund has no idempotency/locking** — the `REFUNDED` check (`:359-361`) and the `order.update` are not in one transaction.
- `createRazorpayOrder` discards the `updateMany` result (`:102-107`). If no PENDING Payment row exists the binding silently never persists, and `verifyPayment` then always rejects with "payment does not belong to this order".
- Repeat calls to `createRazorpayOrder` overwrite `metadata`, orphaning a previously-issued razorpayOrderId (two open checkout tabs → the first can never verify).
- Refund marks the order `REFUNDED` immediately on API call (`:378`), but Razorpay refunds are async and can fail afterwards. No state for "refund pending".
- `writeAuditLog` (`:37-50`) is **byte-identical** to `order-service/src/controllers/order/user.controller.ts:15-28`.
- `safeHexEqual` (`:26-34`) is **byte-identical** to `razorpay.provider.ts:17-25`.
- `getRazorpay` (`:11-23`) duplicates `RazorpayProvider.client()` (`:37-49`).
- Config error surfaced as `ValidationError` → HTTP 400 (`:17-20`). A missing server credential is not a client input error; the comment even says "throw a clear 503".
- Typing: `req: any` on three of four handlers; `(pendingPayment?.metadata as any)` (`:186`); `as any` on the refund call (`:376`). Direct CLAUDE.md §3 violation.
- No zod. Manual `if (!field)` checks at `:67`, `:146`, `:341`.
- `verifyPayment` persists `razorpaySignature` into `Payment.metadata` (`:207`) — a known-plaintext/HMAC pair sitting in the DB. Low risk, no reason to store it.
- Section banners (`/* ── … ─────── */`) are consistent within the file but denser than any sibling controller.

### src/payment/payment.interface.ts (69 lines)
**Quality** — ⭐⭐⭐⭐☆ (4/5) as a design; ⭐☆☆☆☆ as shipped code
- Genuinely good abstraction: `NormalizedWebhookEvent` as a discriminated union, provider-agnostic param types, clear doc comments.
- **Imported by nothing.** Header references `payment.factory.ts`, which does not exist anywhere in the repo.

### src/payment/providers/razorpay.provider.ts (118 lines)
**Quality** — ⭐⭐⭐⭐☆ (4/5) as a design; ⭐☆☆☆☆ as shipped code
- Cleaner than the controller: no DB access, single responsibility, correct webhook-secret vs key-secret distinction.
- **Imported by nothing.** Duplicates the controller's crypto, client init, and webhook parsing.
- `as any` on `payments.refund` (`:114`) — same cast as the controller.
- `parseWebhookEvent` calls `JSON.parse` with no try/catch; a malformed body throws rather than returning `UNHANDLED`.

### Missing files
- No `README.md` — auth, order, notification, product all have one.
- No `env.example` — auth, notification, product have one. `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `PAYMENT_SERVICE_PORT` are undocumented, and absent from root `env.examples`.
- No `.gitignore` — every sibling has one.
- No `docker/payment-service/Dockerfile`.
- No `src/types/` directory.

# Zod Schema Review

- **`@repo/zod-schema` is declared in `package.json` and imported zero times.** No payment schema exists in the package (`schemas/`: auth, banner, category, coupon, event, image, notification, order, product, store, weight-pricing).
- Validation is manual and inconsistent with order-service, which owns the adjacent domain and uses `validate(schema, data)` from the package root.
- Needed: `packages/zod-schema/src/schemas/payment.schema.ts` exporting `createRazorpayOrderSchema`, `verifyPaymentSchema`, `initiateRefundSchema`, plus a `razorpayWebhookEventSchema` for the parsed webhook body (currently a bare `JSON.parse` feeding `payload.notes?.orderId` with no shape check).
- Register in `schemas/index.js` barrel and add inferred types to `src/index.ts` alongside `CreateOrderInput` etc.
- Naming convention in the package is consistent (`camelCase` + `Schema` suffix) — new schemas should follow it.
- Import path: siblings import from the `@repo/zod-schema` root barrel, not `./schemas` or `./types` subpaths. No deep imports to fix here (there are no imports at all).
- Boundary note: `packages/zod-schema` depends on `@repo/error-handlers` so `validate()` can throw `ValidationError`. Pre-existing, outside this service's scope, but it means a pure-schema package carries an HTTP-error dependency.
- No duplicate validation between the service and the package — because the service performs none.

# Folder Structure

```
src/
  controllers/razorpay.controller.ts   399 lines, provider-named, does everything
  routes/payment.routes.ts             fine
  payment/                             dead: interface + provider, 187 lines
    payment.interface.ts
    providers/razorpay.provider.ts
  main.ts
```

- Two competing structures coexist: a flat `controllers/` layer that is live, and a layered `payment/providers/` tree that is dead.
- Missing `services/` — all orchestration and DB access sits in the controller.
- Missing `types/`. auth-service (`src/types/auth-request.ts`) and notification-service (`src/types/notification.types.ts`) both have one.
- `payment/providers/` is one level deeper than anything else in the service for two files.
- auth-service was restructured to `src/modules/<domain>/{controller,service}` (SESSION_04). payment-service has not converged on that shape.

# Naming

- File naming is consistent kebab-case with `.controller.ts` / `.routes.ts` / `.interface.ts` / `.provider.ts` suffixes — matches the repo.
- `razorpay.controller.ts` is the outlier: named after a vendor, contains vendor-agnostic orchestration. Should be `payment.controller.ts`.
- `_razorpay` / `_client` leading-underscore privates (`controller:11`, `provider:37`) appear nowhere else in the repo.
- Route naming is inconsistent in specificity: `/create-razorpay-order` (vendor-named) alongside `/verify`, `/refund`, `/webhook` (generic). Frontend is already coupled to `/payment/api/create-razorpay-order` (`user-ui/components/checkout/checkout-client.tsx:176`), so renaming needs a coordinated change.
- Function names are good and domain-specific: `verifyPayment`, `initiateRefund`, `safeHexEqual`, `writeAuditLog`.

# Module Responsibilities

- `razorpay.controller.ts` is a god file: gateway SDK lifecycle + crypto + audit trail + DB transactions + HTTP.
- Business logic lives in controllers, not services. No repository layer — Prisma is called directly from handlers.
- Validation is interleaved with execution rather than sitting at the route boundary.
- Infrastructure (Razorpay client construction) is mixed with domain logic (order payability rules) in the same function body.
- Domain boundary is respected in one direction — payment-service does not reach into auth or product. But it writes directly to `Order`, a table order-service also owns, with no shared invariant enforcement. `paymentStatus` transitions are implemented independently in both services.

# Code Style

- Heavy ASCII banner comments (`/* ── … ────── */`) — denser than any sibling controller, and the four-line boxed headers over each handler restate the route/body/response that the route file already declares.
- `// Fix #21:` in `main.ts:19` is a changelog artefact, not reasoning (CLAUDE.md §1). Same pattern appears in shared packages, so it is a repo-wide habit rather than local drift.
- The `payment/` tree reads as speculative architecture written ahead of need and then abandoned — a textbook unnecessary abstraction, made worse by the fact that a working duplicate exists in the controller.
- `handleWebhook`'s if/else chain with three copies of the same extract-then-transact shape is repetitive.
- Deep nesting in `handleWebhook`: `try → if/else → if (orderId) → if (order && …) → await $transaction([...])` reaches 5 levels.
- Guard clauses and early returns are used well in `createRazorpayOrder` and `initiateRefund`.
- Comments explaining *why* are genuinely good in places — `:178-181` (why the signature alone is insufficient), `:56-57` (raw body ordering), `:318` (respond 200 fast).
- Overall the live code reads as human-written under time pressure. The dead `payment/` tree reads as generated scaffolding.

# Architecture

| Layer | State |
|---|---|
| Routes | Present, thin, correct |
| Controllers | Present, overloaded |
| Services | **Absent** |
| Repositories | **Absent** (direct Prisma) |
| Middleware | Delegated to `@repo/middlewares`; one inline exception in the route file |
| Configuration | Delegated to `@repo/env-config` |
| Infrastructure | Inlined in the controller (Razorpay client) |
| Domain | Not separated |

- The interface-based provider design in `src/payment/` is the right target architecture. It just needs to be wired up and the controller's duplicate removed.
- No transactional outbox or event emission on payment success — order-service and notification-service are never told a payment completed. Order state is mutated cross-service by direct write.

# Dependency Review

- No circular imports.
- No package boundary violations; all shared imports go through public `@repo/*` entry points.
- Dependency direction is correct (service → shared packages, never the reverse).
- Unused declared deps: `@repo/db-mongo`, `@repo/libs`, `@repo/zod-schema`.
- Hidden coupling: payment-service and order-service both write `Order.paymentStatus` / `Payment.status` with independently implemented rules. Neither knows about the other's transitions.
- Cross-service duplication: `writeAuditLog` exists verbatim in both services.

# Configuration

- All env access goes through `@repo/env-config` — correct, and `RAZORPAY_KEY_ID/KEY_SECRET/WEBHOOK_SECRET/PAYMENT_SERVICE_PORT` are all declared there.
- `RAZORPAY_WEBHOOK_SECRET` is used at `:239` with `as string` and **no presence check**. If unset, `createHmac` throws on every webhook → caught → returns 200 → every event silently discarded. `createOrder`/`refund` at least fail loudly via `getRazorpay()`.
- Razorpay credentials are absent from root `env.examples` and there is no service-level `env.example`.
- Magic numbers inline: rate limit `200` / `15 * 60 * 1000` (`:48-49`), body limit `"2mb"` (`:61`), port fallback `6007` (`:71`), `* 100` paise conversion in three places (`:92`, `:312`, `:374`).
- Currency `"INR"` is hardcoded in three places (`:96`, `:118`, provider defaults).
- No feature flag to disable online payments; the code path instead surfaces a 400 with a user-facing "use Pay on Delivery" message.

# Error Handling

- Uses the repo's `AppError` subclasses (`ValidationError`, `NotFoundError`) and `next(error)` — consistent with siblings.
- `ValidationError` (400) used for three distinct classes of failure: bad client input, authorization denial (`"Access denied"`, `:83`/`:171` — should be `ForbiddenError`/403), and missing server config (`:17-20` — should be 503). `ForbiddenError` and `AppError` are both exported and available.
- `initiateRefund` returns `NotFoundError` for a seller hitting another store's order (`:355`) — deliberate enumeration defence, correctly commented.
- Webhook catch-all returns 200, defeating provider retry. No dead-letter queue, no reconciliation job for stuck PENDING payments.
- No retry logic on Razorpay API calls (`orders.create`, `payments.refund`) — a transient network blip surfaces as a 500 to the user.
- `safeHexEqual`'s bare `catch { return false }` (`:31-33`) is acceptable here — a malformed hex buffer *is* a failed comparison.
- `parseWebhookEvent` in the provider has an unguarded `JSON.parse`.

# Logging

- 6 `console.*` calls, zero `@repo/libs/logger` usage. auth-service has migrated.
- No request id / correlation id — a payment cannot be traced across gateway → payment-service → webhook.
- `console.log("[Webhook] Received: ${eventType}")` (`:252`) logs before verification result and carries no order or payment id.
- Payment lifecycle events are written to the `AuditLog` table with good context. Runtime logs are not.
- No log on successful verification or refund — only the audit row.
- The webhook signature-mismatch warning (`:244`) has no source IP or event id, making abuse triage impossible.

# Type Safety

- `req: any` on `createRazorpayOrder`, `verifyPayment`, `initiateRefund`. `handleWebhook` is correctly typed `Request`.
- Inline route middleware typed `(req: any, res: any, next: any)` (`routes:28`).
- `as any`: `compression()` (`main:32`), `metadata` access (`controller:186`), `payments.refund` options (`controller:376`, `provider:114`).
- `as string` on possibly-undefined env values at `:152`, `:239`, `provider:64`, `provider:70`, `provider:80`.
- Webhook payload is fully untyped — `event.payload?.payment?.entity` flows into DB writes with no shape validation.
- `AuthenticatedRequest` exists as an established pattern in auth-service and notification-service; payment-service has not adopted it.
- Types that *are* defined (`payment.interface.ts`) are excellent — and unused.

# Dead Code

- `src/payment/payment.interface.ts` (69 lines) — no importers.
- `src/payment/providers/razorpay.provider.ts` (118 lines) — no importers.
- Referenced-but-nonexistent `payment.factory.ts`.
- `POST /api/refund` has no caller. No admin-ui, seller-ui, user-ui, or mobile code hits `/payment/refund`. The endpoint is reachable but unwired.
- Duplicated helpers: `safeHexEqual` ×2 (in-service), `writeAuditLog` ×2 (cross-service), Razorpay client init ×2, webhook parsing ×2.
- Unreachable `staff` branch in the refund route's inline middleware.
- Unused deps `@repo/db-mongo`, `@repo/libs`, `@repo/zod-schema`.

# Scalability

- **More gateways**: the interface exists but is unwired — currently adding Stripe means duplicating a 399-line controller. Wiring the provider + a factory makes it a one-file change, as the interface's own comment claims.
- **More APIs**: no service layer, so every new endpoint grows the same controller.
- **More middleware**: fine — `@repo/middlewares` composes cleanly.
- **More repositories**: no repository layer to extend; Prisma calls are scattered across handlers.
- **More integrations**: no event emission on payment state change. Every consumer of "payment completed" must poll the DB.
- **Larger teams**: one 399-line file is a merge-conflict magnet; no tests anywhere in the service.
- **Throughput**: webhook handling is synchronous with DB transactions inside the request. Under retry storms the 200/15min limiter drops events. Should enqueue to RabbitMQ (`@repo/libs/rabbitmq` is already a transitive dependency) and ack immediately.
- Missing operationally: payment status endpoint, stuck-PENDING reconciliation job, partial refunds, multi-currency.

# Human Code Quality

- The **live** path reads as human-written: focused security comments, an incrementally-discovered fix (the razorpayOrderId binding check reads exactly like a bug found in review), pragmatic trade-offs, and inconsistencies in the places humans are inconsistent.
- The **dead** `src/payment/` tree reads as machine-generated: uniformly doc-commented, symmetrically layered, referencing a factory file that was never written, solving a second-gateway problem nobody has. This is the clearest AI-pattern signal in the service.
- The `// Fix #NN:` comment convention is a changelog leaking into source (CLAUDE.md §1), repo-wide.
- Boxed ASCII banners per handler restating route/body/response are heavier than any sibling controller.
- Real inconsistency worth keeping: `handleWebhook` is properly typed while its three neighbours use `req: any`. That is a human touching one function, not a regenerated file.
- Net: **mostly human, with one abandoned generated abstraction that should be either finished or deleted.**

# Prioritised Fixes

1. Make the service deployable — Dockerfile + both compose files.
2. Fix the three webhook correctness defects: `payment.failed` guard, non-200 on internal error, event idempotency.
3. Make refund transactional, idempotent, and consistent across `Order` and `Payment`.
4. Resolve the dead provider tree — wire it up (preferred) or delete it.
5. Add `payment.schema.ts` to `@repo/zod-schema` and validate all four handlers.
6. Extract a service layer out of the controller.
7. Fix typing (`req: any`, `as any`, unchecked env) and adopt the shared logger.

# TODO Checklist

- [x] 🔴 `docker/payment-service/Dockerfile`, `docker-compose.yml`, `prod.docker-compose.yml` — add the missing service definitions. The service cannot be deployed or reached by the gateway inside Docker today.
- [x] 🔴 `src/controllers/razorpay.controller.ts:281-296` — guard the `payment.failed` branch on `paymentStatus !== "COMPLETED"`. An out-of-order retry currently flips a paid order to FAILED.
- [x] 🔴 `src/controllers/razorpay.controller.ts:320-324` — return 5xx for transient/internal errors so Razorpay retries; reserve 200 for verified-and-handled or knowingly-ignored events. Events are silently lost today.
- [x] 🔴 `src/controllers/razorpay.controller.ts:228-325` — add webhook idempotency keyed on `x-razorpay-event-id` (persisted). Razorpay retries; the refund branch re-applies unguarded.
- [x] 🔴 `src/controllers/razorpay.controller.ts:359-381` — wrap the refund guard + `Order` update + `Payment` update in one `$transaction`. The Payment row is left `COMPLETED` while the Order says `REFUNDED`, and concurrent calls double-refund.
- [x] 🔴 `src/controllers/razorpay.controller.ts:303-316` — the webhook refund branch also updates only `Order`. Same inconsistency as above.
- [x] 🔴 `src/controllers/razorpay.controller.ts:239` — `RAZORPAY_WEBHOOK_SECRET` is used with `as string` and no presence check. If unset, every webhook throws → caught → 200 → all events discarded silently.
- [x] 🔴 `src/payment/payment.interface.ts`, `src/payment/providers/razorpay.provider.ts` — wire these into the controller via a `payment.factory.ts` (the interface already documents it) and delete the controller's duplicate client/crypto/parsing. Or delete the tree. 187 lines of dead code duplicating live logic is the worst of both.
- [x] 🔴 `packages/zod-schema/src/schemas/payment.schema.ts` (new) — add `createRazorpayOrderSchema`, `verifyPaymentSchema`, `initiateRefundSchema`, `razorpayWebhookEventSchema`; export from the `schemas/index.ts` barrel and add inferred types to `src/index.ts`. *(Webhook schema deliberately omitted — the payload shape is normalized inside the provider now; a Razorpay-specific schema in the shared package would leak the gateway boundary.)*
- [x] 🔴 `src/controllers/razorpay.controller.ts:67,146,341` — replace manual `if (!field)` checks with `validate(schema, req.body)`. `@repo/zod-schema` is already a declared dependency and order-service uses this exact pattern.
- [x] 🟠 `src/services/payment.service.ts` (new) — move DB transactions, audit writes, and order-state rules out of the 399-line controller. Controllers should parse, delegate, respond.
- [x] 🟠 `src/controllers/razorpay.controller.ts` → `src/controllers/payment.controller.ts` — the file is vendor-named but vendor-agnostic. Blocks adding a second gateway cleanly.
- [x] 🟠 `src/controllers/razorpay.controller.ts:102-107` — check the `updateMany` count. If no PENDING Payment row exists the binding never persists and every later `verify` fails with a misleading error.
- [x] 🟠 `src/main.ts:46-58` — move the global rate limiter below the webhook route, or exempt `/api/webhook`. Razorpay retries share one IP bucket with the gateway's limiter and can be 429'd.
- [x] 🟠 `src/types/payment-request.ts` (new) — define `AuthenticatedRequest` following `apps/auth-service/src/types/auth-request.ts`, and replace `req: any` in all three handlers plus `routes:28`.
- [x] 🟠 `src/controllers/razorpay.controller.ts:37-50` + `apps/order-service/src/controllers/order/user.controller.ts:15-28` — `writeAuditLog` is byte-identical in both. Move to a shared package.
- [x] 🟠 `src/controllers/razorpay.controller.ts:26-34`, `src/payment/providers/razorpay.provider.ts:17-25` — `safeHexEqual` duplicated verbatim. Resolved for free by wiring the provider.
- [x] 🟠 `src/main.ts:72-75` — add `SIGTERM`/`SIGINT` graceful shutdown. product-, notification-, and worker-service all have it; a payment service dropping in-flight transactions on deploy is worse.
- [x] 🟠 `src/main.ts:1-6` — `uncaughtException` logs and continues. For a service holding DB transactions on money, log and exit so the orchestrator restarts clean.
- [x] 🟠 `src/controllers/razorpay.controller.ts:17-20` — missing Razorpay credentials raise `ValidationError` (400). Use a 503-mapped error; a server config gap is not client input error. The comment already says 503.
- [x] 🟠 `src/controllers/razorpay.controller.ts:83,171` — `"Access denied"` returns 400 via `ValidationError`. Use `ForbiddenError` (403), already exported from `@repo/error-handlers`.
- [x] 🟡 `src/main.ts`, `src/controllers/razorpay.controller.ts` — replace all 6 `console.*` calls with `@repo/libs/logger`. auth-service has already migrated.
- [x] 🟡 `src/main.ts:20,45` — `app.set("trust proxy", 1)` set twice.
- [x] 🟡 `src/controllers/razorpay.controller.ts:244` — signature-mismatch warning has no IP, event id, or order id. Unusable for abuse triage.
- [x] 🟡 `apps/payment-service/env.example` (new) + root `env.examples` — document `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `PAYMENT_SERVICE_PORT`. Currently undocumented everywhere.
- [x] 🟡 `apps/payment-service/README.md` (new) — service description, endpoints, env vars, webhook setup. Every sibling has one.
- [x] 🟡 `apps/payment-service/.gitignore` (new) — every sibling service has one.
- [x] 🟡 `src/main.ts:32`, `src/controllers/razorpay.controller.ts:186,376`, `src/payment/providers/razorpay.provider.ts:114` — remove `as any` casts (CLAUDE.md §3). Type the `Payment.metadata` shape properly.
- [x] 🟡 `src/controllers/razorpay.controller.ts:207` — stop persisting `razorpaySignature` into `Payment.metadata`. It is a known-plaintext HMAC pair with no downstream reader.
- [x] 🟡 `src/routes/payment.routes.ts:28-29` — move the inline admin-or-approved-seller branch into `@repo/middlewares` as a named guard; it is currently the loosest-typed code in the service.
- [x] 🔴 **Missed-payment recovery** — `src/jobs/payment.reconciliation.job.ts` + `reconcilePendingPayments()`. Neither the client callback nor the webhook is a delivery guarantee; without a poll-the-gateway sweep, a captured payment whose callback and webhook both fail is lost permanently.
- [x] 🔴 **Cancel-during-payment race** — `user-ui/components/checkout/checkout-client.tsx`, `order-service cancelOrder`, `payment.service.ts applyWebhookEvent`. A successful payment whose `/verify` call failed got cancelled on modal dismiss, then marked paid by the webhook on an already-cancelled, stock-restored order.
- [x] 🟡 `src/controllers/razorpay.controller.ts:378` — refund marks `REFUNDED` on API call, but Razorpay refunds settle asynchronously and can fail. Introduce a pending-refund state driven by the `refund.processed` webhook.
- [x] 🟡 `src/controllers/razorpay.controller.ts:332-398` — refund is full-amount only, and the endpoint has no caller in any UI. Either wire it into admin-ui/seller-ui or mark it explicitly internal.
- [x] 🟡 `src/main.ts:19` — `// Fix #21:` is a changelog reference, not reasoning (CLAUDE.md §1). Same pattern repo-wide; fix opportunistically.
- [x] 🟢 `package.json` — remove unused `@repo/db-mongo` and `@repo/libs`, or use them (`@repo/libs/logger` is wanted above).
- [x] 🟢 `package.json:25-31` — move `@types/cookie-parser`, `@types/cors`, `@types/express`, `@types/compression` to `devDependencies`.
- [x] 🟢 `src/controllers/razorpay.controller.ts:102-107` — repeated `createRazorpayOrder` calls overwrite `metadata`, orphaning the earlier razorpayOrderId. Two checkout tabs break the first.
- [x] 🟢 `src/payment/providers/razorpay.provider.ts:87` — unguarded `JSON.parse`; return `{kind:"UNHANDLED"}` on malformed bodies instead of throwing.
- [x] 🟢 `src/controllers/razorpay.controller.ts:92,312,374` — extract the `* 100` / `/ 100` paise conversion into named helpers.
- [x] 🟢 `src/controllers/razorpay.controller.ts:96,118` — `"INR"` hardcoded in multiple places; move to config alongside the currency the provider interface already parameterises.
- [x] 🟢 `src/main.ts:48-49,61,71` — extract magic numbers (rate limit window/max, body limit, default port) to named constants.
- [x] 🟢 `src/controllers/razorpay.controller.ts` — trim the boxed ASCII banners restating route/body/response; the route file already declares them.
- [x] 🟢 `src/routes/payment.routes.ts:24-31` — the `staff` branch in `isApprovedSeller` is unreachable because `allowRoles("admin","seller")` gates first. Decide whether staff should be able to refund.
- [x] 🟠 `prod.dev.env:18` — (discovered during fix) missing newline glues `AUTH_SERVICE_URL=http://auth-service:6001` onto the end of `CORS_ORIGINS`, so `https://seller.fishstudio.in` is never an allowed origin in prod and the malformed pseudo-origin is. Line 21 re-declares `AUTH_SERVICE_URL` so the gateway still routes, but seller-ui CORS is broken.
- [x] 🟠 `prod.dev.env` — (discovered during fix) `RAZORPAY_WEBHOOK_SECRET` is absent while `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are present; webhooks cannot verify in prod until it is added.
- [x] 🟠 `apps/order-service/src/controllers/order/seller.controller.ts:254-256` — (discovered during fix) three `string | null` → `string | undefined` type errors. Pre-existing but previously invisible: `@repo/db-postgres` shipped no `.d.ts` files, so `prismaPostgres` was implicitly `any` repo-wide. Building that package (required for payment-service's types) surfaced them. `tsup` does not typecheck, so builds still pass.
- [x] 🟡 `packages/db-postgres` — (discovered during fix) `dist/*.d.ts` was missing from the committed build output; every consumer silently got `any` for Prisma models. Ensure `bun run build` (which runs `tsc --emitDeclarationOnly`) is part of CI/deploy, not just `tsup`.
- [x] 🟢 `apps/payment-service/package.json` — (discovered during fix) `dev` uses `bun --watch` while auth/notification/product use `tsx watch`. Cosmetic drift, left as-is.
- [x] 🔴 `apps/order-service/src/controllers/order/user.controller.ts:289-300` — (discovered during design review) **stock leak**. Mongo stock is decremented before the Postgres order transaction, and the only record of the reservation is the in-memory `decrementedItems` array. A crash between the two — or a failure inside the `Promise.allSettled` compensation — leaks stock permanently, and nothing detects it. Needs a durable `StockReservation` row + a sweeper. See _Cross-database consistency_ below.
- [x] 🔴 `packages/db-postgres` — (discovered during design review) implement the transactional outbox that `src/index.ts:5` already has a commented-out export for. Publishing to RabbitMQ *after* a Postgres commit has the same dual-write bug it is meant to solve: crash between commit and publish and the message is gone. See _Cross-database consistency_ below.
- [x] 🟠 `packages/db-postgres/prisma/schema.prisma` — promote `Payment.metadata.razorpayOrderId` to an indexed `gatewayOrderId String? @unique` column. Reconciliation currently cannot query it without an unindexed JSON scan; `reconcilePendingPayments()` works around this by scanning PENDING rows by date instead.
- [x] 🟠 `packages/db-postgres/prisma/schema.prisma` — persist webhook events in a `WebhookEvent` table (unique `eventId`, payload, `processedAt`). Dedupe currently lives only in Redis on a 3-day TTL; a cache is not an audit trail for financial events.
- [x] 🟡 `payment.service.ts applyWebhookEvent` — the `PAYMENT_CAPTURED` branch does not verify the captured amount against `Order.totalAmount`. `reconcilePendingPayments()` does. Razorpay enforces the amount at checkout so this is defence-in-depth, but the two paths should match.
- [x] 🟡 Orphaned payments (captured against a CANCELLED/REJECTED order) are recorded and logged at error level but **not auto-refunded** — deliberately, since that is a policy call. Needs an ops surface: an admin view filtered on `AuditLog.action = "PAYMENT_ON_CANCELLED_ORDER"`.

---

# Cross-database consistency (Postgres ↔ Mongo)

Design notes from the follow-up review. Not yet implemented — items are in the checklist above.

**The dual-write window.** `createOrder` reserves Mongo stock *first*, then commits the Postgres order transaction. That ordering is correct and should not be reversed — Postgres-first would let the system sell stock it never reserved. The defect is that the reservation is not durable: it exists only as `decrementedItems` in local memory, so a crash before the commit leaks stock with no record that it happened. The `catch` block's `Promise.allSettled` compensation is best-effort and swallows per-item failures without retry.

**Why a queue alone does not fix it.** "Commit to Postgres, then publish to RabbitMQ" reproduces the same failure one layer down — a crash between the commit and the publish loses the message silently. The fix is a **transactional outbox**: write the event row inside the same Postgres transaction (so commit and intent-to-publish are atomic), then a relay in worker-service polls `status = PENDING` and publishes. `packages/db-postgres/src/index.ts:5` already carries a commented-out `export * from "./outbox.js"` — the file was never written.

```prisma
model OutboxEvent {
  id          String    @id @default(cuid())
  aggregate   String    // "ORDER" | "PAYMENT"
  aggregateId String
  eventType   String    // "ORDER_CREATED" | "STOCK_RESERVED"
  payload     Json
  status      String    @default("PENDING") // PENDING | PUBLISHED | FAILED
  attempts    Int       @default(0)
  createdAt   DateTime  @default(now())
  publishedAt DateTime?
  @@index([status, createdAt])
}

model StockReservation {
  id        String   @id @default(cuid())
  orderId   String?  // null until the order transaction commits
  userId    String
  items     Json     // [{ productId, quantity }]
  status    String   @default("HELD") // HELD | CONSUMED | RELEASED
  createdAt DateTime @default(now())
  @@index([status, createdAt])
}
```

Flow: write `StockReservation(HELD)` → decrement Mongo → mark `CONSUMED` inside the order transaction. A sweeper releases anything `HELD` beyond ~15 min by restoring Mongo stock. This is the durable form of today's `decrementedItems`.

**Reconciliation is a backstop, not the mechanism.** Keep it targeted (stale `HELD` reservations, stale `PENDING` payments) rather than a periodic full-table diff between the two databases.

## Status: implemented

Both patterns are now in place (see _Completed Changes_). Two caveats carried forward:

- The sweeper's Mongo restores are **not idempotent**. On a partial failure it leaves the reservation `HELD` and retries the whole set next pass, which can over-credit an item that already succeeded. Chosen as the lesser evil against leaked stock; a per-item `restored` flag would remove the trade-off.
- Outbox delivery is **at-least-once**. Consumers must be idempotent — the notification consumer currently is not explicitly guarded, so a relay retry after a broker ack failure could duplicate a notification.

---

# Open Risks (not TODO items)

- 🔴 `prod.dev.env` is **committed to git** with live credentials: Razorpay keys, Neon Postgres and MongoDB Atlas connection strings, Fast2SMS and Cloudinary keys. The same Neon/Mongo credentials are hardcoded into `docker/*/Dockerfile` build steps. Rotating these and moving to injected secrets is out of scope for a code audit but should be treated as urgent.
- Migration `20260728000001_payment_reliability` has **not been applied** to any environment. It backfills `Payment.gatewayOrderId` from `metadata` before adding the unique index, so an existing duplicate binding will surface as a migration failure rather than silent corruption.
- None of this session's work has been exercised against a real Razorpay account. Reconciliation, refund settlement, and webhook handling are verified by typecheck and review only.

# Completed Changes

- **Cross-database consistency (outbox + stock reservations)** — added `OutboxEvent`, `StockReservation`, `WebhookEvent` tables, a `gatewayOrderId` column on `Payment`, and a `REFUND_PENDING` payment status (migration `20260728000001_payment_reliability`, **not applied**). `enqueueOutboxEvent()` in `@repo/db-postgres` writes an event inside the caller's transaction — the commented-out `outbox.js` export is now real — and `worker-service/src/workers/outbox.relay.ts` drains it to RabbitMQ every 2s with bounded retries. `createOrder` uses it for the customer's order-confirmation notification (the one that must not be lost); seller dashboard fan-out stays best-effort since the dashboard refetches. For the stock leak: `createOrder` now writes a `StockReservation(HELD)` row *before* the Mongo decrement, marks it `CONSUMED` inside the order transaction, and `RELEASED` on rollback; `order-service/src/jobs/stock-reservation.sweeper.ts` releases anything still HELD after 15 min (Redis-locked, 5-min cron). Mongo-first ordering was kept deliberately — reversing it would allow selling unreserved stock.
- **Durable webhook log + async refunds** — webhook dedupe moved off Redis into `WebhookEvent`, keyed on `(provider, eventId)`, gated on `processedAt` so a *failed* attempt is still retried rather than silently swallowed; the row doubles as the audit trail of what the gateway actually sent. Refunds now claim `COMPLETED → REFUND_PENDING`, and only `refund.processed` sets `REFUNDED`; `refund.failed` returns the order to `COMPLETED`. Payments the automated paths refuse to settle (orphaned captures, amount mismatches, signature/order mismatches, failed refunds) are surfaced at `GET /api/admin/attention` — deliberately not auto-refunded. `applyWebhookEvent` now verifies captured amount against the order total, so live and reconciled payments validate identically. Also fixed: the three pre-existing `seller.controller.ts` type errors (order-service now typechecks clean for the first time), `prod.dev.env`'s missing newline that was swallowing `seller.fishstudio.in` from `CORS_ORIGINS`, the absent `RAZORPAY_WEBHOOK_SECRET` key, and added `check-types` scripts so this class of error can't hide again.
- **Missed-payment recovery + cancel race** — added `fetchOrderSettlement()` to `PaymentProvider` (returns a normalized `GatewaySettlement`, or null while the outcome is still open — `authorized`/`created` are not final). `reconcilePendingPayments()` in the service scans `PENDING` Razorpay payments aged 2 min–3 days, asks Razorpay what actually happened, and pipes the result through the existing `applyWebhookEvent()` so live and recovered payments settle through one code path. It refuses to settle when the captured amount doesn't match `Order.totalAmount`, and one failing order can't abort the batch. Driven by `src/jobs/payment.reconciliation.job.ts` (node-cron, every 5 min, Redis `SET NX` lock so replicas don't double-sweep; stopped on shutdown). For the cancel race: `checkout-client.tsx` now tracks `paymentAttempted` separately from `paymentSettled` and skips the rollback once Razorpay has handed over a payment; `cancelOrder` refuses for 10 min while an opened-but-unsettled checkout binding exists; and `applyWebhookEvent` no longer marks a CANCELLED/REJECTED order paid — it records the payment as `orphaned`, writes a `PAYMENT_ON_CANCELLED_ORDER` audit row, and logs at error level for an operator-issued refund.
- **Architecture, typing, logging, scaffolding** — extracted `src/services/payment.service.ts` (all DB transactions, audit writes, order-state rules) and replaced `razorpay.controller.ts` with a thin `src/controllers/payment.controller.ts` that only parses, delegates, and responds. Added `src/types/payment-request.ts` (`AuthenticatedRequest`, mirroring `auth-service/src/types/auth-request.ts`) — no `req: any` remains; all `as any` casts are gone, including `compression()`, which typechecks clean without one. `Payment.metadata` reads now go through a typed `metadataField()` helper instead of `as any`. Error classes corrected: `ForbiddenError` (403) for access denial, `AppError(…, 503)` for missing gateway credentials. All `console.*` replaced with `@repo/libs/logger`. `main.ts`: duplicate `trust proxy` removed, `uncaughtException`/`unhandledRejection` now exit(1), `SIGTERM`/`SIGINT` graceful shutdown added, magic numbers named, and the rate limiter now `skip`s `/api/webhook` (the raw-body parser was already above it). `writeAuditLog` promoted to `@repo/db-postgres` (`src/audit.ts`) and both payment-service and order-service now import it — the duplicate definition is gone. Inline route middleware replaced by `isAdminOrApprovedSeller` in `@repo/middlewares` (staff deliberately excluded from refunds, resolving the previously-unreachable branch). `createPaymentOrder` now reuses an already-bound gateway order instead of overwriting it (fixes the two-checkout-tabs orphan) and checks the `updateMany` count. `razorpaySignature` is no longer persisted. Added `README.md`, `env.example`, `.gitignore`; moved four `@types/*` to `devDependencies` and dropped the unused `@repo/db-mongo`.
- **Zod validation** — added `packages/zod-schema/src/schemas/payment.schema.ts` (`createRazorpayOrderSchema`, `verifyPaymentSchema`, `initiateRefundSchema`), exported from the schemas barrel with inferred `*Input` types in `src/index.ts`; package rebuilt. All three authenticated handlers now use `validate(schema, req.body)` instead of manual `if (!field)` checks. `razorpayWebhookEventSchema` was deliberately not added: webhook payload shape is provider-internal since the wiring change, and a Razorpay-specific schema in the shared package would cross the gateway boundary.
- **Provider abstraction wired** — created `src/payment/payment.factory.ts` (registry keyed by `PaymentProvider.name`, matching `Order.paymentMethod`). The controller now routes order creation, callback signature verification, webhook verification/parsing, and refunds through `getPaymentProvider("RAZORPAY")`; the duplicated Razorpay client singleton, both inline HMAC computations, `safeHexEqual`, and inline webhook parsing were deleted from the controller (~60 lines). Webhook branches now switch on `NormalizedWebhookEvent` — the interface gained `gatewayPaymentId?` on the `REFUND` variant (needed for Payment metadata) and `RefundParams.notes` narrowed to `Record<string, string | number | null>`, which let the provider's `payments.refund` drop its `as any`. Provider hardening: missing key/webhook secrets now return `false` from verification instead of `as string`-crashing, and `parseWebhookEvent` guards `JSON.parse` (returns `UNHANDLED` for malformed bodies). Frontend response shape (`razorpayOrderId/amount/currency/keyId`) unchanged.
- **Refund consistency** (`razorpay.controller.ts` `initiateRefund`) — refactored to claim → gateway call → finalize: an atomic `updateMany where paymentStatus != REFUNDED` claims the refund before hitting Razorpay (losers/repeat calls get "already been refunded"), the claim is released with loud logging if the gateway call fails, and the `Payment` row now moves to `REFUNDED` with refund metadata after success. A crash between gateway success and the Payment update is reconciled by the (now conditional) `refund.processed` webhook branch, which settles both rows regardless of which side flipped first. Chose claim-then-compensate over a single `$transaction` because the Razorpay API call cannot participate in a DB transaction; the claim is what prevents concurrent double-submission.
- **Webhook correctness** (`razorpay.controller.ts`) — `payment.failed` now only transitions `PENDING → FAILED` (late/retried failure events can no longer claw back a COMPLETED/REFUNDED order). Internal processing errors now return 500 so Razorpay retries, instead of a swallowed 200. Added event dedupe on `x-razorpay-event-id` via Redis `SET NX EX` (3-day TTL; claimed after signature verification, released on processing failure so retries can reprocess). The refund branch now updates the `Payment` row to `REFUNDED` in the same `$transaction` as the `Order`, and is guarded on current status. `RAZORPAY_WEBHOOK_SECRET` missing is now a loud 500 instead of silent event discard. Signature-mismatch warning includes IP + event id. Also fixed `writeAuditLog`'s `metadata` param to `Prisma.InputJsonObject` (surfaced once `@repo/db-postgres` declarations were built — the package's `dist/` was missing `.d.ts` until `bun run build` was rerun there).
- **Docker deployment** — added `docker/payment-service/Dockerfile` (order-service template; placeholder DB URLs for `prisma generate` instead of the real-looking credentials the sibling Dockerfiles embed). Added `payment-service` blocks to `docker-compose.yml` (expose 6007, network alias) and `prod.docker-compose.yml`; gateway now gets `PAYMENT_SERVICE_URL: http://payment-service:6007` and `depends_on: payment-service` in both. Also added the missing `payment-service` build job to `.github/workflows/deploy.yml` (jobs 1-6 existed for every other service; payment-service images were never built/pushed) and added it to `deploy-to-ec2.needs`. `prod.dev.env` already carried `PAYMENT_SERVICE_URL`.
