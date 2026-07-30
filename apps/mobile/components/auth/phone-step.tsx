import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
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
  letterSpacings,
  radii,
  spacing,
} from "@/constants/theme";
import { haptic } from "@/utils/haptics";
import { toast } from "@/utils/toast";
import { BrandLockup } from "./brand-lockup";
import { CurvedFooter } from "./curved-footer";
import { GoogleMark } from "./google-mark";
import { vs } from "./layout";

const FEATURES = [
  { icon: "shield-check-outline", label: "Fresh\nToday" },
  { icon: "fish", label: "Cut Fresh\nAfter Order" },
  { icon: "package-variant-closed", label: "Hygienically\nPacked" },
  { icon: "motorbike", label: "30–45 Min\nDelivery" },
] as const;

type PhoneStepProps = {
  identifier: string;
  onChangeIdentifier: (value: string) => void;
  isValid: boolean;
  isLoading: boolean;
  onSubmit: () => void;
  onSkip: () => void;
};

export function PhoneStep({
  identifier,
  onChangeIdentifier,
  isValid,
  isLoading,
  onSubmit,
  onSkip,
}: PhoneStepProps) {
  const phoneRef = useRef<TextInput>(null);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Digits-only (and not yet an email) means treat the field as a phone
  // number — shows the +91 prefix and switches the keyboard/length limit.
  const isPhoneInput = /^\d+$/.test(identifier.trim()) && !identifier.includes("@");

  const canContinue = isValid && termsAccepted && !isLoading;

  // Placeholder affordances — the comp shows them, the backend has no provider
  // wired up yet. Same "coming soon" treatment the old Google button used.
  const notYetAvailable = (feature: string) => () => {
    haptic.press();
    toast.success(`${feature} coming soon!`);
  };

  const handleContinue = () => {
    if (!isValid || isLoading) return;
    if (!termsAccepted) {
      toast.error("Please accept the Terms & Conditions to continue.");
      return;
    }
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
          <Pressable onPress={onSkip} hitSlop={12} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>

          <Pressable
            onPress={notYetAvailable("More languages")}
            style={styles.languagePill}
          >
            <Ionicons
              name="globe-outline"
              size={authScreen.globeSize}
              color={colors.brandMark}
            />
            <Text style={styles.languageText}>English</Text>
            <Ionicons
              name="chevron-down"
              size={authScreen.chevronSize}
              color={colors.inkSoft}
            />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
        {/* No scrolling when the keyboard is closed — the gaps between these
            five groups take up whatever slack the device height leaves. Once
            the keyboard opens there's rarely enough room left, so this also
            scrolls instead of letting the keyboard cover the CTA. */}
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandLockup
            markSize={vs(authScreen.markSize)}
            wordmarkWidth={vs(authScreen.wordmarkWidth)}
          />

          <View>
            <Text style={styles.title}>Welcome to FishStudio</Text>
            <Text style={styles.subtitle}>
              Premium fish, seafood, chicken & mutton{"\n"}delivered fresh to
              your door.
            </Text>
          </View>

          <View>
            <Text style={styles.fieldLabel}>Mobile Number or Email</Text>
            <View style={styles.inputRow}>
              {isPhoneInput && (
                <>
                  <Pressable
                    onPress={notYetAvailable("More country codes")}
                    style={styles.countryButton}
                  >
                    <Text style={styles.countryText}>+91</Text>
                    <Ionicons
                      name="chevron-down"
                      size={authScreen.chevronSize}
                      color={colors.inkSoft}
                    />
                  </Pressable>
                  <View style={styles.inputDivider} />
                </>
              )}
              <TextInput
                ref={phoneRef}
                style={styles.input}
                placeholder="Enter mobile number or email"
                placeholderTextColor={colors.textPlaceholder}
                value={identifier}
                onChangeText={onChangeIdentifier}
                keyboardType={isPhoneInput ? "phone-pad" : "email-address"}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                maxLength={isPhoneInput ? 10 : undefined}
              />
              <Ionicons
                name={isPhoneInput ? "call" : "mail-outline"}
                size={authScreen.fieldIconSize}
                color={colors.brandMark}
              />
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              disabled={!canContinue}
              activeOpacity={0.85}
              style={[styles.cta, !canContinue && styles.ctaDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <>
                  <Text style={styles.ctaText}>Continue</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={authScreen.arrowSize}
                    color={colors.textWhite}
                    style={styles.ctaIcon}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <Pressable
                onPress={notYetAvailable("Google sign-in")}
                style={styles.socialButton}
              >
                <GoogleMark size={vs(authScreen.googleMarkSize)} />
              </Pressable>
              <Pressable
                onPress={notYetAvailable("WhatsApp sign-in")}
                style={styles.socialButton}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={vs(authScreen.socialIconSize)}
                  color={colors.whatsappGreen}
                />
              </Pressable>
              <Pressable
                onPress={notYetAvailable("Apple sign-in")}
                style={styles.socialButton}
              >
                <Ionicons
                  name="logo-apple"
                  size={vs(authScreen.socialIconSize)}
                  color={colors.inkStrong}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.featureCard}>
            {FEATURES.map((feature, index) => (
              <React.Fragment key={feature.icon}>
                {index > 0 && <View style={styles.featureDivider} />}
                <View style={styles.featureCell}>
                  <MaterialCommunityIcons
                    name={feature.icon}
                    size={vs(authScreen.featureIconSize)}
                    color={colors.brandMark}
                  />
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </ScrollView>

        <CurvedFooter>
          <Pressable
            onPress={() => {
              haptic.press();
              setTermsAccepted((accepted) => !accepted);
            }}
            style={styles.termsRow}
          >
            <View
              style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
            >
              {termsAccepted && (
                <Ionicons name="checkmark" size={13} color={colors.brandMark} />
              )}
            </View>
            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text
                style={styles.termsLink}
                onPress={() => Linking.openURL("https://fishstudio.app/terms")}
              >
                Terms & Conditions
              </Text>{" "}
              and{" "}
              <Text
                style={styles.termsLink}
                onPress={() => Linking.openURL("https://fishstudio.app/privacy")}
              >
                Privacy Policy
              </Text>
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              haptic.press();
              phoneRef.current?.focus();
            }}
            style={styles.createAccountRow}
          >
            <Text style={styles.createAccountText}>New here? </Text>
            <Text style={styles.createAccountLink}>Create an account</Text>
            <Ionicons
              name="arrow-forward"
              size={authScreen.chevronSize}
              color={colors.brandAccent}
              style={styles.createAccountIcon}
            />
          </Pressable>
        </CurvedFooter>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[5],
    paddingTop: vs(spacing[1]),
  },
  skipButton: {
    paddingVertical: spacing[2],
    paddingRight: spacing[3],
  },
  skipText: {
    color: colors.inkSoft,
    fontFamily: fonts.displayMedium,
    fontSize: fontSizes.md,
  },
  languagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing[3] + 2,
    paddingVertical: spacing[2] + 1,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  languageText: {
    color: colors.inkStrong,
    fontFamily: fonts.displayMedium,
    fontSize: authScreen.bodySize,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing[6] + 2,
    paddingTop: vs(spacing[1]),
    paddingBottom: vs(spacing[1]),
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  title: {
    color: colors.inkStrong,
    fontFamily: fonts.displaySemiBold,
    fontSize: vs(authScreen.titleSize),
    lineHeight: vs(authScreen.titleLine),
    textAlign: "center",
  },
  subtitle: {
    marginTop: vs(spacing[1]),
    color: colors.inkSoft,
    fontFamily: fonts.displayRegular,
    fontSize: vs(authScreen.bodySize),
    lineHeight: vs(authScreen.bodyLine),
    textAlign: "center",
  },
  fieldLabel: {
    marginBottom: vs(spacing[2] - 2),
    color: colors.inkStrong,
    fontFamily: fonts.displaySemiBold,
    fontSize: vs(authScreen.bodySize),
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: vs(authScreen.fieldHeight),
    paddingHorizontal: spacing[3] + 2,
    borderRadius: authScreen.fieldRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  countryText: {
    color: colors.inkStrong,
    fontFamily: fonts.displayMedium,
    fontSize: vs(fontSizes.body),
  },
  inputDivider: {
    width: 1,
    height: spacing[6],
    marginHorizontal: spacing[3],
    backgroundColor: colors.hairlineStrong,
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.inkStrong,
    fontFamily: fonts.displayRegular,
    fontSize: vs(fontSizes.body),
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: vs(authScreen.ctaHeight),
    marginTop: vs(spacing[3]),
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
    fontSize: vs(fontSizes.lg),
  },
  ctaIcon: {
    marginLeft: spacing[2] + 2,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.hairlineStrong,
  },
  dividerText: {
    marginHorizontal: spacing[3],
    color: colors.inkSoft,
    fontFamily: fonts.displayMedium,
    fontSize: vs(fontSizes.sm),
    letterSpacing: letterSpacings.widest,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[4] + 2,
    marginTop: vs(spacing[3]),
  },
  socialButton: {
    width: vs(authScreen.socialSize),
    height: vs(authScreen.socialSize),
    borderRadius: vs(authScreen.socialSize / 2),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: vs(spacing[3] - 1),
    borderRadius: authScreen.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  featureCell: {
    flex: 1,
    alignItems: "center",
    gap: vs(spacing[1]),
    paddingHorizontal: spacing[1],
  },
  featureDivider: {
    width: 1,
    backgroundColor: colors.hairlineStrong,
    marginVertical: spacing[1],
  },
  featureLabel: {
    color: colors.inkStrong,
    fontFamily: fonts.displayMedium,
    fontSize: vs(authScreen.microSize),
    lineHeight: vs(authScreen.microLine),
    textAlign: "center",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[2] + 2,
  },
  checkbox: {
    width: authScreen.checkboxSize,
    height: authScreen.checkboxSize,
    borderRadius: authScreen.checkboxRadius,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.onPanelMuted,
  },
  checkboxChecked: {
    backgroundColor: colors.textWhite,
    borderColor: colors.textWhite,
  },
  termsText: {
    flex: 1,
    color: colors.textWhite,
    fontFamily: fonts.displayRegular,
    fontSize: vs(authScreen.captionSize),
    lineHeight: vs(authScreen.captionLine),
  },
  termsLink: {
    color: colors.brandAccent,
    textDecorationLine: "underline",
  },
  createAccountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: vs(spacing[3]),
  },
  createAccountText: {
    color: colors.textWhite,
    fontFamily: fonts.displayRegular,
    fontSize: vs(authScreen.bodySize),
  },
  createAccountLink: {
    color: colors.brandAccent,
    fontFamily: fonts.displaySemiBold,
    fontSize: vs(authScreen.bodySize),
  },
  createAccountIcon: {
    marginLeft: spacing[1] + 2,
  },
});
