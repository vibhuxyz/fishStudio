# Session 16: Code Style & Structure Audit — `apps/auth-service/`

## 1. Executive Summary
The `apps/auth-service/` codebase acts as the central authentication and identity management service for the platform. It handles authentication for Users, Sellers, Admins, and Staff, integrating robust features like Redis-based rate-limiting, OTP handling, access/refresh token rotation, and RabbitMQ event publishing. 

While the implementation covers many edge cases securely (e.g., Redis locks for cron jobs, token blocklisting, jti-based revocation), the architectural structure **does not currently reflect a senior-level, production-grade SaaS platform**. 
Major issues include:
* **Domain Leaking**: Non-auth concerns (Addresses, Stores, and Abandoned Carts) have heavily leaked into the Auth Service.
* **Fat Controllers**: Business logic, database queries (Prisma), validation, and message queuing are entirely tangled inside Express controllers.
* **Lack of a Service Layer**: There is no separation between HTTP concerns and business rules.
* **Inconsistent Validation**: Some controllers use Zod (`@repo/zod-schema`), while others manually validate properties using `if (!field)`.
* **Type Safety Deficiencies**: Pervasive use of `req: any` instead of properly extending Express `Request` types.

---

## 2. File-by-File Audit

### `apps/auth-service/src/main.ts`
* **Purpose**: Application bootstrap, Express configuration, and scheduled cron jobs.
* **Current Quality**: Poor separation of concerns.
* **Problems Found**:
  * **Mixed Concerns**: The file starts the web server, sets up middleware, connects to RabbitMQ, and runs a Redis-locked cron job inside `app.listen`.
  * **Scalability**: Running cron jobs in the API process is an anti-pattern. Even with a Redis lock, it clutters the entry point.
* **Severity**: High
* **Why This Is a Problem**: Hard to test, increases file complexity, and violates single-responsibility principles.
* **Recommended Improvements**: Extract the cron job into a dedicated `src/workers/cleanup.worker.ts` or similar module. Extract Express setup into `src/app.ts` and keep `main.ts` solely for booting the server.

### `apps/auth-service/src/middleware/rate-limiter.ts`
* **Purpose**: Redis-based rate limiting middleware.
* **Current Quality**: Good Redis utilization, but overly rigid.
* **Problems Found**:
  * **Weak Typing**: Uses `as Record<string, unknown>` and typecasts heavily inside `keyExtractor`.
  * **Rigidity**: Hardcodes limits like `15 * 60 * 1000` rather than pulling them from ENV configuration.
* **Severity**: Medium
* **Why This Is a Problem**: Prevents dynamic adjustments of rate limits without a code deployment.
* **Recommended Improvements**: Move configurations to environment variables. Improve type inference for `req.body` inside `keyExtractor`.

### `apps/auth-service/src/routes/auth.router.ts`
* **Purpose**: Defines all HTTP endpoints.
* **Current Quality**: Monolithic and congested.
* **Problems Found**:
  * **God File**: Consolidates 35+ routes for Users, Admins, Sellers, Staff, Stores, and Carts into a single router.
* **Severity**: High
* **Why This Is a Problem**: Results in merge conflicts in teams and poor navigability.
* **Recommended Improvements**: Split into domain-specific routers: `user.router.ts`, `seller.router.ts`, `admin.router.ts`, `staff.router.ts`, and `store.router.ts`. 

### `apps/auth-service/src/utils/auth.helper.ts`
* **Purpose**: Shared utilities for OTP and validation.
* **Current Quality**: Dumping ground for unrelated logic.
* **Problems Found**:
  * **Mixed Concerns**: Contains crypto timing logic, OTP validation logic, and RabbitMQ publishing logic.
  * **Dead Code**: Contains massive blocks of commented-out code (`handleForgetPassword`, `sendOtpPhone`).
* **Severity**: High
* **Why This Is a Problem**: Unmaintainable file size and mixed responsibilities.
* **Recommended Improvements**: 
  * Remove all commented-out code.
  * Extract OTP logic into `src/services/otp.service.ts`.
  * Move crypto logic to `src/utils/crypto.util.ts`.

### `apps/auth-service/src/utils/tokenRevocation.ts`
* **Purpose**: JWT generation and blocklisting.
* **Current Quality**: Good logic, but merges generation and revocation.
* **Problems Found**:
  * **Empty Catch Blocks**: `catch { // ignore }` is used to swallow errors silently.
  * **Mixed Concerns**: Token creation (`signAccessToken`) and revocation (`revokeToken`) belong to different lifecycle phases.
* **Severity**: Medium
* **Why This Is a Problem**: Swallowed errors make debugging impossible in production.
* **Recommended Improvements**: Add logging to `catch` blocks. Split into `token.generator.ts` and `token.blocklist.ts`.

