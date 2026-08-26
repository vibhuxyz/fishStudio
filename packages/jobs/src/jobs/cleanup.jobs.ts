import { Prisma, prismaMongo } from "@repo/db-mongo";
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
 * Hard-deletes the products matching `where`, clearing their images first.
 * Returns how many products were removed.
 */
async function purgeProducts(
  where: Prisma.productsWhereInput,
): Promise<number> {
  const products = await prismaMongo.products.findMany({
    where,
    select: { id: true, images: { select: { id: true, file_id: true } } },
  });
  if (products.length === 0) return 0;

  const productIds = products.map((product) => product.id);
  const images = products.flatMap((product) => product.images);

  // Cloudinary is best-effort: an asset that is already gone (or a transient
  // API failure) must not stop the DB rows from being removed, or the job
  // retries the same products every hour and never makes progress.
  await Promise.allSettled(
    images.map((image) => cloudinary.uploader.destroy(image.file_id)),
  );
  await prismaMongo.images.deleteMany({
    where: { id: { in: images.map((image) => image.id) } },
  });

  const deleted = await prismaMongo.products.deleteMany({
    where: { id: { in: productIds } },
  });
  return deleted.count;
}

/**
 * Cleanup job: Permanently delete Products marked as isDeleted older than 24 hours.
 *
 * Products reference themselves through the `catalog_variants` relation — a store
 * variant points at its catalog root. That relation is declared
 * `onDelete: NoAction`, so deleting a catalog root while any variant still
 * references it fails the whole deleteMany with P2014 and nothing gets cleaned.
 * Variants are removed first, then only those roots nothing references any more;
 * a root whose variants are still live waits for a later run.
 *
 * The two sides are told apart by `catalogProductId` / `adminId` being set rather
 * than by testing the other for null: these fields are absent (not stored as
 * null) on the documents that lack them, and the Mongo connector's `null`
 * comparison does not match an absent field — `catalogProductId: null` returns
 * nothing at all. `adminId: { not: null }` is the same catalog-root predicate the
 * storefront queries already use.
 *
 * `images` points at `products` with the same NoAction rule, so each product's
 * image rows — and the Cloudinary assets behind them — go first.
 */
export async function cleanupDeletedProducts() {
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const expired = { isDeleted: true, deletedAt: { lt: threshold } };

    const deletedVariants = await purgeProducts({
      ...expired,
      catalogProductId: { not: null },
    });

    const deletedCatalogs = await purgeProducts({
      ...expired,
      adminId: { not: null },
      storeVariants: { none: {} },
    });

    const total = deletedVariants + deletedCatalogs;
    if (total > 0) {
      console.log(
        `[JOB] 🧹 Cleaned up ${total} deleted products (${deletedCatalogs} catalog, ${deletedVariants} variants)`,
      );
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
