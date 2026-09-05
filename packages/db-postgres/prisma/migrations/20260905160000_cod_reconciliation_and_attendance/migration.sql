-- COD reconciliation, rider attendance, and delivery distance.
--
-- Three things a store currently tracks on paper or not at all: cash a rider is
-- holding, whether a rider actually started their shift at the store, and how
-- far they rode.

ALTER TYPE "AuditEntityType" ADD VALUE 'COD';

ALTER TABLE "Order" ADD COLUMN "deliveryDistanceKm" DECIMAL(6,2);

CREATE TABLE "CodSettlement" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "settledBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodSettlement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CodCollection" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "collectedAt" TIMESTAMPTZ(3) NOT NULL,
    "settlementId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodCollection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StaffAttendance" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "checkInAt" TIMESTAMPTZ(3) NOT NULL,
    "checkOutAt" TIMESTAMPTZ(3),
    "selfieUrl" TEXT NOT NULL,
    "selfiePublicId" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "isWithinGeofence" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffAttendance_pkey" PRIMARY KEY ("id")
);

-- One collection per order. This is what makes a retried mark-delivered
-- idempotent rather than double-counting the cash a rider is holding.
CREATE UNIQUE INDEX "CodCollection_orderId_key" ON "CodCollection"("orderId");

-- "What does this rider still owe" — settlementId IS NULL within a rider.
CREATE INDEX "CodCollection_riderId_settlementId_idx" ON "CodCollection"("riderId", "settlementId");
CREATE INDEX "CodCollection_storeId_collectedAt_idx" ON "CodCollection"("storeId", "collectedAt" DESC);
CREATE INDEX "CodSettlement_storeId_createdAt_idx" ON "CodSettlement"("storeId", "createdAt" DESC);
CREATE INDEX "CodSettlement_riderId_createdAt_idx" ON "CodSettlement"("riderId", "createdAt" DESC);
CREATE INDEX "StaffAttendance_storeId_checkInAt_idx" ON "StaffAttendance"("storeId", "checkInAt" DESC);
CREATE INDEX "StaffAttendance_staffId_checkInAt_idx" ON "StaffAttendance"("staffId", "checkInAt" DESC);

ALTER TABLE "CodCollection"
  ADD CONSTRAINT "CodCollection_settlementId_fkey"
  FOREIGN KEY ("settlementId") REFERENCES "CodSettlement"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
