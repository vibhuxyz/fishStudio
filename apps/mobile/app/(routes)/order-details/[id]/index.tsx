import { Ionicons } from "@expo/vector-icons";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { colors } from "@/constants/theme";
import { DeliveryMap } from "@/components/order-tracker/DeliveryMap";
import { StatusTimeline } from "@/components/order-tracker/StatusTimeline";
import { getDeliveryEtaMinutes } from "@/components/order-tracker/simulation";
import SupportMessageModal from "@/components/shared/support-message-modal";
import CancelOrderModal from "@/components/shared/cancel-order-modal";
import { Order } from "@/constants/order";
import { useAddressStore } from "@/lib/address-store";
import { getOrderStatusLabel, useLiveOrder } from "@/hooks/useLiveOrder";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { formatOrderId } from "@repo/shared/order-id";
import { buildTelUrl, buildWhatsAppUrl, fillWhatsAppTemplate } from "@repo/shared/whatsapp";

const PRIMARY = colors.primary;
// Platform-level fallback — used only when the store hasn't configured its
// own support numbers yet (Store Support Configuration, seller-admin).
const FALLBACK_SUPPORT_WHATSAPP = "919999999999";
const FALLBACK_SUPPORT_TEL = "+919999999999";

const SLOT_LABEL: Record<string, string> = {
  instant: "Instant (30–45 mins)",
  morning: "Morning (6 AM – 10 AM)",
  evening: "Evening (5 PM – 9 PM)",
};

// Per-status hero content. SHIPPED is the only one with a live map + rider
// contact — every other state just needs a headline, since there's nothing
// "out for delivery" to show yet, or nothing left to track once it's over.
const HERO_CONTENT: Record<
  string,
  { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; tint: string; text: string }
