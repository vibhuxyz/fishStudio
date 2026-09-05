"use client";

import { useState } from "react";

/**
 * Move several orders forward through the fulfilment workflow at once.
 *
 * CANCELLED and REJECTED are deliberately absent: each carries a refund, stock
 * restoration and coupon release per order — side effects nobody should trigger
 * for fifty orders from behind one dropdown. Those stay on the single-order
 * path, same as on the seller dashboard.
 */
const BULK_STATUSES = ["PREPARING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED"];

const label = (value: string) =>
  value.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());

interface BulkStatusBarProps {
  selectedCount: number;
  isApplying: boolean;
  onApply: (status: string) => void;
  onClear: () => void;
}

export function BulkStatusBar({ selectedCount, isApplying, onApply, onClear }: BulkStatusBarProps) {
  const [status, setStatus] = useState("");

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-blue-800/50 bg-blue-950/30 px-4 py-3">
      <span className="text-sm font-semibold text-white">
        {selectedCount} order{selectedCount === 1 ? "" : "s"} selected
      </span>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={isApplying}
        className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <option value="">Move to…</option>
        {BULK_STATUSES.map((option) => (
          <option key={option} value={option}>{label(option)}</option>
        ))}
      </select>

      <button
        type="button"
        disabled={!status || isApplying}
        onClick={() => onApply(status)}
        className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isApplying ? "Applying…" : "Apply"}
      </button>

      <button
        type="button"
        onClick={onClear}
        disabled={isApplying}
        className="text-xs text-gray-400 underline transition hover:text-white disabled:opacity-50"
      >
        Clear selection
      </button>

      <span className="w-full text-xs text-gray-500">
        Orders already at or past the chosen step, and cancelled ones, are skipped.
      </span>
    </div>
  );
}
