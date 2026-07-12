import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { toast } from "@/utils/toast";
import { ProductBadges } from "@/components/home/badge";
import { Ionicons } from "@expo/vector-icons";

interface ProductCardProps {
  product: any;
  showActions?: boolean;
  isFlashSale?: boolean;
  cardWidth?: number | `${number}%`;
  noRightMargin?: boolean;
  onAddToCart?: (product: any) => void;
}

export default function ProductCard({
  product,
  showActions = true,
  isFlashSale = false,
  cardWidth = 200,
  noRightMargin = false,
  onAddToCart,
}: ProductCardProps) {
  const { wishlist, addToWishlist, removeFromWishlist } = useStore();
  const { user } = useUser();

  const handleProductPress = () => {
    router.push({
      pathname: "/(routes)/product/[id]",
      params: { id: product.slug || product.id },
    });
  };

  const handleWishlistToggle = (e: any) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    const isInWishlist = wishlist.some((item) => item.id === product.id);
    if (isInWishlist) {
      removeFromWishlist(product.id, user, null, "Mobile App");
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(
        {
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: product.sale_price || product.regular_price,
          image: product.images?.[0]?.url || "",
          shopId: product.Shop?.id || "",
        },
        user,
        null,
        "Mobile App"
      );
      toast.success("Added to wishlist");
    }
  };

  const discountPercentage = product?.sale_price
    ? Math.round(
        ((product.regular_price - product.sale_price) / product.regular_price) * 100
      )
    : 0;

  const currentPrice = product.sale_price || product.regular_price;
  const isOutOfStock = product.stock === 0 || product.outOfStock;
  const rating = product.rating ?? product.averageRating ?? 4.9;

  return (
    <TouchableOpacity
      className={`bg-white rounded-2xl overflow-hidden ${noRightMargin ? "" : "mr-4"}`}
      style={{
        width: cardWidth,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
      onPress={handleProductPress}
      activeOpacity={0.9}
      disabled={isOutOfStock}
    >
      {/* ── Image ── */}
      <View className="relative">
        <Image
          source={{
            uri:
              product.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
          }}
          style={{ width: "100%", height: 170 }}
          resizeMode="cover"
        />

        {/* Premium badges */}
        <ProductBadges badges={(product as any).badges} max={2} />

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <View className="bg-white px-4 py-2 rounded-full">
              <Text className="text-red-500 font-poppins-bold text-sm">OUT OF STOCK</Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Content ── */}
      <View className="px-3 pt-3 pb-3">

        {/* Title + Rating */}
        <View className="flex-row items-center mb-1">
          <Text
            className="font-poppins-bold text-foreground flex-1"
            style={{ fontSize: 17, lineHeight: 24 }}
            numberOfLines={1}
          >
            {product.title || "Item Name"}
          </Text>
          <View className="flex-row items-center ml-2">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text
              className="font-poppins-semibold text-foreground ml-1"
              style={{ fontSize: 13 }}
            >
              {rating}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text
          className="font-poppins text-muted-foreground mb-0.5"
          style={{ fontSize: 13 }}
          numberOfLines={1}
        >
          {product.description || product.short_description || "Description of the item"}
        </Text>

        {/* Unit / Serves */}
        <Text
          className="font-poppins text-muted-foreground mb-3"
          style={{ fontSize: 12 }}
        >
          {product.unit || "Unit"} | Serves {product.serves || "2-4"}
        </Text>

        {/* Price row + Add button */}
        <View className="flex-row items-center">
          {/* Prices */}
          <Text
            className="font-poppins-bold text-foreground"
            style={{ fontSize: 20 }}
          >
            ₹{currentPrice}
          </Text>

          {product.sale_price && product.regular_price && (
            <>
              <Text
                className="font-poppins text-muted-foreground line-through ml-2"
                style={{ fontSize: 13 }}
              >
                ₹{product.regular_price}
              </Text>
              {discountPercentage > 0 && (
                <Text
                  className="font-poppins-semibold text-offer-green ml-1.5"
                  style={{ fontSize: 12 }}
                >
                  {discountPercentage}% off
                </Text>
              )}
            </>
          )}

          {/* Spacer */}
          <View className="flex-1" />

          {/* Add button */}
          {showActions && !isOutOfStock && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                if (!user) {
                  toast.error("Please login to add items to cart");
                  return;
                }
                if (onAddToCart) {
                  onAddToCart(product);
                } else {
                  toast.success("Added to cart");
                }
              }}
              activeOpacity={0.7}
              className="bg-primary rounded-full px-5 py-2"
            >
              <Text className="text-white font-poppins-semibold" style={{ fontSize: 14 }}>
                Add
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
