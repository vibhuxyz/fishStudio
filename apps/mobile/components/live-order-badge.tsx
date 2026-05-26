import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export function LiveOrderBadge({
  connected,
  isFetching,
  lastLiveUpdateAt,
}: {
  connected: boolean;
  isFetching?: boolean;
  lastLiveUpdateAt?: Date | null;
}) {
  const label = connected
    ? "Live tracking on"
    : isFetching
      ? "Refreshing status"
      : "Auto-refresh fallback";

  const detail = lastLiveUpdateAt
    ? `Updated ${lastLiveUpdateAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : connected
      ? "Realtime updates enabled"
      : "Checking every few seconds";

  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 mb-3">
      <View className="flex-row items-center flex-1">
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: connected ? "#D1FAE5" : "#E0F2FE" }}
        >
          <Ionicons
            name={connected ? "radio" : "refresh"}
            size={16}
            color={connected ? "#059669" : "#0284C7"}
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-poppins-bold text-gray-900">
            {label}
          </Text>
          <Text className="text-[11px] font-poppins-medium text-gray-500">
            {detail}
          </Text>
        </View>
      </View>
      <View
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: connected ? "#10B981" : "#38BDF8" }}
      />
    </View>
  );
}
