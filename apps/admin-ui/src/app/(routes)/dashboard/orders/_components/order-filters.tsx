"use client";

/**
 * Status, slot and date-range filters for the platform order list.
 *
 * All of them narrow to the intersection — picking two statuses and a slot and
 * a date range means "orders in either status, in that slot, in that window".
 * The seller dashboard's filter bar behaves identically; both consoles are
 * asking the same question of the same table.
 */

export interface AdminOrderFilters {
  statuses: string[];
  slots: string[];
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_ORDER_FILTERS: AdminOrderFilters = {
  statuses: [],
  slots: [],
  dateFrom: "",
  dateTo: "",
};

// Uppercase to match OrderStatus; the slot values are lowercase because
// Order.deliverySlot stores them that way and the case is load-bearing.
const STATUS_OPTIONS = [
  "PENDING", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP",
  "ASSIGNED_TO_RIDER", "SHIPPED", "DELIVERED", "CANCELLED", "REJECTED",
];
const SLOT_OPTIONS = ["instant", "morning", "evening"];

const label = (value: string) =>
  value.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());

/** Repeated query params, the shape parseSellerOrderFilters expects. */
export function filtersToParams(filters: AdminOrderFilters) {
  return {
    ...(filters.statuses.length > 0 ? { statuses: filters.statuses } : {}),
    ...(filters.slots.length > 0 ? { slot: filters.slots } : {}),
    ...(filters.dateFrom ? { from: filters.dateFrom } : {}),
    ...(filters.dateTo ? { to: filters.dateTo } : {}),
  };
}

export const hasActiveFilters = (filters: AdminOrderFilters) =>
  filters.statuses.length > 0 ||
  filters.slots.length > 0 ||
  Boolean(filters.dateFrom) ||
  Boolean(filters.dateTo);

interface OrderFiltersBarProps {
  filters: AdminOrderFilters;
  onChange: (filters: AdminOrderFilters) => void;
}

export function OrderFiltersBar({ filters, onChange }: OrderFiltersBarProps) {
  const toggle = (key: "statuses" | "slots", value: string) => {
    const current = filters[key];
    onChange({
      ...filters,
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  return (
    <div className="mb-4 space-y-3 rounded-lg border border-gray-800 bg-gray-900/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 text-xs uppercase tracking-wider text-gray-500">Status</span>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => toggle("statuses", status)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              filters.statuses.includes(status)
                ? "border-blue-500 bg-blue-600/20 text-blue-300"
                : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
            }`}
          >
            {label(status)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 text-xs uppercase tracking-wider text-gray-500">Slot</span>
        {SLOT_OPTIONS.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => toggle("slots", slot)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              filters.slots.includes(slot)
                ? "border-purple-500 bg-purple-600/20 text-purple-300"
                : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
            }`}
          >
            {label(slot)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 text-xs uppercase tracking-wider text-gray-500">Dates</span>
        <input
          type="date"
          value={filters.dateFrom}
          // A range that ends before it starts returns nothing and reads as a
          // broken filter, so each bound caps the other.
          max={filters.dateTo || undefined}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-600">to</span>
        <input
          type="date"
          value={filters.dateTo}
          min={filters.dateFrom || undefined}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_ORDER_FILTERS)}
            className="text-xs text-gray-400 underline transition hover:text-white"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
