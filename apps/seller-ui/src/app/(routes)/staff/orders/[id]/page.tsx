"use client";
import React, { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Package, MapPin, User, CreditCard, Phone, Copy, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_ORDERS } from "@/shared/mocks/staffMockData";

const StaffOrderDetailPage = () => {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  // Mock: find order from mock list
  const [order, setOrder] = useState<any>(() =>
    MOCK_ORDERS.find((o) => o.id === orderId) ?? null,
  );

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setReasonError("Please enter a rejection reason.");
      return;
    }
    setOrder((prev: any) => ({
      ...prev,
      status: "Rejected",
      rejectionReason: rejectionReason.trim(),
      refundStatus: "Refunded",
    }));
    setShowRejectModal(false);
    setRejectionReason("");
  };

  if (!order) {
    return (
      <p className="text-center text-sm text-red-400 mt-20">Order not found.</p>
    );
  }

  const isActionable = order.status !== "Processing" && order.status !== "Rejected" && order.status !== "Completed";
  const statusColorMap: Record<string, string> = {
    New: "bg-amber-500/20 text-amber-300 border-amber-700",
    Processing: "bg-blue-500/20 text-blue-300 border-blue-700",
    Ready: "bg-teal-500/20 text-teal-300 border-teal-700",
    Completed: "bg-green-500/20 text-green-300 border-green-700",
    Rejected: "bg-red-500/20 text-red-300 border-red-700",
  };

  return (
    <div className="w-full min-h-screen bg-[#080b12] p-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-6 transition"
      >
        <ArrowLeft size={18} /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Order #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-bold border ${statusColorMap[order.status]}`}>
          {order.status}
        </span>
      </div>

      {/* Action buttons */}
      {isActionable && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setOrder(prev => ({ ...prev, status: "Processing" }))}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            <CheckCircle size={18} />
            Mark Processing
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            <XCircle size={18} />
            Reject Order
          </button>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-[#0f1117] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-gray-400" />
            <h2 className="text-lg font-bold text-white">Customer Info</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Name</p>
              <p className="text-white font-medium">{order.user?.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Email</p>
              <p className="text-white text-sm">{order.user?.email}</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Phone</p>
                <button
                  onClick={() => copyToClipboard(order.user?.phone, "phone")}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition"
                >
                  <Copy size={12} />
                  {copied === "phone" ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-white text-sm font-mono">{order.user?.phone}</p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-[#0f1117] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-gray-400" />
            <h2 className="text-lg font-bold text-white">Delivery Address</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Name</p>
              <p className="text-white font-medium">{order.shippingAddress?.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Address</p>
              <p className="text-white text-sm">{order.shippingAddress?.street}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">City</p>
                <p className="text-white text-sm">{order.shippingAddress?.city}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">State</p>
                <p className="text-white text-sm">{order.shippingAddress?.state}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Pincode</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono">{order.shippingAddress?.zip}</p>
                <button
                  onClick={() => copyToClipboard(order.shippingAddress?.zip, "zip")}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition"
                >
                  <Copy size={12} />
                  {copied === "zip" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-[#0f1117] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-gray-400" />
            <h2 className="text-lg font-bold text-white">Payment Summary</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">{formatINR(order.total * 0.9)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Delivery</span>
              <span className="text-white">₹0</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Tax</span>
              <span>{formatINR(order.total * 0.1)}</span>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between">
              <span className="text-gray-300 font-semibold">Total Amount</span>
              <span className="text-white font-bold text-xl">{formatINR(order.total)}</span>
            </div>
            {order.refundStatus && (
              <div className="bg-green-600/20 border border-green-700 rounded-lg p-2">
                <p className="text-green-300 text-xs font-medium">Refund Status: {order.refundStatus}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-[#0f1117] border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-gray-400" />
          <h2 className="text-lg font-bold text-white">Order Items ({order.items.length})</h2>
        </div>
        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.productId} className="flex items-center gap-4 bg-[#080b12] rounded-xl p-4 border border-gray-800">
              <img
                src={item.product?.images?.[0]?.url ?? "/placeholder.png"}
                alt={item.product?.title}
                crossOrigin="anonymous"
                className="w-16 h-16 object-cover rounded-lg border border-gray-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{item.product?.title}</p>
                <p className="text-gray-400 text-sm">Quantity: {item.quantity} {item.unit}</p>
                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(item.selectedOptions).map(([k, v]: [string, any]) =>
                      v ? (
                        <span key={k} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                          {k}: {v}
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-white font-bold">{formatINR(item.price * item.quantity)}</p>
                <p className="text-gray-400 text-xs">{formatINR(item.price)}/{item.unit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection reason if rejected */}
      {order.status === "Rejected" && order.rejectionReason && (
        <div className="bg-red-900/20 border border-red-700 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-red-300 font-semibold mb-1">Rejection Reason</h3>
              <p className="text-red-200 text-sm">{order.rejectionReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f1117] border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Reject Order #{order.id.slice(-6).toUpperCase()}</h3>
            <p className="text-gray-400 text-sm mb-4">Provide reason for rejection (will be shown to customer with refund):</p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => { setRejectionReason(e.target.value); setReasonError(""); }}
              placeholder="e.g. Item out of stock, unable to fulfill..."
              className="w-full p-3 bg-[#080b12] text-white border border-gray-700 rounded-lg resize-none outline-none focus:border-red-500 transition"
            />
            {reasonError && <p className="text-red-400 text-xs mt-1">{reasonError}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(false); setRejectionReason(""); setReasonError(""); }}
                className="flex-1 py-2.5 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrderDetailPage;


