# FishStudio — Premium Meat & Fish E-Commerce Platform

A production-grade, full-stack e-commerce platform built as a **Turborepo monorepo** with microservices architecture. Designed for the Indian meat & fish market with instant delivery UX, real-time order tracking, multi-role dashboards, and sub-second perceived load times.

---

## Table of Contents

1. [What This App Does](#what-this-app-does)
2. [How the App Works (Architecture)](#how-the-app-works)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [All API Routes](#all-api-routes)
6. [Frontend Routes](#frontend-routes)
7. [Database Schema](#database-schema)
8. [Authentication & Authorization](#authentication--authorization)
9. [Performance: Where & How](#performance-where--how)
10. [Real-Time: WebSockets](#real-time-websockets)
11. [Search: Meilisearch](#search-meilisearch)
12. [Message Queue: RabbitMQ](#message-queue-rabbitmq)
13. [Image Handling](#image-handling)
14. [Email / SMS / Push Notifications](#email--sms--push-notifications)
15. [Docker & Deployment](#docker--deployment)
16. [Environment Variables](#environment-variables)
17. [Getting Started (Local Dev)](#getting-started-local-dev)

---

## What This App Does

FishStudio is a **multi-vendor e-commerce platform** for premium seafood and meat with three distinct user roles:

- **Customers** browse products, search by category, add to cart, checkout, track orders in real time, and manage saved addresses.
- **Sellers** manage their store, create/list products from a catalog, upload banners, run discount events, view analytics, and manage staff.
- **Admins** approve sellers, manage the global product catalog, review banners, issue signup access codes, monitor all orders and payments across sellers, and configure categories.

Key capabilities:
- OTP-based user login (phone/email) — no passwords for shoppers
- Catalog + store-variant product model (admin creates master catalog, sellers create their own pricing/stock variants)
- Real-time order status updates via WebSocket
- Meilisearch-powered product search with typo-tolerance and Redis caching
- Stripe + COD payment support
- India-specific: 6-digit pincode serviceability checks, city/delivery-time configuration per store
- Seller-controlled events (flash sales, free delivery, bulk discounts)
- Staff sub-accounts with granular access under a seller

---

## How the App Works

### Request Flow

```
Browser / Mobile
      │
      ▼
API Gateway (port 8080)          ← Single entry point, HTTP proxy
      │
      ├─── /auth/*   ──────────▶  Auth Service    (port 6001)  MongoDB
      ├─── /product/* ─────────▶  Product Service (port 6003)  MongoDB + Meilisearch + Redis
      ├─── /order/*  ──────────▶  Order Service   (port 6004)  PostgreSQL
      ├─── /notification/* ────▶  Notification Service (6005)  PostgreSQL
      └─── WebSocket upgrade ──▶  Worker Service  (port 6006)  (pure WS, no HTTP)

                Order/OTP events published via RabbitMQ
                         │
                         ▼
                   Worker Service
                   (consumes queues, broadcasts to WebSocket clients)
```

### Monorepo Structure

Managed by **Turborepo** with **Bun** as the package manager. Build order is resolved by dependency graph — shared packages are compiled before apps.

```
fishStudio/
├── apps/
│   ├── api-gateway/          # Express HTTP proxy (port 8080)
│   ├── auth-service/         # Authentication, users, sellers, staff (port 6001)
│   ├── product-service/      # Catalog, search, banners, coupons (port 6003)
│   ├── order-service/        # Orders, payments, stats (port 6004)
│   ├── notification-service/ # In-app notifications (port 6005)
│   ├── worker-service/       # WebSocket server + RabbitMQ consumers (port 6006)
│   ├── user-ui/              # Next.js 16 consumer storefront (port 3000)
│   ├── seller-ui/            # Next.js 16 seller dashboard (port 3002)
│   └── admin-ui/             # Next.js 16 admin panel (port 3001)
│
└── packages/
    ├── db-mongo/             # Prisma client + schema for MongoDB
    ├── db-postgres/          # Prisma client + schema for PostgreSQL
    ├── env-config/           # Centralized env variable loader
    ├── error-handlers/       # Custom error classes + Express middleware
    ├── eslint-config/        # Shared ESLint rules
    ├── jobs/                 # CronManager for scheduled tasks
    ├── libs/                 # Redis, RabbitMQ, Cloudinary, OTP, Meilisearch clients
    ├── middlewares/          # JWT auth + role-based access middleware
    ├── typescript-config/    # Shared tsconfig bases
    ├── ui/                   # Shared Shadcn UI components
    └── zod-schema/           # Shared Zod validation schemas & TypeScript types
```

---

## Tech Stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, React Server Components) |
| Runtime | React 19.2 |
| Build / HMR | Turbopack |
| UI Primitives | Shadcn UI (Radix UI) |
| Animations | Framer Motion |
| Styling | Tailwind CSS 3.4 |
| State | Zustand (cart, auth, addresses) |
| Data Fetching | TanStack Query v5 (React Query) |
| Forms | React Hook Form 7 + Zod |
| Charts | Recharts + ApexCharts |
| HTTP Client | Axios |
| Rich Text Editor | react-quill-new (admin) |
| Toast | Sonner |
| Dark Mode | next-themes |
| Carousel | Embla Carousel |
| Maps | react-simple-maps |
| Date Utilities | date-fns 4 |

### Backend Services

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 5.2 |
| Language | TypeScript 5.9 |
| Bundler | tsup |
| Executor (dev) | tsx |
| Password Hashing | Argon2 |
| JWT | jsonwebtoken |
| Request Security | helmet, express-rate-limit |
| HTTP Proxy | express-http-proxy (API Gateway) |
| Logging | morgan |
| Validation | Zod |

### Databases

| Store | Technology | Purpose |
|---|---|---|
| MongoDB | Prisma ODM | Users, sellers, staff, stores, products catalog, images, banners, events, coupons |
| PostgreSQL | Prisma ORM | Orders, order items, payments, coupon usages, notifications |

Hybrid read/write: product catalog lives in MongoDB (flexible schema), transactional order data lives in PostgreSQL (ACID guarantees).

### Infrastructure

| Layer | Technology |
|---|---|
| Cache | Redis (ioredis 5) — auth tokens, search results, OTP |
| Search | Meilisearch 0.47 — full-text, typo-tolerant product search |
| Message Queue | RabbitMQ 3 — async OTP delivery, order event broadcasting |
| CDN / Images | Cloudinary |
| Payments | Stripe |
| Email | Nodemailer (SMTP) or Brevo API |
| SMS | Fast2SMS API |
| Push Notifications | Expo Server SDK 3.11 |
| Containers | Docker Compose |
| CI/CD | GitHub Actions → Docker Hub → SSH deploy to Droplet |
| Monorepo | Turborepo |
| Package Manager | Bun 1.3.10 |

---

## Project Structure

### Backend Services Roles

#### `apps/api-gateway`
Single entry point for all HTTP traffic. Uses `express-http-proxy` to forward requests to internal services. Handles WebSocket upgrade forwarding to the worker service. Applies global rate limiting.

#### `apps/auth-service`
Owns all identity: user OTP login, seller/admin registration, staff sub-accounts, store creation, pincode serviceability, seller approval flow. Uses Argon2 for password hashing, JWT for sessions, Redis for token caching.

#### `apps/product-service`
Product catalog management, store variant creation, Meilisearch indexing, Redis-cached search, category/subcategory config, coupon management, seller banner uploads + admin review, seller flash-sale events, image uploads to Cloudinary. Runs an hourly cron to hard-delete soft-deleted products past their grace period.

#### `apps/order-service`
Creates orders, validates cart contents and pincode serviceability, processes payments, lets sellers accept/reject/update order status, provides stats and analytics for sellers and admins.

#### `apps/notification-service`
Stores in-app notifications in PostgreSQL, exposes endpoints to fetch and mark as read. Consumes events from RabbitMQ to create notification records.

#### `apps/worker-service`
Runs a raw WebSocket server (no Socket.io). Consumes RabbitMQ queues and broadcasts messages to connected clients segmented into rooms (by `storeId`, `sellerId`, `staffId`, `userId`, `adminId`). Also runs the OTP worker (sends SMS/email from queue).

---

## All API Routes

All routes are accessed via the API Gateway at `http://localhost:8080`.

### Gateway Routes

```
GET  /gateway-health            → Health check

Proxy rules:
  /auth/*          → auth-service:6001/api/*
  /product/*       → product-service:6003/api/*
  /order/*         → order-service:6004/api/*
  /notification/*  → notification-service:6005/api/*
  WS upgrade       → worker-service:6006
```

---

### Auth Service — 29 Routes

#### User (OTP-based, no password)
```
POST  /auth/send-otp                        Send OTP to phone/email
POST  /auth/verify-otp                      Verify OTP, issue JWT session
GET   /auth/logged-in-user                  Get current user session         [user]
POST  /auth/logout-user                     Logout + clear cookies           [user]
POST  /auth/refresh-token                   Refresh access token
GET   /auth/check-pincode                   Check delivery serviceability    [public]
GET   /auth/serviceable-areas               List all serviceable pincodes    [public]
POST  /auth/add-address                     Save delivery address            [user]
DELETE /auth/delete-address/:addressId      Remove saved address             [user]
```

#### Seller
```
POST  /auth/verify-seller-code              Verify admin-issued signup code
POST  /auth/seller-registration             Register seller account
POST  /auth/verify-seller                   Verify seller OTP
POST  /auth/login-seller                    Login seller
POST  /auth/create-store                    Create seller store profile
GET   /auth/logged-in-seller                Get current seller session       [seller]
POST  /auth/update-store                    Update store details             [seller]
POST  /auth/logout-seller                   Logout seller/staff              [seller|staff]
```

#### Staff (sub-accounts under a seller)
```
POST  /auth/staff-registration              Register staff account
POST  /auth/verify-staff                    Verify staff OTP
GET   /auth/logged-in-staff                 Get current staff session        [staff]
POST  /auth/logout-staff                    Logout staff                     [staff]
GET   /auth/seller/staffs                   List seller's staff              [seller]
GET   /auth/seller/staff/search             Search staff by email            [seller]
PUT   /auth/seller/staff/access             Update staff permissions         [seller]
```

#### Admin
```
POST  /auth/admin-registration              Register admin account
POST  /auth/verify-admin                    Verify admin OTP
POST  /auth/login-admin                     Login admin
GET   /auth/logged-in-admin                 Get current admin session        [admin]
POST  /auth/logout-admin                    Logout admin                     [admin]
POST  /auth/admin/verifycode                Verify admin signup code         [public]
POST  /auth/admin/generate-seller-code      Generate seller signup code      [admin]
GET   /auth/admin/seller-codes              List issued seller codes         [admin]
GET   /auth/admin/sellers                   List all sellers                 [admin]
GET   /auth/admin/sellers/:sellerId         Get seller details               [admin]
PUT   /auth/admin/sellers/:sellerId/approval Approve/reject seller           [admin]
```

---

### Product Service — 38 Routes

#### Products
```
POST  /product/create-product                Create catalog product           [admin]
PUT   /product/update-product/:productId     Update product                  [admin|seller|staff]
PUT   /product/update-product-stock/:id      Update stock                    [admin|seller|staff]
DELETE /product/delete-product/:productId    Soft-delete product             [admin|seller]
PUT   /product/restore-product/:productId    Restore soft-deleted product    [admin|seller]
POST  /product/slug-validator                Validate product slug uniqueness
GET   /product/get-owned-products            Get seller's own products       [admin|seller|staff]
GET   /product/get-owned-product/:productId  Get single owned product        [admin|seller|staff]
```

#### Catalog (Seller adds catalog products to their store)
```
GET   /product/get-catalog-products          Browse admin catalog            [seller]
POST  /product/add-catalog-product-to-store/:id  Create store variant       [seller]
```

#### Public Product Listing
```
GET   /product/get-all-products              Paginated store product list    [public]
GET   /product/get-product/:slug             Product detail by slug          [public]
GET   /product/public/store-offers/:storeId  Flash sale offers for store     [public]
POST  /product/validate-cart                 Validate cart contents          [public]
```

#### Search
```
GET   /product/search                        Full-text search (Meilisearch + Redis cache)  [public]
GET   /product/search/suggestions            Autocomplete suggestions (cached 5 min)       [public]
POST  /product/admin/reindex-search          Full Meilisearch reindex                      [admin]
```

#### Categories
```
GET   /product/get-categories                List all categories             [public]
POST  /product/create-category               Create category                 [admin]
POST  /product/create-subcategory            Create subcategory              [admin]
```

#### Coupons / Discount Codes
```
POST  /product/create-discount-code          Create coupon                   [seller]
GET   /product/get-discount-codes            List coupons                    [admin|seller]
DELETE /product/delete-discount-code/:id     Delete coupon                   [admin|seller]
PATCH /product/toggle-discount-code/:id      Enable/disable coupon           [admin|seller]
POST  /product/validate-coupon               Validate coupon at checkout     [public]
```

#### Seller Events (Flash Sales, Free Delivery, etc.)
```
POST  /product/create-event                  Create sale event               [seller]
GET   /product/get-seller-events             List own events                 [seller]
PUT   /product/update-event/:eventId         Update event                    [seller]
DELETE /product/delete-event/:eventId        Delete event                    [seller]
```

#### Banners
```
POST  /product/upload-banner                 Upload banner image             [admin|seller]
GET   /product/get-seller-banners            List seller's banners           [seller]
PUT   /product/update-banner/:bannerId       Update banner                   [seller]
DELETE /product/delete-banner/:bannerId      Delete banner                   [admin|seller]
GET   /product/get-admin-banners             All banners for admin           [admin]
GET   /product/get-all-category-banners      Category banners                [admin]
GET   /product/get-pending-banners           Banners pending review          [admin]
POST  /product/review-banner                 Approve/reject banner           [admin]
GET   /product/get-banners                   Active banners for storefront   [public]
GET   /product/get-announcement-banners      Announcement bar banners        [public]
```

#### Images
```
POST  /product/upload-product-image          Upload to Cloudinary            [admin|seller|staff]
POST  /product/admin/upload-cloudinary-image Upload arbitrary image          [admin]
POST  /product/admin/delete-cloudinary-image Delete from Cloudinary          [admin]
```

---

### Order Service — 11 Routes

```
POST  /order/create                          Place new order                 [user]
GET   /order/user-orders                     Get own order history           [user]
GET   /order/get-order/:orderId              Get order detail                [user]

GET   /order/get-seller-orders               Seller order list               [seller|staff]
GET   /order/get-order-details/:orderId      Order detail for seller         [seller|staff]
PUT   /order/accept-reject/:orderId          Accept or reject order          [seller|staff]
PUT   /order/update-status/:orderId          Update fulfillment status       [seller|staff]

GET   /order/seller-stats                    Seller revenue/order stats      [seller|staff]
GET   /order/admin-stats                     Platform-wide stats             [admin]
GET   /order/admin-stats/:sellerId           Per-seller stats                [admin]
GET   /order/admin-orders/:sellerId          Orders for a specific seller    [admin]
```

---

### Notification Service — 3 Routes

```
GET   /notification/                         Get all notifications           [authenticated]
PATCH /notification/:id/read                 Mark single notification read   [authenticated]
PATCH /notification/read-all                 Mark all notifications read     [authenticated]
```

---

### WebSocket (Worker Service)

Connect at `ws://localhost:6006` with query params to join rooms:

```
ws://localhost:6006?userId=<id>     → User order update room
ws://localhost:6006?storeId=<id>    → Seller store room (new orders)
ws://localhost:6006?sellerId=<id>   → Seller event room (banner reviews)
ws://localhost:6006?staffId=<id>    → Staff access room
ws://localhost:6006?adminId=<id>    → Admin alerts room
```

**Server → Client message types:**
- `NEW_ORDER` — New order received (seller/store room)
- `ORDER_STATUS_UPDATE` — Order status changed (user room)
- `BANNER_REVIEWED` — Banner approved/rejected (seller room)
- `STOCK_UPDATE` — Product went out of stock (broadcast to all)

---

## Frontend Routes

### User UI (`apps/user-ui`, port 3000)

```
/                              Home — streamed bestsellers + hero banners
/product/[slug]                Product detail — SSR + streaming variants
/category/[slug]               Category browse — server slug resolver + filter sidebar
/search                        Search results — Meilisearch streaming
/cart                          Cart — client-side Zustand state
/checkout                      Checkout — payment + address selection
/orders                        Order history — SSR + WebSocket live updates
/order-confirmation/[orderId]  Order success page
/addresses                     Saved delivery addresses
```

### Seller UI (`apps/seller-ui`, port 3002)

```
/login                         Seller login
/signup                        Seller registration (requires access code)
/pending-approval              Waiting for admin approval
/edit-profile                  Update seller profile
/success                       Post-registration success

/dashboard                     Overview stats
/dashboard/all-products        Product list (active/inactive tabs)
/dashboard/create-product      Create product from catalog
/dashboard/products/[id]       Product detail/edit
/dashboard/all-events          Flash sale events
/dashboard/create-event        Create new event
/dashboard/banners             Banner management
/dashboard/discount-codes      Coupon codes
/dashboard/orders              Order list
/dashboard/inventory           Stock management
/dashboard/analytics           Sales charts + geographical map
/dashboard/payments            Payment history
/dashboard/settings            Store settings (custom domain, withdraw method)
/dashboard/staff-management    Staff accounts management
/dashboard/notifications       In-app notifications
/dashboard/inbox               Messaging

/staff                         Staff landing
/staff/orders                  Staff order queue
/staff/orders/completed        Completed orders view
/staff/orders/rejected         Rejected orders view
/staff/orders/[id]             Order detail for staff
/staff/inventory               Inventory view for staff
```

### Admin UI (`apps/admin-ui`, port 3001)

```
/login                         Admin login
/signup                        Admin registration

/dashboard                     Overview
/dashboard/sellers             All sellers list
/dashboard/sellers/[id]        Seller detail + approval control
/dashboard/all-products        Global product catalog
/dashboard/create-product      Add catalog product
/dashboard/categories          Category management
/dashboard/banners             All banners
/dashboard/banner-review       Pending banner reviews
/dashboard/orders              All orders
/dashboard/payments/[sellerId] Seller payments
/dashboard/payments            Platform payments
/dashboard/discount-codes      All discount codes
/dashboard/analytics           Platform analytics
/dashboard/notifications       System notifications
```

---

## Database Schema

### MongoDB (packages/db-mongo) — Identity & Catalog

**users** — Phone/email, name, avatar, address book, following list
**sellers** — Email, password (Argon2), profile, banners, events, coupons, staff list, store ref, `isApprovedByAdmin`
**staffs** — Email, password, isActive, parent sellerId
**stores** — Name, bio, avatar, address, city, pincode, opening/closing hours, `availableCities[]`, `cityDeliveryTimes{}`, instant-delivery config
**admins** — Email, password, product/coupon/banner ownership

**products** — Title, slug, `isCatalog`, category, subCategory, images, tags, sizes, `sizePricing{}`, `cuttingTypePricing{}`, `pieceSizePricing{}`, stock, sale_price, regular_price, totalSold, ratings, status, `isDeleted`, `deletedAt`, storeId, adminId, `catalogProductId` (for variants)
**images** — Cloudinary file_id + URL, type (`PRODUCT | USER_AVATAR | STORE_AVATAR`), productId

**discount_codes** — Code, type (PERCENTAGE/FIXED), value, minOrder, maxUses, `maxUsesPerUser`, expiresAt, isActive, `isFirstOrder`, sellerId/adminId
**coupon_usages** — couponId, userId, orderId, usedAt
**favorites** — userId + productId junction

**banners** — imageUrl, type (ANNOUNCEMENT/CATEGORY/HERO), status (PENDING/APPROVED/REJECTED), category, sellerId/adminId
**seller_events** — Title, type (FREE_DELIVERY/DISCOUNT/FLASH_SALE), minOrder, discount %, start/end time, isActive
**site_config** — Categories list, subcategories map, category images map
**SignupAccessCode** — email, role, code, expiresAt (single-use admin-issued codes)

---

### PostgreSQL (packages/db-postgres) — Transactional Data

**Order** — userId, storeId, totalAmount, discountAmount, couponCode, deliverySlot, delivery address snapshot, status (`PENDING → ACCEPTED → SHIPPED → DELIVERED | REJECTED | CANCELLED`), paymentStatus, paymentMethod, rejectionReason
**OrderItem** — orderId, productId, quantity, price, selectedOptions (size, cutting type, pieces)
**Payment** — orderId, amount, status, method, transactionId, metadata
**CouponUsage** — couponId, userId, orderId
**Notification** — userId, title, message, type, category, isRead, metadata

---

## Authentication & Authorization

### JWT Cookie Strategy

Each role gets its own cookie and secret:

| Cookie Name | Role |
|---|---|
| `access_token` | Customer (user) |
| `seller_access_token` | Seller |
| `staff_access_token` | Staff |
| `admin_access_token` | Admin |

All cookies are **HTTP-only** (no JS access). Separate refresh token cookies extend sessions without requiring re-login.

### Token Verification Flow (per request)

```
1. Extract token from role-appropriate cookie
2. Check Redis cache (key: role:userId, TTL: 5 min)
   → Cache hit? Return immediately (skip DB)
   → Cache bypass flag set? Skip cache, hit DB
3. Verify JWT signature
4. Fetch account from DB (with store relation for sellers)
5. Write to Redis, clear bypass flag
6. Attach to req.user / req.seller / req.staff / req.admin
```

### Role-Based Access

- `isAuthenticated` — Any valid JWT
- `isAdmin` / `isSeller` / `isStaff` / `isUser` — Exact role match
- `isSellerOrStaff` — Seller acting as self or staff with seller context
- `allowRoles(...roles)` — Array of permitted roles

### OTP Login (Users)

1. `POST /auth/send-otp` → Generates 6-digit OTP, stores in Redis with TTL, sends via Fast2SMS or email
2. `POST /auth/verify-otp` → Match against Redis, delete OTP key, upsert user in DB, issue JWT cookies

### Seller Signup Code Flow

Admin issues a code → stored in MongoDB `SignupAccessCode` with expiry → seller verifies code before registration → code is single-use and auto-cleaned by cron

---

## Performance: Where & How

This is the most important architectural decision in the project. Every technique below exists to make the storefront feel like a native mobile app.

### 1. Shell + Stream Architecture (User UI)

Instead of waiting for all data before rendering, pages are split into:
- **Shell**: Static HTML (header, skeleton) renders immediately via SSR
- **Suspense islands**: Each data section (`<Suspense fallback={<Skeleton/>}>`) streams in independently as its server promise resolves

Result: First Contentful Paint is instant (skeleton), Largest Contentful Paint is as fast as the slowest required data — not blocked by unrelated data.

Files: `apps/user-ui/app/orders/page.tsx`, `apps/user-ui/app/category/[slug]/page.tsx`

### 2. Intent-Based Prefetching

When a user hovers a `ProductCard`, the component calls `router.prefetch(href)` and optionally warms the API cache before the click happens. Human hover-to-click latency is 200–400ms — enough time to pre-fetch the destination page.

Result: Navigation feels instantaneous (0ms perceived delay).

Files: `apps/user-ui/components/shared/product-card.tsx`

### 3. Redis Search Caching

- Search results cached for 3 minutes: `search:{query}:{category}:{sort}`
- Autocomplete suggestions cached for 5 minutes: `suggest:{query}`
- Auth tokens cached for 5 minutes (skips MongoDB on every request)
- Cache bypass flags set when seller approvals or staff access changes (forces fresh DB read once, then re-caches)
- Stale keys invalidated via Redis `SCAN` stream on product updates

Files: `packages/libs/src/redis/index.ts`, `apps/product-service/src/controllers/search.controller.ts`

### 4. Meilisearch for Search

MongoDB text search is too slow for real-time autocomplete. Meilisearch provides:
- Typo tolerance (1 typo at 4 chars, 2 typos at 8 chars)
- Sub-10ms query latency
- Filtered search by category, availability, price range, store
- Custom ranking: priority → words match → typo → proximity → ratings

When Meilisearch is unavailable, the system automatically falls back to a MongoDB regex search.

Files: `apps/product-service/src/lib/meilisearch.ts`, `apps/product-service/src/controllers/search.controller.ts`

### 5. Circuit Breaker Pattern

Wraps calls to downstream services. After 5 consecutive failures the circuit opens and calls fail fast for 30 seconds (HALF_OPEN state for recovery probe) instead of waiting for timeouts. Prevents cascading failures across services.

Files: `packages/libs/src/utils/circuit-breaker.ts`

### 6. Retry with Exponential Backoff

Transient errors (network blips, temporary DB unavailability) are retried automatically with exponential delay: `min(initialDelay × 2^attempt, maxDelay)`.

Files: `packages/libs/src/utils/retry.ts`

### 7. Persistent WebSocket Islands

The WebSocket connection to the worker service is established once and kept alive across Next.js route navigations (via React context). No reconnect overhead per page visit.

Files: `apps/user-ui/context/ws-context.tsx`, `apps/seller-ui/src/context/worker-ws-context.tsx`

### 8. Catalog + Variant Product Model

The product catalog is owned by admin. Sellers create lightweight variants (pricing, stock, cutting options) referencing the catalog record. This means:
- Search indexes both catalog and variant documents but deduplicates by `catalogId` (returns cheapest variant)
- Product slugs are canonical (on catalog), preventing slug conflicts across stores
- Meilisearch document priority: catalog = 1, variant = 2 (catalog shown first in general search)

### 9. Turbopack HMR

All three Next.js apps use Turbopack (`next dev --turbo`) for sub-100ms hot module replacement during development.

### 10. Soft Delete + Cron Cleanup

Products are never immediately hard-deleted. Soft delete sets `isDeleted=true` and `deletedAt`. An hourly cron (`apps/product-service/src/jobs/product.cron.jobs.ts`) permanently removes records past their grace period — keeping writes fast and allowing undo.

---

## Real-Time WebSockets

The worker service runs a raw **ws** library WebSocket server (not Socket.io — lower overhead).

### Room-Based Broadcasting

On connect, clients pass query params (`?storeId=xyz&userId=abc`). The `SocketManager` class assigns each `WebSocket` instance to rooms (properties on the socket object). Broadcasting iterates connected clients and filters by room ID — no client ever receives another's messages.

```
Seller connects: ws://...?storeId=abc
  → New order placed → broadcastToStore("abc", "NEW_ORDER", order)
  → Only the seller tab for store "abc" receives it

Customer connects: ws://...?userId=123
  → Seller updates order → broadcastToUser("123", "ORDER_STATUS_UPDATE", status)
  → Only that customer's tab receives it
```

### Heartbeat

Every 30 seconds the server sends a `ping`. If a client doesn't respond with `pong`, it's marked stale and terminated. Prevents ghost connections from accumulating.

### RabbitMQ → WebSocket Pipeline

```
Order Service (HTTP handler)
  → publishes {type: "ORDER_PLACED", storeId, order} to ORDER_EVENTS queue

Worker Service (RabbitMQ consumer)
  → receives message
  → calls socketManager.broadcastToStore(storeId, "NEW_ORDER", order)
  → seller's browser gets event
```

---

## Search: Meilisearch

### Index Document Structure

```typescript
{
  id:             "catalog_abc" | "variant_xyz",
  title:          string,
  slug:           string,        // canonical (from catalog root)
  category:       string,
  subCategory:    string,
  tags:           string[],
  short_description: string,
  sale_price:     number,
  regular_price:  number,
  imageUrl:       string,        // variant → catalog → placeholder fallback
  isDeleted:      boolean,
  status:         "active" | "NonActive",
  ratings:        number,
  storeId:        string | null,
  catalogId:      string | null,
  isCatalog:      boolean,
  isStoreVariant: boolean,
  priority:       1 | 2,         // catalog=1 ranks higher
  searchBoost:    10 | 5,
  available:      boolean,       // stock > 0
  updatedAt:      string,        // ISO timestamp
}
```

### Search Pipeline

```
GET /product/search?q=hilsa&category=Sea+Fish&sort=price_asc

1. Build Redis cache key
2. Check Redis → hit: return cached JSON
3. Miss: query Meilisearch (filter: isDeleted=false, status=active)
4. Meilisearch error → fallback: MongoDB regex on title/tags/category
5. Deduplicate results by catalogId (keep cheapest variant per catalog)
6. Cache result for 3 minutes
7. Return
```

### Re-indexing

- On product create/update/delete → `reindexCatalogVariants(catalogId)` fires async (non-blocking)
- Admin can trigger full reindex: `POST /product/admin/reindex-search`
- Each index operation: clear stale docs by ID prefix → bulk add new docs

---

## Message Queue: RabbitMQ

All queues are durable (survive broker restarts). Messages are persistent.

| Queue | Publisher | Consumer | Purpose |
|---|---|---|---|
| `OTP_QUEUE` | Auth Service | Worker (otpWorker) | Async OTP delivery via SMS/Email |
| `ORDER_EVENTS` | Order Service | Worker (orderWorker) | Broadcast order events to WebSocket clients |

### OTP Flow

```
Auth Service → publish {type, phone, email, otp} → OTP_QUEUE
Worker Service → consume → send SMS via Fast2SMS OR email via SMTP/Brevo
On failure: nack (no requeue on fatal error, requeue on transient error)
```

### Order Event Flow

```
Order Service → publish {type, orderId, storeId, userId, order} → ORDER_EVENTS
Worker Service → consume → route by type:
  ORDER_PLACED         → broadcastToStore(storeId, "NEW_ORDER", ...)
  ORDER_STATUS_UPDATE  → broadcastToUser(userId, "ORDER_STATUS_UPDATE", ...)
  BANNER_REVIEWED      → broadcastToSeller(sellerId, "BANNER_REVIEWED", ...)
  STOCK_UPDATE         → broadcastAll("STOCK_UPDATE", ...)
```

---

## Image Handling

- Images are uploaded as base64 strings in JSON body (20MB limit)
- Backend decodes and uploads to **Cloudinary** using the Node.js SDK
- Cloudinary returns a `public_id` (file_id) and `secure_url`
- Both are stored in the `images` collection in MongoDB
- All product image URLs are Cloudinary CDN URLs (globally cached, auto-optimized)
- Image types: `PRODUCT`, `USER_AVATAR`, `STORE_AVATAR`
- Admin can delete images from Cloudinary directly via `POST /product/admin/delete-cloudinary-image`

---

## Email / SMS / Push Notifications

### Email Templates (EJS)

All emails are rendered from EJS templates in `apps/auth-service/src/utils/email-templates/`:

| Template | Trigger |
|---|---|
| `user-activation-mail.ejs` | New user signup |
| `user-otp-mail.ejs` | OTP for user login |
| `seller-activation.ejs` | Seller account activation |
| `seller-access-code.ejs` | Admin issues seller signup code |
| `forget-password-seller-mail.ejs` | Seller password reset |
| `forget-password-user-mail.ejs` | User password reset |
| `admin-activation.ejs` | Admin account activation |
| `order-delivery-template.ejs` | Order dispatched |
| `notification-template.ejs` | General notification |
| `order-confirmation.ejs` | Order confirmed (order-service) |

### SMS

Fast2SMS API for India (phone OTPs). Configured via `FAST2SMS_API_KEY`.

### Push Notifications

Expo Server SDK sends push notifications to mobile apps. Configured per notification type.

### In-App Notifications

Stored in PostgreSQL `Notification` table. Fetched on dashboard load. Real-time delivery via WebSocket when seller/admin is connected.

---

## Docker & Deployment

### Local Docker Compose

```yaml
Services:        api-gateway, auth-service, product-service,
                 order-service, notification-service, worker-service,
                 rabbitmq-service (5672 + 15672 management UI),
                 meilisearch (7700, data volume: ./meili_data)

Network:         fish-studio-net (bridge)
All services:    restart: always
Image prefix:    10xdevian134/<service>:prod
```

### Dockerfiles

Each service has a multi-stage Dockerfile under `docker/<service>/Dockerfile`:
1. **builder** stage — installs deps, runs `tsup` build
2. **runtime** stage — copies `dist/`, prunes dev dependencies, runs `node dist/main.js`

### GitHub Actions CI/CD

Workflow in `.github/workflows/deploy.yml`:

```
1. build-and-push:
   - docker build each service
   - tag as 10xdevian134/<service>:prod
   - push to Docker Hub

2. deploy-to-droplet:
   - SSH into Droplet (secrets.DROPLET_IP)
   - cd /home/apps/fish-studio
   - docker compose pull
   - docker compose up -d
   - docker image prune -f
```

### Next.js Frontends

Deployed separately (Vercel or self-hosted). Not included in the Docker Compose stack.

---

## Environment Variables

Copy `env.examples` and fill in values. The `packages/env-config` package validates and exports all variables with TypeScript types.

```bash
# Ports
API_GATEWAY_PORT=8080
AUTH_SERVICE_PORT=6001
PRODUCT_SERVICE_PORT=6003
ORDER_SERVICE_PORT=6004
NOTIFICATION_SERVICE_PORT=6005
WORKER_SERVICE_PORT=6006

# JWT
ACCESS_TOKEN_JWT_SECRET_KEY=...
REFRESH_TOKEN_JWT_SECRET_KEY=...
JWT_SECRET=...

# Databases
MONGO_URL=mongodb+srv://...
POSTGRES_URL=postgresql://...
REDIS_DATABASE_URL=redis://...

# RabbitMQ
RABBITMQ_PROTOCOL=amqp
RABBITMQ_HOST_NAME=localhost
RABBITMQ_USER_NAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_PORT=5672

# Search
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=...

# Email / SMS
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
BREVO_API_KEY=...
FAST2SMS_API_KEY=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=fishstudio

# Payments
STRIPE_SECRET_KEY=...

# Frontend URLs (for CORS)
USER_UI_URL=http://localhost:3000
ADMIN_UI_URL=http://localhost:3001
SELLER_UI_URL=http://localhost:3002
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002

# App
ORG_NAME=FishStudio
ORG_SUPPORT_EMAIL=support@fishstudio.com
NODE_ENV=development
```

---

## Getting Started (Local Dev)

### Prerequisites

- Bun 1.3.10+
- Node.js 18+
- Docker + Docker Compose (for RabbitMQ, Meilisearch, Redis, MongoDB, PostgreSQL)

### Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd fishStudio

# 2. Install all dependencies
bun install

# 3. Copy and fill environment variables
cp env.examples .env
# Fill in MONGO_URL, POSTGRES_URL, REDIS_DATABASE_URL, etc.

# 4. Start infrastructure services
docker compose up rabbitmq-service meilisearch -d

# 5. Generate Prisma clients
bun run --filter "@repo/db-mongo" build
bun run --filter "@repo/db-postgres" build

# 6. Start all apps in development mode
bun run dev
# Turborepo runs all apps concurrently

# 7. Access the apps
# User storefront:   http://localhost:3000
# Admin panel:       http://localhost:3001
# Seller dashboard:  http://localhost:3002
# API Gateway:       http://localhost:8080
# RabbitMQ UI:       http://localhost:15672  (guest/guest)
# Meilisearch:       http://localhost:7700
```

### Build for Production

```bash
bun run build          # Builds all packages then all apps in dependency order
```

---

> For detailed notes on performance optimizations and architecture decisions, see [optimize.md](./optimize.md).
> For known bugs and workarounds, see [BUG.MD](./BUG.MD).
