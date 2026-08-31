"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

/**
 * The statuses a bulk action may set.
 *
 * Forward workflow steps only, matching bulkUpdateOrderStatusSchema: CANCELLED
 * is absent because cancelling carries a refund, stock restoration and coupon
 * release per order, which is not something to trigger for a whole page of
 * orders behind one checkbox.
 */
const BULK_STATUSES = [
  { value: "PREPARING", label: "Preparing" },
  { value: "READY_FOR_PICKUP", label: "Ready for pickup" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
];

type Props = {
  selectedCount: number;
  isPending: boolean;
  onApply: (status: string) => void;
  onClear: () => void;
};

const BulkStatusBar = ({ selectedCount, isPending, onApply, onClear }: Props) => {
  const [status, setStatus] = useState("");

  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-blue-800 bg-blue-950/40 px-4 py-3">
      <span className="text-sm font-semibold text-white">
        {selectedCount} order{selectedCount === 1 ? "" : "s"} selected
      </span>

      <select
        aria-label="New status for selected orders"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
      >
        <option value="">Move to…</option>
        {BULK_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={!status || isPending}
        onClick={() => onApply(status)}
        className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {isPending ? "Updating…" : "Apply"}
      </button>

      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 transition hover:text-white"
      >
        <X size={14} />
        Clear selection
      </button>

      <p className="w-full text-xs text-gray-400">
        Orders already at or past the chosen step, and any that were cancelled, are
        skipped — the rest still move.
      </p>
    </div>
  );
};

export default BulkStatusBar;
