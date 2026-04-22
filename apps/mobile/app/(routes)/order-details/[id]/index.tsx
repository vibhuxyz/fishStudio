import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SelectedOptions {
  cuttingType?: string;
  pieceSize?: string;
  size?: string;
  weightGrams?: number;
  baseRatePerKg?: number;
  cuttingCharge?: number;
  sizeMultiplier?: number;
  effectiveRatePerKg?: number;
  [key: string]: any;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  selectedOptions?: SelectedOptions;
  product?: {
    id: string;
    title: string;
    images: { url: string }[];
    sale_price?: number;
    regular_price?: number;
  };
}

interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  total?: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  couponCode?: string;
  discountAmount?: number;
  deliveryCharge?: number;
  deliveryName?: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPincode?: string;
  deliverySlot?: string;
  items: OrderItem[];
  store?: { id: string; name: string };
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string; label: string; description: string }> = {
  PENDING:   { bg: "#FEF3C7", text: "#D97706", icon: "time-outline",             label: "Pending",   description: "Your order has been placed and is awaiting confirmation" },
  ACCEPTED:  { bg: "#DBEAFE", text: "#2563EB", icon: "checkmark-circle-outline", label: "Accepted",  description: "Your order has been accepted and is being prepared" },
  SHIPPED:   { bg: "#EDE9FE", text: "#7C3AED", icon: "car-outline",              label: "Shipped",   description: "Your order is on its way to you" },
  DELIVERED: { bg: "#D1FAE5", text: "#059669", icon: "bag-check-outline",        label: "Delivered", description: "Your order has been delivered successfully" },
  REJECTED:  { bg: "#FEE2E2", text: "#DC2626", icon: "close-circle-outline",     label: "Rejected",  description: "Your order was rejected by the store" },
  CANCELLED: { bg: "#F3F4F6", text: "#6B7280", icon: "ban-outline",              label: "Cancelled", description: "Your order has been cancelled" },
};

const SLOT_LABELS: Record<string, string> = {
  instant: "Instant (30–45 min)",
  morning: "Morning (6AM–10AM)",
  evening: "Evening (5PM–9PM)",
};

