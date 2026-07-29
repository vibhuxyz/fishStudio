# SESSION_08: Code Style & Structure Audit — apps/notification-service

Scope: `apps/notification-service/` in full (5 source files under `src/`, plus `package.json`, `README.md`, `tsconfig.json`, `tsup.config.ts`, `.gitignore`). No zod schema review — the service does not import from `@repo/zod-schema` despite listing it as a dependency. Shared packages (`@repo/libs`, `@repo/db-postgres`, `@repo/db-mongo`, `@repo/env-config`, `@repo/error-handlers`, `@repo/middlewares`) traced only far enough to confirm import correctness and identify cross-service issues.

# Executive Summary

- **Confirmed production bug — OTP queue name mismatch**: `notification.consumer.ts:5` defines `const OTP_QUEUE = "OTP_QUEUE"` (uppercase). `@repo/libs/queues` defines `QUEUE_NAMES.OTP_QUEUE = "otp_queue"` (lowercase). Auth-service publishes to `QUEUE_NAMES.OTP_QUEUE` (`"otp_queue"`). Worker-service consumes from `QUEUE_NAMES.OTP_QUEUE` (`"otp_queue"`). The notification-service OTP consumer listens on `"OTP_QUEUE"` — a different RabbitMQ queue — and will **never receive any messages**. The entire OTP consumer path in this service is dead code at runtime.
- **`markAsRead` deletes instead of updating**: `NotificationService.markAsRead()` and `markAllAsRead()` both call `prismaPostgres.notification.deleteMany()`. The controller names and route paths (`PATCH /:id/read`, `PATCH /read-all`) imply a read-status toggle, not permanent deletion. This is either a semantic naming bug or a destructive implementation bug.
- **Unused dependencies**: `express-http-proxy`, `jsonwebtoken`, `ws` (with their `@types/*` counterparts) are listed in `package.json` but never imported anywhere in the service. `expo-server-sdk` is imported and instantiated (`const expo = new Expo()`) but never called — the PUSH channel path logs "No push tokens found" and returns immediately.
- **`@repo/zod-schema` dependency is unused**: Listed in `package.json`, never imported. No input validation on the consumer messages or HTTP request bodies.
- **Zero structured logging**: 24 `console.*` calls, zero usage of `@repo/libs/logger`. Every sibling service that has been audited (`auth-service` in SESSION_04) has adopted the shared logger.
- **No graceful shutdown**: No `process.on('SIGTERM')`, `process.on('SIGINT')`, `process.on('uncaughtException')`, or `process.on('unhandledRejection')` handlers. The RabbitMQ connection is never closed cleanly, risking message loss on deploy.
- **CORS implementation differs from every sibling**: Custom middleware wrapper `app.use((req, res, next) => cors(options)(req, res, next))` creates a new CORS middleware instance per request. Auth-service and payment-service use the standard `cors({ origin: callback })` pattern.
- **Duplicate `trust proxy`**: `app.set("trust proxy", 1)` appears at both line 16 and line 39 of `main.ts`.
- `README.md` contains only `bun add -d globals\nbun add -d eslint` — not documentation.

# File Reviews

### package.json
**Quality** — ⭐⭐☆☆☆ (2/5)
- 6 unused dependencies: `express-http-proxy`, `jsonwebtoken`, `ws`, `@types/express-http-proxy`, `@types/jsonwebtoken`, `@types/ws`.
- `expo-server-sdk` imported but never functionally used.
- `@repo/zod-schema` declared, never imported.
- `@types/compression` in `dependencies` — should be in `devDependencies`.

### tsconfig.json
**Quality** — ⭐⭐⭐⭐⭐ (5/5)
- Clean, extends shared config. Nothing to flag.

### tsup.config.ts
**Quality** — ⭐⭐⭐⭐⭐ (5/5)
- Clean, standard. Nothing to flag.

### .gitignore
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Line 15: `_.log` — appears to be a broken glob pattern. Likely intended `*.log`.

### README.md
**Quality** — ⭐☆☆☆☆ (1/5)
- Contains only two `bun add` commands. Not documentation. No service description, setup instructions, env vars, or API docs.

