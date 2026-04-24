"use client";

import { use, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { useAddressStore } from "@/lib/address-store";
import { axiosInstance } from "@/lib/utils";
import { useUserSession } from "@/hooks/useUserSession";
import { Button } from "@/components/ui/button";

// ── Slot-aware rotating quotes ───────────────────────────────────────────────
// Key format: `${STATUS}_${slotType}` where slotType is "instant" | "scheduled"
const STEP_QUOTES: Record<string, string[]> = {
  // ── INSTANT ──────────────────────────────────────────────────────────────
  PENDING_instant: [
    "⚡ Lightning-fast delivery activated! Hold tight.",
    "You chose instant — we love the urgency. On it! 🚀",
    "Your order is being queued for express dispatch. 🐟",
    "Freshness at the speed of light — almost!",
    "30–45 minutes and it's at your door. The clock starts now. ⏱️",
  ],
  ACCEPTED_instant: [
    "🔪 Hands are moving fast — your instant order is being prepped!",
    "Express prep in progress. Every second counts!",
    "Fresh fish, fast knives — your order is in full swing. ⚡",
    "Our team is in rapid mode just for your instant delivery.",
    "We heard you loud and clear — speed + freshness, coming up! 🐠",
  ],
  SHIPPED_instant: [
    "🛵 Your rider is racing to you right now!",
    "ETA: very soon. Track the door, it's on its way! ⚡",
    "Pedal to the metal — your fresh catch is in motion.",
    "Almost there! Your instant delivery is around the corner. 📍",
    "Your meal is riding the fast lane — stay by the door! 🚀",
  ],
  DELIVERED_instant: [
    "⚡ Lightning delivered! Dig in while it's hot.",
    "Instant delivery done — from us to you in a flash! 🎉",
    "Speed + freshness = delivered. Enjoy every bite! 🐟",
    "That was quick, wasn't it? Bon appétit! 🍽️",
    "Your instant order is here. We promised fast, we delivered fast. ✅",
  ],

  // ── SCHEDULED (morning / evening) ────────────────────────────────────────
  PENDING_scheduled: [
    "📅 Your scheduled delivery is confirmed and on the books.",
    "Good planning leads to great meals. Your slot is reserved!",
    "We've got your delivery window locked in — no stress. 🗓️",
    "Sit back. Your order is scheduled and in safe hands.",
    "Great things are worth scheduling. Your fresh catch awaits! 🐟",
  ],
  ACCEPTED_scheduled: [
    "🔪 Prep is underway — timed perfectly for your delivery slot.",
    "Our team is preparing your order to arrive exactly when you need it.",
    "Scheduled precision: fresh fish, right on time. 🕐",
    "Everything is being prepared to meet your delivery window.",
    "No rush, all care — your order is being hand-prepped with love. 🐠",
  ],
  SHIPPED_scheduled: [
    "🛵 Your scheduled delivery is on the road — right on time!",
    "On the way, right on schedule. Freshness en route! 📍",
    "Our rider has your delivery and is heading your way.",
    "Timed to perfection — your order is in transit. 🗓️",
    "Your delivery window is being honoured. Almost there!",
  ],
  DELIVERED_scheduled: [
    "📅 Delivered right on schedule — just as planned!",
    "Fresh, on-time, and at your door. That's the promise kept. ✅",
    "Your scheduled delivery is complete. Enjoy your meal! 🎉",
    "Perfectly timed, beautifully fresh. Bon appétit! 🐟",
    "From schedule to plate — enjoy every bite! 🍽️",
  ],
};

// ── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  {
    key: "PENDING",
    label: "Order Placed",
    sub: "We received your order",
    icon: ShoppingBag,
    color: "#F59E0B",
    light: "#FEF9EC",
    ring: "#FDE68A",
  },
  {
    key: "ACCEPTED",
    label: "Preparing",
    sub: "Freshly being prepared for you",
    icon: Package,
    color: "#3B82F6",
    light: "#EFF6FF",
    ring: "#BFDBFE",
  },
  {
    key: "SHIPPED",
    label: "On the Way",
    sub: "Out for delivery to you",
    icon: Truck,
    color: "#8B5CF6",
    light: "#F5F3FF",
    ring: "#DDD6FE",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    sub: "Enjoy your order!",
    icon: CheckCircle2,
    color: "#10B981",
    light: "#ECFDF5",
    ring: "#A7F3D0",
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];
const STEP_KEYS = STEPS.map((s) => s.key) as StepKey[];
type DeliveryMode = "instant" | "scheduled";

const SLOT_LABELS: Record<string, string> = {
  instant: "⚡ Instant (30–45 mins)",
  morning: "🌅 Morning (6 AM – 10 AM)",
  evening: "🌆 Evening (5 PM – 9 PM)",
};

// ── Keyframes injected once ──────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes pulse-ring {
    0%,100% { opacity:0.8; transform:scale(1); }
    50%      { opacity:0.2; transform:scale(1.75); }
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes slide-down {
    from { opacity:0; transform:translateY(-10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fade-out {
    0%   { opacity:1; }
    70%  { opacity:1; }
    100% { opacity:0; }
  }
  @keyframes pop-in {
    0%   { opacity:0; transform:scale(0.7); }
    60%  { transform:scale(1.1); }
    100% { opacity:1; transform:scale(1); }
  }
  @keyframes celebrate {
    0%,100% { transform:rotate(0deg) scale(1); }
    25%     { transform:rotate(-8deg) scale(1.15); }
    75%     { transform:rotate(8deg) scale(1.15); }
  }

  /* Quote animations */
  @keyframes q-enter {
    0%   { opacity:0; transform:translateY(14px) scale(0.97); filter:blur(4px); }
    100% { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0); }
  }
  @keyframes q-exit {
    0%   { opacity:1; transform:translateY(0)     scale(1);    filter:blur(0); }
    100% { opacity:0; transform:translateY(-14px) scale(0.97); filter:blur(4px); }
  }
  @keyframes q-bg-shift {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }
  @keyframes q-dot-pulse {
    0%,100% { opacity:1;   transform:scale(1); }
    50%     { opacity:0.3; transform:scale(0.6); }
  }
  @keyframes q-bar-grow {
    from { width:0%; }
    to   { width:100%; }
  }

  /* Delivery map animations */
  @keyframes scooter-bob {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-1.2px); }
  }
  @keyframes wheel-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes route-dash-flow {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -24; }
  }
  @keyframes pin-glow {
    0%,100% { filter: drop-shadow(0 0 3px currentColor); opacity: 1; }
    50%     { filter: drop-shadow(0 0 10px currentColor); opacity: 0.85; }
  }
  @keyframes status-pulse {
    0%,100% { opacity: 1;  transform: scale(1); }
    50%     { opacity: 0.6; transform: scale(0.88); }
  }
  @keyframes bar-fill {
    from { width: 0%; }
  }
  @keyframes delivered-text-shine {
    0%   { background-position: -200% 50%; }
    100% { background-position:  200% 50%; }
  }
  @keyframes delivered-bounce {
    0%,100% { transform: translateY(0) rotate(0); }
    25%     { transform: translateY(-4px) rotate(-5deg); }
    75%     { transform: translateY(-2px) rotate(5deg); }
  }
