import axiosInstance, { storeAccessToken } from "@/utils/axiosInstance";
import { mergeActivity } from "@/actions/activity";
import { haptic } from "@/utils/haptics";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "identifier" | "otp" | "name" | "success";

const PHONE_REGEX = /^[6-9]\d{9}$/;

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function LoginScreen() {
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const isPhone = PHONE_REGEX.test(identifier.trim());

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
      setTimer(45);
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

      // Fold any guest browsing history into the now-authenticated account.
      mergeActivity();

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
    if (!isPhone || isLoading) return;
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
    setTimer(45);
    sendOtpMutation.mutate();
    setTimeout(() => inputRefs.current[0]?.focus(), 180);
  };

  const handleCreateAccount = () => {
    if (fullName.trim().length < 2 || isLoading) return;
    haptic.press();
    verifyOtpMutation.mutate(fullName.trim());
  };

  const handleGoogleSignIn = () => {
    toast.success("Google sign-in coming soon!");
  };

  const renderHeader = () => (
    <View style={styles.brandHeader}>
      <Text style={styles.brandSlogan}>MEAT. FISH. REPEAT</Text>
      <Text style={styles.welcomeTitle}>Welcome back</Text>
      <Text style={styles.welcomeSubtitle}>Enter your mobile number to access.</Text>
    </View>
  );

  const renderGoogleSection = () => (
    <>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable onPress={handleGoogleSignIn} style={styles.googleButton}>
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.googleText}>Sign in with Google</Text>
      </Pressable>

      <View style={styles.trustRow}>
        <View style={styles.trustBadge}>
          <View style={styles.trustIconWrap}>
            <Ionicons name="shield-checkmark" size={18} color="#22C55E" />
          </View>
          <View>
            <Text style={styles.trustTitle}>SSL SECURED</Text>
            <Text style={styles.trustSub}>Your data is encrypted</Text>
          </View>
        </View>
        <View style={styles.trustBadge}>
          <View style={[styles.trustIconWrap, styles.trustIconBlue]}>
            <Ionicons name="trophy" size={18} color="#5A2C96" />
          </View>
          <View>
            <Text style={styles.trustTitle}>TOP RATED</Text>
            <Text style={styles.trustSub}>4.9/5 Butcher Score</Text>
          </View>
        </View>
      </View>

      <Text style={styles.termsText}>
        By continuing, you agree to our{" "}
        <Text
          style={styles.termsLink}
          onPress={() => Linking.openURL("https://fishstudio.app/terms")}
        >
          Terms of Service
        </Text>{" "}
        and{" "}
        <Text
          style={styles.termsLink}
          onPress={() => Linking.openURL("https://fishstudio.app/privacy")}
        >
          Privacy Policy
        </Text>
        . We value your trust and never share your data.
      </Text>
    </>
  );

  if (step === "identifier") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <View style={styles.topBar}>
            <View style={styles.flex} />
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderHeader()}

            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>MOBILE NUMBER</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryPill}>
                  <Text style={styles.countryPillText}>+91</Text>
                </View>
                <TextInput
                  ref={phoneRef}
                  style={styles.phoneInput}
                  placeholder="888-402-963-7"
                  placeholderTextColor="#AFAFAF"
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                  maxLength={10}
                />
              </View>

              {identifier.length > 2 && !isPhone && (
                <Text style={styles.errorText}>
                  Enter a valid 10-digit mobile number starting with 6–9
                </Text>
              )}

              <Pressable
                onPress={handleSendOtp}
                disabled={!isPhone || isLoading}
                style={({ pressed }) => [
                  styles.ctaButton,
                  (!isPhone || isLoading) && styles.ctaDisabled,
                  pressed && isPhone && styles.ctaPressed,
                ]}
              >
                <LinearGradient
                  colors={
                    isPhone && !isLoading
                      ? ["#4FC3F7", "#5A2C96"]
                      : ["#D1D5DB", "#D1D5DB"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.ctaText, !isPhone && styles.ctaTextDisabled]}>
                      Continue to FishStudio
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            {renderGoogleSection()}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (step === "otp") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => {
                haptic.press();
                setStep("identifier");
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color="#475569" />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderHeader()}

            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>MOBILE NUMBER</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryPill}>
                  <Text style={styles.countryPillText}>+91</Text>
                </View>
                <Text style={styles.phoneDisplay}>{identifier}</Text>
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 18 }]}>
                VERIFICATION CODE
              </Text>
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(r) => {
                      inputRefs.current[i] = r;
                    }}
                    style={[styles.otpBox, digit && styles.otpBoxFilled]}
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

              <View style={styles.resendRow}>
                {isLoading ? (
                  <ActivityIndicator color="#5A2C96" size="small" />
                ) : timer > 0 ? (
                  <Text style={styles.resendTimer}>
                    Resend code in {fmt(timer)}
                  </Text>
                ) : (
                  <Pressable
                    onPress={handleResend}
                    disabled={sendOtpMutation.isPending}
                  >
                    <Text style={styles.resendTimer}>Resend code</Text>
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={() => {
                  if (otp.join("").length === 4 && !isLoading) {
                    haptic.press();
                    verifyOtpMutation.mutate(undefined);
                  }
                }}
                disabled={otp.join("").length < 4 || isLoading}
                style={({ pressed }) => [
                  styles.ctaButton,
                  (otp.join("").length < 4 || isLoading) && styles.ctaDisabled,
                  pressed && otp.join("").length === 4 && styles.ctaPressed,
                ]}
              >
                <LinearGradient
                  colors={
                    otp.join("").length === 4 && !isLoading
                      ? ["#4FC3F7", "#5A2C96"]
                      : ["#D1D5DB", "#D1D5DB"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.ctaText,
                        otp.join("").length < 4 && styles.ctaTextDisabled,
                      ]}
                    >
                      Continue to FishStudio
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            {renderGoogleSection()}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (step === "name") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => {
                haptic.press();
                setStep("otp");
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color="#475569" />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.brandHeader}>
              <Text style={styles.brandSlogan}>MEAT. FISH. REPEAT</Text>
              <Text style={styles.welcomeTitle}>One last step</Text>
              <Text style={styles.welcomeSubtitle}>
                Tell us your name to personalize your experience.
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>YOUR NAME</Text>
              <View style={styles.phoneInputRow}>
                <TextInput
                  ref={nameRef}
                  style={[styles.phoneInput, { paddingHorizontal: 16 }]}
                  placeholder="Full name"
                  placeholderTextColor="#AFAFAF"
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
                  styles.ctaButton,
                  (fullName.trim().length < 2 || isLoading) && styles.ctaDisabled,
                  pressed && fullName.trim().length >= 2 && styles.ctaPressed,
                ]}
              >
                <LinearGradient
                  colors={
                    fullName.trim().length >= 2 && !isLoading
                      ? ["#4FC3F7", "#5A2C96"]
                      : ["#D1D5DB", "#D1D5DB"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.ctaText,
                        fullName.trim().length < 2 && styles.ctaTextDisabled,
                      ]}
                    >
                      Create Account
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.successWrap}>
        <LinearGradient
          colors={["#4FC3F7", "#5A2C96"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successIcon}
        >
          <Ionicons name="checkmark" size={42} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.welcomeTitle}>
          Welcome{isNewUser ? "!" : " back!"}
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Your fresh fish market is ready. Taking you to today&apos;s catch.
        </Text>
        <ActivityIndicator color="#5A2C96" style={{ marginTop: 22 }} />
      </View>
    </SafeAreaView>
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
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F4F0FF",
  },
  skipText: {
    color: "#5A2C96",
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  brandHeader: {
    marginTop: 8,
    marginBottom: 28,
  },
  brandSlogan: {
    color: "#5A2C96",
    fontFamily: "Inter-Bold",
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  welcomeTitle: {
    color: "#111827",
    fontFamily: "Inter-Bold",
    fontSize: 30,
    lineHeight: 36,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    color: "#6B7280",
    fontFamily: "Inter-Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  formSection: {
    marginBottom: 28,
  },
  fieldLabel: {
    color: "#9CA3AF",
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    overflow: "hidden",
    height: 56,
  },
  countryPill: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  countryPillText: {
    color: "#374151",
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    color: "#111827",
    fontFamily: "Inter-Regular",
    fontSize: 15,
  },
  phoneDisplay: {
    flex: 1,
    paddingHorizontal: 14,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
    fontSize: 15,
  },
  errorText: {
    color: "#DC2626",
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginTop: 6,
  },
  otpRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 72,
    backgroundColor: "#F3F4F6",
    borderRadius: 18,
    textAlign: "center",
    color: "#111827",
    fontFamily: "Inter-Bold",
    fontSize: 22,
    borderWidth: 2,
    borderColor: "transparent",
  },
  otpBoxFilled: {
    borderColor: "#5A2C96",
    backgroundColor: "#F4F0FF",
  },
  resendRow: {
    alignItems: "flex-end",
    marginTop: 8,
    marginBottom: 20,
  },
  resendTimer: {
    color: "#5A2C96",
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
  },
  ctaButton: {
    height: 56,
    borderRadius: 32,
    overflow: "hidden",
    marginTop: 4,
    shadowColor: "#5A2C96",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  ctaGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    color: "#FFFFFF",
    fontFamily: "Inter-Bold",
    fontSize: 16,
  },
  ctaTextDisabled: {
    color: "#9CA3AF",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    color: "#9CA3AF",
    fontFamily: "Inter-SemiBold",
    fontSize: 11,
    letterSpacing: 0.6,
    marginHorizontal: 10,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    marginBottom: 24,
    gap: 10,
  },
  googleIcon: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
    color: "#4285F4",
    letterSpacing: -0.5,
  },
  googleText: {
    color: "#374151",
    fontFamily: "Inter-SemiBold",
    fontSize: 15,
  },
  trustRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  trustBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 12,
  },
  trustIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  trustIconBlue: {
    backgroundColor: "#EDE9FE",
  },
  trustTitle: {
    color: "#111827",
    fontFamily: "Inter-Bold",
    fontSize: 11,
  },
  trustSub: {
    color: "#6B7280",
    fontFamily: "Inter-Regular",
    fontSize: 10,
  },
  termsText: {
    color: "#6B7280",
    fontFamily: "Inter-Regular",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  termsLink: {
    color: "#5A2C96",
    textDecorationLine: "underline",
  },
  successWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#5A2C96",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});
