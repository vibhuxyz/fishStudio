import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { toast } from "@/utils/toast";

interface ProductCardProps {
  product: any;
  showActions?: boolean;
  isFlashSale?: boolean;
}

export default function ProductCard({
  product,
  showActions = true,
  isFlashSale = false,
}: ProductCardProps) {

  const { wishlist, addToWishlist, removeFromWishlist } = useStore();
  const { user } = useUser();

  const handleProductPress = (product: any) => {
    router.push({
      pathname: "/(routes)/product/[id]",
      params: {
        id: product.slug || product.id,
      },
    });
  };

  const handleWishlistToggle = (product: any, e: any) => {
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

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const discountPercentage = product?.sale_price
    ? Math.round(
        ((product.regular_price - product.sale_price) / product.regular_price) *
          100
      )
    : 0;

  const currentPrice = product.sale_price || product.regular_price;
  const isOutOfStock = product.stock === 0 || product.outOfStock;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden mr-4"
      style={{ width: 200 }}
      onPress={() => handleProductPress(product)}
      activeOpacity={0.9}
      disabled={isOutOfStock}
    >
      {/* Product Image */}
      <View className="relative">
        <Image
          source={{
            uri:
              product.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&crop=center",
          }}
          className="w-full h-48 bg-muted"
          resizeMode="cover"
        />

        {/* Discount Badge - Top Right */}
        {discountPercentage > 0 && !isOutOfStock && (
          <View className="absolute top-3 right-3 bg-offer-green px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-poppins-bold">
              {discountPercentage}% off
            </Text>
          </View>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-2xl">
            <View className="bg-white px-4 py-2 rounded-full">
              <Text className="text-destructive font-poppins-bold text-sm">
                OUT OF STOCK
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View className="p-4">
        <Text className="text-sm font-poppins-semibold text-foreground mb-1" numberOfLines={1}>
          {product.title}
        </Text>

        <Text className="text-xs text-muted-foreground font-poppins mb-2" numberOfLines={2}>
          {product.description || product.short_description || "Fresh product"}
        </Text>

        {/* Unit Info */}
        <Text className="text-xs text-muted-foreground font-poppins-medium mb-3">
          unit | Serves {product.serves || "2-4"}
        </Text>

        {/* Price Row */}
        <View className="flex-row items-center mb-3">
          <Text className="text-lg font-poppins-bold text-foreground">
            ₹{currentPrice}
          </Text>
          {product.sale_price && product.regular_price && (
            <>
              <Text className="text-sm text-muted-foreground line-through ml-2">
                ₹{product.regular_price}
              </Text>
              {discountPercentage > 0 && (
                <Text className="text-sm font-poppins-semibold text-offer-green ml-2">
                  {discountPercentage}% off
                </Text>
              )}
            </>
          )}
        </View>

        {/* Bottom Row - Delivery Time & Add Button */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-5 h-5 bg-orange-100 rounded-full items-center justify-center mr-1.5">
              <Ionicons name="flash" size={11} color="#F59E0B" />
            </View>
            <Text className="text-xs text-muted-foreground font-poppins-medium">
              {product.deliveryTime ?? product.Shop?.deliveryTime ?? 30} mins
            </Text>
          </View>

          {showActions && !isOutOfStock && (
            <TouchableOpacity
              className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
              onPress={(e) => {
                e.stopPropagation();
                if (!user) {
                  toast.error("Please login to add items to cart");
                  return;
                }
                // Add to cart logic
                toast.success("Added to cart");
              }}
              activeOpacity={0.7}
            >
              <Text className="text-white font-poppins-semibold text-sm mr-1">
                Add
              </Text>
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
