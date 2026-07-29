import express, { Router } from "express";

import {
  isAdmin,
  isAuthenticated,
  isSeller,
  isSellerOrStaff,
  isStaff,
  isUser,
} from "@repo/middlewares";
import {
  authRateLimiter,
  otpRateLimiter,
  registrationRateLimiter,
  refreshRateLimiter,
} from "../middlewares/rate-limiter.js";
import {
  getAdmin,
  loginAdmin,
  logOutAdmin,
  registerAdmin,
  verifyAdmin,
  verifyAdminSignupCode,
  generateSellerSignupCode,
  getSellerSignupCodes,
} from "../modules/admin/admin.controller.js";

import {
  addUserAddress,
  deleteUserAddress,
  getUser,
  logOutUser,
  updateUserProfile,
  updateAvatar,
  uploadAvatarImage,
  deleteUser,
  refreshToken,
  sendOtpToUser,
  verifyOtpAndLogin,
} from "../modules/user/user.controller.js";
import {
  getSeller,
  loginSeller,
  logOutSeller,
  registerSeller,
  verifySeller,
  verifySellerSignupCode,
  forgotPasswordSeller,
  resetPasswordSeller,
} from "../modules/seller/seller.controller.js";
import {
  createStore,
  checkPincode,
  updateStore,
  getServiceableAreas,
} from "../modules/seller/store.controller.js";
import {
  getAllSellersForAdmin,
  getSellerDetailsForAdmin,
  updateSellerApproval,
} from "../modules/admin/seller-admin.controller.js";

import {
  getMyStaffs,
  getStaff,
  logOutStaff,
  registerStaff,
  searchStaffByEmail,
  updateStaffAccess,
  verifyStaff,
} from "../modules/staff/staff.controller.js";

const router: Router = express.Router();

router.get("/home", (req, res) => res.send("Hello World"));
router.post("/send-otp", otpRateLimiter, sendOtpToUser);
router.post("/verify-otp", authRateLimiter, verifyOtpAndLogin);
router.get("/logged-in-user", isAuthenticated, isUser, getUser);
router.post("/logout-user", isAuthenticated, isUser, logOutUser);
router.put("/update-user-profile", isAuthenticated, isUser, updateUserProfile);
router.post("/upload-avatar-image", isAuthenticated, isUser, uploadAvatarImage);
router.put("/update-avatar", isAuthenticated, isUser, updateAvatar);
router.delete("/delete-user", isAuthenticated, isUser, deleteUser);

// user address routes
router.post("/add-address", isAuthenticated, isUser, addUserAddress);
router.delete(
  "/delete-address/:addressId",
  isAuthenticated,
  isUser,
  deleteUserAddress,
);

router.post("/refresh-token", refreshRateLimiter, refreshToken);
router.get("/check-pincode", checkPincode);
router.get("/serviceable-areas", getServiceableAreas);

// admin routes
router.post("/admin/verifycode", authRateLimiter, verifyAdminSignupCode);
router.post(
  "/admin/generate-seller-code",
  isAuthenticated,
  isAdmin,
  generateSellerSignupCode,
);
router.get(
  "/admin/seller-codes",
  isAuthenticated,
  isAdmin,
  getSellerSignupCodes,
);
router.post("/admin-registration", registrationRateLimiter, registerAdmin);
router.post("/verify-admin", authRateLimiter, verifyAdmin);
router.post("/login-admin", authRateLimiter, loginAdmin);
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
router.post("/verify-seller-code", authRateLimiter, verifySellerSignupCode);
router.post("/seller-registration", registrationRateLimiter, registerSeller);
router.post("/verify-seller", authRateLimiter, verifySeller);
router.post("/login-seller", authRateLimiter, loginSeller);
router.post("/forgot-password-seller", otpRateLimiter, forgotPasswordSeller);
router.post("/reset-password-seller", authRateLimiter, resetPasswordSeller);
router.post("/create-store", isAuthenticated, isSeller, createStore);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);
router.post("/update-store", isAuthenticated, isSeller, updateStore);
router.post("/logout-seller", isAuthenticated, isSellerOrStaff, logOutSeller);

// staff routes (anyone can register, seller must approve later)
router.post("/staff-registration", registrationRateLimiter, registerStaff);
router.post("/verify-staff", authRateLimiter, verifyStaff);
router.get("/logged-in-staff", isAuthenticated, isStaff, getStaff);
router.post("/logout-staff", isAuthenticated, isStaff, logOutStaff);

// seller staff management routes
router.get("/seller/staffs", isAuthenticated, isSeller, getMyStaffs);
router.get(
  "/seller/staff/search",
  isAuthenticated,
  isSeller,
  searchStaffByEmail,
);
router.put(
  "/seller/staff/access",
  isAuthenticated,
  isSeller,
  updateStaffAccess,
);

export default router;
