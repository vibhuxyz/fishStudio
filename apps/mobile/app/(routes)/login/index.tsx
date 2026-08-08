import { mergeActivity } from "@/actions/activity";
import { NameStep } from "@/components/auth/name-step";
import { OtpStep } from "@/components/auth/otp-step";
import { PhoneStep } from "@/components/auth/phone-step";
import { SuccessStep } from "@/components/auth/success-step";
import { useUserStore } from "@/lib/user-store";
import axiosInstance, { storeAccessToken } from "@/utils/axiosInstance";
import { haptic } from "@/utils/haptics";
import { NOTIFICATION_ONBOARDING_SEEN_KEY } from "@/utils/push-notifications";
import { toast } from "@/utils/toast";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, type Href } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";

type Step = "identifier" | "otp" | "name" | "success";

const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// auth-service issues a 4-digit code (crypto.randomInt(1000, 10000)) and the
// shared zod schema enforces the same length.
const OTP_LENGTH = 4;
const RESEND_SECONDS = 45;

const emptyOtp = () => Array<string>(OTP_LENGTH).fill("");

export default function LoginScreen() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [otp, setOtp] = useState<string[]>(emptyOtp);
  // Kept so the name step can replay the code that already passed verification.
  const [verifiedCode, setVerifiedCode] = useState("");
  const [timer, setTimer] = useState(RESEND_SECONDS);

  const isPhone = PHONE_REGEX.test(identifier.trim());
  const isEmail = EMAIL_REGEX.test(identifier.trim());
  const isValid = isPhone || isEmail;

  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const id = setInterval(() => setTimer((previous) => previous - 1), 1000);
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
      setTimer(RESEND_SECONDS);
    },
    onError: (error: unknown) => {
      const message = isAxiosError(error)
        ? error.response?.data?.message || "Failed to send OTP."
        : "Something went wrong.";
      toast.error(message);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({
      code,
      name,
      referralCode,
    }: {
      code: string;
      name?: string;
      referralCode?: string;
    }) => {
      const { data } = await axiosInstance.post("/auth/api/verify-otp", {
        identifier: identifier.trim(),
        otp: code,
        ...(name ? { name } : {}),
        ...(referralCode ? { referralCode } : {}),
      });
      return data;
    },
    onSuccess: async (data, variables) => {
      if (data.isNewUser && step === "otp") {
        setIsNewUser(true);
        setVerifiedCode(variables.code);
        setStep("name");
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
        // Go through the store, not SecureStore directly: useUser() only reads
        // from disk once per launch, so writing the key behind its back leaves
        // every consumer showing a logged-out state until the app restarts.
        await useUserStore.getState().updateUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || "",
          phone: data.user.phone_number || "",
          avatar: data.user.avatar || undefined,
        });
      }

      // Fold any guest browsing history into the now-authenticated account.
      mergeActivity();

      setStep("success");
      haptic.success();
      setTimeout(async () => {
        const hasSeenNotificationPrompt = await AsyncStorage.getItem(
          NOTIFICATION_ONBOARDING_SEEN_KEY,
        );
        if (!hasSeenNotificationPrompt) {
          router.replace("/(routes)/notification-permissions");
          return;
        }
        router.replace(redirect && redirect.startsWith("/") ? (redirect as Href) : "/(tabs)");
      }, 1300);
    },
    onError: (error: unknown) => {
      const message = isAxiosError(error)
        ? error.response?.data?.message || "OTP verification failed."
        : "Something went wrong.";
      toast.error(message);
    },
  });

  const isLoading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  const handleSkip = () => {
    haptic.press();
    router.replace("/(tabs)");
  };

  const handleChangeNumber = () => {
    haptic.press();
    setOtp(emptyOtp());
    setStep("identifier");
  };

  const handleResend = () => {
    if (sendOtpMutation.isPending) return;
    setOtp(emptyOtp());
    setTimer(RESEND_SECONDS);
    sendOtpMutation.mutate();
  };

  if (step === "otp") {
    return (
      <OtpStep
        identifier={identifier.trim()}
        otp={otp}
        onChange={setOtp}
        onComplete={(code) => verifyOtpMutation.mutate({ code })}
        timer={timer}
        isLoading={isLoading}
        onResend={handleResend}
        onChangeNumber={handleChangeNumber}
      />
    );
  }

  if (step === "name") {
    return (
      <NameStep
        fullName={fullName}
        onChangeFullName={setFullName}
        referralCode={referralCode}
        onChangeReferralCode={setReferralCode}
        isLoading={isLoading}
        onSubmit={() =>
          verifyOtpMutation.mutate({
            code: verifiedCode,
            name: fullName.trim(),
            referralCode: referralCode.trim() || undefined,
          })
        }
        onBack={() => setStep("otp")}
      />
    );
  }

  if (step === "success") {
    return <SuccessStep isNewUser={isNewUser} />;
  }

  return (
    <PhoneStep
      identifier={identifier}
      onChangeIdentifier={setIdentifier}
      isValid={isValid}
      isLoading={isLoading}
      onSubmit={() => sendOtpMutation.mutate()}
      onSkip={handleSkip}
    />
  );
}
