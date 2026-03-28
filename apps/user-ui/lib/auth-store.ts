"use client";

import { useSyncExternalStore } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { useCartStore } from "@/lib/cart-store";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";
import { QueryClient } from "@tanstack/react-query";

// Shared reference so logoutUser can invalidate cache
let _queryClient: QueryClient | null = null;
export function setQueryClientRef(qc: QueryClient) {
  _queryClient = qc;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
}

let currentUser: User | null = null;
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): User | null {
  return currentUser;
}

export function setAuthenticatedUser(user: User | null) {
  currentUser = user;
  emitChange();
}

export function isUserLoggedIn(): boolean {
  return currentUser !== null;
}

export async function logoutUser() {
  try {
    await axiosInstance.post("/auth/api/logout-user", {}, isProtected);
  } catch {
    // keep logout resilient even if the server already cleared the session
  } finally {
    setAuthenticatedUser(null);
    // Clear all user-specific state on logout
    useCartStore.getState().clearCart();
    useCouponStore.getState().clearAllCoupons();
    useAddressStore.getState().clearAddresses();
    // Fully remove persisted localStorage entries so no user data lingers
    if (typeof window !== "undefined") {
      localStorage.removeItem("fish-studio-cart");
      localStorage.removeItem("fish-studio-addresses");
      localStorage.removeItem("fish-studio-coupons");
    }
    // Invalidate all cached data so stale products/banners are cleared immediately
    if (_queryClient) {
      _queryClient.invalidateQueries({ queryKey: ["storefront"] });
      _queryClient.invalidateQueries({ queryKey: ["announcement-banners"] });
      _queryClient.invalidateQueries({ queryKey: ["category-banners"] });
    }
  }
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return { user, isLoggedIn: user !== null };
}
