import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusTimeline } from "@/components/order-tracker/StatusTimeline";
import { getDeliveryEtaMinutes } from "@/components/order-tracker/simulation";
import SupportMessageModal from "@/components/shared/support-message-modal";
import { useAddressStore } from "@/lib/address-store";
import { toast } from "@/utils/toast";
import { openWhatsApp } from "@/utils/whatsapp";
import { colors, gradients } from "@/constants/theme";
import { formatDeliveryDateLabel, getScheduledDeliveryDate } from "@/constants/delivery-slots";
import { getOrderStatusLabel, useLiveOrder } from "@/hooks/useLiveOrder";
import OrderConfirmationSkeleton from "@/components/skelton/order-confirmation.skelton";
import { formatOrderId } from "@repo/shared/order-id";
import { buildWhatsAppUrl, fillWhatsAppTemplate } from "@repo/shared/whatsapp";

const PRIMARY = colors.primary;
// Platform-level fallback — used only when the store hasn't configured its
// own WhatsApp number yet (Store Support Configuration, seller-admin).
const FALLBACK_SUPPORT_WHATSAPP = "919999999999";

const SLOT_LABEL: Record<string, string> = {
  instant: "Instant (30–45 mins)",
  morning: "Morning (6 AM – 10 AM)",
  evening: "Evening (5 PM – 9 PM)",
};

// Razorpay's own instrument string (Payment.metadata.method) — the customer
// never needs to know it went through Razorpay, only which rail they used.
const ONLINE_INSTRUMENT_LABEL: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
  emi: "EMI",
};

