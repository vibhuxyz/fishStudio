"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";
import { formatOrderId } from "@repo/shared/order-id";
import OrderDetailsView from "@/shared/components/orders/order-details-view";

const fetchOrderDetails = async (orderId: string) => {
  const res = await axiosInstance.get(`/order/api/get-order-details/${orderId}`);
  return res.data.order;
};

interface OrderDetailDrawerProps {
  orderId: string;
  onClose: () => void;
}

/**
 * Right-side slide-over showing one order in full, so a seller scanning the
 * list can read an order without losing their page and search term.
 *
 * Read-only by design: accept/reject, status changes, rider assignment and
 * cancellation all still live on /order/[id]. Those mutate stock and trigger
 * refunds, and a second copy of that flow is the kind of duplication that
 * ends up half-updated.
 */
const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ orderId, onClose }) => {
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["seller-order-details", orderId],
    queryFn: () => fetchOrderDetails(orderId),
    staleTime: 1000 * 60,
  });

  // Escape closes, and the page behind must not scroll while the panel is open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Order ${formatOrderId(orderId)} details`}
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-gray-800 bg-[#111827] shadow-2xl animate-slide-in-right"
      >
        <header className="flex items-center justify-between gap-3 border-b border-gray-800 p-5">
          <div>
            <h2 className="text-lg font-bold leading-tight text-white">
              Order {formatOrderId(orderId)}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Order details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/order/${orderId}`}
              className="flex items-center gap-1.5 rounded-md border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:text-white"
            >
              Manage order <ExternalLink size={13} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close order details"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 transition hover:bg-gray-800 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            </div>
          ) : isError || !order ? (
            <p className="py-10 text-center text-sm text-red-400">
              Couldn&apos;t load this order. Close and try again.
            </p>
          ) : (
            <OrderDetailsView
              order={order}
              onRefunded={() => {
                queryClient.invalidateQueries({ queryKey: ["seller-order-details", orderId] });
                queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
              }}
            />
          )}
        </div>
      </aside>
    </div>
  );
};

export default OrderDetailDrawer;