`;

// ── Per-step gradient palettes ───────────────────────────────────────────────
const STEP_GRADIENTS: Record<string, { from: string; via: string; to: string; text: string }> = {
  PENDING:   { from: "#F59E0B", via: "#FB923C", to: "#EF4444", text: "#fff" },
  ACCEPTED:  { from: "#3B82F6", via: "#6366F1", to: "#8B5CF6", text: "#fff" },
  SHIPPED:   { from: "#8B5CF6", via: "#EC4899", to: "#F43F5E", text: "#fff" },
  DELIVERED: { from: "#10B981", via: "#06B6D4", to: "#3B82F6", text: "#fff" },
};

// ── Rotating quote strip ─────────────────────────────────────────────────────
const CYCLE_MS = 30000;
const FADE_MS  = 500;

function RotatingQuote({ status, slot }: { status: string; slot?: string }) {
  const slotType = slot === "instant" ? "instant" : "scheduled";
  const key      = `${status}_${slotType}`;
  const quotes   = STEP_QUOTES[key] ?? STEP_QUOTES[`PENDING_${slotType}`] ?? STEP_QUOTES["PENDING_instant"];
  const palette  = STEP_GRADIENTS[status] ?? STEP_GRADIENTS.PENDING;

  const [idx,     setIdx]     = useState(() => Math.floor(Math.random() * quotes.length));
  const [phase,   setPhase]   = useState<"enter" | "show" | "exit">("enter");
  const [barKey,  setBarKey]  = useState(0);

  // Reset on status change
  useEffect(() => {
    setIdx(Math.floor(Math.random() * quotes.length));
    setPhase("enter");
    setBarKey((k) => k + 1);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // enter → show after animation completes
    if (phase === "enter") {
      const t = setTimeout(() => setPhase("show"), FADE_MS);
      return () => clearTimeout(t);
    }
    // show → exit after CYCLE_MS
    if (phase === "show") {
      const t = setTimeout(() => setPhase("exit"), CYCLE_MS - FADE_MS * 2);
      return () => clearTimeout(t);
    }
    // exit → next quote
    if (phase === "exit") {
      const t = setTimeout(() => {
        setIdx((i) => (i + 1) % quotes.length);
        setBarKey((k) => k + 1);
        setPhase("enter");
      }, FADE_MS);
      return () => clearTimeout(t);
    }
  }, [phase, quotes.length]);

  const grad = `linear-gradient(135deg, ${palette.from}, ${palette.via}, ${palette.to})`;
  const textAnim =
    phase === "enter" ? `q-enter ${FADE_MS}ms cubic-bezier(0.22,1,0.36,1) forwards` :
    phase === "exit"  ? `q-exit  ${FADE_MS}ms cubic-bezier(0.55,0,1,0.45) forwards` :
    undefined;

  return (
    <div
      className="relative mt-5 overflow-hidden rounded-2xl p-px"
      style={{ background: grad }}
    >
      {/* animated gradient background — use backgroundImage + backgroundSize separately to avoid shorthand conflict */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `linear-gradient(270deg, ${palette.from}, ${palette.via}, ${palette.to}, ${palette.via}, ${palette.from})`,
          backgroundSize: "300% 300%",
          animation: "q-bg-shift 6s ease infinite",
        }}
      />

      {/* inner card */}
      <div className="relative overflow-hidden rounded-[15px] bg-black/30 px-5 py-4 backdrop-blur-sm">
        {/* decorative large quote mark */}
        <span
          className="pointer-events-none absolute -top-2 left-3 select-none text-7xl font-black leading-none text-white/10"
          aria-hidden
        >
          "
        </span>

        {/* three animated dots — cycle indicator */}
        <div className="mb-3 flex items-center gap-1.5">
          {quotes.map((_, i) => (
            <span
              key={i}
              className="block rounded-full transition-all duration-300"
              style={{
                width:  i === idx ? "18px" : "6px",
                height: "6px",
                backgroundColor: i === idx ? "#fff" : "rgba(255,255,255,0.35)",
                animation: i === idx ? "q-dot-pulse 1.4s ease-in-out infinite" : undefined,
              }}
            />
          ))}
        </div>

        {/* Quote text */}
        <p
          key={`${status}-${idx}`}
          className="relative z-10 text-sm font-semibold leading-relaxed tracking-wide"
          style={{
            color: palette.text,
            textShadow: "0 1px 4px rgba(0,0,0,0.25)",
            animation: textAnim,
            minHeight: "2.5rem",
          }}
        >
          {quotes[idx]}
        </p>

        {/* progress bar */}
        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            key={barKey}
            className="h-full rounded-full bg-white/80"
            style={{
              animation: `q-bar-grow ${CYCLE_MS}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Delivery map constants ────────────────────────────────────────────────────
