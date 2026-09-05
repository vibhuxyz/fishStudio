import express, { Router } from "express";
import {
  acceptOrRejectOrder,
  getSellerOrders,
  updateOrderStatus,
} from "../controllers/order/seller.controller.js";
import {
  createOrder,
  getUserOrders,
  getUserOrderStats,
  getOrderById,
  cancelOrder,
  requestCodConversion,
} from "../controllers/order/user.controller.js";
import {
  getEligibleRiders,
  assignRider,
  bulkAssignRider,
  changeRider,
  removeRider,
} from "../controllers/order/rider-assignment.controller.js";
import {
  startPreparing,
  markPreparationComplete,
  markPickedUp,
  markDelivered,
  getMyRiderOrders,
  getMyCuttingOrders,
} from "../controllers/order/staff-workflow.controller.js";
import { bulkUpdateOrderStatus } from "../controllers/order/bulk-status.controller.js";
import {
  getCodSummary,
  getRiderCodDetail,
  settleRiderCod,
  getCodSettlements,
} from "../controllers/order/cod.controller.js";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getStoreAttendance,
} from "../controllers/order/attendance.controller.js";
import { getRiderDailyStats } from "../controllers/order/rider-stats.controller.js";
import { getOrderInvoice } from "../controllers/order/invoice.controller.js";
import { getSellerStats, getAdminStats, getAdminSellerOrders } from "../controllers/order/stats.controller.js";
import { getAdminOrderList, getAdminOrderDetail, updateAdminOrderStatus, getAdminOrderPincodes } from "../controllers/order/admin.controller.js";
import { allowRoles, isAuthenticated, isApprovedSeller, isSellerOrStaff, hasStaffRole } from "@repo/middlewares";
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
router.post("/create", isAuthenticated, allowRoles("user"), orderCreationLimit, createOrder);
router.get("/user-orders", isAuthenticated, allowRoles("user"), getUserOrders);
router.get("/user-order-stats", isAuthenticated, allowRoles("user"), getUserOrderStats);
// getOrderById enforces role-based ownership inside the controller.
router.get("/get-order/:orderId", isAuthenticated, allowRoles("user", "seller", "staff", "admin"), getOrderById);
// GST tax invoice. Ownership is enforced inside the controller with the same
// rules as get-order — an invoice carries the customer's name, phone and full
// address, so it must not be reachable by guessing an id.
router.get(
  "/invoice/:orderId",
  isAuthenticated,
  allowRoles("user", "seller", "staff", "admin"),
  getOrderInvoice,
);
// User can cancel their own order only while it's still PENDING
router.put("/cancel/:orderId", isAuthenticated, allowRoles("user"), cancelOrder);
// Failed online payment -> customer opts for Cash on Delivery instead of retrying.
router.put("/request-cod/:orderId", isAuthenticated, allowRoles("user"), requestCodConversion);

// ── Seller Orders ──────────────────────────────────────────────────────────
router.get("/get-seller-orders", isAuthenticated, isSellerOrStaff, isApprovedSeller, getSellerOrders);
router.get("/get-order-details/:orderId", isAuthenticated, isSellerOrStaff, isApprovedSeller, getOrderById);
router.put("/accept-reject/:orderId", isAuthenticated, isSellerOrStaff, isApprovedSeller, acceptOrRejectOrder);
router.put("/update-status/:orderId", isAuthenticated, isSellerOrStaff, isApprovedSeller, updateOrderStatus);
// Checkbox multi-select on the seller order dashboard. Forward workflow
// transitions only — cancellation stays on the single-order route above.
router.put("/bulk-update-status", isAuthenticated, isSellerOrStaff, isApprovedSeller, bulkUpdateOrderStatus);

// ── Rider Assignment ─────────────────────────────────────────────────────────
router.get("/eligible-riders/:orderId", isAuthenticated, isSellerOrStaff, isApprovedSeller, getEligibleRiders);
router.put("/assign-rider/:orderId", isAuthenticated, isSellerOrStaff, isApprovedSeller, assignRider);
// Dispatch: one rider, several nearby drops, one action. Same guard as the
// single assign — a staff member with the seller context, or the seller.
router.post("/bulk-assign-rider", isAuthenticated, isSellerOrStaff, isApprovedSeller, bulkAssignRider);
router.put("/change-rider/:orderId", isAuthenticated, isSellerOrStaff, isApprovedSeller, changeRider);
router.put("/remove-rider/:orderId", isAuthenticated, isSellerOrStaff, isApprovedSeller, removeRider);

