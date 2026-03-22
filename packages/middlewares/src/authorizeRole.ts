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

