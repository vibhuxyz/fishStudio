import { HOME_POINT, MISHAP_SCHEDULE, Mishap, ROUTE_SEGMENTS, TRAFFIC_PROFILE } from "./constants";

// Eases raw elapsed-time fraction through a hand-tuned speed profile so the
// rider isn't a constant-velocity dot — slower at the start/end, faster mid-route.
export const trafficEase = (t: number) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  for (let i = 1; i < TRAFFIC_PROFILE.length; i++) {
    const [t1, p1] = TRAFFIC_PROFILE[i];
    if (t <= t1) {
      const [t0, p0] = TRAFFIC_PROFILE[i - 1];
      const span = t1 - t0;
      const localT = span === 0 ? 0 : (t - t0) / span;
      return p0 + (p1 - p0) * localT;
    }
  }
  return 1;
};

export const getMishapState = (elapsedMs: number, baseTotalMs: number) => {
  let extra = 0;
  let active: Mishap | null = null;
  for (const m of MISHAP_SCHEDULE) {
    const startMs = m.atFrac * baseTotalMs;
    const endMs   = (m.atFrac + m.durFrac) * baseTotalMs;
    if (elapsedMs >= endMs) {
      extra += m.extraMs;
    } else if (elapsedMs >= startMs) {
      const frac = (elapsedMs - startMs) / (endMs - startMs);
      extra += m.extraMs * frac;
      active = m;
      break;
    } else {
      break;
    }
  }
  return { extraMs: extra, active };
};

export const pointAlongPath = (progress: number) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const target = clamped * ROUTE_SEGMENTS.totalLength;
  for (const seg of ROUTE_SEGMENTS.segments) {
    if (target <= seg.cum + seg.len) {
      const local = (target - seg.cum) / Math.max(0.0001, seg.len);
      const x = seg.x0 + (seg.x1 - seg.x0) * local;
      const y = seg.y0 + (seg.y1 - seg.y0) * local;
      const angle = (Math.atan2(seg.y1 - seg.y0, seg.x1 - seg.x0) * 180) / Math.PI;
      return { x, y, angle };
    }
  }
  return { x: HOME_POINT.x, y: HOME_POINT.y, angle: 0 };
};

export const normalizeDeliveryMinutes = (value: unknown) => {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed);
};

export const getDeliveryEtaMinutes = (order: any, fallback?: number | null) => {
  const storeTimes = order?.store?.cityDeliveryTimes as Record<string, number> | undefined;
  const lookupKeys = [order?.deliveryCity, order?.deliveryPincode, order?.store?.city, order?.store?.pincode];
  for (const key of lookupKeys) {
    if (!key || typeof key !== "string") continue;
    const resolved = normalizeDeliveryMinutes(storeTimes?.[key]);
    if (resolved) return resolved;
  }
  return normalizeDeliveryMinutes(fallback) ?? 40;
};
