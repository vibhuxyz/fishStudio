"use client";

import { useEffect, useRef, useState } from "react";
import { Truck } from "lucide-react";
import { type DeliveryMode, getDeliveryMode, normalizeDeliveryMinutes } from "./delivery-eta";

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

// ── Mishap schedule (real-life delivery hiccups) ──
// Each mishap fires at a fraction of baseTotalMs, runs for `durFrac` of it, and
// extends the effective delivery time by `extraMs`. During a mishap we also
// pin a speech bubble and can force a visual backtrack for wrong-turn events.
type MishapKind = "signal" | "traffic" | "wrong-turn" | "address" | "pickup-delay";
type Mishap = {
  kind: MishapKind;
  atFrac: number;     // when it starts (fraction of baseTotalMs)
  durFrac: number;    // how long it lasts (fraction of baseTotalMs)
  extraMs: number;    // extra time added to total
  label: string;      // bubble/tag text
  backtrackFrac?: number; // visual backtrack on progress for wrong-turns
};
const MISHAP_SCHEDULE: readonly Mishap[] = [
  { kind: "pickup-delay", atFrac: 0.05, durFrac: 0.04, extraMs:  45_000,
    label: "Store still packing 🍽️" },
  { kind: "signal",       atFrac: 0.20, durFrac: 0.03, extraMs:  30_000,
    label: "Waiting at signal 🚦" },
  { kind: "traffic",      atFrac: 0.34, durFrac: 0.08, extraMs: 180_000,
    label: "Heavy city traffic 🚗" },
  { kind: "wrong-turn",   atFrac: 0.56, durFrac: 0.05, extraMs: 120_000,
    label: "Missed a turn, rerouting 🔄", backtrackFrac: 0.035 },
  { kind: "signal",       atFrac: 0.70, durFrac: 0.03, extraMs:  45_000,
    label: "Another signal 🚦" },
  { kind: "address",      atFrac: 0.88, durFrac: 0.04, extraMs:  60_000,
    label: "Looking for your address 🔍" },
];

function getMishapState(elapsedMs: number, baseTotalMs: number) {
  // Accumulated extra delay up to now, plus active mishap (if any)
  let extra = 0;
  let active: Mishap | null = null;
  for (const m of MISHAP_SCHEDULE) {
    const startMs = m.atFrac * baseTotalMs;
    const endMs   = (m.atFrac + m.durFrac) * baseTotalMs;
    if (elapsedMs >= endMs) {
      extra += m.extraMs;
    } else if (elapsedMs >= startMs) {
      // partially-through this mishap → linear partial extra
      const frac = (elapsedMs - startMs) / (endMs - startMs);
      extra += m.extraMs * frac;
      active = m;
      break;
    } else {
      break;
    }
  }
  return { extraMs: extra, active };
}

