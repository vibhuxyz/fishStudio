import express, { Router } from "express";
import {
  createDiscountCodes,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getCategories,
  getDiscountCodes,
  getStoreProducts,
  restoreProduct,
  uploadProductImage,
} from "../controllers/product.controller";
import isAuthenticated from "@repo/middlewares/isAuthenticated";
import { isSeller } from "@repo/middlewares/authorizeRole";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post(
  "/create-discount-code",
  isAuthenticated,
  isSeller,
  createDiscountCodes,
);
router.get("/get-discount-code", isAuthenticated, isSeller, getDiscountCodes);
router.delete(
  "/delete-discount-code/:id",
  isAuthenticated,
  isSeller,
  deleteDiscountCode,
);
router.post(
  "/upload-product-image",
  isAuthenticated,
  isSeller,
  uploadProductImage,
);
router.delete(
  "/delete-product-image",
  isAuthenticated,
  isSeller,
  deleteProductImage,
);
router.post("/create-product", isAuthenticated, isSeller, createProduct);
router.get("/get-store-products", isAuthenticated, isSeller, getStoreProducts);
router.delete(
  "/delete-product/:productId",
  isAuthenticated,
  isSeller,
  deleteProduct,
);
router.put(
  "/restore-product/:productId",
  isAuthenticated,
  isSeller,
  restoreProduct,
);
export default router;
