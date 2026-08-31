"use client";

import React from "react";
import { X } from "lucide-react";

/**
 * The filters the seller order dashboard can apply. All optional, and all
 * combined with AND server-side (see parseSellerOrderFilters) — picking a date
 * range and a slot and a status narrows to the intersection rather than one
 * replacing another.
 */
export type OrderFilters = {
  statuses: string[];
  slots: string[];
  dateFrom: string;
  dateTo: string;
};

export const EMPTY_FILTERS: OrderFilters = {
  statuses: [],
  slots: [],
  dateFrom: "",
  dateTo: "",
};

export const hasActiveFilters = (f: OrderFilters) =>
  f.statuses.length > 0 || f.slots.length > 0 || !!f.dateFrom || !!f.dateTo;

/** Serialise for the query string. Repeated keys, so the server sees a list. */
export const filtersToParams = (f: OrderFilters, params: URLSearchParams) => {
  for (const s of f.statuses) params.append("status", s);
  for (const s of f.slots) params.append("slot", s);
  if (f.dateFrom) params.set("dateFrom", f.dateFrom);
  if (f.dateTo) params.set("dateTo", f.dateTo);
};

const STATUS_OPTIONS = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED_TO_RIDER",
  "SHIPPED",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
];

// Lowercase on the wire — Order.deliverySlot stores the lowercase value and
// clients compare against these literals, so the case is load-bearing.
const SLOT_OPTIONS = [
  { value: "instant", label: "Instant" },
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
];

const chipClass = (active: boolean) =>
  `rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
    active
      ? "bg-blue-600 text-white"
      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
  }`;

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

type Props = {
  value: OrderFilters;
  onChange: (next: OrderFilters) => void;
};

const OrderFiltersBar = ({ value, onChange }: Props) => {
  const active = hasActiveFilters(value);

  return (
    <div className="mb-4 rounded-lg bg-gray-900 p-4">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Status
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={value.statuses.includes(status)}
                onClick={() => onChange({ ...value, statuses: toggle(value.statuses, status) })}
                className={chipClass(value.statuses.includes(status))}
              >
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Slot
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SLOT_OPTIONS.map((slot) => (
              <button
                key={slot.value}
                type="button"
                aria-pressed={value.slots.includes(slot.value)}
                onClick={() => onChange({ ...value, slots: toggle(value.slots, slot.value) })}
                className={chipClass(value.slots.includes(slot.value))}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Date placed
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              aria-label="Orders placed from"
              value={value.dateFrom}
              // Upper bound follows the lower one: picking a "from" after the
              // existing "to" would otherwise silently match nothing.
              max={value.dateTo || undefined}
              onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              aria-label="Orders placed until"
              value={value.dateTo}
              min={value.dateFrom || undefined}
              onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {active && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-gray-400 transition hover:text-white"
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderFiltersBar;