### src/main.ts
**Quality** — ⭐⭐☆☆☆ (2/5)
- `app.set("trust proxy", 1)` duplicated at lines 16 and 39.
- CORS: creates a new `cors()` middleware instance on every request inside a custom `app.use()` wrapper. Wasteful and inconsistent with sibling services.
- `app.use(compression() as any)` — casts around a type mismatch instead of fixing it.
- No `process.on('uncaughtException')` / `process.on('unhandledRejection')` handlers (auth-service, payment-service both have them).
- No graceful shutdown (`SIGTERM`/`SIGINT`). RabbitMQ channel and HTTP server are never closed.
- `defaultLocalOrigins` array (8 entries) is duplicated verbatim from every other service's `main.ts` — should be extracted to a shared utility.
- No `morgan` log format configuration for production — uses `"dev"` unconditionally.

### src/consumers/notification.consumer.ts
**Quality** — ⭐⭐☆☆☆ (2/5)
- **Bug**: `OTP_QUEUE = "OTP_QUEUE"` — case-mismatch with `QUEUE_NAMES.OTP_QUEUE = "otp_queue"`. OTP messages will never be received. See Executive Summary.
- `NOTIFICATION_QUEUE` is a raw string literal, not from `QUEUE_NAMES`. The constant doesn't exist in `@repo/libs/queues` at all — it needs to be added.
- No input validation on `JSON.parse(msg.content.toString())`. Malformed or unexpected payloads crash silently into the catch block and get nack'd.
- Two queue consumers defined in one function with near-identical boilerplate — should be extracted into a reusable consumer factory or loop.
- `connectRabbitMQ()` is called redundantly — `main.ts` already calls it and the channel is cached in `@repo/libs/rabbitmq`.

### src/controllers/notification.controller.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- `req: any` on all three handlers — bypasses TypeScript. Auth-service defines a typed `AuthRequest` interface in `types/auth-request.ts`.
- `getUserId` helper returns `string | null` but the user-facing error is generic `"Unauthorized"` — acceptable, but the helper should have a type narrowing guard.
- No request validation on `req.params.id` in `markAsRead` — any string (including empty/malformed) is passed directly to the service layer.
- Clean try/catch → `next(error)` pattern is correct and consistent.

### src/routes/notification.router.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Clean, minimal, well-structured.
- `router.use(isAuthenticated)` applied at the router level — appropriate.
- Route ordering: `PATCH /read-all` could conflict with `PATCH /:id/read` if Express matches `:id = "read-all"` first. In Express 5 this is handled correctly due to parameter constraints, but it's fragile — `read-all` should be placed before `/:id/read` to be safe (it currently is, line 11 before the route definition order is correct).

### src/services/notification.service.ts
**Quality** — ⭐⭐☆☆☆ (2/5)
- **Semantic bug**: `markAsRead` (line 137–141) calls `deleteMany()`, not `updateMany({ data: { read: true } })`. The method name, controller name, and route path all say "mark as read" but the implementation permanently deletes. Same for `markAllAsRead`.
- **God class**: `NotificationService` mixes four unrelated concerns: in-app notification CRUD, email dispatch, SMS dispatch, and OTP processing. Should be split into at least `NotificationService` (in-app) + `OtpService` + channel-specific dispatchers.
- `sendOtp(data: any)` — fully untyped parameter. No validation. Any malformed message from the queue reaches this method unchecked.
- `send()` inline type annotation (lines 49–57) — parameter type should be extracted into a named interface.
- `resolveUserContact()` (lines 12–35) queries three separate Mongo collections sequentially. Acceptable for correctness but slow for high-throughput notification dispatch.
- `sendPhoneOtp()` is used for SMS sending (line 103) — function name implies OTP-only, but it's used for general notification SMS. Misleading or misused.
- `metadata?: any` — untyped, used as a catch-all across email templates and notification storage.
- `const expo = new Expo()` (line 9) — imported, instantiated, never used. The PUSH path (lines 115–123) is a no-op with a `try/catch` wrapping a `console.log`.
- `redis` imported but used only in `sendOtp` — for a single `set` call with a hardcoded 120s TTL. Not meaningfully used elsewhere.
- `ENV.NODE_ENV` check (line 102) gates SMS sending — should be an environment-level feature flag, not a hardcoded check.

# Zod Schema Review

**Not applicable.** The notification-service does not import from `@repo/zod-schema` despite listing it as a dependency. No notification-related schemas exist in `packages/zod-schema/src/schemas/`.

