# Session 16: Code Style & Structure Audit — `apps/api-gateway/`

> Note: the brief referenced `app/api-gateway/`. The repository only contains `apps/api-gateway/` (plural, Turborepo convention consistent with every other service in the monorepo). This audit targets that directory. No files or folders outside `apps/api-gateway/` were inspected or referenced.

## 1. Executive Summary

`apps/api-gateway/` is the single entry point that fronts five upstream services (auth, product, order, notification, payment) plus a raw WebSocket proxy to the worker service. The **entire runtime behavior of the gateway lives in one 282-line file**, `src/main.ts`. There is no routing layer, no middleware directory, no config module, and no service abstraction — despite the fact that a *second* file, `src/server.ts`, exists specifically to import from `./config`, `./middleware/*`, and `./routes/*` — none of which exist anywhere in the directory.

This is the single most important finding of this audit: **`src/server.ts` is a broken, uncommitted, non-compiling scaffold** for a modularization effort that was started and abandoned. It is not wired into `package.json` (all scripts — `dev`, `build`, `start` — point at `main.ts`), it is not tracked by git, and if it were ever imported it would fail to build. It currently sits in the codebase as dead weight that will mislead the next engineer who opens the `src/` folder.

Beyond that, `main.ts` itself is functionally competent — HTTPS enforcement, dynamic CORS, rate limiting, HSTS, cookie forwarding, and a hand-rolled WebSocket upgrade proxy are all present and mostly correct — but it reads like an **AI-assisted incremental-patch file** rather than an intentionally designed module: numbered top-level comments (`// 1. HTTPS ENFORCEMENT`, `// 2. DYNAMIC CORS MIDDLEWARE`, … `// 9. WEBSOCKET UPGRADE PROXY`) mark it as a sequence of bolted-on fixes, a stray `// Fix #20:` comment references an issue-tracker numbering scheme that appears nowhere else in the file, and there is at least one clearly dead conditional branch (both arms of an `if/else` do the exact same thing). `README.md` contains two shell commands instead of documentation. `env.example` is out of sync with the code it documents (missing `PAYMENT_SERVICE_URL`, which `main.ts` actually reads). `package.json` declares `@repo/db-mongo` and `@repo/libs` as dependencies that are never imported anywhere in the service.

None of this is catastrophic — the gateway works — but none of it reads like it was written and reviewed by a team maintaining a long-lived production SaaS platform. It reads like a single file that has been repeatedly patched by an assistant without a subsequent human structural pass.

**Top 3 things to fix first:**
1. Delete or finish `src/server.ts` — a broken, unreferenced file must not exist in `src/`.
2. Split `main.ts` into `config/`, `middleware/`, and `routes/` modules (the shape `server.ts` already assumes, but never got built).
3. Fix `env.example` (add `PAYMENT_SERVICE_URL`) and remove unused dependencies (`@repo/db-mongo`, `@repo/libs`) or start using them.

---

## 2. File-by-File Audit

### `apps/api-gateway/src/main.ts`

**Purpose**: The actual, only, functioning entry point of the gateway. Sets up process-level crash handlers, HTTPS/HSTS enforcement, dynamic CORS, cookie parsing, request logging, global rate limiting, a health check, HTTP proxying to five upstream services, and a hand-rolled WebSocket upgrade proxy for the worker service.

**Current Quality**: Functionally solid but structurally a monolith. Every cross-cutting concern a gateway needs is present, but all of it lives in one file with no separation between configuration, middleware, and routing.

**Problems Found**:
- **God file**: one file owns process error handling, CORS policy, HTTPS enforcement, rate limiting, health checking, proxy configuration, route mounting, server startup, and raw WebSocket proxying. Nine distinct responsibilities in 282 lines.
- **Redundant dead branch**: the "DYNAMIC CORS MIDDLEWARE" block (lines 103–107) does
  ```ts
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, next);
  }
  return cors(corsOptions)(req, res, next);
  ```
  Both branches are identical — the `if` is a no-op. Either the special-casing was never finished, or it's leftover from a since-collapsed change.
