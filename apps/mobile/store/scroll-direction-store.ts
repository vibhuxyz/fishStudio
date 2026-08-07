import { create } from "zustand";

// Screens with a scrollable feed report whether the user is currently
// scrolling down here, so floating overlays (e.g. ActiveOrderWidget) can
// hide out of the way while reading and reappear on scroll-up or near the
// top. Deliberately not persisted — this is transient scroll state, not app
// state.
interface ScrollDirectionStore {
  scrollingDown: boolean;
  setScrollingDown: (scrollingDown: boolean) => void;
}

export const useScrollDirectionStore = create<ScrollDirectionStore>((set) => ({
  scrollingDown: false,
  setScrollingDown: (scrollingDown) => set({ scrollingDown }),
}));
