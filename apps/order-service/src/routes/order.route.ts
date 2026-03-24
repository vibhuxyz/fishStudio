import express, { Router } from "express";
import {
  acceptOrRejectOrder,
  getSellerOrders,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { getSellerStats, getAdminStats } from "../controllers/stats.controller.js";
import { allowRoles, isAuthenticated, isSellerOrStaff } from "@repo/middlewares";

const router: Router = express.Router();

// ── User Orders ─────────────────────────────────────────────────────────────
router.post("/create", isAuthenticated, createOrder);
router.get("/user-orders", isAuthenticated, getUserOrders);
router.get("/get-order/:orderId", isAuthenticated, getOrderById);

// ── Seller Orders ──────────────────────────────────────────────────────────
router.get(
  "/get-seller-orders",
  isAuthenticated,
  isSellerOrStaff,
  getSellerOrders,
);
router.put(
  "/accept-reject/:orderId",
  isAuthenticated,
  isSellerOrStaff,
  acceptOrRejectOrder,
);
router.put(
  "/update-status/:orderId",
  isAuthenticated,
  isSellerOrStaff,
  updateOrderStatus,
);

// ── Analytics Routes ──────────────────────────────────────────────────────────
router.get(
  "/seller-stats",
  isAuthenticated,
  allowRoles("seller", "staff"),
  getSellerStats,
);

router.get(
  "/admin-stats",
  isAuthenticated,
  allowRoles("admin"),
  getAdminStats,
);

router.get(
  "/admin-stats/:sellerId",
  isAuthenticated,
  allowRoles("admin"),
  getAdminStats,
);

export default router;