- **Per-request middleware instantiation**: the CORS middleware is defined as `app.use((req, res, next) => { ...; cors(corsOptions)(req, res, next); })`, which calls the `cors` factory function *on every request* to build a brand-new middleware instance. The `cors` package natively supports a dynamic origin via `origin: (origin, callback) => {...}`, which would let `cors()` be configured **once** at startup instead of re-constructed per request.
- **Weak typing**: `corsOptions: any`, `keyGenerator: (req: any) =>`, and all five `proxyOptions` callback parameters (`headers`, `_userReq`, `userRes`, `_proxyReq`, `proxyRes`, `err`, `res`, `next`) are typed `any`. For a TypeScript project this defeats most of the value of using TS at the gateway boundary.
- **Numbered comment blocks read as an incremental patch log, not a design**: `// 1. HTTPS ENFORCEMENT`, `// 2. DYNAMIC CORS MIDDLEWARE`, `// 3. GLOBAL RATE LIMITER`, … `// 9. WEBSOCKET UPGRADE PROXY`. This numbering does not correspond to any external doc and reads like an AI assistant's internal checklist that was never converted into actual module boundaries.
- **Orphaned reference comment**: `// Fix #20: In production CORS_ORIGINS must be explicit...` references issue/fix numbering that has no corresponding tracker or changelog anywhere in the repo — dead context for future readers.
- **Manual WebSocket proxy (lines 194–279, ~85 lines)**: hand-rolled HTTP/1.1 response-line writing, manual header serialization (`serializeHeaders`), and raw socket piping, implemented with `node:http`/`node:https` directly rather than a maintained proxy library. This is delicate, easy-to-break infrastructure code embedded in the entry point instead of isolated and unit-testable.
- **Inconsistent proxy strategy across services**: four services are proxied via `express-http-proxy`; the worker service alone gets a fully custom WebSocket-capable proxy. There's a real reason (`express-http-proxy` doesn't handle protocol upgrades), but the inconsistency isn't documented anywhere near the routing table, so a future engineer adding a 6th proxied service won't know which pattern to follow or why.
- **Single global rate limit for every proxied route**: one `rateLimit` instance (1000 req/15 min/IP) is applied ahead of `/auth`, `/product`, `/order`, `/notification`, and `/payment` alike. Auth and payment endpoints are exactly the routes that typically need *stricter*, differentiated limits; there's no per-route override.
- **No terminal Express error handler**: `proxyErrorHandler` only covers proxy-layer failures. A synchronous throw inside the CORS or HTTPS-enforcement middleware falls through to Express 5's default handler, which is inconsistent with the structured `{ success: false, message }` shape used elsewhere.
- **Hardcoded default origin list**: eight literal URLs (`localhost`/`127.0.0.1` × ports 3000–3003) instead of a small generated list — pure repetition, easy to get out of sync as new local apps are added.
- **Logging is unstructured**: `morgan("dev")` (a colorized, human-oriented dev format) is used unconditionally, including in production, alongside ad hoc `console.error`/`console.log` calls with emoji prefixes (`❌`, `🚀`). No request IDs, no JSON structure, no log-level distinction.
- **Unused declared dependencies**: `package.json` lists `@repo/db-mongo` and `@repo/libs`, but `main.ts` imports neither. A gateway that proxies requests has no architectural reason to depend on a database package at all — its presence is either dead weight or a sign that something (DB access from the gateway?) was planned and abandoned.

**Severity**: High

**Why This Is a Problem**: A 282-line file mixing nine responsibilities is difficult to review, test, or hand off — any change to rate-limiting risks touching WebSocket code in the same diff. The dead CORS branch and orphaned "Fix #20" comment actively mislead readers about intent. Untyped `any` at the gateway boundary removes the main benefit of using TypeScript here. The unused dependencies inflate the install/build footprint and confuse anyone auditing what the gateway actually touches.

**Recommended Improvements**:
- Split into the structure `server.ts` already implies but never got: `src/config/env.ts` (or reuse `@repo/env-config` directly), `src/middleware/cors.ts`, `src/middleware/https-enforcer.ts`, `src/middleware/rate-limiter.ts`, `src/routes/health.ts`, `src/routes/proxy.ts`, `src/ws/worker-proxy.ts`.
- Replace the per-request `cors(corsOptions)(req,res,next)` construction with a single `cors({ origin: (origin, cb) => cb(null, allowedOrigins.includes(origin)), ... })` configured once at module load.
- Remove the dead `if (req.method === "OPTIONS")` branch entirely — the two arms are identical.
- Remove the `// Fix #20` comment or replace it with a plain statement of the invariant ("CORS_ORIGINS is required in production because...") with no dangling issue reference.
- Type the proxy option callbacks against `express-http-proxy`'s actual types (or narrow, local interfaces) instead of `any`.
- Move the hand-rolled WebSocket proxy into its own module with unit-testable pieces (`serializeHeaders`, `writeBadGateway` are already pure enough to extract and test in isolation).
- Add a route-scoped stricter limiter for `/auth` and `/payment`, distinct from the general limiter.
- Add a catch-all Express error-handling middleware (`(err, req, res, next) => ...`) at the end of the middleware chain.
- Remove `@repo/db-mongo` and `@repo/libs` from `package.json` if truly unused, or replace ad hoc `console.log`/`console.error` with `@repo/libs`'s logger if that's what it provides.

---

### `apps/api-gateway/src/server.ts`

**Purpose**: Unclear / non-functional. Its own header comment states: *"Server bootstrap – moved from main.ts (placeholder). Import actual implementations from new modules."* It attempts to assemble the gateway from `./config`, `./middleware/cors`, `./middleware/rateLimiter`, `./middleware/httpsEnforcer`, `./routes/proxy`, and `./routes/health`.

