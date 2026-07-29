# @repo/order-service

Order lifecycle service: cart-to-order checkout, seller order management (accept/reject/status updates), admin order oversight, and seller/admin sales analytics.

## Run

```
bun run dev    # bun --watch src/main.ts
bun run build  # tsup -> dist
bun run start  # node dist/main.js
```

Default port: `6004` (`ORDER_SERVICE_PORT`).

## Routes (`/api`)

- **User** — `POST /create` (idempotent, rate-limited), `GET /user-orders`, `GET /get-order/:orderId`, `PUT /cancel/:orderId` (only while `PENDING` and unpaid).
- **Seller** — `GET /get-seller-orders`, `GET /get-order-details/:orderId`, `PUT /accept-reject/:orderId`, `PUT /update-status/:orderId`.
- **Analytics** — `GET /seller-stats`, `GET /admin-stats[/:sellerId]`, `GET /admin-orders/:sellerId`.
- **Admin** — `GET /admin/orders/pincodes`, `GET /admin/orders`, `GET /admin/orders/:orderId`, `PUT /admin/orders/:orderId/status`.

Role checks (`isAuthenticated`, `allowRoles`, `isApprovedSeller`, `isSellerOrStaff`) come from `@repo/middlewares`.

## Data model

- **Postgres** (`@repo/db-postgres`) is the source of truth for order state: `Order`, `OrderItem`, `Payment`, `CouponUsage`, `AuditLog`.
- **MongoDB** (`@repo/db-mongo`) holds catalog/store/user data (`products`, `stores`, `users`, `discount_codes`) — every read handler hydrates Postgres order rows with the relevant Mongo documents in parallel and joins by id.
- `createOrder` reserves stock with an atomic conditional decrement in Mongo (rolled back on failure), then commits the order + coupon usage + initial payment record in a single Postgres `Serializable` transaction, re-checking per-user coupon usage inside the transaction to close the race window.

## Required environment variables

See `env.example`. In addition to what's listed there:

- `POSTGRES_URL` / `MONGO_URL` — read directly by `@repo/db-postgres` / `@repo/db-mongo`'s Prisma clients, not through this service's own `ENV` object.
- `REDIS_DATABASE_URL` — per-user order-creation rate limiting, create-order idempotency keys, seller/admin stats cache.
- `RABBITMQ_PROTOCOL` / `RABBITMQ_HOST_NAME` / `RABBITMQ_USER_NAME` / `RABBITMQ_PASSWORD` / `RABBITMQ_PORT` — publishes to `ORDER_EVENTS` (seller dashboard real-time updates) and `NOTIFICATION_QUEUE` (user/seller notifications).
- `NODE_ENV` — gates whether delivery notifications prefer email vs. SMS as the fallback channel.

## Dependencies

- `@repo/db-postgres`, `@repo/db-mongo` — Prisma clients for the two data stores described above.
- `@repo/libs` — `redis`, `publishToQueue`, `QUEUE_NAMES`.
- `@repo/zod-schema` — request validation (`order.schema.ts`: `createOrderSchema`, `acceptOrRejectOrderSchema`, `updateOrderStatusSchema`, `updateAdminOrderStatusSchema`, `adminOrderListQuerySchema`).
- `@repo/error-handlers` — `AppError` subclasses + central `errorMiddleware`.
- `@repo/middlewares` — role guards + `isAuthenticated`.
