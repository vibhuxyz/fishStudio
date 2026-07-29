import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { IndicatorDot, RiseIn, Ripple } from "@/components/splash/motion";
import { colors, fonts, gradients } from "@/constants/theme";
import {
  BEAT,
  CELL_RATIO,
  CELL_W,
  CELLS_W,
  CHOREOGRAPHY_MS,
  CROSSFADE_MS,
  DECELERATE,
  GLOW_SIZE,
  HERO_BOX_H,
  HERO_H,
  HERO_PANEL_OVERLAP,
  LOGO_SIZE,
  OVERSHOOT,
  PANEL_H,
  px,
  py,
  SCREEN_W,
  TAGLINE_RATIO,
  TAGLINE_W,
  WIPE,
  WORDMARK_RATIO,
  WORDMARK_W,
} from "@/components/splash/layout";

// Worklets run on the UI thread and can't call back into `px`, so every distance
// they need is resolved to a plain number here.
const DRIFT_X = px(10);
const DRIFT_Y = px(14);
const LOGO_FLOAT_Y = px(5);
const HERO_RISE_Y = px(70);

const TRUST_CELLS = [
  { source: require("../../assets/splash-screen-assests/ic1.png"), label: "Fresh today" },
  { source: require("../../assets/splash-screen-assests/ic2.png"), label: "Hygienically processed" },
  { source: require("../../assets/splash-screen-assests/ic3.png"), label: "Fast and reliable delivery" },
  { source: require("../../assets/splash-screen-assests/ic4.png"), label: "Temperature controlled" },
];

type AnimatedSplashScreenProps = {
  /** Flips true once the app can render behind the splash. */
  ready: boolean;
  onFinish: () => void;
};

