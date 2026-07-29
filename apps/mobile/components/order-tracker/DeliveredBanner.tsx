import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

import { SLOT_WINDOWS } from "./constants";
import { normalizeDeliveryMinutes } from "./simulation";

export function DeliveredBanner({ deliverySlot, deliveryMinutes }: { deliverySlot?: string; deliveryMinutes?: number | null }) {
  const primary =
    deliverySlot === "instant"
      ? `Delivered in about ${normalizeDeliveryMinutes(deliveryMinutes) ?? 40} min`
      : `Delivered in ${SLOT_WINDOWS[deliverySlot ?? ""] ?? "your selected slot"}`;

  const ring = useSharedValue(1);
  const celebrate = useSharedValue(0);
  useEffect(() => {
    ring.value = withRepeat(
      withSequence(withTiming(1.75, { duration: 1100 }), withTiming(1, { duration: 1100 })),
      -1,
      false,
    );
    celebrate.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 300 }),
        withTiming(0, { duration: 150 }),
        withTiming(8, { duration: 300 }),
        withTiming(0, { duration: 350 }),
      ),
      -1,
      false,
    );
  }, [ring, celebrate]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + (1.75 - ring.value) * 0.6,
    transform: [{ scale: ring.value }],
  }));
  const celebrateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${celebrate.value}deg` }, { scale: 1 + Math.abs(celebrate.value) * 0.015 }],
  }));

  return (
    <View style={{ marginTop: 20, borderRadius: 28, overflow: "hidden", padding: 2 }}>
      <LinearGradient colors={["#10B981", "#34D399", "#06B6D4", "#3B82F6", "#10B981"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 28 }}>
        <LinearGradient colors={["#ecfdf5", "#d1fae5", "#cffafe"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ borderRadius: 26, padding: 24, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
            <View style={{ position: "relative", width: 64, height: 64, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#10B981", shadowOpacity: 0.4, shadowRadius: 8, elevation: 3 }}>
              <Animated.View style={[{ position: "absolute", inset: 0, borderRadius: 22, backgroundColor: "rgba(52,211,153,0.2)" }, ringStyle]} />
              <Animated.View style={celebrateStyle}>
                <Ionicons name="checkmark-circle" size={38} color="#059669" />
              </Animated.View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#047857", letterSpacing: 3, textTransform: "uppercase" }}>
                Delivery Complete
              </Text>
              <Text style={{ marginTop: 4, fontSize: 22, fontWeight: "900", color: "#065F46", lineHeight: 28 }}>
                Order delivered! 🎉
              </Text>
              <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "600", color: "#334155" }}>{primary}</Text>
              <Text style={{ marginTop: 4, fontSize: 13, color: "#475569" }}>
                Hope you enjoy every fresh bite.
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 16, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.8)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" }}>
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#047857", letterSpacing: 2, textTransform: "uppercase" }}>Status</Text>
            <Text style={{ marginTop: 2, fontSize: 13, fontWeight: "900", color: "#047857" }}>Enjoy your meal</Text>
            <Text style={{ marginTop: 2, fontSize: 11, color: "#64748b" }}>
              {deliverySlot === "instant" ? "Instant drop completed." : `Scheduled: ${SLOT_WINDOWS[deliverySlot ?? ""] ?? "Scheduled"}`}
            </Text>
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}
