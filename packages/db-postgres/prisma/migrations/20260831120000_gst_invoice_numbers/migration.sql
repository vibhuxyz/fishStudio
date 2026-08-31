-- GST invoice numbering.
--
-- `invoiceNumber` is deliberately not `orderNumber`: order numbers restart each
-- day and may be issued for orders that are later cancelled, whereas GST
-- requires invoice numbers to run consecutively through a financial year and
-- never to be reused. They are therefore two columns and two counters.
--
-- Both are nullable. An invoice number is allocated the first time an invoice
-- is actually issued for an order, so an order nobody has downloaded one for
-- correctly has none, and a cancelled order never consumes a number.
ALTER TABLE "Order" ADD COLUMN "invoiceNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "invoicedAt" TIMESTAMPTZ(3);

-- Partial, like the orderNumber index: almost every historical row is NULL and
-- a plain UNIQUE would index all of them for nothing.
CREATE UNIQUE INDEX "Order_invoiceNumber_key" ON "Order"("invoiceNumber") WHERE "invoiceNumber" IS NOT NULL;
CREATE INDEX "Order_invoiceNumber_idx" ON "Order"("invoiceNumber");

CREATE TABLE "InvoiceSequence" (
    "locationCode" TEXT NOT NULL,
    "financialYear" TEXT NOT NULL,
    "lastSeq" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY ("locationCode","financialYear")
);
