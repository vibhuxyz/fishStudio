import { create } from "zustand";

// ActiveOrderWidget reports its own rendered pill height here via onLayout,
// same pattern as FloatingCartBarStore, so FloatingCartBar (and any screen
// reserving bottom scroll space) can stack around it instead of overlapping.
// Deliberately not persisted — this is a transient layout measurement, not
// app state.
interface ActiveOrderWidgetStore {
  height: number;
  setHeight: (height: number) => void;
}

export const useActiveOrderWidgetStore = create<ActiveOrderWidgetStore>((set) => ({
  height: 0,
  setHeight: (height) => set({ height }),
}));
