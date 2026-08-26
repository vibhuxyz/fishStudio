"use client";

import React from "react";
import { resolvePaymentState, type PaymentTone } from "@repo/shared/payment-state";

// Seller dashboard's palette for the shared payment vocabulary. Labels come
// from @repo/shared/payment-state; only the colours are local.
const TEXT_TONE: Record<PaymentTone, string> = {
  paid: "text-green-400",
  due: "text-amber-400",
  pending: "text-orange-400",
  refunded: "text-purple-400",
  dead: "text-gray-500",
  danger: "text-red-400",
};

const PILL_TONE: Record<PaymentTone, string> = {
  paid: "bg-emerald-900/40 text-emerald-400 border border-emerald-900/30",
  due: "bg-amber-900/40 text-amber-400 border border-amber-900/30",
  pending: "bg-orange-900/40 text-orange-400 border border-orange-900/30",
  refunded: "bg-purple-900/40 text-purple-400 border border-purple-900/30",
  dead: "bg-gray-800 text-gray-400 border border-gray-700",
  danger: "bg-rose-900/40 text-rose-400 border border-rose-900/30",
};

interface PaymentBadgeProps {
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  refundStatus?: string | null;
  orderStatus?: string | null;
  variant?: "text" | "pill";
  className?: string;
}

export function PaymentBadge({
  paymentStatus,
  paymentMethod,
  refundStatus,
  orderStatus,
  variant = "text",
  className = "",
}: PaymentBadgeProps) {
  const state = resolvePaymentState({ paymentStatus, paymentMethod, refundStatus, orderStatus });

  if (variant === "pill") {
    return (
      <span
        title={state.detail}
        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${PILL_TONE[state.tone]} ${className}`}
      >
        {state.label}
      </span>
    );
  }

  return (
    <span
      title={state.detail}
      className={`text-xs font-semibold ${TEXT_TONE[state.tone]} ${className}`}
    >
      {state.label}
    </span>
  );
}

export default PaymentBadge;
