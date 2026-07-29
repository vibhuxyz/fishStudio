# @repo/payment-service

Online payment service: creates gateway orders for existing internal orders, verifies checkout callbacks, ingests gateway webhooks, and issues refunds. Razorpay is the only gateway wired up today.

## Run

```
bun run dev    # bun --watch src/main.ts
bun run build  # tsup -> dist
bun run start  # node dist/main.js
```

Default port: `6007` (`PAYMENT_SERVICE_PORT`). Reached through the gateway at `/payment/*`.

## Routes (`/api`)

- **User** — `POST /create-razorpay-order` (binds a gateway order to a PENDING payment row), `POST /verify` (checkout callback signature → marks the order paid).
- **Webhook** — `POST /webhook`, server-to-server from Razorpay. No auth cookie; authenticated by HMAC over the raw body.
- **Admin/Seller** — `POST /refund`, full refund only (no partial refunds). Sellers are limited to their own store's orders. Ops-only: not wired to any UI, driven directly against the API.
- **Admin** — `GET /admin/attention?limit=50`, payments the automated paths refused to settle and that need a human.

## Payment flow

1. order-service creates the `Order` plus a `PENDING` `Payment` row.
2. `POST /create-razorpay-order` creates the gateway order and stores its id in `Payment.metadata.razorpayOrderId`. Repeat calls reuse that binding rather than orphaning it.
3. The browser opens Razorpay checkout; on success it posts the signature to `POST /verify`.
4. `POST /verify` checks the HMAC **and** that the supplied gateway order id matches the bound one — the signature alone only proves the payment is genuine on this merchant account, not that it belongs to this order.
5. `POST /webhook` independently settles the same state, so a user who closes the browser mid-payment is still reconciled.

Neither step 4 nor step 5 is a delivery guarantee, so a cron sweep (every 5 min) asks Razorpay directly about orders still marked unpaid after 2 minutes and settles anything it finds. Webhooks are recorded in the `WebhookEvent` table, which serves as both the dedupe key and the audit trail — an event is only skipped once it has been *processed*, so a failed attempt is still retried. Processing failures return 5xx on purpose so Razorpay retries; only handled or knowingly-ignored events return 200.

## Refunds

`POST /refund` claims the order as `REFUND_PENDING` before calling the gateway, so concurrent requests can't double-refund. Gateway refunds settle asynchronously: `REFUNDED` is set only when `refund.processed` arrives, and `refund.failed` returns the order to `COMPLETED`.

Outcomes that can't be resolved automatically — money captured against a cancelled order, a capture whose amount doesn't match the order — are refused, written to `AuditLog`, and surfaced at `GET /admin/attention` for an operator. They are deliberately **not** auto-refunded.

## Adding a gateway

Implement `PaymentProvider` (`src/payment/payment.interface.ts`) in `src/payment/providers/`, then register it in `src/payment/payment.factory.ts`. The service and controller layers only speak to the interface.

## Environment

See `env.example`. `RAZORPAY_WEBHOOK_SECRET` is separate from `RAZORPAY_KEY_SECRET`; if it is unset the webhook endpoint fails closed rather than silently dropping events.
