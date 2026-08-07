import AddToCartModal from "@/components/home/add-to-cart-modal";
import { ProductBadges } from "@/components/home/badge";
import useUser from "@/hooks/useUser";
import { useAddressStore } from "@/lib/address-store";
import { useStore } from "@/store";
import type { Product } from "@/types/product";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  GestureResponderEvent,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "@/utils/toast";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 16 side padding each + 16 gap

interface ProductSectionProps {
  title?: string;
  products: Product[];
  hideTitle?: boolean;
  isFlashSale?: boolean;
  onEndReached?: () => void;
}

export default function ProductSection({
  title,
  products,
  hideTitle = false,
  isFlashSale = false,
  onEndReached,
}: ProductSectionProps) {
  const [cartProduct, setCartProduct] = useState<Product | null>(null);
  const { user } = useUser();
  const { getSelectedAddress } = useAddressStore();
  const selectedAddress = getSelectedAddress();
  const { wishlist, addToWishlist, removeFromWishlist } = useStore();

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: "/(routes)/product/[id]",
      params: { id: product.slug || product.id },
    });
  };

  const handleWishlistToggle = (product: Product, e: GestureResponderEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    const inWishlist = wishlist.some((item) => item.id === product.id);
    if (inWishlist) {
      removeFromWishlist(product.id, user, selectedAddress, "Mobile App");
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
        selectedAddress,
        "Mobile App"
      );
    }
  };

  const isInWishlist = (id: string) => wishlist.some((item) => item.id === id);

  if (!products || products.length === 0) return null;

  return (
    <View className="px-4">
      <AddToCartModal
        product={cartProduct}
        visible={!!cartProduct}
        onClose={() => setCartProduct(null)}
      />

      {/* 2-column grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        {products.map((product, index: number) => {
          const discountPercentage = product?.sale_price
            ? Math.round(
                ((product.regular_price - product.sale_price) /
                  product.regular_price) *
                  100
              )
            : 0;
          const currentPrice = product.sale_price || product.regular_price;
          const isOutOfStock = product.stock === 0 || product.outOfStock;
          const rating = product.rating ?? product.averageRating ?? 4.9;

          return (
            <TouchableOpacity
              key={product.id || index}
              style={{
                width: CARD_WIDTH,
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
              onPress={() => handleProductPress(product)}
              activeOpacity={0.9}
              disabled={isOutOfStock}
            >
              {/* Image */}
              <View style={{ position: "relative" }}>
                <Image
                  source={{
                    uri:
                      cloudinaryThumbnail(product?.images?.[0]?.url, 300) ||
                      "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=300&fit=crop",
                  }}
                  style={{ width: "100%", height: 130 }}
                  resizeMode="cover"
                />

                {/* Premium badges */}
                <ProductBadges badges={product.badges} max={2} small />

                {/* Wishlist heart */}
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={(e) => handleWishlistToggle(product, e)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isInWishlist(product.id) ? "heart" : "heart-outline"}
                    size={16}
                    color="#EF4444"
                  />
                </TouchableOpacity>

                {/* Out of stock */}
                {isOutOfStock && (
                  <View
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View style={{ backgroundColor: "white", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                      <Text style={{ color: "#EF4444", fontFamily: "Inter-Bold", fontSize: 11 }}>
                        OUT OF STOCK
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Content */}
              <View style={{ padding: 10 }}>
                {/* Title + Rating */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                  <Text
                    style={{
                      fontFamily: "Inter-Bold",
                      fontSize: 14,
                      color: "#1A1C1C",
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {product.title || "Item Name"}
                  </Text>
                  <Ionicons name="star" size={12} color="#F59E0B" style={{ marginLeft: 4 }} />
                  <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: "#1A1C1C", marginLeft: 2 }}>
                    {rating}
                  </Text>
                </View>

                {/* Description */}
                <Text
                  style={{ fontFamily: "Inter-Regular", fontSize: 11, color: "#898B8A", marginBottom: 1 }}
                  numberOfLines={1}
                >
                  {product.description || product.short_description || "Description of the item"}
                </Text>

                {/* Unit / Serves */}
                <Text
                  style={{ fontFamily: "Inter-Regular", fontSize: 10, color: "#898B8A", marginBottom: 8 }}
                >
                  {product.unit || "Unit"} | Serves {product.serves || "2-4"}
                </Text>

                {/* Price */}
                <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                  <Text style={{ fontFamily: "Inter-Bold", fontSize: 16, color: "#1A1C1C" }}>
                    ₹{currentPrice}
                  </Text>
                  {product.sale_price && product.regular_price && (
                    <Text
                      style={{
                        fontFamily: "Inter-Regular",
                        fontSize: 11,
                        color: "#A1A1AA",
                        textDecorationLine: "line-through",
                        marginLeft: 4,
                      }}
                    >
                      ₹{product.regular_price}
                    </Text>
                  )}
                </View>

                {/* Discount badge + Add — own row so a long "% off" string never
                    crowds the fixed-width Add button out of the card */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 4,
                  }}
                >
                  {discountPercentage > 0 ? (
                    <Text
                      style={{
                        fontFamily: "Inter-SemiBold",
                        fontSize: 10,
                        color: "#22C55E",
                      }}
                      numberOfLines={1}
                    >
                      {discountPercentage}% off
                    </Text>
                  ) : (
                    <View />
                  )}

                  {/* Add button */}
                  {!isOutOfStock && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        if (!user) {
                          toast.error("Please login to add items to cart");
                          return;
                        }
                        setCartProduct(product);
                      }}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: "#5A2C96",
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 50,
                      }}
                    >
                      <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 12, color: "#FFFFFF" }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
