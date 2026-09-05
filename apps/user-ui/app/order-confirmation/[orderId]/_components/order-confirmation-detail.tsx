"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Package,
  MapPin,
  Calendar,
  ArrowRight,
  ShoppingBag,
  Clock,
  CreditCard,
  Truck,
  Check,
  Download,
  Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { useUserSession } from "@/hooks/useUserSession";
import { useWs } from "@/context/ws-context";
import { toast } from "sonner";
import type { Order } from "@/lib/orders-api";
import { displayOrderNumber, formatOrderId } from "@repo/shared/order-id";
import { formatDeliveryDateKey } from "@repo/shared/delivery-slots";
import { renderInvoiceHtml, type Invoice } from "@/lib/invoice-template";
import { OrderConfirmationSkeleton } from "./order-confirmation-skeleton";

interface OrderConfirmationDetailProps {
  initialOrder: Order | null;
  orderId: string;
}

export function OrderConfirmationDetail({ initialOrder, orderId }: OrderConfirmationDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Only used to scope the websocket subscription — the order fetch below
  // deliberately does not wait on it.
  const { user } = useUserSession();
  const { subscribe } = useWs();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/order/api/get-order/${orderId}`);
      return data.order as Order;
    },
    initialData: initialOrder ?? undefined,
    // Deliberately not gated on the session. get-order is already behind
    // isAuthenticated, so the cookie decides — and gating here as well meant a
    // slow or failed session read showed "sign in" to someone who had just
    // paid, which is the worst possible moment to imply the order didn't land.
    enabled: !!orderId,
    // An online payment is verified out-of-band, so the order can arrive still
    // PENDING for a second or two after the gateway hands the customer back.
    // Poll until it settles rather than leaving a paid order looking unpaid.
    refetchInterval: (query) => {
      const o = query.state.data;
      if (!o) return false;
      return o.paymentMethod !== "COD" && o.paymentStatus === "PENDING" ? 3_000 : false;
    },
  });

  const status = (error as { response?: { status?: number } } | null)?.response?.status;
  const isAccessError = status === 401 || status === 403;

  // Refresh the order when its status changes, via the app's single shared WS connection.
  useEffect(() => {
    if (!user?.id || !orderId) return;
    return subscribe("ORDER_STATUS_UPDATE", (payload: any) => {
      if (payload?.orderId === orderId) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }
    });
  }, [user?.id, orderId, subscribe, queryClient]);

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
          label: "Delivered",
          color: "bg-emerald-100 text-emerald-700",
        };
      case "CANCELLED":
      case "REJECTED":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-rose-500" />,
          label: status?.charAt(0) + status?.slice(1).toLowerCase(),
          color: "bg-rose-100 text-rose-700",
        };
      case "SHIPPED":
        return {
          icon: <Truck className="h-5 w-5 text-blue-500" />,
          label: "Shipped",
          color: "bg-blue-100 text-blue-700",
        };
      case "ACCEPTED":
        return {
          icon: <Package className="h-5 w-5 text-indigo-500" />,
          label: "Accepted",
          color: "bg-indigo-100 text-indigo-700",
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          label: "Pending",
          color: "bg-amber-100 text-amber-700",
        };
    }
  };

  if (isLoading && !order) {
    return <OrderConfirmationSkeleton />;
  }

  if (isAccessError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground mb-6">
          <Package className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Sign in to view this order</h2>
        <p className="mt-2 text-muted-foreground">
          Log in with the same account you used to place the order.
        </p>
        <div className="mt-8 flex justify-center">
          <Button
            variant="default"
            className="h-12 px-8 rounded-full font-bold"
            onClick={() => router.push("/orders")}
          >
            View My Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground mb-6">
          <Package className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Order Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          We couldn't find the order details for {formatOrderId(orderId)}.
          It might still be processing or the ID is incorrect.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            className="h-12 px-8 rounded-full font-bold"
            onClick={() => router.push("/orders")}
          >
            View My Orders
          </Button>
          <Button
            variant="outline"
            className="h-12 px-8 rounded-full font-bold"
            onClick={() => router.push("/")}
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const slotLabel =
    order.deliverySlot === "instant"
      ? "⚡ Instant (30–45 mins)"
      : order.deliverySlot === "morning"
        ? "🌅 Morning (6 AM – 10 AM)"
        : order.deliverySlot === "evening"
          ? "🌆 Evening (5 PM – 9 PM)"
          : "Standard Delivery";

  // A scheduled slot is meaningless without the day it falls on — "Morning"
  // alone leaves the customer guessing whether that is today or tomorrow.
  const slotDayLabel = formatDeliveryDateKey(order.deliveryDate);

  const billDetails = order.billDetails as Record<string, number> | null;
  const statusCfg = getStatusConfig(order.status);
  const shortId = displayOrderNumber(order);

  // Download Invoice — fetches the GST tax invoice from order-service and
  // opens it print-ready. Dependency free: the user prints or "Saves as PDF"
  // from the browser dialog.
  //
  // The figures are deliberately NOT derived here. An invoice is a statutory
  // document, so its numbering, per-line HSN and GST breakdown, and totals all
  // come from the server, which computes them from the stored order.
  const [isPreparingInvoice, setIsPreparingInvoice] = useState(false);

  const handleDownloadInvoice = async () => {
    if (isPreparingInvoice) return;
    setIsPreparingInvoice(true);

    // Opened before the await: a popup blocked because it was not opened in
    // the click's own task is indistinguishable, to the user, from a broken
    // button. Opening first means the only failure left is a real blocker.
    const w = window.open("", "_blank", "width=900,height=1000");
    if (!w) {
      setIsPreparingInvoice(false);
      toast.error("Allow pop-ups to download the invoice");
      return;
    }
    w.document.write("<p style='font-family:sans-serif;padding:24px'>Preparing invoice…</p>");

    try {
      const { data } = await axiosInstance.get(`/order/api/invoice/${order.id}`);
      if (!data?.success || !data.invoice) throw new Error("No invoice returned");

      w.document.open();
      w.document.write(renderInvoiceHtml(data.invoice as Invoice));
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 300);
    } catch (error: unknown) {
      w.close();
      const message =
        typeof error === "object" && error !== null
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      // The server refuses when the store has no GSTIN configured yet, and says
      // so — that reason is far more actionable than a generic failure.
      toast.error(message || "Couldn't prepare the invoice. Please try again.");
    } finally {
      setIsPreparingInvoice(false);
    }
  };

  // Share Order — native share where available, otherwise copy the link.
  const handleShareOrder = async () => {
    const url = `${window.location.origin}/orders/${order.id}`;
    const text = `My Fish Studio order ${shortId} is confirmed! Track it here:`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Fish Studio Order", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Order link copied to clipboard");
      }
    } catch {
      // user cancelled share — ignore
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-14">
      {/* ── Success Header (animated) ── */}
      <div className="text-center space-y-3 mb-10">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          {/* Expanding ring pulse */}
          <motion.span
            className="absolute inset-0 rounded-full bg-offer-green/20"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", repeat: Infinity, repeatDelay: 0.4 }}
          />
          {/* Circle pop */}
          <motion.div
            className="relative flex h-20 w-20 items-center justify-center rounded-full bg-offer-green text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            {/* Check draw-in */}
            <motion.span
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.18, type: "spring", stiffness: 300, damping: 15 }}
            >
              <Check className="h-11 w-11" strokeWidth={3} />
            </motion.span>
          </motion.div>
        </div>
        <motion.h1
          className="text-3xl md:text-4xl font-black tracking-tight uppercase italic text-offer-green"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Order Confirmed!
        </motion.h1>
        <motion.p
          className="text-muted-foreground text-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Your order{" "}
          <span className="font-bold text-foreground">{shortId}</span>{" "}
          has been placed successfully.
        </motion.p>
        {/* Delivery time highlight */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Clock className="h-4 w-4" />
          {slotDayLabel ? `${slotDayLabel} · ${slotLabel}` : slotLabel}
        </motion.div>
      </div>

      {/* ── Info Cards ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
        {/* Left – order meta */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          {/* Date */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Order Placed
              </p>
              <p className="font-bold text-sm">
                {mounted ? (
                  <>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </>
                ) : (
                  "Loading date..."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Delivering To
              </p>
              <p className="font-bold text-sm leading-relaxed">
                {order.deliveryName}
                <br />
                {order.deliveryAddress}
                <br />
                {order.deliveryCity} – {order.deliveryPincode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Delivery Slot
              </p>
              <p className="font-bold text-sm">{slotLabel}</p>
              {slotDayLabel && (
                <p className="text-xs text-muted-foreground">{slotDayLabel}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Payment
              </p>
              <p className="font-bold text-sm">
                {order.paymentMethod === "COD" ? "Pay on Delivery" : order.paymentMethod}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {statusCfg.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Order Status
              </p>
              <span className={`inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right – items + bill */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Order Items
            </h3>
            <div className="space-y-3">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product?.images?.[0]?.url && (
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {item.product?.title || "Product"}
                    </p>
                    {item.selectedOptions?.cuttingType && item.selectedOptions.cuttingType !== "default" && (
                      <p className="text-xs text-muted-foreground">
                        {item.selectedOptions.cuttingType}
                        {item.selectedOptions.pieceSize && item.selectedOptions.pieceSize !== "default"
                          ? ` · ${item.selectedOptions.pieceSize}`
                          : ""}
                      </p>
                    )}
                    {item.selectedOptions?.weightGrams ? (
                      <p className="text-xs text-muted-foreground">
                        {item.selectedOptions.weightGrams >= 1000
                          ? `${(item.selectedOptions.weightGrams / 1000).toFixed(2)} kg`
                          : `${item.selectedOptions.weightGrams} gm`}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    )}
                    {item.selectedOptions?.cuttingCharge != null && item.selectedOptions.cuttingCharge > 0 && (
                      <p className="text-[11px] text-amber-600">
                        ₹{item.selectedOptions.baseRatePerKg}/kg + ₹{item.selectedOptions.cuttingCharge} cut
                        {item.selectedOptions.sizeMultiplier && item.selectedOptions.sizeMultiplier !== 1
                          ? ` ×${item.selectedOptions.sizeMultiplier}`
                          : ""}
                        {" = "}₹{item.selectedOptions.effectiveRatePerKg}/kg
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold">
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Items Total</span>
              <span>₹{billDetails?.itemTotal ?? 0}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-black uppercase italic tracking-tighter text-base text-primary">
                Total Paid
              </span>
              <span className="text-2xl font-black text-primary">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="space-y-3">
        {/* Primary row */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="h-14 px-8 rounded-full font-bold text-base shadow-xl group bg-offer-green hover:bg-offer-green/90"
            onClick={() => router.push("/")}
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            className="h-14 px-8 rounded-full font-bold text-base"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <Truck className="mr-2 h-4 w-4" />
            Track Order
          </Button>
        </div>

        {/* Secondary row */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-full font-bold"
            onClick={handleDownloadInvoice}
            disabled={isPreparingInvoice}
          >
            <Download className="mr-2 h-4 w-4" />
            {isPreparingInvoice ? "Preparing…" : "Download Invoice"}
          </Button>
          <Button
            variant="outline"
            className="h-12 px-6 rounded-full font-bold"
            onClick={handleShareOrder}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Order
          </Button>
          <Button
            variant="ghost"
            className="h-12 px-6 rounded-full font-bold"
            onClick={() => router.push("/orders")}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            My Orders
          </Button>
        </div>
      </div>
    </div>
  );
}