### `apps/auth-service/src/controller/user.auth.controller.ts`
* **Purpose**: Handles User authentication, profile, and address management.
* **Current Quality**: Fat controller with significant domain bleeding.
* **Problems Found**:
  * **Domain Leak**: Address management (`addUserAddress`, `deleteUserAddress`) has nothing to do with Auth.
  * **Fat Functions**: `verifyOtpAndLogin` and `refreshToken` are massive, deeply nested functions doing DB calls, cache clears, and token creation.
  * **Inconsistent Validation**: Relies on manual `if (!identifier)` checks instead of Zod.
  * **Typing**: Uses `req: any`.
* **Severity**: Critical
* **Why This Is a Problem**: Violates clean architecture. Auth service should only handle identity, not user addresses.
* **Recommended Improvements**: 
  * Move Address management to a `user-service`.
  * Extract business logic to `user.service.ts`.
  * Extend Express `Request` type for type safety.

### `apps/auth-service/src/controller/admin.auth.controller.ts`
* **Purpose**: Handles Admin authentication.
* **Current Quality**: Fat controller, inconsistent implementation.
* **Problems Found**:
  * **Misplaced Logic**: Admin generating a seller code (`generateSellerSignupCode`) should ideally exist in a seller-management context.
  * **Duplication**: Repetitive token generation logic.
* **Severity**: Medium
* **Recommended Improvements**: Extract Prisma queries into an `admin.service.ts`.

### `apps/auth-service/src/controller/staff.auth.controller.ts`
* **Purpose**: Handles Staff authentication.
* **Current Quality**: Better validation (uses Zod), but still a fat controller.
* **Problems Found**:
  * **Mixed Ownership**: Seller updating staff access (`updateStaffAccess`) is present here instead of the Seller domain.
* **Severity**: Medium
* **Recommended Improvements**: Move `updateStaffAccess` and `getMyStaffs` to a `seller.staff.controller.ts`.

### `apps/auth-service/src/controller/seller/auth.controller.ts`
* **Purpose**: Handles Seller authentication.
* **Current Quality**: Extremely bloated (400+ lines).
* **Problems Found**:
  * **God Controller**: Handles seller auth, password resets, and massive conditional store creation blocks.
  * **Infrastructure Leaking**: Directly publishes to `NOTIFICATION_QUEUE` and `ADMIN_EVENTS` inside the controller.
* **Severity**: High
* **Recommended Improvements**: Extract into `seller.service.ts`. Use an event bus adapter so controllers don't directly know about RabbitMQ queues.

### `apps/auth-service/src/controller/seller/store.controller.ts`
* **Purpose**: Handles Store creation, updates, and pincode availability.
* **Current Quality**: Severe architectural boundary violation.
* **Problems Found**:
  * **Domain Leak**: Store creation, updating, and pincode checking **do not belong in the Auth Service**.
* **Severity**: Critical
* **Why This Is a Problem**: Microservices must have bounded contexts. Auth service managing store details creates a distributed monolith.
* **Recommended Improvements**: This entire file must be migrated to a dedicated `store-service` or `seller-service`.

### `apps/auth-service/src/controller/seller/admin.controller.ts`
* **Purpose**: Admin managing sellers.
* **Current Quality**: Boundary violation.
* **Problems Found**:
  * **Misplaced Action**: Admin logic exists inside the `seller` directory.
* **Severity**: Medium
* **Recommended Improvements**: Move to `admin/` module.

### `apps/auth-service/src/controller/cart.controller.ts`
* **Purpose**: Manages abandoned carts.
* **Current Quality**: Severe architectural boundary violation.
* **Problems Found**:
  * **Domain Leak**: Cart operations inside the Auth Service.
* **Severity**: Critical
* **Recommended Improvements**: Migrate to `cart-service` or `order-service`.

### `apps/auth-service/src/controller/later.forget.ts`
* **Purpose**: Legacy forgotten code.
* **Problems Found**: Dead code. 100% commented out.
* **Severity**: Low
* **Recommended Improvements**: Delete the file.

---

## 3. Folder Structure Review
**Current Status**: Unscalable. Everything is dumped into `src/controller` and `src/utils`. 
**Recommendation**: Adopt a module-based structure:
```text
src/
  modules/
    user/
      user.controller.ts
      user.service.ts
      user.router.ts
    seller/
      seller.controller.ts
      seller.service.ts
      seller.router.ts
    admin/
    staff/
  common/
    middleware/
    utils/
```

## 4. File Naming Audit
**Current Status**: Highly inconsistent.
* `later.forget.ts` (dot notation)
* `rate-limiter.ts` (kebab-case)
* `auth.helper.ts` (dot notation)
* `setCookie.ts` (camelCase)

**Recommendation**: Standardize on `kebab-case.suffix.ts`. (e.g., `rate-limiter.middleware.ts`, `set-cookie.util.ts`, `auth.controller.ts`).

