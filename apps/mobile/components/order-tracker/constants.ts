import { Ionicons } from "@expo/vector-icons";

// ─────────────────────────────────────────────────────────────────────────────
// STEPS + STATUS
// ─────────────────────────────────────────────────────────────────────────────
export type StepKey = "PENDING" | "ACCEPTED" | "SHIPPED" | "DELIVERED";
export const STEPS: {
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
  { key: "SHIPPED",   label: "On the Way",   sub: "Out for delivery to you",        icon: "bicycle-outline",       color: "#5A2C96", light: "#F5F3FF", ring: "#DDD6FE" },
  { key: "DELIVERED", label: "Delivered",    sub: "Enjoy your order!",              icon: "checkmark-circle-outline", color: "#10B981", light: "#ECFDF5", ring: "#A7F3D0" },
];
export const STEP_KEYS = STEPS.map((s) => s.key);

export const SLOT_WINDOWS: Record<string, string> = {
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
export const STATES_INSTANT   = buildStates(INSTANT_STATES_RAW);
export const STATES_SCHEDULED = buildStates(SCHEDULED_STATES_RAW);

// ─────────────────────────────────────────────────────────────────────────────
// Traffic profile + mishaps
// ─────────────────────────────────────────────────────────────────────────────
export const TRAFFIC_PROFILE: readonly (readonly [number, number])[] = [
  [0.00, 0.00], [0.04, 0.02], [0.10, 0.08], [0.18, 0.22], [0.24, 0.30],
  [0.30, 0.31], [0.36, 0.33], [0.42, 0.45], [0.52, 0.58], [0.58, 0.60],
  [0.64, 0.61], [0.70, 0.73], [0.78, 0.82], [0.84, 0.86], [0.90, 0.92],
  [0.94, 0.94], [0.97, 0.97], [1.00, 1.00],
];

export type MishapKind = "signal" | "traffic" | "wrong-turn" | "address" | "pickup-delay";
export type Mishap = {
  kind: MishapKind;
  atFrac: number;
  durFrac: number;
  extraMs: number;
  label: string;
  backtrackFrac?: number;
};
export const MISHAP_SCHEDULE: readonly Mishap[] = [
  { kind: "pickup-delay", atFrac: 0.05, durFrac: 0.04, extraMs:  45_000, label: "Store still packing 🍽️" },
  { kind: "signal",       atFrac: 0.20, durFrac: 0.03, extraMs:  30_000, label: "Waiting at signal 🚦" },
  { kind: "traffic",      atFrac: 0.34, durFrac: 0.08, extraMs: 180_000, label: "Heavy city traffic 🚗" },
  { kind: "wrong-turn",   atFrac: 0.56, durFrac: 0.05, extraMs: 120_000, label: "Missed a turn, rerouting 🔄", backtrackFrac: 0.035 },
  { kind: "signal",       atFrac: 0.70, durFrac: 0.03, extraMs:  45_000, label: "Another signal 🚦" },
  { kind: "address",      atFrac: 0.88, durFrac: 0.04, extraMs:  60_000, label: "Looking for your address 🔍" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Route geometry (viewBox 400×220)
// ─────────────────────────────────────────────────────────────────────────────
export const ROUTE_POINTS = [
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
export const ROUTE_PATH_D = ROUTE_POINTS
  .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
  .join(" ");

export const ROUTE_SEGMENTS = (() => {
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

export const STORE_POINT = ROUTE_POINTS[0];
export const HOME_POINT  = ROUTE_POINTS[ROUTE_POINTS.length - 1];

// ─────────────────────────────────────────────────────────────────────────────
// Rotating status quotes
// ─────────────────────────────────────────────────────────────────────────────
export const STEP_QUOTES: Record<string, string[]> = {
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
export const CYCLE_MS = 30000;
