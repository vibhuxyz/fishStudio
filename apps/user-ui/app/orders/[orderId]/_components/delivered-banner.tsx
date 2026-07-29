import { CheckCircle2 } from "lucide-react";
import { SLOT_WINDOWS, normalizeDeliveryMinutes } from "./delivery-eta";

export function DeliveredBanner({
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
