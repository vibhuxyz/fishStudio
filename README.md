# 🐟 Fish Studio — Full-Stack E-Commerce Platform

> A production-grade, multi-tenant fish & meat marketplace built as a **TypeScript monorepo** with microservices, real-time search, and role-based multi-dashboard architecture.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Services & Ports](#services--ports)
- [API Reference](#api-reference)
  - [API Gateway](#api-gateway)
  - [Auth Service](#auth-service)
  - [Product Service](#product-service)
  - [Order Service](#order-service)
  - [Notification Service](#notification-service)
- [Database Schema](#database-schema)
- [Authentication & Cookies](#authentication--cookies)
- [Shared Packages](#shared-packages)
- [Build & Development](#build--development)
- [Features](#features)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                  │
│   user-ui :3000    seller-ui :3002    admin-ui :3001             │
└──────────────────┬───────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     API Gateway  :8080                            │
│         CORS · Rate Limiting · Proxy Routing                      │
└──────┬──────────────┬──────────────┬──────────────┬──────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
  Auth :6001   Product :6002   Order :6004   Notify :6005
       │              │              │              │
       └──────────────┴──────┬───────┴──────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          MongoDB         Redis         RabbitMQ
          (Prisma)       (Cache)    (Message Queue)
              │
              ▼
         Meilisearch :7700     Cloudinary (Images)
```

### Service Responsibilities

| Service | Port | Responsibility |
|---|---|---|
| **api-gateway** | 8080 | CORS, rate limiting, proxy routing to all services |
| **auth-service** | 6001 | OTP login, JWT tokens, multi-role auth (user/seller/admin/staff) |
| **product-service** | 6002 | Products, categories, search, coupons, events, banners |
| **order-service** | 6004 | Order creation, status management, seller analytics |
| **notification-service** | 6005 | In-app notifications, RabbitMQ consumer |
| **user-ui** | 3000 | Customer storefront (Next.js 14) |
| **seller-ui** | 3002 | Seller dashboard (Next.js 14) |
| **admin-ui** | 3001 | Admin control panel (Next.js 14) |

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ / Bun 1.3+ |
| Framework | Express 5 |
| Language | TypeScript 5.9 |
| ORM | Prisma 6 |
| Database | MongoDB |
| Cache | Redis (ioredis) |
| Message Queue | RabbitMQ (amqplib) |
| Search | Meilisearch |
| Auth | JWT (jsonwebtoken) + Argon2 |
| File Storage | Cloudinary |
| Email | Nodemailer (SMTP) |
| SMS / OTP | Fast2SMS |
| Build | tsup (esbuild) |

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui + Radix UI |
| Animations | Framer Motion |
| State | Zustand |
| Server State | TanStack Query |
| Icons | Lucide React |
| Toasts | Sonner |

### Infrastructure

| Tool | Purpose |
|---|---|
| Turborepo | Monorepo build orchestration |
| Bun | Package manager & workspace |
| Husky + lint-staged | Pre-commit hooks |
| ESLint + Prettier | Code quality |

---

## Project Structure

```
fishStudio/
├── apps/
│   ├── admin-ui/             # Admin dashboard (Next.js)
│   ├── seller-ui/            # Seller dashboard (Next.js)
│   ├── user-ui/              # Customer storefront (Next.js)
│   ├── auth-service/         # Authentication microservice
│   ├── product-service/      # Product/catalog microservice
│   ├── order-service/        # Order management microservice
│   ├── notification-service/ # Notification microservice
│   ├── api-gateway/          # HTTP proxy + rate limiting
│   └── rabbitMQ-service/     # Message queue consumer
├── packages/
│   ├── db/                   # Prisma ORM client & schema
│   ├── env-config/           # Centralized environment vars
│   ├── zod-schema/           # Shared Zod validation schemas
│   ├── error-handlers/       # Custom Express error classes
│   ├── libs/                 # Redis, RabbitMQ, Cloudinary, email utils
│   ├── middlewares/          # JWT auth & role middleware
│   ├── ui/                   # Shared React components
│   ├── eslint-config/        # Shared ESLint rules
│   └── typescript-config/    # Shared tsconfig base
├── turbo.json                # Turborepo pipeline config
├── bun.lock                  # Lockfile
└── package.json              # Root workspace
```

---

## Getting Started

### Prerequisites

- **Bun** >= 1.3.5 — [install](https://bun.sh)
- **MongoDB** running locally or Atlas URI
- **Redis** running locally (`redis-server`)
- **RabbitMQ** running locally or CloudAMQP URI
- **Meilisearch** running locally (`meilisearch --master-key=...`)
- **Cloudinary** account (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/yourorg/fishStudio.git
cd fishStudio
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in all required values (see Environment Variables section)
```

### 3. Setup the database

```bash
bun run db:setup    # Generate Prisma client + push schema to MongoDB
bun run db:seed     # Optional: seed with sample data
```

### 4. Start all services

```bash
bun run dev         # Starts all apps & services in parallel via Turborepo
```

### 5. Open in browser

| App | URL |
|---|---|
| Customer Storefront | http://localhost:3000 |
| Admin Dashboard | http://localhost:3001 |
| Seller Dashboard | http://localhost:3002 |
| API Gateway | http://localhost:8080 |

---

## Environment Variables

Create a `.env` file at the **root** of the monorepo:

```env
# ── Database ──────────────────────────────────────────────────────
DATABASE_URL=mongodb://localhost:27017/fishstudio

# ── JWT Secrets ───────────────────────────────────────────────────
JWT_SECRET=your-super-secret-key
ACCESS_TOKEN_JWT_SECRET_KEY=your-access-token-secret
REFRESH_TOKEN_JWT_SECRET_KEY=your-refresh-token-secret

# ── Service Ports ─────────────────────────────────────────────────
API_GATEWAY_PORT=8080
AUTH_SERVICE_PORT=6001
PRODUCT_SERVICE_PORT=6002
ORDER_SERVICE_PORT=6004
NOTIFICATION_SERVICE_PORT=6005

# ── Service URLs (internal) ───────────────────────────────────────
AUTH_SERVICE_URL=http://localhost:6001
PRODUCT_SERVICE_URL=http://localhost:6002
ORDER_SERVICE_URL=http://localhost:6004
NOTIFICATION_SERVICE_URL=http://localhost:6005

# ── Frontend URLs ─────────────────────────────────────────────────
USER_UI_URL=http://localhost:3000
ADMIN_UI_URL=http://localhost:3001
SELLER_UI_URL=http://localhost:3002

# ── Redis ─────────────────────────────────────────────────────────
REDIS_DATABASE_URL=redis://localhost:6379

# ── RabbitMQ ──────────────────────────────────────────────────────
RABBITMQ_USER_NAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_HOST_NAME=localhost
RABBITMQ_PORT=5672
RABBITMQ_PROTOCOL=amqp

# ── Meilisearch ───────────────────────────────────────────────────
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your-meilisearch-master-key

# ── Cloudinary ────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=fishStudio-app

# ── Email (SMTP) ──────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SERVICE=gmail
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_SENDER=your@gmail.com

# ── SMS ───────────────────────────────────────────────────────────
FAST2SMS_API_KEY=your-fast2sms-key

# ── Payments ──────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...

# ── Environment ───────────────────────────────────────────────────
NODE_ENV=development
```

---

## Services & Ports

| Service | Port | Health Check |
|---|---|---|
| API Gateway | 8080 | `GET /gateway-health` |
| Auth Service | 6001 | `GET /auth/api/home` |
| Product Service | 6002 | — |
| Order Service | 6004 | — |
| Notification Service | 6005 | — |
| User UI | 3000 | — |
| Admin UI | 3001 | — |
| Seller UI | 3002 | — |
| Meilisearch | 7700 | `GET /health` |
| Redis | 6379 | — |
| RabbitMQ | 5672 | — |
| RabbitMQ Management | 15672 | http://localhost:15672 |

> All frontend API requests should go through the **API Gateway on port 8080**, not directly to services.

---

## API Reference

All requests go through the API Gateway at `http://localhost:8080`.

**Base path prefixes:**
- Auth → `/auth/api/...`
- Product → `/product/api/...`
- Order → `/order/api/...`
- Notifications → `/notification/api/notifications/...`

---

### API Gateway

**Base URL:** `http://localhost:8080`

#### Rate Limiting

| Client Type | Limit | Window |
|---|---|---|
| Anonymous | 100 requests | 15 minutes |
| Authenticated | 1000 requests | 15 minutes |

#### Proxy Routes

| Method | Path | Forwards to |
|---|---|---|
| `GET` | `/gateway-health` | Gateway health check |
| `ANY` | `/auth/*` | Auth Service `:6001` |
| `ANY` | `/product/*` | Product Service `:6002` |
| `ANY` | `/order/*` | Order Service `:6004` |
| `ANY` | `/notification/*` | Notification Service `:6005` |

---

### Auth Service

**Base URL:** `/auth/api`

---

#### User Authentication

##### `POST /send-otp`

Send OTP to a user via email or SMS.

**Rate limited:** Yes

**Request Body**
```json
{
  "identifier": "user@example.com"
}
```

**Response `200`**
```json
{
  "success": true,
  "isNewUser": false,
  "message": "OTP sent successfully"
}
```

---

##### `POST /verify-otp`

Verify OTP and log in (creates account if new user).

**Request Body**
```json
{
  "identifier": "user@example.com",
  "otp": "1234",
  "name": "John Doe"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "John Doe",
    "phone_number": null,
    "email": "user@example.com"
  }
}
```

**Cookies Set**

| Cookie | HttpOnly | Expiry |
|---|---|---|
| `access_token` | Yes | 15 min |
| `refresh_token` | Yes | 7 days |

---

##### `POST /refresh-token`

Exchange refresh token for a new access token.

**Cookies Required:** `refresh_token`

**Response `200`** — Sets new `access_token` cookie.

---

##### `GET /logged-in-user`

Get the authenticated user's profile.

**Cookies Required:** `access_token`

**Response `200`**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "phone_number": "+91...",
    "addresses": [
      {
        "id": "...",
        "street": "123 Main St",
        "city": "Mumbai",
        "pincode": "400001",
        "label": "Home"
      }
    ]
  }
}
```

---

##### `POST /logout-user`

**Cookies Required:** `access_token`

**Response `200`** — Clears `access_token` and `refresh_token`.

---

##### `POST /add-address`

**Cookies Required:** `access_token`

**Request Body**
```json
{
  "street": "123 Main St",
  "area": "Andheri West",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "label": "Home"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Address added",
  "addresses": [...]
}
```

---

##### `DELETE /delete-address/:addressId`

**Cookies Required:** `access_token`

**Response `200`**
```json
{ "success": true, "message": "Address deleted" }
```

---

##### `GET /check-pincode`

Check if a delivery pincode is serviceable.

**Query Params:** `?pincode=400001`

**Response `200`**
```json
{
  "success": true,
  "serviceable": true,
  "city": "Mumbai",
  "deliveryTimeMinutes": 20
}
```

---

##### `GET /serviceable-areas`

Get all serviceable cities and pincodes.

**Response `200`**
```json
{
  "success": true,
  "areas": [
    { "city": "Mumbai", "pincodes": ["400001", "400002"] }
  ]
}
```

---

#### Admin Authentication

##### `POST /admin/verifycode`

Verify admin signup code before registration. **Rate limited.**

**Request Body**
```json
{
  "email": "admin@fishstudio.com",
  "code": "ADMIN-XXXXXX"
}
```

**Response `200`**
```json
{ "success": true, "message": "Code verified" }
```

---

##### `POST /admin-registration`

Register admin account (requires code verification first).

**Request Body**
```json
{
  "name": "Admin Name",
  "email": "admin@fishstudio.com",
  "password": "securepassword",
  "code": "ADMIN-XXXXXX"
}
```

**Response `201`**
```json
{ "success": true, "message": "OTP sent to email" }
```

---

##### `POST /verify-admin`

Verify OTP and complete admin registration. **Rate limited.**

**Request Body**
```json
{
  "email": "admin@fishstudio.com",
  "otp": "1234"
}
```

**Cookies Set**

| Cookie | HttpOnly | Expiry |
|---|---|---|
| `admin_access_token` | Yes | 15 min |
| `admin_refresh_token` | Yes | 7 days |

---

##### `POST /login-admin`

**Request Body**
```json
{
  "email": "admin@fishstudio.com",
  "password": "securepassword"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "admin": { "id": "...", "name": "...", "email": "..." }
}
```

**Cookies Set:** `admin_access_token`, `admin_refresh_token`

---

##### `GET /logged-in-admin`

**Cookies Required:** `admin_access_token`

---

##### `POST /logout-admin`

**Cookies Required:** `admin_access_token` — Clears all admin cookies.

---

##### `GET /admin/sellers`

Get all sellers with their store details.

**Cookies Required:** `admin_access_token`

**Query Params:** `?page=1&limit=20`

**Response `200`**
```json
{
  "success": true,
  "sellers": [
    {
      "id": "...",
      "name": "...",
      "email": "...",
      "isApprovedByAdmin": false,
      "store": { "name": "...", "city": "..." }
    }
  ]
}
```

---

##### `GET /admin/sellers/:sellerId`

Get full seller details including store, products, and orders.

**Cookies Required:** `admin_access_token`

---

##### `PUT /admin/sellers/:sellerId/approval`

Approve or reject a seller and set permissions.

**Cookies Required:** `admin_access_token`

**Request Body**
```json
{
  "isApprovedByAdmin": true,
  "permissions": ["manage_products", "manage_orders", "manage_coupons"]
}
```

---

##### `POST /admin/generate-seller-code`

Generate a one-time invitation code for a seller.

**Cookies Required:** `admin_access_token`

**Request Body**
```json
{ "email": "seller@example.com" }
```

**Response `200`**
```json
{
  "success": true,
  "code": "SEL-XXXXX",
  "expiresAt": "2025-06-01T00:00:00.000Z"
}
```

---

##### `GET /admin/seller-codes`

List all generated seller invitation codes.

**Cookies Required:** `admin_access_token`

---

#### Seller Authentication

##### `POST /verify-seller-code`

Verify seller invitation code before registration. **Rate limited.**

**Request Body**
```json
{
  "email": "seller@example.com",
  "code": "SEL-XXXXX"
}
```

---

##### `POST /seller-registration`

Register seller account.

**Request Body**
```json
{
  "name": "Seller Name",
  "email": "seller@example.com",
  "password": "securepassword",
  "code": "SEL-XXXXX"
}
```

---

##### `POST /verify-seller`

Verify OTP and complete seller registration with store setup.

**Request Body**
```json
{
  "email": "seller@example.com",
  "otp": "1234",
  "password": "securepassword",
  "name": "Seller Name",
  "phone_number": "+919876543210",
  "code": "SEL-XXXXX",
  "shop": {
    "name": "My Fish Shop",
    "bio": "Fresh fish daily"
  },
  "store": {
    "address": "123 Market Rd",
    "city": "Mumbai",
    "pincode": "400001",
    "state": "Maharashtra",
    "opening_hours": "8am - 8pm"
  }
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Registration successful. Awaiting admin approval.",
  "seller": { "id": "...", "name": "...", "email": "..." }
}
```

---

##### `POST /login-seller`

**Request Body**
```json
{
  "email": "seller@example.com",
  "password": "securepassword"
}
```

**Cookies Set**

| Cookie | HttpOnly | Expiry |
|---|---|---|
| `seller_access_token` | Yes | 15 min |
| `seller_refresh_token` | Yes | 7 days |

---

##### `GET /logged-in-seller`

**Cookies Required:** `seller_access_token`

**Response `200`**
```json
{
  "success": true,
  "seller": {
    "id": "...",
    "name": "...",
    "email": "...",
    "isApprovedByAdmin": true,
    "store": {
      "id": "...",
      "name": "Fish Studio Mumbai",
      "city": "Mumbai",
      "availableCities": ["Mumbai", "Thane"]
    }
  }
}
```

---

##### `POST /create-store`

Create a store for the registered seller.

**Request Body**
```json
{
  "name": "Fish Studio Mumbai",
  "bio": "Freshest fish in town",
  "address": "123 Market Street",
  "city": "Mumbai",
  "pincode": "400001",
  "state": "Maharashtra",
  "opening_hours": "8am - 8pm",
  "availableCities": ["Mumbai", "Thane"],
  "cityDeliveryTimes": {
    "Mumbai": 20,
    "Thane": 40
  }
}
```

---

##### `POST /update-store`

Partial update of store details.

**Cookies Required:** `seller_access_token`

---

##### `POST /logout-seller`

**Cookies Required:** `seller_access_token`

---

#### Staff Management

##### `POST /staff-registration`

Invite a staff member to the seller's account.

**Request Body**
```json
{
  "name": "Staff Name",
  "email": "staff@example.com"
}
```

---

##### `POST /verify-staff`

Staff activates account by setting a password.

**Request Body**
```json
{
  "name": "Staff Name",
  "email": "staff@example.com",
  "password": "staffpassword",
  "otp": "1234"
}
```

**Cookies Set:** `staff_access_token`, `staff_refresh_token`

---

##### `GET /logged-in-staff`

**Cookies Required:** `staff_access_token`

---

##### `POST /logout-staff`

**Cookies Required:** `staff_access_token`

---

##### `GET /seller/staffs`

**Cookies Required:** `seller_access_token`

**Response `200`**
```json
{
  "success": true,
  "staffs": [
    { "id": "...", "name": "...", "email": "...", "isActive": true }
  ]
}
```

---

##### `GET /seller/staff/search`

**Cookies Required:** `seller_access_token`

**Query Params:** `?email=staff@example.com`

---

##### `PUT /seller/staff/access`

Enable or disable a staff member's access.

**Cookies Required:** `seller_access_token`

**Request Body**
```json
{
  "staffId": "...",
  "isActive": false
}
```

---

### Product Service

**Base URL:** `/product/api`

---

#### Products

##### `POST /create-product`

Create a master catalog product (admin only).

**Cookies Required:** `admin_access_token`

**Request Body**
```json
{
  "title": "Rui/Rohu Cut 2-3 kg",
  "slug": "rui-rohu-cut-2-3-kg",
  "category": "Fresh Water",
  "subCategory": "Rohu",
  "short_description": "Fresh Rohu. Net weight 15-20% less after cutting.",
  "images": [
    { "file_id": "cloudinary-public-id", "file_url": "https://res.cloudinary.com/..." }
  ],
  "tags": ["Rohu", "fresh", "river fish"],
  "stock": 100,
  "sale_price": 105,
  "regular_price": 120,
  "sizes": ["500g", "1kg", "2kg"],
  "sizePricing": [
    { "size": "500g", "weightGrams": 500, "salePrice": 55, "regularPrice": 65 },
    { "size": "1kg",  "weightGrams": 1000, "salePrice": 105, "regularPrice": 120 },
    { "size": "2kg",  "weightGrams": 2000, "salePrice": 200, "regularPrice": 230 }
  ],
  "cuttingTypes": ["Whole", "Curry Cut", "Fillet"],
  "cuttingTypePricing": [
    { "cuttingType": "Whole",      "salePrice": 0,  "regularPrice": 0 },
    { "cuttingType": "Curry Cut",  "salePrice": 10, "regularPrice": 10 },
    { "cuttingType": "Fillet",     "salePrice": 30, "regularPrice": 30 }
  ],
  "pieceSizes": ["Small", "Medium", "Large"],
  "pieceSizePricing": [
    { "pieceSize": "Small",  "salePrice": 0,  "regularPrice": 0 },
    { "pieceSize": "Medium", "salePrice": 5,  "regularPrice": 5 },
    { "pieceSize": "Large",  "salePrice": 10, "regularPrice": 10 }
  ],
  "processingWeightLoss": "15-20%",
  "cash_on_delivery": "yes"
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Product created",
  "product": { "id": "...", "title": "...", "slug": "..." }
}
```

---

##### `GET /get-all-products`

Get all active store products (public).

**Query Params:** `?storeId=...&pincode=400001`

**Response `200`**
```json
{
  "success": true,
  "products": [
    {
      "id": "...",
      "title": "Rui/Rohu Cut 2-3 kg",
      "slug": "rui-rohu-cut-2-3-kg-abc123",
      "category": "Fresh Water",
      "sale_price": 105,
      "regular_price": 120,
      "stock": 50,
      "ratings": 4.5,
      "images": [{ "url": "https://res.cloudinary.com/..." }]
    }
  ]
}
```

---

##### `GET /get-product/:slug`

Get a single product by slug with full store and event data (public).

**Response `200`**
```json
{
  "success": true,
  "product": {
    "id": "...",
    "title": "Rui/Rohu Cut 2-3 kg",
    "slug": "rui-rohu-cut-2-3-kg-abc123",
    "sale_price": 105,
    "regular_price": 120,
    "sizePricing": [...],
    "cuttingTypePricing": [...],
    "pieceSizePricing": [...],
    "store": {
      "name": "Fish Studio",
      "seller": {
        "events": [
          {
            "type": "FREE_DELIVERY",
            "minOrder": 300,
            "isActive": true,
            "endTime": "2025-04-01T00:00:00.000Z"
          }
        ]
      }
    }
  }
}
```

---

##### `GET /get-owned-products`

Get products owned by the authenticated seller/admin.

**Cookies Required:** `seller_access_token` or `admin_access_token`

**Query Params:** `?includeDeleted=true`

---

##### `PUT /update-product/:productId`

**Cookies Required:** `seller_access_token` or `admin_access_token`

**Request Body** — Partial update, same fields as create.

---

##### `PUT /update-product-stock/:productId`

**Cookies Required:** `seller_access_token` or `admin_access_token`

**Request Body**
```json
{ "stockAdjustment": 50 }
```

> Positive = add, negative = reduce.

---

##### `DELETE /delete-product/:productId`

Soft delete (sets `isDeleted: true`, product hidden from storefront).

**Cookies Required:** `seller_access_token` or `admin_access_token`

---

##### `PUT /restore-product/:productId`

Restore a soft-deleted product.

**Cookies Required:** `seller_access_token` or `admin_access_token`

---

##### `POST /slug-validator`

Check if a product slug is available before creation.

**Cookies Required:** `seller_access_token` or `admin_access_token`

**Request Body**
```json
{ "slug": "rui-rohu-cut-2-3-kg" }
```

**Response `200`**
```json
{
  "available": false,
  "slug": "rui-rohu-cut-2-3-kg-1"
}
```

---

#### Catalog (Seller → Add to Store)

##### `GET /get-catalog-products`

Get all admin-created catalog products with availability indicator.

**Cookies Required:** `seller_access_token`

**Response `200`**
```json
{
  "success": true,
  "products": [
    {
      "id": "...",
      "title": "Pomfret 10-15 PCS/KG",
      "category": "Sea Fish",
      "alreadyInStore": false,
      "images": [...]
    }
  ]
}
```

---

##### `POST /add-catalog-product-to-store/:catalogProductId`

Add a catalog product to the seller's store with custom pricing/stock.

**Cookies Required:** `seller_access_token`

**Request Body**
```json
{
  "sale_price": 1060,
  "regular_price": 1200,
  "stock": 20,
  "cash_on_delivery": "yes",
  "status": "Active",
  "short_description": "Custom seller description",
  "sizePricing": [...],
  "processingWeightLoss": "15-20%"
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Product added to store",
  "product": { "id": "...", "slug": "pomfret-10-15-pcskg-c855bc" }
}
```

---

#### Cart

##### `POST /validate-cart`

Validate cart items before checkout — checks live prices, stock, and availability.

**Request Body**
```json
{
  "productIds": ["productId1", "productId2"]
}
```

**Response `200`**
```json
{
  "success": true,
  "products": [
    {
      "id": "...",
      "title": "...",
      "sale_price": 105,
      "stock": 20,
      "status": "Active"
    }
  ]
}
```

---

#### Search

##### `GET /search`

Full-text product search powered by Meilisearch (MongoDB fallback if unavailable).

**Query Params**

| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | required | Search query (min 1 char) |
| `category` | string | — | Filter by category |
| `sort` | string | `relevance` | `price_asc` \| `price_desc` \| `rating` |
| `limit` | number | 20 | Max results (max: 20) |

**Response `200`**
```json
{
  "success": true,
  "hits": [
    {
      "id": "...",
      "title": "Rui/Rohu Cut 2-3 kg",
      "slug": "rui-rohu-cut-2-3-kg-abc123",
      "category": "Fresh Water",
      "subCategory": "Rohu",
      "sale_price": 105,
      "regular_price": 120,
      "imageUrl": "https://res.cloudinary.com/...",
      "ratings": 4.5,
      "isStoreVariant": true
    }
  ],
  "totalHits": 12,
  "source": "meilisearch"
}
```

> Results are **Redis-cached for 3 minutes**.

---

##### `GET /search/suggestions`

Fast typeahead — returns 6 suggestions with images and price.

**Query Params:** `?q=rui`

**Response `200`**
```json
{
  "success": true,
  "suggestions": [
    {
      "id": "...",
      "title": "Rui/Rohu Cut 2-3 kg",
      "slug": "rui-rohu-cut-2-3-kg-abc123",
      "imageUrl": "https://...",
      "sale_price": 105,
      "regular_price": 120
    }
  ]
}
```

> **Redis-cached for 5 minutes**.

---

##### `POST /admin/reindex-search`

Rebuild the full Meilisearch index from MongoDB data.

**Cookies Required:** `admin_access_token`

**Response `200`**
```json
{
  "success": true,
  "message": "Reindexed 47 products"
}
```

---

#### Categories

##### `GET /get-categories`

Get all categories, subcategories, and category hero images (public).

**Response `200`**
```json
{
  "categories": ["Fresh Water", "Sea Fish", "Seawater"],
  "subCategories": {
    "Fresh Water": ["Rohu", "Catla", "Tilapia"],
    "Sea Fish":   ["Pomfret", "Surmai", "Rawas"]
  },
  "categoryImages": {
    "Fresh Water": "https://res.cloudinary.com/..."
  }
}
```

---

##### `POST /create-category`

**Cookies Required:** `admin_access_token`

**Request Body**
```json
{
  "name": "Fresh Water",
  "imageUrl": "https://res.cloudinary.com/...",
  "fileId": "cloudinary-public-id"
}
```

---

##### `POST /create-subcategory`

**Cookies Required:** `admin_access_token`

**Request Body**
```json
{
  "category": "Fresh Water",
  "subCategory": "Catla"
}
```

---

#### Discount Codes / Coupons

##### `POST /create-discount-code`

Create a coupon for the seller's store.

**Cookies Required:** `seller_access_token`

**Request Body**
```json
{
  "public_name": "First Order 10% Off",
  "discountType": "percentage",
  "discountValue": 10,
  "discountCode": "FIRST10",
  "minOrderValue": 200,
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "maxUses": 100,
  "maxUsesPerUser": 1,
  "isFirstOrder": true
}
```

**Discount Types**

| `discountType` | Effect |
|---|---|
| `percentage` | Deducts X% of the order total |
| `fixed` | Deducts a flat ₹X amount |
| `free_delivery` | Removes the delivery charge entirely |

**Response `201`**
```json
{
  "success": true,
  "coupon": {
    "id": "...",
    "discountCode": "FIRST10",
    "discountType": "percentage",
    "discountValue": 10,
    "isActive": true,
    "usedCount": 0
  }
}
```

---

##### `GET /get-discount-codes`

**Cookies Required:** `seller_access_token` or `admin_access_token`

**Response `200`**
```json
{
  "success": true,
  "coupons": [
    {
      "id": "...",
      "public_name": "First Order 10% Off",
      "discountCode": "FIRST10",
      "discountType": "percentage",
      "discountValue": 10,
      "minOrderValue": 200,
      "usedCount": 5,
      "maxUses": 100,
      "isActive": true,
      "isFirstOrder": true,
      "expiresAt": "2025-12-31T23:59:59.000Z"
    }
  ]
}
```

---

##### `DELETE /delete-discount-code/:id`

**Cookies Required:** `seller_access_token` or `admin_access_token`

---

##### `PATCH /toggle-discount-code/:id`

Enable or disable a coupon without deleting it.

**Cookies Required:** `seller_access_token`

**Request Body**
```json
{ "isActive": false }
```

---

##### `POST /validate-coupon`

Validate coupon at checkout. Checks: expiry, usage limits, per-user limits, minimum order, and first-order restriction.

**Request Body**
```json
{
  "code": "FIRST10",
  "orderAmount": 500,
  "storeId": "..."
}
```

**Response `200` (valid)**
```json
{
  "success": true,
  "valid": true,
  "discountType": "percentage",
  "discountValue": 10,
  "calculatedDiscount": 50,
  "message": "Coupon applied — ₹50 off"
}
```

**Response `400` (invalid)**
```json
{
  "success": false,
  "valid": false,
  "message": "Minimum order value is ₹200"
}
```

---

#### Seller Events / Promotions

##### `POST /create-event`

Create a time-bound promotional event shown on product pages.

**Cookies Required:** `seller_access_token`

**Request Body**
```json
{
  "title": "Weekend Flash Sale",
  "description": "15% off on orders above ₹300",
  "type": "DISCOUNT",
  "minOrder": 300,
  "discount": 15,
  "startTime": "2025-03-28T00:00:00.000Z",
  "endTime": "2025-03-30T23:59:59.000Z",
  "isActive": true
}
```

**Event Types**

| `type` | Behavior |
|---|---|
| `DISCOUNT` | Applies `discount`% off when cart meets `minOrder` |
| `FREE_DELIVERY` | Waives delivery charge when `minOrder` is met |
| `FLASH_SALE` | Same as DISCOUNT, displayed with flash sale badge |

**Response `201`**
```json
{
  "success": true,
  "event": { "id": "...", "title": "Weekend Flash Sale", "isActive": true }
}
```

---

##### `GET /get-seller-events`

**Cookies Required:** `seller_access_token`

---

##### `PUT /update-event/:eventId`

**Cookies Required:** `seller_access_token`

**Request Body** — Partial update of any event field.

---

##### `DELETE /delete-event/:eventId`

**Cookies Required:** `seller_access_token`

---

#### Banners

##### `POST /upload-banner`

Upload a promotional banner image.

**Cookies Required:** `admin_access_token` or `seller_access_token`

**Request Body**
```json
{
  "imageUrl": "https://res.cloudinary.com/...",
  "fileId": "cloudinary-public-id",
  "category": "Fresh Water"
}
```

> Seller-uploaded banners enter `PENDING` status and require admin approval before displaying on the storefront.

---

##### `GET /get-banners`

Get all active banners (public, used by storefront).

**Query Params:** `?category=Fresh+Water`

**Response `200`**
```json
{
  "success": true,
  "banners": [
    {
      "id": "...",
      "imageUrl": "https://...",
      "isActive": true,
      "category": "Fresh Water",
      "status": "APPROVED"
    }
  ]
}
```

---

##### `GET /get-pending-banners`

Get seller banners awaiting admin review.

**Cookies Required:** `admin_access_token`

---

##### `POST /review-banner`

Approve or reject a seller-uploaded banner.

**Cookies Required:** `admin_access_token`

**Request Body**
```json
{
  "bannerId": "...",
  "status": "APPROVED",
  "rejectionReason": null
}
```

---

##### `GET /public/store-offers/:storeId`

Get public promotional offers for a specific store.

---

#### Images

##### `POST /upload-product-image`

Upload a product image to Cloudinary.

**Cookies Required:** `admin_access_token` or `seller_access_token`

**Request** — `multipart/form-data` with field `image`

**Response `201`**
```json
{
  "success": true,
  "file_url": "https://res.cloudinary.com/...",
  "public_id": "fishStudio-app/products/..."
}
```

> Automatically optimized: `quality: auto:good`, `fetch_format: auto`, `width: 1200, crop: limit`.

---

##### `POST /admin/upload-cloudinary-image`

Upload any image as admin.

**Cookies Required:** `admin_access_token`

---

##### `POST /admin/delete-cloudinary-image`

Delete an image from Cloudinary by public ID.

**Cookies Required:** `admin_access_token`

**Request Body**
```json
{ "public_id": "fishStudio-app/products/..." }
```

---

### Order Service

**Base URL:** `/order/api`

---

##### `POST /create`

Place a new order.

**Cookies Required:** `access_token`

**Request Body**
```json
{
  "storeId": "...",
  "items": [
    {
      "productId": "...",
      "quantity": 2,
      "price": 105,
      "selectedOptions": {
        "size": "1kg",
        "cuttingType": "Curry Cut",
        "pieceSize": "Medium"
      }
    }
  ],
  "deliveryDetails": {
    "name": "John Doe",
    "phone": "+919876543210",
    "address": "123 Main St, Andheri",
    "city": "Mumbai",
    "pincode": "400001"
  },
  "billDetails": {
    "itemTotal": 210,
    "deliveryCharge": 30,
    "discount": 21,
    "totalAmount": 219
  },
  "paymentMethod": "COD",
  "couponCode": "FIRST10",
  "deliverySlot": "evening",
  "discountAmount": 21,
  "totalAmount": 219
}
```

**Payment Methods**

| `paymentMethod` | Description |
|---|---|
| `COD` | Cash on delivery |
| `ONLINE` | Online payment |
| `RAZORPAY` | Razorpay gateway |

**Delivery Slots**

| `deliverySlot` | Time |
|---|---|
| `instant` | ASAP (30–60 min) |
| `morning` | 8am – 12pm |
| `evening` | 4pm – 8pm |

**Response `201`**
```json
{
  "success": true,
  "message": "Order placed",
  "order": {
    "id": "...",
    "status": "PENDING",
    "totalAmount": 219,
    "paymentMethod": "COD",
    "createdAt": "..."
  }
}
```

---

##### `GET /user-orders`

Get the authenticated user's order history.

**Cookies Required:** `access_token`

**Query Params:** `?page=1&limit=10&status=DELIVERED`

**Response `200`**
```json
{
  "success": true,
  "orders": [
    {
      "id": "...",
      "status": "DELIVERED",
      "totalAmount": 219,
      "deliverySlot": "evening",
      "items": [
        {
          "productId": "...",
          "quantity": 2,
          "price": 105,
          "selectedOptions": { "size": "1kg" }
        }
      ],
      "createdAt": "..."
    }
  ]
}
```

---

##### `GET /get-order/:orderId`

Get full details of a specific user order.

**Cookies Required:** `access_token`

---

##### `GET /get-seller-orders`

Get all orders for the seller's store.

**Cookies Required:** `seller_access_token` or `staff_access_token`

**Query Params:** `?status=PENDING&page=1&limit=20`

**Response `200`**
```json
{
  "success": true,
  "orders": [
    {
      "id": "...",
      "status": "PENDING",
      "deliveryName": "John Doe",
      "deliveryPhone": "+919876543210",
      "deliveryAddress": "123 Main St",
      "deliveryCity": "Mumbai",
      "deliverySlot": "evening",
      "totalAmount": 219,
      "paymentMethod": "COD",
      "items": [...],
      "createdAt": "..."
    }
  ]
}
```

---

##### `GET /get-order-details/:orderId`

Get full order details (seller view).

**Cookies Required:** `seller_access_token` or `staff_access_token`

---

##### `PUT /accept-reject/:orderId`

Accept or reject a pending order.

**Cookies Required:** `seller_access_token` or `staff_access_token`

**Request Body**
```json
{
  "action": "reject",
  "rejectionReason": "Out of stock"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Order rejected",
  "order": { "id": "...", "status": "REJECTED" }
}
```

---

##### `PUT /update-status/:orderId`

Move an accepted order through fulfillment stages.

**Cookies Required:** `seller_access_token` or `staff_access_token`

**Request Body**
```json
{ "status": "SHIPPED" }
```

**Order Status Flow**
```
PENDING ──► ACCEPTED ──► SHIPPED ──► DELIVERED
    │
    └──► REJECTED
                        (CANCELLED possible at any stage)
```

---

##### `GET /seller-stats`

Get analytics for the authenticated seller's store.

**Cookies Required:** `seller_access_token`

**Response `200`**
```json
{
  "success": true,
  "stats": {
    "totalOrders": 142,
    "totalRevenue": 48500,
    "pendingOrders": 3,
    "deliveredOrders": 130,
    "cancelledOrders": 9,
    "topProducts": [
      { "title": "Rui/Rohu Cut", "totalSold": 48, "revenue": 5040 }
    ],
    "revenueByDay": [
      { "date": "2025-03-25", "revenue": 2400 }
    ]
  }
}
```

---

##### `GET /admin-stats`

Get platform-wide analytics.

**Cookies Required:** `admin_access_token`

**Query Params:** `?sellerId=...` (optional — scoped to one seller)

---

### Notification Service

**Base URL:** `/notification/api/notifications`

---

##### `GET /`

Get all notifications for the authenticated user.

**Cookies Required:** `access_token`

**Response `200`**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "...",
      "title": "Order Confirmed",
      "message": "Your order #ORD123 has been accepted by the seller",
      "type": "SUCCESS",
      "category": "ORDER",
      "isRead": false,
      "metadata": { "orderId": "..." },
      "createdAt": "..."
    }
  ]
}
```

**Notification Types:** `INFO` | `SUCCESS` | `WARNING` | `ERROR`

---

##### `PATCH /:id/read`

Mark a single notification as read.

**Cookies Required:** `access_token`

**Response `200`**
```json
{ "success": true, "message": "Marked as read" }
```

---

##### `PATCH /read-all`

Mark all notifications as read.

**Cookies Required:** `access_token`

---

## Database Schema

### Entity Relationship Diagram

```
users ──────────────────────────────────── orders ◄── OrderItem ──► products
  │                                           │                         │
  └── favorites ──────────────────────────────────────────────────────►│
  └── notifications                           │                         │
                                           stores ◄── sellers          │
admins ──────────────────────────────────►  │           │              │
  └── products (catalog) ──────────────────►│           └── staffs     │
  └── discount_codes                         │           └── events     │
  └── banners                                └── products (variants) ───┘
                                                         │
                                                  discount_codes
                                                  banners
                                                  coupon_usages
```

### Key Models

**products** — Dual-purpose: catalog products (admin) and store variants (seller)

| Field | Type | Notes |
|---|---|---|
| `storeId` | ObjectId? | `null` = catalog product, set = store variant |
| `catalogProductId` | ObjectId? | Self-reference to parent catalog product |
| `adminId` | ObjectId? | Set for catalog products |
| `sizePricing` | Json | `[{ size, weightGrams, salePrice, regularPrice }]` |
| `cuttingTypePricing` | Json | `[{ cuttingType, salePrice, regularPrice }]` |
| `pieceSizePricing` | Json | `[{ pieceSize, salePrice, regularPrice }]` |
| `status` | `Active\|NonActive` | Only `Active` products show in storefront |
| `isDeleted` | Boolean | Soft delete flag |

**discount_codes** — Flexible coupon system

| Field | Type | Notes |
|---|---|---|
| `discountType` | string | `percentage \| fixed \| free_delivery` |
| `isFirstOrder` | Boolean | Restrict to user's first order only |
| `maxUsesPerUser` | Int | Default 1 — per-user usage cap |
| `usedCount` | Int | Globally tracked across all users |
| `expiresAt` | DateTime? | `null` = never expires |

**Order** — Full order lifecycle

| Field | Type | Notes |
|---|---|---|
| `status` | enum | `PENDING → ACCEPTED → SHIPPED → DELIVERED` |
| `paymentStatus` | enum | `PENDING → COMPLETED \| FAILED → REFUNDED` |
| `billDetails` | Json | Snapshot of itemTotal, delivery, discount, total |
| `deliverySlot` | string | `instant \| morning \| evening` |

---

## Authentication & Cookies

### How Authentication Works

```
Request
  │
  ▼
API Gateway (CORS, rate-limit)
  │
  ▼
Service Route → isAuthenticated middleware
  │
  ├── 1. Extract role-specific cookie
  │         access_token / admin_access_token / seller_access_token / staff_access_token
  │
  ├── 2. Check Redis cache (60s TTL)
  │         HIT → use cached user data
  │
  ├── 3. Cache MISS → verify JWT signature
  │                 → fetch full user from DB
  │                 → cache in Redis for 60s
  │
  └── 4. Set req.role, req.user/seller/admin/staff
              │
              ▼
         allowRoles("admin") → checks req.role
```

### Cookie Reference

| Cookie | Role | Expiry | Scope |
|---|---|---|---|
| `access_token` | User | 15 min | User-only endpoints |
| `refresh_token` | User | 7 days | Token refresh only |
| `admin_access_token` | Admin | 15 min | Admin-only endpoints |
| `admin_refresh_token` | Admin | 7 days | Token refresh only |
| `seller_access_token` | Seller | 15 min | Seller endpoints |
| `seller_refresh_token` | Seller | 7 days | Token refresh only |
| `staff_access_token` | Staff | 15 min | Staff endpoints |
| `staff_refresh_token` | Staff | 7 days | Token refresh only |

### Cookie Settings

```
HttpOnly:  true
Secure:    true  (production)  /  false (development)
SameSite:  Strict
Path:      /
```

### Error Responses

| Status | Meaning |
|---|---|
| `401` | No token or invalid/expired token |
| `403` | Valid token but insufficient role |
| `404` | Resource not found |
| `422` | Zod validation failed |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

```json
{
  "success": false,
  "message": "Access denied. Required role: admin"
}
```

---

## Shared Packages

### `@repo/db`

Prisma ORM client generated for MongoDB. Used by all backend services.

```ts
import { prisma } from "@repo/db";

const product = await prisma.products.findFirst({
  where: { slug, isDeleted: false, status: "Active" },
  include: { images: true, store: true }
});
```

---

### `@repo/env-config`

Single source of truth for all environment variables with validation.

```ts
import { ENV } from "@repo/env-config";

const port = ENV.AUTH_SERVICE_PORT;     // 6001
const dbUrl = ENV.DATABASE_URL;
const meili = ENV.MEILISEARCH_HOST;     // http://localhost:7700
```

---

### `@repo/zod-schema`

Shared validation schemas and TypeScript types for all services.

```ts
import { createOrderSchema } from "@repo/zod-schema/schemas";
import type { CreateOrderInput } from "@repo/zod-schema/types";

const validated = createOrderSchema.parse(req.body);  // throws ValidationError if invalid
```

---

### `@repo/error-handlers`

Custom error classes for consistent HTTP error responses.

```ts
import { NotFoundError, ValidationError, AuthError } from "@repo/error-handlers";

throw new NotFoundError("Product not found");
// → 404  { success: false, message: "Product not found" }

throw new ValidationError("Invalid slug format");
// → 422  { success: false, message: "Invalid slug format" }

throw new AuthError("Access denied");
// → 401  { success: false, message: "Access denied" }
```

---

### `@repo/libs`

Shared third-party integrations.

```ts
import { redis }        from "@repo/libs";   // ioredis client
import { sendEmail }    from "@repo/libs";   // Nodemailer email
import { cloudinary }   from "@repo/libs";   // Cloudinary SDK
import { publishToQueue, consumeQueue } from "@repo/libs";  // RabbitMQ
```

---

### `@repo/middlewares`

JWT authentication and role-based authorization for Express.

```ts
import { isAuthenticated, allowRoles, isSeller, isAdmin } from "@repo/middlewares";

// Admin only
router.post("/admin-action", isAuthenticated, allowRoles("admin"), handler);

// Seller or staff
router.get("/orders", isAuthenticated, isSellerOrStaff, handler);

// Any authenticated user
router.get("/profile", isAuthenticated, isUser, handler);
```

---

## Build & Development

### Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start all apps and services in parallel (watch mode) |
| `bun run build` | Build all packages and apps |
| `bun run start` | Start all services in production mode |
| `bun run lint` | Run ESLint across the monorepo |
| `bun run check-types` | TypeScript type-check without emitting |
| `bun run format` | Format all files with Prettier |
| `bun run db:setup` | Generate Prisma client + push schema |
| `bun run db:migrate` | Push schema changes to MongoDB |
| `bun run db:seed` | Seed database with sample data |

### Build Performance

All backend services use **tsup** (esbuild-based) for near-instant builds:

| Package / Service | Build Time |
|---|---|
| auth-service | ~11ms |
| product-service | ~14ms |
| order-service | ~12ms |
| notification-service | ~7ms |
| zod-schema | ~20ms |
| user-ui (Next.js) | ~45s first, cached after |
| admin-ui (Next.js) | ~30s first, cached after |
| seller-ui (Next.js) | ~30s first, cached after |

### Turborepo Caching

Turborepo automatically caches build artifacts. Unchanged packages are skipped on re-runs.

```bash
# Enable remote cache (share between team/CI)
bunx turbo login
bunx turbo link
```

---

## Features

### Customer Storefront (`user-ui`)

- **Passwordless OTP Login** — Login/register via email or phone OTP
- **Blinkit-style Search** — Instant search with image suggestions, typo tolerance, category filters
- **Dynamic Pricing** — Size / cutting type / piece size selectors with real-time price updates
- **Persistent Cart** — Zustand-powered cart that survives page refresh
- **Coupon Codes** — Apply discount codes with server-side validation at checkout
- **Address Management** — Save multiple delivery addresses with pincode serviceability check
- **Order Tracking** — Real-time order status from PENDING → DELIVERED
- **Promotions** — Seller flash sales and free delivery events displayed on product pages
- **Category Browsing** — Horizontal category bar with hierarchical subcategory navigation
- **Responsive Design** — Mobile-first, works on all screen sizes

### Seller Dashboard (`seller-ui`)

- **Store Setup** — Create and configure store with delivery cities and time slots
- **Catalog Integration** — Browse admin-created catalog and add products with custom pricing
- **Stock Management** — Real-time stock adjustments with low-stock alerts
- **Order Workflow** — Accept/reject incoming orders, mark as shipped/delivered
- **Coupon Manager** — Create, pause, and delete discount codes with usage analytics
- **Promotions / Events** — Time-bound flash sales, discount events, free delivery offers
- **Banner Uploads** — Submit promotional banners for admin review
- **Staff Management** — Invite staff members, toggle access permissions
- **Sales Analytics** — Revenue charts, top products, order status breakdown

### Admin Dashboard (`admin-ui`)

- **Seller Management** — Review registrations, approve sellers, manage permissions
- **Product Catalog** — Create master product catalog with full pricing matrix
- **Category Management** — Add/edit categories, subcategories, and category images
- **Banner Review** — Approve or reject seller-submitted promotional banners
- **Search Reindex** — Rebuild Meilisearch index on demand with one click
- **Invitation Codes** — Generate time-limited seller signup codes
- **Platform Analytics** — Global stats and per-seller revenue/order breakdowns

### Search Architecture

```
User types "rui"
      │
      ▼ (debounced 220ms)
GET /product/api/search/suggestions?q=rui
      │
      ├── Primary: Meilisearch (typo-tolerant, ranked)
      │   filters: isStoreVariant=true, isDeleted=false
      │   cached in Redis 5 min
      │
      └── Fallback: MongoDB text search (if Meilisearch down)

Results displayed in:
  ├── Suggestions panel  (6 results with images)
  └── Results grid       (product cards with prices + discounts)

Enter key / "View all" → Full Search Modal
  ├── Category filter sidebar
  ├── Sort by: Relevance / Price / Rating
  └── Full result grid
```

### Image Pipeline

```
Upload → Cloudinary
  quality: auto:good
  fetch_format: auto
  transformation: [{ width: 1200, crop: "limit" }]
      │
      ▼
CDN delivery via res.cloudinary.com
      │
      ▼
Next.js <Image> with:
  formats: [avif, webp]
  sizes: responsive breakpoints
  custom Cloudinary loader
```

### Async Event Flow

```
Order Created
      │
      ▼
RabbitMQ: "order.created" event published
      │
      ▼
Notification Service consumer
      │
      ├── Creates in-app Notification record (MongoDB)
      └── Sends push / email notification to user
```

---

> Built with care for Fish Studio — delivering freshness, fast.
