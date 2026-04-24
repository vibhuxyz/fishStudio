import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Pattern,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

// ─────────────────────────────────────────────────────────────────────────────
// STEPS + STATUS
// ─────────────────────────────────────────────────────────────────────────────
type StepKey = "PENDING" | "ACCEPTED" | "SHIPPED" | "DELIVERED";
const STEPS: {
  key: StepKey;
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  light: string;
  ring: string;
}[] = [
  { key: "PENDING",   label: "Order Placed", sub: "We received your order",        icon: "bag-outline",           color: "#F59E0B", light: "#FEF9EC", ring: "#FDE68A" },
  { key: "ACCEPTED",  label: "Preparing",    sub: "Freshly being prepared for you", icon: "cube-outline",          color: "#3B82F6", light: "#EFF6FF", ring: "#BFDBFE" },
  { key: "SHIPPED",   label: "On the Way",   sub: "Out for delivery to you",        icon: "bicycle-outline",       color: "#8B5CF6", light: "#F5F3FF", ring: "#DDD6FE" },
  { key: "DELIVERED", label: "Delivered",    sub: "Enjoy your order!",              icon: "checkmark-circle-outline", color: "#10B981", light: "#ECFDF5", ring: "#A7F3D0" },
];
const STEP_KEYS = STEPS.map((s) => s.key);

const SLOT_WINDOWS: Record<string, string> = {
  instant: "30 – 45 min",
  morning: "6 AM – 10 AM",
  evening: "5 PM – 9 PM",
};

// ─────────────────────────────────────────────────────────────────────────────
// Fine-grained rider states (≈30 per mode)
// ─────────────────────────────────────────────────────────────────────────────
const INSTANT_STATES_RAW = [
  { label: "Partner assigned",        msg: "A rider has accepted your order 🛵" },
  { label: "Heading to the store",    msg: "Your rider is on the way to the store" },
  { label: "Arriving at store",       msg: "Rider is two blocks from the pickup" },
  { label: "At the store",            msg: "Rider has reached the store counter" },
  { label: "Order being handed over", msg: "Fresh pack is being loaded onto the scooter" },
  { label: "Bag secured",             msg: "Your order is sealed in the insulated bag 🧊" },
  { label: "Leaving the store",       msg: "Rider has started the journey to your address" },
  { label: "On the main road",        msg: "Cruising on the main road towards you" },
  { label: "Passing checkpoint 1",    msg: "Moving steadily through the first junction" },
  { label: "On schedule",             msg: "Traffic looks clear — good pace" },
  { label: "Signal crossing",         msg: "Brief pause at a traffic signal 🚦" },
  { label: "Back on the move",        msg: "Rider is off the signal and accelerating" },
  { label: "Covering distance",       msg: "Halfway progress — moving towards you" },
  { label: "Midway through route",    msg: "About half the distance is behind us" },
  { label: "Leaving the highway",     msg: "Turning off the main road" },
  { label: "Entering your zone",      msg: "Rider is now inside your delivery pincode 📍" },
  { label: "Close to your area",      msg: "Just a few turns away from your lane" },
  { label: "Passing familiar spots",  msg: "Rider is near landmarks around your home" },
  { label: "On your main road",       msg: "Rider has reached your main road" },
  { label: "Entering your lane",      msg: "Turning into your lane now" },
  { label: "Nearby",                  msg: "Rider is less than a minute away" },
  { label: "Slowing down",            msg: "Looking for your address" },
  { label: "Address spotted",         msg: "Rider has matched your address ✅" },
  { label: "Parking the scooter",     msg: "Rider is parking near your building" },
  { label: "Walking up",              msg: "Rider is walking up with your order" },
  { label: "At the building",         msg: "Rider has reached your building entrance" },
  { label: "At your floor",           msg: "Rider is at your floor" },
  { label: "At your doorstep",        msg: "Keep an eye on the door 👀" },
  { label: "About to ring",           msg: "Rider is ringing your bell now 🔔" },
  { label: "Delivery starting",       msg: "Please collect your order" },
];

