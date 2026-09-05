"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Truck, X, Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";

interface EligibleRider {
  id: string;
  name: string;
  riderStatus?: string | null;
  activeDeliveryCount?: number | null;
}

interface BulkRiderAssignBarProps {
  selectedIds: string[];
  /** Any one of the selected orders — the eligible-riders endpoint is scoped by
   *  order, and every selected order belongs to the same store. */
  sampleOrderId: string;
  onAssign: (riderId: string) => void;
  onClear: () => void;
  isAssigning: boolean;
}

/**
 * Dispatch bar: hand a batch of ready orders to one rider.
 *
 * Riders are shown with what they are already carrying, because that is what
 * decides whether the batch fits — the backend claims capacity for the whole
 * batch at once and rejects it rather than assigning a partial set the
 * dispatcher didn't choose.
 */
export function BulkRiderAssignBar({
  selectedIds,
  sampleOrderId,
  onAssign,
  onClear,
  isAssigning,
}: BulkRiderAssignBarProps) {
  const [riderId, setRiderId] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["eligible-riders", sampleOrderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/eligible-riders/${sampleOrderId}`);
      return res.data as { riders: EligibleRider[]; maxConcurrentDeliveries?: number };
    },
    enabled: Boolean(sampleOrderId),
  });

  const riders = data?.riders ?? [];
  const capacity = data?.maxConcurrentDeliveries;

  const selectedRider = riders.find((r) => r.id === riderId);
  const room =
    selectedRider && capacity !== undefined
      ? capacity - (selectedRider.activeDeliveryCount ?? 0)
      : undefined;
  const wontFit = room !== undefined && selectedIds.length > room;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0f1117]/95 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-bold text-white">
          <Truck size={16} className="text-indigo-400" />
          {selectedIds.length} order{selectedIds.length === 1 ? "" : "s"} selected
        </span>

        <select
          value={riderId}
          onChange={(e) => setRiderId(e.target.value)}
          disabled={isLoading || isAssigning}
          className="min-w-[220px] rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 disabled:opacity-50"
        >
          <option value="">{isLoading ? "Loading riders…" : "Assign to rider…"}</option>
          {riders.map((rider) => (
            <option key={rider.id} value={rider.id}>
              {rider.name}
              {capacity !== undefined
                ? ` — carrying ${rider.activeDeliveryCount ?? 0} of ${capacity}`
                : ""}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onAssign(riderId)}
          disabled={!riderId || isAssigning || wontFit}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isAssigning && <Loader2 size={14} className="animate-spin" />}
          Assign
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={isAssigning}
          className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white disabled:opacity-50"
        >
          <X size={14} />
          Clear
        </button>

        {wontFit && (
          <span className="w-full text-xs text-amber-400">
            {selectedRider?.name} has room for {room} more. Deselect{" "}
            {selectedIds.length - (room ?? 0)} or pick another rider.
          </span>
        )}
        {!isLoading && riders.length === 0 && (
          <span className="w-full text-xs text-amber-400">
            No rider has room right now. Raise the per-rider limit in Store Settings,
            or wait for a delivery to complete.
          </span>
        )}
      </div>
    </div>
  );
}
