# worker-service

Background consumer service for FishStudio. Consumes RabbitMQ queues and fans
events out to connected clients over WebSockets; also runs the platform's
scheduled cron jobs.

## What it does

- **OTP queue** (`otp_queue`) — delivers OTPs by phone (Fast2SMS) with email
  fallback (Brevo/SMTP via `@repo/libs/sendMail`).
- **Order events** (`ORDER_EVENTS`) — `ORDER_PLACED`, `ORDER_STATUS_UPDATE`,
  `BANNER_REVIEWED`, `STOCK_UPDATE` — broadcast to the relevant store/seller/
  user WebSocket rooms.
- **Admin events** (`ADMIN_EVENTS`) — `BANNER_SUBMITTED`, `SELLER_APPROVED`,
  `SELLER_PERMISSIONS_UPDATED`, `STAFF_ACCESS_GRANTED`.
- **WebSocket server** — upgrades are authenticated with a verified JWT
  (`ACCESS_TOKEN_JWT_SECRET_KEY`); anonymous connections are allowed but only
  receive `broadcastAll` messages, never room-scoped ones.
- **Cron jobs** (via `@repo/jobs`) — hourly cleanup, abandoned-cart reminders,
  stale unpaid order cancellation.

Queue names are centralized in `@repo/libs/queues` and shared with the
services that publish to them (auth-service, order-service, product-service).

## Run

```bash
npm run dev    # tsx watch src/main.ts
npm run build  # tsc -> dist/
npm run start  # node dist/main.js
```

See `env.example` for required environment variables.
