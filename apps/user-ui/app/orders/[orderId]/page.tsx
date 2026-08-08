"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Phone,
  MessageCircle,
  Bike,
  XCircle,
} from "lucide-react";
import { useAddressStore } from "@/lib/address-store";
import axiosInstance from "@/utils/axiosInstance";
import { useUserSession } from "@/hooks/useUserSession";
import { useWs } from "@/context/ws-context";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrderTracker } from "./_components/order-tracker";
import { SLOT_LABELS, getDeliveryEtaMinutes } from "./_components/delivery-eta";
import { SupportMessageModal } from "@/components/shared/support-message-modal";
import type { Order } from "@/lib/orders-api";
import { toast } from "sonner";
import { formatOrderId } from "@repo/shared/order-id";
import { buildTelUrl, buildWhatsAppUrl, fillWhatsAppTemplate } from "@repo/shared/whatsapp";
import { CUSTOMER_CANCEL_REASONS } from "@repo/zod-schema";

// Platform-level fallback — used only when the store hasn't configured its
// own support numbers yet (Store Support Configuration, seller-admin).
const FALLBACK_SUPPORT_WHATSAPP = "919999999999";
const FALLBACK_SUPPORT_TEL = "+919999999999";

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
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [cancelNote, setCancelNote] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/order/api/get-order/${orderId}`);
      return data.order as Order;
    },
    enabled: !!orderId && !!user,
  });

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: () =>
      axiosInstance.put(`/order/api/cancel/${orderId}`, {
        reason: cancelReason ?? undefined,
        note: cancelReason === "Other" ? cancelNote.trim() : undefined,
      }),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      setCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Could not cancel order");
    },
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
          We couldn't find order {formatOrderId(orderId)}.
        </p>
        <Button className="mt-6" onClick={() => router.push("/orders")}>
          Back to My Orders
        </Button>
      </div>
    );
  }

  const orderNumber = formatOrderId(order.id);
  const orderStatus = (order.status || "PENDING").toUpperCase();
  // Same rule as the orders list: an unpaid RAZORPAY order never reached the
  // seller, so it reads as cancelled rather than an in-progress order.
  const isUnpaidOnline =
    order.paymentMethod === "RAZORPAY" &&
    orderStatus === "PENDING" &&
    order.paymentStatus !== "COMPLETED";
  const isTerminal = orderStatus === "DELIVERED" || orderStatus === "CANCELLED" || orderStatus === "REJECTED";
  // Self-cancel only before the store starts preparing — matches
  // order-service's cancelOrder guard (PENDING or ACCEPTED).
  const isCancellable = !isUnpaidOnline && (orderStatus === "PENDING" || orderStatus === "ACCEPTED");
  // A completed RAZORPAY payment is the only case where money actually moved
  // before cancellation — COD never charged anything, and an incomplete
  // online payment is the separate isUnpaidOnline case above.
  const wasPaidOnline = order.paymentMethod === "RAZORPAY" && order.paymentStatus === "COMPLETED";
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

  const supportTelUrl = buildTelUrl(order.store?.supportPhone || FALLBACK_SUPPORT_TEL);
  // Built on demand (not eagerly) so the customer's own message — collected
  // by SupportMessageModal — lands in {{CUSTOMER_MESSAGE}} instead of the
  // generic default.
  const buildSupportWhatsAppUrl = (customerMessage?: string) =>
    buildWhatsAppUrl(
      order.store?.whatsappNumber || FALLBACK_SUPPORT_WHATSAPP,
      fillWhatsAppTemplate(order.store?.whatsappMessageTemplate, {
        orderId: orderNumber,
        orderDate: new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: orderStatus,
        storeName: order.store?.name || "our store",
        customerName: order.deliveryName,
        customerPhone: order.deliveryPhone,
        deliveryAddress: [order.deliveryAddress, order.deliveryCity, order.deliveryPincode].filter(Boolean).join(", "),
        items: (order.items || []).map((item) => ({
          name: item.product?.title || "Product",
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        subtotal: billDetails?.itemTotal ?? itemTotal,
        deliveryFee: billDetails?.deliveryCharge ?? order.deliveryCharge ?? 0,
        discount: billDetails?.discount ?? order.discountAmount ?? 0,
        tax: billDetails?.gstAmount ?? 0,
        totalAmount: order.totalAmount,
        customerMessage,
      }),
      order.store?.whatsappLink,
    );

  const handleSendSupportMessage = (message: string) => {
    window.open(buildSupportWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  };

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
              : orderStatus === "CANCELLED" && wasPaidOnline
                ? "This order has been cancelled. Your payment will be refunded within 3–5 business days to your original payment method."
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

        {/* ── Preparation photos ── */}
        {order.preparationPhotos && order.preparationPhotos.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Preparation Photos
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-2 p-5 sm:grid-cols-4">
              {order.preparationPhotos.map((photo, idx) => (
                <div
                  key={photo.publicId ?? idx}
                  className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                >
                  <Image
                    src={photo.url}
                    alt={`Preparation photo ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* ── Assigned rider ── */}
        {order.rider && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-6 py-4">
            <div className="flex items-center gap-3">
              {order.rider.photo?.url ? (
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                  <Image src={order.rider.photo.url} alt={order.rider.name} fill className="object-cover" sizes="40px" />
                </div>
              ) : (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bike className="h-4 w-4 text-primary" />
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Delivery Rider
                </p>
                <p className="mt-0.5 text-sm font-bold text-foreground">{order.rider.name}</p>
                <p className="text-xs text-muted-foreground">
                  {order.rider.vehicleType} · {order.rider.vehicleNumber}
                </p>
              </div>
            </div>
            <a
              href={buildTelUrl(order.rider.phone)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary text-primary transition-colors hover:bg-primary/10"
            >
              <Phone className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* ── Delivery proof (visible until it auto-expires 5 days after upload) ── */}
        {order.deliveryProofPhotoUrl && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Delivery Proof
              </h2>
            </div>
            <div className="p-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={order.deliveryProofPhotoUrl}
                  alt="Delivery proof"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 640px, 100vw"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Cancel order — disabled + explained once PREPARING starts ── */}
        {!isTerminal && !isUnpaidOnline && (
          <div className={isCancellable ? "" : "rounded-2xl border border-border bg-card"}>
            <button
              type="button"
              disabled={!isCancellable}
              onClick={() => setCancelDialogOpen(true)}
              className={
                isCancellable
                  ? "flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                  : "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-muted-foreground cursor-not-allowed"
              }
            >
              <XCircle className="h-4 w-4" />
              Cancel Order
            </button>

            {!isCancellable && (
              <div className="border-t border-border px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Order is already being prepared.
                  <br />
                  Please contact store support for cancellation requests.
                </p>
                <div className="mt-3 flex gap-3">
                  <a
                    href={supportTelUrl}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-muted py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <Phone className="h-4 w-4" />
                    Call Support
                  </a>
                  <a
                    href={buildSupportWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-muted py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Support
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Cancellation details (once CANCELLED) ── */}
        {orderStatus === "CANCELLED" && !isUnpaidOnline && order.cancelledBy && (
          <div className="rounded-2xl border border-border bg-card px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Cancellation Details
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancelled By</span>
                <span className="font-semibold text-foreground">
                  {order.cancelledBy === "CUSTOMER" ? "You" : order.cancelledBy === "SYSTEM" ? "System" : "Store"}
                </span>
              </div>
              {order.cancellationReason && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="text-right font-semibold text-foreground">{order.cancellationReason}</span>
                </div>
              )}
              {order.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-semibold text-foreground">
                    {new Date(order.cancelledAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {order.refundStatus && order.refundStatus !== "NONE" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refund</span>
                  <span
                    className={
                      order.refundStatus === "COMPLETED"
                        ? "font-semibold text-emerald-600"
                        : order.refundStatus === "FAILED"
                          ? "font-semibold text-red-600"
                          : "font-semibold text-primary"
                    }
                  >
                    {order.refundStatus === "REQUESTED"
                      ? "Requested"
                      : order.refundStatus === "PROCESSING"
                        ? "Processing"
                        : order.refundStatus === "COMPLETED"
                          ? "Completed"
                          : "Failed"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Need help ── */}
        <div className="rounded-2xl border border-border bg-card px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Need Help?
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setSupportModalOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary/10 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </button>
            <a
              href={supportTelUrl}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary/10 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Phone className="h-4 w-4" />
              Call Support
            </a>
          </div>
        </div>
      </div>

      <AlertDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) {
            setCancelReason(null);
            setCancelNote("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order?
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              Why are you cancelling? (optional)
            </p>
            <RadioGroup value={cancelReason ?? undefined} onValueChange={setCancelReason}>
              {CUSTOMER_CANCEL_REASONS.map((reason) => (
                <div key={reason} className="flex items-center gap-2">
                  <RadioGroupItem value={reason} id={`cancel-reason-${reason}`} />
                  <Label htmlFor={`cancel-reason-${reason}`} className="cursor-pointer font-normal">
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {cancelReason === "Other" && (
              <Textarea
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder="Tell us more…"
                className="mt-3"
                rows={3}
                maxLength={500}
              />
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              onClick={(e) => {
                e.preventDefault();
                cancelOrder();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isCancelling ? "Cancelling…" : "Yes, Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SupportMessageModal
        open={supportModalOpen}
        onOpenChange={setSupportModalOpen}
        onSend={handleSendSupportMessage}
      />
    </div>
  );
}
