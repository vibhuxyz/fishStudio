import { create } from "zustand";

type Role = "seller" | "staff" | null;

type AuthState = {
  isLoggedIn: boolean;
  role: Role;
  setLoggedIn: (value: boolean) => void;
  setRole: (role: Role) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  role: null,
  setLoggedIn: (value) => set({ isLoggedIn: value }),
  setRole: (role) => set({ role }),
}));
