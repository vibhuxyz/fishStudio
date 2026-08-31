import express, { Router, Response, NextFunction } from "express";
import { BANNER_CACHE, CATEGORY_CACHE } from "../middleware/cache-control.js";
import {
  searchProducts,
  searchSuggestions,
  reindexProducts,
} from "../controllers/search.controller.js";
import {
  addCatalogProductToStore,
  createProduct,
  deleteProduct,
  getCatalogProducts,
  getOwnedProductById,
  getOwnedProducts,
  restoreProduct,
  slugValidator,
  updateProduct,
  updateProductStock,
} from "../controllers/product/product.controller.js";
import {
  getStoreProductBySlug,
  getStoreProducts,
  getStorePublicOffers,
} from "../controllers/product/storefront.controller.js";
import { validateCart, getCart, clearCart } from "../controllers/product/cart.controller.js";
import {
  getHomepageSections,
  getSectionProducts,
  trackProductView,
  getRecentlyViewed,
  getForYou,
  mergeActivity,
} from "../controllers/product/activity.controller.js";
import {
  createCategory,
  createSubCategory,
  deleteCategory,
  deleteSubCategory,
  getCategories,
  updateCategory,
  updateSubCategory,
} from "../controllers/product/category.controller.js";
import {
  createDiscountCodes,
  deleteDiscountCode,
  updateDiscountCode,
  getDiscountCodes,
  toggleCouponStatus,
  validateCoupon,
} from "../controllers/product/coupon.controller.js";
import {
  createSellerEvent,
  deleteSellerEvent,
  getSellerEvents,
  updateSellerEvent,
} from "../controllers/product/event.controller.js";
import {
  deleteBanner,
  getActiveBanners,
  getAdminBanners,
  getAllCategoryBanners,
  getAnnouncementBanners,
  getPendingBanners,
  getSellerBanners,
  reviewBanner,
  updateBanner,
  uploadBanner,
} from "../controllers/product/banner.controller.js";
import {
  deleteCloudinaryImage,
  deleteStoreImage,
  uploadCloudinaryImage,
  uploadProductImage,
  uploadStoreImage,
} from "../controllers/product/image.controller.js";

import { getAdminSellerInventory } from "../controllers/product/admin.inventory.controller.js";
import { getProductStock } from "../controllers/product/stock.controller.js";
import {
  createReview,
  deleteReview,
  getMyReviews,
  getProductReviews,
} from "../controllers/product/review.controller.js";
import {
  createCombo,
  updateCombo,
  deleteCombo,
  toggleComboStatus,
  getSellerCombos,
  getComboById,
  getStoreCombos,
  getHomeCombos,
} from "../controllers/product/combo.controller.js";
import {
  allowRoles,
  isAuthenticated,
  isApprovedSeller,
  optionalAuth,
} from "@repo/middlewares";

const router: Router = express.Router();

// Admins bypass the approved-seller check entirely; sellers must be approved.
// Shared by every route where either role can act but only sellers need vetting.
const allowAdminOrApprovedSeller = (req: any, res: Response, next: NextFunction) =>
  req.role === "admin" ? next() : isApprovedSeller(req, res, next);

router.post(
  "/slug-validator",
  isAuthenticated,
  allowRoles("admin", "seller", "staff"),
  slugValidator,
);

