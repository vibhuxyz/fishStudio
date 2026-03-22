"use client";
import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  ShoppingBag,
  ShieldAlert,
  AlertTriangle,
  Fish,
  MapPin,
  Phone,
  User,
  ChevronRight,
  X,
  Eye,
  Copy,
  CreditCard,
  Store,
  Tag,
} from "lucide-react";
import useRequireStaff from "@/hooks/useRequireStaff";
import { MOCK_ORDERS, MockOrder, OrderStatus } from "@/shared/mocks/staffMockData";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  New: {
    label: "New Order",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    dot: "bg-amber-400",
  },
  Processing: {
    label: "Processing",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
    dot: "bg-blue-400",
  },
  Ready: {
    label: "Ready to Pickup",
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/30",
    dot: "bg-teal-400",
  },
  Completed: {
    label: "Completed",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    dot: "bg-green-400",
  },
  Rejected: {
    label: "Rejected",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    dot: "bg-red-400",
  },
};

const COLUMN_ORDER: OrderStatus[] = ["New", "Processing", "Ready", "Completed", "Rejected"];

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

// ─── Accept Confirmation Modal ───────────────────────────────────────────────

function AcceptModal({
  order,
  onConfirm,
  onCancel,
}: {
  order: MockOrder;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0f1117] border border-gray-700/60 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            <h3 className="text-white font-semibold text-base">Confirm Stock &amp; Accept Order</h3>
          </div>
          <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {/* Customer info */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#1e2433] flex items-center justify-center shrink-0">
              <User size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{order.user.name}</p>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <Phone size={11} />
                {order.user.phone}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-white font-bold text-lg">{formatINR(order.total)}</p>
              <p className="text-gray-500 text-xs">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5 text-xs text-gray-400 mb-4">
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.zip}</span>
          </div>
        </div>

        {/* Items */}
        <div className="px-5 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Order Items</p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 bg-[#1a1f2e] rounded-xl p-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0f1117] shrink-0 flex items-center justify-center">
                  <Fish size={22} className="text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.product.title}</p>
                  <p className="text-gray-400 text-xs">
                    {item.quantity} {item.unit}
                    {Object.keys(item.selectedOptions).length > 0 &&
                      ` · ${Object.values(item.selectedOptions).join(", ")}`}
                  </p>
                </div>
                <p className="text-white font-semibold text-sm shrink-0">
                  {formatINR(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="mx-5 mb-4 bg-amber-400/10 border border-amber-400/25 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300 text-sm leading-relaxed">
            Please verify all items are <strong>in stock</strong> before accepting. Once accepted, this order cannot be cancelled.
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            Yes, Accept Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reject Modal ────────────────────────────────────────────────────────────

function RejectModal({
  order,
  onConfirm,
  onCancel,
}: {
  order: MockOrder;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Please enter a rejection reason.");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0f1117] border border-gray-700/60 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-400" />
            <h3 className="text-white font-semibold text-base">Reject Order #{order.id.slice(-6).toUpperCase()}</h3>
          </div>
          <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-gray-400 text-sm">
            Provide a reason for the customer. An automatic refund of{" "}
            <strong className="text-white">{formatINR(order.total)}</strong> will be initiated.
          </p>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Rejection Reason *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            placeholder="e.g. Surmai is out of stock today. We cannot fulfil this order..."
            className="w-full bg-[#1a1f2e] border border-gray-700 text-white text-sm rounded-xl p-3 resize-none outline-none focus:border-red-500/60 transition placeholder-gray-600"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <XCircle size={16} />
            Reject &amp; Refund
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Detail Modal ──────────────────────────────────────────────────────

const MOCK_SELLER_DETAILS = {
  name: "Rajan Fisheries Pvt. Ltd.",
  email: "rajan@fishstudio.in",
  phone: "+91 98400 12345",
  store: { name: "FishStudio", address: "32, Fishing Harbour, Kochi, Kerala - 682001" },
};

function OrderDetailModal({ order, onClose }: { order: MockOrder; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const cfg = STATUS_CONFIG[order.status];
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const discount = order.total < subtotal ? subtotal - order.total : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0d1117] border border-gray-700/60 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-[#0d1117] z-10">
          <div>
            <h2 className="text-white font-bold text-lg">Order #{order.id.slice(-6).toUpperCase()}</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-white transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer + Seller row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer */}
            <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <User size={15} className="text-gray-400" />
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</h3>
              </div>
              <p className="text-white font-semibold">{order.user.name}</p>
              <p className="text-gray-400 text-sm mt-1">{order.user.email}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-300 text-sm font-mono flex items-center gap-1.5">
                  <Phone size={12} className="text-gray-500" />
                  {order.user.phone}
                </p>
                <button
                  type="button"
                  onClick={() => copy(order.user.phone, "phone")}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition"
                >
                  <Copy size={11} />
                  {copied === "phone" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Seller */}
            <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Store size={15} className="text-gray-400" />
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seller</h3>
              </div>
              <p className="text-white font-semibold">{MOCK_SELLER_DETAILS.store.name}</p>
              <p className="text-gray-400 text-sm mt-1">{MOCK_SELLER_DETAILS.name}</p>
              <p className="text-gray-400 text-sm">{MOCK_SELLER_DETAILS.email}</p>
              <p className="text-gray-300 text-sm font-mono mt-1">{MOCK_SELLER_DETAILS.phone}</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} className="text-gray-400" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Address</h3>
              <button
                type="button"
                onClick={() => copy(`${order.shippingAddress.name}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}`, "addr")}
                className="ml-auto text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition"
              >
                <Copy size={11} />
                {copied === "addr" ? "Copied!" : "Copy Full Address"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <p className="text-gray-500 text-xs">Name</p>
                <p className="text-white text-sm font-medium">{order.shippingAddress.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Street</p>
                <p className="text-white text-sm">{order.shippingAddress.street}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">City</p>
                <p className="text-white text-sm">{order.shippingAddress.city}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">State</p>
                <p className="text-white text-sm">{order.shippingAddress.state}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Pincode</p>
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-mono">{order.shippingAddress.zip}</p>
                  <button type="button" onClick={() => copy(order.shippingAddress.zip, "pin")} className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition">
                    <Copy size={10} />{copied === "pin" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Fish size={15} className="text-teal-400" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Items ({order.items.length})</h3>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 bg-[#0f1117] border border-gray-800 rounded-xl p-3">
                  <div className="w-12 h-12 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <Fish size={20} className="text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{item.product.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {item.quantity} {item.unit}
                      {Object.keys(item.selectedOptions).length > 0 && ` · ${Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(", ")}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-bold text-sm">{formatINR(item.price * item.quantity)}</p>
                    <p className="text-gray-500 text-xs">{formatINR(item.price)}/{item.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-[#0f1117] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={15} className="text-gray-400" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span><span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span className="flex items-center gap-1.5"><Tag size={12} /> Coupon Discount</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>GST (5%)</span><span>{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery</span><span className="text-green-400">Free</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                <span className="text-white">Total Paid</span>
                <span className="text-white text-lg">{formatINR(order.total)}</span>
              </div>
            </div>
            {order.refundStatus && (
              <div className="mt-3 bg-green-500/10 border border-green-500/25 rounded-lg px-3 py-2">
                <p className="text-green-300 text-xs font-semibold">Refund Status: {order.refundStatus}</p>
              </div>
            )}
          </div>

          {/* Rejection reason */}
          {order.status === "Rejected" && order.rejectionReason && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-red-200 text-sm">{order.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Order Card ──────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onAccept,
  onReject,
  onMarkReady,
  onMarkCompleted,
  onViewDetails,
}: {
  order: MockOrder;
  onAccept: (o: MockOrder) => void;
  onReject: (o: MockOrder) => void;
  onMarkReady: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onViewDetails: (o: MockOrder) => void;
}) {
  const cfg = STATUS_CONFIG[order.status];

  return (
    <div className="bg-[#0f1117] border border-gray-800/60 rounded-2xl p-4 hover:border-gray-700 transition group">
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
            {cfg.label}
          </span>
        </div>
        <span className="text-gray-600 text-xs">{timeAgo(order.createdAt)}</span>
      </div>

      {/* Order ID + total */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-xs font-mono">#{order.id.slice(-6).toUpperCase()}</p>
        <p className="text-white font-bold text-base">{formatINR(order.total)}</p>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-[#1e2433] flex items-center justify-center">
          <User size={13} className="text-gray-400" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{order.user.name}</p>
          <p className="text-gray-500 text-xs flex items-center gap-1">
            <MapPin size={10} />
            {order.shippingAddress.city}, {order.shippingAddress.state}
          </p>
        </div>
      </div>

      {/* Items preview */}
      <div className="space-y-1.5 mb-4">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.productId} className="flex items-center gap-2 bg-[#1a1f2e] rounded-lg px-3 py-2">
            <Fish size={14} className="text-teal-500 shrink-0" />
            <span className="text-gray-200 text-xs truncate flex-1">{item.product.title}</span>
            <span className="text-gray-400 text-xs shrink-0">{item.quantity} {item.unit}</span>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-gray-600 text-xs text-center">+{order.items.length - 2} more items</p>
        )}
      </div>

      {/* Rejection info */}
      {order.status === "Rejected" && order.rejectionReason && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
          <p className="text-red-400 text-xs leading-relaxed">{order.rejectionReason}</p>
          {order.refundStatus && (
            <p className="text-green-400 text-xs mt-1 font-medium">Refund: {order.refundStatus}</p>
          )}
        </div>
      )}

      {/* View Details */}
      <button
        type="button"
        onClick={() => onViewDetails(order)}
        className="w-full flex items-center justify-center gap-1.5 py-2 mb-2 bg-[#1a1f2e] hover:bg-[#1e2540] border border-gray-700/50 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition"
      >
        <Eye size={13} />
        View Full Details
      </button>

      {/* Action buttons */}
      {order.status === "New" && (
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => onAccept(order)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-semibold transition"
          >
            <CheckCircle size={14} />
            Accept
          </button>
          <button
            type="button"
            onClick={() => onReject(order)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600/20 hover:bg-red-600 border border-red-600/40 hover:border-red-500 text-red-400 hover:text-white rounded-xl text-xs font-semibold transition"
          >
            <XCircle size={14} />
            Reject
          </button>
        </div>
      )}

      {order.status === "Processing" && (
        <button
          type="button"
          onClick={() => onMarkReady(order.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-teal-600/20 hover:bg-teal-600 border border-teal-600/40 hover:border-teal-500 text-teal-400 hover:text-white rounded-xl text-xs font-semibold transition"
        >
          <Package size={14} />
          Mark as Ready to Pickup
        </button>
      )}

      {order.status === "Ready" && (
        <button
          type="button"
          onClick={() => onMarkCompleted(order.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-green-600/20 hover:bg-green-600 border border-green-600/40 hover:border-green-500 text-green-400 hover:text-white rounded-xl text-xs font-semibold transition"
        >
          <CheckCircle size={14} />
          Mark as Completed
        </button>
      )}

      {order.status === "Processing" && (
        <p className="text-center text-gray-600 text-xs mt-2 flex items-center justify-center gap-1">
          <Clock size={11} />
          Cannot cancel — order is being processed
        </p>
      )}
    </div>
  );
}

// ─── Column ──────────────────────────────────────────────────────────────────

function StatusColumn({
  status,
  orders,
  onAccept,
  onReject,
  onMarkReady,
  onMarkCompleted,
  onViewDetails,
}: {
  status: OrderStatus;
  orders: MockOrder[];
  onAccept: (o: MockOrder) => void;
  onReject: (o: MockOrder) => void;
  onMarkReady: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onViewDetails: (o: MockOrder) => void;
}) {
  const cfg = STATUS_CONFIG[status];
  const COLUMN_ICONS: Record<OrderStatus, React.ReactNode> = {
    New: <ShoppingBag size={15} className="text-amber-400" />,
    Processing: <Clock size={15} className="text-blue-400" />,
    Ready: <Package size={15} className="text-teal-400" />,
    Completed: <CheckCircle size={15} className="text-green-400" />,
    Rejected: <XCircle size={15} className="text-red-400" />,
  };

  return (
    <div className="flex flex-col min-w-[300px] w-[300px]">
      {/* Column header */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-3 ${cfg.bg} border ${cfg.border}`}>
        {COLUMN_ICONS[status]}
        <span className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-700 border-2 border-dashed border-gray-800 rounded-2xl">
            <Fish size={24} className="mb-2 opacity-40" />
            <p className="text-xs">No orders</p>
          </div>
        ) : (
          orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onAccept={onAccept}
              onReject={onReject}
              onMarkReady={onMarkReady}
              onMarkCompleted={onMarkCompleted}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Stats bar ───────────────────────────────────────────────────────────────

function StatsBar({ orders }: { orders: MockOrder[] }) {
  const total = orders.reduce((s, o) => s + (o.status !== "Rejected" ? o.total : 0), 0);
  const newCount = orders.filter((o) => o.status === "New").length;
  const processingCount = orders.filter((o) => o.status === "Processing").length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[
        { label: "New Orders", value: String(newCount), sub: "Awaiting action", color: "text-amber-400", icon: <ShoppingBag size={18} className="text-amber-400" /> },
        { label: "Processing", value: String(processingCount), sub: "In kitchen", color: "text-blue-400", icon: <Clock size={18} className="text-blue-400" /> },
        { label: "Completed Today", value: String(completedCount), sub: "Orders done", color: "text-green-400", icon: <CheckCircle size={18} className="text-green-400" /> },
        { label: "Revenue", value: formatINR(total), sub: "Excl. rejected", color: "text-teal-400", icon: <Fish size={18} className="text-teal-400" /> },
      ].map((s) => (
        <div key={s.label} className="bg-[#0f1117] border border-gray-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a1f2e] flex items-center justify-center shrink-0">
            {s.icon}
          </div>
          <div>
            <p className={`font-bold text-lg leading-tight ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const StaffOrdersPage = () => {
  const { staff, isLoading: authLoading } = useRequireStaff();
  const [orders, setOrders] = useState<MockOrder[]>(MOCK_ORDERS);
  const [acceptTarget, setAcceptTarget] = useState<MockOrder | null>(null);
  const [rejectTarget, setRejectTarget] = useState<MockOrder | null>(null);
  const [detailTarget, setDetailTarget] = useState<MockOrder | null>(null);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "All">("All");

  const sellerNotLinked = !authLoading && staff && (!staff.isActive || !staff.sellerId);

  const handleAcceptConfirm = () => {
    if (!acceptTarget) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === acceptTarget.id ? { ...o, status: "Processing" } : o)),
    );
    setAcceptTarget(null);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === rejectTarget.id
          ? { ...o, status: "Rejected", rejectionReason: reason, refundStatus: "Refunded" }
          : o,
      ),
    );
    setRejectTarget(null);
  };

  const handleMarkReady = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "Ready" } : o)));
  };

  const handleMarkCompleted = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "Completed" } : o)));
  };

  const filteredOrders =
    activeFilter === "All" ? orders : orders.filter((o) => o.status === activeFilter);

  // For "All" view, limit completed/rejected to 3 each
  const displayOrders = activeFilter === "All" 
    ? orders.map(o => {
        if (o.status === "Completed" && orders.filter(x => x.status === "Completed").indexOf(o) >= 3) return null;
        if (o.status === "Rejected" && orders.filter(x => x.status === "Rejected").indexOf(o) >= 3) return null;
        return o;
      }).filter(Boolean) as MockOrder[]
    : filteredOrders;

  if (sellerNotLinked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mb-4">
          <ShieldAlert size={32} className="text-yellow-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Not Granted</h2>
        <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
          Your staff account has not been activated by the seller yet. Please ask your seller to
          grant you access from their Staff Management dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#080b12] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Fish size={22} className="text-teal-400" />
            <h1 className="text-xl font-bold text-white">Order Board</h1>
          </div>
          <p className="text-gray-500 text-sm">FishStudio — Staff Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/25 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Stats */}
      <StatsBar orders={orders} />

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {(["All", ...COLUMN_ORDER] as const).map((s) => {
          const isActive = activeFilter === s;
          const cfg = s === "All" ? null : STATUS_CONFIG[s as OrderStatus];
          return (
            <button
              key={s}
              type="button"
              onClick={() => setActiveFilter(s as OrderStatus | "All")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                isActive
                  ? cfg
                    ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                    : "bg-white/10 text-white border-white/20"
                  : "bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300"
              }`}
            >
              {s === "All" ? "All Orders" : STATUS_CONFIG[s as OrderStatus].label}
              {s !== "All" && (
                <span className="ml-1.5 opacity-70">
                  {orders.filter((o) => o.status === s).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Board */}
      {activeFilter === "All" ? (
        <div className="flex gap-4 overflow-x-auto pb-6" style={{ minHeight: "calc(100vh - 280px)" }}>
          {COLUMN_ORDER.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              orders={displayOrders.filter((o) => o.status === status)}
              onAccept={setAcceptTarget}
              onReject={setRejectTarget}
              onMarkReady={handleMarkReady}
              onMarkCompleted={handleMarkCompleted}
              onViewDetails={setDetailTarget}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center py-20 text-gray-700">
              <Fish size={36} className="mb-3 opacity-30" />
              <p className="text-sm">No orders in this status</p>
            </div>
          ) : (
            filteredOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onAccept={setAcceptTarget}
                onReject={setRejectTarget}
                onMarkReady={handleMarkReady}
                onMarkCompleted={handleMarkCompleted}
                onViewDetails={setDetailTarget}
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {acceptTarget && (
        <AcceptModal
          order={acceptTarget}
          onConfirm={handleAcceptConfirm}
          onCancel={() => setAcceptTarget(null)}
        />
      )}
      {rejectTarget && (
        <RejectModal
          order={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}
      {detailTarget && (
        <OrderDetailModal
          order={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  );
};

export default StaffOrdersPage;
