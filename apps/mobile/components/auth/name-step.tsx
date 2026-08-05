import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
import { BrandLockup } from "./brand-lockup";

type NameStepProps = {
  fullName: string;
  onChangeFullName: (value: string) => void;
  referralCode: string;
  onChangeReferralCode: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  onBack: () => void;
};

export function NameStep({
  fullName,
  onChangeFullName,
  referralCode,
  onChangeReferralCode,
  isLoading,
  onSubmit,
  onBack,
}: NameStepProps) {
  const nameRef = useRef<TextInput>(null);
  const canContinue = fullName.trim().length >= 2 && !isLoading;

  useEffect(() => {
    const focus = setTimeout(() => nameRef.current?.focus(), 200);
    return () => clearTimeout(focus);
  }, []);

  const handleSubmit = () => {
    if (!canContinue) return;
    haptic.press();
    onSubmit();
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
          <Pressable onPress={onBack} hitSlop={14}>
            <Ionicons
              name="arrow-back"
              size={authScreen.backSize}
              color={colors.brandMark}
            />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.body}
        >
          <BrandLockup
            variant="inline"
            markSize={authScreen.markSize}
            wordmarkWidth={authScreen.inlineWordmarkWidth}
            style={styles.lockup}
          />

          <Text style={styles.title}>One last step</Text>
          <Text style={styles.subtitle}>
            Tell us your name so we can personalise your orders.
          </Text>

          <Text style={styles.fieldLabel}>Your Name</Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="person-outline"
              size={authScreen.fieldIconSize}
              color={colors.brandMark}
            />
            <TextInput
              ref={nameRef}
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textPlaceholder}
              value={fullName}
              onChangeText={onChangeFullName}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <Text style={styles.fieldLabel}>Referral Code (optional)</Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="gift-outline"
              size={authScreen.fieldIconSize}
              color={colors.brandMark}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter a friend's referral code"
              placeholderTextColor={colors.textPlaceholder}
              value={referralCode}
              onChangeText={(t) => onChangeReferralCode(t.toUpperCase())}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canContinue}
            activeOpacity={0.85}
            style={[styles.cta, !canContinue && styles.ctaDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <>
                <Text style={styles.ctaText}>Create Account</Text>
                <Ionicons
                  name="arrow-forward"
                  size={authScreen.arrowSize}
                  color={colors.textWhite}
                  style={styles.ctaIcon}
                />
              </>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
    paddingHorizontal: spacing[5] + 2,
    paddingTop: spacing[1] + 2,
    paddingBottom: spacing[2] + 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing[6] + 2,
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
    marginTop: spacing[2] + 2,
    color: colors.inkSoft,
    fontFamily: fonts.displayRegular,
    fontSize: authScreen.bodySize,
    lineHeight: authScreen.bodyLine,
    textAlign: "center",
  },
  fieldLabel: {
    marginTop: spacing[8] - 2,
    marginBottom: spacing[2] + 1,
    color: colors.inkStrong,
    fontFamily: fonts.displaySemiBold,
    fontSize: authScreen.bodySize,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    height: authScreen.fieldHeight,
    paddingHorizontal: spacing[4],
    borderRadius: authScreen.fieldRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.inkStrong,
    fontFamily: fonts.displayRegular,
    fontSize: fontSizes.body,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: authScreen.ctaHeight,
    marginTop: spacing[5],
    borderRadius: authScreen.ctaRadius,
    backgroundColor: colors.brandCta,
    shadowColor: colors.brandCta,
    shadowOpacity: 0.3,
    shadowRadius: spacing[4],
    shadowOffset: { width: 0, height: spacing[2] },
    elevation: 6,
  },
  ctaDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    color: colors.textWhite,
    fontFamily: fonts.displaySemiBold,
    fontSize: fontSizes.lg,
  },
  ctaIcon: {
    marginLeft: spacing[2] + 2,
  },
});
