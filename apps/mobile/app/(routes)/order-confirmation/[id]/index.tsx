import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OrderTracker, getDeliveryEtaMinutes } from "@/components/order-tracker";
import { useAddressStore } from "@/lib/address-store";
import { LiveOrderBadge } from "@/components/live-order-badge";
import { getOrderStatusLabel, useLiveOrder } from "@/hooks/useLiveOrder";

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; icon: string; label: string }
> = {
  PENDING: { bg: "#FEF3C7", text: "#D97706", icon: "time-outline", label: "Order Placed" },
  ACCEPTED: {
    bg: "#DBEAFE",
    text: "#2563EB",
    icon: "checkmark-circle-outline",
    label: "Preparing",
  },
  SHIPPED: { bg: "#EDE9FE", text: "#5A2C96", icon: "car-outline", label: "On the Way" },
  DELIVERED: {
    bg: "#D1FAE5",
    text: "#059669",
    icon: "bag-check-outline",
    label: "Delivered",
  },
  REJECTED: {
    bg: "#FEE2E2",
    text: "#DC2626",
    icon: "close-circle-outline",
    label: "Rejected",
  },
  CANCELLED: {
    bg: "#F3F4F6",
    text: "#6B7280",
    icon: "ban-outline",
    label: "Cancelled",
  },
};

