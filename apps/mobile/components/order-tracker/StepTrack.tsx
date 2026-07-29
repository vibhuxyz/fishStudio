import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

import { STEPS } from "./constants";

export function StepTrack({ animIdx, flash }: { animIdx: number; flash: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 8 }}>
      {STEPS.map((step, idx) => {
        const done = idx < animIdx;
        const active = idx === animIdx;
        return (
          <View key={step.key} style={{ flex: 1, alignItems: "center", position: "relative" }}>
            {/* Left connector */}
            {idx > 0 && (
              <View style={{ position: "absolute", top: 20, left: 0, right: "50%", height: 2 }}>
                <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 1 }} />
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: done || active ? "100%" : "0%",
                    backgroundColor: STEPS[idx - 1].color,
                    borderRadius: 1,
                  }}
                />
              </View>
            )}
            {/* Right connector */}
            {idx < STEPS.length - 1 && (
              <View style={{ position: "absolute", top: 20, left: "50%", right: 0, height: 2 }}>
                <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 1 }} />
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: done ? "100%" : "0%",
                    backgroundColor: step.color,
                    borderRadius: 1,
                  }}
                />
              </View>
            )}

            {/* Node */}
            <View style={{ zIndex: 10, width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
              {active ? (
                <ActiveNode color={step.color} icon={step.icon} flash={flash} />
              ) : done ? (
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: step.color, borderWidth: 2, borderColor: step.color, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </View>
              ) : (
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.6)", borderWidth: 2, borderColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={step.icon} size={16} color="rgba(0,0,0,0.25)" />
                </View>
              )}
            </View>
            <Text
              style={{
                marginTop: 8,
                fontSize: 11,
                fontWeight: "700",
                color: done || active ? step.color : "rgba(0,0,0,0.3)",
                textAlign: "center",
              }}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ActiveNode({ color, icon, flash }: { color: string; icon: keyof typeof Ionicons.glyphMap; flash: boolean }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.5, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + (1.5 - pulse.value) * 0.85,
    transform: [{ scale: pulse.value }],
  }));
  return (
    <>
      <Animated.View
        style={[
          { position: "absolute", inset: 0, borderRadius: 20, backgroundColor: color, opacity: 0.25 },
          pulseStyle,
        ]}
      />
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: color,
          borderWidth: 2,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: color,
          shadowOpacity: flash ? 0.4 : 0.2,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
    </>
  );
}
