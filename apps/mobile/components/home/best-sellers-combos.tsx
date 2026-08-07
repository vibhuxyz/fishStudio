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
const SECTION_GAP = spacing[5];
const FULL_WIDTH = SCREEN_WIDTH - spacing[4] * 2;
const BEST_SELLER_CARD_WIDTH = FULL_WIDTH / 2 - spacing[4] / 2;
const BLOCK_HEIGHT = compactCardHeight(BEST_SELLER_CARD_WIDTH);

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
  onViewAllBestSellers: () => void;
  onAddToCart: (product: Product) => void;
};

/** Best Sellers rail. */
export default function BestSellersCombos({
  bestSellers,
  onViewAllBestSellers,
  onAddToCart,
}: BestSellersCombosProps) {
  if (bestSellers.length === 0) return null;

  return (
    <View style={styles.stack}>
      <View style={styles.section}>
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
    </View>
  );
}

type LegacyCombosSectionProps = {
  comboBanner: Banner | null;
  comboProduct?: Product;
  onViewAllCombos: () => void;
  onAddToCart: (product: Product) => void;
};

// The old tag/banner-based "Combos" tile — a single card, either admin
// artwork or the cheapest "combos"-tagged product. Rendered only as a
// fallback when a store hasn't created a real combo bundle yet (see
// RealCombosSection's `fallback` prop).
export function LegacyCombosSection({
  comboBanner,
  comboProduct,
  onViewAllCombos,
  onAddToCart,
}: LegacyCombosSectionProps) {
  if (!comboBanner && !comboProduct) return null;

  return (
    <View style={styles.stack}>
      <View style={styles.section}>
        <SectionHeading title="Combos" onViewAll={onViewAllCombos} />
        <ComboCard
          banner={comboBanner}
          fallbackProduct={comboProduct}
          height={BLOCK_HEIGHT}
          onAddToCart={onAddToCart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[5],
  },
  section: {
    marginBottom: SECTION_GAP,
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