router.post(
  "/create-discount-code",
  isAuthenticated,
  allowRoles("seller", "admin"),
  allowAdminOrApprovedSeller,
  createDiscountCodes,
);
router.post(
  "/create-event",
  isAuthenticated,
  allowRoles("seller"),
  isApprovedSeller,
  createSellerEvent,
);
router.get(
  "/get-discount-codes",
  isAuthenticated,
  allowRoles("admin", "seller"),
  getDiscountCodes,
);
router.get(
  "/get-seller-events",
  isAuthenticated,
  allowRoles("seller"),
  getSellerEvents,
);
router.put(
  "/update-event/:eventId",
  isAuthenticated,
  allowRoles("seller"),
  updateSellerEvent,
);
// Admin may edit any coupon including a seller's own; a seller only their own.
// Ownership is enforced in the controller, which is the only place that knows
// who the coupon belongs to.
router.put(
  "/update-discount-code/:id",
  isAuthenticated,
  allowRoles("admin", "seller"),
  updateDiscountCode,
);
router.delete(
  "/delete-discount-code/:id",
  isAuthenticated,
  allowRoles("admin", "seller"),
  deleteDiscountCode,
);
router.patch(
  "/toggle-discount-code/:id",
  isAuthenticated,
  allowRoles("admin", "seller"),
  toggleCouponStatus,
);
// Public — called from checkout before order submit. optionalAuth resolves the
// shopper when they are logged in, which is what the per-user limit,
// first-order and personally-issued checks inside the handler run against;
// a logged-out shopper still gets a straight validity answer.
router.post("/validate-coupon", optionalAuth, validateCoupon);
router.delete(
  "/delete-event/:eventId",
  isAuthenticated,
  allowRoles("seller"),
  deleteSellerEvent,
);

router.get("/get-categories", CATEGORY_CACHE, getCategories);

router.post(
  "/create-category",
  isAuthenticated,
  allowRoles("admin"),
  createCategory,
);
router.post(
  "/create-subcategory",
  isAuthenticated,
  allowRoles("admin"),
  createSubCategory,
);
// Names, not ids, identify these — so they travel in the body rather than the path.
router.delete(
  "/delete-category",
  isAuthenticated,
  allowRoles("admin"),
  deleteCategory,
);
router.delete(
  "/delete-subcategory",
  isAuthenticated,
  allowRoles("admin"),
  deleteSubCategory,
);
router.put(
  "/update-category",
  isAuthenticated,
  allowRoles("admin"),
  updateCategory,
);
router.put(
  "/update-subcategory",
  isAuthenticated,
  allowRoles("admin"),
  updateSubCategory,
);

router.post(
  "/upload-product-image",
  isAuthenticated,
  allowRoles("admin", "seller", "staff"),
  allowAdminOrApprovedSeller,
  uploadProductImage,
);
router.post(
  "/admin/upload-cloudinary-image",
  isAuthenticated,
  allowRoles("admin"),
  uploadCloudinaryImage,
);
router.post(
  "/admin/delete-cloudinary-image",
  isAuthenticated,
  allowRoles("admin"),
  deleteCloudinaryImage,
);
// Seller-side equivalents — scoped to the seller's own Cloudinary folder.
router.post(
  "/upload-store-image",
  isAuthenticated,
  allowRoles("seller", "staff"),
  allowAdminOrApprovedSeller,
  uploadStoreImage,
);
router.post(
  "/delete-store-image",
  isAuthenticated,
  allowRoles("seller", "staff"),
  allowAdminOrApprovedSeller,
  deleteStoreImage,
);
router.post(
  "/upload-banner",
  isAuthenticated,
  allowRoles("admin", "seller"),
  allowAdminOrApprovedSeller,
  uploadBanner,
);

router.get(
  "/get-seller-banners",
  isAuthenticated,
  allowRoles("seller"),
  getSellerBanners,
);
router.put(
  "/update-banner/:bannerId",
  isAuthenticated,
  allowRoles("seller"),
  updateBanner,
);
router.delete(
  "/delete-banner/:bannerId",
  isAuthenticated,
  allowRoles("admin", "seller"),
  deleteBanner,
);
router.get(
  "/get-admin-banners",
  isAuthenticated,
  allowRoles("admin"),
  getAdminBanners,
);
router.get(
  "/get-all-category-banners",
  isAuthenticated,
  allowRoles("admin"),
  getAllCategoryBanners,
);
router.get(
  "/get-pending-banners",
  isAuthenticated,
  allowRoles("admin"),
  getPendingBanners,
);
router.post(
  "/review-banner",
  isAuthenticated,
  allowRoles("admin"),
  reviewBanner,
);
router.get("/get-banners", BANNER_CACHE, getActiveBanners);
router.get("/get-announcement-banners", BANNER_CACHE, getAnnouncementBanners);

router.post(
  "/create-product",
  isAuthenticated,
  allowRoles("admin"),
  createProduct,
);

