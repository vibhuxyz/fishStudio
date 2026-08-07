import { create } from "zustand";
import { SCHEDULED_SLOTS } from "@/constants/delivery-slots";

// Shared between the cart preview and checkout, so a slot picked on either
// screen shows up on the other. Deliberately NOT persisted (no AsyncStorage)
// and defaults to null (nothing selected) — a shopper must actively choose
// a delivery slot every session before Place Order unlocks, rather than
// silently inheriting whatever was picked days ago.
// Seller-set bill config (Store settings in seller-ui) — defaults here match
// order-service's DEFAULT_CART_PRICING fallback, used only until the first
// validate-cart response for the resolved store lands.
interface BillConfig {
  gstRate: number;
  packagingCharge: number;
  baseDeliveryCharge: number;
  freeDeliveryThreshold: number;
}

interface DeliverySlotStore extends BillConfig {
  selectedSlot: string | null;
  availableSlots: string[];
  instantFee: number;
  setSelectedSlot: (slot: string) => void;
  setSlotAvailability: (availableSlots: string[], instantFee: number) => void;
  setBillConfig: (config: BillConfig) => void;
}

export const useDeliverySlotStore = create<DeliverySlotStore>((set, get) => ({
  selectedSlot: null,
  availableSlots: SCHEDULED_SLOTS,
  instantFee: 20,
  gstRate: 0,
  packagingCharge: 0,
  baseDeliveryCharge: 49,
  freeDeliveryThreshold: 500,

  setSelectedSlot: (slot) => set({ selectedSlot: slot }),

  // Instant closes with the store's delivery window, so a slot picked
  // earlier in the session can go stale. Drop back to unselected rather
  // than letting order-service reject the order at Place Order.
  setSlotAvailability: (availableSlots, instantFee) => {
    const current = get().selectedSlot;
    const stillAvailable = current != null && availableSlots.includes(current);
    set({
      availableSlots,
      instantFee,
      selectedSlot: stillAvailable ? current : null,
    });
  },

  setBillConfig: (config) => set(config),
}));
