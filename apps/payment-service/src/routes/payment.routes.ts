import express, { Router } from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  initiateRefund,
  listPaymentsNeedingAttention,
} from "../controllers/payment.controller.js";
import { isAuthenticated, allowRoles, isAdmin, isAdminOrApprovedSeller } from "@repo/middlewares";

const router: Router = express.Router();

// ── Authenticated user routes ─────────────────────────────────────────────
// Step 1: create a Razorpay order for a pending internal order
router.post("/create-razorpay-order", isAuthenticated, allowRoles("user"), createRazorpayOrder);

// Step 2: verify Razorpay payment after checkout modal closes
router.post("/verify", isAuthenticated, allowRoles("user"), verifyPayment);

// ── Razorpay webhook (server-to-server, no auth cookie) ───────────────────
// Raw body is parsed in main.ts specifically for this path
router.post("/webhook", handleWebhook);

// ── Admin/Seller: trigger refund ──────────────────────────────────────────
// Ops-only: no UI calls this yet, it's driven directly against the API.
// Full-amount refunds only; partial refunds are not supported.
router.post("/refund", isAuthenticated, isAdminOrApprovedSeller, initiateRefund);

// ── Admin: payments the automated paths could not settle ──────────────────
router.get("/admin/attention", isAuthenticated, isAdmin, listPaymentsNeedingAttention);

export default router;
