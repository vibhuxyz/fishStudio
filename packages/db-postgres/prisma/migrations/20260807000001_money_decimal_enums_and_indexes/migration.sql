-- Money columns: double precision -> numeric(12,2)
--
-- Existing float values are rounded to 2dp on the way in. Rounding here rather
-- than truncating matches `roundMoney` in @repo/pricing, which is what produced
-- these numbers in the first place — so a stored 448.99999999999994 becomes the
-- 449.00 the customer was actually shown and charged.

ALTER TABLE "Order"
  ALTER COLUMN "totalAmount"    TYPE numeric(12,2) USING round("totalAmount"::numeric, 2),
  ALTER COLUMN "discountAmount" TYPE numeric(12,2) USING round("discountAmount"::numeric, 2),
  ALTER COLUMN "deliveryCharge" TYPE numeric(12,2) USING round("deliveryCharge"::numeric, 2);

ALTER TABLE "Order" ALTER COLUMN "discountAmount" SET DEFAULT 0;
ALTER TABLE "Order" ALTER COLUMN "deliveryCharge" SET DEFAULT 0;

ALTER TABLE "OrderItem"
  ALTER COLUMN "price" TYPE numeric(12,2) USING round("price"::numeric, 2);

ALTER TABLE "Payment"
  ALTER COLUMN "amount" TYPE numeric(12,2) USING round("amount"::numeric, 2);

-- Enums.
--
-- Every conversion below is a straight relabel of values already stored as
-- those exact strings, so no wire-visible value changes. Rows carrying anything
-- unexpected would fail the cast, which is the point — a silent default would
-- hide corrupt data in a financial table.

-- ONLINE is a legacy value the createOrder zod schema still accepts; included
-- so the cast below doesn't fail on rows that already carry it.
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'RAZORPAY', 'ONLINE');
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');
CREATE TYPE "StockReservationStatus" AS ENUM ('HELD', 'CONSUMED', 'RELEASED');
CREATE TYPE "AuditEntityType" AS ENUM ('ORDER', 'PAYMENT', 'COUPON', 'STOCK', 'REFUND', 'REFERRAL');
CREATE TYPE "ActorType" AS ENUM ('USER', 'SELLER', 'ADMIN', 'SYSTEM');

-- Historical rows may hold an empty string where no method was recorded; that
-- is not a payment method, so it becomes NULL rather than a fabricated 'COD'.
UPDATE "Order" SET "paymentMethod" = NULL WHERE "paymentMethod" = '';

ALTER TABLE "Order"
  ALTER COLUMN "paymentMethod" TYPE "PaymentMethod" USING "paymentMethod"::"PaymentMethod";

ALTER TABLE "Payment"
  ALTER COLUMN "method" TYPE "PaymentMethod" USING "method"::"PaymentMethod";

ALTER TABLE "OutboxEvent" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "OutboxEvent"
  ALTER COLUMN "status" TYPE "OutboxStatus" USING "status"::"OutboxStatus";
ALTER TABLE "OutboxEvent" ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "StockReservation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "StockReservation"
  ALTER COLUMN "status" TYPE "StockReservationStatus" USING "status"::"StockReservationStatus";
ALTER TABLE "StockReservation" ALTER COLUMN "status" SET DEFAULT 'HELD';

ALTER TABLE "AuditLog"
  ALTER COLUMN "entityType" TYPE "AuditEntityType" USING "entityType"::"AuditEntityType",
  ALTER COLUMN "actorType"  TYPE "ActorType"       USING NULLIF("actorType", '')::"ActorType";

-- Outbox relay claim columns. Without these two publishers racing on the same
-- PENDING batch both publish it; the relay now claims rows with
-- FOR UPDATE SKIP LOCKED and stamps them.
ALTER TABLE "OutboxEvent"
  ADD COLUMN "lockedAt" TIMESTAMP(3),
  ADD COLUMN "lockedBy" TEXT;

-- Indexes.
--
-- Dropped: leftmost prefixes already covered by a compound index, plus indexes
-- on columns that are written but never filtered on.

DROP INDEX IF EXISTS "Order_userId_idx";
DROP INDEX IF EXISTS "Order_storeId_idx";
DROP INDEX IF EXISTS "Order_status_idx";
DROP INDEX IF EXISTS "Payment_status_idx";
DROP INDEX IF EXISTS "AuditLog_actorId_idx";
DROP INDEX IF EXISTS "AuditLog_entityType_entityId_idx";

CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog" ("action", "createdAt" DESC);

-- Partial indexes for the sweeper tables.
--
-- Each of these tables keeps a small hot working set inside a table that grows
-- without bound. A full index on (status, createdAt) would keep indexing every
-- PUBLISHED/CONSUMED row forever even though the sweepers never read them; the
-- partial index stays proportional to the backlog instead of to all history.
-- Prisma cannot express a WHERE clause on an index, so these live here and are
-- intentionally absent from schema.prisma.

DROP INDEX IF EXISTS "OutboxEvent_status_createdAt_idx";
CREATE INDEX "OutboxEvent_pending_idx"
  ON "OutboxEvent" ("createdAt")
  WHERE "status" = 'PENDING';

DROP INDEX IF EXISTS "StockReservation_status_createdAt_idx";
CREATE INDEX "StockReservation_held_idx"
  ON "StockReservation" ("createdAt")
  WHERE "status" = 'HELD';

DROP INDEX IF EXISTS "WebhookEvent_processedAt_idx";
CREATE INDEX "WebhookEvent_unprocessed_idx"
  ON "WebhookEvent" ("receivedAt")
  WHERE "processedAt" IS NULL;

-- The stale-order sweeper is the only query that filters Order.status, and it
-- only ever looks at PENDING. This replaces the dropped full status index.
CREATE INDEX "Order_pending_createdAt_idx"
  ON "Order" ("createdAt")
  WHERE "status" = 'PENDING';

-- Unread notification badge. Almost every row eventually becomes read, so the
-- partial index stays small no matter how much notification history builds up.
CREATE INDEX "Notification_unread_idx"
  ON "Notification" ("userId", "createdAt" DESC)
  WHERE "isRead" = false;

-- Retention indexes.
--
-- The nightly prune job filters on the *settled* side of each table — the
-- complement of the sweeper predicates above — so without these it would seq
-- scan the whole table every night. Each one covers only the rows the job can
-- actually delete, and once retention is in steady state that is bounded by
-- the retention window rather than by all history.

CREATE INDEX "OutboxEvent_published_retention_idx"
  ON "OutboxEvent" ("publishedAt")
  WHERE "status" = 'PUBLISHED';

CREATE INDEX "WebhookEvent_processed_retention_idx"
  ON "WebhookEvent" ("processedAt")
  WHERE "processedAt" IS NOT NULL;

CREATE INDEX "StockReservation_settled_retention_idx"
  ON "StockReservation" ("updatedAt")
  WHERE "status" IN ('CONSUMED', 'RELEASED');