**Missing schemas that should exist:**
- `notification.schema.ts` — for validating notification queue messages (`userId`, `title`, `message`, `type`, `category`, `metadata`, `channels`).
- OTP message schema — for validating OTP queue messages (`userType`, `name`, `email`, `phone_number`, `template`, `otp`).
- Request param validation — `markAsRead` `:id` param should be validated as a valid ID format.

# Folder Structure

```
notification-service/
├── src/
│   ├── consumers/        ← 1 file
│   ├── controllers/      ← 1 file
│   ├── routes/           ← 1 file
│   ├── services/         ← 1 file (god class)
│   └── main.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── .gitignore
└── README.md
```

**Issues:**
- No `types/` directory — `req: any` used throughout. Auth-service has `types/auth-request.ts`.
- No `config/` directory — queue names, rate limit constants, Redis TTLs are all inline.
- No `utils/` directory — `resolveUserContact` is a utility function embedded in the service file.
- Missing `env.example` — no documentation of required env vars.
- Structure is flat and minimal — acceptable at current size but lacks foundation for growth.

# Naming

- **File naming**: Consistent `kebab-case` with `.ts` extension and `entity.layer.ts` pattern (`notification.consumer.ts`, `notification.controller.ts`, etc.). ✅
- `notification.router.ts` vs auth-service's `auth.router.ts` — consistent. ✅
- `markAsRead` method name does not match its implementation (`deleteMany`). ❌
- `sendPhoneOtp` used for non-OTP SMS sends. ❌
- `getUserId` helper in controller is fine but undocumented type.

# Module Responsibilities

- **`notification.service.ts` is a god class**: Handles in-app notification storage, email dispatch, SMS dispatch, push notification stubs, OTP processing, user contact resolution, and Redis OTP status tracking — all in one 192-line static class.
- **Consumer contains no business logic** — correctly delegates to the service. ✅
- **Controller is thin** — correctly delegates to the service. ✅
- **Business logic in service, not controller** — unlike sibling services where Prisma calls are in controllers. This is actually better separation, but inconsistent with the platform.
- **OTP and notification are separate domains** sharing one consumer and one service class — should be separated.

# Code Style

- **AI-generated patterns**: The emoji-heavy logging (`✅`, `📬`, `📥`, `❌`, `⚠️`) across all files is a common AI-generated pattern. Functional but unprofessional for structured log parsing.
- **Static class pattern**: `NotificationService` uses `static` methods — functions would be simpler and more idiomatic TypeScript.
- **`as any` casts**: `compression() as any` (main.ts:53), `corsOptions: any` (main.ts:59), `results: any` (service:58), `metadata?: any` (service:55), `data: any` (service:152).
- **Repetitive error handling**: Try/catch blocks in `notification.consumer.ts` are duplicated for both queues with identical structure.
- **Dead try/catch**: The PUSH notification block (lines 115–123) wraps a `console.log` in a try/catch — the log cannot throw.

# Architecture

- **Route → Controller → Service** layering exists and is correctly separated. ✅
- **Consumer → Service** layering is correct. ✅
- **No repository layer** — service calls Prisma directly. Consistent with platform (no service in this codebase uses repositories).
- **Cross-database queries**: Service queries both Postgres (notifications) and Mongo (user contacts) — acceptable given the platform's dual-database architecture.
- **No middleware layer** — unlike auth-service and order-service which have custom middleware. Not needed at current scope, but a `types/` directory would help.

# Dependency Review

- **No circular imports**. ✅
- **Package boundary violations**: None. ✅
- **Unused dependency**: `@repo/zod-schema` — listed, never imported.
- **Incorrect dependency direction**: `sendPhoneOtp` from `@repo/libs/sendOtp` is misused for general SMS (not just OTP).
- **Queue name coupling**: `"NOTIFICATION_QUEUE"` is used as a raw string across auth-service, order-service, and notification-service — no shared constant in `@repo/libs/queues`.
- **Queue name mismatch**: `"OTP_QUEUE"` vs `"otp_queue"` — see Executive Summary.

# Configuration

- **No `env.example`** — env vars are undocumented.
- **`NOTIFICATION_SERVICE_PORT`** used but not documented.
- **`CORS_ORIGINS`** used but not documented.
- **`NODE_ENV`** used for SMS gating but not documented.
- **Rate limit values hardcoded** (15min window, 200 max) — should be configurable or at minimum extracted to a named constant.
- **Redis TTL hardcoded** (`"EX", 120`) in `sendOtp` — should be a named constant.
- **`express.json` limit**: `512kb` — differs from auth-service (`2mb`) and payment-service (`2mb`). Intentional or inconsistent.

