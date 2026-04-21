"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Package,
} from "lucide-react";
import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import {
  useAdminOrderList,
  useAdminOrderPincodes,
  type AdminOrderListParams,
  type AdminOrder,
} from "@/hooks/useAdminQueries";

/* ── Status badge helper ────────────────────────────────────────────────── */
const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   className: "bg-amber-500/20 text-amber-400 border border-amber-500/30",    icon: <Clock size={11} /> },
  ACCEPTED:  { label: "Accepted",  className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",       icon: <CheckCircle2 size={11} /> },
  SHIPPED:   { label: "Shipped",   className: "bg-purple-500/20 text-purple-400 border border-purple-500/30", icon: <Truck size={11} /> },
  DELIVERED: { label: "Delivered", className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", icon: <Package size={11} /> },
  REJECTED:  { label: "Rejected",  className: "bg-rose-500/20 text-rose-400 border border-rose-500/30",       icon: <XCircle size={11} /> },
  CANCELLED: { label: "Cancelled", className: "bg-gray-500/20 text-gray-400 border border-gray-500/30",       icon: <X size={11} /> },
};

const payStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "Pending",   className: "text-amber-400" },
  COMPLETED: { label: "Paid",      className: "text-emerald-400" },
  FAILED:    { label: "Failed",    className: "text-rose-400" },
  REFUNDED:  { label: "Refunded",  className: "text-purple-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-gray-700 text-gray-300 border border-gray-600", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.className}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function PayBadge({ status }: { status: string }) {
  const cfg = payStatusConfig[status] ?? { label: status, className: "text-gray-400" };
  return <span className={`text-xs font-semibold ${cfg.className}`}>{cfg.label}</span>;
}

/* ── Filter bar ─────────────────────────────────────────────────────────── */
const ORDER_STATUSES = ["PENDING","ACCEPTED","SHIPPED","DELIVERED","REJECTED","CANCELLED"];
const PAY_STATUSES   = ["PENDING","COMPLETED","FAILED","REFUNDED"];
const PAY_METHODS    = ["COD","RAZORPAY"];

interface FiltersState {
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  pincode: string;
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
  sortBy: "createdAt" | "totalAmount";
  sortDir: "asc" | "desc";
}

