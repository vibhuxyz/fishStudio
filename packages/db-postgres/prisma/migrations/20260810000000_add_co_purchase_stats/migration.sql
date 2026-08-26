-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "catalogProductId" TEXT;

-- CreateTable
CREATE TABLE "ProductCoPurchase" (
    "catalogA" TEXT NOT NULL,
    "catalogB" TEXT NOT NULL,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCoPurchase_pkey" PRIMARY KEY ("catalogA","catalogB")
);

-- CreateTable
CREATE TABLE "ProductOrderStat" (
    "catalogProductId" TEXT NOT NULL,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductOrderStat_pkey" PRIMARY KEY ("catalogProductId")
);

-- CreateTable
CREATE TABLE "CoPurchaseState" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lastDeliveredAt" TIMESTAMP(3),
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoPurchaseState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductCoPurchase_catalogA_orderCount_idx" ON "ProductCoPurchase"("catalogA", "orderCount" DESC);

-- CreateIndex
CREATE INDEX "ProductCoPurchase_catalogB_orderCount_idx" ON "ProductCoPurchase"("catalogB", "orderCount" DESC);

-- The aggregation job walks delivered orders in deliveredAt order from a
-- watermark. Partial because it is the only query that reads by deliveredAt,
-- and it never wants the ~90% of rows that are not DELIVERED — same approach as
-- the sweeper indexes added in 20260807000001.
CREATE INDEX "Order_deliveredAt_copurchase_idx" ON "Order"("deliveredAt")
  WHERE "status" = 'DELIVERED' AND "deliveredAt" IS NOT NULL;
