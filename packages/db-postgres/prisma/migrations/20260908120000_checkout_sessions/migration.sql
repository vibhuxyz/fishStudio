-- Checkout sessions: the durable record of an in-flight purchase attempt,
-- before any Order exists. See the model docs in schema.prisma for why.

CREATE TYPE "CheckoutSessionStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'ABANDONED');

CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'PENDING',
    "storeId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "quoteId" TEXT,
    "cartVersion" INTEGER,
    "gatewayOrderId" TEXT,
    "orderId" TEXT,
    "stockReservationId" TEXT,
    "deliverySlot" TEXT,
    "deliveryDate" TEXT,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- One gateway order settles exactly one session; one session becomes exactly
-- one order; one stock hold backs exactly one session. Each of these being a
-- duplicate would be money or stock that cannot be reconciled, so they are
-- enforced here rather than in application code.
CREATE UNIQUE INDEX "CheckoutSession_gatewayOrderId_key" ON "CheckoutSession"("gatewayOrderId");
CREATE UNIQUE INDEX "CheckoutSession_orderId_key" ON "CheckoutSession"("orderId");
CREATE UNIQUE INDEX "CheckoutSession_stockReservationId_key" ON "CheckoutSession"("stockReservationId");

-- The expiry sweep reads only PENDING rows past their deadline. Partial, for
-- the same reason the outbox and stock-reservation sweeps are: the table is
-- overwhelmingly terminal rows that the sweep must never pay to skip.
--
-- Named outside Prisma's own convention and intentionally absent from
-- schema.prisma, exactly like OutboxEvent_pending_idx. A partial index carrying
-- the name Prisma would generate for @@index([status, expiresAt]) is a trap:
-- the next person to add that declaration gets a duplicate-name failure.
CREATE INDEX "CheckoutSession_status_expiresAt_idx"
    ON "CheckoutSession" ("status", "expiresAt")
    WHERE "status" = 'PENDING';

CREATE INDEX "CheckoutSession_userId_status_idx" ON "CheckoutSession"("userId", "status");

-- A held session reserves a coupon redemption the same way it reserves stock.
-- Denormalised out of the snapshot so the limit check at creation can count
-- live holds alongside committed CouponUsage rows.
ALTER TABLE "CheckoutSession" ADD COLUMN "couponId" TEXT;
CREATE INDEX "CheckoutSession_couponId_status_idx" ON "CheckoutSession"("couponId", "status");