const SCHEDULED_STATES_RAW = [
  { label: "Slot activated",          msg: "Your scheduled window has started" },
  { label: "Order queued",            msg: "Your order is queued for dispatch" },
  { label: "Being packed",            msg: "Fresh pack being prepared for your slot 🧊" },
  { label: "Temperature sealed",      msg: "Order sealed at the right temperature" },
  { label: "Rider slotted",           msg: "A rider has been assigned to your slot" },
  { label: "Scooter loaded",          msg: "Your bag is loaded onto the scooter" },
  { label: "Ready to depart",         msg: "Rider is about to leave the store" },
  { label: "Leaving the store",       msg: "Rider has begun the scheduled trip" },
  { label: "On the route",            msg: "On the way — right on schedule" },
  { label: "First leg covered",       msg: "The first stretch of the trip is done" },
  { label: "Passing checkpoint 1",    msg: "Steady pace through the first junction" },
  { label: "On main road",            msg: "Cruising on the main road towards you" },
  { label: "Running on time",         msg: "Progress is within your chosen window 🗓️" },
  { label: "Midway",                  msg: "About half the distance is behind us" },
  { label: "Crossing mid-zone",       msg: "Moving through mid-zone junctions" },
  { label: "Signal break",            msg: "Short pause at a traffic signal 🚦" },
  { label: "Back on the move",        msg: "Rider is rolling again" },
  { label: "Leaving the highway",     msg: "Turning off the main road" },
  { label: "Entering your area",      msg: "Inside your delivery pincode now 📍" },
  { label: "Close to your zone",      msg: "Just a few turns away from your street" },
  { label: "On your main road",       msg: "Rider has reached your main road" },
  { label: "Entering your lane",      msg: "Turning into your lane" },
  { label: "Nearby",                  msg: "Rider is less than a minute away" },
  { label: "Slowing down",            msg: "Looking for your exact address" },
  { label: "Address spotted",         msg: "Rider has matched your address ✅" },
  { label: "Parking the scooter",     msg: "Rider is parking near your building" },
  { label: "Walking up",              msg: "Rider is walking up with your order" },
  { label: "At your doorstep",        msg: "Keep an eye on the door 👀" },
  { label: "About to ring",           msg: "Rider is ringing your bell now 🔔" },
  { label: "Delivery starting",       msg: "Please collect your scheduled order" },
];

const buildStates = (raw: { label: string; msg: string }[]) => {
  const n = raw.length;
  return raw.map((s, i) => ({ ...s, t: 0.02 + ((0.98 - 0.02) * i) / (n - 1) }));
};
const STATES_INSTANT   = buildStates(INSTANT_STATES_RAW);
const STATES_SCHEDULED = buildStates(SCHEDULED_STATES_RAW);