const DEFAULT_FILTERS: FiltersState = {
  status: "", paymentStatus: "", paymentMethod: "",
  pincode: "", from: "", to: "", minAmount: "", maxAmount: "",
  sortBy: "createdAt", sortDir: "desc",
};

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function OrderTrackingPage() {
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]     = useState<FiltersState>(DEFAULT_FILTERS);
  const [applied, setApplied]     = useState<FiltersState>(DEFAULT_FILTERS);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Strip leading # so searching "#3W5KYDQ9" works the same as "3W5KYDQ9"
  const cleanSearch = search.startsWith("#") ? search.slice(1) : search;

  const params: AdminOrderListParams = {
    page,
    limit: 20,
    search: cleanSearch || undefined,
    status:        applied.status        || undefined,
    paymentStatus: applied.paymentStatus || undefined,
    paymentMethod: applied.paymentMethod || undefined,
    pincode:       applied.pincode       || undefined,
    from:          applied.from          || undefined,
    to:            applied.to            || undefined,
    minAmount:     applied.minAmount     ? Number(applied.minAmount) : undefined,
    maxAmount:     applied.maxAmount     ? Number(applied.maxAmount) : undefined,
    sortBy:        applied.sortBy,
    sortDir:       applied.sortDir,
  };

  const { data: pincodesData } = useAdminOrderPincodes();
  const availablePincodes: string[] = pincodesData ?? [];

  const { data, isLoading, isError } = useAdminOrderList(params);
  const orders     = data?.orders ?? [];
  const pagination = data?.pagination;

  const applyFilters = () => { setApplied({ ...filters }); setPage(1); setShowFilters(false); };
  const clearFilters = () => { setFilters(DEFAULT_FILTERS); setApplied(DEFAULT_FILTERS); setPage(1); };
  const hasActiveFilters = Object.values(applied).some(
    (v, i) => v !== Object.values(DEFAULT_FILTERS)[i],
  );

  return (
    <DashboardPageShell
      title="Order Tracking"
      breadcrumbTitle="Order Tracking"
      description="View, filter and drill into every order across all sellers on the platform."
      action={
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/10 transition"
            >
              <X size={13} /> Clear filters
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition ${
              showFilters
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-gray-700 text-gray-300 hover:border-gray-500"
            }`}
          >
            <Filter size={14} /> Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-400 ml-0.5" />}
          </button>
        </div>
      }
      search={{ value: search, onChange: (v) => { setSearch(v); setPage(1); }, placeholder: "Search by order ID, phone, pincode, coupon…" }}
    >
      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-900 rounded-xl border border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Order Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none"
            >
              <option value="">All</option>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))}
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none"
            >
              <option value="">All</option>
              {PAY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters((f) => ({ ...f, paymentMethod: e.target.value }))}
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none"
            >
              <option value="">All</option>
              {PAY_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Pincode</label>
            <select
              value={filters.pincode}
              onChange={(e) => setFilters((f) => ({ ...f, pincode: e.target.value }))}
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none"
            >
              <option value="">All</option>
              {availablePincodes.map((pin) => (
                <option key={pin} value={pin}>{pin}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Sort By</label>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as any }))}
                className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none"
              >
                <option value="createdAt">Date</option>
                <option value="totalAmount">Amount</option>
              </select>
              <select
                value={filters.sortDir}
                onChange={(e) => setFilters((f) => ({ ...f, sortDir: e.target.value as any }))}
                className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>

          {/* Contextual inputs based on Sort By */}
          {filters.sortBy === "createdAt" ? (
            <>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">From</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                  className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">To</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                  className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Min Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={filters.minAmount}
                  onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value }))}
                  className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Max Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1000"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters((f) => ({ ...f, maxAmount: e.target.value }))}
                  className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none placeholder:text-gray-600"
                />
              </div>
            </>
          )}

          <div className="col-span-2 flex items-end justify-end">
            <button
              onClick={applyFilters}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">Loading orders…</div>
        ) : isError ? (
          <div className="flex items-center justify-center gap-2 py-16 text-rose-400">
            <AlertCircle size={18} /> Failed to load orders
          </div>
        ) : (
          <table className="w-full text-sm text-white">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Seller</th>
                <th className="px-4 py-3 text-left">Store</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Slot</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-800/50 transition group">
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">
                    #{order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white truncate max-w-[120px]">
                      {order.customer?.name ?? "—"}
                    </div>
                    <div className="text-xs text-gray-500">{order.delivery?.phone ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white truncate max-w-[120px]">{order.seller?.name ?? "—"}</div>
                    <div className="text-xs text-gray-500">{order.seller?.email ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white truncate max-w-[100px]">{order.store?.name ?? "—"}</div>
                    <div className="text-xs text-gray-500">{order.store?.city ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold">₹{order.totalAmount.toFixed(0)}</div>
                    {order.discountAmount > 0 && (
                      <div className="text-xs text-emerald-400">-₹{order.discountAmount.toFixed(0)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <PayBadge status={order.paymentStatus} />
                    <div className="text-xs text-gray-500 mt-0.5">{order.paymentMethod ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 capitalize">{order.deliverySlot ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-400 hover:text-blue-300 transition"
                      title="View detail"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="py-16 text-center text-gray-500">No orders match your filters.</div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 bg-gray-800 rounded-lg text-white text-xs">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Order detail drawer */}
      {selectedOrder && (
        <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </DashboardPageShell>
  );
}

/* ── Inline detail drawer ───────────────────────────────────────────────── */
function OrderDetailDrawer({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl h-full bg-gray-950 border-l border-gray-800 overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Order #{order.id.slice(-8).toUpperCase()}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={order.status} />
            <PayBadge status={order.paymentStatus} />
            <span className="text-xs text-gray-500">{order.paymentMethod}</span>
            {order.deliverySlot && (
              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full capitalize">
                {order.deliverySlot}
              </span>
            )}
          </div>

          {/* Customer */}
          <Section title="Customer">
            <Row label="Name"    value={order.customer?.name} />
            <Row label="Email"   value={order.customer?.email} />
            <Row label="Phone"   value={order.customer?.phone} />
            <Row label="Member since" value={order.customer?.memberSince ? new Date(order.customer.memberSince).toLocaleDateString("en-IN") : undefined} />
          </Section>

          {/* Delivery */}
          <Section title="Delivery Address">
            <Row label="Name"    value={order.delivery?.name} />
            <Row label="Phone"   value={order.delivery?.phone} />
            <Row label="Address" value={order.delivery?.address} />
            <Row label="City"    value={order.delivery?.city} />
            <Row label="Pincode" value={order.delivery?.pincode} />
          </Section>

          {/* Seller & Store */}
          <Section title="Seller & Store">
            <Row label="Seller"  value={order.seller?.name} />
            <Row label="Email"   value={order.seller?.email} />
            <Row label="Phone"   value={order.seller?.phone} />
            <Row label="Approved" value={order.seller?.isApproved ? "Yes" : "No"} />
            <Row label="Store"   value={order.store?.name} />
            <Row label="City"    value={order.store?.city} />
            <Row label="Pincode" value={order.store?.pincode} />
          </Section>

          {/* Items */}
          <Section title={`Items (${order.items?.length ?? 0})`}>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-start gap-3 bg-gray-900 rounded-lg p-3">
                  {item.product?.image && (
                    <img src={item.product.image} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.product?.title ?? item.productId}</p>
                    <p className="text-xs text-gray-400">{item.product?.category}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-300">Qty: {item.quantity}</span>
                      <span className="text-sm font-bold text-white">₹{item.lineTotal?.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Bill */}
          <Section title="Bill Summary">
            <Row label="Item Total"     value={`₹${(order.billDetails as any)?.itemTotal?.toFixed(0) ?? "—"}`} />
            <Row label="Delivery"       value={`₹${order.deliveryCharge?.toFixed(0) ?? 0}`} />
            <Row label="Discount"       value={order.discountAmount > 0 ? `-₹${order.discountAmount.toFixed(0)}` : "—"} />
            {order.couponCode && <Row label="Coupon"   value={order.couponCode} />}
            <div className="border-t border-gray-800 pt-2 mt-2">
              <Row label="Grand Total"  value={`₹${order.totalAmount.toFixed(0)}`} bold />
            </div>
          </Section>

          {/* Audit trail */}
          {order.auditTrail && order.auditTrail.length > 0 && (
            <Section title="Audit Trail">
              <div className="space-y-2">
                {order.auditTrail.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    <span className="text-gray-500 shrink-0 w-32">
                      {new Date(log.timestamp).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                    </span>
                    <span className="text-blue-400 font-mono shrink-0">{log.action}</span>
                    <span className="text-gray-500 capitalize">{log.actorType?.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Full detail link */}
          <Link
            href={`/order/${order.id}`}
            className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm"
          >
            Open Full Order Detail Page
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</h4>
      <div className="bg-gray-900 rounded-xl p-4 space-y-1.5 border border-gray-800">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value?: string | null; bold?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm text-right ${bold ? "font-bold text-white" : "text-gray-200"} truncate`}>{value}</span>
    </div>
  );
}
