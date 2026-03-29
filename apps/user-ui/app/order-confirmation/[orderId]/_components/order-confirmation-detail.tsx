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
  Truck 
} from "lucide-react";
import Image from "next/image";
import { axiosInstance } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";

interface OrderConfirmationDetailProps {
  initialOrder: any;
  orderId: string;
}

export function OrderConfirmationDetail({ initialOrder, orderId }: OrderConfirmationDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/order/api/get-order/${orderId}`);
      return data.order;
    },
    initialData: initialOrder,
    enabled: !!orderId,
  });

  // WebSocket: refresh order when status changes
  useEffect(() => {
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

  if (!order) return null;

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
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase italic text-offer-green">
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
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} 
                    </p>
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
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          className="h-14 px-8 rounded-full font-bold text-base shadow-xl group bg-offer-green hover:bg-offer-green/90"
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
    </div>
  );
}
