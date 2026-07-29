import { ProductBadges } from "@/components/home/badge";
import { colors, fonts, radii, shadows, spacing } from "@/constants/theme";
import useUser from "@/hooks/useUser";
import { useAddressStore } from "@/lib/address-store";
import { useStore } from "@/store";
import type { Product } from "@/types/product";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  GestureResponderEvent,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop";

const IMAGE_RATIO = 0.62;
// Body is a fixed stack — image ratio is the only thing that varies with width,
// so the rails can reserve an exact row height without measuring.
const BODY_HEIGHT = 76;

export const compactCardHeight = (cardWidth: number) =>
  Math.round(cardWidth * IMAGE_RATIO) + BODY_HEIGHT;

interface ProductCompactCardProps {
  product: Product;
  cardWidth: number;
  noRightMargin?: boolean;
  onAddToCart: (product: Product) => void;
}

/**
 * The home-rail card from the comp: photo, name, per-unit price and a round
 * add button. Deliberately drops the description, pack size, delivery chip and
 * wide ADD button that `product.card` carries — those belong on the browse
 * grids where there is room for them.
 */
export default function ProductCompactCard({
  product,
  cardWidth,
  noRightMargin = false,
  onAddToCart,
}: ProductCompactCardProps) {
  const { wishlist, addToWishlist, removeFromWishlist } = useStore();
  const { user } = useUser();
  const { getSelectedAddress } = useAddressStore();

  const isOutOfStock = product.stock === 0 || product.outOfStock;
  const currentPrice = product.sale_price || product.regular_price;
  const inWishlist = wishlist.some((item) => item.id === product.id);

  const openProduct = () => {
    router.push({
      pathname: "/(routes)/product/[id]",
      params: { id: product.slug || product.id },
    });
  };

  const handleAdd = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    // Cut type and weight still need picking, so the rail always defers to the
    // sheet rather than dropping a default variant in the cart.
    onAddToCart(product);
  };

  const handleWishlistToggle = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (!user) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    const selectedAddress = getSelectedAddress();
    if (inWishlist) {
      removeFromWishlist(product.id, user, selectedAddress, "Mobile App");
      return;
    }
    addToWishlist(
      {
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: currentPrice,
        image: product.images?.[0]?.url || "",
        shopId: product.Shop?.id || "",
      },
      user,
      selectedAddress,
      "Mobile App",
    );
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
          source={{ uri: product.images?.[0]?.url || FALLBACK_IMAGE }}
          style={[
            styles.image,
            { height: Math.round(cardWidth * IMAGE_RATIO) },
            isOutOfStock && styles.imageMuted,
          ]}
          resizeMode="cover"
        />

        <ProductBadges badges={product.badges} max={1} small />

        <TouchableOpacity
          style={styles.wishlist}
          onPress={handleWishlistToggle}
          activeOpacity={0.7}
          hitSlop={6}
        >
          <Ionicons
            name={inWishlist ? "heart" : "heart-outline"}
            size={15}
            color={colors.danger}
          />
        </TouchableOpacity>

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

        <View style={styles.priceRow}>
          <View style={styles.price}>
            <Text style={styles.priceValue}>₹{currentPrice}</Text>
            <Text style={styles.priceUnit}>/{product.unit || "kg"}</Text>
          </View>

          {!isOutOfStock && (
            <TouchableOpacity
              onPress={handleAdd}
              activeOpacity={0.85}
              style={styles.addButton}
              hitSlop={6}
            >
              <Ionicons name="add" size={18} color={colors.textWhite} />
            </TouchableOpacity>
          )}
        </View>
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
    marginRight: spacing[3],
  },
  image: {
    width: "100%",
  },
  imageMuted: {
    opacity: 0.45,
  },
  wishlist: {
    position: "absolute",
    top: spacing[2],
    right: spacing[2],
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  stockBand: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: spacing[1],
    alignItems: "center",
    backgroundColor: colors.scrim,
  },
  stockBandText: {
    color: colors.textWhite,
    fontFamily: fonts.displaySemiBold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  body: {
    height: BODY_HEIGHT,
    paddingHorizontal: spacing[3] - 2,
    paddingTop: spacing[2],
    paddingBottom: spacing[3] - 2,
    justifyContent: "space-between",
  },
  title: {
    color: colors.inkStrong,
    fontFamily: fonts.displaySemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    flexDirection: "row",
    alignItems: "baseline",
    flexShrink: 1,
  },
  priceValue: {
    color: colors.inkStrong,
    fontFamily: fonts.displayBold,
    fontSize: 15,
  },
  priceUnit: {
    marginLeft: 1,
    color: colors.textSecondary,
    fontFamily: fonts.displayRegular,
    fontSize: 11,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
});