const SLOT_LABEL: Record<string, string> = {
  instant: "⚡ Instant (30–45 mins)",
  morning: "🌅 Morning (6 AM – 10 AM)",
  evening: "🌆 Evening (5 PM – 9 PM)",
};

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedLocation } = useAddressStore();

  const {
    order,
    isLoading,
    isFetching,
    isRealtimeConnected,
    lastLiveUpdateAt,
  } = useLiveOrder(id);

  if (isLoading || !order) {
    return (
      <SafeAreaView className="flex-1 pt-12 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5A2C96" />
          <Text className="text-gray-500 font-poppins-medium mt-4">
            Loading your order…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const shortId = String(order.id).slice(-6).toUpperCase();
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const slotLabel = SLOT_LABEL[order.deliverySlot] || "Standard Delivery";
  const billDetails = (order.billDetails as Record<string, number> | null) ?? null;
  const createdAt = new Date(order.createdAt);
  const deliveryMinutes = getDeliveryEtaMinutes(order, selectedLocation?.deliveryTimeMinutes);

  // Share Order — native share sheet with a deep link to the order.
  const handleShareOrder = async () => {
    try {
      await Share.share({
        message: `My Fish Studio order #${shortId} is confirmed! Total ₹${order.totalAmount}. Track it in the app.`,
      });
    } catch {
      // user dismissed the sheet — ignore
    }
  };

  // Download Invoice — no PDF lib on mobile, so we share a formatted invoice
  // summary through the native sheet (user can save it / send to print).
  const handleDownloadInvoice = async () => {
    const lines = (order.items || [])
      .map(
        (item: any) =>
          `• ${item.product?.title || "Product"} ×${item.quantity}  ₹${(
            item.price * item.quantity
          ).toFixed(0)}`,
      )
      .join("\n");
    const invoice =
      `FISH STUDIO — Invoice #${shortId}\n` +
      `${createdAt.toLocaleString("en-IN")}\n\n` +
      `Deliver to:\n${order.deliveryName}\n${order.deliveryAddress}\n${order.deliveryCity} – ${order.deliveryPincode}\n\n` +
      `Items:\n${lines}\n\n` +
      `Total Paid: ₹${order.totalAmount}\n` +
      `Payment: ${order.paymentMethod === "COD" ? "Pay on Delivery" : order.paymentMethod}\n\n` +
      `Thank you for shopping with Fish Studio.`;
    try {
      await Share.share({ message: invoice });
    } catch {
      // user dismissed the sheet — ignore
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 pt-12 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(routes)/my-orders")}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="bag-handle-outline" size={18} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success header (animated) */}
        <View className="items-center mt-4 mb-6">
          <AnimatedSuccessCheck />
          <Text
            className="mt-4 text-emerald-500 uppercase tracking-widest text-[28px] italic"
            style={{
              fontFamily: "Inter-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
          >
            Order Confirmed!
          </Text>
          <Text className="text-gray-600 font-poppins-medium text-sm text-center mt-1.5 px-4">
            Your order{" "}
            <Text
              className="text-gray-900"
              style={{
                fontFamily: "Inter-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              #{shortId}
            </Text>{" "}
            has been placed successfully.
          </Text>

          {/* Delivery time highlight */}
          <View
            className="flex-row items-center mt-3 px-3.5 py-1.5 rounded-full"
            style={{ backgroundColor: "#EDE9FE" }}
          >
            <Ionicons name="time-outline" size={15} color="#5A2C96" />
            <Text
              className="ml-1.5 text-xs"
              style={{
                color: "#5A2C96",
                fontFamily: "Inter-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              {deliveryMinutes ? `Arriving in ~${deliveryMinutes} mins` : slotLabel}
            </Text>
          </View>
        </View>

        {/* Live order tracker */}
        <View className="mb-3">
          <LiveOrderBadge
            connected={isRealtimeConnected}
            isFetching={isFetching}
            lastLiveUpdateAt={lastLiveUpdateAt}
          />
          <OrderTracker
            status={order.status}
            updatedAt={order.updatedAt}
            deliverySlot={order.deliverySlot}
            deliveryMinutes={deliveryMinutes}
            storeName={order.store?.name}
          />
        </View>

        {/* Order meta card */}
        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <MetaRow
            icon={<Ionicons name="calendar-outline" size={18} color="#5A2C96" />}
            label="ORDER PLACED"
            value={`${createdAt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })} at ${createdAt.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
          />
          <MetaRow
            icon={<Ionicons name="location-outline" size={18} color="#5A2C96" />}
            label="DELIVERING TO"
            value={`${order.deliveryName}\n${order.deliveryAddress}\n${order.deliveryCity} – ${order.deliveryPincode}`}
            multiline
          />
          <MetaRow
            icon={<Ionicons name="car-outline" size={18} color="#5A2C96" />}
            label="DELIVERY SLOT"
            value={slotLabel}
          />
          <MetaRow
            icon={<MaterialCommunityIcons name="credit-card-outline" size={18} color="#5A2C96" />}
            label="PAYMENT"
            value={
              order.paymentMethod === "COD" ? "Pay on Delivery" : order.paymentMethod
            }
          />

          <View className="flex-row items-start mt-2">
            <View className="w-10 items-center mt-0.5">
              <Ionicons name={statusCfg.icon as any} size={18} color={statusCfg.text} />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-poppins-bold text-gray-400 tracking-widest">
                ORDER STATUS
              </Text>
              <View
                className="self-start mt-1 px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: statusCfg.bg }}
              >
                <Text
                  className="text-xs font-poppins-bold"
                  style={{ color: statusCfg.text }}
                >
                  {getOrderStatusLabel(order.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order items card */}
        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <Text className="text-[10px] font-poppins-bold text-gray-400 tracking-widest mb-3">
            ORDER ITEMS
          </Text>
          {(order.items || []).map((item: any, idx: number) => {
            const weightGrams = item.selectedOptions?.weightGrams as number | undefined;
            const weightLabel = weightGrams
              ? weightGrams >= 1000
                ? `${(weightGrams / 1000).toFixed(2)} kg`
                : `${weightGrams} gm`
              : null;
            const cutting = item.selectedOptions?.cuttingType;
            const piece = item.selectedOptions?.pieceSize;
            const optionsLine = [cutting, piece].filter(Boolean).join(" · ");

            return (
              <View
                key={item.id || idx}
                className={`flex-row items-center ${idx > 0 ? "border-t border-gray-100 pt-3 mt-3" : ""}`}
              >
                {item.product?.images?.[0]?.url && (
                  <Image
                    source={{ uri: item.product.images[0].url }}
                    className="w-12 h-12 rounded-xl bg-gray-100"
                    resizeMode="cover"
                  />
                )}
                <View className="flex-1 ml-3">
                  <Text
                    className="text-sm text-gray-900 font-poppins-bold"
                    numberOfLines={1}
                  >
                    {item.product?.title || "Product"}
                  </Text>
                  {optionsLine ? (
                    <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                      {optionsLine}
                    </Text>
                  ) : null}
                  <Text className="text-xs text-gray-600 font-poppins-medium mt-0.5">
                    {weightLabel || `Qty: ${item.quantity}`}
                  </Text>
                </View>
                <Text
                  className="text-sm text-gray-900"
                  style={{
                    fontFamily: "Inter-Bold",
                    fontWeight: Platform.OS === "android" ? "700" : "normal",
                  }}
                >
                  ₹{(item.price * item.quantity).toFixed(0)}
                </Text>
              </View>
            );
          })}

          <View className="border-t border-gray-100 mt-4 pt-3">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-xs text-gray-500 font-poppins-medium">Items Total</Text>
              <Text className="text-xs text-gray-700 font-poppins-medium">
                ₹{billDetails?.itemTotal ?? 0}
              </Text>
            </View>
            <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
              <Text
                className="text-primary uppercase italic"
                style={{
                  fontFamily: "Inter-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
              >
                TOTAL PAID
              </Text>
              <Text
                className="text-2xl text-primary"
                style={{
                  fontFamily: "Inter-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
              >
                ₹{order.totalAmount}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="mt-4 gap-3">
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            className="py-4 rounded-full flex-row items-center justify-center"
            style={{ backgroundColor: "#10B981" }}
            activeOpacity={0.85}
          >
            <Text
              className="text-white text-base mr-2"
              style={{
                fontFamily: "Inter-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              Continue Shopping
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/(routes)/order-details/${order.id}` as any)}
            className="py-4 rounded-full flex-row items-center justify-center"
            style={{ backgroundColor: "#5A2C96" }}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate-outline" size={18} color="#fff" />
            <Text
              className="text-white text-base ml-2"
              style={{
                fontFamily: "Inter-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              Track Order
            </Text>
          </TouchableOpacity>

          {/* Secondary row */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleDownloadInvoice}
              className="flex-1 py-3.5 rounded-full border border-gray-200 flex-row items-center justify-center"
              activeOpacity={0.85}
            >
              <Ionicons name="download-outline" size={17} color="#1F2937" />
              <Text
                className="text-gray-900 text-sm ml-1.5"
                style={{
                  fontFamily: "Inter-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
              >
                Invoice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShareOrder}
              className="flex-1 py-3.5 rounded-full border border-gray-200 flex-row items-center justify-center"
              activeOpacity={0.85}
            >
              <Ionicons name="share-social-outline" size={17} color="#1F2937" />
              <Text
                className="text-gray-900 text-sm ml-1.5"
                style={{
                  fontFamily: "Inter-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(routes)/my-orders")}
            className="py-3 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="bag-handle-outline" size={16} color="#6B7280" />
            <Text className="text-gray-500 text-sm ml-1.5 font-poppins-medium">
              View My Orders
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Animated success badge: the green circle springs in, the check scales up,
// and a soft ring pulses outward on a loop. Uses RN's built-in Animated so it
// needs no extra native module.
function AnimatedSuccessCheck() {
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(circleScale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();

    const loop = Animated.loop(
      Animated.timing(ring, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [circleScale, checkScale, ring]);

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.8] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View className="w-24 h-24 items-center justify-center">
      <Animated.View
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "#10B981",
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      <Animated.View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "#10B981",
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: circleScale }],
        }}
      >
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <Ionicons name="checkmark-sharp" size={46} color="#fff" />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function MetaRow({
  icon,
  label,
  value,
  multiline = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View className="flex-row items-start mb-4">
      <View className="w-10 items-center mt-0.5">{icon}</View>
      <View className="flex-1">
        <Text className="text-[10px] font-poppins-bold text-gray-400 tracking-widest">
          {label}
        </Text>
        <Text
          className="text-sm text-gray-900 font-poppins-bold mt-0.5 leading-5"
          numberOfLines={multiline ? 4 : 1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
