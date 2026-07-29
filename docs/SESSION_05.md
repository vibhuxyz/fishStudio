# SESSION_05: Code Style & Structure Audit — apps/worker-service

Scope: `apps/worker-service/` in full. No `@repo/zod-schema` files are imported by this service (confirmed via grep — zero references, no dependency entry), so the Zod Schema Review section reports that gap rather than reviewing schema files. `@repo/libs`, `@repo/jobs`, `@repo/env-config` were read only as far as needed to verify worker-service's own claims (dead deps, unused logger, hidden coupling) — they are not audited in full.

# Executive Summary

- Small service (12 files), sized appropriately for what it does: three RabbitMQ consumers (OTP, order, admin) fan out to WebSocket clients. No forced service/repository layering, no folder over-engineering — the under-abstraction is appropriate here, not a red flag.
- `src/socket.ts` is the strongest file: JWT-verified WebSocket upgrades, anonymous-safe broadcast, heartbeat/reconnect handling. Real security thinking, not boilerplate.
- The weak spot is **queue error handling and message validation**: `order.worker.ts` and `admin.worker.ts` `ack()` the message even when processing throws, silently discarding real-time events on any error. `otpWorker.ts` does the opposite (`nack`, no requeue, no DLQ) — three near-identical workers, three different failure behaviors, none of them fully safe.
- No message-shape validation for order/admin events (`content: any` off `JSON.parse`); OTP has a hand-rolled type guard instead of using `@repo/zod-schema`, which the platform already has and uses elsewhere.
- Queue name constants are half-centralized: `OTP_QUEUE` lives in `config/queues.ts`, but `"ORDER_EVENTS"` / `"ADMIN_EVENTS"` are string literals duplicated across this service and three other services (~10 call sites total) with no shared constant.
- A leveled logger (`@repo/libs/logger`) exists and is unused — same finding as the prior auth-service audit (SESSION_04). This is a platform-wide gap, not unique to this service.
- One real hidden coupling: the shared `sendEmail` (used by this service's OTP handler) defaults its template path into `apps/auth-service/src/utils/email-templates` — worker-service's email OTP silently depends on another app's folder.
- Dead code is minor but present: an unused barrel file, an unused exported constant, unused direct dependencies in `package.json`, a stray debug log.

# File Reviews

### src/main.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- Stray leftover: `console.log("Hello Workers")` (line 10).
- Graceful shutdown (SIGINT/SIGTERM closing the server and stopping cron jobs) is implemented correctly — worth noting since the equivalent auth-service file lacked this.
- `Number(ENV.WORKER_SERVICE_PORT) || 6006` re-defaults a value that `@repo/env-config` already defaults to `"6006"` — redundant fallback across two layers.
- All logging is raw, emoji-prefixed `console.log`/`console.error` despite `@repo/libs/logger` being available.

### src/config/queues.ts
**Quality** — ⭐⭐☆☆☆ (2/5)
- Only `OTP_QUEUE` is defined here; `order.worker.ts` and `admin.worker.ts` hardcode `"ORDER_EVENTS"` / `"ADMIN_EVENTS"` as local string literals instead of extending this same file — the pattern exists but is applied inconsistently within its own module.
- `QUEUE_OPTIONS` is exported but never imported anywhere in the service — dead code.

### src/types/otpMessage.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- `isValidOtpMessage` is a correct, readable hand-rolled type guard, but it duplicates what a zod schema would give for free, and the platform already has `@repo/zod-schema` for exactly this kind of shape validation elsewhere.
- No compile-time guarantee that this shape agrees with whatever publishes to `otp_queue` (auth-service, notification-service) — only a runtime structural check on the consumer side.

### src/handlers/otpHandler.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Clear, well-logged phone → email fallback logic; each branch's outcome is logged with the actual recipient/template, which is genuinely useful for debugging delivery issues.
- `redis.set(\`otp_status:${userType}:${phone_number || email}\`, "sent", "EX", 120)` — nothing else in scope ever reads this key back. Looks like a half-built status-check feature.
- Raw `console.*` throughout, while the functions it calls (`sendEmail`, `sendPhoneOtp` in `@repo/libs`) use the structured `logger` internally — inconsistent logging boundary within the same call chain.

### src/workers/messageProcessor.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- Small, correct, readable in isolation.
- Misleadingly generic name — it's OTP-only (imports `otpMessage.js`, used only by `otpWorker.ts`). `order.worker.ts` and `admin.worker.ts` don't use it; they duplicate the parse+log shape inline instead.

### src/workers/otpWorker.ts
**Quality** — ⭐⭐⭐☆☆ (3/5)
- On failure: `channel.nack(msg, false, false)` — no requeue, and no dead-letter queue configured anywhere in this service or `@repo/libs/rabbitmq`. A failed OTP message is permanently dropped with just a `console.error`.
- Calls `connectRabbitMQ()` again inside the per-message callback purely to obtain the channel for `ack`/`nack`. Harmless (the function is memoized) but roundabout — the channel is already available from the outer `consumeQueue` call.

### src/workers/order.worker.ts
**Quality** — ⭐⭐☆☆☆ (2/5)
- **`channel.ack(msg)` runs inside the `catch` block** — if parsing or broadcasting throws, the message is still acknowledged and permanently removed from the queue. A malformed or failed order event is silently lost with only a log line, no retry, no DLQ.
- `content: any` from `JSON.parse` with no shape validation before reading `content.type`/`content.storeId`/etc.
- Queue name `"ORDER_EVENTS"` is a local string literal, not sourced from `config/queues.ts`.
- Four `if (content.type === ...)` blocks rather than a switch/handler map — fine at 4 branches, will get unwieldy if event types keep growing.

### src/workers/admin.worker.ts
**Quality** — ⭐⭐☆☆☆ (2/5)
- Same issues as `order.worker.ts`: ack-on-failure error handling, untyped `content: any`, hardcoded `"ADMIN_EVENTS"` string literal, if-chain dispatch on `content.type`.

### src/workers/index.ts
**Quality** — ⭐☆☆☆☆ (1/5)
- Dead file: re-exports only `otpWorker` and `messageProcessor` (missing `order.worker` and `admin.worker`), and nothing in the service actually imports from `./workers` — `main.ts` imports each worker by direct file path instead. The barrel is both incomplete and unused.

### src/socket.ts
**Quality** — ⭐⭐⭐⭐☆ (4/5)
- Strongest file in the service: WebSocket upgrades are authenticated with a verified JWT before any identity is pinned; a supplied-but-invalid token is rejected outright; anonymous connections are allowed but excluded from all private-room broadcasts; heartbeat/ping-pong cleans up dead sockets. Genuine security reasoning, not a default pattern.
- The comment at lines 17–22 ("Fix #2: ... The old code trusted client-supplied query params ... which let anyone impersonate anyone's real-time feed") narrates a past edit/diff rather than explaining current reasoning — reads like a leftover agent/PR annotation rather than in-code documentation.
- `(ws as any).__identity` — the `SocketClient` interface is declared right above this and could hold an `identity?: VerifiedIdentity` field directly instead of this `any`-cast side channel.
- `payload: any` on all five `broadcastTo*` methods and `broadcastAll`.
- `broadcastToStore`, `broadcastToStaff`, `broadcastToSeller`, `broadcastToUser`, `broadcastToAdmin` are five near-identical copies (filter by field → send → count → log) differing only in which field is compared — a bug fix in one has to be manually repeated in the other four.
- `ws.role = identity?.role` is set on connection but never read anywhere else in the file or service.

### Config files (package.json, tsconfig.json, README.md, .gitignore)
**Quality** — ⭐⭐☆☆☆ (2/5)
- `package.json` declares `@repo/db-postgres` and `node-cron` as direct dependencies; neither is imported anywhere in `src/` (both are only reached transitively through `@repo/jobs`'s `CronManager`). `@repo/db-mongo`, which the same cron jobs also require transitively, isn't declared at all — the dependency list is both inaccurate and incomplete.
- No `.env.example` anywhere in the service, despite depending (directly and transitively via `@repo/libs`) on `WORKER_SERVICE_PORT`, `ACCESS_TOKEN_JWT_SECRET_KEY`, `RABBITMQ_*`, `REDIS_DATABASE_URL`, `SMTP_*`/`BREVO_API_KEY`, `FAST2SMS_API_KEY`.
- `README.md` is still the unmodified `bun init` template — says "merchant-service" and `bun run index.ts`, neither of which matches this service's actual name or entrypoint (`tsx watch src/main.ts`).
- `apps/worker-service/.DS_Store` is tracked in git even though `.gitignore` excludes `.DS_Store` — committed before the ignore rule existed and never removed.

# Zod Schema Review

Not applicable to this service. `apps/worker-service` has no dependency on and no import of `@repo/zod-schema` (verified by grep across `src/` and `package.json`). All validation in scope is either:
- A hand-rolled type guard (`src/types/otpMessage.ts::isValidOtpMessage`) for OTP messages, or
- Absent entirely for order/admin events (`content: any` off raw `JSON.parse`, no shape check before use).

This is worth flagging on its own: a message queue boundary is exactly where schema validation earns its keep (untrusted, cross-service input), and it's the one boundary in this service with the least validation, not the most.

# Folder Structure

- `config/`, `handlers/`, `types/`, `workers/` — clear, minimal, appropriately sized for the service. No god files, no dumping-ground `utils/`.
- `socket.ts` sits at `src/` root rather than its own folder; acceptable for a single file, but note if real-time logic grows (more event types, rooms) it will want its own directory.

# Naming

- File naming is split between two conventions in the same `workers/` folder: `otpWorker.ts` / `messageProcessor.ts` (camelCase) vs `order.worker.ts` / `admin.worker.ts` (dot-case). All four are the same kind of thing (a worker or its helper) with no reason for the split.
- `messageProcessor.ts` name implies it handles all message types; it only handles OTP messages.

# Module Responsibilities

- No controller/route layer forced in — correct, this is a consumer service, not an HTTP API, and it isn't pretending otherwise.
- Business logic (OTP delivery fallback, order/admin event fan-out) lives directly in handlers/workers, which is appropriate at this size.
- The real responsibility gap is consistency of the **error-handling contract** across the three workers, not layering — see Error Handling below.

# Code Style

- Emoji-prefixed console logging is a consistent convention across every file in this service (not inconsistent within worker-service itself) — but it is inconsistent with the *available* structured logger nobody uses.
- `connectRabbitMQ()` is called again inside every message callback across all three workers, purely to fetch a channel that the outer `consumeQueue` call already resolved — same small redundancy copy-pasted three times.
- The `// Fix #2` comment in `socket.ts` (see File Reviews) is the one clear "narrates the edit, not the reasoning" pattern found in this service.

# Architecture

- Consumer → handler → WebSocket-broadcast pipeline is a reasonable shape for this service's job; no unnecessary abstraction layers were added.
- `SocketManager` singleton is a sensible pattern for a single-process WS server; `getInstance()` being called with no `server` arg from the workers (relying on `main.ts` having constructed it first) is implicit init-order coupling, but it's guarded (`if (socketManager)`) at every call site, so it degrades safely rather than throwing.
- Weakest architectural point: identical ack/nack semantics were not decided once and applied everywhere — each worker's error path was seemingly written independently.

# Dependency Review

| Package | Imported symbols | Notes |
|---|---|---|
| `@repo/env-config` | `ENV` | Whole flat object, same as auth-service — worker-service inherits config surface (Stripe, Razorpay, Cloudinary, Meilisearch) it never touches. |
| `@repo/jobs` | `CronManager` | Clean, single entrypoint. |
| `@repo/libs` | `sendEmail`, `sendPhoneOtp`, `redis`, `consumeQueue`, `connectRabbitMQ` | All via documented subpath exports (`/sendMail`, `/sendOtp`, `/redis`, `/rabbitmq`) — this is the package's intended per-module export shape, not a boundary violation. |
| `@repo/db-postgres` | *(declared, unused)* | No import anywhere in `src/` — see Dead Code. |

- No deep imports bypassing a package's declared `exports` map — subpath imports like `@repo/libs/sendMail` are legitimate per that package's `package.json`.
- No circular imports found.
- Hidden coupling found one level down: `packages/libs/src/sendMail/index.ts` defaults `TEMPLATES_DIR` to `path.resolve(__dirname, "../../../apps/auth-service/src/utils/email-templates")` when `EMAIL_TEMPLATES_DIR` isn't set. `otpHandler.ts::handleOtpMessage` → `sendEmail` means this service's OTP email delivery has an undeclared dependency on a folder that physically lives inside `apps/auth-service`, not in a shared package. Moving or restructuring that auth-service folder silently breaks worker-service's email OTP.
- Queue-name contract: `"ORDER_EVENTS"` and `"ADMIN_EVENTS"` are re-typed as raw string literals in `apps/product-service`, `apps/order-service`, and `apps/auth-service` publishers (~10 call sites total) with zero shared constant between any of them and this service's consumers. A typo on either side breaks the pub/sub contract with no compiler safety net. (Publishers themselves are out of audit scope — noted here only because it directly explains a risk in `order.worker.ts`/`admin.worker.ts`.)

# Configuration

- No `.env.example` for this service at all (see File Reviews — Config files).
- `ENV.WORKER_SERVICE_PORT` is defaulted once in `@repo/env-config` (`"6006"`) and defaulted again in `main.ts` (`Number(...) || 6006`) — redundant, pick one layer.
- `@repo/env-config`'s single flat `ENV` object (shared, out of this audit's fix scope) means this service's typed config surface includes every other service's variables (Stripe, Razorpay, Cloudinary, Meilisearch) and will log `❌ ENV MISSING` for unrelated vars this service never uses.

# Error Handling

- **Inconsistent across three near-identical files**: `otpWorker.ts` nacks without requeue on failure (message dropped, no DLQ); `order.worker.ts` and `admin.worker.ts` **ack on failure** (message dropped and marked successful). Neither behavior is fully safe, and there's no evident reason the three differ.
- No dead-letter queue configured anywhere (`@repo/libs/rabbitmq` asserts plain durable queues only) — any dropped message, from either failure path, is gone with no way to inspect or replay it later.
- No retry/backoff at the message-processing level (RabbitMQ reconnect itself does have backoff, in `@repo/libs/rabbitmq`, which is fine).
  - Errors are logged with reasonable context (`console.error("❌ ... event:", error)`), just not typed or structured.

# Logging

- 100% raw `console.log`/`console.warn`/`console.error`, all emoji-prefixed, no structured logger — despite `@repo/libs/logger` (leveled `info`/`warn`/`error`) being one import away and already used inside `@repo/libs/sendMail` and `@repo/libs/sendOtp`, which this service calls directly. Same platform-wide gap flagged in SESSION_04 for auth-service.
- No request/correlation ID on any queue-message log line, so tracing one OTP or order event across the publish → consume → broadcast path means grepping for the raw recipient/order ID.
- No log-level gating — everything logs unconditionally regardless of `NODE_ENV`.

# Type Safety

- `content: any` in `order.worker.ts` and `admin.worker.ts` after `JSON.parse` — no shape validation before property access.
- `payload: any` on every `SocketManager.broadcastTo*` method and `broadcastAll`.
- `(ws as any).__identity` in `socket.ts` instead of adding the field to the already-declared `SocketClient` interface.
- `isValidOtpMessage(data: any)` — appropriate use of `any` for a type-guard's input parameter (the whole point of the guard), not a violation.

# Dead Code

- `src/workers/index.ts` — unused barrel, and incomplete even if it were used (missing `order.worker`/`admin.worker` exports).
- `QUEUE_OPTIONS` in `src/config/queues.ts` — exported, never imported.
- `console.log("Hello Workers")` in `main.ts` — leftover debug line.
- `ws.role` in `socket.ts` — assigned, never read.
- `redis.set("otp_status:...")` in `otpHandler.ts` — written, never read anywhere in scope.
- `@repo/db-postgres` and `node-cron` in `package.json` — declared, never imported directly.
- `apps/worker-service/.DS_Store` — tracked in git despite `.gitignore` excluding it.

# Scalability

- Adding a new queue/event type today means: add a worker file (naming convention TBD, see Naming), hardcode a new queue-name string (no central registry), add another `if (content.type === ...)` branch, and decide error-handling behavior from scratch since the existing three workers don't agree on one. None of this is blocked, but none of it is guided either.
- `SocketManager`'s five near-identical `broadcastTo*` methods mean a sixth role/room type is another full copy-paste rather than a config change.
- Singleton `SocketManager` is fine for a single worker-service process; if this service is ever horizontally scaled, broadcasts (which only reach clients connected to the *same* process) will silently miss clients connected to other instances — no pub/sub fan-out (e.g. Redis pub/sub) backing the WebSocket layer. Not an issue at current scale, worth flagging before scaling this service beyond one instance.

# Human Code Quality

- The WebSocket auth rewrite in `socket.ts` (JWT-verified upgrade, anonymous-safe broadcast exclusion, reject-invalid-token-outright) reflects real, specific threat modeling — not a generic or AI-boilerplate pattern.
- The `// Fix #2` comment describing a previous vulnerability and how it was fixed is the one spot that reads like a carried-over agent/PR note rather than a comment a maintainer would leave for future readers.
- The inconsistent ack/nack behavior across three structurally identical workers reads as three separate, unreviewed edits rather than a deliberate design — plausible either as organic drift or as separately-generated code that was never reconciled.
- Overall: looks human-written and incrementally extended, consistent with the auth-service audit's conclusion — solid core judgment (especially security-sensitive code), rough edges from patching without a final consistency pass, not machine-generated uniformity.

# Prioritised Fixes

See TODO Checklist below — same content, actionable form, ordered most-to-least structurally significant.

# TODO Checklist

- [x] 🔴 `src/workers/order.worker.ts`, `src/workers/admin.worker.ts` Stop calling `channel.ack(msg)` inside the `catch` block — acking on failure silently and permanently discards real-time order/admin events on any processing error.
- [x] 🔴 `src/workers/order.worker.ts`, `src/workers/admin.worker.ts`, `apps/product-service`, `apps/order-service`, `apps/auth-service` Centralize `"ORDER_EVENTS"`/`"ADMIN_EVENTS"` into one shared constant (extend `src/config/queues.ts` and share it, or move to a shared package) — currently duplicated as raw string literals across ~10 call sites in 4 services with no compile-time safety net.
- [x] 🟠 `src/workers/order.worker.ts`, `src/workers/admin.worker.ts` Validate `content` shape (zod or a type guard, matching the OTP pattern) before reading `content.type`/`content.storeId`/etc. — currently untyped `any` off raw `JSON.parse`.
- [x] 🟠 `packages/libs/src/sendMail/index.ts` Move the default email-templates directory out of `apps/auth-service/src/utils/email-templates` into a shared location — worker-service's OTP email path currently has an undeclared dependency on another app's folder.
- [x] 🟠 `src/socket.ts` Collapse `broadcastToStore`/`broadcastToStaff`/`broadcastToSeller`/`broadcastToUser`/`broadcastToAdmin` into one generic `broadcastToRoom(field, id, type, payload)`.
- [x] 🟠 `src/socket.ts` Add `identity?: VerifiedIdentity` to the `SocketClient` interface instead of `(ws as any).__identity`.
- [x] 🟠 `apps/worker-service/package.json` Remove unused direct dependencies `@repo/db-postgres` and `node-cron` (only reached transitively via `@repo/jobs`); add the actually-needed `@repo/db-mongo` if a direct dependency is wanted, or drop all three and rely on `@repo/jobs`'s own dependency graph.
- [x] 🟡 `src/workers/otpWorker.ts` Decide and document a DLQ/retry policy for `nack(msg, false, false)` — currently drops failed OTP messages with no way to inspect or replay them.
- [x] 🟡 `src/workers/otpWorker.ts`, `src/workers/order.worker.ts`, `src/workers/admin.worker.ts` Stop re-calling `connectRabbitMQ()` inside every message callback just to fetch the already-resolved channel. — **Investigated, not changed**: see Completed Changes, this call is load-bearing.
- [x] 🟡 `src/workers/messageProcessor.ts` Rename to reflect it's OTP-only (e.g. `otpMessageProcessor.ts`), or generalize the parse+log pattern so `order.worker.ts`/`admin.worker.ts` reuse it instead of duplicating it inline.
- [x] 🟡 `src/handlers/otpHandler.ts` Confirm an intended reader for the `otp_status:*` Redis key, or remove the write — currently nothing in scope reads it back.
- [x] 🟡 `src/main.ts`, `src/socket.ts`, `src/workers/*.ts`, `src/handlers/otpHandler.ts` Replace raw `console.log`/`warn`/`error` with `@repo/libs/logger`, already used by functions this service calls directly (`sendEmail`, `sendPhoneOtp`).
- [x] 🟡 `apps/worker-service` Add an `.env.example` documenting the vars this service actually reads (directly and transitively): `WORKER_SERVICE_PORT`, `ACCESS_TOKEN_JWT_SECRET_KEY`, `RABBITMQ_*`, `REDIS_DATABASE_URL`, `SMTP_*`/`BREVO_API_KEY`, `FAST2SMS_API_KEY`.
- [x] 🟢 `src/workers/index.ts` Delete this barrel (unused, and incomplete even if it were used) or fix it to re-export all four worker modules and actually import through it from `main.ts`.
- [x] 🟢 `src/config/queues.ts` Remove unused `QUEUE_OPTIONS` export.
- [x] 🟢 `src/main.ts` Remove stray `console.log("Hello Workers")`.
- [x] 🟢 `src/main.ts` Drop the redundant `Number(ENV.WORKER_SERVICE_PORT) || 6006` fallback — `@repo/env-config` already defaults this.
- [x] 🟢 `src/socket.ts` Remove `ws.role` or start using it — currently assigned, never read.
- [x] 🟢 `apps/worker-service/README.md` Replace the default `bun init` template with an actual description of this service (queues consumed, WebSocket auth, env vars).
- [x] 🟢 `apps/worker-service/.DS_Store` Untrack (`git rm --cached`) — already covered by `.gitignore` but was committed before the rule existed. — Already resolved outside this session; file is on disk but correctly untracked/ignored.
- [x] 🟢 `src/workers/*.ts` Standardize file naming — pick either `otpWorker.ts`-style camelCase or `order.worker.ts`-style dot-case, not both in the same folder.

## Newly discovered while fixing (appended)

- [x] 🔴 `packages/libs/package.json` The `./logger` and `./seo` export map entries pointed at `./dist/logger.*` / `./dist/productSeo.*`, but tsup actually builds to `./dist/utils/logger.*` / `./dist/seo/productSeo.*` (it preserves the `src/` subfolder layout). This meant `@repo/libs/logger` and `@repo/libs/seo` **never resolved for any consumer, platform-wide** — a pre-existing, silent, production-affecting bug, not just a worker-service issue. Fixed as a prerequisite for wiring worker-service onto the shared logger; verified via `tsc --noEmit` on both worker-service and auth-service.
- [ ] 🟢 `apps/order-service/src/utils/send-email/index.ts` Reimplements email sending independently of `@repo/libs/sendMail` — its own `nodemailer` transporter, its own `apps/order-service/src/utils/email-templates/order-confirmation.ejs`, and its own `process.cwd()`-based template path (fragile: only correct if the process is launched from the repo root). Duplicate implementation of a concern `@repo/libs/sendMail` already owns. Out of scope for this session (order-service, not worker-service) — flagged for a future pass.
- [ ] 🟡 Run `bun install` at the repo root to refresh `bun.lock` after this session's dependency changes (`apps/worker-service/package.json` dropped `@repo/db-postgres`/`node-cron`; `packages/libs/package.json` gained the `./queues` export and fixed `./logger`/`./seo` paths). Not run in this session since it touches the whole monorepo lockfile — left for the user to run deliberately.

# Completed Changes

- **Ack-on-failure fixed**: `order.worker.ts` and `admin.worker.ts` now `channel.nack(msg, false, false)` on error instead of `ack`, matching `otpWorker.ts`'s existing (correct) behavior. A short comment documents why requeue is `false` (no DLQ configured — see below).
- **Queue names centralized**: added `packages/libs/src/queues/index.ts` exporting `QUEUE_NAMES` (`OTP_QUEUE`, `ORDER_EVENTS`, `ADMIN_EVENTS`), wired up as a new `@repo/libs/queues` subpath export. `src/config/queues.ts` now re-exports it. Updated every hardcoded string-literal call site to use the shared constant: `apps/worker-service/src/workers/{order,admin}.worker.ts`, `apps/auth-service/src/utils/auth.helper.ts`, `apps/auth-service/src/modules/admin/admin.controller.ts`, `apps/auth-service/src/modules/admin/seller-admin.controller.ts`, `apps/auth-service/src/modules/staff/staff.controller.ts`, `apps/product-service/src/controllers/product/{banner,product}.controller.ts`, `apps/order-service/src/controllers/order/{user,seller}.controller.ts`. Verified with `tsc --noEmit` on all four touched services.
- **Payload validation added**: new `src/types/orderEvent.ts` and `src/types/adminEvent.ts` (discriminated unions + type guards, matching the existing `otpMessage.ts` pattern). `order.worker.ts`/`admin.worker.ts` now throw (→ `nack`) on an invalid/unrecognized event shape instead of silently no-op-ing through every `if` branch.
- **sendMail template coupling fixed**: moved the 4 live `.ejs` templates from `apps/auth-service/src/utils/email-templates/` into `packages/libs/src/sendMail/templates/` (git-tracked renames). `TEMPLATES_DIR` now defaults to `path.resolve(__dirname, "templates")`. This also fixed an **active bug**: the old default path (`../../../apps/auth-service/...` from `dist/sendMail/`) was miscounting directory levels and resolved to a nonexistent `packages/apps/...` path — every email send that didn't set `EMAIL_TEMPLATES_DIR` was silently failing template lookup. Build scripts for `@repo/libs` updated to copy `.ejs` files into `dist/sendMail/templates/` on both `build` and `dev`. Verified the fixed path resolves to a real file, and `tsc --noEmit` clean on worker-service and auth-service.
- **socket.ts broadcast methods collapsed**: `broadcastToStore/Staff/Seller/User/Admin` are now thin wrappers around one private `broadcastToRoom(field, id, type, payload)`. `payload` changed from `any` to `unknown` on all broadcast methods.
- **socket.ts identity typing fixed**: `SocketClient` now has a typed `identity?: VerifiedIdentity` field; removed the `(ws as any).__identity` cast at both the write site (`handleUpgrade`) and read site (`connection` handler).
- **Dead `ws.role` field removed**: it was set once and never read; removed from `SocketClient` and the connection handler now that `identity.role` is directly accessible.
- **package.json dependencies cleaned**: removed unused direct `@repo/db-postgres` and `node-cron` from `apps/worker-service/package.json` (both only reached transitively via `@repo/jobs`, which declares them itself).
- **DLQ/retry policy documented**: added a short comment above each `nack(msg, false, false)` call (`otp.worker.ts`, `order.worker.ts`, `admin.worker.ts`) explaining that there's no DLQ yet and requeue is deliberately `false` to avoid infinite reprocessing loops, plus a pointer to where a real DLQ would be added.
- **`connectRabbitMQ()` per-message call — investigated, not changed**: this looked redundant (channel already resolved by the outer `consumeQueue` call), but `@repo/libs/rabbitmq` tracks its channel in a module-level variable that gets **replaced** on reconnect (`connection.on("close", ...)` nulls it out and a new one is created). If a worker captured the channel once at startup instead of re-fetching it per message, `ack`/`nack` would be called on a stale, closed channel after any reconnect. The per-message `connectRabbitMQ()` call is cheap (memoized, no I/O when already connected) and is the correct way to always get the *current* channel. Left unchanged in all three workers; the audit's original framing of this as pure redundancy was wrong.
- **`otp_status:*` Redis key removed**: confirmed via repo-wide grep that nothing reads this key back (a duplicate write-only copy also exists in `apps/notification-service`, left untouched — out of scope). Removed the write and the now-unused `redis` import from `otpHandler.ts`.
- **Structured logging**: replaced every `console.log`/`warn`/`error` in `main.ts`, `socket.ts`, `handlers/otpHandler.ts`, and all files in `workers/` with `@repo/libs/logger`. Fixing this required first fixing the `@repo/libs` export-map bug noted above (the logger was unreachable until then).
- **`.env.example` added** for `apps/worker-service` (there wasn't one) documenting the vars actually read directly and transitively (RabbitMQ, JWT secret, SMTP/Brevo/Fast2SMS, and the Postgres/Mongo URLs the `@repo/jobs` cron jobs need).
- **`src/workers/index.ts` deleted**: confirmed nothing imported from it (`main.ts` imports each worker by direct path); it was also incomplete (missing `order.worker`/`admin.worker` exports).
- **`QUEUE_OPTIONS` removed** from `src/config/queues.ts` — confirmed unused anywhere in the service.
- **`main.ts` cleanup**: removed the stray `console.log("Hello Workers")` and the redundant `Number(ENV.WORKER_SERVICE_PORT) || 6006` fallback (the `|| 6006` was masking the fact `@repo/env-config` already defaults this to `"6006"`).
- **`README.md` rewritten** with an actual description of the service (queues consumed, WebSocket auth model, cron jobs, run commands, pointer to `env.example`).
- **`.DS_Store`**: found already untracked/ignored — no action needed.
- **File naming standardized**: renamed `otpWorker.ts` → `otp.worker.ts` and `messageProcessor.ts` → `otp.processor.ts` (git-tracked renames) so all four files in `src/workers/` follow the same `<domain>.<role>.ts` convention already used by `order.worker.ts`/`admin.worker.ts`. Updated the two import sites (`main.ts`, `otp.worker.ts`).

All changes verified with `tsc --noEmit` on `apps/worker-service` and every other touched service (`apps/auth-service`, `apps/product-service`, `apps/order-service`) — clean in all four. `packages/libs` was rebuilt (`npm run build`) to pick up the new `./queues` export and the `./logger`/`./seo` path fixes.

**Follow-up for the user**: run `bun install` at the repo root to sync `bun.lock` with this session's `package.json` changes (see Newly Discovered Issues above).
