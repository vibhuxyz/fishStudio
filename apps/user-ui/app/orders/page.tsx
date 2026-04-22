"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";

import { OrdersRealtimeLayer } from "./_components/orders-realtime-layer";
import { OrderLoginAction } from "./_components/order-login-action";
import { useUserSession } from "@/hooks/useUserSession";

export default function OrdersPage() {
  const { isLoading, user } = useUserSession();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-2xl font-bold text-foreground">Sign in to view your orders</h2>
        <p className="mt-2 text-muted-foreground">Track and manage all your Fish Studio orders.</p>
        <div className="mt-6 flex justify-center">
          <OrderLoginAction />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground">Manage your orders and track status</p>
        </div>
      </div>

      <OrdersRealtimeLayer initialOrders={[]} />
    </div>
  );
}
