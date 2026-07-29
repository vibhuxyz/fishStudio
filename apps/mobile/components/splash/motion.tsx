import React, { useEffect } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type WithTimingConfig,
} from "react-native-reanimated";

import { colors } from "@/constants/theme";
import { LOGO_SIZE, px, RISE } from "./layout";

type EasingOption = NonNullable<WithTimingConfig["easing"]>;

// Worklets run on the UI thread and can't call back into `px`, so every distance
// they need is resolved to a plain number here.
const DOT_BOUNCE_Y = px(5);

type RiseInProps = {
  delay: number;
  duration?: number;
  distance?: number;
  easing?: EasingOption;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/** Shared fade-up used by the tagline, trust cells, headline and indicator. */
export function RiseIn({
  delay,
  duration = 550,
  distance = px(16),
  easing = RISE,
  style,
  children,
}: RiseInProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration, easing }));
  }, [delay, duration, easing, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * distance },
      { scale: 0.96 + progress.value * 0.04 },
    ],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

/** One indicator dot — bounces on a loop until the app hands over. */
export function IndicatorDot({ delay }: { delay: number }) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 402, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 403, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 345 }),
        ),
        -1,
        false,
      ),
    );
  }, [bounce, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + bounce.value * 0.6,
    transform: [
      { translateY: -bounce.value * DOT_BOUNCE_Y },
      { scale: 0.85 + bounce.value * 0.15 },
    ],
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

/** One of the two ripples pulsing out from behind the mark. */
export function Ripple({ delay }: { delay: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
  }, [delay, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.5, 0]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.82, 1.85]) }],
  }));

  return <Animated.View style={[styles.ripple, animatedStyle]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: px(9),
    height: px(9),
    borderRadius: px(4.5),
    backgroundColor: colors.textWhite,
  },
  ripple: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.brandRipple,
  },
});
