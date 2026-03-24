"use client";

import { useSyncExternalStore } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { useCartStore } from "@/lib/cart-store";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";

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
  }
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return { user, isLoggedIn: user !== null };
}
