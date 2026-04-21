"use client";

import React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  adminQueryKeys,
  adminUpdateOrderStatus,
  useAdminOrderDetail,
  type AdminOrder,
} from "@/hooks/useAdminQueries";

const ORDER_STATUSES = ["PENDING", "ACCEPTED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

// Valid transitions from each status — admins can only move orders forward (or cancel)
const ALLOWED_NEXT: Record<string, string[]> = {
  PENDING:   ["PENDING", "ACCEPTED", "CANCELLED", "REJECTED"],
  ACCEPTED:  ["ACCEPTED", "SHIPPED", "CANCELLED", "REJECTED"],
  SHIPPED:   ["SHIPPED", "DELIVERED", "CANCELLED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED"],
  REJECTED:  ["REJECTED"],
};

const statusColor = (s: string) => {
  if (s === "DELIVERED") return "text-emerald-400";
  if (s === "PENDING")   return "text-amber-400";
  if (s === "ACCEPTED")  return "text-blue-400";
  if (s === "SHIPPED")   return "text-purple-400";
  if (s === "REJECTED" || s === "CANCELLED") return "text-rose-400";
  return "text-gray-400";
};

const payColor = (s: string) =>
  s === "COMPLETED" ? "text-emerald-400" : s === "REFUNDED" ? "text-purple-400" : "text-amber-400";

const Page = () => {
  const params  = useParams();
  const orderId = params.id as string;
  const router  = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useAdminOrderDetail(orderId);

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => adminUpdateOrderStatus(orderId, status),
    onSuccess: (_, status) => {
      queryClient.setQueryData(
        adminQueryKeys.adminOrder(orderId),
        (cur: AdminOrder | null | undefined) =>
          cur
            ? {
                ...cur,
                status,
                paymentStatus: status === "DELIVERED" ? "COMPLETED" : cur.paymentStatus,
              }
            : cur,
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "admin-orders"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-sm text-rose-400 mt-10">Order not found.</p>;
  }

  const currentIdx = ORDER_STATUSES.indexOf(order.status as any);
  const amount     = (order as any).totalAmount ?? 0;
  const billDetails = order.billDetails as any;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Back */}
      <button
        onClick={() => router.push("/dashboard/orders")}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      {/* Title + status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-sm font-bold uppercase ${statusColor(order.status)}`}>
            {order.status}
          </span>
          <span className={`text-sm font-semibold ${payColor(order.paymentStatus)}`}>
            {order.paymentStatus}
          </span>
          {(order as any).paymentMethod && (
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
              {(order as any).paymentMethod}
            </span>
          )}
        </div>
      </div>

      {/* Status stepper */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <div className="flex items-center justify-between mb-3 text-xs text-gray-400 font-medium">
          {ORDER_STATUSES.map((step, idx) => {
            const reached = idx <= currentIdx;
            return (
              <span
                key={step}
                className={`flex-1 text-center ${reached ? (step === order.status ? "text-blue-400 font-bold" : "text-emerald-400") : "text-gray-600"}`}
              >
                {step}
              </span>
            );
          })}
        </div>
        <div className="flex items-center">
          {ORDER_STATUSES.map((step, idx) => {
            const reached = idx <= currentIdx;
            return (
              <div key={step} className="flex-1 flex items-center">
                <div className={`w-3 h-3 rounded-full mx-auto ${reached ? "bg-blue-500" : "bg-gray-700"}`} />
                {idx !== ORDER_STATUSES.length - 1 && (
                  <div className={`flex-1 h-0.5 ${reached ? "bg-blue-500" : "bg-gray-700"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Update status */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-gray-300">Update Status:</label>
        {["DELIVERED", "CANCELLED", "REJECTED"].includes(order.status) ? (
          <span className={`text-sm font-bold px-3 py-1 rounded-lg bg-gray-800 ${statusColor(order.status)}`}>
            {order.status} — no further changes allowed
          </span>
        ) : (
          <select
            value={order.status}
            onChange={(e) => updateStatusMutation.mutate(e.target.value)}
            disabled={updateStatusMutation.isPending}
            className="bg-gray-800 text-gray-100 border border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none"
          >
            {(ALLOWED_NEXT[order.status] ?? [order.status]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        {updateStatusMutation.isPending && (
          <Loader2 size={16} className="animate-spin text-gray-400" />
        )}
        {updateStatusMutation.isSuccess && (
          <span className="text-xs text-emerald-400">Updated!</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer */}
        <Section title="Customer">
          <Row label="Name"         value={order.customer?.name} />
          <Row label="Email"        value={order.customer?.email} />
          <Row label="Phone"        value={order.customer?.phone} />
          <Row label="Member since" value={order.customer?.memberSince ? new Date(order.customer.memberSince).toLocaleDateString("en-IN") : undefined} />
        </Section>

        {/* Seller & Store */}
        <Section title="Seller & Store">
          <Row label="Seller"   value={order.seller?.name} />
          <Row label="Email"    value={order.seller?.email} />
          <Row label="Phone"    value={order.seller?.phone} />
          <Row label="Approved" value={order.seller?.isApproved ? "Yes" : "No"} />
          <Row label="Store"    value={order.store?.name} />
          <Row label="City"     value={order.store?.city} />
          <Row label="Pincode"  value={order.store?.pincode} />
        </Section>

        {/* Delivery address */}
        <Section title="Delivery Address">
          <Row label="Name"    value={order.delivery?.name} />
          <Row label="Phone"   value={order.delivery?.phone} />
          <Row label="Address" value={order.delivery?.address} />
          <Row label="City"    value={order.delivery?.city} />
          <Row label="Pincode" value={order.delivery?.pincode} />
        </Section>

        {/* Bill summary */}
        <Section title="Bill Summary">
          <Row label="Item Total"     value={`₹${billDetails?.itemTotal?.toFixed(0) ?? "—"}`} />
          <Row label="Delivery"       value={`₹${order.deliveryCharge?.toFixed(0) ?? 0}`} />
          {(order.discountAmount ?? 0) > 0 && (
            <Row label="Discount" value={`-₹${order.discountAmount?.toFixed(0)}`} />
          )}
          {order.couponCode && <Row label="Coupon" value={order.couponCode as string} />}
          <div className="border-t border-gray-800 pt-2 mt-1">
            <Row label="Grand Total" value={`₹${amount.toFixed(0)}`} bold />
          </div>
        </Section>
      </div>

      {/* Order items */}
      <Section title={`Items (${order.items?.length ?? 0})`}>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-start gap-3 bg-gray-800 rounded-xl p-3">
              {item.product?.image && (
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-700"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {item.product?.title ?? item.productId}
                </p>
                <p className="text-xs text-gray-400">{item.product?.category}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-gray-400">Qty: {item.quantity} · ₹{item.unitPrice?.toFixed(0)}/ea</span>
                  <span className="text-sm font-bold text-white">₹{item.lineTotal?.toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Audit trail */}
      {(order as any).auditTrail?.length > 0 && (
        <Section title="Audit Trail">
          <div className="space-y-2">
            {((order as any).auditTrail as any[]).map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <span className="text-gray-500 shrink-0 w-36">
                  {new Date(log.timestamp).toLocaleString("en-IN", {
                    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short",
                  })}
                </span>
                <span className="text-blue-400 font-mono shrink-0">{log.action}</span>
                <span className="text-gray-500 capitalize">{log.actorType?.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value?: string | null; bold?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm text-right truncate ${bold ? "font-bold text-white" : "text-gray-200"}`}>
        {value}
      </span>
    </div>
  );
}

export default Page;
