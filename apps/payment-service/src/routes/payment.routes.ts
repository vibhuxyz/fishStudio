import express, { Router } from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  initiateRefund,
} from "../controllers/razorpay.controller.js";
import { isAuthenticated, allowRoles } from "@repo/middlewares";

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
router.post("/refund", isAuthenticated, allowRoles("admin", "seller"), initiateRefund);

export default router;
