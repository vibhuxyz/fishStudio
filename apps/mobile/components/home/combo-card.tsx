import type { Banner } from "@/components/home/banner-carousel";
import { colors, fonts, radii, spacing } from "@/constants/theme";
import type { Product } from "@/types/product";
import axiosInstance from "@/utils/axiosInstance";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

/**
 * Combo banners are uploaded as artwork from admin, so the offer copy and
 * pricing live in the image. Falls back to the first product in the Combos
 * section until someone uploads one.
 */
export function useComboBanner() {
  return useQuery({
    queryKey: ["combo-banner"],
    queryFn: async (): Promise<Banner | null> => {
      const { data } = await axiosInstance.get("/product/api/get-banners", {
        params: { bannerType: "combo" },
      });
      const banners: Banner[] = Array.isArray(data.banners) ? data.banners : [];
      return banners.find((banner) => banner.isActive) ?? null;
    },
    staleTime: Infinity,
  });
}

type ComboCardProps = {
  banner: Banner | null;
  fallbackProduct?: Product;
  height: number;
  onAddToCart?: (product: Product) => void;
};

export default function ComboCard({
  banner,
  fallbackProduct,
  height,
  onAddToCart,
}: ComboCardProps) {
  const imageUrl = banner?.imageUrl ?? fallbackProduct?.images?.[0]?.url;
  if (!imageUrl) return null;

  const openCombo = () => {
    if (banner || !fallbackProduct) {
      router.push("/(routes)/products");
      return;
    }
    router.push({
      pathname: "/(routes)/product/[id]",
      params: { id: fallbackProduct.id },
    });
  };

  return (
    <Pressable onPress={openCombo} style={[styles.card, { height }]}>
      <Image
        source={{ uri: cloudinaryThumbnail(imageUrl, 400) }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessibilityLabel={banner?.title || fallbackProduct?.title || "Combo offer"}
      />

      {/* The uploaded artwork already carries its copy; only the product
          fallback needs a title and price drawn over it. */}
      {!banner && fallbackProduct && (
        <View style={styles.fallbackOverlay}>
          <Text numberOfLines={2} style={styles.fallbackTitle}>
            {fallbackProduct.title}
          </Text>
          <Text style={styles.fallbackPrice}>
            ₹{fallbackProduct.sale_price}
            {fallbackProduct.regular_price > fallbackProduct.sale_price && (
              <Text style={styles.fallbackStrike}>
                {"  "}₹{fallbackProduct.regular_price}
              </Text>
            )}
          </Text>
        </View>
      )}

      {fallbackProduct && onAddToCart && (
        <Pressable
          onPress={() => onAddToCart(fallbackProduct)}
          hitSlop={8}
          style={styles.addButton}
        >
          <Ionicons name="add" size={20} color={colors.brandMark} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.sm,
    overflow: "hidden",
    backgroundColor: colors.panelStart,
  },
  fallbackOverlay: {
    position: "absolute",
    left: spacing[3],
    right: spacing[3],
    bottom: spacing[3],
  },
  fallbackTitle: {
    color: colors.textWhite,
    fontFamily: fonts.displaySemiBold,
    fontSize: 14,
    lineHeight: 19,
  },
  fallbackPrice: {
    marginTop: spacing[1],
    color: colors.textWhite,
    fontFamily: fonts.displayBold,
    fontSize: 16,
  },
  fallbackStrike: {
    color: colors.onPanelMuted,
    fontFamily: fonts.displayRegular,
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  addButton: {
    position: "absolute",
    right: spacing[3],
    bottom: spacing[3],
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
});
