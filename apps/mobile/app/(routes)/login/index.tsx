import axiosInstance, { storeAccessToken } from "@/utils/axiosInstance";
import { haptic } from "@/utils/haptics";
import { toast } from "@/utils/toast";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "identifier" | "otp" | "name" | "success";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(120);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const nameRef = useRef<TextInput>(null);
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const compact = height < 720;
  const otpBoxSize = Math.max(48, Math.min(62, (width - 96) / 4));
  const isEmail = EMAIL_REGEX.test(identifier.trim());
  const isPhone = PHONE_REGEX.test(identifier.trim());
  const isPhoneInput = /^\d+$/.test(identifier.trim()) && !identifier.includes("@");
  const isValid = isEmail || isPhone;
  const maskedIdentifier = isEmail ? identifier.trim() : `+91 ${identifier.trim()}`;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [float, pulse]);

  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/auth/api/send-otp", {
        identifier: identifier.trim(),
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "OTP sent successfully.");
      setIsNewUser(!!data.isNewUser);
      setStep("otp");
      setTimer(120);
      setTimeout(() => inputRefs.current[0]?.focus(), 220);
    },
    onError: (error: any) => {
      const msg = isAxiosError(error)
        ? error.response?.data?.message || "Failed to send OTP."
        : "Something went wrong.";
      toast.error(msg);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (name?: string) => {
      const { data } = await axiosInstance.post("/auth/api/verify-otp", {
        identifier: identifier.trim(),
        otp: otp.join(""),
        ...(name ? { name } : {}),
      });
      return data;
    },
    onSuccess: async (data) => {
      if (data.isNewUser && step === "otp") {
        setIsNewUser(true);
        setStep("name");
        setTimeout(() => nameRef.current?.focus(), 200);
        return;
      }

      const accessTokenToStore = data.accessToken || data.token;
      if (accessTokenToStore) {
        await storeAccessToken(accessTokenToStore);
      }

      if (data.refreshToken) {
        await SecureStore.setItemAsync("refresh_token", data.refreshToken);
      }

      if (data.user) {
        await SecureStore.setItemAsync(
          "user",
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email || "",
            phone: data.user.phone_number || "",
            avatar: data.user.avatar || null,
          }),
        );
      }

      setStep("success");
      haptic.success();
      setTimeout(() => router.replace("/(tabs)"), 1300);
    },
    onError: (error: any) => {
      const msg = isAxiosError(error)
        ? error.response?.data?.message || "OTP verification failed."
        : "Something went wrong.";
      toast.error(msg);
    },
  });

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  const handleSkip = () => {
    haptic.press();
    router.replace("/(tabs)");
  };

  const handleSendOtp = () => {
    if (!isValid || isLoading) return;
    haptic.press();
    sendOtpMutation.mutate();
  };

  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, "");
    const next = [...otp];

    if (!digits) {
      next[index] = "";
      setOtp(next);
      return;
    }

    digits
      .slice(0, 4 - index)
      .split("")
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });
    setOtp(next);

    const nextFocus = Math.min(index + digits.length, 3);
    inputRefs.current[nextFocus]?.focus();

    if (next.join("").length === 4 && !verifyOtpMutation.isPending) {
      setTimeout(() => verifyOtpMutation.mutate(undefined), 120);
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (sendOtpMutation.isPending) return;
    haptic.press();
    setOtp(["", "", "", ""]);
    setTimer(120);
    sendOtpMutation.mutate();
    setTimeout(() => inputRefs.current[0]?.focus(), 180);
  };

  const handleCreateAccount = () => {
    if (fullName.trim().length < 2 || isLoading) return;
    haptic.press();
    verifyOtpMutation.mutate(fullName.trim());
  };

  const renderTopBar = (showBack = false) => (
    <View style={styles.topBar}>
      {showBack ? (
        <Pressable
          onPress={() => {
            haptic.press();
            setStep(step === "name" ? "otp" : "identifier");
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color="#475569" />
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <Pressable onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
        <Ionicons name="arrow-forward" size={14} color="#6C3CE1" />
      </Pressable>
    </View>
  );

  const renderShell = (children: React.ReactNode, showBack = false) => (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#FFFFFF", "#F0FDFF", "#F7F3FF"]}
        locations={[0, 0.58, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.bubbleOne,
          {
            transform: [
              {
                translateY: float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -18],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bubbleTwo,
          {
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.44],
            }),
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94, 1.06],
                }),
              },
            ],
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {renderTopBar(showBack)}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: Math.max(560, height - 108) },
            compact && styles.scrollContentCompact,
          ]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  const renderBrandHero = (title: string, subtitle: string) => (
    <View style={[styles.hero, compact && styles.heroCompact]}>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            transform: [
              {
                translateY: float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -8],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={["#7C3AED", "#14B8A6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <MaterialCommunityIcons name="fish" size={42} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
      <Text style={styles.brand}>FishStudio</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </View>
  );

  if (step === "identifier") {
    return renderShell(
      <>
        {renderBrandHero(
          "Fresh fish starts here",
          "Log in for faster checkout, saved addresses, order tracking, and member offers.",
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Login or sign up</Text>
          <View style={styles.inputShell}>
            {isPhoneInput && (
              <View style={styles.countryCode}>
                <Text style={styles.countryText}>+91</Text>
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Phone number or email"
              placeholderTextColor="#94A3B8"
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType={isPhoneInput ? "phone-pad" : "email-address"}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
            />
          </View>

          {identifier.length > 2 && !isValid && (
            <Text style={styles.errorText}>
              {identifier.includes("@")
                ? "Enter a valid email address"
                : "Enter a valid 10-digit mobile number starting with 6-9"}
            </Text>
          )}

          <Pressable
            onPress={handleSendOtp}
            disabled={!isValid || isLoading}
            style={({ pressed }) => [
              styles.primaryButton,
              (!isValid || isLoading) && styles.buttonDisabled,
              pressed && isValid && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={
                isValid && !isLoading
                  ? ["#7C3AED", "#6C3CE1"]
                  : ["#E2E8F0", "#E2E8F0"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text
                    style={[
                      styles.primaryText,
                      !isValid && styles.primaryTextDisabled,
                    ]}
                  >
                    Get OTP
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={isValid ? "#FFFFFF" : "#94A3B8"}
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.trustRow}>
          <TrustPill icon="shield-check" label="Secure OTP" />
          <TrustPill icon="truck-fast" label="Quick checkout" />
          <TrustPill icon="fish" label="Fresh orders" />
        </View>

        <Text style={styles.terms}>
          By proceeding you agree to our Privacy Policy and Terms of Use.
        </Text>
      </>,
    );
  }

  if (step === "otp") {
    return renderShell(
      <>
        {renderBrandHero(
          "Enter your fresh code",
          `We sent a 4-digit OTP to ${maskedIdentifier}. It expires in 2 minutes.`,
        )}

        <View style={styles.card}>
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  inputRefs.current[i] = r;
                }}
                style={[
                  styles.otpInput,
                  {
                    width: otpBoxSize,
                    height: otpBoxSize,
                    borderRadius: Math.max(15, otpBoxSize * 0.28),
                  },
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(v) => handleOtpChange(v, i)}
                onKeyPress={({ nativeEvent }) =>
                  handleOtpKeyPress(nativeEvent.key, i)
                }
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                maxLength={4}
                selectTextOnFocus
                editable={!isLoading}
              />
            ))}
          </View>

          {isLoading ? (
            <View style={styles.loadingLine}>
              <ActivityIndicator color="#6C3CE1" />
              <Text style={styles.mutedText}>Verifying OTP...</Text>
            </View>
          ) : timer > 0 ? (
            <Text style={styles.centerText}>
              Resend OTP in <Text style={styles.strongText}>{fmt(timer)}</Text>
            </Text>
          ) : (
            <Pressable
              onPress={handleResend}
              disabled={sendOtpMutation.isPending}
              style={styles.secondaryButton}
            >
              <Ionicons name="refresh" size={17} color="#6C3CE1" />
              <Text style={styles.secondaryText}>Resend OTP</Text>
            </Pressable>
          )}
        </View>
      </>,
      true,
    );
  }

  if (step === "name") {
    return renderShell(
      <>
        {renderBrandHero(
          "One last detail",
          "Tell us your name so FishStudio can personalize your orders.",
        )}

        <View style={styles.card}>
          <View style={styles.newBadge}>
            <Ionicons name="sparkles" size={14} color="#6C3CE1" />
            <Text style={styles.newBadgeText}>New account</Text>
          </View>
          <View style={styles.inputShell}>
            <View style={styles.inputIcon}>
              <Ionicons name="person-outline" size={18} color="#64748B" />
            </View>
            <TextInput
              ref={nameRef}
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleCreateAccount}
            />
          </View>
          <Pressable
            onPress={handleCreateAccount}
            disabled={fullName.trim().length < 2 || isLoading}
            style={({ pressed }) => [
              styles.primaryButton,
              (fullName.trim().length < 2 || isLoading) && styles.buttonDisabled,
              pressed && fullName.trim().length >= 2 && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={
                fullName.trim().length >= 2 && !isLoading
                  ? ["#14B8A6", "#6C3CE1"]
                  : ["#E2E8F0", "#E2E8F0"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.primaryText,
                    fullName.trim().length < 2 && styles.primaryTextDisabled,
                  ]}
                >
                  Create Account
                </Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </>,
      true,
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#F0FDFF", "#FFFFFF", "#F7F3FF"]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.successBubble,
          {
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.18, 0.36],
            }),
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.88, 1.08],
                }),
              },
            ],
          },
        ]}
      />
      <View style={styles.successWrap}>
        <Animated.View
          style={{
            transform: [
              {
                translateY: float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
          }}
        >
          <LinearGradient
            colors={["#22C55E", "#14B8A6", "#6C3CE1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successIcon}
          >
            <Ionicons name="checkmark" size={42} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
        <View style={styles.welcomeBadge}>
          <MaterialCommunityIcons name="fish" size={16} color="#14B8A6" />
          <Text style={styles.welcomeBadgeText}>FishStudio ready</Text>
        </View>
        <Text style={styles.successTitle}>
          Welcome{isNewUser ? "!" : " back!"}
        </Text>
        <Text style={styles.heroSubtitle}>
          Your fresh fish market is ready. Taking you to today&apos;s catch.
        </Text>
        <ActivityIndicator color="#6C3CE1" style={styles.successLoader} />
      </View>
    </SafeAreaView>
  );
}

function TrustPill({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.trustPill}>
      <MaterialCommunityIcons name={icon} size={15} color="#14B8A6" />
      <Text style={styles.trustText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  topBar: {
    height: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backPlaceholder: {
    width: 42,
  },
  skipButton: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 15,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#F4F0FF",
    borderWidth: 1,
    borderColor: "#E7E5FF",
  },
  skipText: {
    color: "#6C3CE1",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    letterSpacing: 0,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    justifyContent: "center",
  },
  scrollContentCompact: {
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  bubbleOne: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    left: -74,
    top: 98,
    backgroundColor: "rgba(20, 184, 166, 0.16)",
  },
  bubbleTwo: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    right: -98,
    bottom: 72,
    backgroundColor: "rgba(108, 60, 225, 0.16)",
  },
  successBubble: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    alignSelf: "center",
    top: "21%",
    backgroundColor: "#14B8A6",
  },
  hero: {
    alignItems: "center",
    marginBottom: 22,
  },
  heroCompact: {
    marginBottom: 16,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 30,
    marginBottom: 14,
    shadowColor: "#6C3CE1",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  logoGradient: {
    flex: 1,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    color: "#111827",
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    letterSpacing: 0,
    marginBottom: 6,
  },
  heroTitle: {
    color: "#111827",
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0,
    textAlign: "center",
  },
  heroSubtitle: {
    color: "#64748B",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 330,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.93)",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardLabel: {
    color: "#334155",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    letterSpacing: 0,
    marginBottom: 10,
  },
  inputShell: {
    height: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  countryCode: {
    height: "100%",
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },
  countryText: {
    color: "#111827",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    letterSpacing: 0,
  },
  inputIcon: {
    height: "100%",
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    color: "#111827",
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    letterSpacing: 0,
  },
  errorText: {
    color: "#DC2626",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
    marginTop: 8,
  },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 14,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0,
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
  },
  primaryText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    letterSpacing: 0,
  },
  primaryTextDisabled: {
    color: "#94A3B8",
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    backgroundColor: "rgba(240, 253, 250, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  trustText: {
    color: "#334155",
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    letterSpacing: 0,
  },
  terms: {
    color: "#64748B",
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 18,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 8,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    color: "#111827",
    textAlign: "center",
    fontFamily: "Poppins-Bold",
    fontSize: 23,
    letterSpacing: 0,
  },
  otpInputFilled: {
    borderColor: "#6C3CE1",
    backgroundColor: "#F4F0FF",
  },
  loadingLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  mutedText: {
    color: "#64748B",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    letterSpacing: 0,
  },
  centerText: {
    color: "#64748B",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    letterSpacing: 0,
    textAlign: "center",
    marginTop: 14,
  },
  strongText: {
    color: "#111827",
    fontFamily: "Poppins-SemiBold",
  },
  secondaryButton: {
    height: 46,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E7E5FF",
    backgroundColor: "#F4F0FF",
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  secondaryText: {
    color: "#6C3CE1",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    letterSpacing: 0,
  },
  newBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
    backgroundColor: "#F4F0FF",
  },
  newBadgeText: {
    color: "#6C3CE1",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    letterSpacing: 0,
  },
  successWrap: {
    flex: 1,
    paddingHorizontal: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 94,
    height: 94,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: "#14B8A6",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  welcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(240, 253, 250, 0.94)",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    marginBottom: 12,
  },
  welcomeBadgeText: {
    color: "#0F766E",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    letterSpacing: 0,
  },
  successTitle: {
    color: "#111827",
    fontFamily: "Poppins-Bold",
    fontSize: 27,
    letterSpacing: 0,
    textAlign: "center",
  },
  successLoader: {
    marginTop: 22,
  },
});
