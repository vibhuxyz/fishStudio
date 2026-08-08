import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { endOfListMessages } from "@repo/shared/data";
import Animated, { 
  FadeInDown, 
  FadeOutUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing, 
  withSequence 
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

export default function EndOfListBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Background pulse animation
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % endOfListMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const blob1Style = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const blob2Style = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `-${rotation.value}deg` }],
    };
  });

  const currentMessage = endOfListMessages[currentIndex] || { text: "", emoji: "" };

  return (
    <View style={{ padding: 16, alignItems: "center", marginVertical: 16, width: "100%", marginBottom: 32 }}>
      <Animated.View
        style={[
          {
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 4,
            borderWidth: 1,
            borderColor: "rgba(139, 92, 246, 0.15)",
          },
          animatedStyle,
        ]}
      >
        {/* Animated background blobs */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: -80,
              left: -60,
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: "rgba(167, 139, 250, 0.12)", // purple-400
            },
            blob1Style
          ]}
        />
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: -80,
              right: -60,
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: "rgba(244, 114, 182, 0.12)", // pink-400
            },
            blob2Style
          ]}
        />

        <View style={{ padding: 24, alignItems: "center", minHeight: 220 }}>
          <Text
            style={{
              fontFamily: "Inter-Black",
              fontSize: 10,
              textTransform: "uppercase",
              color: colors.primary,
              letterSpacing: 2.5,
              marginBottom: 24,
              opacity: 0.9,
            }}
          >
            You've reached the bottom
          </Text>
          
          <View style={{ height: 110, justifyContent: "center", alignItems: "center", width: "100%" }}>
            <Animated.View
              key={`container-${currentIndex}`}
              entering={FadeInDown.springify().damping(14).mass(0.8)}
              exiting={FadeOutUp.duration(300)}
              style={{ position: "absolute", alignItems: "center", width: "100%" }}
            >
              <Text style={{ fontSize: 42, marginBottom: 16, elevation: 2 }}>
                {currentMessage.emoji}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter-SemiBold",
                  fontSize: 15,
                  color: "#1F2937",
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                {currentMessage.text}
              </Text>
            </Animated.View>
          </View>
          
          {/* Bottom decorative bar */}
          <View style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 24, opacity: 0.5 }} />
        </View>
      </Animated.View>
    </View>
  );
}
