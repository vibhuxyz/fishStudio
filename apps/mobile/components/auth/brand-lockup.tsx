import React from "react";
import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

const WORDMARK_RATIO = 92 / 504;
const TAGLINE_RATIO = 62 / 504;

type BrandLockupProps = {
  markSize: number;
  wordmarkWidth: number;
  /** "stacked" puts the mark above the wordmark (login), "inline" beside it (OTP). */
  variant?: "stacked" | "inline";
  style?: StyleProp<ViewStyle>;
};

export function BrandLockup({
  markSize,
  wordmarkWidth,
  variant = "stacked",
  style,
}: BrandLockupProps) {
  return (
    <View
      style={[
        variant === "inline" ? styles.inline : styles.stacked,
        style,
      ]}
    >
      <Image
        source={require("../../assets/splash-screen-assests/logo.png")}
        style={{
          width: markSize,
          height: markSize,
          borderRadius: markSize / 2,
        }}
        accessibilityLabel="FishStudio"
      />
      <View
        style={
          variant === "inline"
            ? { marginLeft: markSize * 0.2 }
            : { marginTop: markSize * 0.16 }
        }
      >
        <Image
          source={require("../../assets/splash-screen-assests/wm.png")}
          style={{
            width: wordmarkWidth,
            height: wordmarkWidth * WORDMARK_RATIO,
          }}
        />
        <Image
          source={require("../../assets/splash-screen-assests/tag.png")}
          style={{
            width: wordmarkWidth,
            height: wordmarkWidth * TAGLINE_RATIO,
            marginTop: wordmarkWidth * 0.012,
          }}
          accessibilityLabel="The fish and meat workshop"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stacked: {
    alignItems: "center",
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
