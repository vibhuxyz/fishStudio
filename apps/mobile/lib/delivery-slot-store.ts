import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Shared between the cart preview and checkout, so a slot picked on either
// screen shows up on the other.
interface DeliverySlotStore {
  selectedSlot: string;
  setSelectedSlot: (slot: string) => void;
}

export const useDeliverySlotStore = create<DeliverySlotStore>()(
  persist(
    (set) => ({
      selectedSlot: "morning",
      setSelectedSlot: (slot) => set({ selectedSlot: slot }),
    }),
    {
      name: "fish-studio-delivery-slot",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
