import React from "react";
import { Dimensions, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function ProductSkeleton({ width }: { width?: number }) {
  return (
    <View
      style={{
        width: width || CARD_WIDTH,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      }}
    >
      <View style={{ backgroundColor: "#E5E7EB", height: 130 }} />
      <View style={{ padding: 10 }}>
        <View style={{ backgroundColor: "#E5E7EB", height: 14, borderRadius: 6, marginBottom: 6 }} />
        <View style={{ backgroundColor: "#E5E7EB", height: 11, borderRadius: 6, width: "80%", marginBottom: 4 }} />
        <View style={{ backgroundColor: "#E5E7EB", height: 11, borderRadius: 6, width: "60%", marginBottom: 10 }} />
        <View style={{ backgroundColor: "#E5E7EB", height: 16, borderRadius: 6, width: "50%" }} />
      </View>
    </View>
  );
}
