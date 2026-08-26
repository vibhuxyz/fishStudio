"use client";

import React from "react";
import Image from "next/image";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  adminQueryKeys,
  adminUpdateOrderStatus,
  useAdminOrderDetail,
  type AdminOrder,
  type AdminOrderPayment,
} from "@/hooks/useAdminQueries";
import { formatOrderId } from "@repo/shared/order-id";
import RefundPanel from "@/shared/components/orders/refund-panel";
import { resolvePaymentState, type PaymentTone } from "@repo/shared/payment-state";

const ORDER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED_TO_RIDER",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

// Valid transitions from each status — admins can only move orders forward (or cancel).
// ASSIGNED_TO_RIDER is reachable here too (unlike the seller-facing endpoint)
// since admin is a trusted manual-override role for fixing stuck orders.
const ALLOWED_NEXT: Record<string, string[]> = {
  PENDING:           ["PENDING", "ACCEPTED", "CANCELLED", "REJECTED"],
  ACCEPTED:          ["ACCEPTED", "PREPARING", "CANCELLED", "REJECTED"],
  PREPARING:         ["PREPARING", "READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP:  ["READY_FOR_PICKUP", "ASSIGNED_TO_RIDER", "SHIPPED", "CANCELLED"],
  ASSIGNED_TO_RIDER: ["ASSIGNED_TO_RIDER", "SHIPPED", "CANCELLED"],
  SHIPPED:   ["SHIPPED", "DELIVERED", "CANCELLED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED"],
  REJECTED:  ["REJECTED"],
};

const statusColor = (s: string) => {
  if (s === "DELIVERED") return "text-emerald-400";
  if (s === "PENDING")   return "text-amber-400";
  if (s === "ACCEPTED")  return "text-blue-400";
  if (s === "PREPARING") return "text-cyan-400";
  if (s === "READY_FOR_PICKUP") return "text-teal-400";
  if (s === "ASSIGNED_TO_RIDER") return "text-fuchsia-400";
  if (s === "SHIPPED")   return "text-purple-400";
  if (s === "REJECTED" || s === "CANCELLED") return "text-rose-400";
  return "text-gray-400";
};

const PAY_TONE_CLASS: Record<PaymentTone, string> = {
  paid:     "text-emerald-400",
  due:      "text-amber-400",
  pending:  "text-amber-400",
  refunded: "text-purple-400",
  dead:     "text-gray-500",
  danger:   "text-rose-400",
};

/** Razorpay's own sub-instrument (card/upi/netbanking/wallet), read off the
 *  payment's metadata — `payment.method` itself is only ever "COD" | "RAZORPAY". */
function instrumentLabel(payment: AdminOrderPayment): string | null {
  const method = payment.metadata?.method;
  if (!method) return null;
  const detail = payment.metadata?.instrumentDetail;
  const label = method.toUpperCase();
  return detail ? `${label} · ${detail}` : label;
}

/** One row in the payments list — a payment has no refund column of its own. */
function PaymentRowBadge({
  status,
  method,
  orderStatus,
}: {
  status: string;
  method?: string | null;
  orderStatus: string;
}) {
  const state = resolvePaymentState({ paymentStatus: status, paymentMethod: method, orderStatus });
  return (
    <span className={`text-xs font-semibold ${PAY_TONE_CLASS[state.tone]}`} title={state.detail}>
      {state.label}
    </span>
  );
}

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
  const primaryPayment = order.payments?.find((p) => p.status === "COMPLETED") ?? order.payments?.[0];
  const primaryInstrument = primaryPayment ? instrumentLabel(primaryPayment) : null;
  const paymentState = resolvePaymentState({
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    refundStatus: order.refundStatus,
    orderStatus: order.status,
  });

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
            Order {formatOrderId(order.id)}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-sm font-bold uppercase ${statusColor(order.status)}`}>
            {order.status}
          </span>
          <span
            className={`text-sm font-semibold ${PAY_TONE_CLASS[paymentState.tone]}`}
            title={paymentState.detail}
          >
            {paymentState.label}
          </span>
          {(order as any).paymentMethod && (
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
              {(order as any).paymentMethod}
              {primaryInstrument && ` · ${primaryInstrument}`}
            </span>
          )}
        </div>
      </div>

      <RefundPanel
        order={order}
        onRefunded={() => {
          queryClient.invalidateQueries({ queryKey: adminQueryKeys.adminOrder(orderId) });
          queryClient.invalidateQueries({ queryKey: ["admin", "admin-orders"] });
        }}
      />

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

        {/* Assigned rider */}
        {order.rider && (
          <Section title="Assigned Rider">
            <div className="flex items-center gap-3 mb-3">
              {order.rider.avatar?.url ? (
                <Image src={order.rider.avatar.url} alt={order.rider.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                  <span className="text-fuchsia-400 text-sm font-bold">{order.rider.name?.[0]?.toUpperCase() ?? "R"}</span>
                </div>
              )}
              <p className="text-white font-semibold">{order.rider.name}</p>
            </div>
            <Row label="Phone"   value={order.rider.phone} />
            <Row label="Vehicle" value={`${order.rider.vehicleType} · ${order.rider.vehicleNumber}`} />
            <Row label="Assigned At" value={order.assignedAt ? new Date(order.assignedAt).toLocaleString("en-IN") : undefined} />
          </Section>
        )}
      </div>

      {/* Payments */}
      {order.payments && order.payments.length > 0 && (
        <Section title={`Payment${order.payments.length > 1 ? "s" : ""} (${order.payments.length})`}>
          <div className="space-y-3">
            {order.payments.map((payment) => (
              <div key={payment.id} className="bg-gray-800 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {payment.method}
                    {instrumentLabel(payment) && (
                      <span className="text-gray-400 font-normal"> · {instrumentLabel(payment)}</span>
                    )}
                  </span>
                  <PaymentRowBadge status={payment.status} method={payment.method} orderStatus={order.status} />
                </div>
                <Row label="Amount" value={`₹${payment.amount.toFixed(0)}`} />
                {payment.transactionId && <Row label="Transaction ID" value={payment.transactionId} />}
              </div>
            ))}
          </div>
        </Section>
      )}

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
                {((item as any).selectedOptions?.cuttingType || (item as any).selectedOptions?.pieceSize) && (
                  <p className="text-xs text-gray-400">
                    {(item as any).selectedOptions?.cuttingType}
                    {(item as any).selectedOptions?.pieceSize ? ` · ${(item as any).selectedOptions.pieceSize}` : ""}
                    {(item as any).selectedOptions?.weightGrams
                      ? ` · ${(item as any).selectedOptions.weightGrams >= 1000
                          ? `${((item as any).selectedOptions.weightGrams / 1000).toFixed(2)} kg`
                          : `${(item as any).selectedOptions.weightGrams} gm`}`
                      : ""}
                  </p>
                )}
                {(item as any).selectedOptions?.cuttingCharge != null && (item as any).selectedOptions?.cuttingCharge > 0 && (
                  <p className="text-[11px] text-amber-400">
                    ₹{(item as any).selectedOptions.baseRatePerKg}/kg + ₹{(item as any).selectedOptions.cuttingCharge} cut
                    {(item as any).selectedOptions.sizeMultiplier && (item as any).selectedOptions.sizeMultiplier !== 1
                      ? ` ×${(item as any).selectedOptions.sizeMultiplier}`
                      : ""}
                    {" = "}₹{(item as any).selectedOptions.effectiveRatePerKg}/kg
                  </p>
                )}
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
