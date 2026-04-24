import axiosInstance from "@/utils/axiosInstance";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OrderTracker, getDeliveryEtaMinutes } from "@/components/order-tracker";
import { useAddressStore } from "@/lib/address-store";

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; icon: string; label: string }
> = {
  PENDING: { bg: "#FEF3C7", text: "#D97706", icon: "time-outline", label: "Pending" },
  ACCEPTED: {
    bg: "#DBEAFE",
    text: "#2563EB",
    icon: "checkmark-circle-outline",
    label: "Accepted",
  },
  SHIPPED: { bg: "#EDE9FE", text: "#7C3AED", icon: "car-outline", label: "Shipped" },
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

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/api/get-order/${id}`);
      return res.data.order;
    },
    enabled: !!id,
  });

  if (isLoading || !order) {
    return (
      <SafeAreaView className="flex-1 pt-12 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6C3CE1" />
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
        {/* Success header */}
        <View className="items-center mt-4 mb-6">
          <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center">
            <Ionicons name="checkmark-circle" size={56} color="#10B981" />
          </View>
          <Text
            className="mt-4 text-emerald-500 uppercase tracking-widest text-[28px] italic"
            style={{
              fontFamily: "Poppins-Bold",
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
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              #{shortId}
            </Text>{" "}
            has been placed successfully.
          </Text>
        </View>

        {/* Live order tracker */}
        <View className="mb-3">
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
            icon={<Ionicons name="calendar-outline" size={18} color="#6C3CE1" />}
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
            icon={<Ionicons name="location-outline" size={18} color="#6C3CE1" />}
            label="DELIVERING TO"
            value={`${order.deliveryName}\n${order.deliveryAddress}\n${order.deliveryCity} – ${order.deliveryPincode}`}
            multiline
          />
          <MetaRow
            icon={<Ionicons name="car-outline" size={18} color="#6C3CE1" />}
            label="DELIVERY SLOT"
            value={slotLabel}
          />
          <MetaRow
            icon={<MaterialCommunityIcons name="credit-card-outline" size={18} color="#6C3CE1" />}
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
                  {statusCfg.label}
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
                    fontFamily: "Poppins-Bold",
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
                  fontFamily: "Poppins-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
              >
                TOTAL PAID
              </Text>
              <Text
                className="text-2xl text-primary"
                style={{
                  fontFamily: "Poppins-Bold",
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
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              Continue Shopping
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(routes)/my-orders")}
            className="py-4 rounded-full border border-gray-200 flex-row items-center justify-center"
            activeOpacity={0.85}
          >
            <Ionicons name="bag-handle-outline" size={18} color="#1F2937" />
            <Text
              className="text-gray-900 text-base ml-2"
              style={{
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              View My Orders
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