// ── Fine-grained delivery states (≈30 per mode) ──
// t values are evenly spread between 0 and 1 so the rider advances naturally
// across the full delivery window.
const INSTANT_STATES_RAW: readonly { label: string; msg: string }[] = [
  { label: "Partner assigned",        msg: "A rider has accepted your order 🛵" },
  { label: "Heading to the store",    msg: "Your rider is on the way to the store" },
  { label: "Arriving at store",       msg: "Rider is two blocks from the pickup" },
  { label: "At the store",            msg: "Rider has reached the store counter" },
  { label: "Order being handed over", msg: "Fresh pack is being loaded onto the scooter" },
  { label: "Bag secured",             msg: "Your order is now sealed in the insulated bag 🧊" },
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

const SCHEDULED_STATES_RAW: readonly { label: string; msg: string }[] = [
  { label: "Slot activated",          msg: "Your scheduled window has started" },
  { label: "Order queued",            msg: "Your order is queued for dispatch" },
  { label: "Being packed",            msg: "Fresh pack is being prepared for your slot 🧊" },
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

function buildStates(raw: readonly { label: string; msg: string }[]) {
  const n = raw.length;
  // Spread state thresholds evenly between 0.02 (just off store) and 0.98 (almost home)
  return raw.map((s, i) => ({
    ...s,
    t: 0.02 + ((0.98 - 0.02) * i) / (n - 1),
  }));
}

const DELIVERY_MAP_STATES: Record<
  DeliveryMode,
  readonly { label: string; msg: string; t: number }[]
> = {
  instant:   buildStates(INSTANT_STATES_RAW),
  scheduled: buildStates(SCHEDULED_STATES_RAW),
};

const SLOT_WINDOWS: Record<string, string> = {
  instant: "30 – 45 min",
  morning: "6 AM – 10 AM",
  evening: "5 PM – 9 PM",
};

function normalizeDeliveryMinutes(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed);
}

function getDeliveryMode(deliverySlot?: string): DeliveryMode {
  return deliverySlot === "instant" ? "instant" : "scheduled";
}

function getDeliveryEtaMinutes(order: any, fallbackMinutes?: number | null) {
  const storeTimes = order?.store?.cityDeliveryTimes as
    | Record<string, number>
    | undefined;
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

// Zigzag street path (viewBox 400×220) — store on left, home on right
const ROUTE_PATH = "M 42,170 L 105,170 L 105,100 L 180,100 L 180,150 L 255,150 L 255,60 L 360,60 L 360,110";
const STORE_POINT = { x: 42, y: 170 };
const HOME_POINT = { x: 360, y: 110 };

// ── Traffic profile ──
// Maps elapsedT (0→1) → apparentProgress (0→1) with realistic variation:
//   • slow leaving store                     (shop traffic)
//   • quick bursts on open road              (highway)
//   • flat plateaus at signals               (red lights)
//   • gradual slowdown approaching your area (residential lanes)
//   • small pause right before doorstep      (rider finding exact address / parking)
// Deterministic — same order gives same pattern across refreshes.
const TRAFFIC_PROFILE: readonly (readonly [number, number])[] = [
  [0.00, 0.00],
  [0.04, 0.02], // leaving store — slow
  [0.10, 0.08], // easing out of shop area
  [0.18, 0.22], // on main road — quick
  [0.24, 0.30], // steady highway
  [0.30, 0.31], // approaching signal — slowing
  [0.36, 0.33], // signal 1 — almost stopped
  [0.42, 0.45], // signal cleared — back on road
  [0.52, 0.58], // steady cruise
  [0.58, 0.60], // mild traffic
  [0.64, 0.61], // signal 2 — near plateau
  [0.70, 0.73], // green — burst
  [0.78, 0.82], // entering your zone
  [0.84, 0.86], // residential — slower
  [0.90, 0.92], // turning into your lane
  [0.94, 0.94], // parking — plateau
  [0.97, 0.97], // walking up — small plateau
  [1.00, 1.00], // doorstep
];

function trafficEase(t: number) {
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
}

function ScheduledShipCard({
  deliverySlot,
  storeName,
}: {
  deliverySlot?: string;
  storeName?: string;
}) {
  const window = SLOT_WINDOWS[deliverySlot ?? ""] ?? "your scheduled window";
  return (
    <div className="relative mt-5 overflow-hidden rounded-[24px] border border-indigo-200/70 bg-[linear-gradient(135deg,#eef2ff_0%,#e0e7ff_40%,#ede9fe_100%)] p-5 shadow-[0_20px_60px_-28px_rgba(99,102,241,0.45)]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-12 h-36 w-36 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative flex items-start gap-4">
        <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-md">
          <div
            className="absolute inset-0 rounded-2xl bg-indigo-300/20"
            style={{ animation: "pulse-ring 2.4s ease-in-out infinite" }}
          />
          <Calendar className="relative h-6 w-6 text-indigo-600" />
        </div>

        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-indigo-700/80">
            Scheduled Delivery
          </p>
          <h3 className="mt-1 text-lg font-black leading-tight text-slate-900">
            Delivering in {window}
          </h3>
          <p className="mt-1.5 text-sm text-slate-600">
            {storeName ? `${storeName} has` : "Your order has"} dispatched — we&apos;ll arrive
            inside your chosen window.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-bold text-indigo-700 backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full bg-indigo-500"
              style={{ animation: "status-pulse 1.4s ease-in-out infinite" }}
            />
            On schedule
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveredBanner({
  deliverySlot,
  deliveryMinutes,
}: {
  deliverySlot?: string;
  deliveryMinutes?: number | null;
}) {
  const primary =
    deliverySlot === "instant"
      ? `Delivered in about ${normalizeDeliveryMinutes(deliveryMinutes) ?? 40} min`
      : `Delivered in ${SLOT_WINDOWS[deliverySlot ?? ""] ?? "your selected slot"}`;

  return (
    <div className="relative mt-5 overflow-hidden rounded-[28px] border border-emerald-200/70 p-[2px] shadow-[0_30px_90px_-30px_rgba(16,185,129,0.55)]">
      {/* animated gradient border */}
      <div
        className="absolute inset-0 rounded-[28px]"
        style={{
          backgroundImage:
            "linear-gradient(270deg,#10B981,#34D399,#06B6D4,#3B82F6,#10B981)",
          backgroundSize: "300% 300%",
          animation: "q-bg-shift 6s ease infinite",
        }}
      />

      <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_40%,#cffafe_100%)] p-6">
        {/* floating blurs */}
        <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-6 h-32 w-32 rounded-full bg-sky-300/30 blur-3xl" />

        {/* confetti dots */}
        <div
          className="pointer-events-none absolute right-8 top-6 h-2 w-2 rounded-full bg-emerald-500"
          style={{ animation: "delivered-bounce 1.6s ease-in-out infinite" }}
        />
        <div
          className="pointer-events-none absolute right-20 top-10 h-1.5 w-1.5 rounded-full bg-sky-500"
          style={{ animation: "delivered-bounce 2s ease-in-out infinite .3s" }}
        />
        <div
          className="pointer-events-none absolute right-14 top-14 h-1.5 w-1.5 rounded-full bg-amber-500"
          style={{ animation: "delivered-bounce 1.8s ease-in-out infinite .6s" }}
        />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[22px] bg-white shadow-lg shadow-emerald-200/80">
              <div
                className="absolute inset-0 rounded-[22px] bg-emerald-400/20"
                style={{ animation: "pulse-ring 2.2s ease-in-out infinite" }}
              />
              <CheckCircle2
                className="relative h-9 w-9 text-emerald-600"
                style={{ animation: "celebrate 1.2s ease-in-out infinite" }}
              />
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-700/80">
                Delivery Complete
              </p>
              <h3
                className="mt-1 bg-clip-text text-2xl font-black leading-tight tracking-tight text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg,#065F46,#10B981,#06B6D4,#065F46)",
                  backgroundSize: "200% 100%",
                  animation: "delivered-text-shine 3.5s linear infinite",
                }}
              >
                Order delivered successfully! 🎉
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-700">{primary}</p>
              <p className="mt-1 text-sm text-slate-600">
                Hope you enjoy every fresh bite. Leave a review to support us!
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 backdrop-blur">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-700/70">
              Status
            </p>
            <p className="mt-1 text-sm font-black text-emerald-700">Enjoy your meal</p>
            <p className="mt-1 text-xs text-slate-500">
              {deliverySlot === "instant"
                ? "Instant drop completed successfully."
                : `Scheduled slot completed: ${SLOT_WINDOWS[deliverySlot ?? ""] ?? "Scheduled"}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const mode = getDeliveryMode(deliverySlot);
  const states = DELIVERY_MAP_STATES[mode];
  const totalMin = normalizeDeliveryMinutes(deliveryMinutes) ?? 40;

  // 🕐 Real-time progress based on when the order shipped.
  // For a 40-min delivery with 5 states, each state lasts ~8 minutes.
  const totalMs = totalMin * 60 * 1000;

  const [pathLength, setPathLength] = useState(600);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Tick every 6s so speed changes, signal pauses and approach feel live
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 6000);
    return () => clearInterval(id);
  }, []);

  const shippedAtMs = updatedAt ? new Date(updatedAt).getTime() : nowTs;
  const elapsedMs = Math.max(0, nowTs - shippedAtMs);
  const rawT = Math.min(1, elapsedMs / totalMs);

  // Map raw elapsed time through the traffic profile so the rider
  // accelerates, pauses at signals, and slows down into your lane.
  const progress = trafficEase(rawT);

  // Derive state from progress using the state thresholds (t values)
  let stateIdx = 0;
  for (let i = states.length - 1; i >= 0; i--) {
    if (progress >= states[i].t) { stateIdx = i; break; }
  }

  const state = states[stateIdx];
  const percent = Math.round(progress * 100);
  const covered = pathLength * progress;

  // Sample a tiny window ahead in time to measure current speed (slope of
  // traffic curve). Used to detect signal plateaus, slowdowns, bursts.
  const sampleAhead = 0.01;
  const momentarySpeed =
    (trafficEase(Math.min(1, rawT + sampleAhead)) - progress) / sampleAhead;

  const isInTraffic   = momentarySpeed < 0.3 && rawT > 0.02 && rawT < 0.95;
  const isFastLane    = momentarySpeed > 1.4 && rawT < 0.9;
  const isArrivingSoon = progress >= 0.82 && progress < 0.95;
  const isAtDoor       = progress >= 0.95;

  // Floating bubble message that follows the rider
  const bubbleMsg =
    isAtDoor          ? "At your door 🔔"
    : isInTraffic      ? (rawT < 0.4 ? "Stuck at a signal 🚦"
                         : rawT < 0.75 ? "In traffic 🚗"
                         : "Parking 🅿️")
    : isArrivingSoon   ? "Almost there! 📍"
    : isFastLane       ? "Cruising ⚡"
    : null;

  const bubbleColor = isInTraffic ? "#F59E0B" : isAtDoor ? "#22D3EE" : isArrivingSoon ? "#FB923C" : "#10B981";

  const trafficHint: string | null =
    rawT <= 0
      ? null
      : isInTraffic
        ? (rawT < 0.4 ? "Paused at a signal 🚦"
          : rawT < 0.75 ? "Heavy traffic ahead 🚗"
          : "Parking the scooter 🅿️")
        : isFastLane
          ? "Open road — picking up pace ⚡"
          : null;

  // Arrival clock: HH:MM when the order is expected at the doorstep.
  const etaClock = new Date(shippedAtMs + totalMs).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Proximity chip shown near the end of the journey
  const proximityChip =
    isAtDoor        ? { text: "Delivery starting 🔔", bg: "#22D3EE", fg: "#083344" }
    : progress >= 0.88 ? { text: "Rider may call now 📞", bg: "#FACC15", fg: "#422006" }
    : progress >= 0.75 ? { text: "Rider is nearby 📍", bg: "#FDBA74", fg: "#3B1D00" }
    : null;

  // Scooter position + tangent along path
  const scooterPos = (() => {
    if (!pathRef.current) return { x: STORE_POINT.x, y: STORE_POINT.y, angle: 0 };
    const len = pathRef.current.getTotalLength();
    const p = pathRef.current.getPointAtLength(len * progress);
    const ahead = pathRef.current.getPointAtLength(Math.min(len, len * progress + 1));
    const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
    return { x: p.x, y: p.y, angle };
  })();

  const TOTAL_DISTANCE_KM = 3.2;
  const remainingKm = (TOTAL_DISTANCE_KM * (1 - progress)).toFixed(1);
  const remainingMin = Math.max(1, Math.ceil(totalMin * (1 - progress)));

  return (
    <div className="relative mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0f1c] shadow-[0_30px_90px_-30px_rgba(16,185,129,0.55)]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isInTraffic ? "bg-amber-400" : "bg-emerald-400"}`}
              style={{ animation: "status-pulse 1.3s ease-in-out infinite" }}
            />
            <p
              className={`text-[10px] font-black uppercase tracking-[0.32em] ${
                isInTraffic ? "text-amber-300/90" : "text-emerald-300/80"
              }`}
            >
              {isInTraffic ? "Rider in traffic" : isAtDoor ? "At your doorstep" : "Live Delivery"}
            </p>
          </div>
          <h3 className="mt-1 text-xl font-black tracking-tight text-white">
            {isAtDoor ? "Delivering now 🔔" : `Arriving in ${remainingMin} min`}
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-white/60">
            Expected by <span className="font-bold text-white/85">{etaClock}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-right backdrop-blur-md">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">ETA</p>
          <p className={`text-lg font-black ${isInTraffic ? "text-amber-300" : "text-emerald-300"}`}>
            {remainingMin} min
          </p>
          <p className="text-[9px] font-medium text-white/50">by {etaClock}</p>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="relative mt-4 px-4 pb-4">
        <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0b1222]">
          <svg viewBox="0 0 400 220" className="block w-full">
            <defs>
              {/* route glow */}
              <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="b1" />
                <feMerge>
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="pin-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.2" />
              </filter>
              <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
              <linearGradient id="route-grad-traffic" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="60%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>
              <radialGradient id="map-vignette" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
              </radialGradient>
              <pattern id="street-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1e293b" strokeWidth="0.6" />
              </pattern>
            </defs>

            {/* base + grid */}
            <rect width="400" height="220" fill="#0b1222" />
            <rect width="400" height="220" fill="url(#street-grid)" opacity="0.9" />

            {/* faint highways */}
            <path d="M 0,75 Q 200,55 400,85" stroke="#1e293b" strokeWidth="6" fill="none" opacity="0.7" />
            <path d="M 0,170 Q 180,190 400,160" stroke="#1e293b" strokeWidth="5" fill="none" opacity="0.6" />
            <path d="M 120,0 L 120,220" stroke="#1e293b" strokeWidth="4" opacity="0.45" />
            <path d="M 280,0 L 280,220" stroke="#1e293b" strokeWidth="4" opacity="0.45" />

            {/* district labels */}
            <text x="60" y="40" fill="#334155" fontSize="8" fontWeight="700" letterSpacing="2">
              WEST BLOCK
            </text>
            <text x="225" y="210" fill="#334155" fontSize="8" fontWeight="700" letterSpacing="2">
              RIVERSIDE
            </text>

            {/* route — background track */}
            <path
              ref={pathRef}
              d={ROUTE_PATH}
              fill="none"
              stroke="#1e293b"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* route — remaining dashed */}
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="#334155"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 6"
              style={{ animation: "route-dash-flow 1.6s linear infinite" }}
            />
            {/* route — covered, glows green normally, red when stuck in traffic */}
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke={isInTraffic ? "url(#route-grad-traffic)" : "url(#route-grad)"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${covered} ${pathLength}`}
              filter="url(#route-glow)"
              style={{ transition: "stroke-dasharray 700ms cubic-bezier(0.22,1,0.36,1), stroke 500ms ease" }}
            />

            {/* STORE PIN (left) */}
            <g transform={`translate(${STORE_POINT.x},${STORE_POINT.y})`}>
              <circle r="14" fill="#10B981" opacity="0.22" filter="url(#pin-soft)" />
              <circle r="8" fill="#065F46" stroke="#10B981" strokeWidth="2" />
              <circle r="2.5" fill="#A7F3D0" />
              {/* pin label */}
              <g transform="translate(-4,-22)">
                <rect x="0" y="-8" width={Math.min(72, ((storeName || "Hub").length * 4.2) + 14)} height="14" rx="7" fill="#0f172a" stroke="#10B981" strokeOpacity="0.5" strokeWidth="1" />
                <text x="6" y="2" fill="#A7F3D0" fontSize="8.5" fontWeight="700" letterSpacing="0.3">
                  {(storeName || "Hub").slice(0, 12)}
                </text>
              </g>
            </g>

            {/* HOME PIN (right) */}
            <g transform={`translate(${HOME_POINT.x},${HOME_POINT.y})`} style={{ animation: "pin-glow 2.2s ease-in-out infinite", color: "#22D3EE" }}>
              <circle r="15" fill="#22D3EE" opacity="0.22" filter="url(#pin-soft)" />
              <circle r="9" fill="#0E7490" stroke="#22D3EE" strokeWidth="2" />
              {/* little house icon */}
              <path d="M -4,-1 L 0,-5 L 4,-1 L 4,4 L -4,4 Z" fill="#ECFEFF" />
              <g transform="translate(-18,-26)">
                <rect x="0" y="-8" width="40" height="14" rx="7" fill="#0f172a" stroke="#22D3EE" strokeOpacity="0.5" strokeWidth="1" />
                <text x="6" y="2" fill="#A5F3FC" fontSize="8.5" fontWeight="700" letterSpacing="0.4">
                  Home
                </text>
              </g>
            </g>

            {/* FLOATING BUBBLE above scooter */}
            {bubbleMsg && (
              <g
                transform={`translate(${Math.max(44, Math.min(356, scooterPos.x))},${Math.max(26, scooterPos.y - 20)})`}
                style={{ transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)" }}
              >
                {(() => {
                  const w = Math.max(60, bubbleMsg.length * 5.2 + 14);
                  return (
                    <>
                      <rect x={-w / 2} y={-11} width={w} height={18} rx={9}
                            fill="#0b1222" stroke={bubbleColor} strokeWidth={1.2}
                            filter="url(#pin-soft)" opacity="0.95" />
                      <rect x={-w / 2} y={-11} width={w} height={18} rx={9}
                            fill="#0b1222" stroke={bubbleColor} strokeWidth={1.2} />
                      <text x={0} y={3} fontSize={9} fontWeight={800}
                            fill={bubbleColor} textAnchor="middle"
                            style={{ letterSpacing: "0.2px" }}>
                        {bubbleMsg}
                      </text>
                      {/* little downward tail */}
                      <path d={`M -3 7 L 0 12 L 3 7 Z`} fill="#0b1222" stroke={bubbleColor} strokeWidth={1} />
                    </>
                  );
                })()}
              </g>
            )}

            {/* SCOOTER (top-down view: cardboard box + body + red helmet) */}
            <g
              transform={`translate(${scooterPos.x},${scooterPos.y}) rotate(${scooterPos.angle})`}
              style={{ transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)" }}
            >
              <g style={{ animation: "scooter-bob 0.9s ease-in-out infinite" }}>
                {/* outer aura */}
                <circle r="15" fill="#10B981" opacity="0.18" />
                <circle r="10" fill="#10B981" opacity="0.28" />
                {/* cardboard delivery box at back */}
                <rect x="-8" y="-5" width="7" height="10" rx="1" fill="#C2824A" stroke="#7C4A1C" strokeWidth="0.6" />
                <line x1="-4.5" y1="-5" x2="-4.5" y2="5" stroke="#7C4A1C" strokeWidth="0.5" />
                <line x1="-8" y1="0" x2="-1" y2="0" stroke="#7C4A1C" strokeWidth="0.5" />
                {/* scooter body */}
                <rect x="-2" y="-4" width="9" height="8" rx="3" fill="#111827" stroke="#374151" strokeWidth="0.6" />
                {/* side mirrors / handlebars */}
                <line x1="5" y1="-5" x2="7" y2="-7" stroke="#9CA3AF" strokeWidth="0.8" />
                <line x1="5" y1="5" x2="7" y2="7" stroke="#9CA3AF" strokeWidth="0.8" />
                {/* red helmet */}
                <circle cx="4.5" cy="0" r="2.4" fill="#DC2626" stroke="#7F1D1D" strokeWidth="0.5" />
                <rect x="5.2" y="-0.8" width="1.6" height="1.6" rx="0.4" fill="#0f172a" />
                {/* headlight */}
                <circle cx="7.6" cy="0" r="0.9" fill="#FDE68A" opacity="0.9" />
              </g>
            </g>
          </svg>

          {/* ── Glassmorphic Rider Status overlay ── */}
          <div className="absolute left-4 right-4 top-4 rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 shadow-xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-300/80">
                    Rider Status
                  </p>
                  {trafficHint && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold text-amber-200">
                      <span
                        className="h-1 w-1 rounded-full bg-amber-300"
                        style={{ animation: "status-pulse 1s ease-in-out infinite" }}
                      />
                      {trafficHint}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm font-black text-white">
                  {state.label} <span className="text-emerald-300">({percent}%)</span>
                </p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-white/70">
                  {state.msg}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                  Distance
                </p>
                <p className="text-sm font-black text-white">{remainingKm} km</p>
              </div>
            </div>

            {/* progress bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${percent}%`,
                  backgroundImage:
                    "linear-gradient(90deg,#34D399,#10B981,#22D3EE)",
                  boxShadow: "0 0 12px rgba(52,211,153,0.7)",
                  transition: "width 800ms cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </div>
          </div>

          {/* "Rider may call" nudge near end */}
          {progress >= 0.75 && progress < 0.95 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black text-slate-900 shadow-lg">
              <span
                className="h-1.5 w-1.5 rounded-full bg-slate-900"
                style={{ animation: "status-pulse 1s ease-in-out infinite" }}
              />
              Rider may call soon
            </div>
          )}
        </div>

        {/* Footer — store & arrival summary */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                Fulfilled by
              </p>
              <p className="text-sm font-bold text-white">{storeName || "Your store"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Arriving
            </p>
            <p className="text-sm font-black text-emerald-300">in {remainingMin} min</p>
          </div>
        </div>
      </div>
    </div>
  );
}
// ── OrderTracker ─────────────────────────────────────────────────────────────
function OrderTracker({
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
  const upper = (status || "PENDING").toUpperCase() as StepKey | "CANCELLED" | "REJECTED";
  const isCancelled = upper === "CANCELLED" || upper === "REJECTED";
  const activeIdx = isCancelled ? -1 : STEP_KEYS.indexOf(upper as StepKey);
  const currentStep = isCancelled ? null : STEPS[activeIdx] ?? STEPS[0];

  // Track previous status to detect real-time changes
  const prevStatusRef = useRef<string>(upper);
  const [flash, setFlash] = useState(false);
  const [animIdx, setAnimIdx] = useState(activeIdx); // drives staged animation

  useEffect(() => {
    if (prevStatusRef.current === upper) return;
    prevStatusRef.current = upper;

    if (isCancelled) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2800);
      return () => clearTimeout(t);
    }

    // Stage: first animate connector (keep previous step active), then switch
    const newIdx = STEP_KEYS.indexOf(upper as StepKey);
    if (newIdx > animIdx) {
      setFlash(true);
      // After connector fills (700 ms), snap node state forward
      const t1 = setTimeout(() => setAnimIdx(newIdx), 650);
      const t2 = setTimeout(() => setFlash(false), 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    setAnimIdx(newIdx);
  }, [upper]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync on first mount
  useEffect(() => { setAnimIdx(activeIdx); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cancelled / Rejected ──
  if (isCancelled) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 p-6"
        style={{ animation: "slide-down 0.35s ease" }}
      >
        <style>{KEYFRAMES}</style>
        {flash && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.55) 50%,transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s ease",
            }}
          />
        )}
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-rose-100"
            style={{ animation: flash ? "pop-in 0.45s ease" : undefined }}
          >
            <XCircle className="h-7 w-7 text-rose-500" />
          </div>
          <div>
            <p className="text-lg font-black text-rose-700">
              Order {upper === "CANCELLED" ? "Cancelled" : "Rejected"}
            </p>
            <p className="text-sm text-rose-400 font-medium mt-0.5">
              {upper === "CANCELLED"
                ? "This order was cancelled."
                : "This order was rejected by the store."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isDelivered = upper === "DELIVERED";
  const isDeliveryInFlight = upper === "SHIPPED";
  const showQuote = !isCancelled && !isDeliveryInFlight && !isDelivered;
  const showStepTrack = !isDeliveryInFlight && !isDelivered;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-6 transition-colors duration-700"
      style={{
        borderColor: `${currentStep?.ring}`,
        background: currentStep?.light,
        animation: "slide-down 0.35s ease",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Shimmer sweep — triggers on every real-time update */}
      {flash && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(120deg,transparent 20%,rgba(255,255,255,0.65) 50%,transparent 80%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.2s ease",
          }}
        />
      )}

      {/* "Live update" pill */}
      {flash && (
        <div
          className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm"
          style={{
            backgroundColor: currentStep?.color,
            color: "#fff",
            animation: "fade-out 2.8s ease forwards",
          }}
        >
          <Zap className="h-3 w-3" />
          Status Updated
        </div>
      )}

      {/* Headline */}
      <div
        className="relative mb-7 flex items-center gap-4"
        style={{ animation: flash ? "slide-down 0.4s ease" : undefined }}
      >
        <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center">
          {/* outer pulse ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: currentStep?.ring,
              animation: "pulse-ring 2s ease-in-out infinite",
            }}
          />
          {/* inner circle */}
          <div
            className="relative flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-colors duration-500"
            style={{ backgroundColor: currentStep?.color }}
          >
            {isDelivered ? (
              <CheckCircle2
                className="h-6 w-6 text-white"
                style={{ animation: flash ? "celebrate 0.6s ease" : undefined }}
              />
            ) : currentStep ? (
              <currentStep.icon className="h-6 w-6 text-white" />
            ) : null}
          </div>
        </div>

        <div>
          <p
            className="text-xl font-black tracking-tight transition-colors duration-500"
            style={{ color: currentStep?.color }}
          >
            {currentStep?.label}
          </p>
          <p className="mt-0.5 text-sm font-medium text-foreground/60">
            {currentStep?.sub}
          </p>
          {updatedAt && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Last updated{" "}
              {new Date(updatedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Delivery map — only while shipped + instant */}
      {upper === "SHIPPED" && deliverySlot === "instant" && (
        <DeliveryMap
          deliverySlot={deliverySlot}
          deliveryMinutes={deliveryMinutes}
          storeName={storeName}
          updatedAt={updatedAt}
        />
      )}

      {/* Scheduled shipped — simple card, no map, no quote, no progress */}
      {upper === "SHIPPED" && deliverySlot !== "instant" && (
        <ScheduledShipCard
          deliverySlot={deliverySlot}
          storeName={storeName}
        />
      )}

      {upper === "DELIVERED" && (
        <DeliveredBanner
          deliverySlot={deliverySlot}
          deliveryMinutes={deliveryMinutes}
        />
      )}

      {/* Rotating quote */}
      {showQuote && (
        <RotatingQuote status={upper} slot={deliverySlot} />
      )}

      {/* Step track */}
      {showStepTrack && (
        <div className="relative mt-6 flex items-start justify-between">
        {STEPS.map((step, idx) => {
          const done = idx < animIdx;
          const active = idx === animIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative flex flex-1 flex-col items-center">
              {/* ── Left half connector (from previous node centre to this node centre) ── */}
              {idx > 0 && (
                <div
                  className="absolute top-5 h-0.5 -translate-y-1/2"
                  style={{ left: 0, right: "50%" }}
                >
                  <div className="h-full w-full rounded-full bg-black/10" />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: STEPS[idx - 1].color,
                      width: done ? "100%" : active ? "100%" : "0%",
                      transition: "width 700ms cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
              )}

              {/* ── Right half connector (from this node centre to next node centre) ── */}
              {idx < STEPS.length - 1 && (
                <div
                  className="absolute top-5 h-0.5 -translate-y-1/2"
                  style={{ left: "50%", right: 0 }}
                >
                  <div className="h-full w-full rounded-full bg-black/10" />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: step.color,
                      width: done ? "100%" : "0%",
                      transition: "width 700ms cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
              )}

              {/* ── Step node ── */}
              <div className="relative z-10 mb-2 flex h-10 w-10 items-center justify-center">
                {active ? (
                  <>
                    {/* pulsing ring behind node */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundColor: `${step.color}40`,
                        animation: "pulse-ring 1.8s ease-in-out infinite",
                        transform: "scale(1.5)",
                      }}
                    />
                    <div
                      className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-md"
                      style={{
                        backgroundColor: step.color,
                        borderColor: step.color,
                        animation: flash ? "pop-in 0.45s ease" : undefined,
                      }}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </>
                ) : done ? (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2"
                    style={{
                      backgroundColor: step.color,
                      borderColor: step.color,
                      transition: "background-color 500ms, border-color 500ms",
                      animation: flash && idx === animIdx - 1 ? "pop-in 0.45s ease 0.65s both" : undefined,
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black/10 bg-white/60"
                    style={{ transition: "all 500ms" }}
                  >
                    <Icon className="h-4 w-4 text-black/25" />
                  </div>
                )}
              </div>

              {/* Label */}
              <p
                className="px-1 text-center text-[11px] font-bold leading-tight transition-colors duration-500"
                style={{
                  color: done || active ? step.color : "rgba(0,0,0,0.3)",
                }}
              >
                {step.label}
              </p>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isSessionLoading } = useUserSession();
  const selectedLocation = useAddressStore((state) => state.selectedLocation);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/order/api/get-order/${orderId}`);
      return data.order;
    },
    enabled: !!orderId && !!user,
  });

  // ── Real-time WebSocket ──
  useEffect(() => {
    if (!user?.id || !orderId) return;
    const wsBase = (
      process.env.NEXT_PUBLIC_WORKER_WS_URL || "ws://localhost:6006"
    ).replace(/\?.*$/, "");
    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      ws = new WebSocket(`${wsBase}?userId=${user.id}`);
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (
            msg.type === "ORDER_STATUS_UPDATE" &&
            msg.payload?.orderId === orderId
          ) {
            // Invalidate → refetch → OrderTracker detects new status → animates
            queryClient.invalidateQueries({ queryKey: ["order", orderId] });
          }
        } catch {}
      };
      ws.onclose = () => {
        if (!destroyed) reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      destroyed = true;
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [user?.id, orderId, queryClient]);

  // ── Guards ──
  if (isSessionLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-2xl font-bold">Sign in to view this order</h2>
        <Button className="mt-6" onClick={() => router.push("/orders")}>
          View My Orders
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-44 rounded-2xl bg-muted" />
        <div className="h-72 rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 rounded-2xl bg-muted" />
          <div className="h-40 rounded-2xl bg-muted" />
        </div>
        <div className="h-32 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          We couldn't find order #{orderId.slice(-6).toUpperCase()}.
        </p>
        <Button className="mt-6" onClick={() => router.push("/orders")}>
          Back to My Orders
        </Button>
      </div>
    );
  }

  const orderNumber = `#${String(order.id).slice(-6).toUpperCase()}`;
  const slotLabel = SLOT_LABELS[order.deliverySlot] ?? "Standard Delivery";
  const deliveryEtaMinutes = getDeliveryEtaMinutes(
    order,
    selectedLocation?.deliveryTimeMinutes ?? null,
  );
  const itemTotal =
    order.items?.reduce(
      (s: number, i: any) => s + i.price * i.quantity,
      0
    ) ?? 0;
  const billDetails = order.billDetails as Record<string, number> | null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* ── Nav ── */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/orders"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Order {orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            at{" "}
            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* ── Animated tracker ── */}
        <OrderTracker
          status={order.status}
          updatedAt={order.updatedAt}
          deliverySlot={order.deliverySlot}
          deliveryMinutes={deliveryEtaMinutes}
          storeName={order.store?.name}
        />

        {/* ── Items ── */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Items in this Order
            </h2>
          </div>
          <div className="divide-y divide-border">
            {order.items?.map((item: any, idx: number) => {
              const weightGrams = item.selectedOptions?.weightGrams as
                | number
                | undefined;
              const weightLabel = weightGrams
                ? weightGrams >= 1000
                  ? `${(weightGrams / 1000).toFixed(2)} kg`
                  : `${weightGrams} gm`
                : null;
              const optionParts = [
                item.selectedOptions?.cuttingType,
                item.selectedOptions?.pieceSize,
              ].filter(Boolean);

              return (
                <div key={item.id ?? idx} className="flex items-center gap-4 p-5">
                  {/* Product image */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                    {item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product?.title || "Product"}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
                      {item.product?.title ||
                        `Product …${item.productId?.slice(-6)}`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {weightLabel ?? `Qty: ${item.quantity}`}
                    </p>
                    {optionParts.length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {optionParts.join(" · ")}
                      </p>
                    )}
                    {item.selectedOptions?.cuttingCharge > 0 && (
                      <p className="mt-0.5 text-[11px] text-amber-600">
                        ₹{item.selectedOptions.baseRatePerKg}/kg + ₹
                        {item.selectedOptions.cuttingCharge} cut
                        {item.selectedOptions.sizeMultiplier &&
                        item.selectedOptions.sizeMultiplier !== 1
                          ? ` ×${item.selectedOptions.sizeMultiplier}`
                          : ""}{" "}
                        = ₹{item.selectedOptions.effectiveRatePerKg}/kg
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-base font-black text-foreground">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </p>
                    {item.quantity > 1 && !weightLabel && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        ₹{item.price.toFixed(0)} each
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Delivery + Payment ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Delivery */}
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Delivery Details
            </h2>

            {order.deliveryName && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Address
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-relaxed">
                    {order.deliveryName}
                    {order.deliveryPhone && (
                      <>
                        <br />
                        <span className="font-medium text-muted-foreground">
                          {order.deliveryPhone}
                        </span>
                      </>
                    )}
                    <br />
                    {order.deliveryAddress}
                    <br />
                    {[order.deliveryCity, order.deliveryPincode]
                      .filter(Boolean)
                      .join(" – ")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 flex-shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Slot
                </p>
                <p className="mt-0.5 text-sm font-semibold">{slotLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Order Date
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Bill */}
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Bill Details
            </h2>

            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 flex-shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Payment
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {order.paymentMethod === "COD"
                    ? "Pay on Delivery"
                    : order.paymentMethod}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Items Total</span>
                <span>₹{billDetails?.itemTotal ?? itemTotal.toFixed(0)}</span>
              </div>
              {(order.deliveryCharge ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery Charge</span>
                  <span>₹{order.deliveryCharge}</span>
                </div>
              )}
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Discount
                    {order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    −₹{order.discountAmount}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-base font-black text-foreground">
                  Total Paid
                </span>
                <span className="text-2xl font-black text-primary">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Store ── */}
        {order.store?.name && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4">
            <ShoppingBag className="h-4 w-4 flex-shrink-0 text-primary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Fulfilled by
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {order.store.name}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