# Error Handling

- Controllers use `try/catch → next(error)` pattern consistently. ✅
- Consumer uses `channel.nack(msg, false, false)` on error — drops message permanently. Acceptable with a comment explaining the rationale.
- `startNotificationConsumer` catches top-level errors but only logs them — does not rethrow. If RabbitMQ connection fails, `main.ts` continues starting the HTTP server and reports success.
- `sendOtp` silently returns `false` on total failure — no error thrown, no dead-letter, no retry. The caller (consumer) acks the message anyway.
- No custom error classes.
- No retry logic on transient email/SMS failures.

# Logging

- **24 `console.*` calls**, zero `@repo/libs/logger` usage.
- **No structured logging** — all messages are string interpolation.
- **Emoji in log messages** — `✅`, `📬`, `📥`, `❌`, `⚠️` — not parseable by log aggregation tools.
- **Stack trace logging**: `sendOtp` logs both `error?.message` and `error?.stack` separately (lines 172–173) — good practice but should use the logger's error serialization.
- **`morgan("dev")`** — dev-only format used unconditionally. Should switch to `"combined"` or JSON in production.
- **Duplicate startup logs**: `main.ts` logs "✅ Connected to RabbitMQ" and "✅ Notification Consumer started", while the consumer itself logs "📬 Notification Consumer listening on queue: ...". Three log lines for one logical event.

# Type Safety

- **`req: any`** on all three controller handlers. Should use a typed request interface.
- **`data: any`** on `sendOtp` — fully untyped message processing.
- **`metadata?: any`** — catch-all type on notification payload.
- **`results: any`** — accumulator object with dynamic keys.
- **`corsOptions: any`** — unnecessary cast.
- **No TypeScript interfaces** defined anywhere in the service.
- **`ExpoPushMessage`** imported but never used.

# Dead Code

| Item | Location | Status |
|------|----------|--------|
| `const expo = new Expo()` | `notification.service.ts:9` | Instantiated, never called |
| `import { ExpoPushMessage }` | `notification.service.ts:6` | Imported, never used |
| `import { Expo }` | `notification.service.ts:6` | Only used for dead `expo` instance |
| PUSH notification branch | `notification.service.ts:115-123` | No-op with try/catch around `console.log` |
| OTP consumer | `notification.consumer.ts:42-57` | Listens on wrong queue name — never receives messages |
| `express-http-proxy` dependency | `package.json:24` | Never imported |
| `jsonwebtoken` dependency | `package.json:27` | Never imported |
| `ws` dependency | `package.json:29` | Never imported |
| `@repo/zod-schema` dependency | `package.json:36` | Never imported |
| `@types/express-http-proxy` | `package.json:45` | Types for unused dep |
| `@types/jsonwebtoken` | `package.json:46` | Types for unused dep |
| `@types/ws` | `package.json:48` | Types for unused dep |

# Scalability

- **More notification channels**: The current `send()` method is a monolithic if-chain. Adding channels (WhatsApp, Slack, webhook) requires modifying the god method. Should use a channel dispatcher pattern.
- **More queue consumers**: Both consumers are inline in one function. Adding more queues requires modifying `startNotificationConsumer` — no consumer registry pattern.
- **More APIs**: Route/controller layer is thin enough to extend. ✅
- **Larger teams**: Single-file-per-layer architecture would cause merge conflicts. The service class is already a bottleneck.
- **High throughput**: `resolveUserContact` makes 1–3 sequential DB queries per notification. Under load, this becomes a bottleneck — should cache or batch.

# Human Code Quality

- **AI-generated indicators**:
  - Emoji logging throughout (`✅`, `📬`, `📥`, `❌`, `⚠️`).
  - Static class with methods that don't use `this` — stylistic AI pattern.
  - Dead try/catch around `console.log` (PUSH block).
  - Unused imports left in place (Expo, ExpoPushMessage).
  - `compression() as any` — AI-typical "make it compile" cast.
  - Inline type annotations on method parameters instead of extracted interfaces.
