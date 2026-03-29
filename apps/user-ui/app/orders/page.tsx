import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { cookies } from "next/headers";

import { OrdersSkeleton } from "./_components/orders-skeleton";
import { OrdersRealtimeLayer } from "./_components/orders-realtime-layer";
import { fetchServerOrders } from "@/lib/orders-api";
import { Button } from "@/components/ui/button";

// Optional: Server-side Auth Check for immediate Login redirect/view
async function getIsLoggedIn() {
  const cookieStore = await cookies();
  return cookieStore.has("access_token");
}

async function OrdersListStream() {
  const orders = await fetchServerOrders();
  return <OrdersRealtimeLayer initialOrders={orders} />;
}

export default async function OrdersPage() {
  const isLoggedIn = await getIsLoggedIn();

  if (!isLoggedIn) {
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

      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersListStream />
      </Suspense>
    </div>
  );
}

// Client component to handle login trigger
import { OrderLoginAction } from "./_components/order-login-action";
