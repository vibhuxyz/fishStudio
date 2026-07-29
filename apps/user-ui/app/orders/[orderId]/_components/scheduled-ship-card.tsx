import { Calendar } from "lucide-react";
import { SLOT_WINDOWS } from "./delivery-eta";

export function ScheduledShipCard({
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
