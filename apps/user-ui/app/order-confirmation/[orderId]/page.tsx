"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-store";

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
} from "lucide-react";
import Image from "next/image";
import { axiosInstance } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderConfirmationPage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { orderId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/order/api/get-order/${orderId}`);
      return data.order;
    },
    enabled: !!orderId,
  });

  // WebSocket: refresh order when status changes
  React.useEffect(() => {
    if (!user?.id || !orderId) return;

    const wsBase = (process.env.NEXT_PUBLIC_WORKER_WS_URL || "ws://localhost:6006").replace(/\?.*$/, "");
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
          // Worker broadcasts { type: "ORDER_STATUS_UPDATE", payload: { orderId, status } }
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-14 space-y-6">
        {/* Success header skeleton */}
        <div className="flex flex-col items-center space-y-3 mb-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-72" />
        </div>

        {/* Info cards grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Left card — order meta: date, address, slot, payment, status */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 flex-shrink-0 rounded" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </div>

          {/* Right card — order items + bill */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <Skeleton className="mb-4 h-3 w-24" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 flex-shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-10" />
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Store info skeleton */}
        <div className="rounded-2xl border border-border bg-card px-6 py-4 flex items-center gap-4">
          <Skeleton className="h-6 w-6 flex-shrink-0 rounded" />
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Skeleton className="h-14 w-full rounded-full sm:w-52" />
          <Skeleton className="h-14 w-full rounded-full sm:w-48" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Order not found</h2>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t find the order details you&apos;re looking for.
        </p>
        <Button onClick={() => router.push("/")} className="mt-6">
          Back to Home
        </Button>
      </div>
    );
  }

  // Delivery slot label
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-14">
      {/* ── Success Header ── */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-offer-green/10 text-offer-green">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase italic">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground text-lg">
          Your order{" "}
          <span className="font-bold text-foreground">
            #{String(order.id).slice(-6).toUpperCase()}
          </span>{" "}
          has been placed successfully.
        </p>
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

          {/* Delivery address */}
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
              {order.deliveryPhone && (
                <p className="mt-1 text-xs text-muted-foreground">
                  📞 {order.deliveryPhone}
                </p>
              )}
            </div>
          </div>

          {/* Delivery slot */}
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Delivery Slot
              </p>
              <p className="font-bold text-sm">{slotLabel}</p>
            </div>
          </div>

          {/* Payment */}
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

          {/* Status */}
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
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} 
                      {item.selectedOptions && (
                        <>
                          {" | "}
                          {Object.values(item.selectedOptions).filter(Boolean).join(" | ")}
                        </>
                      )}
                    </p>

                  </div>
                  <span className="text-sm font-bold">
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bill summary */}
          <div className="mt-5 pt-4 border-t border-border space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Items Total</span>
              <span>₹{billDetails?.itemTotal ?? 0}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Delivery Charge</span>
              <span>₹{billDetails?.deliveryCharge ?? order.deliveryCharge ?? 0}</span>
            </div>
            {billDetails?.extraCharge ? (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Instant Delivery Fee</span>
                <span>₹{billDetails.extraCharge}</span>
              </div>
            ) : null}
            {billDetails?.discountBreakdown && Array.isArray(billDetails.discountBreakdown) ? (
              (billDetails.discountBreakdown as any[]).map((item) => (
                <div key={item.code} className="flex justify-between text-xs text-offer-green">
                  <span>Coupon ({item.code})</span>
                  <span>-₹{Number(item.amount).toFixed(0)}</span>
                </div>
              ))
            ) : billDetails?.discount ? (
              <div className="flex justify-between text-xs text-offer-green">
                <span>Discount</span>
                <span>-₹{billDetails.discount}</span>
              </div>
            ) : null}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-black uppercase italic tracking-tighter text-base">
                Total Paid
              </span>
              <span className="text-2xl font-black text-primary">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Store info ── */}
      {order.store && (
        <div className="rounded-2xl border border-border bg-card px-6 py-4 mb-6 flex items-center gap-4">
          <Package className="h-6 w-6 text-primary flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Fulfilled by
            </p>
            <p className="font-bold text-sm">{order.store.name}</p>
            <p className="text-xs text-muted-foreground">{order.store.address}</p>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          className="h-14 px-8 rounded-full font-bold text-base shadow-xl group"
          onClick={() => router.push("/")}
        >
          Continue Shopping
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button
          variant="outline"
          className="h-14 px-8 rounded-full font-bold text-base"
          onClick={() => router.push("/orders")}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          View My Orders
        </Button>
      </div>

      {/* ── Footer note ── */}
      <div className="mt-12 border-t border-border pt-8 text-center">
        <p className="text-sm text-muted-foreground italic max-w-md mx-auto">
          &quot;We&apos;re preparing your fresh catch! Our delivery partner will
          contact you shortly for a seamless experience.&quot;
        </p>
      </div>
    </div>
  );
}