**Current Quality**: Broken. None of the six imported modules exist anywhere in `apps/api-gateway/src/`. This file cannot compile.

**Problems Found**:
- **Non-existent imports**: `./config`, `./middleware/cors`, `./middleware/rateLimiter`, `./middleware/httpsEnforcer`, `./routes/proxy`, `./routes/health` are all missing from the filesystem. `tsc`/`tsx` would fail on this file immediately if it were ever built or run.
- **Not wired anywhere**: `package.json`'s `dev`/`build`/`start` scripts all target `main.ts`. `server.ts` is not imported by `main.ts` or anything else — it is orphaned.
- **Not committed to git**: `git ls-files` confirms `server.ts` is untracked. It is scratch/in-progress work sitting directly in `src/`, not on a branch or in a draft PR.
- **Duplicates `main.ts`'s responsibility with a different, incompatible shape**: it re-declares `app.listen` and re-implements CORS/rate-limit/HTTPS wiring, but incompletely (it has no WebSocket upgrade handling, no upstream URLs beyond a generic `proxyRouter`, no `dns.setDefaultResultOrder`, no process-level crash handlers).
- **Silent divergence risk**: if a future engineer edits `server.ts` believing it's live (its name suggests it is "the" server file, more so than `main.ts`), they will make changes that never run.

**Severity**: Critical

**Why This Is a Problem**: A source file that cannot compile and isn't referenced by the build is actively dangerous in a shared codebase — it looks authoritative (the name `server.ts` is more conventional than `main.ts` for an entry point) but is completely inert. Anyone who edits it, greps for gateway behavior, or tries to understand "where does the gateway start" will be misled. Leaving broken, uncommitted scaffolding in `src/` is not how a production codebase maintained by multiple engineers should look.

**Recommended Improvements**:
- **Immediate**: either delete this file, or finish the refactor it describes — create the six missing modules (`config.ts`, `middleware/cors.ts`, `middleware/rateLimiter.ts`, `middleware/httpsEnforcer.ts`, `routes/proxy.ts`, `routes/health.ts`) by extracting the corresponding logic out of `main.ts`, then delete `main.ts` and point `package.json`'s scripts at `server.ts`.
- Do not leave both files in the tree simultaneously — a single entry point should exist, and its name should match what `package.json` actually runs.
- If pursuing the split, this is in fact the correct target shape for Phase 1/2 of the roadmap below — `server.ts`'s import list is a nearly complete blueprint for how `main.ts` should be decomposed.

---

### `apps/api-gateway/package.json`

**Purpose**: Package manifest — scripts, dependencies, module exports.

**Current Quality**: Mostly fine; two concrete issues.

