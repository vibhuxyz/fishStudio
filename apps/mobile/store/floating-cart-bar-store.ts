import { create } from "zustand";

// FloatingCartBar reports its own rendered pill height here via onLayout, so
// any scrollable screen it floats over can reserve exactly enough bottom
// padding to clear it — instead of guessing a fixed pixel value that drifts
// out of sync the next time the pill's content changes.
// Deliberately not persisted — this is a transient layout measurement, not
// app state.
interface FloatingCartBarStore {
  height: number;
  setHeight: (height: number) => void;
}

export const useFloatingCartBarStore = create<FloatingCartBarStore>((set) => ({
  height: 0,
  setHeight: (height) => set({ height }),
}));
