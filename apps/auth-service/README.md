# @repo/auth-service

Authentication and identity service: admin, seller, staff, and user auth (OTP + password login), signup access codes, store creation, and staff access management for a seller's shop.

## Run

```
bun run dev    # tsx watch
bun run build  # tsup -> dist
bun run start  # node dist/main.js
```

Default port: `6001` (`AUTH_SERVICE_PORT`).

## Roles

`admin`, `seller`, `staff`, `user`. Role is carried in the JWT payload and enforced by `@repo/middlewares` (`isAdmin`, `isSeller`, `isStaff`, `isUser`, `isSellerOrStaff`). Requests select which role's token to read via the `x-auth-role` header; without it, `isAuthenticated` falls back to whichever role cookie is present.

## Auth model

- Access + refresh JWTs, signed per-role (`src/utils/tokenRevocation.ts`).
- Refresh tokens carry a `gen` (family generation) — logout or reuse-detection bumps the family, invalidating every outstanding refresh token for that account in one write.
- Logout adds the token to a Redis blocklist keyed by hash (and `jti`), so revocation is immediate rather than waiting for natural JWT expiry.
- OTP codes (4 digits) are Redis-backed with lock/cooldown/spam-guard rules (`src/utils/auth.helper.ts`).
- Signup access codes (admin/seller invites) are stored as SHA-256 hashes, never in plaintext.

## Required environment variables

See `env.example`. In addition to what's listed there, this service reads from the shared `@repo/env-config` package:

- `ACCESS_TOKEN_JWT_SECRET_KEY`, `REFRESH_TOKEN_JWT_SECRET_KEY` — JWT signing secrets.
- `REDIS_DATABASE_URL` — rate limiting, OTP state, token blocklist, auth cache.
- `RABBITMQ_PROTOCOL` / `RABBITMQ_HOST_NAME` / `RABBITMQ_USER_NAME` / `RABBITMQ_PASSWORD` / `RABBITMQ_PORT` — OTP/notification queue publishing.
- `FAST2SMS_API_KEY` — required in production for phone-based OTP.
- `NODE_ENV` — gates dev-only OTP console logging and cookie `secure`/`sameSite` behavior.

## Dependencies

- `@repo/db-mongo` — Prisma/MongoDB models (`admins`, `sellers`, `staffs`, `users`, `stores`, `SignupAccessCode`).
- `@repo/libs` — `redis`, `publishToQueue`/`connectRabbitMQ`, `logger`.
- `@repo/zod-schema` — request validation schemas (`auth.schema.ts`).
- `@repo/error-handlers` — `AppError` subclasses + central `errorMiddleware`.
- `@repo/middlewares` — role guards + `isAuthenticated`.
