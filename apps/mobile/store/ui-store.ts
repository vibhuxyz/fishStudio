import { create } from "zustand";

interface UIStore {
  tabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  tabBarHidden: false,
  setTabBarHidden: (hidden) => set({ tabBarHidden: hidden }),
}));
