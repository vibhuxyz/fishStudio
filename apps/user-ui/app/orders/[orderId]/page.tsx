"use client";

import { use, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useAddressStore } from "@/lib/address-store";
import axiosInstance from "@/utils/axiosInstance";
import { useUserSession } from "@/hooks/useUserSession";
import { useWs } from "@/context/ws-context";
import { Button } from "@/components/ui/button";
import { OrderTracker } from "./_components/order-tracker";
import { SLOT_LABELS, getDeliveryEtaMinutes } from "./_components/delivery-eta";
import type { Order } from "@/lib/orders-api";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isSessionLoading } = useUserSession();
  const selectedLocation = useAddressStore((state) => state.selectedLocation);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/order/api/get-order/${orderId}`);
      return data.order as Order;
    },
    enabled: !!orderId && !!user,
  });

  // ── Real-time updates, via the app's single shared WS connection ──
  const { subscribe } = useWs();
  useEffect(() => {
    if (!user?.id || !orderId) return;
    return subscribe("ORDER_STATUS_UPDATE", (payload: any) => {
      if (payload?.orderId === orderId) {
        // Invalidate → refetch → OrderTracker detects new status → animates
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }
    });
  }, [user?.id, orderId, subscribe, queryClient]);

  // ── Guards ──
  if (isSessionLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-2xl font-bold">Sign in to view this order</h2>
        <Button className="mt-6" onClick={() => router.push("/orders")}>
          View My Orders
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-44 rounded-2xl bg-muted" />
        <div className="h-72 rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 rounded-2xl bg-muted" />
          <div className="h-40 rounded-2xl bg-muted" />
        </div>
        <div className="h-32 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          We couldn't find order #{orderId.slice(-6).toUpperCase()}.
        </p>
        <Button className="mt-6" onClick={() => router.push("/orders")}>
          Back to My Orders
        </Button>
      </div>
    );
  }

  const orderNumber = `#${String(order.id).slice(-6).toUpperCase()}`;
  const orderStatus = (order.status || "PENDING").toUpperCase();
  // Same rule as the orders list: an unpaid RAZORPAY order never reached the
  // seller, so it reads as cancelled rather than an in-progress order.
  const isUnpaidOnline =
    order.paymentMethod === "RAZORPAY" &&
    orderStatus === "PENDING" &&
    order.paymentStatus !== "COMPLETED";
  const slotLabel = SLOT_LABELS[order.deliverySlot ?? ""] ?? "Standard Delivery";
  const deliveryEtaMinutes = getDeliveryEtaMinutes(
    order,
    selectedLocation?.deliveryTimeMinutes ?? null,
  );
  const itemTotal =
    order.items?.reduce(
      (s, i) => s + i.price * i.quantity,
      0
    ) ?? 0;
  const billDetails = order.billDetails as Record<string, number> | null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* ── Nav ── */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/orders"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Order {orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            at{" "}
            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* ── Animated tracker ── */}
        <OrderTracker
          status={isUnpaidOnline ? "CANCELLED" : order.status}
          cancelNote={
            isUnpaidOnline
              ? "Payment wasn't completed for this order. Any amount deducted will be refunded within 3–5 business days."
              : undefined
          }
          updatedAt={order.updatedAt}
          deliverySlot={order.deliverySlot}
          deliveryMinutes={deliveryEtaMinutes}
          storeName={order.store?.name}
        />

        {/* ── Items ── */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Items in this Order
            </h2>
          </div>
          <div className="divide-y divide-border">
            {order.items?.map((item, idx) => {
              const weightGrams = item.selectedOptions?.weightGrams as
                | number
                | undefined;
              const weightLabel = weightGrams
                ? weightGrams >= 1000
                  ? `${(weightGrams / 1000).toFixed(2)} kg`
                  : `${weightGrams} gm`
                : null;
              const optionParts = [
                item.selectedOptions?.cuttingType,
                item.selectedOptions?.pieceSize,
              ].filter(Boolean);

              return (
                <div key={item.id ?? idx} className="flex items-center gap-4 p-5">
                  {/* Product image */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                    {item.product?.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product?.title || "Product"}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
                      {item.product?.title ||
                        `Product …${item.productId?.slice(-6)}`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {weightLabel ?? `Qty: ${item.quantity}`}
                    </p>
                    {optionParts.length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {optionParts.join(" · ")}
                      </p>
                    )}
                    {item.selectedOptions?.cuttingCharge != null && item.selectedOptions.cuttingCharge > 0 && (
                      <p className="mt-0.5 text-[11px] text-amber-600">
                        ₹{item.selectedOptions.baseRatePerKg}/kg + ₹
                        {item.selectedOptions.cuttingCharge} cut
                        {item.selectedOptions.sizeMultiplier &&
                        item.selectedOptions.sizeMultiplier !== 1
                          ? ` ×${item.selectedOptions.sizeMultiplier}`
                          : ""}{" "}
                        = ₹{item.selectedOptions.effectiveRatePerKg}/kg
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-base font-black text-foreground">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </p>
                    {item.quantity > 1 && !weightLabel && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        ₹{item.price.toFixed(0)} each
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Delivery + Payment ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Delivery */}
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Delivery Details
            </h2>

            {order.deliveryName && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Address
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-relaxed">
                    {order.deliveryName}
                    {order.deliveryPhone && (
                      <>
                        <br />
                        <span className="font-medium text-muted-foreground">
                          {order.deliveryPhone}
                        </span>
                      </>
                    )}
                    <br />
                    {order.deliveryAddress}
                    <br />
                    {[order.deliveryCity, order.deliveryPincode]
                      .filter(Boolean)
                      .join(" – ")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 flex-shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Slot
                </p>
                <p className="mt-0.5 text-sm font-semibold">{slotLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Order Date
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Bill */}
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Bill Details
            </h2>

            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 flex-shrink-0 text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Payment
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {order.paymentMethod === "COD"
                    ? "Pay on Delivery"
                    : order.paymentMethod}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Items Total</span>
                <span>₹{billDetails?.itemTotal ?? itemTotal.toFixed(0)}</span>
              </div>
              {(order.deliveryCharge ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery Charge</span>
                  <span>₹{order.deliveryCharge}</span>
                </div>
              )}
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Discount
                    {order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    −₹{order.discountAmount}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-base font-black text-foreground">
                  Total Paid
                </span>
                <span className="text-2xl font-black text-primary">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Store ── */}
        {order.store?.name && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4">
            <ShoppingBag className="h-4 w-4 flex-shrink-0 text-primary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Fulfilled by
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {order.store.name}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
