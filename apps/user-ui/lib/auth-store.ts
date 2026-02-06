"use client";

import { useSyncExternalStore } from "react";

interface User {
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

export function loginUser(phone: string) {
  currentUser = {
    name: `User ${phone.slice(-4)}`,
    phone,
  };
  emitChange();
}

export function logoutUser() {
  currentUser = null;
  emitChange();
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return { user, isLoggedIn: user !== null };
}
