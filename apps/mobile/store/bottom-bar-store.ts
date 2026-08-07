import { create } from "zustand";

// Lets a screen with its own fixed bottom bar (e.g. product detail's
// price/Add to Cart bar) tell FloatingCartBar how tall that bar is, so the
// floating "View cart" pill can sit above it instead of overlapping it.
// Deliberately not persisted — this is a transient layout measurement, not
// app state.
interface BottomBarStore {
  height: number;
  setHeight: (height: number) => void;
}

export const useBottomBarStore = create<BottomBarStore>((set) => ({
  height: 0,
  setHeight: (height) => set({ height }),
}));
