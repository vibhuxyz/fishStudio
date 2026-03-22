import isAuthenticated from "@repo/middlewares/isAuthenticated";
import express, { Router } from "express";
import {
  acceptOrRejectOrder,
  createPaymentIntent,
  createPaymentSession,
  getAdminOrders,
  getOrderDetails,
  getSellerOrders,
  getUserOrders,
  updateDeliveryStatus,
  verifyCouponCode,
  verifyingPaymentSession,
} from "../controllers/order.controller";
import { isSeller, isSellerOrStaff } from "@repo/middlewares/authorizeRole";

const router: Router = express.Router();

router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get(
  "/verifying-payment-session",
  isAuthenticated,
  verifyingPaymentSession,
);

router.get("/get-seller-orders", isAuthenticated, isSellerOrStaff, getSellerOrders);
router.get("/get-order-details/:id", isAuthenticated, getOrderDetails);
router.put(
  "/update-status/:orderId",
  isAuthenticated,
  isSeller,
  updateDeliveryStatus,
);
router.put("/verify-coupon", isAuthenticated, verifyCouponCode);
router.get("/get-user-orders", isAuthenticated, getUserOrders);

// Accept or reject an order (staff or seller can do this)
router.put(
  "/accept-reject/:orderId",
  isAuthenticated,
  isSellerOrStaff,
  acceptOrRejectOrder,
);

export default router;