**Problems Found**:
- **Unused dependencies**: `@repo/db-mongo` and `@repo/libs` are declared but never imported by `main.ts` (the only real source file). Either dead weight or evidence of unfinished work (e.g., a planned switch to `@repo/libs`'s logger).
- **Library-style `exports` map on a private application**: 
  ```json
  "main": "./dist/main.js",
  "exports": { ".": { "default": "./dist/main.js" } }
  ```
  This is boilerplate appropriate for a *shared package* other workspaces import (`@repo/env-config`, `@repo/libs`, etc.), not for a `private: true` deployable application that nothing else in the monorepo imports. It looks copy-pasted from a package template rather than deliberately authored for this app.

**Severity**: Low

**Why This Is a Problem**: Unused dependencies inflate install size and create false signals about what the gateway depends on architecturally (a gateway depending on `db-mongo` looks like it does direct DB access, which it doesn't). The `exports` map is harmless but is a tell that this file was templated rather than reviewed.

**Recommended Improvements**: Remove `@repo/db-mongo` and `@repo/libs` if genuinely unused (confirm first — grep the whole `apps/api-gateway` tree, which was already done for this audit and returned zero hits). Drop the `exports`/`main` fields unless another workspace package actually imports `@repo/api-gateway` as a library (unlikely for a deployable app).

---

### `apps/api-gateway/tsconfig.json`

**Purpose**: TypeScript compiler configuration, extending the shared `@repo/typescript-config/base.json`.

**Current Quality**: Clean, minimal, conventional monorepo config. No issues found.

**Problems Found**: None.

**Severity**: N/A

**Recommended Improvements**: None.

---

### `apps/api-gateway/README.md`

**Purpose**: Should document what the gateway is, how to run it, and its configuration. Currently contains:
```
bun add -d globals
bun add -d eslint
```

**Current Quality**: Not documentation. This is two leftover terminal commands, not a README.

**Problems Found**:
- **Wrong content entirely**: no description of the service, no setup instructions, no explanation of the proxy routes, env vars, or how to run it locally. Two `bun add` commands with no explanation of why they're there or whether they've already been run (the dependencies they reference — `globals`, `eslint` — don't even appear in `package.json`).

**Severity**: Medium

**Why This Is a Problem**: For a service acting as the single entry point to five other services, a missing README means every new engineer has to reverse-engineer routing/config behavior directly from `main.ts`. The current content is actively confusing — it looks like a copy-paste accident (terminal history pasted into the wrong file).

**Recommended Improvements**: Replace with an actual README covering: what the gateway does, which routes proxy to which service, required environment variables (cross-reference `env.example`), how CORS/rate-limiting/HTTPS behavior differs between dev and production, and how to run it locally (`bun run dev`).

---

### `apps/api-gateway/env.example`

**Purpose**: Documents the environment variables the gateway (and, apparently, sibling services) need.

**Current Quality**: Mostly accurate but out of sync with the code, and mixes concerns that belong to other services.

**Problems Found**:
- **Missing a variable the code actually reads**: `main.ts` reads `ENV.PAYMENT_SERVICE_URL` (line 137) to build `paymentUrl`, but `PAYMENT_SERVICE_URL` does not appear anywhere in `env.example`. Anyone bootstrapping the gateway from this file alone will silently fall back to the hardcoded `http://localhost:6007` default with no indication that's happening.
- **Includes variables the gateway itself never reads**: `AUTH_SERVICE_PORT`, `PRODUCT_SERVICE_PORT`, `ORDER_SERVICE_PORT`, `NOTIFICATION_SERVICE_PORT`, `WORKER_SERVICE_PORT` are *port* variables for other services' own processes — `main.ts` only ever reads the corresponding `*_SERVICE_URL` variables. Including the other services' `PORT` variables here is scope leakage from a shared root `.env.example`, not something specific to what the gateway consumes.

**Severity**: Medium

**Why This Is a Problem**: An env example that's out of sync with the code it's meant to document is worse than no example at all — it gives false confidence. Missing `PAYMENT_SERVICE_URL` specifically is a real gap: production payment routing depends on it being set correctly, and there's nothing here to prompt an operator to set it.

**Recommended Improvements**: Add `PAYMENT_SERVICE_URL=http://localhost:6007`. Remove the `*_SERVICE_PORT` entries that the gateway process itself never reads (keep only `API_GATEWAY_PORT` and the `*_SERVICE_URL` variables it actually consumes), or if this file is intentionally meant to double as a shared reference for local dev of the whole stack, say so explicitly at the top of the file.

---

### `apps/api-gateway/.gitignore`

**Purpose**: Standard ignore rules (node_modules, dist, logs, env files, IDE/OS artifacts).

**Current Quality**: Fine, conventional. No issues.

**Severity**: N/A

---

### `apps/api-gateway/src/assets/.gitkeep`

**Purpose**: Unclear. An `assets/` folder with nothing but a `.gitkeep` placeholder.

**Current Quality**: Dead/misplaced.

**Problems Found**: An API gateway has no reason to hold "assets" (that's a frontend/static-file concept). Nothing in `main.ts` references `src/assets`. This folder appears to be leftover from a shared app template applied uniformly across the monorepo's `apps/*` packages, not something intentionally created for this service.

**Severity**: Low

**Why This Is a Problem**: An empty, purposeless folder adds noise to the tree and invites the question "what goes here?" with no answer.

**Recommended Improvements**: Delete `src/assets/` unless there's a concrete forthcoming use (e.g., static error pages served on proxy failure — in which case, name it for that purpose and use it).

---

## 3. Folder Structure Review

Current structure:
```
apps/api-gateway/
├── env.example
├── package.json
├── README.md
├── tsconfig.json
└── src/
    ├── assets/.gitkeep
    ├── main.ts
    └── server.ts
```

This is not really a "folder structure" — it's two competing flat files. Problems:
- **No `middleware/`, `routes/`, or `config/` directories exist**, despite `server.ts` assuming they do. The structure a modular gateway needs was designed (in the import list of `server.ts`) but never built.
- **Two entry points** (`main.ts`, `server.ts`) with no indication which is canonical outside of reading `package.json`.
- **`src/assets/` is misplaced** — not applicable to a gateway service (see above).

**Recommended target structure**:
```
apps/api-gateway/
├── env.example
├── package.json
├── README.md
├── tsconfig.json
└── src/
    ├── main.ts                    # boot only: create app, listen, wire shutdown
    ├── config/
    │   └── env.ts                 # upstream URLs, allowed origins, port — derived from @repo/env-config
    ├── middleware/
    │   ├── cors.ts
    │   ├── https-enforcer.ts
    │   ├── rate-limiter.ts
    │   └── error-handler.ts
    ├── routes/
    │   ├── health.ts
    │   └── proxy.ts               # mounts the 5 express-http-proxy routes
    └── ws/
        └── worker-proxy.ts        # the hand-rolled upgrade proxy, isolated
```
This is exactly the shape `server.ts` already presumes — the fix is to actually build it, not invent a new one.

---

## 4. File Structure Review

At the top level, `apps/api-gateway/` mirrors the flat convention used by other apps in the monorepo (`env.example`, `package.json`, `README.md`, `tsconfig.json` at the root, source under `src/`) — that part is consistent. The problem is entirely inside `src/`, where the two-entry-point situation and the empty `assets/` folder are the only structural issues, both covered above.

---

## 5. Naming Audit

- `main.ts`, `server.ts` — both plausible entry-point names used simultaneously; this is a naming *collision of intent*, not a casing inconsistency. Casing itself (`camelCase.ts` filenames) is consistent between the two files.
- Variable naming inside `main.ts` is consistent (`camelCase` throughout: `allowedOrigins`, `defaultLocalOrigins`, `proxyOptions`, `writeBadGateway`, `serializeHeaders`).
- No snake_case, kebab-case, or PascalCase filenames present — too few files to show real inconsistency, but also too few files to prove a convention is actually enforced anywhere (e.g., via ESLint filename rules — no ESLint config exists in this package at all, see §6/§14).

**Verdict**: No casing inconsistencies found. The one real naming problem is `main.ts` vs. `server.ts` both claiming to be the entry point.

---

## 6. Module Responsibility Audit

- **`main.ts` is the God file** described in §2 — nine responsibilities in one module (process handlers, CORS, HTTPS, rate limiting, health check, proxy config, route mounting, server startup, WebSocket proxying).
- **No service layer, no repository layer** — appropriate for a gateway (it shouldn't have business logic or data access), which makes the declared-but-unused `@repo/db-mongo` dependency all the more out of place; its presence suggests domain/infrastructure boundaries were at some point blurred or considered, then abandoned.
- **No utility dumping ground exists** — there's no `utils/` folder at all, which is fine at this size, but `serializeHeaders`/`writeBadGateway`/`allowedOrigins` computation are all inline in `main.ts` and would become exactly that kind of dumping ground if the file grows further without being split first.
- **Validation and execution are not mixed** — there's no request-body validation in a gateway that doesn't parse bodies (`parseReqBody: false`), which is correct for a pure proxy.

---

## 7. Code Style Audit

Indicators that this file was iteratively patched (likely with AI assistance) rather than designed as a whole, specifically:
- Sequential numbered section comments (`// 1.` through `// 9.`) that read like a checklist an assistant worked through, not a structure a human would organize a file around from the start.
- A dead `if/else` with identical branches (§2, `main.ts`) — a classic sign of a change that was applied and then partially reverted or never followed through, rather than something a human would write from scratch.
- A stray `// Fix #20:` comment referencing an external numbering scheme with no other trace in the repository — looks like a comment generated to explain "why" for a specific patch request, then left in verbatim.
- Emoji-prefixed console logs (`❌`, `🚀`) — a very recognizable LLM-assistant formatting habit, not typical of hand-written production logging (which usually specifies a level and, ideally, is structured/JSON rather than decorated for terminal readability).
- `server.ts`'s own header comment literally narrates its own incompleteness ("moved from main.ts (placeholder). Import actual implementations from new modules.") — this is a to-do note left in code, not a description of what the code does.
- The README containing raw shell history instead of documentation is consistent with content having been pasted in without review.

None of this means the code doesn't work — it does. But collectively these are strong signals that this package has not yet had a deliberate, human structural/editorial pass since it was last substantially changed.

---

## 8. Architecture Audit

Separation between layers, evaluated against the categories in the brief:
- **API layer / routing**: not separated — proxy route mounting lives inline in `main.ts` (lines 179–183).
- **Middleware**: not separated into files — CORS, HTTPS enforcement, and rate limiting are all inline closures in `main.ts`.
- **Services**: N/A — correctly, a gateway shouldn't have a service layer of its own; it delegates to upstream services entirely.
- **Repositories / infrastructure**: none should exist here, and mostly none do — except the unexplained `@repo/db-mongo` dependency.
- **Configuration**: partially centralized via `@repo/env-config` (good — the gateway doesn't invent its own env parsing), but the *derived* config (allowed origins list, upstream URL fallbacks) is computed inline in `main.ts` rather than in a dedicated config module.
- **Domain logic**: none present, correctly — a gateway shouldn't have domain logic, and doesn't.
- **Integrations**: the five upstream HTTP proxies and one WebSocket proxy are the gateway's entire "integration surface," and all six are defined in the same file with two different implementation strategies (library-based vs. hand-rolled) and no shared abstraction between them.
- **Messaging**: none present — appropriate, a gateway shouldn't own message-queue concerns.

**Architectural smell**: the biggest one is structural, not conceptual — the *intended* architecture (config/middleware/routes separation) is legible from `server.ts`'s import list, but was never actually built. The conceptual architecture (proxy-only, no business logic) is sound.

---

## 9. Dependency Direction Audit

- No circular imports possible at this size (two files, neither imports the other).
- No hidden coupling detected between `main.ts` and other workspace packages beyond `@repo/env-config`, which is the correct, intentional coupling for a gateway (centralized env parsing/validation).
- **Unused dependency risk**: `@repo/db-mongo` being declared but unimported is the one dependency-direction concern worth flagging — if it were ever used, a gateway importing a database package directly would be a serious violation of "gateway proxies, it doesn't touch data," and its mere presence in `package.json` invites that mistake in a future PR.
- `express-http-proxy` handles 5 of 6 upstream integrations; raw `node:http`/`node:https` handles the 6th (WebSocket). This isn't a bad dependency direction, but it is an unexplained asymmetry a new engineer would have to rediscover by reading the whole file.

---

## 10. Configuration Audit

- Environment variables are read through `@repo/env-config`'s `ENV` object — good, centralized, not scattered `process.env` calls.
- Upstream service URL fallbacks (`|| "http://localhost:6001"`, etc.) are hardcoded directly in `main.ts` rather than defined alongside the rest of the config layer — six magic-URL fallbacks embedded in the middle of the entry-point file.
- `CORS_ORIGINS` has a documented hard-fail-in-production check (the "Fix #20" comment) — this is actually a *good* pattern (fail loud rather than silently falling back to permissive localhost CORS in prod) but it's oddly the only environment variable given this treatment; none of the five service URLs get the same "must be explicit in production" treatment, even though a missing `PAYMENT_SERVICE_URL` in production would silently proxy to `localhost:6007`, which will simply fail — a worse failure mode (mysterious 502s) than a clear startup error.
- No `.env.production.example` or documented required-vs-optional variable distinction — `env.example` presents everything as equally optional-looking.

**Recommendation**: apply the same "required in production, hard-fail if missing" pattern already used for `CORS_ORIGINS` to the upstream service URLs, and centralize all of this derivation (fallback defaults, production requirement checks) into one `config/env.ts` module instead of inline in `main.ts`.

---

## 11. Error Handling Audit

- **Proxy errors**: handled consistently via `proxyErrorHandler`, returning a structured `502 { success: false, message }` — good, consistent shape.
- **WebSocket proxy errors**: handled separately with `writeBadGateway`, which writes a raw HTTP response over the socket rather than JSON — reasonable given the transport, but worth noting the *shape* of error responses differs between the HTTP-proxy path and the WS-proxy path, and there is no shared error-response contract between them.
- **No top-level Express error-handling middleware**: if a synchronous exception is thrown anywhere in the CORS/HTTPS/rate-limit middleware chain (all inline closures with no try/catch), Express's default handler takes over, producing an unstructured HTML/plaintext error rather than the `{ success: false, message }` shape used elsewhere. This is the one real inconsistency in an otherwise reasonable approach.
- **Process-level handlers**: `uncaughtException`/`unhandledRejection` are logged but do not exit the process. For a stateless proxy this is a defensible choice (staying up is often better than crash-looping), but it's undocumented as a deliberate decision — worth a one-line comment stating that's intentional, so a future engineer doesn't "fix" it into a `process.exit(1)` that turns a recoverable error into a full outage.

---

## 12. Logging Audit

- `morgan("dev")` is used for all environments, including production — the "dev" format is colorized and designed for terminal readability, not for log aggregation. There is no `isProduction` branch selecting a `"combined"` or JSON-structured format, despite `isProduction` already being computed and used elsewhere in the same file.
- All other logging is ad hoc `console.log`/`console.error`, with emoji prefixes and no log levels, no request correlation IDs, and no structured fields (service name, upstream target, latency).
- Given `@repo/libs` is a declared (but unused) dependency, it's plausible a shared logger exists there and was simply never wired in — worth checking before building a new one.

**Recommendation**: pick a single logging strategy — either `morgan("combined")` + a structured JSON logger in production, or adopt whatever `@repo/libs` already offers if it includes a logger — and apply it consistently, removing the emoji-decorated `console.*` calls in favor of leveled, structured log lines.

---

## 13. Type Safety Audit

- `any` appears in the highest-traffic paths of the file: the dynamically-built `corsOptions`, the rate-limiter's `keyGenerator`, and every callback parameter in `proxyOptions` (`headers`, `_userReq`, `userRes`, `_proxyReq`, `proxyRes`, `err`, `res`, `next`).
- No `Enum`/`Pydantic`-equivalent typed config object exists for the five upstream URLs — they're five loose `const` string variables (`authUrl`, `productUrl`, etc.) rather than a single typed `UpstreamServices` shape, which would make it structurally impossible to forget one when adding rate-limit overrides or logging per-service.
- `env.example`'s drift from actual usage (§2) is itself a type-safety-adjacent problem: nothing enforces that `ENV.PAYMENT_SERVICE_URL` is documented or required, because there's no schema-level contract between `@repo/env-config` and this file beyond whatever validation lives inside that shared package (out of scope for this audit).

**Recommendation**: type the `express-http-proxy` callback signatures properly (the package ships types — `@types/express-http-proxy` is already a devDependency in `package.json`, so this is available now, just unused). Replace the five loose URL constants with a single typed object built in the proposed `config/env.ts`.

---

## 14. Dead Code Audit

- **`src/server.ts`** — the headline finding of this audit. Entirely dead: unreferenced, uncommitted, non-compiling.
- **The identical-branch `if (req.method === "OPTIONS")`** in `main.ts` (§2) — functionally dead conditional logic.
- **`src/assets/.gitkeep`** — an empty, unused, purposeless folder.
- **`@repo/db-mongo`, `@repo/libs`** in `package.json` — unused dependencies (confirmed via grep across all source files in the package).
- **`README.md`'s content** — not dead code per se, but functionally dead documentation (doesn't describe the actual system).

---

## 15. Scalability Audit

Will the current shape support growth in the dimensions the brief asks about?
- **Additional APIs/services**: adding a 6th proxied HTTP service today means adding one more `app.use("/x", proxy(xUrl, proxyOptions))` line plus one more URL constant — cheap today, but every addition grows the single God file further. Fine at 5 services; will not scale gracefully to 10+.
- **Additional middleware**: any new cross-cutting concern (e.g., request-ID injection, API-key auth for internal service-to-service calls) has to be inserted into the same flat `app.use()` chain in `main.ts`, with no natural home.
- **Multiple auth providers**: N/A at the gateway layer today (auth is delegated entirely to `auth-service`), which is architecturally correct and should stay that way — the gateway should not become an auth decision point.
- **Multiple repositories**: none exist and none should — flagged only because of the stray `@repo/db-mongo` dependency suggesting this boundary was at some point unclear.
- **Larger engineering teams**: this is the real bottleneck. A single 282-line file with 9 responsibilities is a merge-conflict magnet the moment more than one engineer touches gateway behavior concurrently (e.g., one person adjusting rate limits while another adjusts CORS origins — both edits land in the same 100-line region of the same file). Splitting into the `config/middleware/routes` structure `server.ts` already assumes directly addresses this.

---

## 16. Human Code Quality Assessment

This does not read as a codebase shaped by a deliberate architectural decision followed by careful implementation. It reads as a working file that has been repeatedly and correctly patched — CORS bugs fixed, HTTPS enforcement added, HSTS added, cookie forwarding fixed, WebSocket support added — without a subsequent pass to re-organize the file to match its growing responsibilities. Concrete signals, restated from above:
- Numbered comment sections functioning as an informal table of contents for a file that should have been split into actual files.
- A dead conditional branch left in place after (presumably) a change that made both arms equivalent.
- A stray, unexplained "Fix #20" reference.
- Emoji-decorated console logging.
- A README containing shell history instead of documentation.
- A second entry-point file that describes, in its own header comment, an incomplete migration — and was never finished or removed.

None of these are signs of incompetence — the actual proxy/CORS/HTTPS/WebSocket logic is correct and handles real edge cases well (Set-Cookie header forwarding without merging, `x-forwarded-proto` handling behind a load balancer, IPv4-first DNS resolution for upstream calls, graceful handling of proxy errors). The gap is entirely between **"this works"** and **"this is organized the way a team of senior engineers maintaining this for years would leave it."** The fastest way to close that gap is Phase 1–2 of the roadmap below: finish (or delete) `server.ts`, and give `main.ts`'s nine responsibilities nine separate homes.

---

## 17. Prioritised Fix List

| # | Item | File(s) | Severity |
|---|------|---------|----------|
| 1 | Delete or finish the broken, uncommitted `server.ts` scaffold | `src/server.ts` | Critical |
| 2 | Split `main.ts` into config/middleware/routes modules | `src/main.ts` | High |
| 3 | Fix `env.example` — add missing `PAYMENT_SERVICE_URL` | `env.example` | Medium |
| 4 | Replace README content with real documentation | `README.md` | Medium |
| 5 | Remove the dead identical-branch `if (OPTIONS)` conditional | `src/main.ts` | Low-Med |
| 6 | Remove unused `@repo/db-mongo` / `@repo/libs` dependencies (or use them) | `package.json` | Low-Med |
| 7 | Replace per-request `cors()` instantiation with a single dynamic-origin config | `src/main.ts` | Medium |
| 8 | Add typed proxy-callback signatures instead of `any` | `src/main.ts` | Medium |
| 9 | Add a top-level Express error handler | `src/main.ts` | Medium |
| 10 | Switch `morgan` and console logging to a structured, production-appropriate strategy | `src/main.ts` | Low |
| 11 | Remove empty `src/assets/` folder | `src/assets/.gitkeep` | Low |
| 12 | Extract WebSocket upgrade proxy into its own testable module | `src/main.ts` | Medium |
| 13 | Add per-route rate-limit overrides for `/auth` and `/payment` | `src/main.ts` | Medium |

---

## Sequential Refactoring Roadmap

### Phase 1 — Folder Structure
- Resolve the `main.ts` vs. `server.ts` conflict first, before anything else: pick one canonical entry point.
  - Recommended: delete `src/server.ts` (it currently duplicates, incompletely, what `main.ts` already does correctly) and treat its import list as the target module map for Phase 2.
- Create the target directories: `src/config/`, `src/middleware/`, `src/routes/`, `src/ws/`.
- Remove `src/assets/` (unused).
- No behavior changes in this phase — purely directory scaffolding plus deletion of dead files. Safe to do without touching runtime logic.

### Phase 2 — Module Cleanup
- Extract from `main.ts` into the new structure, one concern at a time, verifying the gateway still boots after each extraction:
  1. `src/config/env.ts` — upstream service URLs (with typed shape + production-required checks matching the existing `CORS_ORIGINS` pattern), `allowedOrigins` derivation, `port`.
  2. `src/middleware/https-enforcer.ts` — the HTTPS redirect + HSTS middleware.
  3. `src/middleware/cors.ts` — rebuilt as a single `cors({ origin: (origin, cb) => ... })` call configured once, not per-request.
  4. `src/middleware/rate-limiter.ts` — the global limiter, plus new stricter limiters for `/auth` and `/payment`.
  5. `src/routes/health.ts` — the `/gateway-health` route.
  6. `src/routes/proxy.ts` — the five `express-http-proxy` mounts and shared `proxyOptions`.
  7. `src/ws/worker-proxy.ts` — the WebSocket upgrade handler (`writeBadGateway`, `serializeHeaders`, and the `server.on("upgrade", ...)` handler).
- `main.ts` ends up as boot-only: construct the app, apply middleware in order, mount routes, `listen`, wire the WS upgrade handler, and register process-level crash handlers.
- Remove the dead `if (OPTIONS)` branch and the "Fix #20" comment reference during this pass (they'll be touched anyway as CORS logic moves).

### Phase 3 — Naming Consistency
- No filename casing issues to fix — this phase is mostly about giving newly extracted modules clear, purpose-matching names (`https-enforcer.ts`, not `httpsMiddleware.ts` vs. `enforceHttps.ts` — pick one convention and apply it across all new `middleware/*` files).
- Rename the five loose URL constants (`authUrl`, `productUrl`, etc.) into a single typed `upstreamServices` object as part of the `config/env.ts` extraction.

### Phase 4 — Code Style Improvements
- Remove emoji-prefixed `console.log`/`console.error` calls; replace with leveled, structured logging (see Phase 6 for the final logging decision).
- Replace `any` types in `corsOptions`, `keyGenerator`, and all `proxyOptions` callbacks with proper types from `@types/express-http-proxy` (already a devDependency) and `express-rate-limit`.
- Simplify the hardcoded 8-entry `defaultLocalOrigins` array into a small generated list if desired (low priority, cosmetic).

### Phase 5 — Architecture Improvements
- Apply the same "required in production, hard-fail if missing" validation already used for `CORS_ORIGINS` to the upstream service URLs in `config/env.ts`, so a missing `PAYMENT_SERVICE_URL` in production fails at startup instead of producing mysterious 502s at request time.
- Add a top-level Express error-handling middleware in `main.ts` so unhandled synchronous errors in any middleware produce the same `{ success: false, message }` shape as proxy errors.
- Document (in code comments or the new README) why the worker service alone uses a hand-rolled WebSocket proxy while others use `express-http-proxy`, so the next engineer adding a proxied service knows which pattern applies.

### Phase 6 — Production Readiness
- Finalize the logging strategy: either confirm `@repo/libs` has nothing usable here and adopt `morgan("combined")` + a structured JSON console logger for production (keep `morgan("dev")` for local dev only, gated on `isProduction`), or wire in `@repo/libs` if it does provide a logger — resolve the currently-unused dependency either way.
- Remove `@repo/db-mongo` and `@repo/libs` from `package.json` if a final check confirms they remain unused after Phases 1–5.
- Rewrite `README.md` with real setup/routing/config documentation.
- Fix `env.example` (add `PAYMENT_SERVICE_URL`, trim unused `*_SERVICE_PORT` entries not read by this service).
- Final pass: confirm no dead code remains (re-run the same grep-based checks used in this audit), confirm `npm run build`/`tsc` succeeds cleanly with the new module structure, and confirm the gateway still proxies all five services and the worker WebSocket correctly in local dev before merging.
