"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { formatIstDateTime } from "@repo/shared/datetime";

interface RiderRow {
  riderId: string;
  name: string;
  phone: string | null;
  outstandingAmount: number;
  outstandingOrders: number;
  settledTodayAmount: number;
}

interface Collection {
  id: string;
  orderNumber: string;
  customerName: string | null;
  amount: number;
  collectedAt: string;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

/**
 * COD reconciliation: what each rider collected, and confirming it arrived.
 *
 * Collections are settled individually rather than as a whole balance, because
 * a rider handing over part of what they hold is the normal case — settling
 * everything because it was easier would write off cash that never arrived.
 */
export default function StaffCodPage() {
  const queryClient = useQueryClient();
  const [openRiderId, setOpenRiderId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cod-summary"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/cod/summary");
      return res.data as { riders: RiderRow[]; totalOutstanding: number };
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["cod-rider", openRiderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/cod/rider/${openRiderId}`);
      return res.data as { collections: Collection[]; totalOutstanding: number };
    },
    enabled: Boolean(openRiderId),
  });

  const settleMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post("/order/api/cod/settle", {
        riderId: openRiderId,
        collectionIds: selected,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(`Marked ${inr(res.settlement.amount)} as received`);
      setSelected([]);
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["cod-summary"] });
      queryClient.invalidateQueries({ queryKey: ["cod-rider", openRiderId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to record settlement");
    },
  });

  const collections = detail?.collections ?? [];
  const selectedTotal = collections
    .filter((c) => selected.includes(c.id))
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="p-6 text-white">
      <div className="mb-6 flex items-center gap-2">
        <Wallet className="h-6 w-6 text-emerald-400" />
        <h1 className="text-2xl font-semibold">COD Cash</h1>
      </div>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      ) : (
        <>
          <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800/50 p-5">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Outstanding across all riders
            </p>
            <p className="mt-1 text-3xl font-bold text-emerald-400">
              {inr(data?.totalOutstanding ?? 0)}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/60 text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Rider</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Settled today</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {(data?.riders ?? []).map((rider) => (
                  <tr key={rider.riderId} className="border-t border-gray-800">
                    <td className="px-4 py-3">
                      <p className="font-medium">{rider.name}</p>
                      {rider.phone && <p className="text-xs text-slate-500">{rider.phone}</p>}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      {inr(rider.outstandingAmount)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{rider.outstandingOrders}</td>
                    <td className="px-4 py-3 text-slate-400">{inr(rider.settledTodayAmount)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={rider.outstandingOrders === 0}
                        onClick={() => {
                          setOpenRiderId(rider.riderId);
                          setSelected([]);
                        }}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Collect cash
                      </button>
                    </td>
                  </tr>
                ))}
                {(data?.riders ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      No riders in this store yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {openRiderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-700 bg-[#0f1117]">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <h2 className="font-semibold">Cash received from this rider</h2>
              <button
                type="button"
                onClick={() => setOpenRiderId(null)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {detailLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                <>
                  <p className="mb-3 text-xs text-slate-400">
                    Tick only the orders whose cash you actually have in hand. Anything left
                    unticked stays outstanding against this rider.
                  </p>
                  {collections.map((collection) => (
                    <label
                      key={collection.id}
                      className="mb-2 flex cursor-pointer items-center gap-3 rounded-lg border border-gray-800 px-3 py-2 hover:border-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(collection.id)}
                        onChange={() =>
                          setSelected((prev) =>
                            prev.includes(collection.id)
                              ? prev.filter((id) => id !== collection.id)
                              : [...prev, collection.id],
                          )
                        }
                        className="h-4 w-4 accent-emerald-500"
                      />
                      <span className="flex-1">
                        <span className="font-mono text-xs text-slate-300">
                          {collection.orderNumber}
                        </span>
                        {collection.customerName && (
                          <span className="ml-2 text-xs text-slate-500">
                            {collection.customerName}
                          </span>
                        )}
                        <span className="block text-[11px] text-slate-600">
                          {formatIstDateTime(collection.collectedAt)}
                        </span>
                      </span>
                      <span className="font-bold text-emerald-400">{inr(collection.amount)}</span>
                    </label>
                  ))}
                </>
              )}
            </div>

            <div className="border-t border-gray-800 px-5 py-4">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Note (optional) — e.g. short by ₹50, paid tomorrow"
                className="mb-3 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  {selected.length} selected ·{" "}
                  <span className="font-bold text-emerald-400">{inr(selectedTotal)}</span>
                </span>
                <button
                  type="button"
                  disabled={selected.length === 0 || settleMutation.isPending}
                  onClick={() => settleMutation.mutate()}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {settleMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Mark received
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