> = {
  PENDING: {
    title: "Order Confirmed",
    subtitle: "We've received your order and will start preparing it shortly.",
    icon: "receipt-outline",
    tint: colors.primarySurface,
    text: PRIMARY,
  },
  ACCEPTED: {
    title: "Preparing Your Order",
    subtitle: "Freshly cut and packed just for you.",
    icon: "cube-outline",
    tint: colors.primarySurface,
    text: PRIMARY,
  },
  PREPARING: {
    title: "Preparing Your Order",
    subtitle: "Freshly cut and packed just for you.",
    icon: "cube-outline",
    tint: colors.primarySurface,
    text: PRIMARY,
  },
  READY_FOR_PICKUP: {
    title: "Packed and Ready",
    subtitle: "Your order is packed and waiting for a delivery rider.",
    icon: "bag-check-outline",
    tint: colors.primarySurface,
    text: PRIMARY,
  },
  ASSIGNED_TO_RIDER: {
    title: "Rider On the Way to Store",
    subtitle: "A delivery rider has been assigned and is heading to pick up your order.",
    icon: "bicycle-outline",
    tint: colors.primarySurface,
    text: PRIMARY,
  },
  SHIPPED: {
    title: "Out for Delivery",
    subtitle: "Your order is on the way!",
    icon: "bicycle-outline",
    tint: colors.primarySurface,
    text: PRIMARY,
  },
  DELIVERED: {
    title: "Delivered",
    subtitle: "Enjoy your fresh order!",
    icon: "checkmark-circle-outline",
    tint: colors.successSurface,
    text: colors.success,
  },
  CANCELLED: {
    title: "Order Cancelled",
    subtitle: "This order has been cancelled.",
    icon: "close-circle-outline",
    tint: "#FEE2E2",
    text: colors.danger,
  },
  REJECTED: {
    title: "Order Rejected",
    subtitle: "This order was rejected by the store.",
    icon: "close-circle-outline",
    tint: "#FEE2E2",
    text: colors.danger,
  },
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedLocation } = useAddressStore();

  const liveOrder = useLiveOrder(id);
  const order = liveOrder.order as Order | undefined;
  const { isLoading } = liveOrder;
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: ({ reason, note }: { reason?: string; note?: string }) =>
      axiosInstance.put(`/order/api/cancel/${id}`, { reason, note }),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      setCancelModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Could not cancel order");
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.secondaryBg }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <Header title="Order Details" orderId={undefined} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ fontFamily: "Inter-Medium", fontSize: 14, color: colors.textMuted, marginTop: 16 }}>
            Loading order details…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.secondaryBg }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <Header title="Order Details" orderId={undefined} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="alert-circle-outline" size={56} color={colors.textMuted} />
          <Text style={{ fontFamily: "Inter-Medium", fontSize: 15, color: colors.textMuted, marginTop: 16 }}>
            Order not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const rawStatus = (order.status || "PENDING").toUpperCase();
  // A RAZORPAY order still sitting PENDING never got a completed payment —
  // the seller never saw it, so it reads as cancelled rather than "in progress".
  // COD is exempt: PENDING there just means payment is due on delivery.
  const isUnpaidOnline =
    order.paymentMethod === "RAZORPAY" &&
    rawStatus === "PENDING" &&
    order.paymentStatus !== "COMPLETED";
  const upperStatus = isUnpaidOnline ? "CANCELLED" : rawStatus;
  const isShipped = upperStatus === "SHIPPED";
  const isTerminal = upperStatus === "DELIVERED" || upperStatus === "CANCELLED" || upperStatus === "REJECTED";
  // Self-cancel only before the store starts preparing — matches
  // order-service's cancelOrder guard (PENDING or ACCEPTED).
  const isCancellable = !isUnpaidOnline && (upperStatus === "PENDING" || upperStatus === "ACCEPTED");
  const isPastCancellableWindow = !isTerminal && !isUnpaidOnline && !isCancellable;
  // A completed RAZORPAY payment is the only case where money actually moved
  // before cancellation — COD never charged anything, and an incomplete
  // online payment is the separate isUnpaidOnline case handled below.
  const wasPaidOnline = order.paymentMethod === "RAZORPAY" && order.paymentStatus === "COMPLETED";
  const hero = isUnpaidOnline
    ? {
        ...HERO_CONTENT.CANCELLED,
        subtitle:
          "Payment wasn't completed for this order. Any amount deducted will be refunded within 3–5 business days.",
      }
    : upperStatus === "CANCELLED" && wasPaidOnline
      ? {
          ...HERO_CONTENT.CANCELLED,
          subtitle:
            "This order has been cancelled. Your payment will be refunded within 3–5 business days to your original payment method.",
        }
      : HERO_CONTENT[upperStatus] ?? HERO_CONTENT.PENDING;
  const shortId = formatOrderId(order.id);
  const slotLabel = SLOT_LABEL[order.deliverySlot || ""] || "Standard Delivery";
  const deliveryMinutes = getDeliveryEtaMinutes(order, selectedLocation?.deliveryTimeMinutes);
  const sellerPhone = order.store?.sellerPhone;
  // Once a real rider is assigned, that's who "Call Rider" should actually
  // reach — before that (or if the store never uses rider assignment), the
  // seller's own number is the fallback, same as it always was.
  const riderCallPhone = order.rider?.phone || sellerPhone;

  const handleCallRider = () => {
    if (riderCallPhone) Linking.openURL(buildTelUrl(riderCallPhone));
  };

  const billDetails = order.billDetails;
  const itemsSubtotal = (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);

  const supportTelUrl = buildTelUrl(order.store?.supportPhone || sellerPhone || FALLBACK_SUPPORT_TEL);
  // Built on demand (not eagerly) so the customer's own message — collected
  // by SupportMessageModal — lands in {{CUSTOMER_MESSAGE}} instead of the
  // generic default.
  const buildSupportWhatsAppUrl = (customerMessage?: string) =>
    buildWhatsAppUrl(
      order.store?.whatsappNumber || FALLBACK_SUPPORT_WHATSAPP,
      fillWhatsAppTemplate(order.store?.whatsappMessageTemplate, {
        orderId: shortId,
        orderDate: new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: getOrderStatusLabel(upperStatus),
        storeName: order.store?.name || "our store",
        customerName: order.deliveryName,
        customerPhone: order.deliveryPhone,
        deliveryAddress: [order.deliveryAddress, order.deliveryCity, order.deliveryPincode].filter(Boolean).join(", "),
        items: (order.items || []).map((item) => ({
          name: item.product?.title || "Product",
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        subtotal: billDetails?.itemTotal ?? itemsSubtotal,
        deliveryFee: billDetails?.deliveryCharge ?? order.deliveryCharge ?? 0,
        discount: billDetails?.discount ?? order.discountAmount ?? 0,
        tax: billDetails?.gstAmount ?? 0,
        totalAmount: order.total ?? order.totalAmount,
        customerMessage,
      }),
      order.store?.whatsappLink,
    );

  const handleSendSupportMessage = (message: string) => {
    Linking.openURL(buildSupportWhatsAppUrl(message));
  };

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.secondaryBg }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header title={isTerminal ? "Order Details" : "Track My Order"} orderId={shortId} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* ── Status hero ─────────────────────────────────────────────── */}
        <View style={{ backgroundColor: hero.tint, borderRadius: 20, padding: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 19, color: hero.text }}>{hero.title}</Text>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: colors.textMuted, marginTop: 3 }}>
                {hero.subtitle}
              </Text>
              {!isTerminal && (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                  <Ionicons name="location-outline" size={14} color={hero.text} />
                  <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: hero.text, marginLeft: 4 }}>
                    {isShipped ? `Arriving in ~${deliveryMinutes} min` : slotLabel}
                  </Text>
                </View>
              )}
              {upperStatus === "DELIVERED" && (
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: hero.text, marginTop: 10 }}>
                  Delivered on {new Date(order.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </Text>
              )}
            </View>
            <View
              style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: colors.white,
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name={hero.icon} size={26} color={hero.text} />
            </View>
          </View>
        </View>

        {/* ── Status timeline ─────────────────────────────────────────── */}
        {!(upperStatus === "CANCELLED" || upperStatus === "REJECTED") && (
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 20,
              padding: 16,
              marginTop: 12,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <StatusTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />
          </View>
        )}

        {/* ── Call rider banner (ASSIGNED_TO_RIDER + SHIPPED) ──────────── */}
        {(upperStatus === "ASSIGNED_TO_RIDER" || isShipped) && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.primarySurface,
              borderRadius: 16,
              padding: 14,
              marginTop: 12,
            }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              <Ionicons name="bicycle" size={17} color={colors.white} />
            </View>
            <Text style={{ flex: 1, fontFamily: "Inter-Medium", fontSize: 11, color: PRIMARY, lineHeight: 15 }}>
              {isShipped
                ? "Our delivery partner is on the way. You will receive a call before delivery."
                : "Our delivery partner is heading to the store to pick up your order."}
            </Text>
            {riderCallPhone ? (
              <TouchableOpacity
                onPress={handleCallRider}
                style={{
                  flexDirection: "row", alignItems: "center",
                  borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 50,
                  paddingHorizontal: 12, paddingVertical: 7, marginLeft: 8,
                }}
              >
                <Ionicons name="call-outline" size={13} color={PRIMARY} />
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 11, color: PRIMARY, marginLeft: 5 }}>
                  Call Rider
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* ── Delivery partner card (whenever a real rider is assigned) ── */}
        {order.rider && (upperStatus === "ASSIGNED_TO_RIDER" || isShipped) && (
          <DeliveryPartnerCard rider={order.rider} onCall={handleCallRider} />
        )}

        {/* ── Live map (SHIPPED only) ───────────────────────────────────── */}
        {isShipped && (
          <View style={{ marginTop: 12 }}>
            <DeliveryMap
              deliveryMinutes={deliveryMinutes}
              storeName={order.store?.name}
              updatedAt={order.updatedAt}
            />
          </View>
        )}

        {/* ── Order items ──────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: 20,
            padding: 16,
            marginTop: 12,
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 1,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: colors.textPrimary }}>
              Order Items ({order.items?.length ?? 0})
            </Text>
            <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 50, backgroundColor: colors.secondaryBg }}>
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 10, color: colors.textMuted }}>
                {getOrderStatusLabel(upperStatus)}
              </Text>
            </View>
          </View>

          {(order.items || []).map((item, idx) => {
            const weightGrams = item.selectedOptions?.weightGrams;
            const weightLabel = weightGrams
              ? weightGrams >= 1000
                ? `${(weightGrams / 1000).toFixed(2)} kg`
                : `${weightGrams} g`
              : null;
            const optionsLine = [item.selectedOptions?.cuttingType, item.selectedOptions?.pieceSize]
              .filter(Boolean)
              .join(" • ");

            return (
              <View
                key={item.id ?? idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: idx > 0 ? 14 : 0,
                  paddingTop: idx > 0 ? 14 : 0,
                  borderTopWidth: idx > 0 ? 1 : 0,
                  borderTopColor: "#F3F4F6",
                }}
              >
                <Image
                  source={{ uri: cloudinaryThumbnail(item.product?.images?.[0]?.url, 104) || "https://via.placeholder.com/56" }}
                  style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: colors.secondaryBg }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: colors.textPrimary }} numberOfLines={1}>
                    {item.product?.title || "Product"}
                  </Text>
                  <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {weightLabel || `Qty ${item.quantity}`}
                  </Text>
                  {optionsLine ? (
                    <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
                      {optionsLine}
                    </Text>
                  ) : null}
                  {item.selectedOptions?.cuttingCharge != null && item.selectedOptions.cuttingCharge > 0 && (
                    <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: "#D97706", marginTop: 1 }}>
                      ₹{item.selectedOptions.baseRatePerKg}/kg + ₹{item.selectedOptions.cuttingCharge} cut
                      {item.selectedOptions.sizeMultiplier && item.selectedOptions.sizeMultiplier !== 1
                        ? ` ×${item.selectedOptions.sizeMultiplier}`
                        : ""}
                      {" = "}₹{item.selectedOptions.effectiveRatePerKg}/kg
                    </Text>
                  )}
                </View>
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: colors.textPrimary }}>
                  ₹{(item.price * item.quantity).toFixed(0)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── Info chips ───────────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <InfoChip icon="time-outline" label="Delivery Slot" value={slotLabel} />
          <InfoChip
            icon="location-outline"
            label="Delivery Address"
            value={`${order.deliveryCity || ""}${order.deliveryPincode ? ` - ${order.deliveryPincode}` : ""}`}
          />
          <InfoChip icon="shield-checkmark-outline" label="100% Safe Delivery" value="Hygiene followed" tint={colors.successSurface} iconColor={colors.success} />
        </View>

        {/* ── Cancel order — disabled + explained once PREPARING starts ── */}
        {!isTerminal && !isUnpaidOnline && (
          <View
            style={{
              backgroundColor: isCancellable ? "#FEE2E2" : colors.white,
              borderWidth: 1,
              borderColor: isCancellable ? "#FCA5A5" : "#F3F4F6",
              borderRadius: 16,
              padding: isCancellable ? 0 : 16,
              marginTop: 12,
              shadowColor: isCancellable ? undefined : "#000",
              shadowOpacity: isCancellable ? undefined : 0.04,
              shadowRadius: isCancellable ? undefined : 8,
              elevation: isCancellable ? undefined : 1,
            }}
          >
            <TouchableOpacity
              disabled={isCancelling || !isCancellable}
              onPress={() => setCancelModalVisible(true)}
              activeOpacity={0.85}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 14,
                opacity: isCancelling ? 0.6 : 1,
              }}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <>
                  <Ionicons
                    name="close-circle-outline"
                    size={17}
                    color={isCancellable ? colors.danger : colors.textMuted}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter-SemiBold",
                      fontSize: 13,
                      color: isCancellable ? colors.danger : colors.textMuted,
                      marginLeft: 8,
                    }}
                  >
                    Cancel Order
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {!isCancellable && (
              <>
                <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />
                <View style={{ paddingTop: 12 }}>
                  <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: colors.textMuted, lineHeight: 17 }}>
                    Order is already being prepared.{"\n"}Please contact store support for cancellation requests.
                  </Text>
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(supportTelUrl)}
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.secondaryBg, borderRadius: 50, paddingVertical: 11 }}
                    >
                      <Ionicons name="call-outline" size={14} color={PRIMARY} />
                      <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: PRIMARY, marginLeft: 6 }}>Call Support</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(buildSupportWhatsAppUrl())}
                      style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.secondaryBg, borderRadius: 50, paddingVertical: 11 }}
                    >
                      <Ionicons name="logo-whatsapp" size={14} color={PRIMARY} />
                      <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: PRIMARY, marginLeft: 6 }}>WhatsApp Support</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* ── Cancellation details (once CANCELLED) ─────────────────────── */}
        {upperStatus === "CANCELLED" && !isUnpaidOnline && order.cancelledBy && (
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 20,
              padding: 16,
              marginTop: 12,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 13, color: colors.textPrimary, marginBottom: 10 }}>
              Cancellation Details
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: colors.textMuted }}>Cancelled By</Text>
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: colors.textPrimary }}>
                {order.cancelledBy === "CUSTOMER" ? "You" : order.cancelledBy === "SYSTEM" ? "System" : "Store"}
              </Text>
            </View>
            {order.cancellationReason && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: colors.textMuted }}>Reason</Text>
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: colors.textPrimary, flexShrink: 1, textAlign: "right" }}>
                  {order.cancellationReason}
                </Text>
              </View>
            )}
            {order.cancelledAt && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: colors.textMuted }}>Time</Text>
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: colors.textPrimary }}>
                  {new Date(order.cancelledAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            )}
            {order.refundStatus && order.refundStatus !== "NONE" && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: colors.textMuted }}>Refund</Text>
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: order.refundStatus === "COMPLETED" ? colors.success : order.refundStatus === "FAILED" ? colors.danger : PRIMARY }}>
                  {order.refundStatus === "REQUESTED" ? "Requested" : order.refundStatus === "PROCESSING" ? "Processing" : order.refundStatus === "COMPLETED" ? "Completed" : "Failed"}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Need help ────────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: colors.primarySurface,
            borderRadius: 20,
            padding: 16,
            marginTop: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
              <Ionicons name="headset-outline" size={18} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: colors.textPrimary }}>Need Help?</Text>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                Our support team is available 7 AM – 11 PM
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => setSupportModalVisible(true)}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderRadius: 50, paddingVertical: 11 }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={PRIMARY} />
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: PRIMARY, marginLeft: 6 }}>Chat with Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(supportTelUrl)}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderRadius: 50, paddingVertical: 11 }}
            >
              <Ionicons name="call-outline" size={14} color={PRIMARY} />
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: PRIMARY, marginLeft: 6 }}>Call Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.textMuted} />
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: colors.textMuted, marginLeft: 6 }}>
            Your data is safe and encrypted
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.85}
          style={{ backgroundColor: PRIMARY, borderRadius: 50, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20 }}
        >
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: colors.white, marginRight: 6 }}>
            Back to Home
          </Text>
          <Ionicons name="arrow-forward" size={15} color={colors.white} />
        </TouchableOpacity>
      </ScrollView>

      <SupportMessageModal
        visible={supportModalVisible}
        onClose={() => setSupportModalVisible(false)}
        onSend={handleSendSupportMessage}
      />

      <CancelOrderModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        isSubmitting={isCancelling}
        onConfirm={(reason, note) => cancelOrder({ reason, note })}
      />
    </SafeAreaView>
  );
}

