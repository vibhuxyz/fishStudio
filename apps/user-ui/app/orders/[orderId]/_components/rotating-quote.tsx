"use client";

import { useEffect, useState } from "react";

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

// Per-step gradient palettes for the quote card background.
const STEP_GRADIENTS: Record<string, { from: string; via: string; to: string; text: string }> = {
  PENDING:   { from: "#F59E0B", via: "#FB923C", to: "#EF4444", text: "#fff" },
  ACCEPTED:  { from: "#3B82F6", via: "#6366F1", to: "#8B5CF6", text: "#fff" },
  SHIPPED:   { from: "#8B5CF6", via: "#EC4899", to: "#F43F5E", text: "#fff" },
  DELIVERED: { from: "#10B981", via: "#06B6D4", to: "#3B82F6", text: "#fff" },
};

const CYCLE_MS = 30000;
const FADE_MS  = 500;

export function RotatingQuote({ status, slot }: { status: string; slot?: string }) {
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
