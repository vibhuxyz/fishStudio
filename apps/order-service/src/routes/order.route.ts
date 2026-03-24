import express, { Router } from "express";
import {
  acceptOrRejectOrder,
  getSellerOrders,
} from "../controllers/order.controller.js";
import { getSellerStats, getAdminStats } from "../controllers/stats.controller.js";
import { allowRoles, isAuthenticated, isSellerOrStaff } from "@repo/middlewares";

const router: Router = express.Router();

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
