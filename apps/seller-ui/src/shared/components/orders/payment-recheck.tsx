"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { paymentStateLabel, resolvePaymentState } from "@repo/shared/payment-state";

import axiosInstance from "@/utils/axiosInstance";

interface PaymentRecheckProps {
  order: any;
  onRechecked?: () => void;
}

/**
 * "Ask Razorpay again what happened to this payment."
 *
 * The client callback dies with the browser and webhooks can be missed, so a
 * payment can sit in a non-final state longer than it should. The recheck
 * endpoint settles it from the gateway on demand. Rendered only when the
 * shared resolver says there is genuinely something left to ask about.
 */
const PaymentRecheck: React.FC<PaymentRecheckProps> = ({ order, onRechecked }) => {
  const [isRechecking, setIsRechecking] = useState(false);

  const { canRecheck } = resolvePaymentState({
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    refundStatus: order.refundStatus,
    orderStatus: order.status,
  });
  if (!canRecheck) return null;

  const handleRecheck = async () => {
    setIsRechecking(true);
    try {
      const { data } = await axiosInstance.get(`/payment/api/recheck-payment/${order.id}`);
      const label = paymentStateLabel({
        paymentStatus: data.paymentStatus,
        paymentMethod: order.paymentMethod,
        orderStatus: order.status,
      });
      if (data.changed) {
        toast.success(`Payment status updated: ${label}`);
        onRechecked?.();
      } else {
        toast.info(`Still ${label} — Razorpay hasn't reported a change yet`);
      }
    } catch (err: any) {
      // Surface the server's reason: a bare "couldn't recheck" leaves nothing
      // to act on the next time this fails.
      const reason = err?.response?.data?.message || err?.message;
      toast.error(reason ? `Couldn't recheck payment: ${reason}` : "Couldn't recheck payment status");
    } finally {
      setIsRechecking(false);
    }
  };

  return (
    <button
      type="button"
      title="Recheck payment status with Razorpay"
      disabled={isRechecking}
      onClick={handleRecheck}
      className="mr-1.5 align-middle text-gray-400 transition hover:text-white disabled:opacity-50"
    >
      <RefreshCw size={12} className={isRechecking ? "animate-spin" : ""} />
    </button>
  );
};

export default PaymentRecheck;
