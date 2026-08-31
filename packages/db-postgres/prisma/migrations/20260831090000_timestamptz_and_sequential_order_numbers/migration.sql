-- Every DateTime column moves from `timestamp(3)` (no time zone) to
-- `timestamptz(3)`.
--
-- Nothing about the instants stored changes: Prisma has always written UTC, and
-- `AT TIME ZONE 'UTC'` below tells Postgres to read the existing naive values as
-- exactly that. The difference is that the values stop being ambiguous — a bare
-- `timestamp` renders in the Neon console as a wall-clock string with no offset,
-- which is why an order placed at 00:15 IST looked like it was stored at the
-- wrong time. With `timestamptz` the same row renders against whatever
-- `SET timezone` the session asks for (`SET timezone = 'Asia/Kolkata';`).
--
-- Storage stays UTC. Storing local time in the database would be the wrong fix:
-- it breaks ordering across a DST-less-but-still-shifting world, and makes every
-- range query depend on who is asking.

-- Order
ALTER TABLE "Order" ALTER COLUMN "assignedAt" TYPE TIMESTAMPTZ(3) USING "assignedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Order" ALTER COLUMN "pickupStartedAt" TYPE TIMESTAMPTZ(3) USING "pickupStartedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Order" ALTER COLUMN "deliveredAt" TYPE TIMESTAMPTZ(3) USING "deliveredAt" AT TIME ZONE 'UTC';
ALTER TABLE "Order" ALTER COLUMN "deliveryProofUploadedAt" TYPE TIMESTAMPTZ(3) USING "deliveryProofUploadedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Order" ALTER COLUMN "cancelledAt" TYPE TIMESTAMPTZ(3) USING "cancelledAt" AT TIME ZONE 'UTC';
ALTER TABLE "Order" ALTER COLUMN "refundFailedAt" TYPE TIMESTAMPTZ(3) USING "refundFailedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Order" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Order" ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- Payment
ALTER TABLE "Payment" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Payment" ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- CouponUsage
ALTER TABLE "CouponUsage" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- Notification
ALTER TABLE "Notification" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Notification" ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- AuditLog
ALTER TABLE "AuditLog" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- WebhookEvent
ALTER TABLE "WebhookEvent" ALTER COLUMN "receivedAt" TYPE TIMESTAMPTZ(3) USING "receivedAt" AT TIME ZONE 'UTC';
ALTER TABLE "WebhookEvent" ALTER COLUMN "processedAt" TYPE TIMESTAMPTZ(3) USING "processedAt" AT TIME ZONE 'UTC';

-- OutboxEvent
ALTER TABLE "OutboxEvent" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "OutboxEvent" ALTER COLUMN "publishedAt" TYPE TIMESTAMPTZ(3) USING "publishedAt" AT TIME ZONE 'UTC';
ALTER TABLE "OutboxEvent" ALTER COLUMN "lockedAt" TYPE TIMESTAMPTZ(3) USING "lockedAt" AT TIME ZONE 'UTC';

-- StockReservation
ALTER TABLE "StockReservation" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "StockReservation" ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- ProductCoPurchase
ALTER TABLE "ProductCoPurchase" ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- ProductOrderStat
ALTER TABLE "ProductOrderStat" ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';

-- CoPurchaseState
ALTER TABLE "CoPurchaseState" ALTER COLUMN "lastDeliveredAt" TYPE TIMESTAMPTZ(3) USING "lastDeliveredAt" AT TIME ZONE 'UTC';
ALTER TABLE "CoPurchaseState" ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';


-- ── Human-facing sequential order numbers ──────────────────────────────────
--
-- `Order.id` stays the cuid primary key that every foreign key and URL already
-- uses. `orderNumber` is a second, human identifier in the format the business
-- asked for: FS-NOI-30082026-001 — FS, the store's location code, the date it
-- was placed (ddMMyyyy, IST), and a counter that restarts each day per location.
--
-- Nullable because every order that already exists predates it, and because a
-- store with no locationCode set yet must still be able to take orders.
ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;

-- Two orders must never share a number. A partial index rather than a plain
-- UNIQUE so the many pre-existing NULL rows cost nothing to index.
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber") WHERE "orderNumber" IS NOT NULL;

-- Backend order search is by this number, and it is the seller's primary
-- lookup, so it needs to be found quickly on its own.
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- The counter behind that last segment. One row per (location, day); the daily
-- reset is what keeps the sequence three digits rather than growing forever.
--
-- Incremented with INSERT ... ON CONFLICT DO UPDATE ... RETURNING, which is a
-- single atomic statement — two checkouts landing in the same millisecond get
-- 001 and 002, never 001 twice. A separate table rather than MAX(orderNumber)+1
-- over Order, which would race under concurrency and need a table scan.
CREATE TABLE "OrderNumberSequence" (
    "locationCode" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "lastSeq" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "OrderNumberSequence_pkey" PRIMARY KEY ("locationCode","dateKey")
);