// ─────────────────────────────────────────────────────────────────────────────
// Traffic profile + mishaps
// ─────────────────────────────────────────────────────────────────────────────
const TRAFFIC_PROFILE: readonly (readonly [number, number])[] = [
  [0.00, 0.00], [0.04, 0.02], [0.10, 0.08], [0.18, 0.22], [0.24, 0.30],
  [0.30, 0.31], [0.36, 0.33], [0.42, 0.45], [0.52, 0.58], [0.58, 0.60],
  [0.64, 0.61], [0.70, 0.73], [0.78, 0.82], [0.84, 0.86], [0.90, 0.92],
  [0.94, 0.94], [0.97, 0.97], [1.00, 1.00],
];
const trafficEase = (t: number) => {
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

type MishapKind = "signal" | "traffic" | "wrong-turn" | "address" | "pickup-delay";
type Mishap = {
  kind: MishapKind;
  atFrac: number;
  durFrac: number;
  extraMs: number;
  label: string;
  backtrackFrac?: number;
};
const MISHAP_SCHEDULE: readonly Mishap[] = [
  { kind: "pickup-delay", atFrac: 0.05, durFrac: 0.04, extraMs:  45_000, label: "Store still packing 🍽️" },
  { kind: "signal",       atFrac: 0.20, durFrac: 0.03, extraMs:  30_000, label: "Waiting at signal 🚦" },
  { kind: "traffic",      atFrac: 0.34, durFrac: 0.08, extraMs: 180_000, label: "Heavy city traffic 🚗" },
  { kind: "wrong-turn",   atFrac: 0.56, durFrac: 0.05, extraMs: 120_000, label: "Missed a turn, rerouting 🔄", backtrackFrac: 0.035 },
  { kind: "signal",       atFrac: 0.70, durFrac: 0.03, extraMs:  45_000, label: "Another signal 🚦" },
  { kind: "address",      atFrac: 0.88, durFrac: 0.04, extraMs:  60_000, label: "Looking for your address 🔍" },
];
const getMishapState = (elapsedMs: number, baseTotalMs: number) => {
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

// ─────────────────────────────────────────────────────────────────────────────
// Route geometry (viewBox 400×220)
// ─────────────────────────────────────────────────────────────────────────────
const ROUTE_POINTS = [
  { x: 42,  y: 170 },
  { x: 105, y: 170 },
  { x: 105, y: 100 },
  { x: 180, y: 100 },
  { x: 180, y: 150 },
  { x: 255, y: 150 },
  { x: 255, y: 60  },
  { x: 360, y: 60  },
  { x: 360, y: 110 },
];
const ROUTE_PATH_D = ROUTE_POINTS
  .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
  .join(" ");

const ROUTE_SEGMENTS = (() => {
  const segs: { x0: number; y0: number; x1: number; y1: number; len: number; cum: number }[] = [];
  let cum = 0;
  for (let i = 1; i < ROUTE_POINTS.length; i++) {
    const a = ROUTE_POINTS[i - 1];
    const b = ROUTE_POINTS[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, len, cum });
    cum += len;
  }
  return { segments: segs, totalLength: cum };
})();

const STORE_POINT = ROUTE_POINTS[0];
const HOME_POINT  = ROUTE_POINTS[ROUTE_POINTS.length - 1];

const pointAlongPath = (progress: number) => {
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// RotatingQuote
// ─────────────────────────────────────────────────────────────────────────────
const STEP_QUOTES: Record<string, string[]> = {
  PENDING_instant: [
    "⚡ Lightning-fast delivery activated! Hold tight.",
    "You chose instant — we love the urgency. On it! 🚀",
    "Your order is being queued for express dispatch. 🐟",
    "Freshness at the speed of light — almost!",
    "30–45 min and it's at your door. The clock starts now. ⏱️",
  ],
  ACCEPTED_instant: [
    "🔪 Hands moving fast — your instant order is being prepped!",
    "Express prep in progress. Every second counts!",
    "Fresh fish, fast knives — your order is in full swing. ⚡",
    "Our team is in rapid mode just for your instant delivery.",
    "Speed + freshness, coming up! 🐠",
  ],
  PENDING_scheduled: [
    "📅 Your scheduled delivery is confirmed and on the books.",
    "Good planning leads to great meals. Your slot is reserved!",
    "We've got your delivery window locked in — no stress. 🗓️",
    "Sit back. Your order is scheduled and in safe hands.",
    "Great things are worth scheduling. Your fresh catch awaits! 🐟",
  ],
  ACCEPTED_scheduled: [
    "🔪 Prep is underway — timed perfectly for your slot.",
    "Preparing to arrive exactly when you need it.",
    "Scheduled precision: fresh fish, right on time. 🕐",
    "Everything is prepared to meet your delivery window.",
    "No rush, all care — hand-prepped with love. 🐠",
  ],
};
const CYCLE_MS = 30000;

function RotatingQuote({ status, slot, color }: { status: string; slot?: string; color: string }) {
  const slotType = slot === "instant" ? "instant" : "scheduled";
  const key = `${status}_${slotType}`;
  const quotes = STEP_QUOTES[key] ?? STEP_QUOTES[`PENDING_${slotType}`] ?? STEP_QUOTES.PENDING_instant;
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * quotes.length));
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);
  const barProgress = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    barProgress.value = withTiming(1, { duration: CYCLE_MS, easing: Easing.linear });
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 });
      translateY.value = withTiming(-14, { duration: 400 });
      const next = setTimeout(() => {
        setIdx((i) => (i + 1) % quotes.length);
      }, 420);
      return () => clearTimeout(next);
    }, CYCLE_MS - 500);
    return () => clearTimeout(timeout);
  }, [idx, opacity, translateY, barProgress, quotes.length]);

  useEffect(() => {
    setIdx(Math.floor(Math.random() * quotes.length));
  }, [status, slotType]); // eslint-disable-line react-hooks/exhaustive-deps

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  const barStyle = useAnimatedStyle(() => ({
    width: `${barProgress.value * 100}%`,
  }));

  return (
    <View style={{ marginTop: 20, overflow: "hidden", borderRadius: 16, padding: 2, backgroundColor: color }}>
      <View style={{ borderRadius: 14, backgroundColor: "rgba(0,0,0,0.3)", padding: 16 }}>
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
          {quotes.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === idx ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === idx ? "#fff" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </View>
        <Animated.Text
          style={[
            {
              color: "#fff",
              fontSize: 14,
              fontWeight: "600",
              lineHeight: 20,
              minHeight: 40,
              textShadowColor: "rgba(0,0,0,0.25)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            },
            textStyle,
          ]}
        >
          {quotes[idx]}
        </Animated.Text>
        <View style={{ marginTop: 12, height: 2, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 1, overflow: "hidden" }}>
          <Animated.View style={[{ height: "100%", backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 1 }, barStyle]} />
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scheduled ship card
// ─────────────────────────────────────────────────────────────────────────────
function ScheduledShipCard({ deliverySlot, storeName }: { deliverySlot?: string; storeName?: string }) {
  const window = SLOT_WINDOWS[deliverySlot ?? ""] ?? "your scheduled window";
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.6, { duration: 1200 }), withTiming(1, { duration: 1200 })),
      -1,
      false,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + (1.6 - pulse.value) * 0.5,
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={{ marginTop: 20, borderRadius: 24, overflow: "hidden" }}>
      <LinearGradient colors={["#eef2ff", "#e0e7ff", "#ede9fe"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ padding: 20, borderWidth: 1, borderColor: "rgba(99,102,241,0.3)", borderRadius: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
          <View style={{ position: "relative", width: 56, height: 56, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
            <Animated.View style={[{ position: "absolute", inset: 0, borderRadius: 16, backgroundColor: "rgba(99,102,241,0.2)" }, pulseStyle]} />
            <Ionicons name="calendar-outline" size={24} color="#4f46e5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#4338ca", letterSpacing: 2, textTransform: "uppercase" }}>
              Scheduled Delivery
            </Text>
            <Text style={{ marginTop: 4, fontSize: 18, fontWeight: "900", color: "#0f172a", lineHeight: 24 }}>
              Delivering in {window}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 13, color: "#475569" }}>
              {storeName ? `${storeName} has` : "Your order has"} dispatched — we'll arrive inside your chosen window.
            </Text>
            <View style={{ marginTop: 12, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.7)", paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.7)" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#6366f1" }} />
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#4338ca" }}>On schedule</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delivered banner
// ─────────────────────────────────────────────────────────────────────────────
function DeliveredBanner({ deliverySlot, deliveryMinutes }: { deliverySlot?: string; deliveryMinutes?: number | null }) {
  const primary =
    deliverySlot === "instant"
      ? `Delivered in about ${normalizeDeliveryMinutes(deliveryMinutes) ?? 40} min`
      : `Delivered in ${SLOT_WINDOWS[deliverySlot ?? ""] ?? "your selected slot"}`;

  const ring = useSharedValue(1);
  const celebrate = useSharedValue(0);
  useEffect(() => {
    ring.value = withRepeat(
      withSequence(withTiming(1.75, { duration: 1100 }), withTiming(1, { duration: 1100 })),
      -1,
      false,
    );
    celebrate.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 300 }),
        withTiming(0, { duration: 150 }),
        withTiming(8, { duration: 300 }),
        withTiming(0, { duration: 350 }),
      ),
      -1,
      false,
    );
  }, [ring, celebrate]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + (1.75 - ring.value) * 0.6,
    transform: [{ scale: ring.value }],
  }));
  const celebrateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${celebrate.value}deg` }, { scale: 1 + Math.abs(celebrate.value) * 0.015 }],
  }));

  return (
    <View style={{ marginTop: 20, borderRadius: 28, overflow: "hidden", padding: 2 }}>
      <LinearGradient colors={["#10B981", "#34D399", "#06B6D4", "#3B82F6", "#10B981"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 28 }}>
        <LinearGradient colors={["#ecfdf5", "#d1fae5", "#cffafe"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ borderRadius: 26, padding: 24, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
            <View style={{ position: "relative", width: 64, height: 64, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#10B981", shadowOpacity: 0.4, shadowRadius: 8, elevation: 3 }}>
              <Animated.View style={[{ position: "absolute", inset: 0, borderRadius: 22, backgroundColor: "rgba(52,211,153,0.2)" }, ringStyle]} />
              <Animated.View style={celebrateStyle}>
                <Ionicons name="checkmark-circle" size={38} color="#059669" />
              </Animated.View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#047857", letterSpacing: 3, textTransform: "uppercase" }}>
                Delivery Complete
              </Text>
              <Text style={{ marginTop: 4, fontSize: 22, fontWeight: "900", color: "#065F46", lineHeight: 28 }}>
                Order delivered! 🎉
              </Text>
              <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "600", color: "#334155" }}>{primary}</Text>
              <Text style={{ marginTop: 4, fontSize: 13, color: "#475569" }}>
                Hope you enjoy every fresh bite.
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 16, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.8)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" }}>
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#047857", letterSpacing: 2, textTransform: "uppercase" }}>Status</Text>
            <Text style={{ marginTop: 2, fontSize: 13, fontWeight: "900", color: "#047857" }}>Enjoy your meal</Text>
            <Text style={{ marginTop: 2, fontSize: 11, color: "#64748b" }}>
              {deliverySlot === "instant" ? "Instant drop completed." : `Scheduled: ${SLOT_WINDOWS[deliverySlot ?? ""] ?? "Scheduled"}`}
            </Text>
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delivery map
// ─────────────────────────────────────────────────────────────────────────────
function DeliveryMap({
  deliverySlot,
  deliveryMinutes,
  storeName,
  updatedAt,
}: {
  deliverySlot?: string;
  deliveryMinutes?: number | null;
  storeName?: string;
  updatedAt?: string;
}) {
  const mode = deliverySlot === "instant" ? "instant" : "scheduled";
  const states = mode === "instant" ? STATES_INSTANT : STATES_SCHEDULED;
  const baseMin = normalizeDeliveryMinutes(deliveryMinutes) ?? 40;
  const baseTotalMs = baseMin * 60 * 1000;

  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const shippedAtMs = updatedAt ? new Date(updatedAt).getTime() : nowTs;
  const elapsedMs = Math.max(0, nowTs - shippedAtMs);
  const mishap = getMishapState(elapsedMs, baseTotalMs);
  const effectiveTotalMs = baseTotalMs + mishap.extraMs;

  const rawT = Math.min(1, elapsedMs / effectiveTotalMs);
  let easedProgress = trafficEase(rawT);

  if (mishap.active?.kind === "wrong-turn" && mishap.active.backtrackFrac) {
    const startMs = mishap.active.atFrac * baseTotalMs;
    const span = mishap.active.durFrac * baseTotalMs;
    const localT = Math.max(0, Math.min(1, (elapsedMs - startMs) / span));
    const dip = Math.sin(localT * Math.PI) * mishap.active.backtrackFrac;
    easedProgress = Math.max(0, easedProgress - dip);
  }
  const progress = Math.min(0.94, easedProgress);
  const percent = Math.round(progress * 100);

  const sampleAhead = 0.01;
  const momentarySpeed =
    (trafficEase(Math.min(1, rawT + sampleAhead)) - easedProgress) / sampleAhead;

  const isInTraffic =
    mishap.active?.kind === "traffic" ||
    (momentarySpeed < 0.3 && rawT > 0.02 && rawT < 0.95);
  const isWrongTurn = mishap.active?.kind === "wrong-turn";
  const isSignal = mishap.active?.kind === "signal";
  const isAddressHunt = mishap.active?.kind === "address";
  const isFastLane = momentarySpeed > 1.4 && rawT < 0.9 && !mishap.active;
  const isArrivingSoon = progress >= 0.78 && progress < 0.92;
  const isNearHome = progress >= 0.88;

  const bubbleMsg = mishap.active
    ? mishap.active.label
    : isNearHome
      ? "Almost at your door 🔔"
      : isArrivingSoon
        ? "Entering your lane 📍"
        : isFastLane
          ? "Cruising ⚡"
          : null;

  const bubbleColor = isInTraffic || isWrongTurn
    ? "#F87171"
    : isSignal
      ? "#FBBF24"
      : isAddressHunt
        ? "#FB923C"
        : isNearHome
          ? "#22D3EE"
          : isArrivingSoon
            ? "#FCD34D"
            : "#10B981";

  const routeInTroubleMode = isInTraffic || isWrongTurn;

  let stateIdx = 0;
  for (let i = states.length - 1; i >= 0; i--) {
    if (easedProgress >= states[i].t) { stateIdx = i; break; }
  }
  const state = states[stateIdx];

  const arrivalMs = shippedAtMs + effectiveTotalMs;
  const etaClock = new Date(arrivalMs).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const remainingMin = Math.max(isNearHome ? 1 : 2, Math.ceil(Math.max(0, arrivalMs - nowTs) / 60000));

  const proximityChip =
    isNearHome        ? { text: "Delivery in moments 🔔", bg: "#22D3EE", fg: "#083344" }
    : progress >= 0.78 ? { text: "Rider may call you 📞", bg: "#FCD34D", fg: "#78350F" }
    : progress >= 0.65 ? { text: "Rider is nearby 📍",    bg: "#FDBA74", fg: "#7C2D12" }
    : null;

  const scooter = pointAlongPath(progress);
  const TOTAL_DISTANCE_KM = 3.2;
  const remainingKm = (TOTAL_DISTANCE_KM * (1 - progress)).toFixed(1);
  const addedMinutes = Math.round(mishap.extraMs / 60000);

  // ── Animations ──
  const dashOffset = useSharedValue(0);
  const bob = useSharedValue(0);
  const statusPulse = useSharedValue(1);
  useEffect(() => {
    dashOffset.value = withRepeat(withTiming(-24, { duration: 1600, easing: Easing.linear }), -1);
    bob.value = withRepeat(
      withSequence(withTiming(-1.2, { duration: 450 }), withTiming(0, { duration: 450 })),
      -1,
      false,
    );
    statusPulse.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 650 }), withTiming(1, { duration: 650 })),
      -1,
      false,
    );
  }, [dashOffset, bob, statusPulse]);

  const dashedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));
  const scooterBobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));
  const statusDotStyle = useAnimatedStyle(() => ({
    opacity: statusPulse.value,
  }));

  const totalPathLen = ROUTE_SEGMENTS.totalLength;
  const covered = totalPathLen * progress;
  const coveredDashArray = `${covered},${totalPathLen}`;

  const statusText = isWrongTurn ? "Rerouting"
    : isInTraffic ? "Rider in traffic"
    : isSignal ? "At a signal"
    : isNearHome ? "Near your home"
    : "Live Delivery";
  const statusColor = routeInTroubleMode ? "#FCA5A5" : isSignal ? "#FCD34D" : isNearHome ? "#67E8F9" : "#6EE7B7";
  const statusDotColor = routeInTroubleMode ? "#F87171" : isSignal ? "#FBBF24" : "#34D399";

  return (
    <View style={{ marginTop: 20, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#0a0f1c" }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusDotColor }, statusDotStyle]} />
              <Text style={{ fontSize: 10, fontWeight: "900", letterSpacing: 2.5, color: statusColor, textTransform: "uppercase" }}>
                {statusText}
              </Text>
              {addedMinutes > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(252,165,165,0.3)", borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#FCA5A5" }}>+{addedMinutes} min delay</Text>
                </View>
              )}
            </View>
            <Text style={{ marginTop: 4, fontSize: 18, fontWeight: "900", color: "#fff" }}>
              {isNearHome ? "Arriving any moment 🔔" : `Arriving in ${remainingMin} min`}
            </Text>
            <Text style={{ marginTop: 2, fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.6)" }}>
              Expected by <Text style={{ color: "rgba(255,255,255,0.85)", fontWeight: "700" }}>{etaClock}</Text>
              {addedMinutes > 0 && <Text style={{ color: "rgba(252,165,165,0.9)" }}> (pushed by traffic)</Text>}
            </Text>
          </View>
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 12, paddingVertical: 8, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, fontWeight: "700", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>ETA</Text>
            <Text style={{ fontSize: 18, fontWeight: "900", color: routeInTroubleMode ? "#FCA5A5" : "#6EE7B7" }}>{remainingMin} min</Text>
            <Text style={{ fontSize: 9, fontWeight: "500", color: "rgba(255,255,255,0.5)" }}>by {etaClock}</Text>
          </View>
        </View>
      </View>

      {/* SVG map */}
      <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
        <View style={{ borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#0b1222", position: "relative" }}>
          <Svg viewBox="0 0 400 220" width="100%" height={220} preserveAspectRatio="xMidYMid meet">
            <Defs>
              <SvgLinearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#34D399" />
                <Stop offset="50%" stopColor="#10B981" />
                <Stop offset="100%" stopColor="#22D3EE" />
              </SvgLinearGradient>
              <SvgLinearGradient id="route-grad-traffic" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#F59E0B" />
                <Stop offset="60%" stopColor="#EF4444" />
                <Stop offset="100%" stopColor="#B91C1C" />
              </SvgLinearGradient>
              <Pattern id="street-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <Path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1e293b" strokeWidth={0.6} />
              </Pattern>
            </Defs>

            <Rect width="400" height="220" fill="#0b1222" />
            <Rect width="400" height="220" fill="url(#street-grid)" opacity={0.9} />

            {/* Faint highways */}
            <Path d="M 0,75 Q 200,55 400,85" stroke="#1e293b" strokeWidth={6} fill="none" opacity={0.7} />
            <Path d="M 0,170 Q 180,190 400,160" stroke="#1e293b" strokeWidth={5} fill="none" opacity={0.6} />
            <Path d="M 120,0 L 120,220" stroke="#1e293b" strokeWidth={4} opacity={0.45} />
            <Path d="M 280,0 L 280,220" stroke="#1e293b" strokeWidth={4} opacity={0.45} />

            <SvgText x={60} y={40} fill="#334155" fontSize={8} fontWeight="700">WEST BLOCK</SvgText>
            <SvgText x={225} y={210} fill="#334155" fontSize={8} fontWeight="700">RIVERSIDE</SvgText>

            {/* Background track */}
            <Path d={ROUTE_PATH_D} fill="none" stroke="#1e293b" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />

            {/* Animated dashed (remaining) */}
            <AnimatedPath
              d={ROUTE_PATH_D}
              fill="none"
              stroke="#334155"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6,6"
              animatedProps={dashedProps}
            />

            {/* Covered */}
            <Path
              d={ROUTE_PATH_D}
              fill="none"
              stroke={routeInTroubleMode ? "url(#route-grad-traffic)" : "url(#route-grad)"}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={coveredDashArray}
            />

            {/* Store pin */}
            <G x={STORE_POINT.x} y={STORE_POINT.y}>
              <Circle r={14} fill="#10B981" opacity={0.22} />
              <Circle r={8} fill="#065F46" stroke="#10B981" strokeWidth={2} />
              <Circle r={2.5} fill="#A7F3D0" />
              <G x={10} y={-10}>
                <Rect x={0} y={-8} width={Math.min(80, ((storeName || "Store").length * 4.6) + 14)} height={14} rx={7} fill="#0f172a" stroke="#10B981" strokeOpacity={0.5} strokeWidth={1} />
                <SvgText x={7} y={2} fill="#A7F3D0" fontSize={8.5} fontWeight="700">{(storeName || "Store").slice(0, 14)}</SvgText>
              </G>
            </G>

            {/* Home pin */}
            <G x={HOME_POINT.x} y={HOME_POINT.y}>
              <Circle r={15} fill="#22D3EE" opacity={0.22} />
              <Circle r={9} fill="#0E7490" stroke="#22D3EE" strokeWidth={2} />
              <Path d="M -4,-1 L 0,-5 L 4,-1 L 4,4 L -4,4 Z" fill="#ECFEFF" />
              <G x={-44} y={-10}>
                <Rect x={0} y={-8} width={40} height={14} rx={7} fill="#0f172a" stroke="#22D3EE" strokeOpacity={0.5} strokeWidth={1} />
                <SvgText x={6} y={2} fill="#A5F3FC" fontSize={8.5} fontWeight="700">Home</SvgText>
              </G>
            </G>

            {/* Bubble */}
            {bubbleMsg && (() => {
              const w = Math.max(64, bubbleMsg.length * 5.2 + 16);
              const bx = Math.max(48, Math.min(352, scooter.x));
              const by = Math.max(24, scooter.y - 22);
              return (
                <G x={bx} y={by}>
                  <Rect x={-w / 2} y={-11} width={w} height={18} rx={9} fill="#0b1222" stroke={bubbleColor} strokeWidth={1.2} />
                  <SvgText x={0} y={3} fontSize={9} fontWeight="800" fill={bubbleColor} textAnchor="middle">{bubbleMsg}</SvgText>
                  <Path d="M -3 7 L 0 12 L 3 7 Z" fill="#0b1222" stroke={bubbleColor} strokeWidth={1} />
                </G>
              );
            })()}

            {/* Scooter */}
            <G x={scooter.x} y={scooter.y}>
              <G rotation={scooter.angle}>
                <Circle r={15} fill={routeInTroubleMode ? "#EF4444" : "#10B981"} opacity={0.18} />
                <Circle r={10} fill={routeInTroubleMode ? "#EF4444" : "#10B981"} opacity={0.28} />
                <Rect x={-8} y={-5} width={7} height={10} rx={1} fill="#C2824A" stroke="#7C4A1C" strokeWidth={0.6} />
                <Rect x={-2} y={-4} width={9} height={8} rx={3} fill="#111827" stroke="#374151" strokeWidth={0.6} />
                <Circle cx={4.5} cy={0} r={2.4} fill="#DC2626" stroke="#7F1D1D" strokeWidth={0.5} />
                <Circle cx={7.6} cy={0} r={0.9} fill="#FDE68A" opacity={0.9} />
              </G>
            </G>
          </Svg>

          {/* Proximity chip */}
          {proximityChip && (
            <View style={{ position: "absolute", bottom: 8, right: 8, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: proximityChip.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: proximityChip.fg }} />
              <Text style={{ fontSize: 10, fontWeight: "900", color: proximityChip.fg }}>{proximityChip.text}</Text>
            </View>
          )}
        </View>

        {/* Rider status card */}
        <View style={{ marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.05)", padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 9, fontWeight: "900", letterSpacing: 2.5, color: "rgba(110,231,183,0.8)", textTransform: "uppercase" }}>
                  Rider Status
                </Text>
                {mishap.active && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(239,68,68,0.15)", borderColor: "rgba(252,165,165,0.3)", borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999 }}>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#FCA5A5" }} />
                    <Text style={{ fontSize: 9, fontWeight: "700", color: "#FCA5A5" }}>{mishap.active.label}</Text>
                  </View>
                )}
              </View>
              <Text style={{ marginTop: 4, fontSize: 14, fontWeight: "900", color: "#fff" }}>
                {state.label} <Text style={{ color: "#6EE7B7" }}>({percent}%)</Text>
              </Text>
              <Text style={{ marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.7)" }} numberOfLines={2}>
                {mishap.active ? mishap.active.label : state.msg}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 9, fontWeight: "700", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                Distance
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>{remainingKm} km</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={{ marginTop: 12, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <LinearGradient
              colors={routeInTroubleMode ? ["#F59E0B", "#EF4444"] : ["#34D399", "#10B981", "#22D3EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${percent}%`, height: "100%", borderRadius: 3 }}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 12, marginBottom: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: "rgba(16,185,129,0.15)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="bicycle" size={16} color="#6EE7B7" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                Fulfilled by
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }} numberOfLines={1}>
                {storeName || "Your store"}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
              Arriving
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "900", color: routeInTroubleMode ? "#FCA5A5" : "#6EE7B7" }}>
              in {remainingMin} min
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OrderTracker (main export)
// ─────────────────────────────────────────────────────────────────────────────
export function OrderTracker({
  status,
  updatedAt,
  deliverySlot,
  deliveryMinutes,
  storeName,
}: {
  status: string;
  updatedAt?: string;
  deliverySlot?: string;
  deliveryMinutes?: number | null;
  storeName?: string;
}) {
  const upper = (status || "PENDING").toUpperCase();
  const isCancelled = upper === "CANCELLED" || upper === "REJECTED";
  const activeIdx = isCancelled ? -1 : STEP_KEYS.indexOf(upper as StepKey);
  const currentStep = isCancelled ? null : STEPS[activeIdx] ?? STEPS[0];

  const prevStatusRef = useRef<string>(upper);
  const [flash, setFlash] = useState(false);
  const [animIdx, setAnimIdx] = useState(activeIdx);

  useEffect(() => {
    if (prevStatusRef.current === upper) return;
    prevStatusRef.current = upper;
    if (isCancelled) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2800);
      return () => clearTimeout(t);
    }
    const newIdx = STEP_KEYS.indexOf(upper as StepKey);
    if (newIdx > animIdx) {
      setFlash(true);
      const t1 = setTimeout(() => setAnimIdx(newIdx), 650);
      const t2 = setTimeout(() => setFlash(false), 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    setAnimIdx(newIdx);
  }, [upper, isCancelled, animIdx]);

  useEffect(() => { setAnimIdx(activeIdx); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cancelled / rejected
  if (isCancelled) {
    return (
      <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "#FECDD3", backgroundColor: "#FFF1F2", padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FECDD3", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="close-circle" size={32} color="#F43F5E" />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#BE123C" }}>
              Order {upper === "CANCELLED" ? "Cancelled" : "Rejected"}
            </Text>
            <Text style={{ fontSize: 13, color: "#FB7185", marginTop: 2, fontWeight: "500" }}>
              {upper === "CANCELLED" ? "This order was cancelled." : "This order was rejected by the store."}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const isDelivered = upper === "DELIVERED";
  const isShipped = upper === "SHIPPED";
  const showQuote = !isShipped && !isDelivered;
  const showStepTrack = !isShipped && !isDelivered;

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: currentStep?.ring ?? "#e5e7eb",
        backgroundColor: currentStep?.light ?? "#f9fafb",
        padding: 20,
      }}
    >
      {/* Headline */}
      <HeadlineRow step={currentStep} flash={flash} updatedAt={updatedAt} isDelivered={isDelivered} />

      {isShipped && deliverySlot === "instant" && (
        <DeliveryMap
          deliverySlot={deliverySlot}
          deliveryMinutes={deliveryMinutes}
          storeName={storeName}
          updatedAt={updatedAt}
        />
      )}

      {isShipped && deliverySlot !== "instant" && (
        <ScheduledShipCard deliverySlot={deliverySlot} storeName={storeName} />
      )}

      {isDelivered && (
        <DeliveredBanner deliverySlot={deliverySlot} deliveryMinutes={deliveryMinutes} />
      )}

      {showQuote && currentStep && (
        <RotatingQuote status={upper} slot={deliverySlot} color={currentStep.color} />
      )}

      {showStepTrack && <StepTrack animIdx={animIdx} flash={flash} />}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HeadlineRow (with pulse ring) + StepTrack
// ─────────────────────────────────────────────────────────────────────────────
function HeadlineRow({
  step,
  flash,
  updatedAt,
  isDelivered,
}: {
  step: typeof STEPS[number] | null;
  flash: boolean;
  updatedAt?: string;
  isDelivered: boolean;
}) {
  const ring = useSharedValue(1);
  useEffect(() => {
    ring.value = withRepeat(
      withSequence(withTiming(1.75, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      false,
    );
  }, [ring]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + (1.75 - ring.value) * 0.6,
    transform: [{ scale: ring.value }],
  }));

  if (!step) return null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 }}>
      <View style={{ position: "relative", width: 56, height: 56, alignItems: "center", justifyContent: "center" }}>
        <Animated.View style={[{ position: "absolute", inset: 0, borderRadius: 28, backgroundColor: step.ring }, ringStyle]} />
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: step.color, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={isDelivered ? "checkmark-circle" : step.icon} size={24} color="#fff" />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: step.color, letterSpacing: -0.3 }}>
          {step.label}
        </Text>
        <Text style={{ fontSize: 13, color: "rgba(17,24,39,0.6)", fontWeight: "500", marginTop: 2 }}>{step.sub}</Text>
        {updatedAt && (
          <Text style={{ fontSize: 11, color: "rgba(107,114,128,0.85)", marginTop: 4 }}>
            Last updated {new Date(updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        )}
      </View>
      {flash && (
        <View style={{ position: "absolute", top: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: step.color }}>
          <Ionicons name="flash" size={10} color="#fff" />
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>Status Updated</Text>
        </View>
      )}
    </View>
  );
}

