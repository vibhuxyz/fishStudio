import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

import { STEPS } from "./constants";

export function HeadlineRow({
  step,
  flash,
  updatedAt,
  isDelivered,
}: {
  step: typeof STEPS[number] | null;
  flash: boolean;
  updatedAt?: string;
  isDelivered: boolean;
}) {
  const ring = useSharedValue(1);
  useEffect(() => {
    ring.value = withRepeat(
      withSequence(withTiming(1.75, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      false,
    );
  }, [ring]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + (1.75 - ring.value) * 0.6,
    transform: [{ scale: ring.value }],
  }));

  if (!step) return null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 }}>
      <View style={{ position: "relative", width: 56, height: 56, alignItems: "center", justifyContent: "center" }}>
        <Animated.View style={[{ position: "absolute", inset: 0, borderRadius: 28, backgroundColor: step.ring }, ringStyle]} />
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: step.color, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={isDelivered ? "checkmark-circle" : step.icon} size={24} color="#fff" />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: step.color, letterSpacing: -0.3 }}>
          {step.label}
        </Text>
        <Text style={{ fontSize: 13, color: "rgba(17,24,39,0.6)", fontWeight: "500", marginTop: 2 }}>{step.sub}</Text>
        {updatedAt && (
          <Text style={{ fontSize: 11, color: "rgba(107,114,128,0.85)", marginTop: 4 }}>
            Last updated {new Date(updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        )}
      </View>
      {flash && (
        <View style={{ position: "absolute", top: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: step.color }}>
          <Ionicons name="flash" size={10} color="#fff" />
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>Status Updated</Text>
        </View>
      )}
    </View>
  );
}
