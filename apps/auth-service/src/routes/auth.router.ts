import express, { Router } from "express";

import { isAdmin, isAuthenticated, isSeller, isStaff, isUser } from "@repo/middlewares";
import {
  getAdmin,
  loginAdmin,
  logOutAdmin,
  registerAdmin,
  verifyAdmin,
  verifyAdminSignupCode,
  generateSellerSignupCode,
  getSellerSignupCodes,
} from "../controller/admin.auth.controller.js";

import {
  getUser,
  logOutUser,
  refreshToken,
  sendOtpToUser,
  verifyOtpAndLogin,
} from "../controller/user.auth.controller.js";
import {
  createStore,
  getAllSellersForAdmin,
  getSeller,
  getSellerDetailsForAdmin,
  loginSeller,
  logOutSeller,
  registerSeller,
  verifySeller,
  updateSellerApproval,
  verifySellerSignupCode,
} from "../controller/seller.auth.controller.js";
import {
  getMyStaffs,
  getStaff,
  logOutStaff,
  registerStaff,
  searchStaffByEmail,
  updateStaffAccess,
  verifyStaff,
} from "../controller/staff.auth.controller.js";

const router: Router = express.Router();

router.get("/home", (req, res) => res.send("Hello World"));
router.post("/send-otp", sendOtpToUser);
router.post("/verify-otp", verifyOtpAndLogin);
router.get("/logged-in-user", isAuthenticated, isUser, getUser);
router.post("/logout-user", isAuthenticated, isUser, logOutUser);

router.post("/refresh-token", refreshToken);

// admin routes
router.post("/admin/verifycode", verifyAdminSignupCode);
router.post(
  "/admin/generate-seller-code",
  isAuthenticated,
  isAdmin,
  generateSellerSignupCode,
);
router.get("/admin/seller-codes", isAuthenticated, isAdmin, getSellerSignupCodes);
router.post("/admin-registration", registerAdmin);
router.post("/verify-admin", verifyAdmin);
router.post("/login-admin", loginAdmin);
router.get("/logged-in-admin", isAuthenticated, isAdmin, getAdmin);
router.post("/logout-admin", isAuthenticated, isAdmin, logOutAdmin);
router.get("/admin/sellers", isAuthenticated, isAdmin, getAllSellersForAdmin);
router.get(
  "/admin/sellers/:sellerId",
  isAuthenticated,
  isAdmin,
  getSellerDetailsForAdmin,
);
router.put(
  "/admin/sellers/:sellerId/approval",
  isAuthenticated,
  isAdmin,
  updateSellerApproval,
);

// seller/store Routes
router.post("/verify-seller-code", verifySellerSignupCode);
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/login-seller", loginSeller);
router.post("/create-store", createStore);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);
router.post("/logout-seller", isAuthenticated, isSeller, logOutSeller);

// staff routes
router.post("/staff-registration", registerStaff);
router.post("/verify-staff", verifyStaff);
router.get("/logged-in-staff", isAuthenticated, isStaff, getStaff);
router.post("/logout-staff", isAuthenticated, isStaff, logOutStaff);

// seller staff management routes
router.get("/seller/staffs", isAuthenticated, isSeller, getMyStaffs);
router.get("/seller/staff/search", isAuthenticated, isSeller, searchStaffByEmail);
router.put("/seller/staff/access", isAuthenticated, isSeller, updateStaffAccess);

export default router;
