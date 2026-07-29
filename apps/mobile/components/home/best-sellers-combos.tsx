import ProductCompactCard, {
  compactCardHeight,
} from "@/components/cards/product.compact.card";
import ComboCard from "@/components/home/combo-card";
import type { Banner } from "@/components/home/banner-carousel";
import { colors, fonts, spacing } from "@/constants/theme";
import type { Product } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_GAP = spacing[4];
const COLUMN_WIDTH = (SCREEN_WIDTH - spacing[4] * 2 - COLUMN_GAP) / 2;
// One card fills the column and the rest scroll. The combo artwork beside it is
// given the same height so the two columns line up at the bottom.
const BEST_SELLER_CARD_WIDTH = COLUMN_WIDTH;
const BLOCK_HEIGHT = compactCardHeight(COLUMN_WIDTH);

type SectionHeadingProps = { title: string; onViewAll: () => void };

function SectionHeading({ title, onViewAll }: SectionHeadingProps) {
  return (
    <View style={styles.heading}>
      <Text style={styles.headingTitle}>{title}</Text>
      <Pressable onPress={onViewAll} hitSlop={8} style={styles.viewAll}>
        <Text style={styles.viewAllText}>View All</Text>
        <Ionicons name="chevron-forward" size={13} color={colors.brandMark} />
      </Pressable>
    </View>
  );
}

type BestSellersCombosProps = {
  bestSellers: Product[];
  comboBanner: Banner | null;
  comboProduct?: Product;
  onViewAllBestSellers: () => void;
  onViewAllCombos: () => void;
  onAddToCart: (product: Product) => void;
};

/** The paired "Best Sellers | Combos" block — two half-width columns. */
export default function BestSellersCombos({
  bestSellers,
  comboBanner,
  comboProduct,
  onViewAllBestSellers,
  onViewAllCombos,
  onAddToCart,
}: BestSellersCombosProps) {
  const hasCombo = Boolean(comboBanner || comboProduct);
  if (bestSellers.length === 0 && !hasCombo) return null;

  return (
    <View style={styles.row}>
      {bestSellers.length > 0 && (
        <View style={{ width: hasCombo ? COLUMN_WIDTH : SCREEN_WIDTH - spacing[4] * 2 }}>
          <SectionHeading title="Best Sellers" onViewAll={onViewAllBestSellers} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ height: BLOCK_HEIGHT }}
          >
            {bestSellers.map((product, index) => (
              <ProductCompactCard
                key={product.id || index}
                product={product}
                cardWidth={BEST_SELLER_CARD_WIDTH}
                noRightMargin={index === bestSellers.length - 1}
                onAddToCart={onAddToCart}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {hasCombo && (
        <View
          style={{
            width: bestSellers.length > 0 ? COLUMN_WIDTH : SCREEN_WIDTH - spacing[4] * 2,
          }}
        >
          <SectionHeading title="Combos" onViewAll={onViewAllCombos} />
          <ComboCard
            banner={comboBanner}
            fallbackProduct={comboProduct}
            height={BLOCK_HEIGHT}
            onAddToCart={onAddToCart}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: COLUMN_GAP,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[5],
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[3],
  },
  headingTitle: {
    color: colors.inkStrong,
    fontFamily: fonts.displaySemiBold,
    fontSize: 16,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: colors.brandMark,
    fontFamily: fonts.displayMedium,
    fontSize: 12,
  },
});
