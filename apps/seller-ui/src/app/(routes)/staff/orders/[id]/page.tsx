"use client";

import React, { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Package, MapPin, User, CreditCard } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_ORDERS } from "@/shared/mocks/staffMockData";

// TODO: replace mock fetch with real API once backend is ready:
// const fetchOrder = async (id: string) => {
//   const res = await axiosInstance.get(`/order/api/get-order-details/${id}`);
//   return res.data.order;
// };
// const handleAction = async (orderId, action, rejectionReason?) => {
//   return axiosInstance.put(`/order/api/accept-reject/${orderId}`, { action, rejectionReason });
// };

const StaffOrderDetailPage = () => {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();

  // Mock: find order from mock list
  const [order, setOrder] = useState<any>(() =>
    MOCK_ORDERS.find((o) => o.id === orderId) ?? null,
  );

  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [actionResult, setActionResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleAccept = async () => {
    setActionLoading(true);
    setActionResult(null);
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 600));
    setOrder((prev: any) => ({ ...prev, status: "Accepted", rejectionReason: null }));
    setActionResult({ type: "success", message: "Order accepted successfully" });
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setReasonError("Please enter a rejection reason before submitting.");
      return;
    }
    setActionLoading(true);
    setActionResult(null);
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 600));
    setOrder((prev: any) => ({
      ...prev,
      status: "Rejected",
      rejectionReason: rejectionReason.trim(),
      refundStatus: "Refunded",
    }));
    setActionResult({ type: "success", message: "Order rejected and refund initiated" });
    setShowRejectModal(false);
    setRejectionReason("");
    setActionLoading(false);
  };

  if (!order) {
    return (
      <p className="text-center text-sm text-red-400 mt-20">
        Order not found.
      </p>
    );
  }

  const isActionable =
    order.status !== "Accepted" && order.status !== "Rejected";

  const statusColorMap: Record<string, string> = {
    Paid: "bg-blue-500/20 text-blue-300 border-blue-700",
    Accepted: "bg-green-500/20 text-green-300 border-green-700",
    Rejected: "bg-red-500/20 text-red-300 border-red-700",
    Pending: "bg-yellow-500/20 text-yellow-300 border-yellow-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Back */}
      <button
        type="button"
        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-6 transition"
        onClick={() => router.push("/staff/orders")}
      >
        <ArrowLeft size={18} />
        Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Order #{order.id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
            statusColorMap[order.status] ?? "bg-gray-500/20 text-gray-300 border-gray-600"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Status banners */}
      {order.status === "Accepted" && (
        <div className="flex items-center gap-3 bg-green-900/30 border border-green-700 rounded-xl px-5 py-4 mb-6">
          <CheckCircle className="text-green-400 shrink-0" size={22} />
          <div>
            <p className="text-green-300 font-semibold">Order Accepted</p>
            <p className="text-green-400 text-sm">This order has been confirmed and is being processed.</p>
          </div>
        </div>
      )}
      {order.status === "Rejected" && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl px-5 py-4 mb-6 space-y-1">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-400 shrink-0" size={22} />
            <p className="text-red-300 font-semibold">Order Rejected</p>
          </div>
          {order.rejectionReason && (
            <p className="text-red-200 text-sm ml-9">
              Reason shown to customer:{" "}
              <span className="italic">{order.rejectionReason}</span>
            </p>
          )}
          {order.refundStatus && (
            <p className="text-green-300 text-sm ml-9">
              Refund Status:{" "}
              <span className="font-semibold">{order.refundStatus}</span>
            </p>
          )}
        </div>
      )}

      {/* Action feedback */}
      {actionResult && (
        <div
          className={`mb-6 px-5 py-3 rounded-xl text-sm font-medium border ${
            actionResult.type === "success"
              ? "bg-green-900/30 border-green-700 text-green-300"
              : "bg-red-900/30 border-red-700 text-red-300"
          }`}
        >
          {actionResult.message}
        </div>
      )}

      {/* Accept / Reject buttons */}
      {isActionable && (
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={handleAccept}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
          >
            <CheckCircle size={17} />
            {actionLoading ? "Processing..." : "Accept Order"}
          </button>
          <button
            type="button"
            onClick={() => setShowRejectModal(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
          >
            <XCircle size={17} />
            Reject Order
          </button>
        </div>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Customer */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Customer</h3>
          </div>
          <p className="text-white font-medium">{order.user?.name}</p>
          <p className="text-gray-400 text-sm">{order.user?.email}</p>
        </div>

        {/* Shipping */}
        {order.shippingAddress && (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Shipping</h3>
            </div>
            <p className="text-white font-medium">{order.shippingAddress.name}</p>
            <p className="text-gray-400 text-sm">{order.shippingAddress.street}</p>
            <p className="text-gray-400 text-sm">
              {order.shippingAddress.city}, {order.shippingAddress.zip}
            </p>
          </div>
        )}

        {/* Payment summary */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Payment</h3>
          </div>
          <p className="text-white font-semibold text-lg">${order.total.toFixed(2)}</p>
          <p className="text-gray-400 text-sm">Status: {order.status}</p>
          {order.refundStatus && (
            <p className="text-green-400 text-sm">Refund: {order.refundStatus}</p>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-gray-400" />
          <h2 className="text-base font-semibold text-white">
            Order Items ({order.items.length})
          </h2>
        </div>
        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 bg-[#0d1117] border border-gray-800 rounded-lg p-4"
            >
              <img
                src={item.product?.images?.[0]?.url ?? "/placeholder.png"}
                alt={item.product?.title ?? "Product"}
                crossOrigin="anonymous"
                className="w-14 h-14 object-cover rounded-lg border border-gray-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  {item.product?.title ?? "Unnamed Product"}
                </p>
                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                {item.selectedOptions &&
                  Object.keys(item.selectedOptions).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(item.selectedOptions).map(
                        ([key, value]: [string, any]) =>
                          value ? (
                            <span
                              key={key}
                              className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full"
                            >
                              {key}: {value}
                            </span>
                          ) : null,
                      )}
                    </div>
                  )}
              </div>
              <p className="text-white font-semibold shrink-0">
                ${item.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Total row */}
        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
          <span className="text-gray-400 font-medium">Order Total</span>
          <span className="text-white font-bold text-lg">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <XCircle className="text-red-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Reject Order</h3>
                <p className="text-gray-400 text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              You must provide a reason. This will be shown to the customer and an automatic refund will be issued.
            </p>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">
              Rejection Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setReasonError("");
              }}
              placeholder="e.g. Item is currently out of stock, unable to fulfil your order..."
              className="w-full p-3 bg-[#0d1117] text-white border border-gray-700 rounded-xl resize-none outline-none focus:border-red-500 transition text-sm"
            />
            {reasonError && (
              <p className="text-red-400 text-xs mt-1">{reasonError}</p>
            )}
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setReasonError("");
                }}
                className="flex-1 py-2.5 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-medium transition text-sm"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrderDetailPage;

const StaffOrderDetailPage = () => {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [actionResult, setActionResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(
        `/order/api/get-order-details/${orderId}`,
      );
      setOrder(res.data.order);
    } catch {
      console.error("Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await axiosInstance.put(
        `/order/api/accept-reject/${order.id}`,
        { action: "accept" },
      );
      setOrder((prev: any) => ({ ...prev, status: "Accepted" }));
      setActionResult({ type: "success", message: res.data.message });
    } catch (err: any) {
      setActionResult({
        type: "error",
        message:
          err?.response?.data?.message || "Failed to accept order",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setReasonError("Please enter a rejection reason before submitting.");
      return;
    }
    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await axiosInstance.put(
        `/order/api/accept-reject/${order.id}`,
        { action: "reject", rejectionReason: rejectionReason.trim() },
      );
      setOrder((prev: any) => ({
        ...prev,
        status: "Rejected",
        rejectionReason: rejectionReason.trim(),
        refundStatus: "Refunded",
      }));
      setActionResult({ type: "success", message: res.data.message });
      setShowRejectModal(false);
      setRejectionReason("");
    } catch (err: any) {
      setActionResult({
        type: "error",
        message:
          err?.response?.data?.message || "Failed to reject order",
      });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <p className="text-center text-sm text-red-400 mt-20">
        Order not found.
      </p>
    );
  }

  const isActionable =
    order.status !== "Accepted" && order.status !== "Rejected";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Back */}
      <button
        type="button"
        className="text-white flex items-center gap-2 font-semibold cursor-pointer mb-4"
        onClick={() => router.push("/staff/orders")}
      >
        <ArrowLeft size={20} />
        Back to Orders
      </button>

      <h1 className="text-2xl font-bold text-gray-200 mb-2">
        Order #{order.id.slice(-6).toUpperCase()}
      </h1>

      {/* Status banner */}
      <div className="mb-6">
        {order.status === "Accepted" && (
          <div className="flex items-center gap-2 bg-green-900/40 border border-green-700 rounded-lg px-4 py-3">
            <CheckCircle className="text-green-400" size={20} />
            <span className="text-green-300 font-medium">Order Accepted</span>
          </div>
        )}
        {order.status === "Rejected" && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="text-red-400" size={20} />
              <span className="text-red-300 font-medium">Order Rejected</span>
            </div>
            {order.rejectionReason && (
              <p className="text-red-200 text-sm ml-7">
                Reason: {order.rejectionReason}
              </p>
            )}
            {order.refundStatus && (
              <p className="text-green-300 text-sm ml-7 mt-1">
                Refund Status:{" "}
                <span className="font-semibold">{order.refundStatus}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action feedback */}
      {actionResult && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            actionResult.type === "success"
              ? "bg-green-900/40 border border-green-700 text-green-300"
              : "bg-red-900/40 border border-red-700 text-red-300"
          }`}
        >
          {actionResult.message}
        </div>
      )}

      {/* Accept / Reject buttons */}
      {isActionable && (
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={handleAccept}
            disabled={actionLoading}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
          >
            <CheckCircle size={18} />
            Accept Order
          </button>
          <button
            type="button"
            onClick={() => setShowRejectModal(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
          >
            <XCircle size={18} />
            Reject Order
          </button>
        </div>
      )}

      {/* Order summary */}
      <div className="mb-6 space-y-1 text-sm text-gray-200">
        <p>
          <span className="font-semibold">Payment Status:</span>{" "}
          <span className="text-green-400">{order.status}</span>
        </p>
        <p>
          <span className="font-semibold">Total Paid:</span>{" "}
          <span>${order.total.toFixed(2)}</span>
        </p>
        <p>
          <span className="font-semibold">Date:</span>{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="mb-6 text-sm text-gray-300">
          <h2 className="text-md font-semibold mb-1">Shipping Address</h2>
          <p>{order.shippingAddress.name}</p>
          <p>
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.zip}
          </p>
        </div>
      )}

      {/* Order items */}
      <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-4">
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div
              key={item.productId}
              className="border border-gray-700 rounded-md p-4 flex items-center gap-4"
            >
              <img
                src={item.product?.images[0]?.url || "/placeholder.png"}
                alt={item.product?.title || "Product"}
                className="w-16 h-16 object-cover rounded-md border border-gray-600"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-200">
                  {item.product?.title || "Unnamed Product"}
                </p>
                <p className="text-sm text-gray-400">
                  Quantity: {item.quantity}
                </p>
                {item.selectedOptions &&
                  Object.keys(item.selectedOptions).length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.entries(item.selectedOptions).map(
                        ([key, value]: [string, any]) =>
                          value && (
                            <span key={key} className="mr-3">
                              <span className="font-medium capitalize">
                                {key}:
                              </span>{" "}
                              {value}
                            </span>
                          ),
                      )}
                    </div>
                  )}
              </div>
              <p className="text-sm font-semibold text-gray-200">
                ${item.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-2">
              Reject Order
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              You must provide a reason for rejecting this order. This reason
              will be shown to the customer.
            </p>
            <label className="block text-sm text-gray-300 mb-1">
              Rejection Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setReasonError("");
              }}
              placeholder="e.g. Item is out of stock, unable to fulfil your order..."
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg resize-none outline-none focus:border-red-500 transition"
            />
            {reasonError && (
              <p className="text-red-400 text-sm mt-1">{reasonError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setReasonError("");
                }}
                className="flex-1 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrderDetailPage;
