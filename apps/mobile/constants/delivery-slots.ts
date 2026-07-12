// Shared delivery slot options — used by both the cart preview and checkout
// so the slot picked on one screen is reflected on the other.
export const SLOT_OPTIONS = [
  { key: "morning", day: "TODAY", time: "1 PM – 3 PM", badge: "Fastest" },
  { key: "evening", day: "TODAY", time: "5 PM – 7 PM", badge: null },
  { key: "tomorrow", day: "TOMORROW", time: "9 AM – 11 AM", badge: null },
] as const;

export type DeliverySlotKey = (typeof SLOT_OPTIONS)[number]["key"];

export const formatSlotLabel = (key: string) => {
  const slot = SLOT_OPTIONS.find((s) => s.key === key);
  if (!slot) return "Select a slot";
  const dayLabel: string = slot.day === "TODAY" ? "Today" : "Tomorrow";
  return `${dayLabel}, ${slot.time}`;
};
