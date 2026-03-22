"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";

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
