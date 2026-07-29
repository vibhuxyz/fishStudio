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

export const useUserStore = create<UserStore>((set) => ({
  user: undefined,
  loaded: false,

  loadUser: async () => {
    try {
      const userString = await SecureStore.getItemAsync("user");
      if (userString) {
        const user = JSON.parse(userString);
        set({ user, loaded: true });
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
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  },

  clearUser: async () => {
    await SecureStore.deleteItemAsync("user").catch(() => {});
    set({ user: undefined });
  },
}));
