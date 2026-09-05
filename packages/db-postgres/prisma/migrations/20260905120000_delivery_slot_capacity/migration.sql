-- Dated, capacity-limited delivery slots.
--
-- Order.deliverySlot already carried "instant" | "morning" | "evening" but had
-- no day attached, so nothing could be counted: two hundred orders could all
-- claim "morning" and the store found out on the morning.
--
-- deliveryDate is the store's own calendar day (ddMMyyyy, IST), not a
-- timestamp — capacity is counted per local day, and a UTC day would roll the
-- counter over at 05:30 local.

ALTER TABLE "Order" ADD COLUMN "deliveryDate" TEXT;

-- An order placed yesterday can be due today, so the delivery board cannot be
-- served by the existing [storeId, createdAt] index.
CREATE INDEX "Order_storeId_deliveryDate_idx" ON "Order" ("storeId", "deliveryDate");

CREATE TABLE "DeliverySlotBooking" (
    "storeId" TEXT NOT NULL,
    "deliveryDate" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "booked" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DeliverySlotBooking_pkey" PRIMARY KEY ("storeId","deliveryDate","slotKey")
);

-- The reservation statement relies on this: booked may never pass capacity,
-- even if a future code path forgets the guard in its WHERE clause.
ALTER TABLE "DeliverySlotBooking"
  ADD CONSTRAINT "DeliverySlotBooking_booked_within_capacity"
  CHECK ("booked" >= 0 AND "booked" <= "capacity");
