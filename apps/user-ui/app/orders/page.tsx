"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { axiosInstance } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { useModals } from "@/components/providers/modal-provider";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   color: "text-amber-600 bg-amber-50 border-amber-200",   icon: <Clock className="h-3.5 w-3.5" /> },
  ACCEPTED:  { label: "Accepted",  color: "text-blue-600 bg-blue-50 border-blue-200",     icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  SHIPPED:   { label: "Shipped",   color: "text-purple-600 bg-purple-50 border-purple-200", icon: <Truck className="h-3.5 w-3.5" /> },
  DELIVERED: { label: "Delivered", color: "text-offer-green bg-offer-green/10 border-offer-green/30", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  CANCELLED: { label: "Cancelled", color: "text-destructive bg-destructive/10 border-destructive/30", icon: <XCircle className="h-3.5 w-3.5" /> },
  REJECTED:  { label: "Rejected",  color: "text-destructive bg-destructive/10 border-destructive/30", icon: <XCircle className="h-3.5 w-3.5" /> },
};

export default function OrdersPage() {
  const { isLoggedIn } = useAuth();
  const modals = useModals();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/order/api/user-orders");
      return data.orders as any[];
    },
    enabled: isLoggedIn,
    retry: false,
  });

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-2xl font-bold text-foreground">Sign in to view your orders</h2>
        <p className="mt-2 text-muted-foreground">Track and manage all your Fish Studio orders.</p>
        <Button className="mt-6 bg-offer-green text-white hover:bg-offer-green/90" onClick={modals.openLogin}>
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
        {/* Order card skeletons matching real layout: image + info + status badge */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-16 w-16 flex-shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-4 flex-shrink-0 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Package className="mx-auto mb-4 h-14 w-14 text-muted-foreground/30" />
        <h2 className="text-xl font-bold">Could not load orders</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground">{data.length} order{data.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="text-xl font-bold text-foreground">No orders yet</h2>
          <p className="mt-2 text-muted-foreground">Your placed orders will appear here.</p>
          <Button asChild className="mt-6 bg-offer-green text-white hover:bg-offer-green/90">
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((order: any) => {
            const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
            return (
              <Link
                key={order.id}
                href={`/order-confirmation/${order.id}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
              >
                {/* Image / Icon */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 border border-border">
                  {order.orderItems?.[0]?.product?.images?.[0]?.url ? (
                    <img
                      src={order.orderItems[0].product.images[0].url}
                      alt="Product"
                      className="h-full w-full object-cover"
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
                        {order.orderItems?.[0]?.product?.title || `Order #${order.id?.slice(-6).toUpperCase()}`}
                        {order.orderItems?.length > 1 && ` + ${order.orderItems.length - 1} more`}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          #{order.id?.slice(-6)}
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
                    {order.orderItems?.length ?? 0} item{(order.orderItems?.length ?? 0) !== 1 ? "s" : ""} · ₹{order.totalAmount}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </p>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
