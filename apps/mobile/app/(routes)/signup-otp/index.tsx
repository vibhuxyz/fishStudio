import axiosInstance from "@/utils/axiosInstance";
import { haptic } from "@/utils/haptics";
import { toast } from "@/utils/toast";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, useGlobalSearchParams } from "expo-router";
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

interface VerifyOTPData {
  otp: string;
  email: string;
  name: string;
  password: string;
}

interface ResendOTPData {
  email: string;
  name: string;
  password: string;
}

export default function SignupOtp() {
  const { width, height } = useWindowDimensions();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const { name, email, password } = useGlobalSearchParams<{
    name: string;
    email: string;
    password: string;
  }>();

  const compact = height < 720;
  const otpBoxSize = Math.max(48, Math.min(62, (width - 96) / 4));
  const isOTPComplete = otp.every((digit) => digit !== "");

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
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [float, pulse]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => {
        setCountdown((current) => current - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, canResend]);

  useEffect(() => {
    setCanResend(false);
    setCountdown(60);
  }, []);

  useEffect(() => {
    if (!name || !email || !password) {
      toast.error("Missing Information", {
        description: "Required signup data is missing. Please try again.",
      });
      router.back();
    }
  }, [name, email, password]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 220);
    return () => clearTimeout(timer);
  }, []);

  const verifyOtp = async (data: VerifyOTPData) => {
    try {
      const response = await axiosInstance.post("/auth/api/verify-user", {
        otp: data.otp,
        email: data.email,
        name: data.name,
        password: data.password,
      });
      return response.data;
    } catch (error) {
      console.error("OTP verification error:", error);

      if (isAxiosError(error)) {
        if (!error.response) {
          throw new Error("Network error. Please check your connection!");
        }

        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 400 || status === 422) {
          throw new Error(errorData?.message || "Invalid OTP or signup data");
        } else if (status === 404) {
          throw new Error(errorData?.message || "OTP expired or not found");
        } else if (status === 409) {
          throw new Error(errorData?.message || "User already exists");
        } else if (status === 429) {
          throw new Error(
            errorData?.message || "Too many attempts. Please try again later.",
          );
        } else if (status >= 500) {
          throw new Error(
            errorData?.message || "Server error. Please try again later.",
          );
        } else {
          throw new Error(errorData?.message || "OTP verification failed");
        }
      }

      throw new Error("An unexpected error occurred");
    }
  };

  const resendOTP = async (data: ResendOTPData) => {
    try {
      const response = await axiosInstance.post(
        "/auth/api/user-registration",
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Resend OTP error:", error);

      if (isAxiosError(error)) {
        if (!error.response) {
          throw new Error("Network error. Please check your connection.");
        }

        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 400 || status === 422) {
          throw new Error(errorData?.message || "Invalid email address");
        } else if (status === 429) {
          throw new Error(
            errorData?.message ||
              "Too many requests. Please wait before requesting again.",
          );
        } else if (status >= 500) {
          throw new Error(
            errorData?.message || "Server error. Please try again later.",
          );
        } else {
          throw new Error(errorData?.message || "Failed to resend OTP");
        }
      }

      throw new Error("An unexpected error occurred");
    }
  };

  const verifyOTPMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      toast.success("Welcome!", {
        description: `Account created successfully for ${name}!`,
      });
      haptic.success();
      router.replace("/(routes)/login");
    },
    onError: (error: Error) => {
      toast.error("Verification Failed", {
        description: error.message,
      });
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: resendOTP,
    onSuccess: () => {
      toast.success("OTP Sent!", {
        description: `A new OTP has been sent to ${email}.`,
      });
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      setCanResend(false);
      setCountdown(60);
    },
    onError: (error: Error) => {
      toast.error("Resend Failed", {
        description: error.message,
      });
    },
  });

  const isVerifying = verifyOTPMutation.isPending;
  const isResending = resendOTPMutation.isPending;

  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, "");
    const newOtp = [...otp];

    if (!digits) {
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    digits
      .slice(0, 4 - index)
      .split("")
      .forEach((digit, offset) => {
        newOtp[index + offset] = digit;
      });
    setOtp(newOtp);

    const nextFocus = Math.min(index + digits.length, 3);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    haptic.press();
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      toast.error("Invalid OTP", {
        description: "Please enter complete 4-digit OTP",
      });
      return;
    }

    if (!name || !email || !password) {
      toast.error("Missing Information", {
        description: "Required signup data is missing. Please try again.",
      });
      return;
    }

    verifyOTPMutation.mutate({
      otp: otpCode,
      email,
      name,
      password,
    });
  };

  const handleResendOTP = () => {
    if (!canResend || resendOTPMutation.isPending) return;

    haptic.press();
    if (!email) {
      toast.error("Missing Email", {
        description: "Email address is required to resend OTP.",
      });
      return;
    }

    resendOTPMutation.mutate({
      email: email as string,
      name: name as string,
      password: password as string,
    });
  };

  const handleGoBack = () => {
    haptic.press();
    router.back();
  };

  const handleSkip = () => {
    haptic.press();
    router.replace("/(tabs)");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
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
              outputRange: [0.18, 0.4],
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
        <View style={styles.topBar}>
          <Pressable onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#475569" />
          </Pressable>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="arrow-forward" size={14} color="#6C3CE1" />
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: Math.max(560, height - 108) },
            compact && styles.scrollContentCompact,
          ]}
        >
          <View style={styles.hero}>
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
                <MaterialCommunityIcons name="shield-check" size={42} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.brand}>FishStudio</Text>
            <Text style={styles.title}>Verify your fresh account</Text>
            <Text style={styles.subtitle}>
              Enter the 4-digit code sent to {email || "your email"}.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
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
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={4}
                  selectTextOnFocus
                  editable={!isVerifying}
                />
              ))}
            </View>

            <Pressable
              onPress={handleVerifyOtp}
              disabled={!isOTPComplete || isVerifying}
              style={({ pressed }) => [
                styles.primaryButton,
                (!isOTPComplete || isVerifying) && styles.buttonDisabled,
                pressed && isOTPComplete && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={
                  isOTPComplete && !isVerifying
                    ? ["#7C3AED", "#6C3CE1"]
                    : ["#E2E8F0", "#E2E8F0"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.primaryText,
                      !isOTPComplete && styles.primaryTextDisabled,
                    ]}
                  >
                    Verify OTP
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            <View style={styles.resendWrap}>
              <Text style={styles.mutedText}>Didn&apos;t receive the code?</Text>
              {canResend ? (
                <Pressable onPress={handleResendOTP} disabled={isResending}>
                  <Text
                    style={[
                      styles.resendText,
                      isResending && styles.resendTextDisabled,
                    ]}
                  >
                    {isResending ? "Sending..." : "Resend OTP"}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.timerText}>
                  Resend in {formatTime(countdown)}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  hero: {
    alignItems: "center",
    marginBottom: 22,
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
  title: {
    color: "#111827",
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    lineHeight: 34,
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
  primaryButton: {
    height: 56,
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 14,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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
  resendWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 6,
  },
  mutedText: {
    color: "#64748B",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    letterSpacing: 0,
    textAlign: "center",
  },
  resendText: {
    color: "#6C3CE1",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    letterSpacing: 0,
  },
  resendTextDisabled: {
    color: "#94A3B8",
  },
  timerText: {
    color: "#111827",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    letterSpacing: 0,
  },
});
