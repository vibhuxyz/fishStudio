import { create } from "zustand";
import { SCHEDULED_SLOTS } from "@/constants/delivery-slots";
import type { AvailableSlot } from "@repo/shared/delivery-slots";

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
  /** ddMMyyyy, IST. Null for instant, which is always today. */
  selectedDeliveryDate: string | null;
  availableSlots: string[];
  /** The dated, capacity-aware view. Empty until the first validate-cart. */
  deliverySlots: AvailableSlot[];
  instantFee: number;
  setSelectedSlot: (slot: string, deliveryDate: string | null) => void;
  setSlotAvailability: (
    availableSlots: string[],
    instantFee: number,
    deliverySlots?: AvailableSlot[],
  ) => void;
  setBillConfig: (config: BillConfig) => void;
}

export const useDeliverySlotStore = create<DeliverySlotStore>((set, get) => ({
  selectedSlot: null,
  selectedDeliveryDate: null,
  availableSlots: SCHEDULED_SLOTS,
  deliverySlots: [],
  instantFee: 20,
  gstRate: 0,
  packagingCharge: 0,
  baseDeliveryCharge: 49,
  freeDeliveryThreshold: 500,

  setSelectedSlot: (slot, deliveryDate) =>
    set({ selectedSlot: slot, selectedDeliveryDate: deliveryDate }),

  // A slot picked earlier in the session can go stale two ways: instant closes
  // with the store's delivery window, and a scheduled slot can fill up or pass
  // its cutoff. Drop back to unselected rather than letting order-service
  // reject the order at Place Order.
  setSlotAvailability: (availableSlots, instantFee, deliverySlots) => {
    const { selectedSlot: current, selectedDeliveryDate: currentDate } = get();
    const nextSlots = deliverySlots ?? get().deliverySlots;

    const stillAvailable =
      current === "instant"
        ? availableSlots.includes("instant")
        : current != null &&
          nextSlots.some(
            (slot) =>
              slot.key === current && slot.deliveryDate === currentDate && slot.isBookable,
          );

    set({
      availableSlots,
      instantFee,
      deliverySlots: nextSlots,
      selectedSlot: stillAvailable ? current : null,
      selectedDeliveryDate: stillAvailable ? currentDate : null,
    });
  },

  setBillConfig: (config) => set(config),
}));
