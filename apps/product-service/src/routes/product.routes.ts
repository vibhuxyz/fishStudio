import express, { Router } from "express";
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
  getStoreProductBySlug,
  getStoreProducts,
  getStorePublicOffers,
  restoreProduct,
  slugValidator,
  updateProduct,
  updateProductStock,
  validateCart,
} from "../controllers/product/product.controller.js";
import {
  createCategory,
  createSubCategory,
  getCategories,
} from "../controllers/product/category.controller.js";
import {
  createDiscountCodes,
  deleteDiscountCode,
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
  uploadCloudinaryImage,
  uploadProductImage,
} from "../controllers/product/image.controller.js";

import { getAdminSellerInventory } from "../controllers/product/admin.inventory.controller.js";
import { getProductStock } from "../controllers/product/stock.controller.js";
import { allowRoles, isAuthenticated, isSeller } from "@repo/middlewares";

const router: Router = express.Router();

router.post(
  "/slug-validator",
  isAuthenticated,
  allowRoles("admin", "seller", "staff"),
  slugValidator,
);

router.post(
  "/create-discount-code",
  isAuthenticated,
  allowRoles("seller"),
  createDiscountCodes,
);
router.post(
  "/create-event",
  isAuthenticated,
  allowRoles("seller"),
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
// Public — called from checkout before order submit (auth optional for per-user limit check)
router.post("/validate-coupon", validateCoupon);
router.delete(
  "/delete-event/:eventId",
  isAuthenticated,
  allowRoles("seller"),
  deleteSellerEvent,
);

router.get("/get-categories", getCategories);

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

router.post(
  "/upload-product-image",
  isAuthenticated,
  allowRoles("admin", "seller", "staff"),
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
router.post(
  "/upload-banner",
  isAuthenticated,
  allowRoles("admin", "seller"),
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
router.get("/get-banners", getActiveBanners);
router.get("/get-announcement-banners", getAnnouncementBanners);

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
router.post("/validate-cart", validateCart);
router.get("/get-product/:slug", getStoreProductBySlug);
router.get("/public/store-offers/:storeId", getStorePublicOffers);
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
  updateProduct,
);
router.put(
  "/update-product-stock/:productId",
  isAuthenticated,
  allowRoles("admin", "seller", "staff"),
  updateProductStock,
);


router.delete(
  "/delete-product/:productId",
  isAuthenticated,
  allowRoles("admin", "seller"),
  deleteProduct,
);
router.put(
  "/restore-product/:productId",
  isAuthenticated,
  allowRoles("admin", "seller"),
  restoreProduct,
);

export default router;
