import { prismaMongo } from "@repo/db-mongo";
import { prismaPostgres } from "@repo/db-postgres";
import { cloudinary } from "@repo/libs/cloudinary";

/**
 * Cleanup job: Permanently delete unapproved Sellers older than 24 hours.
 */
export async function cleanupUnapprovedSellers() {
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const deleted = await prismaMongo.sellers.deleteMany({
      where: {
        isApprovedByAdmin: false,
        createdAt: { lt: threshold },
      },
    });
    if (deleted.count > 0) {
      console.log(`[JOB] 🧹 Cleaned up ${deleted.count} unapproved sellers`);
    }
  } catch (error) {
    console.error(`[JOB] ❌ Error cleaning up unapproved sellers:`, error);
  }
}

/**
 * Cleanup job: Permanently delete inactive Staff accounts older than 24 hours.
 */
export async function cleanupInactiveStaff() {
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const deleted = await prismaMongo.staffs.deleteMany({
      where: {
        isActive: false,
        createdAt: { lt: threshold },
      },
    });
    if (deleted.count > 0) {
      console.log(`[JOB] 🧹 Cleaned up ${deleted.count} inactive staff accounts`);
    }
  } catch (error) {
    console.error(`[JOB] ❌ Error cleaning up inactive staff:`, error);
  }
}

/**
 * Cleanup job: Permanently delete Products marked as isDeleted older than 24 hours.
 */
export async function cleanupDeletedProducts() {
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const deleted = await prismaMongo.products.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: threshold },
      },
    });
    if (deleted.count > 0) {
      console.log(`[JOB] 🧹 Cleaned up ${deleted.count} deleted products`);
    }
  } catch (error) {
    console.error(`[JOB] ❌ Error cleaning up deleted products:`, error);
  }
}

/**
 * Cleanup job: delete delivery-proof photos from Cloudinary and clear their
 * fields on the Order 5 days after upload — the photo has served its purpose
 * (customer transparency window) and shouldn't linger indefinitely.
 */
export async function deleteExpiredDeliveryProof() {
  const threshold = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  try {
    const expired = await prismaPostgres.order.findMany({
      where: {
        deliveryProofUploadedAt: { lt: threshold },
        deliveryProofPhotoPublicId: { not: null },
      },
      select: { id: true, deliveryProofPhotoPublicId: true },
    });

    for (const order of expired) {
      try {
        await cloudinary.uploader.destroy(order.deliveryProofPhotoPublicId!);
      } catch (err) {
        // If Cloudinary already lacks the asset (e.g. manually removed),
        // still clear the DB fields below rather than retrying forever.
        console.error(`[JOB] Failed to delete Cloudinary asset for order ${order.id}:`, err);
      }
      await prismaPostgres.order.update({
        where: { id: order.id },
        data: {
          deliveryProofPhotoUrl: null,
          deliveryProofPhotoPublicId: null,
          deliveryProofUploadedAt: null,
        },
      });
    }

    if (expired.length > 0) {
      console.log(`[JOB] 🧹 Cleaned up ${expired.length} expired delivery-proof photos`);
    }
  } catch (error) {
    console.error(`[JOB] ❌ Error cleaning up expired delivery-proof photos:`, error);
  }
}

/**
 * Cleanup job: Delete expired Signup Access Codes.
 */
export async function cleanupExpiredAccessCodes() {
  const now = new Date();
  try {
    const deleted = await prismaMongo.signupAccessCode.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });
    if (deleted.count > 0) {
      console.log(`[JOB] 🧹 Cleaned up ${deleted.count} expired signup access codes`);
    }
  } catch (error) {
    console.error(`[JOB] ❌ Error cleaning up expired signup codes:`, error);
  }
}
