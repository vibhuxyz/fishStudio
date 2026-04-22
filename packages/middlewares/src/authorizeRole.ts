import { AuthError } from "@repo/error-handlers";
import { Response, NextFunction } from "express";

export const allowRoles =
  (...roles: Array<"admin" | "seller" | "user" | "staff">) =>
  (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.role)) {
      return next(new AuthError("Access denied"));
    }

    return next();
  };

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    return next(new AuthError("Access denied: Seller only"));
  }
  return next();
};

/**
 * Fix #5: approved-seller-only guard. Use on routes that must not be reachable
 * until an admin has approved the seller. `isSeller` alone is not enough.
 *
 * `updateStore` is intentionally exempt so that a newly-registered seller can
 * still finish setting up their shop — every other seller API should layer
 * this on top of `isSeller`.
 */
export const isApprovedSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller" && req.role !== "staff") {
    return next(new AuthError("Access denied: Seller only"));
  }
  const seller = req.seller;
  if (!seller) return next(new AuthError("Access denied: Seller context missing"));
  if (seller.isApprovedByAdmin !== true) {
    return next(new AuthError("Your seller account is pending admin approval."));
  }
  return next();
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "admin") {
    return next(new AuthError("Access denied: Admin only"));
  }

  return next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new AuthError("Access denied: User only"));
  }
  return next();
};

export const isStaff = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "staff") {
    return next(new AuthError("Access denied: Staff only"));
  }
  return next();
};

export const isSellerOrStaff = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller" && req.role !== "staff") {
    return next(new AuthError("Access denied: Seller or Staff only"));
  }
  return next();
};

