import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: {
    id: string;
    file_id: string;
    url: string;
  };
}

interface UserStore {
  user: User | undefined;
  loaded: boolean;

  // Shared across every useUser() consumer — previously each component held
  // its own copy via local useState, so updateUserData() in one screen (e.g.
  // profile.tsx after an avatar change) never propagated to others until
  // they remounted.
  loadUser: () => Promise<User | null>;
  updateUser: (user: User) => Promise<void>;
  clearUser: () => Promise<void>;
}

// Which user id we have already pulled the server cart for. Both loadUser
// (app start) and updateUser (sign-in, profile refresh) can put the same user
// in scope repeatedly; the cart should only be merged in once per session or
// a line the user just deleted would keep reappearing.
let serverCartLoadedFor: string | null = null;

/**
 * Merge the account's server-saved cart into the local one, once per user.
 * Imported lazily so this module keeps no load-time edge to the cart store,
 * which imports the User type from here.
 */
async function restoreServerCartOnce(userId: string | undefined) {
  if (!userId || serverCartLoadedFor === userId) return;
  serverCartLoadedFor = userId;
  try {
    const { useStore } = await import("../store");
    await useStore.getState().loadServerCart();
  } catch {
    // Non-critical — the local cart is still intact.
  }
}

export const useUserStore = create<UserStore>((set) => ({
  user: undefined,
  loaded: false,

  loadUser: async () => {
    try {
      const userString = await SecureStore.getItemAsync("user");
      if (userString) {
        const user = JSON.parse(userString);
        set({ user, loaded: true });
        void restoreServerCartOnce(user?.id);
        return user;
      }
      set({ loaded: true });
      return null;
    } catch (error) {
      console.error("Error retrieving user data:", error);
      set({ loaded: true });
      return null;
    }
  },

  updateUser: async (user) => {
    try {
      await SecureStore.setItemAsync("user", JSON.stringify(user));
      set({ user, loaded: true });
      void restoreServerCartOnce(user?.id);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  },

  clearUser: async () => {
    await SecureStore.deleteItemAsync("user").catch(() => {});
    // Cleared so signing back in — as the same user or a different one —
    // pulls the server cart again.
    serverCartLoadedFor = null;
    set({ user: undefined });
  },
}));