export default function AnimatedSplashScreen({
  ready,
  onFinish,
}: AnimatedSplashScreenProps) {
  const mountedAt = useRef(Date.now());

  const glow = useSharedValue(0);
  const driftRight = useSharedValue(0);
  const driftLeft = useSharedValue(0);
  const logoPop = useSharedValue(0);
  const logoFloat = useSharedValue(0);
  const wipe = useSharedValue(0);
  const hero = useSharedValue(0);
  const panel = useSharedValue(0);
  const exit = useSharedValue(1);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    driftRight.value = withRepeat(
      withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    driftLeft.value = withDelay(
      800,
      withRepeat(
        withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );

    logoPop.value = withDelay(
      BEAT.logo,
      withTiming(1, { duration: 750, easing: OVERSHOOT }),
    );
    logoFloat.value = withDelay(
      1200,
      withRepeat(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );

    wipe.value = withDelay(
      BEAT.wordmark,
      withTiming(1, { duration: 700, easing: WIPE }),
    );
    hero.value = withDelay(
      BEAT.hero,
      withTiming(1, { duration: 900, easing: DECELERATE }),
    );
    panel.value = withDelay(
      BEAT.panel,
      withTiming(1, { duration: 800, easing: DECELERATE }),
    );
  }, [driftLeft, driftRight, glow, hero, logoFloat, logoPop, panel, wipe]);

  // Never fake the progress: the loops keep running until the app reports ready,
  // and only then does the splash cross-fade away.
  useEffect(() => {
    if (!ready) return;

    const elapsed = Date.now() - mountedAt.current;
    const timer = setTimeout(
      () => {
        exit.value = withTiming(0, { duration: CROSSFADE_MS }, (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        });
      },
      Math.max(0, CHOREOGRAPHY_MS - elapsed),
    );

    return () => clearTimeout(timer);
  }, [exit, onFinish, ready]);

  const screenStyle = useAnimatedStyle(() => ({ opacity: exit.value }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.35, 0.75]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [1, 1.12]) }],
  }));

  const driftRightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: driftRight.value * DRIFT_X },
      { translateY: -driftRight.value * DRIFT_Y },
    ],
  }));

  const driftLeftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: driftLeft.value * DRIFT_X },
      { translateY: -driftLeft.value * DRIFT_Y },
    ],
  }));

  // The overshoot curve carries past 1, so extending the interpolation is what
  // produces the 1.07 scale kick and the small counter-rotation.
  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(logoPop.value, [0, 0.4], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: -logoFloat.value * LOGO_FLOAT_Y },
      { scale: interpolate(logoPop.value, [0, 1], [0.5, 1]) },
      { rotate: `${interpolate(logoPop.value, [0, 1], [-8, 0])}deg` },
    ],
  }));

  const wipeStyle = useAnimatedStyle(() => ({
    width: wipe.value * WORDMARK_W,
    opacity: interpolate(wipe.value, [0, 0.25], [0, 1], Extrapolation.CLAMP),
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: hero.value,
    transform: [
      { translateY: (1 - hero.value) * HERO_RISE_Y },
      { scale: interpolate(hero.value, [0, 1], [1.1, 1]) },
    ],
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - panel.value) * PANEL_H }],
  }));

  return (
    <Animated.View style={[styles.screen, screenStyle]}>
      <LinearGradient
        colors={gradients.lavender}
        locations={gradients.lavenderLocations}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={[styles.blob, styles.blobRight, driftRightStyle]} />
      <Animated.View style={[styles.blob, styles.blobLeft, driftLeftStyle]} />

      <View style={styles.logoSlot}>
        <Ripple delay={BEAT.ripple} />
        <Ripple delay={BEAT.ripple + BEAT.rippleStagger} />
        <Animated.Image
          source={require("../../assets/splash-screen-assests/logo.png")}
          style={[styles.logo, logoStyle]}
          accessibilityLabel="FishStudio"
        />
      </View>

      <Animated.View style={[styles.wordmarkClip, wipeStyle]}>
        <Image
          source={require("../../assets/splash-screen-assests/wm.png")}
          style={styles.wordmark}
        />
      </Animated.View>

      <RiseIn delay={BEAT.tagline} style={styles.taglineSlot}>
        <Image
          source={require("../../assets/splash-screen-assests/tag.png")}
          style={styles.tagline}
          accessibilityLabel="The fish and meat workshop"
        />
      </RiseIn>

      <View style={styles.cellsRow}>
        {TRUST_CELLS.map((cell, index) => (
          <RiseIn
            key={cell.label}
            delay={BEAT.cells + index * BEAT.cellStagger}
            duration={500}
          >
            <Image
              source={cell.source}
              style={styles.cell}
              resizeMode="contain"
              accessibilityLabel={cell.label}
            />
          </RiseIn>
        ))}
      </View>

      <Animated.View style={[styles.panel, panelStyle]}>
        <LinearGradient
          colors={gradients.panel}
          locations={gradients.panelLocations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <RiseIn delay={BEAT.headline} duration={600} easing={Easing.out(Easing.cubic)}>
          <Text style={styles.headline}>Premium quality.</Text>
        </RiseIn>
        <RiseIn
          delay={BEAT.headline + BEAT.headlineStagger}
          duration={600}
          easing={Easing.out(Easing.cubic)}
        >
          <Text style={styles.headline}>
            Freshness <Text style={styles.headlineAccent}>you can trust.</Text>
          </Text>
        </RiseIn>

        <RiseIn delay={BEAT.indicator} duration={500} style={styles.indicator}>
          <View style={styles.dotsRow}>
            <IndicatorDot delay={BEAT.indicator + 50} />
            <IndicatorDot delay={BEAT.indicator + 200} />
            <IndicatorDot delay={BEAT.indicator + 350} />
          </View>
        </RiseIn>

        <RiseIn delay={BEAT.hint} duration={600} easing={Easing.out(Easing.cubic)}>
          <Text style={styles.hint}>Preparing today&apos;s catch</Text>
        </RiseIn>
      </Animated.View>

      <Animated.View style={[styles.heroClip, heroStyle]}>
        <Image
          source={require("../../assets/splash-screen-assests/food.png")}
          style={styles.hero}
          accessibilityLabel="Fresh fish, meat and prawns on ice"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: colors.lavenderDeep,
  },
  glow: {
    position: "absolute",
    top: py(130),
    left: SCREEN_W / 2 - GLOW_SIZE / 2,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    backgroundColor: colors.brandGlow,
  },
  blob: {
    position: "absolute",
    borderRadius: px(60),
    backgroundColor: colors.brandGlowSoft,
  },
  blobRight: {
    right: px(26),
    top: py(74),
    width: px(120),
    height: px(64),
  },
  blobLeft: {
    left: px(22),
    top: py(186),
    width: px(90),
    height: px(56),
  },
  logoSlot: {
    position: "absolute",
    top: py(132),
    left: SCREEN_W / 2 - LOGO_SIZE / 2,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    shadowColor: colors.panelMid,
    shadowOpacity: 0.32,
    shadowRadius: px(30),
    shadowOffset: { width: 0, height: px(14) },
    elevation: 10,
  },
  // Left-anchored so the animated width reads as a left-to-right reveal rather
  // than a centred wipe.
  wordmarkClip: {
    position: "absolute",
    top: py(243),
    left: (SCREEN_W - WORDMARK_W) / 2,
    height: WORDMARK_W * WORDMARK_RATIO,
    overflow: "hidden",
  },
  wordmark: {
    width: WORDMARK_W,
    height: WORDMARK_W * WORDMARK_RATIO,
  },
  taglineSlot: {
    position: "absolute",
    top: py(288),
    left: (SCREEN_W - TAGLINE_W) / 2,
  },
  tagline: {
    width: TAGLINE_W,
    height: TAGLINE_W * TAGLINE_RATIO,
  },
  cellsRow: {
    position: "absolute",
    top: py(336),
    left: px(26),
    width: CELLS_W,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cell: {
    width: CELL_W,
    height: CELL_W * CELL_RATIO,
  },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: PANEL_H,
    paddingTop: py(44),
    alignItems: "center",
    overflow: "hidden",
  },
  headline: {
    color: colors.textWhite,
    fontFamily: fonts.displayRegular,
    fontSize: px(21),
    lineHeight: px(30),
    textAlign: "center",
  },
  headlineAccent: {
    color: colors.brandAccent,
  },
  indicator: {
    marginTop: px(16),
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: px(9),
  },
  hint: {
    marginTop: px(23),
    color: colors.onPanelMuted,
    fontFamily: fonts.displayMedium,
    fontSize: px(10.5),
    letterSpacing: px(1.7),
    textAlign: "center",
    textTransform: "uppercase",
  },
  heroClip: {
    position: "absolute",
    left: 0,
    width: SCREEN_W,
    height: HERO_BOX_H,
    bottom: PANEL_H - HERO_PANEL_OVERLAP,
    overflow: "hidden",
  },
  // Pinned to the bottom of the box so a short screen crops the sky, never the
  // purple curve the panel has to meet.
  hero: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_W,
    height: HERO_H,
  },
});
