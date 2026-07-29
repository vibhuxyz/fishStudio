// Shared delivery slot options — used by both the cart preview and checkout
// so the slot picked on one screen is reflected on the other.
//
// The keys are the only three order-service accepts (createOrderSchema's
// deliverySlot enum). Inventing a friendlier key here — "tomorrow" and the
// like — makes every order placed on that slot fail validation.
export const SLOT_OPTIONS = [
  { key: "instant", name: "Instant", time: "30 – 45 min", badge: "Fastest" },
  { key: "morning", name: "Morning", time: "6 AM – 10 AM", badge: null },
  { key: "evening", name: "Evening", time: "5 PM – 9 PM", badge: null },
] as const;

export type DeliverySlotKey = (typeof SLOT_OPTIONS)[number]["key"];

// Slots a customer can always pick — instant depends on the store being open
// and inside its instant-delivery window.
export const SCHEDULED_SLOTS: DeliverySlotKey[] = ["morning", "evening"];

export const formatSlotLabel = (key: string) => {
  const slot = SLOT_OPTIONS.find((s) => s.key === key);
  if (!slot) return "Select a slot";
  return `${slot.name} · ${slot.time}`;
};
