import React from "react";
import { Dimensions, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Matches section-carousel.tsx's card width so the placeholder occupies the
// same space the real rail will, and the list doesn't jump when it arrives.
const CARD_WIDTH = Math.min(150, SCREEN_WIDTH * 0.34);

// Placeholder for a horizontal product rail that hasn't loaded yet.
export default function SectionRailSkeleton() {
  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          backgroundColor: "#E5E7EB",
          height: 18,
          width: 160,
          borderRadius: 6,
          marginHorizontal: 16,
          marginBottom: 12,
        }}
      />
      <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              width: CARD_WIDTH,
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <View style={{ backgroundColor: "#E5E7EB", height: Math.round(CARD_WIDTH * 0.62) }} />
            <View style={{ padding: 8 }}>
              <View style={{ backgroundColor: "#E5E7EB", height: 12, borderRadius: 6, marginBottom: 6 }} />
              <View style={{ backgroundColor: "#E5E7EB", height: 10, borderRadius: 6, width: "70%", marginBottom: 8 }} />
              <View style={{ backgroundColor: "#E5E7EB", height: 14, borderRadius: 6, width: "50%" }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
