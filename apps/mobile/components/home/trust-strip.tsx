import { colors, fonts, radii, spacing } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const PROMISES = [
  {
    icon: "shield-check-outline",
    title: "Fresh Today",
    subtitle: "Sourced Fresh\nEvery Morning",
  },
  {
    icon: "fish",
    title: "Cut Fresh\nAfter Order",
    subtitle: "Your choice, our\nexpertise",
  },
  {
    icon: "package-variant-closed",
    title: "Packed\nHygienically",
    subtitle: "Vacuum packed\nfor freshness",
  },
  {
    icon: "snowflake",
    title: "Temperature\nControlled",
    subtitle: "Cold chain\nsafe delivery",
  },
] as const;

/** The four service promises that sit directly under the hero banner. */
export default function TrustStrip() {
  return (
    <View style={styles.card}>
      {PROMISES.map((promise, index) => (
        <React.Fragment key={promise.icon}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.cell}>
            <MaterialCommunityIcons
              name={promise.icon}
              size={20}
              color={colors.brandMark}
            />
            <Text style={styles.title}>{promise.title}</Text>
            <Text style={styles.subtitle}>{promise.subtitle}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    marginHorizontal: spacing[4],
    marginBottom: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    gap: spacing[1],
    paddingHorizontal: spacing[1] + 2,
  },
  divider: {
    width: 1,
    marginVertical: spacing[1],
    backgroundColor: colors.hairlineStrong,
  },
  title: {
    color: colors.inkStrong,
    fontFamily: fonts.displaySemiBold,
    fontSize: 10,
    lineHeight: 13,
    textAlign: "center",
  },
  subtitle: {
    color: colors.inkSoft,
    fontFamily: fonts.displayRegular,
    fontSize: 8.5,
    lineHeight: 11.5,
    textAlign: "center",
  },
});
