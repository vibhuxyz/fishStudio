"use client";
export const dynamic = "force-dynamic";
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
  Zap,
} from "lucide-react";
import useRequireStaff from "@/hooks/useRequireStaff";
import { MockOrder, OrderStatus, MOCK_ORDERS } from "@/shared/mocks/staffMockData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2 } from "lucide-react";

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
            {order.items.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="flex items-center gap-3 bg-[#1a1f2e] rounded-xl p-3">
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
  name: "Arjun (Manager)",
  email: "manager@themarinemarket.com",
  phone: "+91 91234 56780",
  store: { 
    name: "The Marine Market", 
    address: "Bazar Peth, Near Fish Jetty, Mumbai" 
  },
};

function OrderDetailModal({ 
  order, 
  onClose,
  staff
}: { 
  order: MockOrder; 
  onClose: () => void;
  staff: any;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const statusCfg = STATUS_CONFIG[order.status];
  const billDetails = order.billDetails;

  const storeInfo = staff?.seller?.store || staff?.store || MOCK_SELLER_DETAILS.store;

  const slotLabel =
    order.deliverySlot === "instant"
      ? "⚡ Instant (30–45 mins)"
      : order.deliverySlot === "morning"
        ? "🌅 Morning (6 AM – 10 AM)"
        : order.deliverySlot === "evening"
          ? "🌆 Evening (5 PM – 9 PM)"
          : "Standard Delivery";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0a0a0c] border border-gray-800/60 rounded-[2rem] w-full max-w-[80vw] h-[92vh] overflow-y-auto shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-900 sticky top-0 bg-[#0a0a0c]/80 backdrop-blur-xl z-10">
          <div>
            <h2 className="text-white font-black text-2xl tracking-tighter uppercase italic">Order #{order.id.slice(-6).toUpperCase()}</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              Placed on {new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
              <span className={`w-2 h-2 rounded-full ${statusCfg.dot} animate-pulse`} />
              {statusCfg.label}
            </span>
            <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-full transition-all active:scale-95">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Info Cards */}
            <div className="space-y-6">
              {/* Delivering To */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <MapPin size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5">Delivering To</h3>
                  <p className="text-white font-bold text-base tracking-tight">{order.shippingAddress.name}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mt-1 italic">
                    {order.shippingAddress.street}, {order.shippingAddress.city} – {order.shippingAddress.zip}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-gray-200 text-sm font-black tracking-tight flex items-center gap-1.5">
                      <Phone size={14} className="text-blue-500" />
                      {order.user.phone}
                    </p>
                    <button
                      type="button"
                      onClick={() => copy(order.user.phone, "phone")}
                      className="text-[10px] font-bold text-blue-500 hover:underline opacity-60 hover:opacity-100 transition"
                    >
                      {copied === "phone" ? "Copied!" : "Copy Number"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Slot */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  {order.deliverySlot === "instant" ? <Zap size={22} /> : <Clock size={22} />}
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5">Delivery Slot</h3>
                  <p className="text-white font-bold text-base tracking-tight">{slotLabel}</p>
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5">Payment</h3>
                  <p className="text-white font-bold text-base tracking-tight">
                    {order.paymentMethod === "COD" ? "Pay on Delivery (COD)" : (order.paymentMethod || "Online Payment")}
                  </p>
                </div>
              </div>

              {/* Fulfilled By (Store info) */}
              <div className="pt-6 border-t border-gray-900 flex items-start gap-4 opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 text-gray-500 group-hover:text-white transition-all">
                  <Store size={18} />
                </div>
                <div>
                  <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-0.5">Fulfilled By</h3>
                  <p className="text-gray-300 font-bold text-xs">{storeInfo.name}</p>
                  <p className="text-gray-500 text-[10px]">{storeInfo.address}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Items & Bill Summary */}
            <div className="space-y-6">
              <div className="bg-[#0f0f12] border border-gray-900 rounded-[2rem] p-6 shadow-inner">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 mb-6 font-mono">Order Items</h3>
                <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2 scrollbar-hide">
                  {order.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="flex flex-col gap-2 group">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-black border border-gray-800 overflow-hidden shrink-0 group-hover:border-blue-500/50 transition-all duration-300">
                          {item.product.images[0]?.url ? (
                             <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Fish size={24} className="text-gray-700" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-lg truncate tracking-tight">{item.product.title}</p>
                          <p className="text-gray-500 text-sm font-medium mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-white font-black text-lg italic tracking-tighter">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                      
                      {/* Customization Details */}
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="ml-18 flex flex-wrap gap-2">
                          {Object.entries(item.selectedOptions).map(([key, value]) => (
                            value && (
                              <span key={key} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20 font-bold uppercase tracking-wider">
                                {key}: {String(value)}
                              </span>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div className="mt-8 pt-6 border-t border-gray-900 space-y-3">
                  <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-tight">
                    <span>Items Total</span>
                    <span className="text-gray-400">₹{billDetails?.itemTotal ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-tight">
                    <span>Delivery Charge</span>
                    <span className="text-green-500">₹{billDetails?.deliveryCharge ?? 0}</span>
                  </div>
                  {billDetails?.extraCharge ? (
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-tight">
                      <span>Instant Fee</span>
                      <span className="text-amber-500">₹{billDetails.extraCharge}</span>
                    </div>
                  ) : null}
                  {billDetails?.discount ? (
                    <div className="flex justify-between text-xs font-black text-emerald-500 uppercase tracking-tight italic">
                      <span>Discount</span>
                      <span>-₹{billDetails.discount}</span>
                    </div>
                  ) : null}
                  
                  <div className="pt-5 border-t border-gray-800 flex justify-between items-center group">
                    <div className="space-y-0.5">
                      <span className="block font-black uppercase italic tracking-tighter text-sm text-white group-hover:text-blue-500 transition-colors">Total Paid</span>
                      <span className="block text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Inc. all taxes</span>
                    </div>
                    <span className="text-4xl font-black text-blue-600 tracking-tighter group-hover:scale-105 transition-transform duration-300">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          {order.status === "Rejected" && order.rejectionReason && (
            <div className="p-6 rounded-[1.5rem] bg-rose-500/5 border border-rose-500/10">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <ShieldAlert size={14} /> Rejection Reason
              </p>
              <p className="text-rose-200/70 text-sm font-medium leading-relaxed italic">"{order.rejectionReason}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Order Card ──────────────────────────────────────────────────────────────

export function OrderCard({
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
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
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
        <span className="text-gray-600 text-xs">{mounted ? timeAgo(order.createdAt) : "Recently"}</span>
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
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={`${item.productId}-${idx}`} className="bg-[#1a1f2e] rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Fish size={14} className="text-teal-500 shrink-0" />
              <span className="text-gray-200 text-xs truncate flex-1">{item.product.title}</span>
              <span className="text-gray-400 text-xs shrink-0">{item.quantity} {item.unit}</span>
            </div>
            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.entries(item.selectedOptions).map(([key, value]) => (
                  value && (
                    <span key={key} className="text-[9px] text-teal-500/70 font-medium">
                      {key[0].toUpperCase()}: {String(value)}
                    </span>
                  )
                ))}
              </div>
            )}
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
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { staff, isLoading: authLoading } = useRequireStaff();
  const queryClient = useQueryClient();

  const isStaff = staff?.role === "staff";
  const sellerNotLinked = !authLoading && staff && isStaff && (!staff.isActive || !staff.sellerId);
  const canFetch = !!staff && (staff.role === "seller" || staff.isActive);

  const { data: realOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["staff-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/get-seller-orders");
      return res.data.orders.map((o: any): MockOrder => ({
        id: o.id,
        status: o.status === "ACCEPTED"  ? "Processing"
               : o.status === "REJECTED"  ? "Rejected"
               : o.status === "SHIPPED"   ? "Ready"
               : o.status === "DELIVERED" ? "Completed"
               : "New",
        createdAt: o.createdAt,
        total: o.totalAmount ?? 0,
        user: {
          id: o.user?.id || o.userId || "",
          name: o.deliveryName || o.user?.name || "Customer",
          phone: o.deliveryPhone || o.user?.phone_number || "-",
          email: o.user?.email || "-",
          avatar: o.user?.avatar || null,
        },
        shippingAddress: {
          name: o.deliveryName || o.user?.name || "Customer",
          street: o.deliveryAddress || "N/A",
          city: o.deliveryCity || "-",
          state: "-",
          zip: o.deliveryPincode || "-",
        },
        deliverySlot: o.deliverySlot,
        paymentMethod: o.paymentMethod,
        billDetails: o.billDetails,
        items: (o.orderItems || []).map((i: any) => ({
          productId: i.productId,
          product: { 
            title: i.product?.title || "Product",
            images: i.product?.images || []
          },
          quantity: i.quantity,
          price: i.price,
          unit: "pc",
          selectedOptions: i.selectedOptions || {},
        })),
        rejectionReason: o.rejectionReason,
        refundStatus: o.paymentStatus === "REFUNDED" ? "Refunded" : null,
      }));
    },
    enabled: canFetch,
  });

  const orders = realOrders; // Use real populated orders
  const [acceptTarget, setAcceptTarget] = useState<MockOrder | null>(null);
  const [rejectTarget, setRejectTarget] = useState<MockOrder | null>(null);
  const [detailTarget, setDetailTarget] = useState<MockOrder | null>(null);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "All">("All");

  const acceptMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return axiosInstance.put(`/order/api/accept-reject/${orderId}`, { action: "accept" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
      setAcceptTarget(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string, reason: string }) => {
      return axiosInstance.put(`/order/api/accept-reject/${orderId}`, { action: "reject", rejectionReason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
      setRejectTarget(null);
    }
  });

  const handleAcceptConfirm = () => {
    if (!acceptTarget) return;
    acceptMutation.mutate(acceptTarget.id);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) return;
    rejectMutation.mutate({ orderId: rejectTarget.id, reason });
  };

  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) =>
      axiosInstance.put(`/order/api/update-status/${orderId}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-orders"] }),
  });

  const handleMarkReady = (id: string) => {
    statusMutation.mutate({ orderId: id, status: "SHIPPED" });
  };

  const handleMarkCompleted = (id: string) => {
    statusMutation.mutate({ orderId: id, status: "DELIVERED" });
  };

  const filteredOrders =
    activeFilter === "All" ? orders : orders.filter((o: MockOrder) => o.status === activeFilter);

  // For "All" view, limit completed/rejected to 3 each
  const displayOrders = activeFilter === "All" 
    ? orders.map((o: MockOrder) => {
        if (o.status === "Completed" && orders.filter((x: MockOrder) => x.status === "Completed").indexOf(o) >= 3) return null;
        if (o.status === "Rejected" && orders.filter((x: MockOrder) => x.status === "Rejected").indexOf(o) >= 3) return null;
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
      {ordersLoading && (
        <div className="flex items-center gap-2 mb-4 text-gray-500">
          <Loader2 className="animate-spin" size={16} /> <span className="text-sm">Fetching live orders...</span>
        </div>
      )}

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
                  {orders.filter((o: MockOrder) => o.status === s).length}
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
              orders={displayOrders.filter((o: MockOrder) => o.status === status)}
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
            filteredOrders.map((o: MockOrder) => (
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
          staff={staff}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  );
};

export default StaffOrdersPage;
