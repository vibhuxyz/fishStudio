import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { CYCLE_MS, STEP_QUOTES } from "./constants";

export function RotatingQuote({ status, slot, color }: { status: string; slot?: string; color: string }) {
  const slotType = slot === "instant" ? "instant" : "scheduled";
  const key = `${status}_${slotType}`;
  const quotes = STEP_QUOTES[key] ?? STEP_QUOTES[`PENDING_${slotType}`] ?? STEP_QUOTES.PENDING_instant;
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * quotes.length));
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);
  const barProgress = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    barProgress.value = withTiming(1, { duration: CYCLE_MS, easing: Easing.linear });
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 });
      translateY.value = withTiming(-14, { duration: 400 });
      const next = setTimeout(() => {
        setIdx((i) => (i + 1) % quotes.length);
      }, 420);
      return () => clearTimeout(next);
    }, CYCLE_MS - 500);
    return () => clearTimeout(timeout);
  }, [idx, opacity, translateY, barProgress, quotes.length]);

  useEffect(() => {
    setIdx(Math.floor(Math.random() * quotes.length));
  }, [status, slotType]); // eslint-disable-line react-hooks/exhaustive-deps

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  const barStyle = useAnimatedStyle(() => ({
    width: `${barProgress.value * 100}%`,
  }));

  return (
    <View style={{ marginTop: 20, overflow: "hidden", borderRadius: 16, padding: 2, backgroundColor: color }}>
      <View style={{ borderRadius: 14, backgroundColor: "rgba(0,0,0,0.3)", padding: 16 }}>
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
          {quotes.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === idx ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === idx ? "#fff" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </View>
        <Animated.Text
          style={[
            {
              color: "#fff",
              fontSize: 14,
              fontWeight: "600",
              lineHeight: 20,
              minHeight: 40,
              textShadowColor: "rgba(0,0,0,0.25)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            },
            textStyle,
          ]}
        >
          {quotes[idx]}
        </Animated.Text>
        <View style={{ marginTop: 12, height: 2, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 1, overflow: "hidden" }}>
          <Animated.View style={[{ height: "100%", backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 1 }, barStyle]} />
        </View>
      </View>
    </View>
  );
}