// ── Rider / Cutting Staff self-service workflow ────────────────────────────
// Narrower than the generic update-status endpoint above: role- and
// ownership-scoped so a Cutting Staff can't touch rider actions and vice versa.
router.put(
  "/staff/start-preparing/:orderId",
  isAuthenticated,
  hasStaffRole("CUTTING_STAFF"),
  isApprovedSeller,
  startPreparing,
);
router.put(
  "/staff/prepare-complete/:orderId",
  isAuthenticated,
  hasStaffRole("CUTTING_STAFF"),
  isApprovedSeller,
  markPreparationComplete,
);
router.put(
  "/staff/mark-picked-up/:orderId",
  isAuthenticated,
  hasStaffRole("RIDER"),
  isApprovedSeller,
  markPickedUp,
);
router.put(
  "/staff/mark-delivered/:orderId",
  isAuthenticated,
  hasStaffRole("RIDER"),
  isApprovedSeller,
  markDelivered,
);
router.get(
  "/staff/my-rider-orders",
  isAuthenticated,
  hasStaffRole("RIDER"),
  isApprovedSeller,
  getMyRiderOrders,
);
router.get(
  "/staff/my-cutting-orders",
  isAuthenticated,
  hasStaffRole("CUTTING_STAFF"),
  isApprovedSeller,
  getMyCuttingOrders,
);

// ── COD reconciliation ─────────────────────────────────────────────────────
// A COD balance says how much cash a named person is carrying, so every route
// here is scoped to the caller's own store inside the controller.
router.get("/cod/summary", isAuthenticated, isSellerOrStaff, isApprovedSeller, getCodSummary);
router.get("/cod/settlements", isAuthenticated, isSellerOrStaff, isApprovedSeller, getCodSettlements);
router.get("/cod/rider/:riderId", isAuthenticated, isSellerOrStaff, isApprovedSeller, getRiderCodDetail);
router.post("/cod/settle", isAuthenticated, isSellerOrStaff, isApprovedSeller, settleRiderCod);

// ── Attendance ─────────────────────────────────────────────────────────────
// Check-in/out are the staff member acting on their own record; the roster is
// the manager's view of everyone's.
router.post("/attendance/check-in", isAuthenticated, isSellerOrStaff, isApprovedSeller, checkIn);
router.post("/attendance/check-out", isAuthenticated, isSellerOrStaff, isApprovedSeller, checkOut);
router.get("/attendance/me", isAuthenticated, isSellerOrStaff, isApprovedSeller, getMyAttendance);
router.get("/attendance/store", isAuthenticated, isSellerOrStaff, isApprovedSeller, getStoreAttendance);

// A rider's own day. Ownership is enforced in the controller: own stats always,
// anyone else's only with a seller/store context.
router.get("/rider-stats", isAuthenticated, isSellerOrStaff, isApprovedSeller, getRiderDailyStats);

// ── Analytics Routes ──────────────────────────────────────────────────────────
router.get("/seller-stats", isAuthenticated, allowRoles("seller", "staff"), getSellerStats);
router.get("/admin-stats", isAuthenticated, allowRoles("admin"), getAdminStats);
router.get("/admin-stats/:sellerId", isAuthenticated, allowRoles("admin"), getAdminStats);
router.get(
  "/admin-orders/:sellerId",
  isAuthenticated,
  allowRoles("admin"),
  getAdminSellerOrders,
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
// Same handler as the seller dashboard's bulk action — it widens its scope to
// every store when the caller is an admin, rather than being a second copy of
// the workflow-rank and side-effect logic that would drift from it.
router.put("/admin/orders/bulk-status", isAuthenticated, allowRoles("admin"), bulkUpdateOrderStatus);

export default router;
