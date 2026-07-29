import AddToCartModal from "@/components/home/add-to-cart-modal";
import ProductCompactCard from "@/components/cards/product.compact.card";
import type { Product } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// The comp fits roughly three cards per screen. The floor is set by the price
// row — "₹1,299/kg" plus the add button stops fitting much below this.
const CARD_WIDTH = Math.min(150, SCREEN_WIDTH * 0.34);

interface SectionCarouselProps {
  title: string;
  products: Product[];
  onSeeAll?: () => void;
}

// A titled, horizontally-scrolling row of product cards used on the home
// screen for sections like "Fresh Today", "Best Seller", "Recently Viewed".
export default function SectionCarousel({
  title,
  products,
  onSeeAll,
}: SectionCarouselProps) {
  const [cartProduct, setCartProduct] = useState<Product | null>(null);

  if (!products || products.length === 0) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      <AddToCartModal
        product={cartProduct}
        visible={!!cartProduct}
        onClose={() => setCartProduct(null)}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter-Bold",
            fontSize: 18,
            color: "#1C1C1C",
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Text>
        {onSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text
              style={{
                fontFamily: "Inter-SemiBold",
                fontSize: 13,
                color: "#5A2C96",
              }}
            >
              See all
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#5A2C96" />
          </TouchableOpacity>
        )}
      </View>

      {/* Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {products.map((product, index: number) => (
          <ProductCompactCard
            key={product.id || index}
            product={product}
            cardWidth={CARD_WIDTH}
            noRightMargin={index === products.length - 1}
            onAddToCart={(p) => setCartProduct(p)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
