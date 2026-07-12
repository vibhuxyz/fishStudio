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
import { axiosInstance } from "@/lib/utils";
import { frontendEnv } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { useUserSession } from "@/hooks/useUserSession";
import { toast } from "sonner";

interface OrderConfirmationDetailProps {
  initialOrder: any;
  orderId: string;
}

export function OrderConfirmationDetail({ initialOrder, orderId }: OrderConfirmationDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // useUserSession reads from TanStack Query cache — available synchronously on
  // first render (no effect/store hop), so enabled is correct immediately.
  const { user, isLoading: isSessionLoading } = useUserSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/order/api/get-order/${orderId}`);
      return data.order;
    },
    initialData: initialOrder ?? undefined,
    enabled: !!orderId && !!user,
  });

  // WebSocket: refresh order when status changes
  useEffect(() => {
    if (!user?.id || !orderId) return;

    const derivedWs = frontendEnv.apiUrl.startsWith("https")
      ? frontendEnv.apiUrl.replace(/^https/, "wss")
      : null;
    const wsBase = (process.env.NEXT_PUBLIC_WORKER_WS_URL || derivedWs || "ws://localhost:6006").replace(/\?.*$/, "");
    const wsUrl = `${wsBase}?userId=${user.id}`;

    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "ORDER_STATUS_UPDATE" && data.payload?.orderId === orderId) {
            queryClient.invalidateQueries({ queryKey: ["order", orderId] });
          }
        } catch {}
      };

      ws.onclose = () => {
        if (!destroyed) reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      destroyed = true;
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [user?.id, orderId, queryClient]);

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

  if (isSessionLoading) {
    return null; // parent already shows skeleton while session loads
  }

  if (!user) {
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

  if (isLoading && !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-14">
        <div className="animate-pulse space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-muted" />
          <div className="mx-auto h-10 w-72 rounded bg-muted" />
          <div className="mx-auto h-5 w-96 rounded bg-muted" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-64 rounded-2xl bg-muted" />
            <div className="h-64 rounded-2xl bg-muted" />
          </div>
          <div className="h-80 rounded-2xl bg-muted" />
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
          We couldn't find the order details for #{orderId.slice(-6).toUpperCase()}.
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

  const billDetails = order.billDetails as Record<string, number> | null;
  const statusCfg = getStatusConfig(order.status);
  const shortId = String(order.id).slice(-6).toUpperCase();

  // Download Invoice — opens a print-ready invoice in a new window. Dependency
  // free: the user can print or "Save as PDF" from the browser dialog.
  const handleDownloadInvoice = () => {
    const rows = (order.items || [])
      .map(
        (item: any) =>
          `<tr>
            <td>${item.product?.title || "Product"}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:right">₹${(item.price * item.quantity).toFixed(0)}</td>
          </tr>`,
      )
      .join("");

    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <title>Invoice ${shortId}</title>
      <style>
        body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1C1C1C;padding:32px;max-width:640px;margin:auto}
        h1{color:#5A2C96;margin:0 0 4px}
        .muted{color:#8E8E93;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{padding:8px 4px;border-bottom:1px solid #eee;font-size:13px}
        th{text-align:left;color:#8E8E93;text-transform:uppercase;font-size:11px}
        .total{display:flex;justify-content:space-between;margin-top:16px;font-weight:700;font-size:18px;color:#5A2C96}
        .box{margin-top:20px;font-size:13px;line-height:1.6}
      </style></head><body>
      <h1>Fish Studio</h1>
      <div class="muted">Tax Invoice</div>
      <div class="box">
        <strong>Invoice #${shortId}</strong><br/>
        Date: ${new Date(order.createdAt).toLocaleString("en-IN")}<br/>
        Payment: ${order.paymentMethod === "COD" ? "Pay on Delivery" : order.paymentMethod || "—"}
      </div>
      <div class="box">
        <strong>Deliver to</strong><br/>
        ${order.deliveryName || ""}<br/>
        ${order.deliveryAddress || ""}<br/>
        ${order.deliveryCity || ""} – ${order.deliveryPincode || ""}
      </div>
      <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total"><span>Total Paid</span><span>₹${order.totalAmount}</span></div>
      <p class="muted" style="margin-top:32px">Thank you for shopping with Fish Studio.</p>
      </body></html>`;

    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) {
      toast.error("Allow pop-ups to download the invoice");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  // Share Order — native share where available, otherwise copy the link.
  const handleShareOrder = async () => {
    const url = `${window.location.origin}/orders/${order.id}`;
    const text = `My Fish Studio order #${shortId} is confirmed! Track it here:`;
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
          <span className="font-bold text-foreground">#{shortId}</span>{" "}
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
          {slotLabel}
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
              {(order.items || []).map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product?.images?.[0]?.url && (
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.title}
                        fill
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
          >
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
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
