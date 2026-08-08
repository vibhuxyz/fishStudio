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

export const formatSlotLabel = (key: string | null) => {
  const slot = SLOT_OPTIONS.find((s) => s.key === key);
  if (!slot) return "Select a slot";
  return `${slot.name} · ${slot.time}`;
};

// 24h clock bounds for the two scheduled windows, so a placed order can be
// dated to "today" or rolled to the next occurrence of that window — the
// slot key alone (order-service only ever stores "morning"/"evening") never
// tells the customer which calendar day it lands on.
const SLOT_WINDOW: Partial<Record<DeliverySlotKey, { endHour: number }>> = {
  morning: { endHour: 10 },
  evening: { endHour: 21 },
};

// Scheduled slots deliver same-day if the order was placed before its window
// closed; once the window has passed, it's the next occurrence of that slot.
export const getScheduledDeliveryDate = (placedAt: Date, slot: string | null) => {
  const window = slot ? SLOT_WINDOW[slot as DeliverySlotKey] : undefined;
  if (!window) return placedAt;
  const date = new Date(placedAt);
  if (date.getHours() >= window.endHour) {
    date.setDate(date.getDate() + 1);
  }
  return date;
};

export const formatDeliveryDateLabel = (deliveryDate: Date) => {
  const today = new Date();
  const diffDays = Math.round(
    (new Date(deliveryDate).setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) /
      (24 * 60 * 60 * 1000),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return deliveryDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};
