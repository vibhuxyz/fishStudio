"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  IndianRupee,
  TrendingDown,
  ShoppingCart,
  Eye,
  Store,
  User,
  MapPin,
  CreditCard,
  Banknote,
  X,
  Package,
  Phone,
  Hash,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";
import {
  useAdminSellerOrders,
  useAdminStats,
  useAdminSellerDetail,
  type SellerOrder,
  type StatsPeriod,
} from "@/hooks/useAdminQueries";

const PERIODS: { label: string; value: StatsPeriod }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const statusBadge = (order: SellerOrder) => {
  const pStatus = order.paymentStatus;
  const oStatus = order.status;
  const isCOD = order.paymentMethod === "COD";

  if (isCOD && oStatus === "DELIVERED") {
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-900/40 text-emerald-400 border border-emerald-900/30">COLLECTED</span>;
  }
  if (pStatus === "COMPLETED") {
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-900/40 text-emerald-400 border border-emerald-900/30">PAID</span>;
  }
  if (pStatus === "REFUNDED") {
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-900/40 text-rose-400 border border-rose-900/30">REFUNDED</span>;
  }
  if (oStatus === "REJECTED" || oStatus === "CANCELLED") {
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-900/40 text-amber-400 border border-amber-900/30">REFUND PROCESSING</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-800 text-gray-400">PENDING</span>;
};

const orderStatusIcon = (status: string) => {
  switch (status) {
    case "DELIVERED": return <CheckCircle2 size={15} className="text-emerald-400" />;
    case "REJECTED":
    case "CANCELLED": return <XCircle size={15} className="text-rose-400" />;
    case "SHIPPED": return <Truck size={15} className="text-teal-400" />;
    case "ACCEPTED": return <Clock size={15} className="text-blue-400" />;
    default: return <Clock size={15} className="text-amber-400" />;
  }
};

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderDetailModal({ order, onClose }: { order: SellerOrder; onClose: () => void }) {
  const isCOD = order.paymentMethod === "COD";
  const items: any[] = (order as any).orderItems || (order as any).items || [];
  const billDetails: any = (order as any).billDetails;
  const date = new Date(order.createdAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f1117] border border-gray-700/60 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-[#0f1117] z-10">
          <div>
            <p className="text-white font-bold text-base">
              Order #{order.id.slice(-6).toUpperCase()}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition p-1 rounded-lg hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-800/60 rounded-xl px-3 py-2">
              {orderStatusIcon(order.status || "")}
              <span className="text-white text-xs font-semibold">{order.status || "PENDING"}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/60 rounded-xl px-3 py-2">
              {isCOD ? <Banknote size={15} className="text-amber-400" /> : <CreditCard size={15} className="text-blue-400" />}
              <span className="text-white text-xs font-semibold">
                {isCOD ? "Cash on Delivery" : order.paymentMethod || "Online"}
              </span>
            </div>
            <div>{statusBadge(order)}</div>
          </div>

          {/* Customer & Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-800/40 rounded-xl p-4">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-2 font-semibold">Customer</p>
              <div className="flex items-center gap-2 mb-1">
                <User size={13} className="text-gray-400" />
                <p className="text-white text-sm font-medium">
                  {(order.user as any)?.name || (order as any).deliveryName || "Guest"}
                </p>
              </div>
              {((order.user as any)?.phone_number || (order as any).deliveryPhone) && (
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-400" />
                  <p className="text-gray-300 text-xs">
                    {(order.user as any)?.phone_number || (order as any).deliveryPhone}
                  </p>
                </div>
              )}
            </div>
            <div className="bg-gray-800/40 rounded-xl p-4">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-2 font-semibold">Delivery Address</p>
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-gray-300 text-xs leading-relaxed">
                  {(order as any).deliveryAddress || "N/A"}
                  {(order as any).deliveryCity ? `, ${(order as any).deliveryCity}` : ""}
                  {(order as any).deliveryPincode ? ` — ${(order as any).deliveryPincode}` : ""}
                </p>
              </div>
              {(order as any).deliverySlot && (
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={13} className="text-gray-400" />
                  <p className="text-gray-400 text-xs capitalize">{(order as any).deliverySlot} delivery</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
              <Package size={12} />
              Order Items ({items.length})
            </p>
            <div className="space-y-2">
              {items.map((item: any, idx: number) => (
                <div key={`${item.productId}-${idx}`} className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-700/60 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={16} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">
                      {item.product?.title || "Product"}
                    </p>
                    <p className="text-gray-400 text-[10px]">
                      {item.quantity} {item.unit || "pc"}
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 &&
                        ` · ${Object.values(item.selectedOptions).join(", ")}`}
                    </p>
                  </div>
                  <p className="text-emerald-400 font-semibold text-sm shrink-0">
                    {formatINR((item.price ?? item.priceAtOrder ?? 0) * (item.quantity ?? 1))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bill breakdown */}
          <div className="bg-gray-800/40 rounded-xl p-4">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-3 font-semibold flex items-center gap-1.5">
              <IndianRupee size={12} />
              Bill Breakdown
            </p>
            <div className="space-y-1.5 text-xs">
              {billDetails ? (
                <>
                  <div className="flex justify-between text-gray-300">
                    <span>Item Total</span>
                    <span>{formatINR(billDetails.itemTotal ?? 0)}</span>
                  </div>
                  {billDetails.deliveryFee > 0 && (
                    <div className="flex justify-between text-gray-300">
                      <span>Delivery Fee</span>
                      <span>{formatINR(billDetails.deliveryFee)}</span>
                    </div>
                  )}
                  {billDetails.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span>
                      <span>- {formatINR(billDetails.discount)}</span>
                    </div>
                  )}
                  {billDetails.couponDiscount > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Coupon Discount</span>
                      <span>- {formatINR(billDetails.couponDiscount)}</span>
                    </div>
                  )}
                </>
              ) : (
                (order as any).discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Discount Applied</span>
                    <span>- {formatINR((order as any).discountAmount)}</span>
                  </div>
                )
              )}
              <div className="flex justify-between text-white font-bold pt-2 border-t border-gray-700 mt-2">
                <span>Total Paid</span>
                <span className="text-emerald-400 text-sm">
                  {formatINR(order.totalAmount || (order as any).total || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment ref */}
          {!isCOD && (order as any).paymentRef && (
            <div className="flex items-center gap-2 bg-gray-800/40 rounded-xl px-4 py-3">
              <Hash size={13} className="text-sky-400" />
              <span className="text-gray-400 text-xs">Payment Ref:</span>
              <span className="text-sky-400 font-mono text-xs">{(order as any).paymentRef}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const SellerPaymentDetail = () => {
  const params = useParams<{ sellerId: string }>();
  const sellerId = typeof params?.sellerId === "string" ? params.sellerId : "";
  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);

  const { data: sellerData } = useAdminSellerDetail(sellerId);
  const { data: statsData, isLoading: statsLoading } = useAdminStats(period, sellerId);
  const { data: ordersData, isLoading: ordersLoading } = useAdminSellerOrders(sellerId);

  const stats = statsData?.stats;
  const orders: SellerOrder[] = ordersData?.orders || [];
  const store = ordersData?.store || sellerData?.store;

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.id?.toLowerCase().includes(q) ||
      (o.user as any)?.name?.toLowerCase().includes(q) ||
      o.paymentMethod?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  });

  const totalEarned = orders
    .filter((o) => {
      if (o.paymentMethod === "COD") return o.status === "DELIVERED";
      return o.paymentStatus === "COMPLETED";
    })
    .reduce((sum, o) => sum + (o.totalAmount || (o as any).total || 0), 0);

  const totalRefunded = orders
    .filter((o) => o.paymentStatus === "REFUNDED")
    .reduce((sum, o) => sum + (o.totalAmount || (o as any).total || 0), 0);

  const totalOrders = orders.length;
  const pendingCOD = orders.filter(
    (o) => o.paymentMethod === "COD" && o.status !== "DELIVERED" && o.status !== "REJECTED" && o.status !== "CANCELLED",
  ).length;

  return (
    <div className="w-full min-h-screen p-6 bg-[#0a0c14]">
      {/* Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {/* Back */}
      <Link
        href="/dashboard/payments"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mb-6"
      >
        <ArrowLeft size={16} />
        Back to all sellers
      </Link>

      {/* Seller header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
          <Store size={22} className="text-teal-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            {(store as any)?.name || sellerData?.name || "Seller"}
          </h1>
          <p className="text-gray-400 text-sm">
            {sellerData?.name} · {sellerData?.email}
          </p>
          {(store as any)?.city && (
            <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={11} />
              {(store as any).city}
            </p>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee size={16} className="text-emerald-400" />
            <span className="text-gray-400 text-xs">Total Earned</span>
          </div>
          <p className="text-emerald-400 font-bold text-xl">{formatINR(totalEarned)}</p>
          <p className="text-gray-600 text-[10px] mt-0.5">From paid & delivered orders</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-rose-400" />
            <span className="text-gray-400 text-xs">Total Refunded</span>
          </div>
          <p className="text-rose-400 font-bold text-xl">{formatINR(totalRefunded)}</p>
          <p className="text-gray-600 text-[10px] mt-0.5">Rejected / cancelled orders</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee size={16} className="text-teal-400" />
            <span className="text-gray-400 text-xs">Net Income</span>
          </div>
          <p className="text-teal-400 font-bold text-xl">{formatINR(totalEarned - totalRefunded)}</p>
          <p className="text-gray-600 text-[10px] mt-0.5">Earned minus refunds</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={16} className="text-blue-400" />
            <span className="text-gray-400 text-xs">Total Orders</span>
          </div>
          <p className="text-blue-400 font-bold text-xl">{totalOrders}</p>
          {pendingCOD > 0 && (
            <p className="text-amber-500 text-[10px] mt-0.5">{pendingCOD} COD pending delivery</p>
          )}
        </div>
      </div>

      {/* Period stats */}
      {stats && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-semibold text-sm">Period Summary</p>
            <div className="flex gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    period === p.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {statsLoading ? (
            <p className="text-gray-500 text-xs">Loading stats…</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Revenue", value: formatINR(stats.totalRevenue ?? 0), color: "text-emerald-400" },
                { label: "Refunds", value: formatINR(stats.totalRefundedAmount ?? 0), color: "text-rose-400" },
                { label: "Coupon Discount", value: formatINR(stats.totalCouponSpend ?? 0), color: "text-amber-400" },
                { label: "Orders", value: String(stats.totalOrders ?? 0), color: "text-blue-400" },
              ].map((item) => (
                <div key={item.label} className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider">{item.label}</p>
                  <p className={`font-bold text-lg ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transactions table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">All Transactions</h2>
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white outline-none placeholder-gray-500 text-xs w-44"
            />
          </div>
        </div>

        {ordersLoading ? (
          <p className="text-center text-white py-6">Loading transactions…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 text-left pl-2">Order ID</th>
                  <th className="pb-3 text-left">Customer</th>
                  <th className="pb-3 text-left">Items</th>
                  <th className="pb-3 text-left">Payment</th>
                  <th className="pb-3 text-left">Amount</th>
                  <th className="pb-3 text-left">Order Status</th>
                  <th className="pb-3 text-left">Payment Status</th>
                  <th className="pb-3 text-left">Date</th>
                  <th className="pb-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const date = new Date(order.createdAt);
                  const isCOD = order.paymentMethod === "COD";
                  const items: any[] = (order as any).orderItems || (order as any).items || [];
                  return (
                    <tr key={order.id} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition">
                      <td className="py-3 pl-2">
                        <span className="text-white font-mono text-xs">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-gray-500 shrink-0" />
                          <div>
                            <p className="text-white text-xs">{(order.user as any)?.name || "Guest"}</p>
                            <p className="text-gray-500 text-[10px]">{(order as any).deliveryCity || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-gray-300 text-[10px] max-w-[140px] truncate italic">
                          {items.map((i: any) => i.product?.title || "Item").join(", ") || "—"}
                        </p>
                        <p className="text-gray-500 text-[10px]">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {isCOD ? (
                            <Banknote size={13} className="text-amber-400" />
                          ) : (
                            <CreditCard size={13} className="text-blue-400" />
                          )}
                          <div>
                            <p className="text-gray-300 text-[10px] font-semibold uppercase">
                              {isCOD ? "Cash on Delivery" : order.paymentMethod || "Online"}
                            </p>
                            {!isCOD && (order as any).paymentRef && (
                              <p className="text-sky-400/70 text-[9px] font-mono">
                                #{(order as any).paymentRef}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-emerald-400 font-bold text-sm">
                          {formatINR(order.totalAmount || (order as any).total || 0)}
                        </span>
                        {(order as any).discountAmount > 0 && (
                          <p className="text-amber-500/70 text-[9px]">
                            -{formatINR((order as any).discountAmount)} discount
                          </p>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {orderStatusIcon(order.status || "")}
                          <span className={`text-[9px] font-bold uppercase ${
                            order.status === "DELIVERED" ? "text-emerald-400"
                            : order.status === "REJECTED" || order.status === "CANCELLED" ? "text-rose-400"
                            : order.status === "ACCEPTED" ? "text-blue-400"
                            : "text-amber-400"
                          }`}>
                            {order.status || "PENDING"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">{statusBadge(order)}</td>
                      <td className="py-3">
                        <div className="text-xs">
                          <p className="text-white font-medium">{date.toLocaleDateString()}</p>
                          <p className="text-gray-500 text-[10px]">
                            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-400 hover:text-blue-300 transition p-1.5 rounded-lg hover:bg-blue-400/10"
                          title="View order details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerPaymentDetail;