export function DeliveryMap({
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

  // Store's instant-delivery time — already read from backend
  // (order.store.cityDeliveryTimes) in getDeliveryEtaMinutes(). Fallback 40 min.
  const baseMin = normalizeDeliveryMinutes(deliveryMinutes) ?? 40;
  const baseTotalMs = baseMin * 60 * 1000;

  const [pathLength, setPathLength] = useState(600);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Tick every 5s so signal pauses, traffic jams, and arrival updates feel live.
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const shippedAtMs = updatedAt ? new Date(updatedAt).getTime() : nowTs;
  const elapsedMs = Math.max(0, nowTs - shippedAtMs);

  // ── Mishaps extend the effective total time ──
  const mishap = getMishapState(elapsedMs, baseTotalMs);
  const effectiveTotalMs = baseTotalMs + mishap.extraMs;

  // Raw progression against the extended clock, then through the traffic curve
  const rawT = Math.min(1, elapsedMs / effectiveTotalMs);
  let easedProgress = trafficEase(rawT);

  // Wrong-turn visual backtrack: during a wrong-turn mishap, the rider slips
  // back on the map a bit, then recovers.
  if (mishap.active?.kind === "wrong-turn" && mishap.active.backtrackFrac) {
    const startMs = mishap.active.atFrac * baseTotalMs;
    const span = mishap.active.durFrac * baseTotalMs;
    const localT = Math.max(0, Math.min(1, (elapsedMs - startMs) / span));
    // Dip down then return (sin curve)
    const dip = Math.sin(localT * Math.PI) * mishap.active.backtrackFrac;
    easedProgress = Math.max(0, easedProgress - dip);
  }

  // Cap at 94% until staff flips status to DELIVERED. The tracker will unmount
  // this map and render the DeliveredBanner in its place.
  const progress = Math.min(0.94, easedProgress);
  const percent = Math.round(progress * 100);
  const covered = pathLength * progress;

  // Current speed (slope of the traffic curve) to detect plateaus / bursts
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
  const isNearHome = progress >= 0.88; // rider hovering near the home pin

  // Floating bubble message that follows the rider
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

  // Route color shifts to red during traffic / wrong-turn mishaps
  const routeInTroubleMode = isInTraffic || isWrongTurn;

  // Derive state index from eased progress
  let stateIdx = 0;
  for (let i = states.length - 1; i >= 0; i--) {
    if (easedProgress >= states[i].t) { stateIdx = i; break; }
  }
  const state = states[stateIdx];

  // Arrival clock — shifts as mishaps extend effective time
  const arrivalMs = shippedAtMs + effectiveTotalMs;
  const etaClock = new Date(arrivalMs).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
  const remainingMin = Math.max(
    isNearHome ? 1 : 2,
    Math.ceil(Math.max(0, arrivalMs - nowTs) / 60000),
  );

  // Ribbon near the end of the journey
  const proximityChip =
    isNearHome        ? { text: "Delivery in moments 🔔", bg: "bg-cyan-400", fg: "text-cyan-950" }
    : progress >= 0.78 ? { text: "Rider may call you 📞", bg: "bg-amber-300", fg: "text-amber-950" }
    : progress >= 0.65 ? { text: "Rider is nearby 📍", bg: "bg-orange-300", fg: "text-orange-950" }
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

  // Delay badge (shown only if mishaps have added time)
  const addedMinutes = Math.round(mishap.extraMs / 60000);

  return (
    <div className="relative mt-5 overflow-hidden rounded-[24px] sm:rounded-[28px] border border-white/10 bg-[#0a0f1c] shadow-[0_30px_90px_-30px_rgba(16,185,129,0.55)]">
      {/* ── Header ── mobile stacks, desktop side-by-side */}
      <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:pt-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${routeInTroubleMode ? "bg-red-400" : isSignal ? "bg-amber-400" : "bg-emerald-400"}`}
              style={{ animation: "status-pulse 1.3s ease-in-out infinite" }}
            />
            <p
              className={`text-[10px] font-black uppercase tracking-[0.28em] sm:tracking-[0.32em] ${
                routeInTroubleMode ? "text-red-300/90" : isSignal ? "text-amber-300/90" : isNearHome ? "text-cyan-300/90" : "text-emerald-300/80"
              }`}
            >
              {isWrongTurn ? "Rerouting" : isInTraffic ? "Rider in traffic" : isSignal ? "At a signal" : isNearHome ? "Near your home" : "Live Delivery"}
            </p>
            {addedMinutes > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-300/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-200">
                +{addedMinutes} min delay
              </span>
            )}
          </div>
          <h3 className="mt-1 text-lg font-black leading-tight tracking-tight text-white sm:text-xl">
            {isNearHome ? "Arriving any moment 🔔" : `Arriving in ${remainingMin} min`}
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-white/60">
            Expected by <span className="font-bold text-white/85">{etaClock}</span>
            {addedMinutes > 0 && (
              <span className="ml-1 text-red-300/90">(pushed by traffic)</span>
            )}
          </p>
        </div>

        <div className="inline-flex shrink-0 self-start rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-right backdrop-blur-md">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">ETA</p>
            <p className={`text-lg font-black ${routeInTroubleMode ? "text-red-300" : "text-emerald-300"}`}>
              {remainingMin} min
            </p>
            <p className="text-[9px] font-medium text-white/50">by {etaClock}</p>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-[#0b1222] sm:rounded-[20px]">
          <svg viewBox="0 0 400 220" className="block w-full">
            <defs>
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
              <pattern id="street-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1e293b" strokeWidth="0.6" />
              </pattern>
            </defs>

            <rect width="400" height="220" fill="#0b1222" />
            <rect width="400" height="220" fill="url(#street-grid)" opacity="0.9" />

            {/* faint highways */}
            <path d="M 0,75 Q 200,55 400,85" stroke="#1e293b" strokeWidth="6" fill="none" opacity="0.7" />
            <path d="M 0,170 Q 180,190 400,160" stroke="#1e293b" strokeWidth="5" fill="none" opacity="0.6" />
            <path d="M 120,0 L 120,220" stroke="#1e293b" strokeWidth="4" opacity="0.45" />
            <path d="M 280,0 L 280,220" stroke="#1e293b" strokeWidth="4" opacity="0.45" />

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
            {/* route — covered (green normally, red during traffic / wrong-turn) */}
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke={routeInTroubleMode ? "url(#route-grad-traffic)" : "url(#route-grad)"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${covered} ${pathLength}`}
              filter="url(#route-glow)"
              style={{ transition: "stroke-dasharray 700ms cubic-bezier(0.22,1,0.36,1), stroke 500ms ease" }}
            />

            {/* STORE PIN (left) — label placed ABOVE-LEFT so it doesn't collide with overlays */}
            <g transform={`translate(${STORE_POINT.x},${STORE_POINT.y})`}>
              <circle r="14" fill="#10B981" opacity="0.22" filter="url(#pin-soft)" />
              <circle r="8" fill="#065F46" stroke="#10B981" strokeWidth="2" />
              <circle r="2.5" fill="#A7F3D0" />
              <g transform="translate(10,-10)">
                <rect x="0" y="-8" width={Math.min(80, ((storeName || "Store").length * 4.6) + 14)} height="14" rx="7" fill="#0f172a" stroke="#10B981" strokeOpacity="0.5" strokeWidth="1" />
                <text x="7" y="2" fill="#A7F3D0" fontSize="8.5" fontWeight="700" letterSpacing="0.3">
                  {(storeName || "Store").slice(0, 14)}
                </text>
              </g>
            </g>

            {/* HOME PIN (right) */}
            <g transform={`translate(${HOME_POINT.x},${HOME_POINT.y})`} style={{ animation: "pin-glow 2.2s ease-in-out infinite", color: "#22D3EE" }}>
              <circle r="15" fill="#22D3EE" opacity="0.22" filter="url(#pin-soft)" />
              <circle r="9" fill="#0E7490" stroke="#22D3EE" strokeWidth="2" />
              <path d="M -4,-1 L 0,-5 L 4,-1 L 4,4 L -4,4 Z" fill="#ECFEFF" />
              <g transform="translate(-44,-10)">
                <rect x="0" y="-8" width="40" height="14" rx="7" fill="#0f172a" stroke="#22D3EE" strokeOpacity="0.5" strokeWidth="1" />
                <text x="6" y="2" fill="#A5F3FC" fontSize="8.5" fontWeight="700" letterSpacing="0.4">
                  Home
                </text>
              </g>
            </g>

            {/* FLOATING BUBBLE above scooter */}
            {bubbleMsg && (
              <g
                transform={`translate(${Math.max(48, Math.min(352, scooterPos.x))},${Math.max(24, scooterPos.y - 22)})`}
                style={{ transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)" }}
              >
                {(() => {
                  const w = Math.max(64, bubbleMsg.length * 5.2 + 16);
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
                      <path d={`M -3 7 L 0 12 L 3 7 Z`} fill="#0b1222" stroke={bubbleColor} strokeWidth={1} />
                    </>
                  );
                })()}
              </g>
            )}

            {/* SCOOTER */}
            <g
              transform={`translate(${scooterPos.x},${scooterPos.y}) rotate(${scooterPos.angle})`}
              style={{ transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)" }}
            >
              <g style={{ animation: "scooter-bob 0.9s ease-in-out infinite" }}>
                <circle r="15" fill={routeInTroubleMode ? "#EF4444" : "#10B981"} opacity="0.18" />
                <circle r="10" fill={routeInTroubleMode ? "#EF4444" : "#10B981"} opacity="0.28" />
                <rect x="-8" y="-5" width="7" height="10" rx="1" fill="#C2824A" stroke="#7C4A1C" strokeWidth="0.6" />
                <line x1="-4.5" y1="-5" x2="-4.5" y2="5" stroke="#7C4A1C" strokeWidth="0.5" />
                <line x1="-8" y1="0" x2="-1" y2="0" stroke="#7C4A1C" strokeWidth="0.5" />
                <rect x="-2" y="-4" width="9" height="8" rx="3" fill="#111827" stroke="#374151" strokeWidth="0.6" />
                <line x1="5" y1="-5" x2="7" y2="-7" stroke="#9CA3AF" strokeWidth="0.8" />
                <line x1="5" y1="5" x2="7" y2="7" stroke="#9CA3AF" strokeWidth="0.8" />
                <circle cx="4.5" cy="0" r="2.4" fill="#DC2626" stroke="#7F1D1D" strokeWidth="0.5" />
                <rect x="5.2" y="-0.8" width="1.6" height="1.6" rx="0.4" fill="#0f172a" />
                <circle cx="7.6" cy="0" r="0.9" fill="#FDE68A" opacity="0.9" />
              </g>
            </g>
          </svg>

          {/* proximity chip — bottom-right of map */}
          {proximityChip && (
            <div className={`absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full ${proximityChip.bg} px-2.5 py-1 text-[10px] font-black ${proximityChip.fg} shadow-lg`}>
              <span
                className="h-1.5 w-1.5 rounded-full bg-current"
                style={{ animation: "status-pulse 1s ease-in-out infinite" }}
              />
              {proximityChip.text}
            </div>
          )}
        </div>

        {/* ── Rider Status card (BELOW map to prevent overlap) ── */}
        <div className="mt-3 rounded-2xl border border-white/15 bg-white/[0.05] px-3 py-3 backdrop-blur sm:px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-emerald-300/80 sm:tracking-[0.3em]">
                  Rider Status
                </p>
                {mishap.active && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-300/30 bg-red-500/15 px-2 py-0.5 text-[9px] font-bold text-red-200">
                    <span
                      className="h-1 w-1 rounded-full bg-red-300"
                      style={{ animation: "status-pulse 1s ease-in-out infinite" }}
                    />
                    {mishap.active.label}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-black text-white">
                {state.label} <span className="text-emerald-300">({percent}%)</span>
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-white/70 sm:line-clamp-1">
                {mishap.active ? mishap.active.label : state.msg}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                Distance
              </p>
              <p className="text-sm font-black text-white">{remainingKm} km</p>
            </div>
          </div>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${percent}%`,
                backgroundImage: routeInTroubleMode
                  ? "linear-gradient(90deg,#F59E0B,#EF4444)"
                  : "linear-gradient(90deg,#34D399,#10B981,#22D3EE)",
                boxShadow: routeInTroubleMode
                  ? "0 0 12px rgba(239,68,68,0.7)"
                  : "0 0 12px rgba(52,211,153,0.7)",
                transition: "width 800ms cubic-bezier(0.22,1,0.36,1), background-image 500ms ease",
              }}
            />
          </div>
        </div>

        {/* Footer — store & arrival summary */}
        <div className="mt-3 mb-3 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 backdrop-blur sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <Truck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                Fulfilled by
              </p>
              <p className="truncate text-sm font-bold text-white">{storeName || "Your store"}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Arriving
            </p>
            <p className={`text-sm font-black ${routeInTroubleMode ? "text-red-300" : "text-emerald-300"}`}>
              in {remainingMin} min · by {etaClock}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
