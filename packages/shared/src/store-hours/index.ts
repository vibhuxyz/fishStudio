// All stores operate on India time regardless of which timezone the host
// container/runtime is set to (services typically run with TZ=UTC), so
// "now" for opening/closing/instant-window comparisons must be computed in
// the store's own timezone rather than via Date#getHours(), which reads the
// process timezone and silently drifts by the UTC offset otherwise.
const STORE_TIMEZONE = "Asia/Kolkata";

export interface StoreHours {
  opening_hours: string | null;
  closing_hours: string | null;
  is_instant_delivery_enabled: boolean;
  instant_delivery_window_start: string | null;
  instant_delivery_window_end: string | null;
}

function toMinutesSinceMidnight(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function nowMinutesInStoreTimezone(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: STORE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function isStoreOpenNow(
  store: Pick<StoreHours, "opening_hours" | "closing_hours">,
): boolean {
  const nowTotal = nowMinutesInStoreTimezone();
  const openMins = toMinutesSinceMidnight(store.opening_hours || "09:00");
  const closeMins = toMinutesSinceMidnight(store.closing_hours || "23:00");
  return nowTotal >= openMins && nowTotal <= closeMins;
}

export function isInstantDeliveryAvailableNow(store: StoreHours): boolean {
  if (!isStoreOpenNow(store)) return false;
  if (!store.is_instant_delivery_enabled) return false;

  const nowTotal = nowMinutesInStoreTimezone();
  const startMins = toMinutesSinceMidnight(
    store.instant_delivery_window_start || "11:00",
  );
  const endMins = toMinutesSinceMidnight(
    store.instant_delivery_window_end || "19:00",
  );
  return nowTotal >= startMins && nowTotal <= endMins;
}
