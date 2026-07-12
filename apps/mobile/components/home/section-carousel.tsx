import AddToCartModal from "@/components/home/add-to-cart-modal";
import ProductCard from "@/components/cards/product.card";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(180, SCREEN_WIDTH * 0.46);

interface SectionCarouselProps {
  title: string;
  products: any[];
  onSeeAll?: () => void;
}

// A titled, horizontally-scrolling row of product cards used on the home
// screen for sections like "Fresh Today", "Best Seller", "Recently Viewed".
export default function SectionCarousel({
  title,
  products,
  onSeeAll,
}: SectionCarouselProps) {
  const [cartProduct, setCartProduct] = useState<any>(null);

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
        {products.map((product: any, index: number) => (
          <ProductCard
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
