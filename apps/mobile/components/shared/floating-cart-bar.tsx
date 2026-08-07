import { colors } from "@/constants/theme";
import { useStore } from "@/store";
import { useBottomBarStore } from "@/store/bottom-bar-store";
import { useFloatingCartBarStore } from "@/store/floating-cart-bar-store";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Total vertical space FloatingCartBar currently occupies from the very
 * bottom of the screen (its bottom offset + its own measured height), or 0
 * when it isn't rendered. Any scrollable screen the bar floats over should
 * add this (plus a small margin) to its content's bottom padding so the
 * last row never ends up underneath it — computed from the bar's real
 * measured height rather than a guessed constant, so it can never drift out
 * of sync with what's actually on screen.
 */
export function useFloatingCartBarSpace(): number {
  const cartCount = useStore((s) => s.cart.length);
  const insets = useSafeAreaInsets();
  const screenBottomBarHeight = useBottomBarStore((s) => s.height);
  const pillHeight = useFloatingCartBarStore((s) => s.height);

  if (cartCount === 0 || pillHeight === 0) return 0;

  const bottomOffset =
    (insets.bottom > 0 ? insets.bottom + 8 : 16) +
    (screenBottomBarHeight > 0 ? screenBottomBarHeight + 8 : 0);

  return bottomOffset + pillHeight;
}

// Blinkit-style "View cart" bar — stays put regardless of scroll direction;
// the only thing that dismisses it is the cart actually going empty.
// Deliberately mounted per-screen (Home, product detail, category listing)
// rather than at the app root, so it never appears on the splash/login
// screen or on the Cart/Profile tabs where it would be redundant.
export default function FloatingCartBar() {
  const { cart } = useStore();
  const insets = useSafeAreaInsets();
  // Screens like product detail have their own fixed bottom price/Add to
  // Cart bar — this bar registers its height so we float above it instead
  // of overlapping it.
  const screenBottomBarHeight = useBottomBarStore((s) => s.height);
  const setPillHeight = useFloatingCartBarStore((s) => s.setHeight);

  // Report our own height for useFloatingCartBarSpace() to consume; clear it
  // on unmount (cart emptied) so screens don't keep reserving dead space.
  useEffect(() => {
    if (cart.length === 0) setPillHeight(0);
  }, [cart.length, setPillHeight]);

  if (cart.length === 0) return null;

  const bottomOffset =
    (insets.bottom > 0 ? insets.bottom + 8 : 16) +
    (screenBottomBarHeight > 0 ? screenBottomBarHeight + 8 : 0);

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
        onLayout={(e) => setPillHeight(e.nativeEvent.layout.height)}
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
          source={{ uri: cloudinaryThumbnail(cart[0]?.image, 96) }}
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
