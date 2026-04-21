import express, { Router } from "express";
import {
  acceptOrRejectOrder,
  getSellerOrders,
  updateOrderStatus,
} from "../controllers/order/seller.controller.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/order/user.controller.js";
import { getSellerStats, getAdminStats } from "../controllers/order/stats.controller.js";
import { getAdminOrderList, getAdminOrderDetail, updateAdminOrderStatus, getAdminOrderPincodes } from "../controllers/order/admin.controller.js";
import { allowRoles, isAuthenticated, isSellerOrStaff } from "@repo/middlewares";
import { perUserRateLimit } from "../middlewares/perUserRateLimit.js";

const router: Router = express.Router();

// Per-user order creation rate limit: max 10 orders per 60 seconds per user.
// This is independent of the global IP-based rate limit on the gateway.
const orderCreationLimit = perUserRateLimit({
  max: 10,
  windowMs: 60_000, // 60 seconds
  keyFn: (req) => (req.user?.id ? `order_create:${req.user.id}` : null),
  message: "You are placing orders too quickly. Please wait a moment.",
});

// ── User Orders ─────────────────────────────────────────────────────────────
router.post("/create", isAuthenticated, orderCreationLimit, createOrder);
router.get("/user-orders", isAuthenticated, getUserOrders);
router.get("/get-order/:orderId", isAuthenticated, getOrderById);
// User can cancel their own order only while it's still PENDING
router.put("/cancel/:orderId", isAuthenticated, cancelOrder);

// ── Seller Orders ──────────────────────────────────────────────────────────
router.get("/get-seller-orders", isAuthenticated, isSellerOrStaff, getSellerOrders);
router.get("/get-order-details/:orderId", isAuthenticated, isSellerOrStaff, getOrderById);
router.put("/accept-reject/:orderId", isAuthenticated, isSellerOrStaff, acceptOrRejectOrder);
router.put("/update-status/:orderId", isAuthenticated, isSellerOrStaff, updateOrderStatus);

// ── Analytics Routes ──────────────────────────────────────────────────────────
router.get("/seller-stats", isAuthenticated, allowRoles("seller", "staff"), getSellerStats);
router.get("/admin-stats", isAuthenticated, allowRoles("admin"), getAdminStats);
router.get("/admin-stats/:sellerId", isAuthenticated, allowRoles("admin"), getAdminStats);
router.get(
  "/admin-orders/:sellerId",
  isAuthenticated,
  allowRoles("admin"),
  // @ts-ignore
  require("../controllers/order/stats.controller.js").getAdminSellerOrders,
);

// ── Admin Order Management ─────────────────────────────────────────────────
// Distinct pincodes for filter dropdown (must be before /:orderId)
router.get("/admin/orders/pincodes", isAuthenticated, allowRoles("admin"), getAdminOrderPincodes);
// Full paginated order list with customer + seller + store hydration
router.get("/admin/orders", isAuthenticated, allowRoles("admin"), getAdminOrderList);
// Single order full detail: order + customer + seller + store + items + payments + audit trail
router.get("/admin/orders/:orderId", isAuthenticated, allowRoles("admin"), getAdminOrderDetail);
// Admin update order status (also auto-completes payment when DELIVERED)
router.put("/admin/orders/:orderId/status", isAuthenticated, allowRoles("admin"), updateAdminOrderStatus);

export default router;
