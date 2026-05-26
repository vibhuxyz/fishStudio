import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

type AnimatedSplashScreenProps = {
  onFinish: () => void;
};

const bubbles = [
  { size: 8, left: "18%", delay: 120, duration: 2200 },
  { size: 5, left: "30%", delay: 360, duration: 1900 },
  { size: 10, left: "72%", delay: 220, duration: 2400 },
  { size: 6, left: "82%", delay: 520, duration: 1800 },
] as const;

export default function AnimatedSplashScreen({
  onFinish,
}: AnimatedSplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(16)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  const bubbleAnimations = useMemo(
    () => bubbles.map(() => new Animated.Value(0)),
    [],
  );

  useEffect(() => {
    const loops = bubbleAnimations.map((animation, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(bubbles[index].delay),
          Animated.timing(animation, {
            toValue: 1,
            duration: bubbles[index].duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());

    Animated.loop(
      Animated.timing(wave, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ).start();

    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        damping: 10,
        stiffness: 90,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleY, {
        toValue: 0,
        duration: 650,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 520,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: 1650,
        delay: 260,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(onFinish);
    }, 2100);

    return () => {
      clearTimeout(timeout);
      loops.forEach((loop) => loop.stop());
    };
  }, [
    bubbleAnimations,
    exitOpacity,
    logoOpacity,
    logoScale,
    onFinish,
    progress,
    titleOpacity,
    titleY,
    wave,
  ]);

  const waveTranslate = wave.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 18],
  });

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["8%", "100%"],
  });

  return (
    <Animated.View style={[styles.screen, { opacity: exitOpacity }]}>
      <LinearGradient
        colors={["#F8FBFF", "#E7F8FA", "#FFFFFF"]}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.wave,
          styles.waveBack,
          { transform: [{ translateX: waveTranslate }] },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          styles.waveFront,
          { transform: [{ translateX: Animated.multiply(waveTranslate, -1) }] },
        ]}
      />

      {bubbles.map((bubble, index) => {
        const animation = bubbleAnimations[index];
        return (
          <Animated.View
            key={`${bubble.left}-${bubble.size}`}
            style={[
              styles.bubble,
              {
                width: bubble.size,
                height: bubble.size,
                borderRadius: bubble.size / 2,
                left: bubble.left,
                opacity: animation.interpolate({
                  inputRange: [0, 0.25, 1],
                  outputRange: [0, 0.7, 0],
                }),
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [80, -130],
                    }),
                  },
                  {
                    scale: animation.interpolate({
                      inputRange: [0, 0.4, 1],
                      outputRange: [0.65, 1, 0.82],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <LinearGradient
            colors={["#7C3AED", "#6C3CE1", "#22C55E"]}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <MaterialCommunityIcons name="fish" size={54} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.sparkle}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#F97316" />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleY }],
          }}
        >
          <Text style={styles.title}>FishStudio</Text>
          <Text style={styles.subtitle}>Fresh Fish & Meat</Text>
        </Animated.View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <Text style={styles.caption}>Live-cut. Fresh. Packed for you.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  wave: {
    position: "absolute",
    width: width * 1.2,
    height: 190,
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    bottom: -96,
  },
  waveBack: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    left: -width * 0.1,
  },
  waveFront: {
    backgroundColor: "rgba(108, 60, 225, 0.12)",
    left: -width * 0.16,
    bottom: -118,
  },
  bubble: {
    position: "absolute",
    bottom: 92,
    backgroundColor: "rgba(14, 165, 233, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoWrap: {
    marginBottom: 22,
    shadowColor: "#6C3CE1",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  logo: {
    width: 108,
    height: 108,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkle: {
    position: "absolute",
    right: -5,
    top: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  title: {
    color: "#1F2937",
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    letterSpacing: 0,
    textAlign: "center",
  },
  subtitle: {
    color: "#64748B",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 2,
  },
  progressTrack: {
    width: 178,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginTop: 34,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#6C3CE1",
  },
  caption: {
    color: "#22C55E",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 14,
  },
});
