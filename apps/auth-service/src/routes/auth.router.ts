import express, { Router } from "express";

import isAuthenticated from "@repo/middlewares/isAuthenticated";
import { isSeller, isUser } from "@repo/middlewares/authorizeRole";
import {
  getUser,
  refreshToken,
  sendOtpToUser,
  verifyOtpAndLogin,
} from "../controller/user.auth.controller";
import {
  createStore,
  getSeller,
  loginSeller,
  registerSeller,
  verifySeller,
} from "../controller/seller.auth.controller";

const router: Router = express.Router();

router.get("/home", (req, res) => res.send("Hello World"));
router.post("/send-otp", sendOtpToUser);
router.post("/verify-otp", verifyOtpAndLogin);
router.get("/logged-in-user", isAuthenticated, isUser, getUser);

router.post("/refresh-token", refreshToken);

// seller/store Routes
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);
router.post("/create-store", createStore);

// router.post(
//   "/create-stripe-link",
//   isAuthenticated,
//   isSeller,
//   createStripeConnectLink,
// );

// router.get("/logout-seller", isAuthenticated, isSeller, logOutSeller);

// router.post("/forget-password-seller", userForgetPassword);
// router.post("/reset-password-seller", resetUserPassword);
// router.post("/verify-forget-password-seller", verifyUserForgetPassword);

export default router;
