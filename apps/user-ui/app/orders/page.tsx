"use client";

import { ShoppingBag } from "lucide-react";

import { OrdersRealtimeLayer } from "./_components/orders-realtime-layer";
import { OrderLoginAction } from "./_components/order-login-action";
import { OrdersHeader } from "./_components/orders-header";
import { OrdersPageSkeleton } from "./_components/orders-skeleton";
import { useUserSession } from "@/hooks/useUserSession";

export default function OrdersPage() {
  const { isLoading, user } = useUserSession();

  // The session query decides between the order list and the signed-out
  // prompt, so until it settles we show the list's shape rather than a spinner
  // — it's what the signed-in majority is about to get.
  if (isLoading) {
    return <OrdersPageSkeleton />;
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
      <OrdersHeader />

      <OrdersRealtimeLayer initialOrders={[]} />
    </div>
  );
}
