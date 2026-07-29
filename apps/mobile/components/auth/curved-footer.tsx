import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { gradients } from "@/constants/theme";
import { HERO_BOX_H, HERO_H, PANEL_OVERLAP, vs } from "./layout";

const { width: SCREEN_W } = Dimensions.get("window");

/** Hero photo curving into the deep-purple panel that closes the auth screens. */
export function CurvedFooter({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.stack}>
      <View style={styles.heroSpacer} />

      <LinearGradient
        colors={gradients.panel}
        locations={gradients.panelLocations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.panel, { paddingBottom: vs(12) + insets.bottom }]}
      >
        {children}
      </LinearGradient>

      {/* Declared last so it paints over the panel where the curve dips in. */}
      <View style={styles.heroBox}>
        <Image
          source={require("../../assets/splash-screen-assests/food.png")}
          style={styles.hero}
          accessibilityLabel="Fresh fish, meat and prawns on ice"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    width: SCREEN_W,
  },
  heroSpacer: {
    height: HERO_BOX_H - PANEL_OVERLAP,
  },
  panel: {
    paddingTop: PANEL_OVERLAP + vs(14),
    paddingHorizontal: vs(26),
    alignItems: "center",
  },
  heroBox: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: HERO_BOX_H,
    overflow: "hidden",
  },
  // Pinned to the bottom of the box so the crop takes the sky, never the purple
  // curve the panel has to meet.
  hero: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_W,
    height: HERO_H,
  },
});
