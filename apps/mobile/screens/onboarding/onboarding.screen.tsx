import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { haptic } from "@/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const floatingBubbles = [
  { size: 11, left: "10%", delay: 0, duration: 2800 },
  { size: 6, left: "24%", delay: 420, duration: 2200 },
  { size: 14, left: "78%", delay: 160, duration: 3000 },
  { size: 8, left: "88%", delay: 720, duration: 2400 },
] as const;

const products = [
  {
    colors: ["#67E8F9", "#0EA5E9"],
    icon: "fish",
    label: "Fresh fish",
  },
  {
    colors: ["#FDE68A", "#F97316"],
    icon: "food-steak",
    label: "Clean cuts",
  },
  {
    colors: ["#BBF7D0", "#22C55E"],
    icon: "truck-fast",
    label: "Fast delivery",
  },
] as const;

export default function OnboardingScreen() {
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(24)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const productDrift = useRef(new Animated.Value(0)).current;

  const bubbles = useMemo(
    () => floatingBubbles.map(() => new Animated.Value(0)),
    [],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        damping: 10,
        stiffness: 86,
        mass: 0.85,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentY, {
        toValue: 0,
        duration: 700,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 620,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(wave, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(productDrift, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(productDrift, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const loops = bubbles.map((animation, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(floatingBubbles[index].delay),
          Animated.timing(animation, {
            toValue: 1,
            duration: floatingBubbles[index].duration,
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

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [
    bubbles,
    contentOpacity,
    contentY,
    logoOpacity,
    logoScale,
    productDrift,
    wave,
  ]);

  const waveTranslate = wave.interpolate({
    inputRange: [0, 1],
    outputRange: [-22, 18],
  });

  const productTranslate = productDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8],
  });

  const handleGetStarted = () => {
    haptic.press();
    router.replace("/(tabs)");
  };

  const handleLogin = () => {
    haptic.press();
    router.replace("/(routes)/login");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#F0FDFF", "#ECFDF5"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.wave,
          styles.waveMint,
          { transform: [{ translateX: waveTranslate }] },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          styles.wavePurple,
          { transform: [{ translateX: Animated.multiply(waveTranslate, -1) }] },
        ]}
      />

      {floatingBubbles.map((bubble, index) => {
        const animation = bubbles[index];
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
                  inputRange: [0, 0.24, 1],
                  outputRange: [0, 0.74, 0],
                }),
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [130, -170],
                    }),
                  },
                  {
                    scale: animation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.72, 1, 0.82],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <View style={styles.brandMini}>
            <MaterialCommunityIcons name="fish" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.brandMiniText}>FishStudio</Text>
        </View>

        <View style={styles.hero}>
          <Animated.View
            style={[
              styles.logoShadow,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logoImage}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.productShelf,
              { transform: [{ translateX: productTranslate }] },
            ]}
          >
            {products.map((product, index) => (
              <LinearGradient
                key={index}
                colors={product.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.productTile,
                  index === 1 ? styles.productTileCenter : null,
                ]}
              >
                <View style={styles.productTileGlow} />
                <MaterialCommunityIcons
                  name={product.icon}
                  size={index === 1 ? 34 : 28}
                  color="#FFFFFF"
                />
                <Text style={styles.productTileText}>{product.label}</Text>
              </LinearGradient>
            ))}
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentY }],
            },
          ]}
        >
          <View style={styles.label}>
            <Ionicons name="sparkles" size={14} color="#6C3CE1" />
            <Text style={styles.labelText}>Fresh from trusted sellers</Text>
          </View>

          <Text style={styles.title}>Live-cut fresh fish, packed for you.</Text>
          <Text style={styles.subtitle}>
            Get hygienic seafood, quick delivery, and daily fresh arrivals in one
            clean FishStudio experience.
          </Text>

          <View style={styles.featureRow}>
            <FeaturePill icon="shield-check" label="Hygienic" />
            <FeaturePill icon="flash" label="Fast delivery" />
            <FeaturePill icon="fish" label="Fresh catch" />
          </View>

          <Pressable onPress={handleGetStarted} style={styles.primaryButton}>
            <LinearGradient
              colors={["#7C3AED", "#6C3CE1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryGradient}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleLogin} style={styles.secondaryButton}>
            <Ionicons name="person-outline" size={18} color="#6C3CE1" />
            <Text style={styles.secondaryButtonText}>Log in / Sign up</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function FeaturePill({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.featurePill}>
      <MaterialCommunityIcons name={icon} size={15} color="#22C55E" />
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 22,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
  },
  brandMini: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#6C3CE1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6C3CE1",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  brandMiniText: {
    marginLeft: 10,
    color: "#1F2937",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    letterSpacing: 0,
  },
  wave: {
    position: "absolute",
    width: width * 1.25,
    height: 210,
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
    left: -width * 0.12,
  },
  waveMint: {
    bottom: -82,
    backgroundColor: "rgba(34, 197, 94, 0.13)",
  },
  wavePurple: {
    bottom: -126,
    backgroundColor: "rgba(108, 60, 225, 0.12)",
  },
  bubble: {
    position: "absolute",
    bottom: 96,
    backgroundColor: "rgba(14, 165, 233, 0.24)",
    borderColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
  },
  hero: {
    flex: 1,
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
  },
  logoShadow: {
    width: 188,
    height: 188,
    borderRadius: 46,
    shadowColor: "#6C3CE1",
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 46,
  },
  productShelf: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  productTile: {
    width: 86,
    height: 92,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 9,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  productTileCenter: {
    width: 102,
    height: 108,
    marginBottom: 12,
  },
  productTileGlow: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    top: -20,
    right: -16,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  productTileText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0,
    marginTop: 8,
    textShadowColor: "rgba(15,23,42,0.18)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    paddingBottom: 24,
  },
  label: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F4F0FF",
    marginBottom: 14,
  },
  labelText: {
    color: "#6C3CE1",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    letterSpacing: 0,
  },
  title: {
    color: "#111827",
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    lineHeight: 39,
    letterSpacing: 0,
    textAlign: "center",
  },
  subtitle: {
    color: "#64748B",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 10,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 22,
    flexWrap: "wrap",
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    backgroundColor: "rgba(240, 253, 244, 0.92)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  featureText: {
    color: "#1F2937",
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    letterSpacing: 0,
  },
  primaryButton: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#6C3CE1",
    shadowOpacity: 0.26,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 10,
  },
  primaryGradient: {
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    letterSpacing: 0,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 17,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5FF",
  },
  secondaryButtonText: {
    color: "#6C3CE1",
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    letterSpacing: 0,
  },
});