const PAYMENT_STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: "#D1FAE5", text: "#059669" },
  PENDING:   { bg: "#FEF3C7", text: "#D97706" },
  FAILED:    { bg: "#FEE2E2", text: "#DC2626" },
  REFUNDED:  { bg: "#EDE9FE", text: "#7C3AED" },
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/order/api/get-order/${id}`);
      return response.data.order as Order;
    },
    enabled: !!id,
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 pt-12 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-bold text-gray-900">Order Details</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-500 font-poppins-medium mt-4">Loading order details…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 pt-12 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-bold text-gray-900">Order Details</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-500 font-poppins-medium mt-4 text-lg">Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? {
    bg: "#F3F4F6", text: "#6B7280", icon: "help-circle-outline",
    label: order.status, description: "",
  };
  const payStatusCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] ?? PAYMENT_STATUS_CONFIG.PENDING;
  const amount = order.totalAmount ?? order.total ?? 0;
  const orderNumber = `#${order.id.slice(-6).toUpperCase()}`;
  const itemTotal = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 pt-12 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-poppins-bold text-gray-900">Order Details</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 gap-4">

          {/* Status Card */}
          <View className="bg-white rounded-2xl border border-gray-100 p-5"
            style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-poppins-bold text-gray-900">{orderNumber}</Text>
              <View className="px-3 py-1.5 rounded-full flex-row items-center" style={{ backgroundColor: statusCfg.bg }}>
                <Ionicons name={statusCfg.icon as any} size={14} color={statusCfg.text} />
                <Text className="ml-1.5 text-xs font-poppins-semibold" style={{ color: statusCfg.text }}>
                  {statusCfg.label}
                </Text>
              </View>
            </View>
            <Text className="text-sm text-gray-500 font-poppins-medium mb-4">{statusCfg.description}</Text>

            <View className="flex-row justify-between pt-4 border-t border-gray-100">
              <View>
                <Text className="text-xs text-gray-400 font-poppins-medium">Order Date</Text>
                <Text className="text-sm text-gray-800 font-poppins-semibold mt-0.5">{formatDate(order.createdAt)}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-400 font-poppins-medium">Total Paid</Text>
                <Text className="text-xl font-poppins-bold text-gray-900 mt-0.5">₹{amount.toFixed(0)}</Text>
              </View>
            </View>

            {/* Payment badges */}
            <View className="mt-3 flex-row gap-2 flex-wrap">
              <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                <Text className="text-[11px] text-gray-600 font-poppins-medium">
                  {order.paymentMethod || "COD"}
                </Text>
              </View>
              <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: payStatusCfg.bg }}>
                <Text className="text-[11px] font-poppins-semibold" style={{ color: payStatusCfg.text }}>
                  {order.paymentStatus}
                </Text>
              </View>
              {order.deliverySlot && (
                <View className="bg-blue-50 px-2.5 py-1 rounded-full">
                  <Text className="text-[11px] text-blue-600 font-poppins-medium">
                    {SLOT_LABELS[order.deliverySlot] ?? order.deliverySlot}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Order Items */}
          <View className="bg-white rounded-2xl border border-gray-100 p-5"
            style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
            <Text className="text-base font-poppins-bold text-gray-900 mb-4">Items</Text>
            <View className="gap-4">
              {order.items?.map((item, idx) => (
                <View key={item.id ?? idx}
                  className={`flex-row items-center ${idx !== 0 ? "pt-4 border-t border-gray-100" : ""}`}>
                  <Image
                    source={{ uri: item.product?.images?.[0]?.url || "https://via.placeholder.com/80" }}
                    className="w-16 h-16 rounded-xl bg-gray-100"
                    resizeMode="cover"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-poppins-semibold text-gray-900" numberOfLines={2}>
                      {item.product?.title || `Product …${item.productId.slice(-6)}`}
                    </Text>
                    {item.selectedOptions?.weightGrams ? (
                      <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                        {item.selectedOptions.weightGrams >= 1000
                          ? `${(item.selectedOptions.weightGrams / 1000).toFixed(2)} kg`
                          : `${item.selectedOptions.weightGrams} gm`}
                        {" · "}₹{item.price.toFixed(0)} total
                      </Text>
                    ) : (
                      <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                        Qty: {item.quantity} · ₹{item.price.toFixed(0)} each
                      </Text>
                    )}
                    {(item.selectedOptions?.cuttingType || item.selectedOptions?.pieceSize) && (
                      <Text className="text-xs text-gray-400 font-poppins-medium mt-0.5">
                        {[item.selectedOptions.cuttingType, item.selectedOptions.pieceSize]
                          .filter(Boolean).join(" · ")}
                      </Text>
                    )}
                    {item.selectedOptions?.cuttingCharge != null &&
                      item.selectedOptions.cuttingCharge > 0 && (
                      <Text className="text-[11px] text-amber-500 font-poppins-medium mt-0.5">
                        ₹{item.selectedOptions.baseRatePerKg}/kg + ₹{item.selectedOptions.cuttingCharge} cut
                        {item.selectedOptions.sizeMultiplier && item.selectedOptions.sizeMultiplier !== 1
                          ? ` ×${item.selectedOptions.sizeMultiplier}` : ""}
                        {" = "}₹{item.selectedOptions.effectiveRatePerKg}/kg
                      </Text>
                    )}
                  </View>
                  <Text className="text-sm font-poppins-bold text-gray-900 ml-2">
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Delivery Address */}
          {(order.deliveryName || order.deliveryAddress) && (
            <View className="bg-white rounded-2xl border border-gray-100 p-5"
              style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
              <Text className="text-base font-poppins-bold text-gray-900 mb-3">Delivery Address</Text>
              {order.deliveryName && (
                <Text className="text-sm font-poppins-semibold text-gray-900">{order.deliveryName}</Text>
              )}
              {order.deliveryPhone && (
                <Text className="text-sm text-gray-600 font-poppins-medium mt-0.5">{order.deliveryPhone}</Text>
              )}
              {order.deliveryAddress && (
                <Text className="text-sm text-gray-600 font-poppins-medium mt-1">{order.deliveryAddress}</Text>
              )}
              {(order.deliveryCity || order.deliveryPincode) && (
                <Text className="text-sm text-gray-600 font-poppins-medium mt-0.5">
                  {[order.deliveryCity, order.deliveryPincode].filter(Boolean).join(", ")}
                </Text>
              )}
            </View>
          )}

          {/* Price Breakdown */}
          <View className="bg-white rounded-2xl border border-gray-100 p-5"
            style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
            <Text className="text-base font-poppins-bold text-gray-900 mb-4">Bill Details</Text>
            <View className="gap-2.5">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600 font-poppins-medium">Item Total</Text>
                <Text className="text-sm text-gray-800 font-poppins-semibold">₹{itemTotal.toFixed(0)}</Text>
              </View>
              {(order.deliveryCharge ?? 0) > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600 font-poppins-medium">Delivery Charge</Text>
                  <Text className="text-sm text-gray-800 font-poppins-semibold">₹{(order.deliveryCharge ?? 0).toFixed(0)}</Text>
                </View>
              )}
              {(order.discountAmount ?? 0) > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600 font-poppins-medium">
                    Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                  </Text>
                  <Text className="text-sm text-green-600 font-poppins-semibold">−₹{(order.discountAmount ?? 0).toFixed(0)}</Text>
                </View>
              )}
              <View className="flex-row justify-between pt-3 border-t border-gray-100 mt-1">
                <Text className="text-base font-poppins-bold text-gray-900">Total</Text>
                <Text className="text-base font-poppins-bold text-gray-900">₹{amount.toFixed(0)}</Text>
              </View>
            </View>
          </View>

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
