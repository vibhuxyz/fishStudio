-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryProofPhotoPublicId" TEXT,
ADD COLUMN     "deliveryProofPhotoUrl" TEXT,
ADD COLUMN     "deliveryProofUploadedAt" TIMESTAMP(3),
ADD COLUMN     "preparationPhotos" JSONB;
