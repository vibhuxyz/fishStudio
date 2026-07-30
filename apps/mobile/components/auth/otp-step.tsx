import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  authScreen,
  colors,
  fonts,
  fontSizes,
  gradients,
  spacing,
} from "@/constants/theme";
import { haptic } from "@/utils/haptics";
import { toast } from "@/utils/toast";
import { BrandLockup } from "./brand-lockup";

const formatCountdown = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

const formatPhone = (phone: string) =>
  phone.length === 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : `+91 ${phone}`;

type OtpStepProps = {
  identifier: string;
  otp: string[];
  onChange: (next: string[]) => void;
  onComplete: (code: string) => void;
  timer: number;
  isLoading: boolean;
  onResend: () => void;
  onChangeNumber: () => void;
};

export function OtpStep({
  identifier,
  otp,
  onChange,
  onComplete,
  timer,
  isLoading,
  onResend,
  onChangeNumber,
}: OtpStepProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const isEmail = identifier.includes("@");

  const handleDigit = (value: string, index: number) => {
    const digits = value.replace(/\D/g, "");
    const next = [...otp];

    if (!digits) {
      next[index] = "";
      onChange(next);
      return;
    }

    // Paste and SMS autofill arrive as one blob, so spread them across boxes.
    digits
      .slice(0, otp.length - index)
      .split("")
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });
    onChange(next);

    const nextFocus = Math.min(index + digits.length, otp.length - 1);
    inputRefs.current[nextFocus]?.focus();

    const code = next.join("");
    if (code.length === otp.length && !isLoading) {
      setTimeout(() => onComplete(code), 120);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={gradients.lavender}
        locations={gradients.lavenderLocations}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={["top"]} style={styles.flex}>
        <View style={styles.topBar}>
          <Pressable onPress={onChangeNumber} hitSlop={14}>
            <Ionicons
              name="arrow-back"
              size={authScreen.backSize}
              color={colors.brandMark}
            />
          </Pressable>
          <Pressable onPress={onChangeNumber} hitSlop={14}>
            <Text style={styles.changeNumber}>{isEmail ? "Change Email" : "Change Number"}</Text>
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <BrandLockup
            variant="inline"
            markSize={authScreen.markSize}
            wordmarkWidth={authScreen.inlineWordmarkWidth}
            style={styles.lockup}
          />

          <Text style={styles.title}>{isEmail ? "Verify your email" : "Verify your mobile number"}</Text>
          <Text style={styles.subtitle}>
            We have sent a {otp.length} digit OTP to
          </Text>
          <Text style={styles.phone}>{isEmail ? identifier : formatPhone(identifier)}</Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                style={[styles.otpBox, !!digit && styles.otpBoxFilled]}
                value={digit}
                onChangeText={(value) => handleDigit(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={otp.length}
                selectTextOnFocus
                editable={!isLoading}
                autoFocus={index === 0}
              />
            ))}
          </View>

          <View style={styles.resendRow}>
            {isLoading ? (
              <ActivityIndicator color={colors.brandMark} size="small" />
            ) : timer > 0 ? (
              <Text style={styles.resendIdle}>
                Resend OTP in{" "}
                <Text style={styles.resendTimer}>{formatCountdown(timer)}</Text>
              </Text>
            ) : (
              <Pressable
                onPress={() => {
                  haptic.press();
                  onResend();
                }}
              >
                <Text style={styles.resendAction}>Resend OTP</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.safetyCard}>
            <Ionicons
              name="shield-checkmark"
              size={spacing[10]}
              color={colors.brandMark}
            />
            <View style={styles.safetyCopy}>
              <Text style={styles.safetyTitle}>Your data is 100% safe</Text>
              <Text style={styles.safetyBody}>
                We never share your details with anyone.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              haptic.press();
              toast.success("Support chat coming soon!");
            }}
            style={styles.helpRow}
          >
            <Ionicons
              name="headset-outline"
              size={fontSizes.xl}
              color={colors.brandMark}
            />
            <Text style={styles.helpText}>Didn&apos;t receive OTP? </Text>
            <Text style={styles.helpLink}>Get help</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.footerNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={authScreen.chevronSize}
            color={colors.brandMark}
          />
          <Text style={styles.footerNoteText}>
            Your privacy and security are our top priority.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.lavenderTop,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[5] + 2,
    paddingTop: spacing[1] + 2,
    paddingBottom: spacing[2] + 2,
  },
  changeNumber: {
    color: colors.brandMark,
    fontFamily: fonts.displaySemiBold,
    fontSize: fontSizes.md,
  },
  scrollContent: {
    paddingHorizontal: spacing[6] + 2,
    paddingBottom: spacing[6],
  },
  lockup: {
    marginTop: spacing[4] + 2,
  },
  title: {
    marginTop: spacing[8] - 2,
    color: colors.inkStrong,
    fontFamily: fonts.displaySemiBold,
    fontSize: authScreen.titleSize,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing[3],
    color: colors.inkSoft,
    fontFamily: fonts.displayRegular,
    fontSize: authScreen.bodySize,
    textAlign: "center",
  },
  phone: {
    marginTop: spacing[1] + 1,
    color: colors.brandMark,
    fontFamily: fonts.displaySemiBold,
    fontSize: fontSizes.xl,
    textAlign: "center",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[3],
    marginTop: spacing[6] + 2,
  },
  otpBox: {
    width: authScreen.otpBoxWidth,
    height: authScreen.otpBoxHeight,
    borderRadius: authScreen.otpBoxRadius,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    textAlign: "center",
    color: colors.inkStrong,
    fontFamily: fonts.displayMedium,
    fontSize: authScreen.otpDigitSize,
  },
  otpBoxFilled: {
    borderColor: colors.brandMark,
  },
  resendRow: {
    alignItems: "center",
    marginTop: spacing[5] + 2,
    minHeight: spacing[5],
  },
  resendIdle: {
    color: colors.inkSoft,
    fontFamily: fonts.displayRegular,
    fontSize: authScreen.bodySize,
  },
  resendTimer: {
    color: colors.brandMark,
    fontFamily: fonts.displaySemiBold,
  },
  resendAction: {
    color: colors.brandMark,
    fontFamily: fonts.displaySemiBold,
    fontSize: authScreen.bodySize,
  },
  safetyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    marginTop: spacing[6] + 2,
    padding: spacing[4] + 2,
    borderRadius: authScreen.cardRadius,
    backgroundColor: colors.lavenderMid,
  },
  safetyCopy: {
    flex: 1,
  },
  safetyTitle: {
    color: colors.inkStrong,
    fontFamily: fonts.displaySemiBold,
    fontSize: fontSizes.body,
  },
  safetyBody: {
    marginTop: 3,
    color: colors.inkSoft,
    fontFamily: fonts.displayRegular,
    fontSize: authScreen.bodySize,
    lineHeight: authScreen.bodyLine,
  },
  helpRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1] + 2,
    marginTop: spacing[6],
  },
  helpText: {
    color: colors.inkSoft,
    fontFamily: fonts.displayRegular,
    fontSize: authScreen.bodySize,
  },
  helpLink: {
    color: colors.brandMark,
    fontFamily: fonts.displaySemiBold,
    fontSize: authScreen.bodySize,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2] - 1,
    paddingVertical: spacing[3],
  },
  footerNoteText: {
    color: colors.inkSoft,
    fontFamily: fonts.displayRegular,
    fontSize: authScreen.captionSize,
  },
});
