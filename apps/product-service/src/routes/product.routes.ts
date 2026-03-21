import express, { Router } from "express";
import {
  addCatalogProductToStore,
  createCategory,
  createDiscountCodes,
  createProduct,
  createSellerEvent,
  createSubCategory,
  deleteBanner,
  deleteDiscountCode,
  deleteProduct,
  deleteSellerEvent,
  getActiveBanners,
  getCatalogProducts,
  getCategories,
  getDiscountCodes,
  getOwnedProductById,
  getOwnedProducts,
  getSellerBanners,
  getSellerEvents,
  getStoreProductBySlug,
  getStoreProducts,
  restoreProduct,
  slugValidator,
  updateBanner,
  updateProduct,
  updateSellerEvent,
  uploadBanner,
  uploadProductImage,
} from "../controllers/product.controller.js";
import { allowRoles, isAuthenticated, isSeller } from "@repo/middlewares";

const router: Router = express.Router();

router.post(
  "/slug-validator",
  isAuthenticated,
  allowRoles("admin", "seller"),
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
  allowRoles("admin", "seller"),
  uploadProductImage,
);
router.post("/upload-banner", isAuthenticated, isSeller, uploadBanner);

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
  allowRoles("seller"),
  deleteBanner,
);
router.get("/get-banners", getActiveBanners);

router.post(
  "/create-product",
  isAuthenticated,
  allowRoles("admin"),
  createProduct,
);

router.get("/get-all-products", getStoreProducts);
router.get("/get-product/:slug", getStoreProductBySlug);
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
  allowRoles("admin", "seller"),
  getOwnedProducts,
);
router.get(
  "/get-owned-product/:productId",
  isAuthenticated,
  allowRoles("admin", "seller"),
  getOwnedProductById,
);
router.put(
  "/update-product/:productId",
  isAuthenticated,
  allowRoles("admin", "seller"),
  updateProduct,
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
