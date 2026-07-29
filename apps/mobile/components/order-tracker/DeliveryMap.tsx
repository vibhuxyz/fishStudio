import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
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

import { ROUTE_PATH_D, ROUTE_SEGMENTS, STATES_INSTANT, STATES_SCHEDULED, STORE_POINT, HOME_POINT } from "./constants";
import { getMishapState, normalizeDeliveryMinutes, pointAlongPath, trafficEase } from "./simulation";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function DeliveryMap({
  deliverySlot,
  deliveryMinutes,
  storeName,
  updatedAt,
}: {
  deliverySlot?: string;
  deliveryMinutes?: number | null;
  storeName?: string;
  updatedAt?: string;
}) {
  const mode = deliverySlot === "instant" ? "instant" : "scheduled";
  const states = mode === "instant" ? STATES_INSTANT : STATES_SCHEDULED;
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
  let easedProgress = trafficEase(rawT);

  if (mishap.active?.kind === "wrong-turn" && mishap.active.backtrackFrac) {
    const startMs = mishap.active.atFrac * baseTotalMs;
    const span = mishap.active.durFrac * baseTotalMs;
    const localT = Math.max(0, Math.min(1, (elapsedMs - startMs) / span));
    const dip = Math.sin(localT * Math.PI) * mishap.active.backtrackFrac;
    easedProgress = Math.max(0, easedProgress - dip);
  }
  const progress = Math.min(0.94, easedProgress);
  const percent = Math.round(progress * 100);

  const sampleAhead = 0.01;
  const momentarySpeed =
    (trafficEase(Math.min(1, rawT + sampleAhead)) - easedProgress) / sampleAhead;

  const isInTraffic =
    mishap.active?.kind === "traffic" ||
    (momentarySpeed < 0.3 && rawT > 0.02 && rawT < 0.95);
  const isWrongTurn = mishap.active?.kind === "wrong-turn";
  const isSignal = mishap.active?.kind === "signal";
  const isAddressHunt = mishap.active?.kind === "address";
  const isFastLane = momentarySpeed > 1.4 && rawT < 0.9 && !mishap.active;
  const isArrivingSoon = progress >= 0.78 && progress < 0.92;
  const isNearHome = progress >= 0.88;

  const bubbleMsg = mishap.active
    ? mishap.active.label
    : isNearHome
      ? "Almost at your door 🔔"
      : isArrivingSoon
        ? "Entering your lane 📍"
        : isFastLane
          ? "Cruising ⚡"
          : null;

  const bubbleColor = isInTraffic || isWrongTurn
    ? "#F87171"
    : isSignal
      ? "#FBBF24"
      : isAddressHunt
        ? "#FB923C"
        : isNearHome
          ? "#22D3EE"
          : isArrivingSoon
            ? "#FCD34D"
            : "#10B981";

  const routeInTroubleMode = isInTraffic || isWrongTurn;

  let stateIdx = 0;
  for (let i = states.length - 1; i >= 0; i--) {
    if (easedProgress >= states[i].t) { stateIdx = i; break; }
  }
  const state = states[stateIdx];

  const arrivalMs = shippedAtMs + effectiveTotalMs;
  const etaClock = new Date(arrivalMs).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const remainingMin = Math.max(isNearHome ? 1 : 2, Math.ceil(Math.max(0, arrivalMs - nowTs) / 60000));

  const proximityChip =
    isNearHome        ? { text: "Delivery in moments 🔔", bg: "#22D3EE", fg: "#083344" }
    : progress >= 0.78 ? { text: "Rider may call you 📞", bg: "#FCD34D", fg: "#78350F" }
    : progress >= 0.65 ? { text: "Rider is nearby 📍",    bg: "#FDBA74", fg: "#7C2D12" }
    : null;

  const scooter = pointAlongPath(progress);
  const TOTAL_DISTANCE_KM = 3.2;
  const remainingKm = (TOTAL_DISTANCE_KM * (1 - progress)).toFixed(1);
  const addedMinutes = Math.round(mishap.extraMs / 60000);

  // ── Animations ──
  const dashOffset = useSharedValue(0);
  const bob = useSharedValue(0);
  const statusPulse = useSharedValue(1);
  useEffect(() => {
    dashOffset.value = withRepeat(withTiming(-24, { duration: 1600, easing: Easing.linear }), -1);
    bob.value = withRepeat(
      withSequence(withTiming(-1.2, { duration: 450 }), withTiming(0, { duration: 450 })),
      -1,
      false,
    );
    statusPulse.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 650 }), withTiming(1, { duration: 650 })),
      -1,
      false,
    );
  }, [dashOffset, bob, statusPulse]);

  const dashedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));
  const statusDotStyle = useAnimatedStyle(() => ({
    opacity: statusPulse.value,
  }));

  const totalPathLen = ROUTE_SEGMENTS.totalLength;
  const covered = totalPathLen * progress;
  const coveredDashArray = `${covered},${totalPathLen}`;

  const statusText = isWrongTurn ? "Rerouting"
    : isInTraffic ? "Rider in traffic"
    : isSignal ? "At a signal"
    : isNearHome ? "Near your home"
    : "Live Delivery";
  const statusColor = routeInTroubleMode ? "#FCA5A5" : isSignal ? "#FCD34D" : isNearHome ? "#67E8F9" : "#6EE7B7";
  const statusDotColor = routeInTroubleMode ? "#F87171" : isSignal ? "#FBBF24" : "#34D399";

  return (
    <View style={{ marginTop: 20, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#0a0f1c" }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusDotColor }, statusDotStyle]} />
              <Text style={{ fontSize: 10, fontWeight: "900", letterSpacing: 2.5, color: statusColor, textTransform: "uppercase" }}>
                {statusText}
              </Text>
              {addedMinutes > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(252,165,165,0.3)", borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#FCA5A5" }}>+{addedMinutes} min delay</Text>
                </View>
              )}
            </View>
            <Text style={{ marginTop: 4, fontSize: 18, fontWeight: "900", color: "#fff" }}>
              {isNearHome ? "Arriving any moment 🔔" : `Arriving in ${remainingMin} min`}
            </Text>
            <Text style={{ marginTop: 2, fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.6)" }}>
              Expected by <Text style={{ color: "rgba(255,255,255,0.85)", fontWeight: "700" }}>{etaClock}</Text>
              {addedMinutes > 0 && <Text style={{ color: "rgba(252,165,165,0.9)" }}> (pushed by traffic)</Text>}
            </Text>
          </View>
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 12, paddingVertical: 8, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, fontWeight: "700", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>ETA</Text>
            <Text style={{ fontSize: 18, fontWeight: "900", color: routeInTroubleMode ? "#FCA5A5" : "#6EE7B7" }}>{remainingMin} min</Text>
            <Text style={{ fontSize: 9, fontWeight: "500", color: "rgba(255,255,255,0.5)" }}>by {etaClock}</Text>
          </View>
        </View>
      </View>

      {/* SVG map */}
      <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
        <View style={{ borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#0b1222", position: "relative" }}>
          <Svg viewBox="0 0 400 220" width="100%" height={220} preserveAspectRatio="xMidYMid meet">
            <Defs>
              <SvgLinearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#34D399" />
                <Stop offset="50%" stopColor="#10B981" />
                <Stop offset="100%" stopColor="#22D3EE" />
              </SvgLinearGradient>
              <SvgLinearGradient id="route-grad-traffic" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#F59E0B" />
                <Stop offset="60%" stopColor="#EF4444" />
                <Stop offset="100%" stopColor="#B91C1C" />
              </SvgLinearGradient>
              <Pattern id="street-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <Path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1e293b" strokeWidth={0.6} />
              </Pattern>
            </Defs>

            <Rect width="400" height="220" fill="#0b1222" />
            <Rect width="400" height="220" fill="url(#street-grid)" opacity={0.9} />

            {/* Faint highways */}
            <Path d="M 0,75 Q 200,55 400,85" stroke="#1e293b" strokeWidth={6} fill="none" opacity={0.7} />
            <Path d="M 0,170 Q 180,190 400,160" stroke="#1e293b" strokeWidth={5} fill="none" opacity={0.6} />
            <Path d="M 120,0 L 120,220" stroke="#1e293b" strokeWidth={4} opacity={0.45} />
            <Path d="M 280,0 L 280,220" stroke="#1e293b" strokeWidth={4} opacity={0.45} />

            <SvgText x={60} y={40} fill="#334155" fontSize={8} fontWeight="700">WEST BLOCK</SvgText>
            <SvgText x={225} y={210} fill="#334155" fontSize={8} fontWeight="700">RIVERSIDE</SvgText>

            {/* Background track */}
            <Path d={ROUTE_PATH_D} fill="none" stroke="#1e293b" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />

            {/* Animated dashed (remaining) */}
            <AnimatedPath
              d={ROUTE_PATH_D}
              fill="none"
              stroke="#334155"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6,6"
              animatedProps={dashedProps}
            />

            {/* Covered */}
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
              <Circle r={14} fill="#10B981" opacity={0.22} />
              <Circle r={8} fill="#065F46" stroke="#10B981" strokeWidth={2} />
              <Circle r={2.5} fill="#A7F3D0" />
              <G x={10} y={-10}>
                <Rect x={0} y={-8} width={Math.min(80, ((storeName || "Store").length * 4.6) + 14)} height={14} rx={7} fill="#0f172a" stroke="#10B981" strokeOpacity={0.5} strokeWidth={1} />
                <SvgText x={7} y={2} fill="#A7F3D0" fontSize={8.5} fontWeight="700">{(storeName || "Store").slice(0, 14)}</SvgText>
              </G>
            </G>

            {/* Home pin */}
            <G x={HOME_POINT.x} y={HOME_POINT.y}>
              <Circle r={15} fill="#22D3EE" opacity={0.22} />
              <Circle r={9} fill="#0E7490" stroke="#22D3EE" strokeWidth={2} />
              <Path d="M -4,-1 L 0,-5 L 4,-1 L 4,4 L -4,4 Z" fill="#ECFEFF" />
              <G x={-44} y={-10}>
                <Rect x={0} y={-8} width={40} height={14} rx={7} fill="#0f172a" stroke="#22D3EE" strokeOpacity={0.5} strokeWidth={1} />
                <SvgText x={6} y={2} fill="#A5F3FC" fontSize={8.5} fontWeight="700">Home</SvgText>
              </G>
            </G>

            {/* Bubble */}
            {bubbleMsg && (() => {
              const w = Math.max(64, bubbleMsg.length * 5.2 + 16);
              const bx = Math.max(48, Math.min(352, scooter.x));
              const by = Math.max(24, scooter.y - 22);
              return (
                <G x={bx} y={by}>
                  <Rect x={-w / 2} y={-11} width={w} height={18} rx={9} fill="#0b1222" stroke={bubbleColor} strokeWidth={1.2} />
                  <SvgText x={0} y={3} fontSize={9} fontWeight="800" fill={bubbleColor} textAnchor="middle">{bubbleMsg}</SvgText>
                  <Path d="M -3 7 L 0 12 L 3 7 Z" fill="#0b1222" stroke={bubbleColor} strokeWidth={1} />
                </G>
              );
            })()}

            {/* Scooter */}
            <G x={scooter.x} y={scooter.y}>
              <G rotation={scooter.angle}>
                <Circle r={15} fill={routeInTroubleMode ? "#EF4444" : "#10B981"} opacity={0.18} />
                <Circle r={10} fill={routeInTroubleMode ? "#EF4444" : "#10B981"} opacity={0.28} />
                <Rect x={-8} y={-5} width={7} height={10} rx={1} fill="#C2824A" stroke="#7C4A1C" strokeWidth={0.6} />
                <Rect x={-2} y={-4} width={9} height={8} rx={3} fill="#111827" stroke="#374151" strokeWidth={0.6} />
                <Circle cx={4.5} cy={0} r={2.4} fill="#DC2626" stroke="#7F1D1D" strokeWidth={0.5} />
                <Circle cx={7.6} cy={0} r={0.9} fill="#FDE68A" opacity={0.9} />
              </G>
            </G>
          </Svg>

          {/* Proximity chip */}
          {proximityChip && (
            <View style={{ position: "absolute", bottom: 8, right: 8, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: proximityChip.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: proximityChip.fg }} />
              <Text style={{ fontSize: 10, fontWeight: "900", color: proximityChip.fg }}>{proximityChip.text}</Text>
            </View>
          )}
        </View>

        {/* Rider status card */}
        <View style={{ marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.05)", padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 9, fontWeight: "900", letterSpacing: 2.5, color: "rgba(110,231,183,0.8)", textTransform: "uppercase" }}>
                  Rider Status
                </Text>
                {mishap.active && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(239,68,68,0.15)", borderColor: "rgba(252,165,165,0.3)", borderWidth: 1, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999 }}>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#FCA5A5" }} />
                    <Text style={{ fontSize: 9, fontWeight: "700", color: "#FCA5A5" }}>{mishap.active.label}</Text>
                  </View>
                )}
              </View>
              <Text style={{ marginTop: 4, fontSize: 14, fontWeight: "900", color: "#fff" }}>
                {state.label} <Text style={{ color: "#6EE7B7" }}>({percent}%)</Text>
              </Text>
              <Text style={{ marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.7)" }} numberOfLines={2}>
                {mishap.active ? mishap.active.label : state.msg}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 9, fontWeight: "700", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                Distance
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>{remainingKm} km</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={{ marginTop: 12, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <LinearGradient
              colors={routeInTroubleMode ? ["#F59E0B", "#EF4444"] : ["#34D399", "#10B981", "#22D3EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: `${percent}%`, height: "100%", borderRadius: 3 }}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 12, marginBottom: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <View style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: "rgba(16,185,129,0.15)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="bicycle" size={16} color="#6EE7B7" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                Fulfilled by
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }} numberOfLines={1}>
                {storeName || "Your store"}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
              Arriving
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "900", color: routeInTroubleMode ? "#FCA5A5" : "#6EE7B7" }}>
              in {remainingMin} min
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
