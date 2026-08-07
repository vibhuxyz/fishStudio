import { useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "@/utils/axiosInstance";
import { useAddressStore } from "@/lib/address-store";
import { ProductBadges } from "@/components/home/badge";
import { colors, fonts, radii, shadows, spacing } from "@/constants/theme";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import ComboAddToCartModal from "@/components/shared/combo-add-to-cart-modal";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Match the other home rails (section-carousel.tsx) so Combos doesn't stand
// out as an oversized card next to Fresh Today / Best Seller.
const CARD_WIDTH = Math.min(150, SCREEN_WIDTH * 0.34);
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 0.62);

interface ComboSummary {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  regularTotal: number;
  comboPrice: number;
  items: {
    quantity: number;
    product: { images?: { url: string }[]; title: string } | null;
  }[];
}

async function fetchHomeCombos(params: { storeId?: string; pincode?: string; city?: string }): Promise<ComboSummary[]> {
  const query = new URLSearchParams();
  if (params.storeId) query.set("storeId", params.storeId);
  if (params.pincode) query.set("pincode", params.pincode);
  if (params.city) query.set("city", params.city);
  const { data } = await axiosInstance.get(`/product/api/get-combos?${query.toString()}`);
  return data.success ? data.combos : [];
}

// The real, purchasable "Combos" section — a fixed bundle of products at one
// bundle price. Card matches ProductCard's layout (components/cards/product.card.tsx)
// so it reads as the same design language as any other product tile.
//
// `fallback` mirrors the web version (real-combos-section.tsx in user-ui):
// rendered in place of this section when the resolved store hasn't created a
// real combo bundle yet, so the two "Combos" tiles never both show at once.
export default function RealCombosSection({
  fallback = null,
}: {
  fallback?: React.ReactNode;
}) {
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const getSelectedAddress = useAddressStore((s) => s.getSelectedAddress);
  const selectedAddress = getSelectedAddress();
  const [openComboId, setOpenComboId] = useState<string | null>(null);

  // Same fallback the rest of the home screen uses — a customer may not
  // have explicitly picked a store yet this session, only a pincode/city.
  const params = {
    storeId: selectedLocation?.storeId,
    pincode: selectedLocation?.pincode || selectedAddress?.pincode,
    city: selectedLocation?.city || selectedAddress?.city,
  };
  const locationKey = `${params.storeId ?? ""}|${params.pincode ?? ""}|${params.city ?? ""}`;

  const { data: combos = [], isLoading } = useQuery({
    queryKey: ["home-combos", locationKey],
    queryFn: () => fetchHomeCombos(params),
    enabled: !!(params.storeId || params.pincode || params.city),
    staleTime: 1000 * 60 * 5,
  });

  if (combos.length === 0) return isLoading ? null : <>{fallback}</>;

  return (
    <View style={{ paddingHorizontal: spacing[4], paddingVertical: spacing[3] }}>
      <Text style={{ fontFamily: fonts.displayBold, fontSize: 18, color: colors.inkStrong, marginBottom: spacing[3] }}>
        Combos
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {combos.map((combo, i) => (
          <ComboCard
            key={combo.id}
            combo={combo}
            noRightMargin={i === combos.length - 1}
            onPress={() => setOpenComboId(combo.id)}
          />
        ))}
      </ScrollView>

      <ComboAddToCartModal
        comboId={openComboId}
        visible={!!openComboId}
        onClose={() => setOpenComboId(null)}
      />
    </View>
  );
}

function ComboCard({
  combo,
  noRightMargin,
  onPress,
}: {
  combo: ComboSummary;
  noRightMargin: boolean;
  onPress: () => void;
}) {
  const discountPct =
    combo.regularTotal > 0
      ? Math.round(((combo.regularTotal - combo.comboPrice) / combo.regularTotal) * 100)
      : 0;
  // One grid cell per bundled product — 2 items = 2-way split, 3 = 3-way,
  // 4 = 4-way — each showing that product's own first image (or its own
  // placeholder icon if it has none), not a single icon for the whole card.
  const gridItems = combo.items.slice(0, 4).map((i) => ({
    url: i.product?.images?.[0]?.url,
    title: i.product?.title,
  }));
  const itemNames = combo.items
    .map((i) => i.product?.title)
    .filter((t): t is string => Boolean(t));

  return (
    <TouchableOpacity
      style={[styles.card, { width: CARD_WIDTH }, !noRightMargin && styles.cardSpacing]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View>
        {combo.images[0] ? (
          // Seller-uploaded combo photo takes priority over the per-product grid.
          <Image
            source={{ uri: cloudinaryThumbnail(combo.images[0], 300) }}
            style={[styles.image, { height: IMAGE_HEIGHT }]}
            resizeMode="cover"
          />
        ) : gridItems.length > 0 ? (
          <View style={[styles.imageGrid, { height: IMAGE_HEIGHT }]}>
            {gridItems.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.gridCell,
                  {
                    width: gridItems.length === 1 ? "100%" : "49.5%",
                    height: gridItems.length <= 2 ? IMAGE_HEIGHT : IMAGE_HEIGHT / 2 - 0.5,
                  },
                ]}
              >
                {item.url ? (
                  <Image
                    source={{ uri: cloudinaryThumbnail(item.url, 300) }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
                )}
              </View>
            ))}
          </View>
        ) : (
          <Image
            source={{ uri: FALLBACK_IMAGE }}
            style={[styles.image, { height: IMAGE_HEIGHT }]}
            resizeMode="cover"
          />
        )}
        <ProductBadges badges={["Combo"]} max={2} small />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {combo.title}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {combo.description || itemNames.join(" + ")}
        </Text>
        <Text style={styles.meta}>{combo.items.length} products bundled</Text>

        <View style={styles.footer}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{combo.comboPrice.toFixed(0)}</Text>
            <Text style={styles.strikePrice}>₹{combo.regularTotal.toFixed(0)}</Text>
          </View>
          {discountPct > 0 && <Text style={styles.discount}>{discountPct}% off</Text>}

          <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.addButton}>
            <Ionicons name="add" size={16} color={colors.textWhite} />
          </TouchableOpacity>
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
  imageGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 1,
  },
  gridCell: {
    backgroundColor: colors.secondaryBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  body: {
    paddingHorizontal: spacing[2],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    flex: 1,
  },
  title: {
    color: colors.inkStrong,
    fontFamily: fonts.displayBold,
    fontSize: 12,
    lineHeight: 16,
  },
  description: {
    marginTop: spacing[1] / 2,
    color: colors.textSecondary,
    fontFamily: fonts.displayRegular,
    fontSize: 10,
    lineHeight: 13,
  },
  meta: {
    marginTop: spacing[1] / 2,
    color: colors.textSecondary,
    fontFamily: fonts.displayRegular,
    fontSize: 10,
  },
  footer: {
    marginTop: spacing[2],
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexShrink: 1,
  },
  price: {
    color: colors.inkStrong,
    fontFamily: fonts.displayBold,
    fontSize: 13,
  },
  strikePrice: {
    marginLeft: spacing[1] + 2,
    color: colors.textSecondary,
    fontFamily: fonts.displayRegular,
    fontSize: 10,
    textDecorationLine: "line-through",
  },
  discount: {
    marginLeft: spacing[1],
    color: colors.offerGreen,
    fontFamily: fonts.displaySemiBold,
    fontSize: 10,
  },
  addButton: {
    marginLeft: "auto",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
});