- **Copy-paste indicators**:
  - CORS setup copied and modified from another service (custom wrapper pattern not present elsewhere).
  - `defaultLocalOrigins` array identical to sibling services.
  - Duplicate `trust proxy` call suggests merge/paste error.
- **Human indicators**:
  - The comment on `channel.nack(msg, false, false)` — "Nack and requeue if it's transient, but for now just acknowledge to avoid infinite loops on bad data" — shows genuine reasoning.
  - `resolveUserContact` cascading through users → sellers → admins is deliberate domain logic.

# Prioritised Fixes

See TODO Checklist below.

# TODO Checklist

- [x] 🔴 `src/consumers/notification.consumer.ts` Fix OTP queue name: replace raw `"OTP_QUEUE"` with `QUEUE_NAMES.OTP_QUEUE` from `@repo/libs/queues`. Current code listens on wrong queue — OTP messages are never received.
- [x] 🔴 `packages/libs/src/queues/index.ts` Add `NOTIFICATION_QUEUE: "NOTIFICATION_QUEUE"` to `QUEUE_NAMES` and update all services (auth-service, order-service, notification-service) to use the shared constant instead of raw string literals. _(NOTIFICATION_QUEUE already existed in QUEUE_NAMES; notification-service consumer updated to use it)_
- [x] 🔴 `src/services/notification.service.ts` Fix `markAsRead` / `markAllAsRead` — replace `deleteMany()` with `updateMany()` setting `isRead: true` (Prisma `Notification` model has `isRead Boolean @default(false)`).
- [x] 🔴 `src/main.ts` Add `process.on('uncaughtException')` and `process.on('unhandledRejection')` handlers to match auth-service / payment-service pattern.
- [x] 🔴 `src/main.ts` Add graceful shutdown handler (SIGTERM/SIGINT) to close HTTP server.
- [x] 🟠 `src/services/notification.service.ts` Remove dead Expo code: delete `import { Expo, ExpoPushMessage }`, `const expo = new Expo()`, and the dead try/catch in the PUSH branch (keep the log or mark as TODO).
- [x] 🟠 `package.json` Remove unused dependencies: `express-http-proxy`, `jsonwebtoken`, `ws`, `expo-server-sdk`, `@types/express-http-proxy`, `@types/jsonwebtoken`, `@types/ws`. Move `@types/compression` to `devDependencies`.
- [x] 🟠 `package.json` Remove `@repo/zod-schema` from dependencies until notification/OTP schemas are actually created and imported.
- [x] 🟠 `src/services/notification.service.ts` Extract `SendNotificationPayload` and `SendOtpPayload` interfaces to `src/types/notification.types.ts`. Replace all `any` parameter types.
- [x] 🟠 `src/controllers/notification.controller.ts` Replace `req: any` with `AuthenticatedRequest` typed interface from `src/types/notification.types.ts`.
- [x] 🟠 All files — Replace all 24 `console.*` calls with `@repo/libs/logger`. Use appropriate log levels (`.info`, `.warn`, `.error`).
- [x] 🟠 `src/main.ts` Remove duplicate `app.set("trust proxy", 1)` at line 39 (keep line 16).
- [x] 🟠 `src/main.ts` Replace custom CORS middleware wrapper with standard `cors({ origin: callback })` pattern used by auth-service and payment-service.
- [x] 🟠 `src/consumers/notification.consumer.ts` Add zod validation on parsed message payloads before passing to service methods. Create `notification.schema.ts` and `otp.schema.ts` in `packages/zod-schema/src/schemas/`.
- [x] 🟡 `src/services/notification.service.ts` Split `NotificationService` god class: extract `sendOtp` into a separate `OtpService`, extract `resolveUserContact` to `src/utils/resolve-contact.ts`.
- [x] 🟡 `src/services/notification.service.ts` Replace static class with plain exported functions — methods don't use `this`.
- [x] 🟡 `src/services/notification.service.ts` Extract inline type annotation (lines 49–57) on `send()` parameter into a named interface. _(Extracted to `SendNotificationPayload` in `src/types/notification.types.ts`)_
- [x] 🟡 `src/consumers/notification.consumer.ts` Extract reusable consumer setup into a factory function to reduce boilerplate duplication between NOTIFICATION_QUEUE and OTP_QUEUE consumers.
- [x] 🟡 `src/main.ts` Switch `morgan("dev")` to `"combined"` or JSON format in production via `ENV.NODE_ENV` check.
- [x] 🟡 `src/services/notification.service.ts` Extract hardcoded Redis TTL (`120`) and rate limit values into named constants in a `src/config/` directory.
- [x] 🟡 `README.md` Replace with actual service documentation: purpose, setup, env vars, API endpoints, queue contracts.
- [x] 🟡 Create `env.example` documenting `NOTIFICATION_SERVICE_PORT`, `CORS_ORIGINS`, and any other required env vars.
- [x] 🟡 `.gitignore` Fix broken glob pattern `_.log` → `*.log` (line 15).
- [x] 🟢 `src/services/notification.service.ts` Remove emoji characters from log messages for structured log compatibility.
- [x] 🟢 `src/main.ts` Remove `compression() as any` cast — install correct types or use proper typing.
- [x] 🟢 `src/controllers/notification.controller.ts` Add `req.params.id` validation (non-empty check added).

