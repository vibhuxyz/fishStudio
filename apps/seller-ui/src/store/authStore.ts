import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "seller" | "staff" | null;

type AuthState = {
  isLoggedIn: boolean;
  role: Role;
  setLoggedIn: (value: boolean) => void;
  setRole: (role: Role) => void;
};

// Storage key is also read directly by axiosInstance, which needs the role
// synchronously (outside React) to pick the right refresh cookie.
export const AUTH_STORAGE_KEY = "fishstudio-seller-auth";

// The role must survive a reload. Without persistence every page load reset it
// to null, which made useSeller probe /logged-in-seller first — that 401s for a
// staff member, and the 401 tripped the refresh interceptor into logging them
// out before the staff fallback could run. Staff were kicked to /staff/login on
// every single reload.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      role: null,
      setLoggedIn: (value) => set({ isLoggedIn: value }),
      setRole: (role) => set({ role }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ role: state.role, isLoggedIn: state.isLoggedIn }),
    },
  ),
);
