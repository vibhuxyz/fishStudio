import type { Request } from "express";

export interface AuthAdmin {
  id: string;
  name: string;
  email: string;
}

export interface AuthStore {
  id: string;
  name: string;
  sellerId: string;
}

export interface AuthSeller {
  id: string;
  name: string;
  email: string;
  isApprovedByAdmin: boolean;
  permissions?: unknown;
  store?: AuthStore | null;
}

export interface AuthStaff {
  id: string;
  name: string;
  email?: string | null;
  username?: string | null;
  role: "ORDER_MANAGER" | "RIDER" | "CUTTING_STAFF";
  isActive: boolean;
  sellerId?: string | null;
  createdAt?: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  addresses?: unknown[];
}

// Populated by @repo/middlewares' isAuthenticated based on the verified JWT's role.
export interface AuthenticatedRequest extends Request {
  role?: "admin" | "seller" | "user" | "staff";
  admin?: AuthAdmin;
  seller?: AuthSeller;
  staff?: AuthStaff;
  user?: AuthUser;
}
