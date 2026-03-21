"use client";

import { useSyncExternalStore } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

export interface User {
  id: string;
  name: string;
  phone: string;
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

export async function logoutUser() {
  try {
    await axiosInstance.post("/auth/api/logout-user", {}, isProtected);
  } catch {
    // keep logout resilient even if the server already cleared the session
  } finally {
    setAuthenticatedUser(null);
  }
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return { user, isLoggedIn: user !== null };
}
