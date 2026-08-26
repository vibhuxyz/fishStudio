"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, ShoppingBag, PackageCheck, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/orders-api";
import { OrdersSkeleton } from "./orders-skeleton";
import { formatOrderId } from "@repo/shared/order-id";
import { resolvePaymentState } from "@repo/shared/payment-state";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   color: "text-amber-600 bg-amber-50 border-amber-200",   icon: <Clock className="h-3.5 w-3.5" /> },
  ACCEPTED:  { label: "Accepted",  color: "text-blue-600 bg-blue-50 border-blue-200",     icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  PREPARING: { label: "Preparing", color: "text-blue-600 bg-blue-50 border-blue-200",     icon: <Package className="h-3.5 w-3.5" /> },
  READY_FOR_PICKUP:  { label: "Ready for Pickup", color: "text-teal-600 bg-teal-50 border-teal-200", icon: <PackageCheck className="h-3.5 w-3.5" /> },
  ASSIGNED_TO_RIDER: { label: "Rider Assigned",   color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200", icon: <Bike className="h-3.5 w-3.5" /> },
  SHIPPED:   { label: "Shipped",   color: "text-purple-600 bg-purple-50 border-purple-200", icon: <Truck className="h-3.5 w-3.5" /> },
  DELIVERED: { label: "Delivered", color: "text-offer-green bg-offer-green/10 border-offer-green/30", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  CANCELLED: { label: "Cancelled", color: "text-destructive bg-destructive/10 border-destructive/30", icon: <XCircle className="h-3.5 w-3.5" /> },
  REJECTED:  { label: "Rejected",  color: "text-destructive bg-destructive/10 border-destructive/30", icon: <XCircle className="h-3.5 w-3.5" /> },
};

export function OrdersList({ orders, isLoading }: { orders: Order[]; isLoading?: boolean }) {
  // Without this the first fetch fell through to the map below and rendered an
  // empty container — a blank gap where the list is about to be.
  if (isLoading && orders.length === 0) {
    return <OrdersSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-bold text-foreground">No orders yet</h2>
        <p className="mt-2 text-muted-foreground">Your placed orders will appear here.</p>
        <Button asChild className="mt-6 bg-offer-green text-white hover:bg-offer-green/90">
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const orderStatus = (order.status || "PENDING").toUpperCase();
        const paymentState = resolvePaymentState({
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus,
        });
        // An online order still sitting PENDING never got a completed payment —
        // the seller never saw it, so it reads as cancelled rather than "in
        // progress". COD is exempt: cash is simply due on delivery. The states
        // come from the shared resolver now, so this agrees with what the
        // seller and admin dashboards say about the same order.
        const isUnpaidOnline =
          orderStatus === "PENDING" &&
          (paymentState.key === "AWAITING_PAYMENT" || paymentState.key === "NOT_PAID");
        const displayStatus = isUnpaidOnline ? "CANCELLED" : orderStatus;
        const statusCfg = STATUS_CONFIG[displayStatus] ?? STATUS_CONFIG.PENDING;
        const primaryItem = order.items?.[0];
        const itemCount = order.items?.length ?? 0;

        return (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
          >
            {/* Image / Icon */}
            <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 border border-border">
              {primaryItem?.product?.images?.[0]?.url ? (
                <Image
                  src={primaryItem.product.images[0].url}
                  alt="Product"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <Package className="h-7 w-7 text-primary" />
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-foreground text-sm line-clamp-1">
                    {primaryItem?.product?.title || `Order ${order.id ? formatOrderId(order.id) : ""}`}
                    {itemCount > 1 && ` + ${itemCount - 1} more`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {order.id ? formatOrderId(order.id) : ""}
                    </p>
                    {order.store?.name && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <p className="text-[11px] font-medium text-muted-foreground">
                          {order.store.name}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${statusCfg.color}`}>
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground font-medium">
                {itemCount} item{itemCount !== 1 ? "s" : ""} · ₹{order.totalAmount}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                </p>
              </div>
              {isUnpaidOnline && (
                <p className="mt-1.5 text-[11px] font-medium text-destructive">
                  Payment wasn't completed. Any amount deducted will be refunded in 3–5 business days.
                </p>
              )}
            </div>

            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </Link>
        );
      })}
    </div>
  );
}