// order.payments carries every attempt for the order; the instrument is only
// known once a Razorpay webhook/verify callback has stamped metadata.method,
// so fall back to a generic label until then rather than showing "RAZORPAY".
function getPaymentMethodLabel(order: any): string {
  if (order.paymentMethod !== "RAZORPAY") return "Pay on Delivery";
  const method = (order.payments || []).find((p: any) => p.metadata?.method)?.metadata?.method;
  return (method && ONLINE_INSTRUMENT_LABEL[method]) || "Online Payment";
}

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedLocation } = useAddressStore();
  const { order, isLoading } = useLiveOrder(id);
  const insets = useSafeAreaInsets();
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  if (isLoading || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.secondaryBg }}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
        <OrderConfirmationSkeleton />
      </View>
    );
  }

  const shortId = formatOrderId(order.id);
  const slotLabel = SLOT_LABEL[order.deliverySlot || ""] || "Standard Delivery";
  const billDetails = (order.billDetails as Record<string, number> | null) ?? null;
  const createdAt = new Date(order.createdAt);
  const isScheduledSlot = order.deliverySlot === "morning" || order.deliverySlot === "evening";
  const scheduledDeliveryDate = isScheduledSlot
    ? getScheduledDeliveryDate(createdAt, order.deliverySlot)
    : null;
  const scheduledSlotLabel = scheduledDeliveryDate
    ? `${formatDeliveryDateLabel(scheduledDeliveryDate)}, ${slotLabel}`
    : slotLabel;
  const deliveryMinutes = getDeliveryEtaMinutes(order, selectedLocation?.deliveryTimeMinutes);
  const itemCount = order.items?.length ?? 0;
  const totalWeightKg = (order.items || []).reduce((sum: number, item: any) => {
    const grams = item.selectedOptions?.weightGrams;
    return grams ? sum + (grams * item.quantity) / 1000 : sum;
  }, 0);
  const itemTotal = billDetails?.itemTotal ?? order.totalAmount;
  const deliveryCharge = billDetails?.deliveryCharge ?? order.deliveryCharge ?? 0;
  const slotExtraCharge = billDetails?.slotExtraCharge ?? 0;
  const packagingCharge = billDetails?.packagingCharge ?? 0;
  const gstAmount = billDetails?.gstAmount ?? 0;
  const discount = billDetails?.discount ?? order.discountAmount ?? 0;
  const paymentMethodLabel = getPaymentMethodLabel(order);

  // Built on demand (not eagerly) so the customer's own message — collected
  // by SupportMessageModal — lands in {{CUSTOMER_MESSAGE}} instead of the
  // generic default.
  const buildSupportWhatsAppUrl = (customerMessage?: string) =>
    buildWhatsAppUrl(
      order.store?.whatsappNumber || FALLBACK_SUPPORT_WHATSAPP,
      fillWhatsAppTemplate(order.store?.whatsappMessageTemplate, {
        orderId: shortId,
        orderDate: createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: getOrderStatusLabel(order.status),
        storeName: order.store?.name || "our store",
        customerName: order.deliveryName,
        customerPhone: order.deliveryPhone,
        deliveryAddress: [order.deliveryAddress, order.deliveryCity, order.deliveryPincode].filter(Boolean).join(", "),
        items: (order.items || []).map((item: any) => ({
          name: item.product?.title || "Product",
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        subtotal: itemTotal,
        deliveryFee: deliveryCharge,
        discount,
        tax: billDetails?.gstAmount ?? 0,
        totalAmount: order.total ?? order.totalAmount,
        customerMessage,
      }),
      order.store?.whatsappLink,
    );

  const handleSendSupportMessage = (message: string) => {
    openWhatsApp(buildSupportWhatsAppUrl(message));
  };

  const handleCopyOrderId = async () => {
    await Clipboard.setStringAsync(shortId);
    toast.success("Order ID copied");
  };

  const handleShareOrder = async () => {
    try {
      await Share.share({
        message: `My Fish Studio order #${shortId} is confirmed! Total ₹${order.totalAmount}. Track it in the app.`,
      });
    } catch {
      // user dismissed the sheet — ignore
    }
  };

  // No PDF library on mobile — the native share sheet doubles as "view/save invoice".
  const handleViewInvoice = async () => {
    const lines = (order.items || [])
      .map(
        (item: any) =>
          `• ${item.product?.title || "Product"} ×${item.quantity}  ₹${(item.price * item.quantity).toFixed(0)}`,
      )
      .join("\n");
    const invoice =
      `FISH STUDIO — Invoice #${shortId}\n` +
      `${createdAt.toLocaleString("en-IN")}\n\n` +
      `Deliver to:\n${order.deliveryName}\n${order.deliveryAddress}\n${order.deliveryCity} – ${order.deliveryPincode}\n\n` +
      `Items:\n${lines}\n\n` +
      `Item Total: ₹${itemTotal.toFixed(0)}\n` +
      (deliveryCharge > 0 ? `Delivery: ₹${deliveryCharge.toFixed(0)}\n` : "Delivery: FREE\n") +
      (slotExtraCharge > 0 ? `Express Delivery Fee: ₹${slotExtraCharge.toFixed(0)}\n` : "") +
      (packagingCharge > 0 ? `Packaging Charge: ₹${packagingCharge.toFixed(0)}\n` : "") +
      (gstAmount > 0 ? `Taxes (GST): ₹${gstAmount.toFixed(0)}\n` : "") +
      (discount > 0 ? `Discount: −₹${discount.toFixed(0)}\n` : "") +
      `Total Paid: ₹${order.totalAmount}\n` +
      `Payment: ${paymentMethodLabel}\n\n` +
      `Thank you for shopping with Fish Studio.`;
    try {
      await Share.share({ message: invoice });
    } catch {
      // user dismissed the sheet — ignore
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.secondaryBg }}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* ── Purple hero ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={gradients.purple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 56,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            overflow: "hidden",
          }}
        >
          <View>
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 26, color: colors.white, lineHeight: 32 }}>
                  Order Placed{"\n"}Successfully! 🎉
                </Text>
                <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 10, lineHeight: 19 }}>
                  Thank you for choosing FishStudio.{"\n"}We will deliver fresh to your doorstep.
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "flex-start",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 50,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    marginTop: 14,
                  }}
                >
                  <Ionicons name="shield-checkmark-outline" size={13} color={colors.white} />
                  <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 11, color: colors.white, marginLeft: 6 }}>
                    100% Safe & Hygienic Delivery
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setSupportModalVisible(true)}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    borderWidth: 1, borderColor: "rgba(255,255,255,0.4)",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Ionicons name="headset-outline" size={18} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShareOrder}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    borderWidth: 1, borderColor: "rgba(255,255,255,0.4)",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Ionicons name="share-social-outline" size={17} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ alignItems: "center", marginTop: 8 }}>
              <ConfettiCheck />
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, marginTop: -32 }}>
          {/* ── Order ID / Estimated delivery ──────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.white,
              borderRadius: 20,
              padding: 16,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter-Medium", fontSize: 11, color: colors.textMuted }}>Order ID</Text>
              <TouchableOpacity onPress={handleCopyOrderId} style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: colors.textPrimary }}>{shortId}</Text>
                <Ionicons name="copy-outline" size={14} color={colors.textMuted} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                {createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} •{" "}
                {createdAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
              </Text>
            </View>
            <View style={{ backgroundColor: colors.primarySurface, borderRadius: 14, padding: 10, maxWidth: 150 }}>
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(90,44,150,0.12)",
                  borderRadius: 50,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 9, color: PRIMARY }}>
                  Estimated Delivery
                </Text>
              </View>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 12, color: colors.textPrimary }}>
                {order.deliverySlot ? scheduledSlotLabel : `Today, in ~${deliveryMinutes} mins`}
              </Text>
              {order.deliveryCity ? (
                <Text style={{ fontFamily: "Inter-Regular", fontSize: 10, color: colors.textMuted, marginTop: 1 }}>
                  {order.deliveryCity}
                </Text>
              ) : null}
            </View>
          </View>

          {/* ── Order status timeline ───────────────────────────────────── */}
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
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: colors.textPrimary }}>Order Status</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.offerGreen, marginRight: 6 }} />
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: colors.offerGreen }}>
                  {order.status === "CANCELLED" || order.status === "REJECTED" ? "Cancelled" : "Confirmed"}
                </Text>
              </View>
            </View>
            <StatusTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />
          </View>

          {/* ── Order items ─────────────────────────────────────────────── */}
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
                Order Items ({itemCount} Item{itemCount !== 1 ? "s" : ""}
                {totalWeightKg > 0 ? ` • ${totalWeightKg.toFixed(1)} kg` : ""})
              </Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(routes)/order-details/[id]", params: { id: order.id } })}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: PRIMARY }}>View Details</Text>
                <Ionicons name="chevron-forward" size={14} color={PRIMARY} />
              </TouchableOpacity>
            </View>

            {(order.items || []).map((item: any, idx: number) => {
              const weightGrams = item.selectedOptions?.weightGrams as number | undefined;
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
                  key={item.id || idx}
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
                    style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#F3F4F6" }}
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

          {/* ── Delivery details ────────────────────────────────────────── */}
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
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: colors.textPrimary, marginBottom: 14 }}>
              Delivery Details
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center", marginRight: 8 }}>
                  <Ionicons name="location-outline" size={16} color={PRIMARY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: colors.textPrimary }} numberOfLines={1}>
                    {order.deliveryName || "Home"}
                  </Text>
                  <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 16 }}>
                    {order.deliveryAddress}
                    {order.deliveryCity ? `, ${order.deliveryCity}` : ""}
                    {order.deliveryPincode ? ` - ${order.deliveryPincode}` : ""}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center", marginRight: 8 }}>
                  <Ionicons name="time-outline" size={16} color={PRIMARY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: colors.textPrimary }}>Delivery Slot</Text>
                  <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                    {scheduledSlotLabel}
                  </Text>
                </View>
              </View>
            </View>

            {order.deliveryPhone ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#F3F4F6" }}>
                <Ionicons name="call-outline" size={15} color={colors.textMuted} />
                <Text style={{ fontFamily: "Inter-Medium", fontSize: 13, color: colors.textMuted, marginLeft: 8 }}>
                  {order.deliveryName} • {order.deliveryPhone}
                </Text>
              </View>
            ) : null}
          </View>

          {/* ── Payment summary ─────────────────────────────────────────── */}
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
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: colors.textPrimary }}>Payment Summary</Text>
              <TouchableOpacity onPress={handleViewInvoice} style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: PRIMARY, marginRight: 4 }}>
                  View Invoice
                </Text>
                <Ionicons name="download-outline" size={13} color={PRIMARY} />
              </TouchableOpacity>
            </View>

            <SummaryRow label="Item Total" value={`₹${itemTotal.toFixed(0)}`} />
            <SummaryRow
              label="Delivery"
              value={deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(0)}` : "FREE"}
              valueColor={deliveryCharge > 0 ? undefined : colors.offerGreen}
            />
            {slotExtraCharge > 0 && (
              <SummaryRow label="Express Delivery Fee" value={`₹${slotExtraCharge.toFixed(0)}`} />
            )}
            {packagingCharge > 0 && (
              <SummaryRow label="Packaging Charge" value={`₹${packagingCharge.toFixed(0)}`} />
            )}
            {gstAmount > 0 && <SummaryRow label="Taxes (GST)" value={`₹${gstAmount.toFixed(0)}`} />}
            {discount > 0 && (
              <SummaryRow label="Discount" value={`−₹${discount.toFixed(0)}`} valueColor={colors.offerGreen} />
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: colors.hairline,
              }}
            >
              <View>
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: colors.textPrimary }}>
                  Paid Amount
                </Text>
                <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                  via {paymentMethodLabel}
                </Text>
              </View>
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 17, color: PRIMARY }}>
                ₹{order.totalAmount}
              </Text>
            </View>
          </View>

          {/* ── Support banner ──────────────────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.primarySurface,
              borderRadius: 20,
              padding: 16,
              marginTop: 12,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <MaterialCommunityIcons name="shopping-outline" size={22} color={colors.white} />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 13, color: colors.textPrimary }}>
                We care for your satisfaction!
              </Text>
              <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 15 }}>
                If you face any issue with your order, please contact our support team.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSupportModalVisible(true)}
              style={{ borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 50, paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 11, color: PRIMARY }}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              activeOpacity={0.85}
              style={{ flex: 1, borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 50, paddingVertical: 15, alignItems: "center" }}
            >
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 13, color: PRIMARY }}>Continue Shopping</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/(routes)/order-details/[id]", params: { id: order.id } })}
              activeOpacity={0.85}
              style={{ flex: 1, backgroundColor: PRIMARY, borderRadius: 50, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontFamily: "Inter-Bold", fontSize: 13, color: colors.white, marginRight: 6 }}>
                Track My Order
              </Text>
              <Ionicons name="arrow-forward" size={15} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <SupportMessageModal
        visible={supportModalVisible}
        onClose={() => setSupportModalVisible(false)}
        onSend={handleSendSupportMessage}
      />
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
      <Text style={{ fontFamily: "Inter-Regular", fontSize: 12, color: colors.textMuted }}>{label}</Text>
      <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: valueColor || colors.textPrimary }}>
        {value}
      </Text>
    </View>
  );
}

// White circle with an animated purple checkmark and a scatter of confetti
// bits — the celebratory beat the mockup opens with.
const CONFETTI = [
  { top: 6, left: 18, color: "#FDE68A", size: 8, rotate: "15deg" },
  { top: 40, left: 4, color: "#F472B6", size: 7, rotate: "-10deg" },
  { top: 10, right: 14, color: "#67E8F9", size: 6, rotate: "30deg" },
  { top: 60, right: 22, color: "#FCA5A5", size: 8, rotate: "-20deg" },
  { top: 90, left: 10, color: "#FDBA74", size: 6, rotate: "10deg" },
  { top: 100, right: 6, color: "#FDE68A", size: 7, rotate: "-15deg" },
];

function ConfettiCheck() {
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(circleScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.spring(checkScale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
    ]).start();

    const loop = Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [circleScale, checkScale, ring]);

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.6] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  return (
    <View style={{ width: 130, height: 130, alignItems: "center", justifyContent: "center" }}>
      {CONFETTI.map((c, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            top: c.top,
            left: c.left,
            right: c.right,
            width: c.size,
            height: c.size,
            borderRadius: c.size / 3,
            backgroundColor: c.color,
            transform: [{ rotate: c.rotate }],
          }}
        />
      ))}
      <Animated.View
        style={{
          position: "absolute",
          width: 92,
          height: 92,
          borderRadius: 46,
          backgroundColor: colors.white,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      <Animated.View
        style={{
          width: 92,
          height: 92,
          borderRadius: 46,
          backgroundColor: colors.white,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: circleScale }],
        }}
      >
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <Ionicons name="checkmark-sharp" size={48} color={PRIMARY} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
