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

/**
 * Money-moving routes (refunds): admins always pass, sellers only once
 * approved. Staff are deliberately excluded — they act within a seller's shop
 * but must not trigger refunds.
 */
export const isAdminOrApprovedSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role === "admin") return next();
  if (req.role === "seller") return isApprovedSeller(req, res, next);
  return next(new AuthError("Access denied"));
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

/**
 * Narrower than `isStaff`: also checks the staff member's *operational* role
 * (ORDER_MANAGER / RIDER / CUTTING_STAFF, stored on the `staffs` record, not
 * the JWT's auth role). Used to keep e.g. a Cutting Staff account from
 * hitting rider-only or order-manager-only endpoints.
 *
 * A seller always passes — they own every staff view in their shop and
 * shouldn't need a second, separate staff login to use them.
 */
export const hasStaffRole =
  (...roles: Array<"ORDER_MANAGER" | "RIDER" | "CUTTING_STAFF">) =>
  (req: any, res: Response, next: NextFunction) => {
    if (req.role === "seller") return next();
    if (req.role !== "staff" || !roles.includes(req.staff?.role)) {
      return next(new AuthError("Access denied"));
    }
    return next();
  };

