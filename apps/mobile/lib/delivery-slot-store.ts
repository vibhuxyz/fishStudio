import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SCHEDULED_SLOTS } from "@/constants/delivery-slots";

// Shared between the cart preview and checkout, so a slot picked on either
// screen shows up on the other.
interface DeliverySlotStore {
  selectedSlot: string;
  availableSlots: string[];
  instantFee: number;
  setSelectedSlot: (slot: string) => void;
  setSlotAvailability: (availableSlots: string[], instantFee: number) => void;
}

export const useDeliverySlotStore = create<DeliverySlotStore>()(
  persist(
    (set, get) => ({
      selectedSlot: "morning",
      availableSlots: SCHEDULED_SLOTS,
      instantFee: 20,

      setSelectedSlot: (slot) => set({ selectedSlot: slot }),

      // Instant closes with the store's delivery window, so a slot persisted
      // from an earlier session can go stale. Drop back to a scheduled slot
      // rather than letting order-service reject the order at Place Order.
      setSlotAvailability: (availableSlots, instantFee) => {
        const stillAvailable = availableSlots.includes(get().selectedSlot);
        set({
          availableSlots,
          instantFee,
          selectedSlot: stillAvailable ? get().selectedSlot : "morning",
        });
      },
    }),
    {
      name: "fish-studio-delivery-slot",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ selectedSlot: state.selectedSlot }),
    }
  )
);
