"use client";

import { Plus, Trash2 } from "lucide-react";
import type { DeliverySlotDefinition } from "@repo/shared/delivery-slots";

interface DeliverySlotEditorProps {
  slots: DeliverySlotDefinition[];
  onChange: (slots: DeliverySlotDefinition[]) => void;
}

/**
 * Scheduled delivery slots for this store.
 *
 * `key` is deliberately not editable after a slot exists: it is what lands on
 * every order and what a day's capacity is counted against, so renaming one
 * would orphan that day's bookings against the old key while the new key starts
 * from zero. A seller who wants different wording edits the label.
 */
export function DeliverySlotEditor({ slots, onChange }: DeliverySlotEditorProps) {
  const update = (index: number, patch: Partial<DeliverySlotDefinition>) => {
    onChange(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  };

  const addSlot = () => {
    // Derived from the count rather than the length alone so removing the
    // middle slot and adding another can't collide with a key still in use.
    const existing = new Set(slots.map((s) => s.key));
    let n = slots.length + 1;
    while (existing.has(`slot-${n}`)) n++;

    onChange([
      ...slots,
      {
        key: `slot-${n}`,
        label: "New slot",
        startTime: "09:00",
        endTime: "12:00",
        cutoffMinutesBefore: 60,
        capacity: 50,
      },
    ]);
  };

  return (
    <div className="space-y-3">
      {slots.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
          No scheduled slots. Customers will only be able to order instant delivery,
          and only while the store is open.
        </p>
      )}

      {slots.map((slot, index) => (
        <div key={slot.key} className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-slate-400">
              {slot.key}
            </span>
            <button
              type="button"
              onClick={() => onChange(slots.filter((_, i) => i !== index))}
              className="text-slate-400 transition-colors hover:text-red-400"
              aria-label={`Remove ${slot.label}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-slate-300">
                Label shown to customers
              </span>
              <input
                type="text"
                value={slot.label}
                onChange={(e) => update(index, { label: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-slate-300">Starts</span>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => update(index, { startTime: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-slate-300">Ends</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => update(index, { endTime: e.target.value })}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-slate-300">
                Orders per day
              </span>
              <input
                type="number"
                min={1}
                value={slot.capacity}
                onChange={(e) => update(index, { capacity: Math.max(1, Number(e.target.value) || 1) })}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                Once this many orders are taken, the slot stops being offered for that day.
              </span>
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-slate-300">
                Close orders (minutes before start)
              </span>
              <input
                type="number"
                min={0}
                max={1440}
                value={slot.cutoffMinutesBefore}
                onChange={(e) =>
                  update(index, {
                    cutoffMinutesBefore: Math.min(1440, Math.max(0, Number(e.target.value) || 0)),
                  })
                }
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                Prep time. A 09:00 slot with 60 stops taking orders at 08:00.
              </span>
            </label>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSlot}
        className="flex items-center gap-2 rounded-lg border border-dashed border-slate-600 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-blue-500 hover:text-white"
      >
        <Plus className="h-4 w-4" />
        Add a slot
      </button>
    </div>
  );
}
