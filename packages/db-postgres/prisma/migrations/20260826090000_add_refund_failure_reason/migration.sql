-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "refundFailureReason" TEXT,
ADD COLUMN     "refundFailedAt" TIMESTAMP(3);
