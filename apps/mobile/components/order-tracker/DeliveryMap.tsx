import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Pattern,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { colors } from "@/constants/theme";
import { ROUTE_PATH_D, ROUTE_SEGMENTS, STORE_POINT, HOME_POINT } from "./constants";
import { getMishapState, normalizeDeliveryMinutes, pointAlongPath, trafficEase } from "./simulation";

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Simulated live-tracking map for an out-for-delivery order. There's no real
 * rider GPS feed in this system — the route, traffic slowdowns and the rider
 * icon's position are all derived from elapsed time vs. the store's usual
 * delivery ETA (see simulation.ts), not a device location. It's built to
 * *feel* live (smooth easing, the odd "stuck at a signal" moment) without
 * claiming to be real telemetry.
 */
export function DeliveryMap({
  deliveryMinutes,
  storeName,
  updatedAt,
}: {
  deliveryMinutes?: number | null;
  storeName?: string;
  updatedAt?: string;
}) {
  const baseMin = normalizeDeliveryMinutes(deliveryMinutes) ?? 40;
  const baseTotalMs = baseMin * 60 * 1000;

  const [nowTs, setNowTs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const shippedAtMs = updatedAt ? new Date(updatedAt).getTime() : nowTs;
  const elapsedMs = Math.max(0, nowTs - shippedAtMs);
  const mishap = getMishapState(elapsedMs, baseTotalMs);
  const effectiveTotalMs = baseTotalMs + mishap.extraMs;

  const rawT = Math.min(1, elapsedMs / effectiveTotalMs);
  const easedProgress = trafficEase(rawT);
  const progress = Math.min(0.94, easedProgress);

  const isInTraffic = mishap.active?.kind === "traffic";
  const isWrongTurn = mishap.active?.kind === "wrong-turn";
  const routeInTroubleMode = isInTraffic || isWrongTurn;

  const scooter = pointAlongPath(progress);
  const bubbleMsg = mishap.active?.label ?? null;
  const bubbleColor = routeInTroubleMode ? colors.danger : mishap.active ? "#D97706" : colors.primary;

  const totalPathLen = ROUTE_SEGMENTS.totalLength;
  const covered = totalPathLen * progress;
  const coveredDashArray = `${covered},${totalPathLen}`;

  // ── Animation ──
  const dashOffset = useSharedValue(0);
  useEffect(() => {
    dashOffset.value = withRepeat(withTiming(-24, { duration: 1600, easing: Easing.linear }), -1);
  }, [dashOffset]);
  const dashedProps = useAnimatedProps(() => ({ strokeDashoffset: dashOffset.value }));

  return (
    <View
      style={{
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#F3F4F6",
      }}
    >
      <Svg viewBox="0 0 400 220" width="100%" height={220} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <SvgLinearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#7C3AED" />
            <Stop offset="100%" stopColor={colors.primary} />
          </SvgLinearGradient>
          <SvgLinearGradient id="route-grad-traffic" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor={colors.danger} />
          </SvgLinearGradient>
          <Pattern id="street-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <Path d="M 32 0 L 0 0 0 32" fill="none" stroke="#E5E7EB" strokeWidth={0.8} />
          </Pattern>
        </Defs>

        <Rect width="400" height="220" fill={colors.secondaryBg} />
        <Rect width="400" height="220" fill="url(#street-grid)" />

        {/* Faint arterial roads */}
        <Path d="M 0,75 Q 200,55 400,85" stroke="#E5E7EB" strokeWidth={6} fill="none" />
        <Path d="M 0,170 Q 180,190 400,160" stroke="#E5E7EB" strokeWidth={5} fill="none" />
        <Path d="M 120,0 L 120,220" stroke="#E5E7EB" strokeWidth={4} />
        <Path d="M 280,0 L 280,220" stroke="#E5E7EB" strokeWidth={4} />

        <SvgText x={60} y={40} fill={colors.textMuted} fontSize={8} fontWeight="700">GOLF COURSE RD</SvgText>
        <SvgText x={210} y={210} fill={colors.textMuted} fontSize={8} fontWeight="700">SECTOR 57</SvgText>

        {/* Background track + animated remaining stretch */}
        <Path d={ROUTE_PATH_D} fill="none" stroke="#E5E7EB" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <AnimatedPath
          d={ROUTE_PATH_D}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6,6"
          animatedProps={dashedProps}
        />

        {/* Covered stretch */}
        <Path
          d={ROUTE_PATH_D}
          fill="none"
          stroke={routeInTroubleMode ? "url(#route-grad-traffic)" : "url(#route-grad)"}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={coveredDashArray}
        />

        {/* Store pin */}
        <G x={STORE_POINT.x} y={STORE_POINT.y}>
          <Circle r={14} fill={colors.primary} opacity={0.15} />
          <Circle r={8} fill={colors.primary} stroke={colors.white} strokeWidth={2} />
          <Circle r={2.5} fill={colors.white} />
          <G x={10} y={-10}>
            <Rect x={0} y={-8} width={Math.min(90, ((storeName || "Store").length * 4.6) + 14)} height={14} rx={7} fill={colors.white} stroke={colors.primary} strokeOpacity={0.4} strokeWidth={1} />
            <SvgText x={7} y={2} fill={colors.primary} fontSize={8.5} fontWeight="700">{(storeName || "Store").slice(0, 16)}</SvgText>
          </G>
        </G>

        {/* Home pin */}
        <G x={HOME_POINT.x} y={HOME_POINT.y}>
          <Circle r={15} fill={colors.offerGreen} opacity={0.15} />
          <Circle r={9} fill={colors.offerGreen} stroke={colors.white} strokeWidth={2} />
          <Path d="M -4,-1 L 0,-5 L 4,-1 L 4,4 L -4,4 Z" fill={colors.white} />
          <G x={-46} y={-10}>
            <Rect x={0} y={-8} width={42} height={14} rx={7} fill={colors.white} stroke={colors.offerGreen} strokeOpacity={0.4} strokeWidth={1} />
            <SvgText x={6} y={2} fill={colors.success} fontSize={8.5} fontWeight="700">Your Home</SvgText>
          </G>
        </G>

        {/* Speech-bubble caption for the current mishap, if any */}
        {bubbleMsg && (() => {
          const w = Math.max(64, bubbleMsg.length * 5.2 + 16);
          const bx = Math.max(48, Math.min(352, scooter.x));
          const by = Math.max(24, scooter.y - 22);
          return (
            <G x={bx} y={by}>
              <Rect x={-w / 2} y={-11} width={w} height={18} rx={9} fill={colors.white} stroke={bubbleColor} strokeWidth={1.2} />
              <SvgText x={0} y={3} fontSize={9} fontWeight="800" fill={bubbleColor} textAnchor="middle">{bubbleMsg}</SvgText>
              <Path d="M -3 7 L 0 12 L 3 7 Z" fill={colors.white} stroke={bubbleColor} strokeWidth={1} />
            </G>
          );
        })()}

        {/* Rider */}
        <G x={scooter.x} y={scooter.y}>
          <G rotation={scooter.angle}>
            <Circle r={12} fill={routeInTroubleMode ? colors.danger : colors.primary} opacity={0.18} />
            <Circle r={8} fill={routeInTroubleMode ? colors.danger : colors.primary} />
            <Circle r={3} fill={colors.white} />
          </G>
        </G>
      </Svg>
    </View>
  );
}