// ── Search (public) ──────────────────────────────────────────────────────────
router.get("/search", searchProducts);
router.get("/search/suggestions", searchSuggestions);
router.post(
  "/admin/reindex-search",
  isAuthenticated,
  allowRoles("admin"),
  reindexProducts,
);

// Admin: all sellers' inventory grouped by seller → store → products
router.get(
  "/admin/seller-inventory",
  isAuthenticated,
  allowRoles("admin"),
  getAdminSellerInventory,
);

// Lightweight live stock check — called by cart on every + click
router.get("/stock/:productId", getProductStock);

router.get("/get-all-products", getStoreProducts);
// ── Home sections + user activity (public; auth optional) ────────────────────
router.get("/get-homepage-sections", getHomepageSections);
router.get("/get-section-products", getSectionProducts);
router.post("/track-view", trackProductView);
router.get("/recently-viewed", getRecentlyViewed);
router.get("/for-you", getForYou);
router.post("/merge-activity", mergeActivity);
router.post("/validate-cart", validateCart);
// Cross-device cart restore. Auth is resolved inside the controller via
// optionalUserId — same as validate-cart — so a signed-out caller gets an
// empty cart rather than a 401 it would have to special-case.
router.get("/cart", getCart);
router.post("/cart/clear", clearCart);
router.get("/get-product/:slug", getStoreProductBySlug);
router.get("/get-product-reviews/:productId", getProductReviews);
router.get("/get-my-reviews", isAuthenticated, getMyReviews);
router.post("/create-review", isAuthenticated, createReview);
router.delete("/delete-review/:reviewId", isAuthenticated, deleteReview);
router.get("/public/store-offers/:storeId", optionalAuth, getStorePublicOffers);
router.get(
  "/get-catalog-products",
  isAuthenticated,
  allowRoles("seller"),
  getCatalogProducts,
);
router.post(
  "/add-catalog-product-to-store/:catalogProductId",
  isAuthenticated,
  allowRoles("seller"),
  isApprovedSeller,
  addCatalogProductToStore,
);
router.get(
  "/get-owned-products",
  isAuthenticated,
  allowRoles("admin", "seller", "staff"),
  getOwnedProducts,
);
router.get(
  "/get-owned-product/:productId",
  isAuthenticated,
  allowRoles("admin", "seller", "staff"),
  getOwnedProductById,
);
router.put(
  "/update-product/:productId",
  isAuthenticated,
  allowRoles("admin", "seller", "staff"),
  allowAdminOrApprovedSeller,
  updateProduct,
);
router.put(
  "/update-product-stock/:productId",
  isAuthenticated,
  allowRoles("admin", "seller", "staff"),
  allowAdminOrApprovedSeller,
  updateProductStock,
);


router.delete(
  "/delete-product/:productId",
  isAuthenticated,
  allowRoles("admin", "seller"),
  allowAdminOrApprovedSeller,
  deleteProduct,
);
router.put(
  "/restore-product/:productId",
  isAuthenticated,
  allowRoles("admin", "seller"),
  allowAdminOrApprovedSeller,
  restoreProduct,
);

// ── Combos ────────────────────────────────────────────────────────────────
router.post(
  "/create-combo",
  isAuthenticated,
  allowRoles("seller", "staff"),
  isApprovedSeller,
  createCombo,
);
router.put(
  "/update-combo/:comboId",
  isAuthenticated,
  allowRoles("seller", "staff"),
  isApprovedSeller,
  updateCombo,
);
router.delete(
  "/delete-combo/:comboId",
  isAuthenticated,
  allowRoles("seller", "staff"),
  isApprovedSeller,
  deleteCombo,
);
router.patch(
  "/toggle-combo/:comboId",
  isAuthenticated,
  allowRoles("seller", "staff"),
  isApprovedSeller,
  toggleComboStatus,
);
router.get(
  "/get-seller-combos",
  isAuthenticated,
  allowRoles("seller", "staff"),
  getSellerCombos,
);
router.get("/get-combo/:comboId", getComboById);
router.get("/get-store-combos/:storeId", getStoreCombos);
router.get("/get-combos", getHomeCombos);

export default router;
