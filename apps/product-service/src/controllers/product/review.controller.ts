import { Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { createReviewSchema, validate } from "@repo/zod-schema";
import { AuthRequest, getRequiredParam } from "./utils.js";

// Recomputes and persists a product's average rating from its reviews.
// Falls back to the schema default (5) once every review has been removed.
const recomputeProductRating = async (productId: string) => {
  const aggregate = await prisma.reviews.aggregate({
    where: { productId },
    _avg: { rating: true },
  });
  const average = aggregate._avg.rating;
  await prisma.products.update({
    where: { id: productId },
    data: { ratings: average ?? 5 },
  });
};

// GET /get-product-reviews/:productId — paginated reviews for a product,
// newest first, with the reviewer's display name attached.
export const getProductReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = getRequiredParam(req.params.productId, "Product id");
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    const [reviews, total, aggregate] = await Promise.all([
      prisma.reviews.findMany({
        where: { productId },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reviews.count({ where: { productId } }),
      prisma.reviews.aggregate({ where: { productId }, _avg: { rating: true } }),
    ]);

    return res.status(200).json({
      success: true,
      reviews,
      pagination: { page, limit, total, hasMore: page * limit < total },
      averageRating: aggregate._avg.rating ?? null,
      totalReviews: total,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /create-review — one review per user per product; resubmitting
// updates the existing review (matches the reviews.userId+productId unique index).
export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) {
      return next(new ValidationError("Please login to write a review!"));
    }
    const { productId, rating, comment, images } = validate(
      createReviewSchema,
      req.body,
    );

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) return next(new NotFoundError("Product not found!"));

    const review = await prisma.reviews.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { rating, comment, images: images ?? [] },
      create: { userId: req.user.id, productId, rating, comment, images: images ?? [] },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    await recomputeProductRating(productId);

    return res.status(200).json({
      success: true,
      message: "Review saved successfully!",
      review,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /delete-review/:reviewId — a user may only delete their own review.
export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) {
      return next(new ValidationError("Please login to manage your review!"));
    }
    const reviewId = getRequiredParam(req.params.reviewId, "Review id");
    const review = await prisma.reviews.findUnique({ where: { id: reviewId } });
    if (!review) return next(new NotFoundError("Review not found!"));
    if (review.userId !== req.user.id) {
      return next(new ValidationError("You can only delete your own review!"));
    }

    await prisma.reviews.delete({ where: { id: reviewId } });
    await recomputeProductRating(review.productId);

    return res.status(200).json({ success: true, message: "Review deleted successfully!" });
  } catch (error) {
    return next(error);
  }
};
