import express, { Router } from "express";
import {
  createDiscountCodes,
  createProduct,
  getCategories,
  getDiscountCodes,
  getStoreProducts,
  slugValidator,
  uploadProductImage,
} from "../controllers/product.controller";
import isAuthenticated from "@repo/middlewares/isAuthenticated";
import { isSeller } from "@repo/middlewares/authorizeRole";

const router: Router = express.Router();

router.post("/slug-validator", isAuthenticated, isSeller, slugValidator);

router.post(
  "/create-discount-code",
  isAuthenticated,
  isSeller,
  createDiscountCodes,
);
router.get("/get-discount-codes", isAuthenticated, isSeller, getDiscountCodes);

router.get("/get-categories", getCategories);

router.post(
  "/upload-product-image",
  isAuthenticated,
  isSeller,
  uploadProductImage,
);
router.post("/create-product", isAuthenticated, isSeller, createProduct);

router.get("/get-all-products", getStoreProducts);

router.post(
  "/upload-product-image",
  isAuthenticated,
  isSeller,
  uploadProductImage,
);

export default router;

// router.delete(
//   "/delete-discount-code/:id",
//   isAuthenticated,
//   isSeller,
//   deleteDiscountCode,
// );

// router.delete(
//   "/delete-product-image",
//   isAuthenticated,
//   isSeller,
//   deleteProductImage,
// );

// router.delete(
//   "/delete-product/:productId",
//   isAuthenticated,
//   isSeller,
//   deleteProduct,
// );
// router.put(
//   "/restore-product/:productId",
//   isAuthenticated,
//   isSeller,
//   restoreProduct,
// );
