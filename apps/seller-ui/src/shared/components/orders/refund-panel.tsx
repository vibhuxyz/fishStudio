"use client";

import React, { useState } from "react";
import { AlertTriangle, BadgeCheck, Banknote, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import axiosInstance from "@/utils/axiosInstance";
import { resolvePaymentState } from "@repo/shared/payment-state";

const formatCurrency = (value: number) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const formatMoment = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

type Tone = "neutral" | "pending" | "good" | "bad";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "border-slate-800 bg-slate-900/50 text-gray-300",
  pending: "border-amber-900/50 bg-amber-950/20 text-amber-200",
  good: "border-emerald-900/50 bg-emerald-950/20 text-emerald-200",
  bad: "border-red-900/50 bg-red-950/20 text-red-200",
};

const TONE_ICON: Record<Tone, React.ReactNode> = {
  neutral: <Banknote size={18} />,
  pending: <Clock size={18} />,
  good: <BadgeCheck size={18} />,
  bad: <AlertTriangle size={18} />,
};

interface RefundPanelProps {
  order: any;
  onRefunded?: () => void;
}

/**
 * The refund story for one order, in one place.
 *
 * Payment status and refund status are two different columns, and reading them
 * side by side is what makes an order look wrong: a refused refund leaves the
 * payment COMPLETED (the money really is still with the store) while
 * refundStatus reads FAILED. Splitting that across two sections left sellers
 * to reconcile it themselves, so this states the outcome in one sentence and,
 * when money is still owed, offers the button that moves it.
 */
const RefundPanel: React.FC<RefundPanelProps> = ({ order, onRefunded }) => {
  const [isRefunding, setIsRefunding] = useState(false);

  const isCancelled = order.status === "CANCELLED" || order.status === "REJECTED";
  const isOnline = order.paymentMethod === "RAZORPAY";
  const refundStatus: string = order.refundStatus ?? "NONE";
  const paymentStatus: string = order.paymentStatus ?? "PENDING";

  // Nothing to say about a live order that was never refunded.
  if (!isCancelled && refundStatus === "NONE") return null;

  // The gateway claim requires a settled payment, so that is exactly when a
  // manual refund can succeed. Offering the button otherwise just produces a
  // 400 the seller can do nothing about.
  const canRefundNow = isOnline && paymentStatus === "COMPLETED" && refundStatus !== "COMPLETED";

  const handleRefund = async () => {
    setIsRefunding(true);
    try {
      await axiosInstance.post("/payment/api/refund", {
        orderId: order.id,
        reason: order.cancellationReason || "Manual refund from seller dashboard",
      });
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
    detail = "No money was collected through the gateway. Settle any cash refund directly with the customer.";
  } else if (paymentStatus === "REFUNDED" || refundStatus === "COMPLETED") {
    tone = "good";
    heading = `Refunded ${formatCurrency(order.total)}`;
    detail = "Razorpay confirmed the refund. It reaches the customer's account on their bank's schedule.";
  } else if (paymentStatus === "REFUND_PENDING" || refundStatus === "PROCESSING") {
    tone = "pending";
    heading = `Refund of ${formatCurrency(order.total)} submitted`;
    detail = "Razorpay has accepted it and is settling. This usually completes within 5–7 working days.";
  } else if (refundStatus === "FAILED") {
    tone = "bad";
    heading = `Refund failed — ${formatCurrency(order.total)} is still with the store`;
    detail =
      order.refundFailureReason ||
      "The gateway rejected the refund and did not say why. Retry, and contact Razorpay support if it fails again.";
  } else if (paymentStatus !== "COMPLETED") {
    const state = resolvePaymentState({
      paymentMethod: order.paymentMethod,
      paymentStatus,
      refundStatus,
      orderStatus: order.status,
    });
    tone = "neutral";
    heading = state.label;
    detail = state.detail;
  } else if (refundStatus === "REQUESTED") {
    tone = "pending";
    heading = `Refund of ${formatCurrency(order.total)} requested but not yet sent`;
    detail = "The automatic refund hasn't reached the gateway. Start it manually if this has been sitting for more than a few minutes.";
  } else {
    tone = "pending";
    heading = `${formatCurrency(order.total)} was paid and has not been refunded`;
    detail = "This order is cancelled but the customer's money is still with the store.";
  }

  return (
    <div className={`mb-6 rounded-lg border p-4 ${TONE_CLASS[tone]}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{TONE_ICON[tone]}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{heading}</h3>
          <p className="mt-1 text-xs leading-relaxed opacity-90">{detail}</p>

          {refundStatus === "FAILED" && order.refundFailedAt && (
            <p className="mt-1 text-xs opacity-70">
              Last attempt {formatMoment(order.refundFailedAt)}
            </p>
          )}
        </div>

        {canRefundNow && (
          <button
            type="button"
            onClick={handleRefund}
            disabled={isRefunding}
            className="flex shrink-0 items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
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
