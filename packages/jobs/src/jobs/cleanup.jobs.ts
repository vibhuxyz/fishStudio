import { prismaMongo } from "@repo/db-mongo";

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
