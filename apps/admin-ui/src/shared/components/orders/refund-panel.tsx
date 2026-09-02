"use client";

import React, { useState } from "react";
import { AlertTriangle, BadgeCheck, Banknote, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import type { AdminOrder } from "@/hooks/useAdminQueries";
import { resolvePaymentState } from "@repo/shared/payment-state";
import { formatIstDateTime } from "@repo/shared/datetime";

const formatCurrency = (value: number) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

type Tone = "neutral" | "pending" | "good" | "bad";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "border-gray-800 bg-gray-900 text-gray-300",
  pending: "border-amber-900/50 bg-amber-950/20 text-amber-200",
  good: "border-emerald-900/50 bg-emerald-950/20 text-emerald-200",
  bad: "border-rose-900/50 bg-rose-950/20 text-rose-200",
};

const TONE_ICON: Record<Tone, React.ReactNode> = {
  neutral: <Banknote size={18} />,
  pending: <Clock size={18} />,
  good: <BadgeCheck size={18} />,
  bad: <AlertTriangle size={18} />,
};

interface RefundPanelProps {
  order: AdminOrder;
  onRefunded?: () => void;
}

/**
 * Cancellation and refund outcome for one order, plus the manual retry.
 *
 * The seller dashboard carries the same panel — deliberately a copy rather
 * than a shared package, since the two dashboards have their own axios
 * instance, order shape and visual language. The decision table below is the
 * part that must stay in step.
 */
const RefundPanel: React.FC<RefundPanelProps> = ({ order, onRefunded }) => {
  const [isRefunding, setIsRefunding] = useState(false);

  const isCancelled = order.status === "CANCELLED" || order.status === "REJECTED";
  const isOnline = order.paymentMethod === "RAZORPAY";
  const refundStatus = order.refundStatus ?? "NONE";
  const paymentStatus = order.paymentStatus ?? "PENDING";

  if (!isCancelled && refundStatus === "NONE") return null;

  const canRefundNow = isOnline && paymentStatus === "COMPLETED" && refundStatus !== "COMPLETED";

  const handleRefund = async () => {
    setIsRefunding(true);
    try {
      await axiosInstance.post(
        "/payment/api/refund",
        {
          orderId: order.id,
          reason: order.cancellationReason || "Manual refund from admin dashboard",
        },
        isProtected,
      );
      toast.success("Refund submitted to Razorpay. It settles within a few days.");
      onRefunded?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't start the refund");
    } finally {
      setIsRefunding(false);
    }
  };

  let tone: Tone = "neutral";
  let heading = "";
  let detail = "";

  if (!isOnline) {
    tone = "neutral";
    heading = "Cash on delivery — nothing to refund online";
    detail = "No money was collected through the gateway.";
  } else if (paymentStatus === "REFUNDED" || refundStatus === "COMPLETED") {
    tone = "good";
    heading = `Refunded ${formatCurrency(order.totalAmount)}`;
    detail = "Razorpay confirmed the refund. It reaches the customer on their bank's schedule.";
  } else if (paymentStatus === "REFUND_PENDING" || refundStatus === "PROCESSING") {
    tone = "pending";
    heading = `Refund of ${formatCurrency(order.totalAmount)} submitted`;
    detail = "Razorpay accepted it and is settling. Usually completes within 5–7 working days.";
  } else if (refundStatus === "FAILED") {
    tone = "bad";
    heading = `Refund failed — ${formatCurrency(order.totalAmount)} is still with the store`;
    detail =
      order.refundFailureReason ||
      "The gateway rejected the refund and did not say why. Retry, and escalate to Razorpay support if it fails again.";
  } else if (paymentStatus !== "COMPLETED") {
    tone = "neutral";
    heading = resolvePaymentState({ paymentMethod: order.paymentMethod, paymentStatus, refundStatus, orderStatus: order.status }).label;
    detail = resolvePaymentState({ paymentMethod: order.paymentMethod, paymentStatus, refundStatus, orderStatus: order.status }).detail;
  } else if (refundStatus === "REQUESTED") {
    tone = "pending";
    heading = `Refund of ${formatCurrency(order.totalAmount)} requested but not yet sent`;
    detail = "The automatic refund hasn't reached the gateway. Start it manually if it has been sitting for more than a few minutes.";
  } else {
    tone = "pending";
    heading = `${formatCurrency(order.totalAmount)} was paid and has not been refunded`;
    detail = "This order is cancelled but the customer's money is still with the store.";
  }

  return (
    <div className={`rounded-xl border p-5 ${TONE_CLASS[tone]}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{TONE_ICON[tone]}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{heading}</h3>
          <p className="mt-1 text-xs leading-relaxed opacity-90">{detail}</p>

          {isCancelled && (order.cancelledBy || order.cancellationReason) && (
            <p className="mt-2 text-xs opacity-70">
              Cancelled by {String(order.cancelledBy ?? "—").toLowerCase()}
              {order.cancellationReason ? ` — ${order.cancellationReason}` : ""}
              {order.cancelledAt
                ? ` · ${formatIstDateTime(order.cancelledAt)}`
                : ""}
            </p>
          )}

          {refundStatus === "FAILED" && order.refundFailedAt && (
            <p className="mt-1 text-xs opacity-70">
              Last attempt {formatIstDateTime(order.refundFailedAt)}
            </p>
          )}
        </div>

        {canRefundNow && (
          <button
            type="button"
            onClick={handleRefund}
            disabled={isRefunding}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            {isRefunding && <Loader2 size={13} className="animate-spin" />}
            {refundStatus === "FAILED" ? "Retry refund" : "Refund now"}
          </button>
        )}
      </div>
    </div>
  );
};

export default RefundPanel;
