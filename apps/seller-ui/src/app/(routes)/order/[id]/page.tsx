"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { formatOrderId } from "@repo/shared/order-id";
import RiderAssignmentPanel from "./_components/rider-assignment-panel";

const ORDER_STATUS_FLOW = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED_TO_RIDER",
  "SHIPPED",
  "DELIVERED",
] as const;

const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING: "text-amber-400",
  ACCEPTED: "text-blue-400",
  PREPARING: "text-cyan-400",
  READY_FOR_PICKUP: "text-teal-400",
  ASSIGNED_TO_RIDER: "text-fuchsia-400",
  SHIPPED: "text-indigo-400",
  DELIVERED: "text-green-400",
  REJECTED: "text-red-400",
  CANCELLED: "text-red-400",
};

const PAYMENT_STATUS_BADGE: Record<string, string> = {
  PENDING: "text-amber-400",
  COMPLETED: "text-green-400",
  FAILED: "text-red-400",
  REFUND_PENDING: "text-orange-400",
  REFUNDED: "text-purple-400",
};

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

const formatCurrency = (value: number) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

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
  const billDetails = order.billDetails as
    | { itemTotal?: number; deliveryCharge?: number; discount?: number; totalAmount?: number }
    | null
    | undefined;
  const itemTotal = billDetails?.itemTotal ?? order.total - (order.deliveryCharge ?? 0) + (order.discountAmount ?? 0);

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

      {order.status === "REJECTED" && order.rejectionReason && (
        <p className="mb-6 text-sm text-red-400">
          <span className="font-semibold">Rejection Reason:</span> {order.rejectionReason}
        </p>
      )}

      {order.status === "CANCELLED" && order.cancelledBy && (
        <div className="mb-6 rounded-md border border-red-900/40 bg-red-950/20 p-4 text-sm">
          <h3 className="mb-2 font-semibold text-red-400">Cancellation Details</h3>
          <div className="space-y-1 text-gray-300">
            <p>
              <span className="font-semibold">Cancelled By:</span>{" "}
              {order.cancelledBy === "CUSTOMER"
                ? "Customer"
                : order.cancelledBy === "SYSTEM"
                  ? "System"
                  : order.cancelledBy === "STAFF"
                    ? "Staff"
                    : "Seller"}
            </p>
            {order.cancellationReason && (
              <p>
                <span className="font-semibold">Reason:</span> {order.cancellationReason}
              </p>
            )}
            {order.cancelledAt && (
              <p>
                <span className="font-semibold">Time:</span>{" "}
                {new Date(order.cancelledAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            {order.refundStatus && order.refundStatus !== "NONE" && (
              <p>
                <span className="font-semibold">Refund:</span>{" "}
                <span
                  className={
                    order.refundStatus === "COMPLETED"
                      ? "text-emerald-400"
                      : order.refundStatus === "FAILED"
                        ? "text-red-400"
                        : "text-amber-400"
                  }
                >
                  {order.refundStatus === "REQUESTED"
                    ? "Requested"
                    : order.refundStatus === "PROCESSING"
                      ? "Processing"
                      : order.refundStatus === "COMPLETED"
                        ? "Completed"
                        : "Failed"}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary Info */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-1 text-sm text-gray-200">
          <h2 className="text-md font-semibold mb-1 text-gray-100">Order Summary</h2>
          <p>
            <span className="font-semibold">Order Status:</span>{" "}
            <span className={`font-medium ${ORDER_STATUS_BADGE[order.status] ?? "text-gray-300"}`}>
              {order.status}
            </span>
          </p>
          <p>
            <span className="font-semibold">Payment Status:</span>{" "}
            <span className={`font-medium ${PAYMENT_STATUS_BADGE[order.paymentStatus] ?? "text-gray-300"}`}>
              {order.paymentStatus}
            </span>
          </p>
          {order.paymentMethod && (
            <p>
              <span className="font-semibold">Payment Method:</span>{" "}
              <span className="text-gray-300">{order.paymentMethod}</span>
            </p>
          )}
          {order.paymentRef && (
            <p>
              <span className="font-semibold">Payment Ref:</span>{" "}
              <span className="text-gray-300">{order.paymentRef}</span>
            </p>
          )}
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="space-y-1 text-sm text-gray-200">
          <h2 className="text-md font-semibold mb-1 text-gray-100">Charges</h2>
          <p>
            <span className="font-semibold">Item Total:</span> {formatCurrency(itemTotal)}
          </p>
          <p>
            <span className="font-semibold">Delivery Charge:</span> {formatCurrency(order.deliveryCharge ?? 0)}
          </p>
          {order.discountAmount > 0 && (
            <p>
              <span className="font-semibold">Discount:</span>{" "}
              <span className="text-green-400">
                -{formatCurrency(order.discountAmount)}
                {order.coupon
                  ? ` (${order.coupon.discountType === "percentage" ? `${order.coupon.discountValue}%` : formatCurrency(order.coupon.discountValue)} off)`
                  : ""}
              </span>
            </p>
          )}
          {order.couponCode && (
            <p>
              <span className="font-semibold">Coupon Used:</span>{" "}
              <span className="text-blue-400">
                {order.coupon?.public_name ?? order.couponCode}
              </span>
            </p>
          )}
          <p className="pt-1 border-t border-slate-800">
            <span className="font-semibold">Total Paid:</span>{" "}
            <span className="font-medium">{formatCurrency(order.total)}</span>
          </p>
        </div>
      </div>

      {/* Buyer + Fulfillment */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="text-sm text-gray-300">
          <h2 className="text-md font-semibold mb-2 text-gray-100">Placed By</h2>
          {order.buyer ? (
            <>
              <p>{order.buyer.name}</p>
              <p>{order.buyer.email}</p>
              <p>{order.buyer.phone_number}</p>
            </>
          ) : (
            <p className="text-gray-500">Buyer details unavailable.</p>
          )}
          {(order.deliveryName || order.deliveryAddress) && (
            <div className="mt-3">
              <p className="font-semibold text-gray-100">Delivery Address</p>
              <p>{order.deliveryName}</p>
              {order.deliveryPhone && <p>{order.deliveryPhone}</p>}
              <p>
                {order.deliveryAddress}
                {order.deliveryLandmark ? `, ${order.deliveryLandmark}` : ""}
                {order.deliveryCity ? `, ${order.deliveryCity}` : ""}
                {order.deliveryPincode ? ` - ${order.deliveryPincode}` : ""}
              </p>
              {order.deliveryInstructions && (
                <p className="text-xs text-amber-300 mt-1">Instructions: {order.deliveryInstructions}</p>
              )}
              {order.deliverySlot && <p className="text-xs text-gray-500">Slot: {order.deliverySlot}</p>}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-300">
          <h2 className="text-md font-semibold mb-2 text-gray-100">Fulfilled By</h2>
          {order.store ? (
            <>
              <p>{order.store.name}</p>
              <p>{order.store.address}, {order.store.city} - {order.store.pincode}</p>
              {order.store.sellerPhone && <p>{order.store.sellerPhone}</p>}
            </>
          ) : (
            <p className="text-gray-500">Store details unavailable.</p>
          )}
        </div>
      </div>

      {/* Payment Records */}
      {order.payments && order.payments.length > 0 && (
        <div className="mb-6 text-sm text-gray-300">
          <h2 className="text-md font-semibold mb-2 text-gray-100">Payment Details</h2>
          <div className="space-y-2">
            {order.payments.map((payment: any) => (
              <div
                key={payment.id}
                className="rounded-md border border-slate-800 bg-slate-900/50 p-3"
              >
                <p>
                  <span className="font-semibold">Method:</span> {payment.method}
                  {payment.metadata?.method && (
                    <>
                      {" "}
                      ({payment.metadata.method.toUpperCase()}
                      {payment.metadata.instrumentDetail ? ` · ${payment.metadata.instrumentDetail}` : ""})
                    </>
                  )}{" "}
                  ·{" "}
                  <span className={PAYMENT_STATUS_BADGE[payment.status] ?? "text-gray-300"}>
                    {payment.status}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Amount:</span> {formatCurrency(payment.amount)}
                </p>
                {payment.transactionId && (
                  <p>
                    <span className="font-semibold">Transaction ID:</span> {payment.transactionId}
                  </p>
                )}
                {payment.gatewayOrderId && (
                  <p>
                    <span className="font-semibold">Gateway Order ID:</span> {payment.gatewayOrderId}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(payment.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-4">
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div
              key={item.productId}
              className="border border-gray-200 rounded-md p-4 flex items-center gap-4"
            >
              <img
                src={item.product?.images[0]?.url || "/placeholder.png"}
                alt={item.product?.title || "Product image"}
                className="w-16 h-16 object-cover rounded-md border border-gray-200"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-200">
                  {item.product?.title || "Unnamed Product"}
                </p>
                {item.selectedOptions?.cuttingType || item.selectedOptions?.weightGrams ? (
                  <div className="text-xs text-gray-400 mt-0.5 space-y-0.5">
                    {(item.selectedOptions?.cuttingType || item.selectedOptions?.pieceSize) && (
                      <p>
                        {item.selectedOptions.cuttingType}
                        {item.selectedOptions.pieceSize ? ` · ${item.selectedOptions.pieceSize}` : ""}
                      </p>
                    )}
                    {item.selectedOptions?.weightGrams ? (
                      <p>
                        Weight:{" "}
                        {item.selectedOptions.weightGrams >= 1000
                          ? `${(item.selectedOptions.weightGrams / 1000).toFixed(2)} kg`
                          : `${item.selectedOptions.weightGrams} gm`}
                      </p>
                    ) : (
                      <p>Qty: {item.quantity}</p>
                    )}
                    {item.selectedOptions?.cuttingCharge != null && item.selectedOptions.cuttingCharge > 0 && (
                      <p className="text-amber-400">
                        ₹{item.selectedOptions.baseRatePerKg}/kg + ₹{item.selectedOptions.cuttingCharge} cut
                        {item.selectedOptions.sizeMultiplier && item.selectedOptions.sizeMultiplier !== 1
                          ? ` ×${item.selectedOptions.sizeMultiplier}`
                          : ""}
                        {" = "}₹{item.selectedOptions.effectiveRatePerKg}/kg
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-300">Qty: {item.quantity}</p>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-200">
                {formatCurrency(item.price)}
              </p>
            </div>
          ))}
        </div>
      </div>

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
