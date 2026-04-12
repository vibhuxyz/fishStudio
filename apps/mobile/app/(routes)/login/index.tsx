import axiosInstance, { storeAccessToken } from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "@/utils/toast";

type Step = "identifier" | "otp" | "name" | "success";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function LoginScreen() {
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(120);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const nameRef = useRef<TextInput>(null);

  const isEmail = EMAIL_REGEX.test(identifier.trim());
  const isPhone = PHONE_REGEX.test(identifier.trim());
  const isPhoneInput = /^\d+$/.test(identifier.trim()) && !identifier.includes("@");
  const isValid = isEmail || isPhone;

  /* ── OTP countdown ── */
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const id = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(id);
    }
  }, [step, timer]);

  /* ── send-otp mutation ── */
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
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    },
    onError: (error: any) => {
      const msg = isAxiosError(error)
        ? error.response?.data?.message || "Failed to send OTP."
        : "Something went wrong.";
      toast.error(msg);
    },
  });

  /* ── verify-otp mutation ── */
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
      // New user after OTP step → collect name
      if (data.isNewUser && step === "otp") {
        setIsNewUser(true);
        setStep("name");
        setTimeout(() => nameRef.current?.focus(), 150);
        return;
      }

      // Store tokens and user
      if (data.accessToken) {
        await storeAccessToken(data.accessToken);
      }
      if (data.refreshToken) {
        await SecureStore.setItemAsync("refresh_token", data.refreshToken);
      }
      if (data.user) {
        await SecureStore.setItemAsync("user", JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || "",
          phone: data.user.phone_number || "",
          avatar: data.user.avatar || null,
        }));
      }

      setStep("success");
      setTimeout(() => router.replace("/(tabs)"), 1500);
    },
    onError: (error: any) => {
      const msg = isAxiosError(error)
        ? error.response?.data?.message || "OTP verification failed."
        : "Something went wrong.";
      toast.error(msg);
    },
  });

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  /* ── OTP handlers ── */
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
    if (next.join("").length === 4 && !verifyOtpMutation.isPending) {
      setTimeout(() => verifyOtpMutation.mutate(undefined), 100);
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setOtp(["", "", "", ""]);
    setTimer(120);
    sendOtpMutation.mutate();
    setTimeout(() => inputRefs.current[0]?.focus(), 150);
  };

  const maskedIdentifier = isEmail ? identifier.trim() : `+91 ${identifier.trim()}`;

  /* ════════════════════════════════════════════
      STEP: IDENTIFIER
  ════════════════════════════════════════════ */
  if (step === "identifier") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-6 justify-center">
            {/* Logo / branding */}
            <View className="items-center mb-10">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Text className="text-3xl">🐟</Text>
              </View>
              <Text className="text-2xl font-poppins-bold text-foreground">
                Fish Studio
              </Text>
              <Text className="text-sm font-poppins text-muted-foreground mt-1">
                Fresh Fish & Meat
              </Text>
            </View>

            <Text className="text-xl font-poppins-bold text-foreground mb-1">
              Login or Sign up
            </Text>
            <Text className="text-sm font-poppins text-muted-foreground mb-8">
              Enter your phone number or email to continue
            </Text>

            {/* Identifier input */}
            <View
              className="flex-row items-center border border-border rounded-xl overflow-hidden mb-3"
              style={{ height: 52 }}
            >
              {isPhoneInput && (
                <View className="px-3 border-r border-border bg-muted h-full justify-center">
                  <Text className="text-sm font-poppins-semibold text-foreground">
                    +91
                  </Text>
                </View>
              )}
              <TextInput
                className="flex-1 px-4 text-sm font-poppins text-foreground"
                placeholder="Phone number or email"
                placeholderTextColor="#94a3b8"
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType={isPhoneInput ? "phone-pad" : "email-address"}
                autoCapitalize="none"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => isValid && sendOtpMutation.mutate()}
              />
            </View>

            {identifier.length > 2 && !isValid && (
              <Text className="text-destructive text-xs font-poppins mb-2">
                {identifier.includes("@")
                  ? "Enter a valid email address"
                  : "Enter a valid 10-digit mobile number (starts with 6–9)"}
              </Text>
            )}

            <TouchableOpacity
              className={`rounded-xl py-4 items-center mt-3 ${
                isValid && !isLoading ? "bg-primary" : "bg-muted"
              }`}
              onPress={() => isValid && sendOtpMutation.mutate()}
              disabled={!isValid || isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className={`text-base font-poppins-semibold ${
                    isValid ? "text-white" : "text-muted-foreground"
                  }`}
                >
                  Get OTP
                </Text>
              )}
            </TouchableOpacity>

            <Text className="text-center text-xs font-poppins text-muted-foreground mt-6 leading-5">
              By proceeding you agree to our{" "}
              <Text className="font-poppins-semibold text-foreground">
                Privacy Policy
              </Text>{" "}
              &{" "}
              <Text className="font-poppins-semibold text-foreground">
                Terms of Use
              </Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ════════════════════════════════════════════
      STEP: OTP
  ════════════════════════════════════════════ */
  if (step === "otp") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-6">
            {/* Back */}
            <TouchableOpacity
              className="mt-6 mb-8 flex-row items-center gap-1 w-fit"
              onPress={() => setStep("identifier")}
            >
              <Ionicons name="arrow-back" size={18} color="#64748b" />
              <Text className="text-sm font-poppins text-muted-foreground">
                Back
              </Text>
            </TouchableOpacity>

            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
                <Ionicons name="shield-checkmark" size={40} color="#6C3CE1" />
              </View>
              <Text className="text-xl font-poppins-bold text-foreground text-center">
                Enter OTP
              </Text>
              <Text className="text-sm font-poppins text-muted-foreground text-center mt-1">
                Sent to{" "}
                <Text className="text-primary font-poppins-semibold">
                  {maskedIdentifier}
                </Text>
              </Text>
              <Text className="text-xs font-poppins text-muted-foreground text-center mt-1">
                4-digit code — expires in 2 minutes
              </Text>
            </View>

            {/* OTP boxes */}
            <View className="flex-row justify-center gap-4 mb-6">
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { inputRefs.current[i] = r; }}
                  className={`w-16 h-16 border-2 rounded-xl text-center text-2xl font-poppins-bold ${
                    digit
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-white text-foreground"
                  }`}
                  value={digit}
                  onChangeText={(v) => handleOtpChange(v, i)}
                  onKeyPress={({ nativeEvent }) =>
                    handleOtpKeyPress(nativeEvent.key, i)
                  }
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!isLoading}
                />
              ))}
            </View>

            {isLoading && (
              <View className="items-center mb-4">
                <ActivityIndicator color="#6C3CE1" />
                <Text className="text-sm font-poppins text-muted-foreground mt-2">
                  Verifying…
                </Text>
              </View>
            )}

            {/* Timer / Resend */}
            <View className="items-center">
              {timer > 0 ? (
                <Text className="text-sm font-poppins text-muted-foreground">
                  Resend OTP in{" "}
                  <Text className="font-poppins-semibold text-foreground">
                    {fmt(timer)}
                  </Text>
                </Text>
              ) : (
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="border border-border rounded-xl px-5 py-2.5 flex-row items-center gap-1.5"
                    onPress={handleResend}
                    disabled={sendOtpMutation.isPending}
                  >
                    <Ionicons name="chatbubble-outline" size={14} color="#475569" />
                    <Text className="text-sm font-poppins-semibold text-foreground">
                      SMS
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="border border-border rounded-xl px-5 py-2.5 flex-row items-center gap-1.5"
                    onPress={handleResend}
                    disabled={sendOtpMutation.isPending}
                  >
                    <Ionicons name="call-outline" size={14} color="#475569" />
                    <Text className="text-sm font-poppins-semibold text-foreground">
                      Call
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ════════════════════════════════════════════
      STEP: NAME (new users)
  ════════════════════════════════════════════ */
  if (step === "name") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-6">
            <TouchableOpacity
              className="mt-6 mb-8 flex-row items-center gap-1 w-fit"
              onPress={() => setStep("otp")}
            >
              <Ionicons name="arrow-back" size={18} color="#64748b" />
              <Text className="text-sm font-poppins text-muted-foreground">
                Back
              </Text>
            </TouchableOpacity>

            <View className="mb-6">
              <View className="self-start px-3 py-1 rounded-full bg-primary/10 mb-4">
                <Text className="text-xs font-poppins-semibold text-primary">
                  🎉 New account
                </Text>
              </View>
              <Text className="text-2xl font-poppins-bold text-foreground">
                What's your name?
              </Text>
              <Text className="text-sm font-poppins text-muted-foreground mt-1">
                Just this once — so we know what to call you!
              </Text>
            </View>

            {/* Name input */}
            <View
              className="flex-row items-center border border-border rounded-xl overflow-hidden mb-4"
              style={{ height: 52 }}
            >
              <View className="px-3 border-r border-border bg-muted h-full justify-center">
                <Ionicons name="person-outline" size={18} color="#64748b" />
              </View>
              <TextInput
                ref={nameRef}
                className="flex-1 px-4 text-sm font-poppins text-foreground"
                placeholder="e.g. Arjun Sharma"
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={() =>
                  fullName.trim().length >= 2 &&
                  verifyOtpMutation.mutate(fullName.trim())
                }
              />
            </View>

            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${
                fullName.trim().length >= 2 && !isLoading
                  ? "bg-primary"
                  : "bg-muted"
              }`}
              onPress={() => verifyOtpMutation.mutate(fullName.trim())}
              disabled={fullName.trim().length < 2 || isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className={`text-base font-poppins-semibold ${
                    fullName.trim().length >= 2
                      ? "text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  /* ════════════════════════════════════════════
      STEP: SUCCESS
  ════════════════════════════════════════════ */
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6 gap-4">
        <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center">
          <Text className="text-4xl">✅</Text>
        </View>
        <Text className="text-2xl font-poppins-bold text-foreground">
          Welcome{isNewUser ? "!" : " back!"}
        </Text>
        <Text className="text-sm font-poppins text-muted-foreground text-center">
          You're all set. Enjoy fresh fish & meat delivered to your door 🐟
        </Text>
        <ActivityIndicator color="#6C3CE1" className="mt-4" />
      </View>
    </SafeAreaView>
  );
}
