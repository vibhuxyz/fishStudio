"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { formatOrderId } from "@repo/shared/order-id";
import RiderAssignmentPanel from "./_components/rider-assignment-panel";
import OrderDetailsView from "@/shared/components/orders/order-details-view";

const ORDER_STATUS_FLOW = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED_TO_RIDER",
  "SHIPPED",
  "DELIVERED",
] as const;

// Statuses the seller can move an order to via PUT /update-status — matches
// the seller-facing updateOrderStatusSchema on the backend. READY_FOR_PICKUP
// has no dropdown option: its only forward move is the Assign Rider action
// below, not a generic status pick.
const NEXT_STATUS_OPTIONS: Record<string, string[]> = {
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
  ASSIGNED_TO_RIDER: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
};

const Page = () => {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectValue, setSelectValue] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(
        `/order/api/get-order-details/${orderId}`,
      );
      setOrder(res.data.order);
    } catch (err) {
      console.error("Failed to fetch order details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReject = async (action: "accept" | "reject") => {
    setUpdating(true);
    try {
      await axiosInstance.put(`/order/api/accept-reject/${order.id}`, { action });
      await fetchOrder();
    } catch (err) {
      console.error("Failed to update order", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = e.target.value;
    if (!newStatus) return;
    setSelectValue("");

    // Cancelling is destructive at any stage, so it always goes through a
    // confirm step with an optional reason rather than applying immediately.
    if (newStatus === "CANCELLED") {
      setCancelReason("");
      setCancelModalOpen(true);
      return;
    }

    setUpdating(true);
    try {
      await axiosInstance.put(`/order/api/update-status/${order.id}`, {
        status: newStatus,
      });
      await fetchOrder();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  };

  const confirmCancelOrder = async () => {
    setUpdating(true);
    try {
      await axiosInstance.put(`/order/api/update-status/${order.id}`, {
        status: "CANCELLED",
        ...(cancelReason.trim() ? { cancellationReason: cancelReason.trim() } : {}),
      });
      setCancelModalOpen(false);
      await fetchOrder();
    } catch (err) {
      console.error("Failed to cancel order", err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-sm text-red-500">Order not found.</p>;
  }

  const isTerminal = order.status === "REJECTED" || order.status === "CANCELLED" || order.status === "DELIVERED";
  const flowIndex = ORDER_STATUS_FLOW.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="my-4">
        <span
          className="text-white flex items-center gap-2 font-semibold cursor-pointer"
          onClick={() => router.push("/dashboard/orders")}
        >
          <ArrowLeft />
          Go Back to Dashboard
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-200 mb-4">
        Order {formatOrderId(order.id)}
      </h1>

      {/* Status Control */}
      <div className="mb-6">
        {order.status === "PENDING" ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300">Order awaiting your response:</span>
            <button
              onClick={() => handleAcceptReject("accept")}
              disabled={updating}
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => handleAcceptReject("reject")}
              disabled={updating}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        ) : NEXT_STATUS_OPTIONS[order.status] ? (
          <>
            <label className="text-sm font-medium text-gray-300 mr-3">
              Update Order Status:
            </label>
            <select
              value={selectValue}
              onChange={handleStatusChange}
              disabled={updating}
              className="border bg-transparent text-gray-200 border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="" disabled>
                Select next status
              </option>
              {NEXT_STATUS_OPTIONS[order.status].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </>
        ) : order.status === "READY_FOR_PICKUP" ? (
          <span className="text-sm text-gray-400">
            Packed and ready — assign a rider below to move it forward.
          </span>
        ) : (
          <span className="text-sm text-gray-400">
            Order is {order.status.toLowerCase()} — no further action available.
          </span>
        )}
      </div>

      <RiderAssignmentPanel
        orderId={order.id}
        status={order.status}
        assignedRider={order.rider ?? null}
        onChanged={fetchOrder}
      />

      {/* Delivery Progress */}
      {!isTerminal && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
            {ORDER_STATUS_FLOW.map((step, idx) => {
              const current = step === order.status;
              const passed = flowIndex >= idx;
              return (
                <div
                  key={step}
                  className={`flex-1 text-left ${
                    current ? "text-blue-400" : passed ? "text-green-400" : "text-gray-500"
                  }`}
                >
                  {step}
                </div>
              );
            })}
          </div>
          <div className="flex items-center">
            {ORDER_STATUS_FLOW.map((step, idx) => {
              const reached = idx <= flowIndex;
              return (
                <div key={step} className="flex-1 flex items-center">
                  <div className={`w-4 h-4 rounded-full ${reached ? "bg-blue-600" : "bg-gray-600"}`} />
                  {idx !== ORDER_STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-1 ${reached ? "bg-blue-500" : "bg-gray-700"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <OrderDetailsView order={order} onRefunded={fetchOrder} />

      {cancelModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg md:w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-xl text-white">Cancel Order?</h3>
            </div>

            <p className="text-gray-300 mt-4">
              Are you sure you want to cancel this order?
              <br />
              This action cannot be undone. Stock will be restored and, if the
              order was paid online, a refund will be initiated automatically.
            </p>

            <label className="block text-sm text-gray-400 mt-4 mb-1">
              Cancellation reason (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={updating}
              rows={3}
              maxLength={500}
              placeholder="e.g. Out of stock, customer requested via support call…"
              className="w-full rounded-md bg-gray-900 border border-gray-700 text-gray-200 text-sm p-2.5 outline-none focus:border-gray-500 disabled:opacity-50"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                disabled={updating}
                onClick={() => setCancelModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                disabled={updating}
                onClick={confirmCancelOrder}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white font-semibold transition flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  "Yes, Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
