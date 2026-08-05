import { getDeliveryEtaMinutes } from "@/components/order-tracker/simulation";
import { Order, STATUS_CONFIG } from "@/constants/order";
import { useAddressStore } from "@/lib/address-store";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const TERMINAL_STATUSES = new Set(["DELIVERED", "CANCELLED", "REJECTED"]);

export default function ActiveOrderWidget() {
  const { user } = useUser();
  const { selectedLocation } = useAddressStore();
  const [now, setNow] = useState(() => Date.now());

  const { data: orders } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/user-orders");
      return res.data.orders as Order[];
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  // The remaining-minutes text only needs a fresh "now" to recompute against
  // — no network call — so it ticks independently of the order refetch above.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const activeOrder = (orders ?? []).find((o) => !TERMINAL_STATUSES.has(o.status));
  if (!activeOrder) return null;

  const etaMinutes = getDeliveryEtaMinutes(activeOrder, selectedLocation?.deliveryTimeMinutes);
  const arrivalTime = new Date(activeOrder.createdAt).getTime() + etaMinutes * 60000;
  const remainingMinutes = Math.max(0, Math.round((arrivalTime - now) / 60000));
  const cfg = STATUS_CONFIG[activeOrder.status] ?? {
    bg: "#F3F4F6", text: "#6B7280", icon: "help-circle-outline", label: activeOrder.status,
  };

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(routes)/order-confirmation/[id]",
          params: { id: activeOrder.id },
        })
      }
      activeOpacity={0.85}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginTop: 12,
        padding: 14,
        borderRadius: 16,
        backgroundColor: "#EEE9FD",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: cfg.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={cfg.icon as any} size={22} color={cfg.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 13, color: "#1E293B" }}>
          {cfg.label}
        </Text>
        <Text style={{ fontFamily: "Inter-Medium", fontSize: 12, color: "#5A2C96", marginTop: 1 }}>
          {remainingMinutes > 0 ? `Arriving in ~${remainingMinutes} min` : "Arriving any moment"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#5A2C96" />
    </TouchableOpacity>
  );
}
