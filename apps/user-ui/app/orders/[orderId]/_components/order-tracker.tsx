"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Package, Truck, CheckCircle2, XCircle, Zap } from "lucide-react";
import { RotatingQuote } from "./rotating-quote";
import { DeliveryMap } from "./delivery-map";
import { ScheduledShipCard } from "./scheduled-ship-card";
import { DeliveredBanner } from "./delivered-banner";

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

export function OrderTracker({
  status,
  updatedAt,
  deliverySlot,
  deliveryMinutes,
  storeName,
  cancelNote,
}: {
  status: string;
  updatedAt?: string;
  deliverySlot?: string;
  deliveryMinutes?: number | null;
  storeName?: string;
  cancelNote?: string;
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
              {cancelNote ??
                (upper === "CANCELLED"
                  ? "This order was cancelled."
                  : "This order was rejected by the store.")}
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
