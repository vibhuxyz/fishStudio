"use client";
export const dynamic = "force-dynamic";
import React, { useState } from "react";
import Image from "next/image";
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
  Bell,
  Wifi,
  WifiOff,
  Truck,
} from "lucide-react";
import useRequireStaff from "@/hooks/useRequireStaff";
import { MockOrder, OrderStatus, MOCK_ORDERS } from "@/shared/mocks/staffMockData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useWorkerWS } from "@/context/worker-ws-context";
import { isProtected } from "@/utils/protected";
import { Button } from "@repo/ui";
import { formatOrderId } from "@repo/shared/order-id";

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
  isSubmitting,
}: {
  order: MockOrder;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
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
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
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
          <Button
            onClick={onCancel}
            disabled={isSubmitting}
            variant="blue"
            glow={false}
            fullWidth={false}
            className="flex-1 !bg-transparent !border-gray-700 !text-gray-300 hover:!bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            loaderLabel="Accepting Order..."
            variant="emerald"
            className="flex-1"
          >
            <CheckCircle size={16} className="mr-2" />
            Yes, Accept Order
          </Button>
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
  isSubmitting,
}: {
  order: MockOrder;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
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
            <h3 className="text-white font-semibold text-base">Reject Order {formatOrderId(order.id)}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
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
            disabled={isSubmitting}
            placeholder="e.g. Surmai is out of stock today. We cannot fulfil this order..."
            className="w-full bg-[#1a1f2e] border border-gray-700 text-white text-sm rounded-xl p-3 resize-none outline-none focus:border-red-500/60 disabled:opacity-60 transition placeholder-gray-600"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <Button
            onClick={onCancel}
            disabled={isSubmitting}
            variant="blue"
            glow={false}
            fullWidth={false}
            className="flex-1 !bg-transparent !border-gray-700 !text-gray-300 hover:!bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            isLoading={isSubmitting}
            loaderLabel="Rejecting & Refunding..."
            variant="rose"
            className="flex-1"
          >
            <XCircle size={16} className="mr-2" />
            Reject & Refund
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Rider avatar ────────────────────────────────────────────────────────────

function RiderAvatar({ rider, size = 40 }: { rider: { name: string; photo?: { url: string } | null }; size?: number }) {
  if (rider.photo?.url) {
    return (
      <Image
        src={rider.photo.url}
        alt={rider.name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0"
    >
      <Truck size={size * 0.45} className="text-indigo-400" />
    </div>
  );
}

// ─── Assign Rider Modal ──────────────────────────────────────────────────────

function AssignRiderModal({
  order,
  orderRequestConfig,
  isAssigning,
  onAssign,
  onClose,
}: {
  order: MockOrder;
  orderRequestConfig: Record<string, unknown>;
  isAssigning: boolean;
  onAssign: (riderId: string) => void;
  onClose: () => void;
}) {
  const { data: riders = [], isLoading } = useQuery({
    queryKey: ["eligible-riders", order.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/eligible-riders/${order.id}`, orderRequestConfig);
      return res.data?.riders ?? [];
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0f1117] border border-gray-700/60 rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-indigo-400" />
            <h3 className="text-white font-semibold text-base">Assign a Rider</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isAssigning}
            className="text-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : riders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">
              No riders are available right now. Add or free up a rider from the Riders page first.
            </p>
          ) : (
            riders.map((rider: any) => (
              <div
                key={rider.id}
                className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#1a1f2e] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <RiderAvatar rider={rider} size={36} />
                  <div className="text-sm text-gray-200">
                    <p className="font-semibold text-white">{rider.name}</p>
                    <p className="text-emerald-400 text-xs mt-0.5">Available</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Current Deliveries: {rider.activeDeliveryCount} · Phone: {rider.phone}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onAssign(rider.id)}
                  disabled={isAssigning}
                  isLoading={isAssigning}
                  loaderLabel="Assigning..."
                  variant="indigo"
                  glow={false}
                  fullWidth={false}
                  className="!h-9 !px-4 !text-[10px] !rounded-lg"
                >
                  Assign
                </Button>
              </div>
            ))
          )}
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
            <h2 className="text-white font-black text-2xl tracking-tighter uppercase italic">Order {formatOrderId(order.id)}</h2>
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
  onMarkShipped,
  onMarkCompleted,
  onAssignRider,
  onViewDetails,
  pendingAction,
}: {
  order: MockOrder;
  onAccept: (o: MockOrder) => void;
  onReject: (o: MockOrder) => void;
  onMarkReady: (id: string) => void;
  onMarkShipped: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onAssignRider: (o: MockOrder) => void;
  onViewDetails: (o: MockOrder) => void;
  pendingAction?: string | null;
}) {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const cfg = STATUS_CONFIG[order.status];
  const isBusy = Boolean(pendingAction);

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[1.5rem] p-5 hover:bg-white/[0.05] hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300 group relative overflow-hidden">
      {/* Subtle top glow */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-${cfg.color.split("-")[1]}-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
          <span className={`w-1 h-1 rounded-full ${cfg.dot} animate-pulse`} />
          {cfg.label}
        </span>
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{mounted ? timeAgo(order.createdAt) : "Recently"}</span>
      </div>

      {/* Order ID + Main Price */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-0.5">Order Token</p>
          <p className="text-white font-mono text-sm font-bold tracking-tight">{formatOrderId(order.id)}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-black text-xl italic tracking-tighter">{formatINR(order.total)}</p>
        </div>
      </div>

      {/* Customer / Location Info */}
      <div className="flex items-start gap-3 mb-5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          <User size={18} className="text-slate-400" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-black tracking-tight leading-tight mb-0.5">{order.user.name}</p>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
            <MapPin size={10} className="shrink-0" />
            {order.shippingAddress.city}
          </p>
        </div>
        <button 
          onClick={() => onViewDetails(order)}
          className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
          title="Details"
        >
          <Eye size={14} />
        </button>
      </div>

      {/* Items Preview */}
      <div className="space-y-2 mb-6">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 mb-2">Inventory Stream</p>
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={`${item.productId}-${idx}`} className="flex items-center gap-3 group/item">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover/item:border-teal-500/30 transition-colors">
              <Fish size={14} className="text-teal-500/70" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-200 text-xs font-bold truncate leading-none mb-1">{item.product.title}</p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">{item.quantity} {item.unit}</p>
            </div>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest text-center pt-1 italic">
            + {order.items.length - 2} Additional Signal{order.items.length - 2 > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Rejection Log */}
      {order.status === "Rejected" && order.rejectionReason && (
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl px-3 py-2.5 mb-5 italic">
          <p className="text-rose-400/80 text-[10px] leading-relaxed font-medium">"{order.rejectionReason}"</p>
          {order.refundStatus && (
            <p className="text-emerald-500 text-[9px] mt-1 font-black uppercase tracking-widest">System Refund: {order.refundStatus}</p>
          )}
        </div>
      )}

      {/* Action Area */}
      <div className="space-y-2.5">
        {order.status === "New" && (
          <div className="flex gap-2">
            <Button
              onClick={() => onAccept(order)}
              disabled={isBusy}
              isLoading={pendingAction === "accepting"}
              loaderLabel="Auth..."
              variant="emerald"
              className="flex-1 !h-11 !rounded-xl !text-[10px] !font-black !uppercase !tracking-widest"
            >
              <CheckCircle size={14} className="mr-1.5" />
              Accept
            </Button>
            <Button
              onClick={() => onReject(order)}
              disabled={isBusy}
              isLoading={pendingAction === "rejecting"}
              loaderLabel="Drop..."
              variant="rose"
              className="flex-1 !h-11 !rounded-xl !text-[10px] !font-black !uppercase !tracking-widest"
            >
              <XCircle size={14} className="mr-1.5" />
              Reject
            </Button>
          </div>
        )}

        {order.status === "Processing" && (
          <Button
            onClick={() => onMarkReady(order.id)}
            disabled={isBusy}
            isLoading={pendingAction === "marking-ready"}
            loaderLabel="Updating Signal..."
            variant="amber"
            className="w-full !h-11 !rounded-xl !text-[10px] !font-black !uppercase !tracking-widest"
          >
            <Package size={14} className="mr-1.5" />
            Initialize Pickup
          </Button>
        )}

        {order.status === "Ready" && order.rawStatus === "READY_FOR_PICKUP" && (
          <Button
            onClick={() => onAssignRider(order)}
            disabled={isBusy}
            isLoading={pendingAction === "assigning-rider"}
            loaderLabel="Assigning..."
            variant="indigo"
            className="w-full !h-11 !rounded-xl !text-[10px] !font-black !uppercase !tracking-widest"
          >
            <Truck size={14} className="mr-1.5" />
            Assign Rider
          </Button>
        )}

        {order.status === "Ready" && order.rawStatus === "ASSIGNED_TO_RIDER" && (
          <div className="space-y-2.5">
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl px-3 py-2.5 flex items-center gap-3">
              {order.rider && <RiderAvatar rider={order.rider} size={32} />}
              <div>
                <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Rider Assigned</p>
                <p className="text-white text-xs font-bold">{order.rider?.name ?? "Rider"}</p>
                {order.rider?.phone && (
                  <p className="text-slate-500 text-[10px] font-bold">{order.rider.phone}</p>
                )}
              </div>
            </div>
            <Button
              onClick={() => onMarkShipped(order.id)}
              disabled={isBusy}
              isLoading={pendingAction === "marking-shipped"}
              loaderLabel="Updating..."
              variant="amber"
              className="w-full !h-11 !rounded-xl !text-[10px] !font-black !uppercase !tracking-widest"
            >
              <Package size={14} className="mr-1.5" />
              Mark Picked Up
            </Button>
          </div>
        )}

        {order.status === "Ready" && order.rawStatus === "SHIPPED" && (
          <Button
            onClick={() => onMarkCompleted(order.id)}
            disabled={isBusy}
            isLoading={pendingAction === "marking-completed"}
            loaderLabel="Terminating Session..."
            variant="emerald"
            className="w-full !h-11 !rounded-xl !text-[10px] !font-black !uppercase !tracking-widest"
          >
            <CheckCircle size={14} className="mr-1.5" />
            Complete Cycle
          </Button>
        )}

        {/* Legacy real-time orders fetched before this client refreshed won't
            carry rawStatus yet — fall back to the old direct-complete button
            rather than showing nothing. */}
        {order.status === "Ready" && !order.rawStatus && (
          <Button
            onClick={() => onMarkCompleted(order.id)}
            disabled={isBusy}
            isLoading={pendingAction === "marking-completed"}
            loaderLabel="Terminating Session..."
            variant="emerald"
            className="w-full !h-11 !rounded-xl !text-[10px] !font-black !uppercase !tracking-widest"
          >
            <CheckCircle size={14} className="mr-1.5" />
            Complete Cycle
          </Button>
        )}

        {order.status === "Processing" && (
          <div className="pt-2">
            <p className="text-center text-slate-600 text-[8px] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-1.5 opacity-50">
              <Clock size={10} />
              Session Locked — Un-cancelable state
            </p>
          </div>
        )}
      </div>
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
  onMarkShipped,
  onMarkCompleted,
  onAssignRider,
  onViewDetails,
  pendingActions,
}: {
  status: OrderStatus;
  orders: MockOrder[];
  onAccept: (o: MockOrder) => void;
  onReject: (o: MockOrder) => void;
  onMarkReady: (id: string) => void;
  onMarkShipped: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onAssignRider: (o: MockOrder) => void;
  onViewDetails: (o: MockOrder) => void;
  pendingActions: Record<string, string | null>;
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
              onMarkShipped={onMarkShipped}
              onMarkCompleted={onMarkCompleted}
              onAssignRider={onAssignRider}
              onViewDetails={onViewDetails}
              pendingAction={pendingActions[o.id] ?? null}
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
  const [isMuted, setIsMuted] = useState(true);
  const isMutedRef = React.useRef(true);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Sync isMuted with localStorage on mount only
  React.useEffect(() => {
    const saved = localStorage.getItem("staff-order-mute");
    if (saved !== null) {
      const muted = saved === "true";
      setIsMuted(muted);
      isMutedRef.current = muted;
    }
  }, []);

  React.useEffect(() => {
    // Initialize notification sound
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.preload = "auto";
    audioRef.current = audio;
  }, []);

  // Browsers block audio.play() until the page has seen a real user gesture.
  // If sound was left on from a previous session (localStorage), the very
  // first NEW_ORDER that arrives before any click/tap hits that block and
  // throws NotAllowedError. Priming playback on the first interaction —
  // whatever it is, not just the mute button — closes that window as early
  // as possible.
  React.useEffect(() => {
    const unlockAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;
      const originalVolume = audio.volume;
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = originalVolume;
        })
        .catch(() => {
          // Still locked — the next interaction will retry via the listener below.
        });
    };
    const events: Array<keyof DocumentEventMap> = ["click", "touchstart", "keydown"];
    events.forEach((event) => document.addEventListener(event, unlockAudio, { once: true }));
    return () => {
      events.forEach((event) => document.removeEventListener(event, unlockAudio));
    };
  }, []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { staff, isLoading: authLoading } = useRequireStaff();
  const queryClient = useQueryClient();
  const { subscribe, connected: wsConnected } = useWorkerWS();
  const linkedStoreId =
    staff?.role === "staff" ? staff?.seller?.store?.id : staff?.store?.id;
  const orderRequestConfig = {
    ...isProtected,
    headers: {
      "x-auth-role": staff?.role === "staff" ? "staff" : "seller",
    },
  } as any;

  // ── Real-time order feed ────────────────────────────────────────────────────
  // Uses the app-wide socket from WorkerWSProvider rather than opening one here:
  // a page-local connection carries no auth ticket, and the worker joins
  // ticketless sockets to no room, so it never received a single order event.
  React.useEffect(() => {
    const unsubStatus = subscribe("ORDER_STATUS_UPDATE", () => {
      // A sibling staff screen (or this one) mutated the order — resync.
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
    });

    const unsubNew = subscribe("NEW_ORDER", (payload: any) => {
      const raw = payload?.order || payload;
      if (!raw) return;
      if (linkedStoreId && raw.storeId && raw.storeId !== linkedStoreId) return;

      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });

      // Map to MockOrder format for the modal
      const newOrder: MockOrder = {
        id: raw.id,
        status: "New",
        createdAt: raw.createdAt || new Date().toISOString(),
        total: raw.totalAmount ?? 0,
        user: {
          id: raw.userId || "",
          name: raw.userName || raw.deliveryName || "Customer",
          phone: raw.deliveryPhone || "-",
          email: "-",
          avatar: null,
        },
        shippingAddress: {
          name: raw.deliveryName || raw.userName || "Customer",
          street: raw.deliveryAddress || "N/A",
          city: raw.deliveryCity || "-",
          state: "-",
          zip: raw.deliveryPincode || "-",
        },
        items: (raw.items || []).map((item: any) => ({
          productId: item.productId,
          product: {
            id: item.product?.id || item.productId,
            title: item.product?.title || "Product",
            images: item.product?.images || [],
          },
          quantity: item.quantity,
          price: item.price ?? item.priceAtOrder ?? 0,
          unit: item.unit || item.product?.unit || "pc",
          selectedOptions: item.selectedOptions || {},
        })),
        billDetails: raw.billDetails,
        deliverySlot: raw.deliverySlot,
        paymentMethod: raw.paymentMethod,
        rejectionReason: null,
        refundStatus: null,
      };

      // Play notification sound
      if (!isMutedRef.current && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.error("🔊 Sound playback failed:", err);
        });
      }

      setDetailTarget(newOrder);

      toast.info("New Order Received!", {
        description: `Order ${raw.id ? formatOrderId(raw.id) : ""} is waiting for review.`,
        icon: <Bell className="h-4 w-4 text-blue-500" />,
        duration: 8000,
        position: "top-center",
      });
    });

    return () => {
      unsubStatus();
      unsubNew();
    };
  }, [subscribe, linkedStoreId, queryClient]);

  const isStaff = staff?.role === "staff";
  const sellerNotLinked = !authLoading && staff && isStaff && (!staff.isActive || !staff.sellerId);
  const canFetch = !!staff && (staff.role === "seller" || staff.isActive);

  const { data: realOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["staff-orders", linkedStoreId, staff?.role],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/get-seller-orders", orderRequestConfig);
      // Use res.data.orders directly if they are already mapped/hydrated by the API,
      // or map over o.items if the API returns them that way.
      return (res.data.orders || [])
        .filter((o: any) => !linkedStoreId || !o.storeId || o.storeId === linkedStoreId)
        .map((o: any): MockOrder => ({
        id: o.id,
        status: o.status === "ACCEPTED" || o.status === "PREPARING" ? "Processing"
               : o.status === "REJECTED"  ? "Rejected"
               : o.status === "READY_FOR_PICKUP" || o.status === "ASSIGNED_TO_RIDER" || o.status === "SHIPPED" ? "Ready"
               : o.status === "DELIVERED" ? "Completed"
               : "New",
        rawStatus: o.status,
        riderId: o.riderId ?? null,
        rider: o.rider ?? null,
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
        items: (o.items || o.orderItems || []).map((i: any) => ({
          productId: i.productId,
          product: { 
            title: i.product?.title || "Product",
            images: i.product?.images || []
          },
          quantity: i.quantity,
          price: i.price ?? i.priceAtOrder ?? 0,
          unit: i.unit || i.product?.unit || "pc",
          selectedOptions: i.selectedOptions || {},
        })),
        rejectionReason: o.rejectionReason,
        refundStatus: o.paymentStatus === "REFUNDED" ? "Refunded" : null,
      }));
    },
    // Deliberately not gated on linkedStoreId: the server already scopes this
    // endpoint to the caller's own store, so gating on a client-side copy of
    // that id only creates a second way for the board to silently render empty.
    enabled: canFetch,
  });

  const [acceptTarget, setAcceptTarget] = useState<MockOrder | null>(null);
  const [rejectTarget, setRejectTarget] = useState<MockOrder | null>(null);
  const [detailTarget, setDetailTarget] = useState<MockOrder | null>(null);
  const [assignRiderTarget, setAssignRiderTarget] = useState<MockOrder | null>(null);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "All">("All");
  const [optimisticOrders, setOptimisticOrders] = useState<Record<string, Partial<MockOrder>>>({});
  const [pendingActions, setPendingActions] = useState<Record<string, string | null>>({});

  const orders = realOrders.map((order: MockOrder) => ({
    ...order,
    ...(optimisticOrders[order.id] || {}),
  }));

  const setPendingAction = (orderId: string, action: string | null) => {
    setPendingActions((prev) => {
      if (!action) {
        const next = { ...prev };
        delete next[orderId];
        return next;
      }
      return { ...prev, [orderId]: action };
    });
  };

  const applyOptimisticOrder = (orderId: string, patch: Partial<MockOrder>) => {
    setOptimisticOrders((prev) => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || {}), ...patch },
    }));
  };

  const clearOrderUiState = (orderId: string) => {
    setPendingAction(orderId, null);
    setOptimisticOrders((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  };

  const syncOrderInCache = (orderId: string, patch: Partial<MockOrder>) => {
    queryClient.setQueriesData(
      { queryKey: ["staff-orders"] },
      (existing: MockOrder[] | undefined) =>
        Array.isArray(existing)
          ? existing.map((order) =>
              order.id === orderId ? { ...order, ...patch } : order,
            )
          : existing,
    );
  };

  const acceptMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return axiosInstance.put(
        `/order/api/accept-reject/${orderId}`,
        { action: "accept" },
        orderRequestConfig,
      );
    },
    onSuccess: (_, orderId) => {
      syncOrderInCache(orderId, {
        status: "Processing",
        rejectionReason: null,
        refundStatus: null,
      });
      clearOrderUiState(orderId);
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
      setAcceptTarget(null);
    },
    onError: (_error, orderId) => {
      clearOrderUiState(orderId);
      toast.error("Failed to accept order");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string, reason: string }) => {
      return axiosInstance.put(
        `/order/api/accept-reject/${orderId}`,
        { action: "reject", rejectionReason: reason },
        orderRequestConfig,
      );
    },
    onSuccess: (_, variables) => {
      syncOrderInCache(variables.orderId, {
        status: "Rejected",
        rejectionReason: variables.reason,
        refundStatus: "Refunded",
      });
      clearOrderUiState(variables.orderId);
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
      setRejectTarget(null);
    },
    onError: (_error, variables) => {
      clearOrderUiState(variables.orderId);
      toast.error("Failed to reject order");
    }
  });

  // Marks the order packed and ready for pickup — this is what actually makes
  // it eligible for rider assignment (assign-rider requires
  // status === "READY_FOR_PICKUP"). Previously this sent "SHIPPED" directly,
  // which skipped rider assignment entirely.
  const markReadyMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return axiosInstance.put(
        `/order/api/update-status/${orderId}`,
        { status: "READY_FOR_PICKUP" },
        orderRequestConfig,
      );
    },
    onSuccess: (_, orderId) => {
      syncOrderInCache(orderId, { status: "Ready", rawStatus: "READY_FOR_PICKUP" });
      clearOrderUiState(orderId);
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
    },
    onError: (_error, orderId) => {
      clearOrderUiState(orderId);
      toast.error("Failed to mark order as ready");
    }
  });

  // Rider has physically picked up the order — moves it to SHIPPED ("out for
  // delivery"). Only reachable once a rider is assigned.
  const markShippedMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return axiosInstance.put(
        `/order/api/update-status/${orderId}`,
        { status: "SHIPPED" },
        orderRequestConfig,
      );
    },
    onSuccess: (_, orderId) => {
      syncOrderInCache(orderId, { status: "Ready", rawStatus: "SHIPPED" });
      clearOrderUiState(orderId);
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
    },
    onError: (_error, orderId) => {
      clearOrderUiState(orderId);
      toast.error("Failed to mark order as shipped");
    }
  });

  const markCompletedMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return axiosInstance.put(
        `/order/api/update-status/${orderId}`,
        { status: "DELIVERED" },
        orderRequestConfig,
      );
    },
    onSuccess: (_, orderId) => {
      syncOrderInCache(orderId, { status: "Completed", rawStatus: "DELIVERED" });
      clearOrderUiState(orderId);
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
    },
    onError: (_error, orderId) => {
      clearOrderUiState(orderId);
      toast.error("Failed to mark order as completed");
    }
  });

  const assignRiderMutation = useMutation({
    mutationFn: async ({ orderId, riderId }: { orderId: string; riderId: string }) => {
      return axiosInstance.put(
        `/order/api/assign-rider/${orderId}`,
        { riderId },
        orderRequestConfig,
      );
    },
    onSuccess: (res, { orderId }) => {
      syncOrderInCache(orderId, {
        status: "Ready",
        rawStatus: "ASSIGNED_TO_RIDER",
        riderId: res.data?.rider?.id ?? null,
        rider: res.data?.rider ?? null,
      });
      clearOrderUiState(orderId);
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
      toast.success("Rider assigned");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to assign rider");
    }
  });

  const handleAcceptConfirm = () => {
    if (!acceptTarget) return;
    const orderId = acceptTarget.id;
    setPendingAction(orderId, "accepting");
    applyOptimisticOrder(orderId, { status: "Processing", rejectionReason: null, refundStatus: null });
    setAcceptTarget(null);
    acceptMutation.mutate(orderId);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) return;
    const orderId = rejectTarget.id;
    setPendingAction(orderId, "rejecting");
    applyOptimisticOrder(orderId, { status: "Rejected", rejectionReason: reason, refundStatus: "Refunded" });
    setRejectTarget(null);
    rejectMutation.mutate({ orderId, reason });
  };

  const handleMarkReady = (orderId: string) => {
    setPendingAction(orderId, "marking-ready");
    applyOptimisticOrder(orderId, { status: "Ready", rawStatus: "READY_FOR_PICKUP" });
    markReadyMutation.mutate(orderId);
  };

  const handleMarkShipped = (orderId: string) => {
    setPendingAction(orderId, "marking-shipped");
    applyOptimisticOrder(orderId, { rawStatus: "SHIPPED" });
    markShippedMutation.mutate(orderId);
  };

  const handleMarkCompleted = (orderId: string) => {
    setPendingAction(orderId, "marking-completed");
    applyOptimisticOrder(orderId, { status: "Completed" });
    markCompletedMutation.mutate(orderId);
  };

  const handleAssignRider = (orderId: string, riderId: string) => {
    setPendingAction(orderId, "assigning-rider");
    assignRiderMutation.mutate({ orderId, riderId });
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center bg-[#080b12]">
        <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mb-4 border border-yellow-400/20">
          <ShieldAlert size={32} className="text-yellow-400" />
        </div>
        <h2 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Access Not Granted</h2>
        <p className="text-slate-500 max-w-sm text-sm font-medium italic leading-relaxed">
          Your staff account hasn't been activated by the merchant. Synchronization with the fulfillment stream requires merchant approval.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#080b12] p-8">
      {/* Premium Header section with role identification */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10 mb-10 overflow-hidden relative">
        {/* Decorative Background Glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-xl border border-blue-500/20 backdrop-blur-md">
              Operations Staff
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
              {staff?.seller?.store?.name || staff?.store?.name || "Global Network Node"}
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.85] mb-2">
            Order <span className="text-blue-500/80">Workstation</span>
          </h1>
          <p className="text-slate-500 font-medium italic text-base opacity-70">
            Fulfillment stream orchestration & real-time logistics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          {/* Connection Status */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-[2rem] text-[10px] text-slate-400 backdrop-blur-2xl shadow-2xl">
            <div className={`w-2.5 h-2.5 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"}`} />
            <span className="font-black uppercase tracking-[0.25em] leading-none text-white/80">
              {wsConnected ? "System Live" : "Offline Node"}
            </span>
          </div>

          {/* Audio Control */}
          <div 
            className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] text-sm transition-all duration-700 backdrop-blur-3xl border shadow-2xl ${
              !isMuted 
                ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_8px_32px_rgba(16,185,129,0.2)] text-white" 
                : "bg-white/5 border-white/10 text-slate-500 grayscale opacity-60"
            }`}
          >
            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                isMutedRef.current = nextMuted;
                localStorage.setItem("staff-order-mute", String(nextMuted));
                
                if (!nextMuted && audioRef.current) {
                  const audio = audioRef.current;
                  const originalVolume = audio.volume;
                  audio.volume = 0;
                  audio.play()
                    .then(() => {
                      audio.pause();
                      audio.volume = originalVolume;
                      toast.success("SYSTEM ALERT CHANNELS SYNCED", {
                        style: { background: '#064e3b', color: '#10b981', border: '1px solid #065f46', fontSize: '10px', fontWeight: '900', letterSpacing: '0.1em' }
                      });
                    })
                    .catch(() => {
                      console.warn("Audio warm-up failed");
                    });
                }
              }}
              className="group flex items-center gap-2 transition-all active:scale-90"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="animate-bounce-subtle" />}
              <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">
                {isMuted ? "Audio Muted" : "Audio Active"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-[2rem] text-sm text-slate-400 backdrop-blur-2xl shadow-2xl">
            <Clock size={16} className="text-slate-600" />
            <span className="font-black text-white tracking-widest font-mono text-base italic">
              {mounted ? new Date().toLocaleTimeString('en-US', { hour12: false }) : "00:00:00"}
            </span>
          </div>
        </div>
      </header>

      {/* Stats */}
      <StatsBar orders={orders} />

      {/* Filter tabs */}
      {ordersLoading && (
        <div className="flex items-center gap-2 mb-4 text-emerald-500/50">
          <Loader2 className="animate-spin" size={16} /> 
          <span className="text-[10px] font-black uppercase tracking-widest italic">Syncing with live data stream...</span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1 scrollbar-hide">
        {(["All", ...COLUMN_ORDER] as const).map((s) => {
          const isActive = activeFilter === s;
          const cfg = s === "All" ? null : STATUS_CONFIG[s as OrderStatus];
          return (
            <button
              key={s}
              type="button"
              onClick={() => setActiveFilter(s as OrderStatus | "All")}
              className={`shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                isActive
                  ? cfg
                    ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-[0_0_15px_rgba(0,0,0,0.5)]`
                    : "bg-white/10 text-white border-white/20"
                  : "bg-transparent text-slate-600 border-white/5 hover:border-white/10 hover:text-slate-400"
              }`}
            >
              {s === "All" ? "All Streams" : STATUS_CONFIG[s as OrderStatus].label}
              {s !== "All" && (
                <span className="ml-2 px-1.5 opacity-50 font-bold border-l border-current">
                  {orders.filter((o: MockOrder) => o.status === s).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Board */}
      {activeFilter === "All" ? (
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide" style={{ minHeight: "calc(100vh - 350px)" }}>
          {COLUMN_ORDER.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              orders={displayOrders.filter((o: MockOrder) => o.status === status)}
              onAccept={setAcceptTarget}
              onReject={setRejectTarget}
              onMarkReady={handleMarkReady}
              onMarkShipped={handleMarkShipped}
              onMarkCompleted={handleMarkCompleted}
              onAssignRider={setAssignRiderTarget}
              onViewDetails={setDetailTarget}
              pendingActions={pendingActions}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-32 text-slate-800 border-2 border-dashed border-white/5 rounded-[3rem]">
              <Fish size={48} className="mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-[0.3em] font-mono">Stream Empty</p>
            </div>
          ) : (
            filteredOrders.map((o: MockOrder) => (
              <OrderCard
                key={o.id}
                order={o}
                onAccept={setAcceptTarget}
                onReject={setRejectTarget}
                onMarkReady={handleMarkReady}
                onMarkShipped={handleMarkShipped}
                onMarkCompleted={handleMarkCompleted}
                onAssignRider={setAssignRiderTarget}
                onViewDetails={setDetailTarget}
                pendingAction={pendingActions[o.id] ?? null}
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
          isSubmitting={acceptMutation.isPending}
        />
      )}
      {rejectTarget && (
        <RejectModal
          order={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          isSubmitting={rejectMutation.isPending}
        />
      )}
      {detailTarget && (
        <OrderDetailModal
          order={detailTarget}
          staff={staff}
          onClose={() => setDetailTarget(null)}
        />
      )}
      {assignRiderTarget && (
        <AssignRiderModal
          order={assignRiderTarget}
          orderRequestConfig={orderRequestConfig}
          isAssigning={assignRiderMutation.isPending}
          onAssign={(riderId) => {
            handleAssignRider(assignRiderTarget.id, riderId);
            setAssignRiderTarget(null);
          }}
          onClose={() => setAssignRiderTarget(null)}
        />
      )}
    </div>
  );
};

export default StaffOrdersPage;
