import axiosInstance from "@/utils/axiosInstance";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import useUser from "@/hooks/useUser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  selectedOptions?: Record<string, string>;
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
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  PENDING:   { bg: "#FEF3C7", text: "#D97706", icon: "time-outline",             label: "Pending" },
  ACCEPTED:  { bg: "#DBEAFE", text: "#2563EB", icon: "checkmark-circle-outline", label: "Accepted" },
  SHIPPED:   { bg: "#EDE9FE", text: "#7C3AED", icon: "car-outline",              label: "Shipped" },
  DELIVERED: { bg: "#D1FAE5", text: "#059669", icon: "bag-check-outline",        label: "Delivered" },
  REJECTED:  { bg: "#FEE2E2", text: "#DC2626", icon: "close-circle-outline",     label: "Rejected" },
  CANCELLED: { bg: "#F3F4F6", text: "#6B7280", icon: "ban-outline",              label: "Cancelled" },
};

const STATUS_FILTERS = [
  { key: "all",       label: "All" },
  { key: "PENDING",   label: "Pending" },
  { key: "ACCEPTED",  label: "Accepted" },
  { key: "SHIPPED",   label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function MyOrders() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/user-orders");
      return res.data.orders as Order[];
    },
    enabled: !!user,
  });

  const orders: Order[] = ordersData || [];

  if (!user) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 pt-12 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-bold text-gray-900">My Orders</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="bag-outline" size={56} color="#9CA3AF" />
          <Text className="text-xl font-poppins-bold text-gray-900 mt-5 mb-2">
            You are not logged in
          </Text>
          <Text className="text-gray-500 font-poppins-medium text-center mb-8">
            Login to see your orders and track deliveries.
          </Text>
          <TouchableOpacity
            className="bg-primary w-full py-3.5 rounded-2xl items-center"
            onPress={() => router.push("/(routes)/login")}
          >
            <Text className="text-white font-poppins-semibold text-base">
              Login / Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Cancel mutation — calls PUT /order/api/cancel/:orderId
  const { mutate: cancelOrder } = useMutation({
    mutationFn: (orderId: string) =>
      axiosInstance.put(`/order/api/cancel/${orderId}`),
    onMutate: (orderId) => setCancellingId(orderId),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Could not cancel order";
      toast.error(msg);
    },
    onSettled: () => setCancellingId(null),
  });

  const confirmCancel = (orderId: string) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? Stock will be released.",
      [
        { text: "No, Keep it", style: "cancel" },
        { text: "Yes, Cancel", style: "destructive", onPress: () => cancelOrder(orderId) },
      ]
    );
  };

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((o) => o.status === selectedStatus);

  const renderOrderCard = (order: Order) => {
    const cfg = STATUS_CONFIG[order.status] ?? {
      bg: "#F3F4F6", text: "#6B7280", icon: "help-circle-outline", label: order.status,
    };
    const orderNumber = `#${order.id.slice(-6).toUpperCase()}`;
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
    const amount = order.totalAmount ?? order.total ?? 0;
    const isPending = order.status === "PENDING";
    const isCancelling = cancellingId === order.id;

    return (
      <View
        key={order.id}
        className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden"
        style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
      >
        {/* Header */}
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-poppins-bold text-gray-900">{orderNumber}</Text>
            <View className="px-3 py-1 rounded-full flex-row items-center" style={{ backgroundColor: cfg.bg }}>
              <Ionicons name={cfg.icon as any} size={13} color={cfg.text} />
              <Text className="ml-1 text-xs font-poppins-semibold" style={{ color: cfg.text }}>
                {cfg.label}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400 font-poppins-medium">{orderDate}</Text>
            <View className="items-end">
              {(order.discountAmount ?? 0) > 0 && (
                <Text className="text-green-600 text-xs font-poppins-medium">
                  −₹{order.discountAmount} discount
                </Text>
              )}
              <Text className="text-base font-poppins-bold text-gray-900">₹{amount.toFixed(0)}</Text>
            </View>
          </View>
          {/* Payment badge */}
          <View className="mt-2 flex-row gap-2">
            <View className="bg-gray-100 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] text-gray-500 font-poppins-medium uppercase">
                {order.paymentMethod || "COD"}
              </Text>
            </View>
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: order.paymentStatus === "COMPLETED" ? "#D1FAE5" : "#FEF3C7" }}
            >
              <Text
                className="text-[10px] font-poppins-semibold"
                style={{ color: order.paymentStatus === "COMPLETED" ? "#059669" : "#D97706" }}
              >
                {order.paymentStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View className="px-4 py-3 gap-3">
          {order.items?.map((item, idx) => (
            <View key={item.id ?? idx} className="flex-row items-center">
              <Image
                source={{
                  uri: item.product?.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100",
                }}
                className="w-14 h-14 rounded-xl bg-gray-100"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-poppins-medium text-gray-900" numberOfLines={2}>
                  {item.product?.title || `Product …${item.productId.slice(-6)}`}
                </Text>
                <Text className="text-xs text-gray-500 font-poppins-medium mt-0.5">
                  {(item as any).selectedOptions?.weightGrams
                    ? `${(item as any).selectedOptions.weightGrams >= 1000
                        ? `${((item as any).selectedOptions.weightGrams / 1000).toFixed(2)} kg`
                        : `${(item as any).selectedOptions.weightGrams} gm`} · ₹${item.price.toFixed(0)}`
                    : `Qty: ${item.quantity} · ₹${item.price.toFixed(0)}`}
                </Text>
                {((item as any).selectedOptions?.cuttingType) && (
                  <Text className="text-xs text-gray-400 font-poppins-medium mt-0.5" numberOfLines={1}>
                    {(item as any).selectedOptions.cuttingType}
                    {(item as any).selectedOptions.pieceSize
                      ? ` · ${(item as any).selectedOptions.pieceSize}` : ""}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="px-4 pb-4 gap-2">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-blue-600 py-3 rounded-xl flex-row items-center justify-center"
              onPress={() =>
                router.push({ pathname: "/(routes)/order-details/[id]", params: { id: order.id } })
              }
            >
              <Ionicons name="location-outline" size={16} color="white" />
              <Text className="text-white font-poppins-semibold ml-2 text-sm">Track Order</Text>
            </TouchableOpacity>

            {/* Cancel — only for PENDING orders */}
            {isPending && (
              <TouchableOpacity
                disabled={isCancelling}
                onPress={() => confirmCancel(order.id)}
                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center border border-red-200 ${
                  isCancelling ? "bg-red-50 opacity-60" : "bg-red-50"
                }`}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                    <Text className="text-red-600 font-poppins-semibold ml-2 text-sm">Cancel</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 pt-12 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-poppins-bold text-gray-900">My Orders</Text>
      </View>

      {/* Status filters */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setSelectedStatus(f.key)}
              className={`px-4 py-2 rounded-full mr-3 ${
                selectedStatus === f.key ? "bg-blue-600" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-poppins-medium ${
                  selectedStatus === f.key ? "text-white" : "text-gray-700"
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-24">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-500 font-poppins-medium mt-4">Loading orders…</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View className="flex-1 items-center justify-center py-24">
            <Ionicons name="bag-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 font-poppins-medium mt-4 text-lg text-center">
              {selectedStatus === "all" ? "No orders yet" : `No ${STATUS_CONFIG[selectedStatus]?.label ?? selectedStatus} orders`}
            </Text>
          </View>
        ) : (
          filteredOrders.map(renderOrderCard)
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
