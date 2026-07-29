import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import {
  authScreen,
  colors,
  fonts,
  gradients,
  radii,
  spacing,
} from "@/constants/theme";
import { BrandLockup } from "./brand-lockup";

export function SuccessStep({ isNewUser }: { isNewUser: boolean }) {
  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={gradients.lavender}
        locations={gradients.lavenderLocations}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.body}>
        <BrandLockup
          markSize={authScreen.markSize}
          wordmarkWidth={authScreen.wordmarkWidth}
        />

        <View style={styles.tick}>
          <Ionicons
            name="checkmark"
            size={spacing[9]}
            color={colors.textWhite}
          />
        </View>

        <Text style={styles.title}>Welcome{isNewUser ? "" : " back"}!</Text>
        <Text style={styles.subtitle}>
          Your fresh fish market is ready. Taking you to today&apos;s catch.
        </Text>

        <ActivityIndicator color={colors.brandMark} style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.lavenderTop,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[8] + 2,
  },
  tick: {
    width: spacing[16] + 18,
    height: spacing[16] + 18,
    borderRadius: radii.full,
    marginTop: spacing[9],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandCta,
    shadowColor: colors.brandCta,
    shadowOpacity: 0.3,
    shadowRadius: spacing[4] + 2,
    shadowOffset: { width: 0, height: spacing[2] + 2 },
    elevation: 8,
  },
  title: {
    marginTop: spacing[5] + 2,
    color: colors.inkStrong,
    fontFamily: fonts.displaySemiBold,
    fontSize: authScreen.headlineSize,
    textAlign: "center",
  },
  subtitle: {
    marginTop: spacing[2],
    color: colors.inkSoft,
    fontFamily: fonts.displayRegular,
    fontSize: authScreen.bodySize,
    lineHeight: authScreen.bodyLine,
    textAlign: "center",
  },
  spinner: {
    marginTop: spacing[6] + 2,
  },
});