function StepTrack({ animIdx, flash }: { animIdx: number; flash: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 8 }}>
      {STEPS.map((step, idx) => {
        const done = idx < animIdx;
        const active = idx === animIdx;
        return (
          <View key={step.key} style={{ flex: 1, alignItems: "center", position: "relative" }}>
            {/* Left connector */}
            {idx > 0 && (
              <View style={{ position: "absolute", top: 20, left: 0, right: "50%", height: 2 }}>
                <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 1 }} />
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: done || active ? "100%" : "0%",
                    backgroundColor: STEPS[idx - 1].color,
                    borderRadius: 1,
                  }}
                />
              </View>
            )}
            {/* Right connector */}
            {idx < STEPS.length - 1 && (
              <View style={{ position: "absolute", top: 20, left: "50%", right: 0, height: 2 }}>
                <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 1 }} />
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: done ? "100%" : "0%",
                    backgroundColor: step.color,
                    borderRadius: 1,
                  }}
                />
              </View>
            )}

            {/* Node */}
            <View style={{ zIndex: 10, width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
              {active ? (
                <ActiveNode color={step.color} icon={step.icon} flash={flash} />
              ) : done ? (
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: step.color, borderWidth: 2, borderColor: step.color, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </View>
              ) : (
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.6)", borderWidth: 2, borderColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={step.icon} size={16} color="rgba(0,0,0,0.25)" />
                </View>
              )}
            </View>
            <Text
              style={{
                marginTop: 8,
                fontSize: 11,
                fontWeight: "700",
                color: done || active ? step.color : "rgba(0,0,0,0.3)",
                textAlign: "center",
              }}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ActiveNode({ color, icon, flash }: { color: string; icon: keyof typeof Ionicons.glyphMap; flash: boolean }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.5, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + (1.5 - pulse.value) * 0.85,
    transform: [{ scale: pulse.value }],
  }));
  return (
    <>
      <Animated.View
        style={[
          { position: "absolute", inset: 0, borderRadius: 20, backgroundColor: color, opacity: 0.25 },
          pulseStyle,
        ]}
      />
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: color,
          borderWidth: 2,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: color,
          shadowOpacity: flash ? 0.4 : 0.2,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
    </>
  );
}

// Unused but exported for consistency with web
const styles = StyleSheet.create({});
export { styles };
