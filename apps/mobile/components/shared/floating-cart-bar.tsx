import { colors } from "@/constants/theme";
import { useStore } from "@/store";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Blinkit-style "View cart" bar — stays put regardless of scroll direction;
// the only thing that dismisses it is the cart actually going empty.
export default function FloatingCartBar() {
  const { cart } = useStore();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isHome = pathname === "/" || pathname === "/index" || pathname === "(tabs)";
  if (!isHome || cart.length === 0) return null;

  const bottomOffset = insets.bottom > 0 ? insets.bottom + 8 : 16;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: bottomOffset,
        left: 48,
        right: 48,
        zIndex: 999,
      }}
    >
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/cart")}
        activeOpacity={0.9}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          borderRadius: 999,
          padding: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 14,
          elevation: 12,
        }}
      >
        <Image
          source={{ uri: cart[0]?.image }}
          style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)" }}
          resizeMode="cover"
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.white, fontFamily: "Inter-Bold", fontSize: 15 }}>View cart</Text>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter-Medium", fontSize: 12, marginTop: 1 }}>
            {cart.length} item{cart.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 6,
          }}
        >
          <Feather name="chevron-right" size={18} color={colors.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
