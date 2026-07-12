"use client";

import { useSyncExternalStore } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { useCartStore } from "@/lib/cart-store";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";
import { mergeActivity } from "@/lib/activity";
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
// Guard so the server cart is pulled once per login, not on every session check.
let _serverCartLoadedFor: string | null = null;

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
  // Pull the user's server-saved cart so it follows them across devices.
  // Guarded to run once per user, even though session checks may re-set them.
  if (user && _serverCartLoadedFor !== user.id) {
    _serverCartLoadedFor = user.id;
    useCartStore.getState().loadServerCart();
    // Fold any guest browsing history into the now-authenticated account.
    mergeActivity();
  }
  if (!user) {
    _serverCartLoadedFor = null;
  }
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

// Edit Profile — updates name/email server-side and reflects it in the store.
export async function updateProfile(input: { name?: string; email?: string }) {
  const { data } = await axiosInstance.put(
    "/auth/api/update-user-profile",
    input,
    isProtected,
  );
  const updated = data?.user;
  if (updated && currentUser) {
    setAuthenticatedUser({
      ...currentUser,
      name: updated.name ?? currentUser.name,
      email: updated.email ?? currentUser.email,
    });
  }
  return data;
}

// Delete Account — permanently removes the account, then clears local session.
export async function deleteAccount() {
  await axiosInstance.delete("/auth/api/delete-user", isProtected);
  // Reuse the logout teardown so all local state/caches are cleared.
  await logoutUser();
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return { user, isLoggedIn: user !== null };
}
