import type { Request } from "express";

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  phone_number?: string | null;
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
  store?: AuthStore | null;
}

export interface AuthAdmin {
  id: string;
  name: string;
  email: string;
}

// Populated by @repo/middlewares' isAuthenticated based on the verified JWT's role.
export interface AuthenticatedRequest extends Request {
  role?: "admin" | "seller" | "user" | "staff";
  admin?: AuthAdmin;
  seller?: AuthSeller;
  user?: AuthUser;
}