function Header({ title, orderId }: { title: string; orderId?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingTop: insets.top + 14,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 17, color: colors.textPrimary }}>{title}</Text>
          {orderId ? (
            <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
              Order ID: {orderId}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="shield-checkmark-outline" size={13} color={PRIMARY} />
        <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 9, color: PRIMARY, marginLeft: 4, maxWidth: 70, lineHeight: 12 }}>
          100% Safe & Hygienic Delivery
        </Text>
      </View>
    </View>
  );
}

const VEHICLE_TYPE_LABEL: Record<string, string> = {
  BIKE: "Bike",
  SCOOTER: "Scooter",
  BICYCLE: "Bicycle",
  OTHER: "Vehicle",
};

function DeliveryPartnerCard({
  rider,
  onCall,
}: {
  rider: NonNullable<Order["rider"]>;
  onCall: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 16,
        marginTop: 12,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
      }}
    >
      <Text style={{ fontFamily: "Inter-Bold", fontSize: 13, color: colors.textPrimary, marginBottom: 12 }}>
        Delivery Partner
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {rider.avatar?.url ? (
          <Image
            source={{ uri: cloudinaryThumbnail(rider.avatar.url, 112) || rider.avatar.url }}
            style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.secondaryBg }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: colors.primarySurface,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="person" size={24} color={PRIMARY} />
          </View>
        )}

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: colors.textPrimary }} numberOfLines={1}>
            {rider.name}
          </Text>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
            Your delivery partner
          </Text>
          <TouchableOpacity onPress={onCall} style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Ionicons name="call-outline" size={12} color={PRIMARY} />
            <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 11, color: PRIMARY, marginLeft: 4 }}>
              {rider.phone}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: colors.secondaryBg,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 8,
            alignItems: "flex-end",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="bicycle-outline" size={12} color={colors.textMuted} />
            <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 10, color: colors.textPrimary, marginLeft: 4 }}>
              {VEHICLE_TYPE_LABEL[rider.vehicleType] ?? rider.vehicleType}
            </Text>
          </View>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 9, color: colors.textMuted, marginTop: 2 }}>
            {rider.vehicleNumber}
          </Text>
        </View>
      </View>
    </View>
  );
}

function InfoChip({
  icon,
  label,
  value,
  tint,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tint?: string;
  iconColor?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 12,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: tint || colors.primarySurface, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <Ionicons name={icon} size={13} color={iconColor || PRIMARY} />
      </View>
      <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 10, color: colors.textPrimary }} numberOfLines={1}>
        {label}
      </Text>
      <Text style={{ fontFamily: "Inter-Regular", fontSize: 9, color: colors.textMuted, marginTop: 1 }} numberOfLines={1}>
        {value || "—"}
      </Text>
    </View>
  );
}
