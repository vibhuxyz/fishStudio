-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('CUSTOMER', 'SELLER', 'STAFF', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" "CancelledBy",
ADD COLUMN     "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE';