## 5. Module Responsibility Audit
**Current Status**: Poor. Controllers are "God files" handling routing, HTTP mapping, validation, Prisma queries, Redis cache invalidation, and RabbitMQ message publishing. Store, Cart, and Address domains have leaked into the Auth service.

## 6. Code Style Audit
**Current Status**: Clear signs of LLM-generated patterns.
* Repetitive implementation patterns.
* LLM-style contextual comments (`// Fix #24:`, `// Fix #11:`).
* Inconsistent validation: Zod is used in seller/staff routes, but manual string checking is used in user/admin routes.
* Empty catch blocks for silent failures.

## 7. Architecture Audit
**Current Status**: Monolithic MVC without the Model/Service layer.
The API Gateway architecture principle is violated because Auth Service is doing the job of Store and Cart services.

## 8. Readability Audit
**Current Status**: Poor in complex endpoints.
* Functions like `refreshToken` (100+ lines) are cognitively heavy.
* Deep nesting in `verifySeller` for store creation logic.

## 9. Dependency Audit
**Current Status**: `prismaMongo` and `redis` leak into every file. 
**Recommendation**: Isolate database/cache logic inside a Repository/Service layer so controllers only orchestrate business logic.

## 10. Configuration Audit
**Current Status**: Mixed usage of `ENV` object and `process.env`. Rate limits are hardcoded magic numbers.

## 11. Error Handling Audit
**Current Status**: Catch blocks appropriately forward to `next(error)`. However, several Redis/Cache operations swallow errors silently via `catch { // ignore }`. 
**Recommendation**: Implement structured logging (e.g., Pino) inside those catch blocks as warnings.

## 12. Logging Audit
**Current Status**: Reliance on `console.log` and `console.error`. 
**Recommendation**: Replace with a structured, production-ready logger.

## 13. Type Safety Audit
**Current Status**: Weak. Massive reliance on `req: any` because custom properties (`req.user`, `req.seller`) are not typed.
**Recommendation**: Augment the Express `Request` interface globally using `declare namespace Express { ... }`.

## 14. Dead Code Audit
**Current Status**: Present. `later.forget.ts` and 60+ lines of commented code in `auth.helper.ts`.

## 15. Scalability Audit
**Current Status**: Monolithic controller structure will break down as the engineering team grows. Domain leaks will prevent true microservice scaling.

## 16. Human Code Quality Assessment
This codebase does **not** currently resemble a repository maintained by experienced senior engineers. It reads like an LLM-assisted MVP built for speed rather than maintainability. The most glaring tell is the lack of a Service layer, the usage of `req: any`, and the complete disregard for microservice boundaries (Cart in Auth Service).

---

## 18. Prioritised Fix List & Sequential Refactoring Roadmap

### Phase 1 — Folder Structure
* Create `src/modules/` directory structure (`user`, `seller`, `admin`, `staff`).
* Move `controller/` files into their respective module directories.
* Move `cart.controller.ts` logic entirely out of Auth Service into `cart-service` (or delete if obsolete).
* Move `store.controller.ts` logic into `seller-service`.
* Remove unnecessary nesting like `src/controller/seller/`.

### Phase 2 — Module Cleanup
* Extract Prisma DB calls and RabbitMQ publishing from all controllers into `*.service.ts` files.
* Controllers should only extract req data, call a service, and format the HTTP response.
* Split `auth.helper.ts` into `otp.service.ts` and `crypto.util.ts` under `src/common/`.
* Remove duplicated helpers.

### Phase 3 — Naming Consistency
* Rename files to kebab-case (e.g., `setCookie.ts` -> `set-cookie.util.ts`).
* Rename folders (e.g., `middleware` -> `middlewares`).
* Rename classes and methods to reflect standard domain language.

### Phase 4 — Code Style Improvements
* Refactor User and Admin controllers to use Zod (`@repo/zod-schema`) for validation.
* Simplify helper methods like `verifyOtpAndLogin`.
* Remove AI-generated comment patterns (`// Fix #X:`).
* Reduce complexity in `refreshToken` logic.

### Phase 5 — Architecture Improvements
* Move Address logic (`addUserAddress`, `deleteUserAddress`) into `user-service`.
* Use an event bus adapter so controllers don't directly know about RabbitMQ queues.
* Improve dependency direction by separating infrastructure (Redis, Prisma) into isolated repository layers.

### Phase 6 — Production Readiness
* Create a `src/types/express.d.ts` file to properly type `req.user`, `req.seller`, `req.admin`, and `req.staff`. Replace all `req: any` with `Request`.
* Replace `console.log` with a structured logger (e.g., Pino).
* Move rate-limiting magic numbers (`15 * 60 * 1000`) to environment variables.
* Add warning logs to currently silent `catch {}` blocks in `tokenRevocation.ts` and controllers.
* Extract the hourly cleanup cron job out of the web process into a standalone worker process or cron file.
