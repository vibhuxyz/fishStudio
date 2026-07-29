import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

import { SLOT_WINDOWS } from "./constants";

export function ScheduledShipCard({ deliverySlot, storeName }: { deliverySlot?: string; storeName?: string }) {
  const window = SLOT_WINDOWS[deliverySlot ?? ""] ?? "your scheduled window";
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.6, { duration: 1200 }), withTiming(1, { duration: 1200 })),
      -1,
      false,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + (1.6 - pulse.value) * 0.5,
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={{ marginTop: 20, borderRadius: 24, overflow: "hidden" }}>
      <LinearGradient colors={["#eef2ff", "#e0e7ff", "#ede9fe"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ padding: 20, borderWidth: 1, borderColor: "rgba(99,102,241,0.3)", borderRadius: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
          <View style={{ position: "relative", width: 56, height: 56, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
            <Animated.View style={[{ position: "absolute", inset: 0, borderRadius: 16, backgroundColor: "rgba(99,102,241,0.2)" }, pulseStyle]} />
            <Ionicons name="calendar-outline" size={24} color="#4f46e5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#4338ca", letterSpacing: 2, textTransform: "uppercase" }}>
              Scheduled Delivery
            </Text>
            <Text style={{ marginTop: 4, fontSize: 18, fontWeight: "900", color: "#0f172a", lineHeight: 24 }}>
              Delivering in {window}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 13, color: "#475569" }}>
              {storeName ? `${storeName} has` : "Your order has"} dispatched — we'll arrive inside your chosen window.
            </Text>
            <View style={{ marginTop: 12, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.7)", paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.7)" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#6366f1" }} />
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#4338ca" }}>On schedule</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
