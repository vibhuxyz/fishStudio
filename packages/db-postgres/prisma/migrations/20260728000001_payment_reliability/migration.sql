-- Payment reliability: durable webhook log, transactional outbox, stock
-- reservations, and an indexed gateway order id.
--
-- NOT YET APPLIED to any environment. Run with `prisma migrate deploy`.

-- Refunds settle asynchronously at the gateway; REFUNDED must only be set once
-- refund.processed confirms it. Not referenced elsewhere in this file, because
-- Postgres forbids using a new enum value in the transaction that adds it.
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUND_PENDING' BEFORE 'REFUNDED';

-- The gateway's order id, previously buried in Payment.metadata where it could
-- only be found via an unindexed JSON scan.
ALTER TABLE "Payment" ADD COLUMN "gatewayOrderId" TEXT;

-- Backfill from the JSON blob before the unique index goes on, so any existing
-- duplicate binding surfaces here rather than silently later.
UPDATE "Payment"
SET "gatewayOrderId" = "metadata"->>'razorpayOrderId'
WHERE "metadata"->>'razorpayOrderId' IS NOT NULL;

CREATE UNIQUE INDEX "Payment_gatewayOrderId_key" ON "Payment"("gatewayOrderId");
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebhookEvent_provider_eventId_key" ON "WebhookEvent"("provider", "eventId");
CREATE INDEX "WebhookEvent_receivedAt_idx" ON "WebhookEvent"("receivedAt");
CREATE INDEX "WebhookEvent_processedAt_idx" ON "WebhookEvent"("processedAt");

CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "aggregate" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OutboxEvent_status_createdAt_idx" ON "OutboxEvent"("status", "createdAt");
CREATE INDEX "OutboxEvent_aggregate_aggregateId_idx" ON "OutboxEvent"("aggregate", "aggregateId");

CREATE TABLE "StockReservation" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "userId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'HELD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StockReservation_status_createdAt_idx" ON "StockReservation"("status", "createdAt");
CREATE INDEX "StockReservation_orderId_idx" ON "StockReservation"("orderId");
