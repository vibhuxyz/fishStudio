import type { Order } from "@/lib/orders-api";

export type DeliveryMode = "instant" | "scheduled";

export const SLOT_LABELS: Record<string, string> = {
  instant: "⚡ Instant (30–45 mins)",
  morning: "🌅 Morning (6 AM – 10 AM)",
  evening: "🌆 Evening (5 PM – 9 PM)",
};

export const SLOT_WINDOWS: Record<string, string> = {
  instant: "30 – 45 min",
  morning: "6 AM – 10 AM",
  evening: "5 PM – 9 PM",
};

export function normalizeDeliveryMinutes(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed);
}

export function getDeliveryMode(deliverySlot?: string): DeliveryMode {
  return deliverySlot === "instant" ? "instant" : "scheduled";
}

export function getDeliveryEtaMinutes(order: Order, fallbackMinutes?: number | null) {
  const storeTimes = order?.store?.cityDeliveryTimes;
  const lookupKeys = [
    order?.deliveryCity,
    order?.deliveryPincode,
    order?.store?.city,
    order?.store?.pincode,
  ];

  for (const key of lookupKeys) {
    if (!key || typeof key !== "string") continue;
    const resolved = normalizeDeliveryMinutes(storeTimes?.[key]);
    if (resolved) return resolved;
  }

  return normalizeDeliveryMinutes(fallbackMinutes) ?? 40;
}
