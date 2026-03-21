import express, { Router } from "express";

import { isAdmin, isAuthenticated, isSeller, isUser } from "@repo/middlewares";
import {
  getAdmin,
  loginAdmin,
  logOutAdmin,
  registerAdmin,
  verifyAdmin,
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
} from "../controller/seller.auth.controller.js";

const router: Router = express.Router();

router.get("/home", (req, res) => res.send("Hello World"));
router.post("/send-otp", sendOtpToUser);
router.post("/verify-otp", verifyOtpAndLogin);
router.get("/logged-in-user", isAuthenticated, isUser, getUser);
router.post("/logout-user", isAuthenticated, isUser, logOutUser);

router.post("/refresh-token", refreshToken);

// admin routes
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

// seller/store Routes
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/login-seller", loginSeller);
router.post("/create-store", createStore);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);

// router.post(
//   "/create-stripe-link",
//   isAuthenticated,
//   isSeller,
//   createStripeConnectLink,
// );

router.post("/logout-seller", isAuthenticated, isSeller, logOutSeller);

// router.post("/forget-password-seller", userForgetPassword);
// router.post("/reset-password-seller", resetUserPassword);
// router.post("/verify-forget-password-seller", verifyUserForgetPassword);

export default router;
