import { ProductBadges } from "@/components/home/badge";
import { colors, fonts, radii, shadows, spacing } from "@/constants/theme";
import useUser from "@/hooks/useUser";
import { useAddressStore } from "@/lib/address-store";
import { useStore } from "@/store";
import type { Product } from "@/types/product";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { toast } from "@/utils/toast";
import { resolveCardPrice } from "@repo/shared/pricing";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop";

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  isFlashSale?: boolean;
  cardWidth?: number | `${number}%`;
  noRightMargin?: boolean;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({
  product,
  showActions = true,
  isFlashSale = false,
  cardWidth = 200,
  noRightMargin = false,
  onAddToCart,
}: ProductCardProps) {
  const { cart, addToCart, updateQuantity, checkAndIncrement } = useStore();
  const { user } = useUser();
  const { selectedLocation, getSelectedAddress } = useAddressStore();

  const quantity = cart.find((item) => item.id === product.id)?.quantity ?? 0;
  const isOutOfStock = product.stock === 0 || product.outOfStock;
  const currentPrice = product.sale_price || product.regular_price;
  const cardPrice = resolveCardPrice({
    basePricePerKg: product.basePricePerKg,
    sizePricing: product.sizePricing,
    salePrice: currentPrice,
    regularPrice: product.regular_price,
  });
  const discountPercentage =
    cardPrice.regularPrice > cardPrice.salePrice
      ? Math.round(
          ((cardPrice.regularPrice - cardPrice.salePrice) / cardPrice.regularPrice) *
            100,
        )
      : 0;
  const deliveryMinutes = selectedLocation?.deliveryTimeMinutes ?? 40;

  const openProduct = () => {
    router.push({
      pathname: "/(routes)/product/[id]",
      params: { id: product.slug || product.id },
    });
  };

  const handleAdd = () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    // Cut type / weight still need picking, so defer to the sheet when the
    // screen supplies one.
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: currentPrice,
        regularPrice: product.regular_price,
        image: product.images?.[0]?.url || "",
        shopId: product.Shop?.id || "",
        quantity: 1,
      },
      user,
      getSelectedAddress(),
      "Mobile App",
    );
  };

  const handleIncrement = async () => {
    const result = await checkAndIncrement({ id: product.id });
    if (!result.ok && result.message) {
      toast.error(result.message);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: cardWidth },
        !noRightMargin && styles.cardSpacing,
      ]}
      onPress={openProduct}
      activeOpacity={0.9}
    >
      <View>
        <Image
          source={{
            uri: cloudinaryThumbnail(product.images?.[0]?.url, 300) || FALLBACK_IMAGE,
          }}
          style={[styles.image, isOutOfStock && styles.imageMuted]}
          resizeMode="cover"
        />
        {/* Sits over the image so the photo reads as greyed-out rather than
            just dim — RN has no filter, so this is a desaturating wash. */}
        {isOutOfStock && <View style={styles.imageWash} />}

        <ProductBadges badges={product.badges} max={2} />

        {isOutOfStock && (
          <View style={styles.stockBand}>
            <Text style={styles.stockBandText}>OUT OF STOCK</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {product.title}
        </Text>

        <Text style={styles.description} numberOfLines={1}>
          {product.description || product.short_description || ""}
        </Text>

        <Text style={styles.meta}>
          {product.unit || "500g"} | Serves {product.serves || "2-4"}
        </Text>

        {isOutOfStock ? (
          <View style={styles.footer}>
            <Text style={styles.outOfStockLabel}>OUT OF STOCK</Text>
            <TouchableOpacity
              onPress={() => router.push("/(routes)/shipping")}
              activeOpacity={0.7}
            >
              <Text style={styles.tryAnotherLocation}>Try another location</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.footer}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ₹{cardPrice.salePrice}
                <Text style={styles.priceUnit}>/{cardPrice.unit}</Text>
              </Text>
              {discountPercentage > 0 && (
                <>
                  <Text style={styles.strikePrice}>₹{cardPrice.regularPrice}</Text>
                  <Text style={styles.discount}>{discountPercentage}% off</Text>
                </>
              )}
            </View>

            <View style={styles.actionRow}>
              <View style={styles.deliveryChip}>
                <View style={styles.deliveryIcon}>
                  <Ionicons name="flash" size={11} color={colors.primary} />
                </View>
                <Text style={styles.deliveryText}>{deliveryMinutes} mins</Text>
              </View>

              {showActions &&
                (quantity > 0 ? (
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() => updateQuantity({ id: product.id }, quantity - 1)}
                      hitSlop={6}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove" size={16} color={colors.textWhite} />
                    </TouchableOpacity>
                    <Text style={styles.stepperCount}>{quantity}</Text>
                    <TouchableOpacity
                      onPress={handleIncrement}
                      hitSlop={6}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={16} color={colors.textWhite} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleAdd}
                    activeOpacity={0.85}
                    style={styles.addButton}
                  >
                    <Text style={styles.addButtonText}>ADD</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    overflow: "hidden",
    ...shadows.card,
  },
  cardSpacing: {
    marginRight: spacing[4],
  },
  image: {
    width: "100%",
    height: 150,
  },
  imageMuted: {
    opacity: 0.45,
  },
  imageWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.textSecondary,
    opacity: 0.35,
  },
  stockBand: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: spacing[2],
    alignItems: "center",
    backgroundColor: colors.scrim,
  },
  stockBandText: {
    color: colors.textWhite,
    fontFamily: fonts.displaySemiBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  body: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    flex: 1,
  },
  title: {
    color: colors.inkStrong,
    fontFamily: fonts.displayBold,
    fontSize: 15,
    lineHeight: 21,
  },
  description: {
    marginTop: spacing[1] / 2,
    color: colors.textSecondary,
    fontFamily: fonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  meta: {
    marginTop: spacing[1],
    color: colors.textSecondary,
    fontFamily: fonts.displayRegular,
    fontSize: 12,
  },
  footer: {
    marginTop: spacing[3],
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  price: {
    color: colors.inkStrong,
    fontFamily: fonts.displayBold,
    fontSize: 17,
  },
  priceUnit: {
    color: colors.textSecondary,
    fontFamily: fonts.displayRegular,
    fontSize: 12,
  },
  strikePrice: {
    marginLeft: spacing[2],
    color: colors.textSecondary,
    fontFamily: fonts.displayRegular,
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  discount: {
    marginLeft: spacing[2] - 2,
    color: colors.offerGreen,
    fontFamily: fonts.displaySemiBold,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing[3],
  },
  deliveryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1] + 2,
  },
  deliveryIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySurface,
  },
  deliveryText: {
    color: colors.inkStrong,
    fontFamily: fonts.displayRegular,
    fontSize: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 82,
    paddingHorizontal: spacing[2] + 2,
    paddingVertical: spacing[1] + 2,
    borderRadius: radii.sm - 4,
    backgroundColor: colors.primary,
  },
  stepperCount: {
    color: colors.textWhite,
    fontFamily: fonts.displaySemiBold,
    fontSize: 13,
    marginHorizontal: spacing[2],
  },
  addButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radii.sm - 4,
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: colors.textWhite,
    fontFamily: fonts.displaySemiBold,
    fontSize: 13,
  },
  outOfStockLabel: {
    color: colors.danger,
    fontFamily: fonts.displaySemiBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  tryAnotherLocation: {
    marginTop: spacing[1] + 2,
    color: colors.textSecondary,
    fontFamily: fonts.displayRegular,
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