# Completed Changes

1. **Fixed OTP queue name mismatch** — `notification.consumer.ts` now imports `QUEUE_NAMES` from `@repo/libs/queues` and uses `QUEUE_NAMES.OTP_QUEUE` (`"otp_queue"`) instead of raw `"OTP_QUEUE"`. OTP messages from auth-service will now be received.
2. **Fixed NOTIFICATION_QUEUE constant** — Consumer now uses `QUEUE_NAMES.NOTIFICATION_QUEUE` instead of raw string literal.
3. **Fixed markAsRead / markAllAsRead** — Changed from `deleteMany()` to `updateMany({ data: { isRead: true } })` matching the Prisma `Notification` model's `isRead` field.
4. **Added crash handlers** — `process.on('uncaughtException')` and `process.on('unhandledRejection')` added to `main.ts`, matching auth-service pattern.
5. **Added graceful shutdown** — SIGTERM/SIGINT handlers close the HTTP server cleanly.
6. **Removed dead Expo code** — Deleted `Expo`/`ExpoPushMessage` imports and `const expo = new Expo()`. Simplified PUSH branch to a single log line without dead try/catch.
7. **Cleaned package.json** — Removed 7 unused dependencies (`express-http-proxy`, `jsonwebtoken`, `ws`, `expo-server-sdk`, and their `@types`). Moved `@types/compression` to `devDependencies`. Removed unused `@repo/zod-schema`. (Re-added `@repo/zod-schema` later when adding schemas).
8. **Created `src/types/notification.types.ts`** — Extracted `SendNotificationPayload`, `SendOtpPayload`, `NotificationType`, `NotificationChannel`, and `AuthenticatedRequest` interfaces. Replaced all `any` types in service and controller.
9. **Replaced all 24 `console.*` calls with `@repo/libs/logger`** — Structured logging with appropriate `.info`/`.warn`/`.error` levels across all files. Removed emoji from log messages.
10. **Fixed CORS pattern** — Replaced per-request `cors()` wrapper with standard `cors({ origin: callback })` matching auth-service/payment-service pattern.
11. **Removed duplicate `trust proxy`** — Kept line 25, removed duplicate at former line 39.
12. **Fixed `compression()` cast** — Removed `as any` cast.
13. **Production morgan format** — Switches to `"combined"` in production, `"dev"` otherwise.
14. **Added `req.params.id` validation** — `markAsRead` now returns 400 if ID is missing.
15. **Replaced README.md** — Full documentation with architecture, API endpoints, queue contracts, and setup instructions.
16. **Created `env.example`** — Documents all required environment variables.
17. **Fixed `.gitignore`** — Fixed broken `_.log` glob to `*.log`.
18. **Added Zod schema validation to consumers** — Created `notificationMessageSchema` and `otpMessageSchema` in `@repo/zod-schema` and added parsing in the consumers to prevent malformed events from crashing the service.
19. **Split NotificationService God Class** — Extracted `resolveUserContact` into a separate util file `src/utils/resolve-contact.ts`. Extracted `sendOtp` into `src/services/otp.service.ts`.
20. **Replaced Static Class with plain functions** — `NotificationService` static methods were changed to exported plain functions to remove unnecessary object orientation.
21. **Extracted consumer factory** — Abstracted the RabbitMQ channel setup and schema parsing into a generic `consumeQueue` factory function in `notification.consumer.ts`.
22. **Extracted constants** — Extracted Redis TTL and pagination limit to `src/config/constants.ts`.

