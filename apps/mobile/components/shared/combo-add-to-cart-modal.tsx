import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "@/utils/axiosInstance";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import useUser from "@/hooks/useUser";
import { useAddressStore } from "@/lib/address-store";
import { useStore } from "@/store";
import { distributeComboPrice } from "@repo/shared/pricing";
import type { Product } from "@/types/product";
import { toast } from "@/utils/toast";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ComboItemData {
  productId: string;
  quantity: number;
  cuttingType?: string;
  pieceSize?: string;
  product: Product | null;
}

interface ComboData {
  id: string;
  title: string;
  description: string | null;
  regularTotal: number;
  comboPrice: number;
  items: ComboItemData[];
}

interface Props {
  comboId: string | null;
  visible: boolean;
  onClose: () => void;
}

// A combo doesn't let the seller configure a weight per item — order-service
// (createOrder's resolveItemUnitPrice) silently prices any per-kg combo
// member at this default when no size/weight was selected. Surfacing the
// same number here means the modal never promises more fish than the order
// actually gets charged and packed for.
const PER_KG_DEFAULT_WEIGHT_GRAMS = 250;

const formatGrams = (grams: number) =>
  grams >= 1000 ? `${parseFloat((grams / 1000).toFixed(2))} kg` : `${grams} g`;

// Piece-cut items (item.pieceSize / product.pieceSizes) already communicate
// "how much" via their cut size — only whole/fillet items priced by weight
// need this line, and only when the product doesn't already define one.
function comboItemWeightLabel(item: ComboItemData, product: Product | null): string | null {
  if (item.pieceSize || (product?.pieceSizes?.length ?? 0) > 0) return null;
  if (product?.sizes && product.sizes.length > 0) return product.sizes[0];
  if (product?.weight) return product.weight;
  return formatGrams(PER_KG_DEFAULT_WEIGHT_GRAMS);
}

// Inline accordion dropdown — same pattern as add-to-cart-modal.tsx's
// InlineDropdown, kept local since this modal has its own per-item state.
function InlineDropdown({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View className="mb-2">
      <TouchableOpacity
        className="flex-row items-center justify-between border border-border rounded-lg px-3 py-2 bg-white"
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text className="text-foreground font-poppins text-sm flex-1 mr-2">
          {value || `Choose ${label}`}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#64748B" />
      </TouchableOpacity>
      {open && (
        <View className="mt-1 border border-border rounded-lg bg-white overflow-hidden">
          {options.map((opt, i) => (
            <TouchableOpacity
              key={opt}
              className={`flex-row items-center justify-between px-3 py-2 ${
                i < options.length - 1 ? "border-b border-border/50" : ""
              } ${opt === value ? "bg-primary/5" : ""}`}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Text className={`font-poppins text-sm ${opt === value ? "text-primary font-poppins-semibold" : "text-foreground"}`}>
                {opt}
              </Text>
              {opt === value && <Ionicons name="checkmark" size={16} color="#5A2C96" />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ComboAddToCartModal({ comboId, visible, onClose }: Props) {
  const { user } = useUser();
  const { getSelectedAddress } = useAddressStore();
  const selectedAddress = getSelectedAddress();
  const { addToCart } = useStore();
  const insets = useSafeAreaInsets();

  const [combo, setCombo] = useState<ComboData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState<Record<number, { cuttingType?: string; pieceSize?: string }>>({});
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!visible || !comboId) {
      setCombo(null);
      setSelections({});
      return;
    }
    setLoading(true);
    axiosInstance
      .get(`/product/api/get-combo/${comboId}`)
      .then(({ data }) => {
        if (data.success) {
          setCombo(data.combo);
          const initial: Record<number, { cuttingType?: string; pieceSize?: string }> = {};
          data.combo.items.forEach((item: ComboItemData, idx: number) => {
            initial[idx] = {
              cuttingType: item.cuttingType ?? item.product?.cuttingTypes?.[0],
              pieceSize: item.pieceSize ?? item.product?.pieceSizes?.[0],
            };
          });
          setSelections(initial);
        } else {
          toast.error("This combo is no longer available");
          onClose();
        }
      })
      .catch(() => {
        toast.error("Failed to load combo");
        onClose();
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, comboId]);

  const unitPrices = useMemo(() => {
    if (!combo) return [];
    return distributeComboPrice(
      combo.comboPrice,
      combo.items.map((item) => ({
        catalogUnitPrice: item.product?.regular_price || item.product?.sale_price || 0,
        quantity: item.quantity,
      })),
    );
  }, [combo]);

  const discountPct =
    combo && combo.regularTotal > 0
      ? Math.round(((combo.regularTotal - combo.comboPrice) / combo.regularTotal) * 100)
      : 0;

  const handleAdd = () => {
    if (!combo) return;
    for (const item of combo.items) {
      if (!item.product) {
        toast.error("One of the combo items is unavailable right now");
        return;
      }
    }

    setAdding(true);
    try {
      combo.items.forEach((item, idx) => {
        const product = item.product!;
        const selection = selections[idx] || {};
        const cuttingType = item.cuttingType || selection.cuttingType;
        const pieceSize = item.pieceSize || selection.pieceSize;
        // Piece-cut items carry their "how much" via pieceSize already —
        // only stamp selectedSize for the weight-based fallback so it
        // doesn't collide with that.
        const selectedSize = pieceSize ? undefined : comboItemWeightLabel(item, product) || undefined;
        addToCart(
          {
            id: product.id,
            slug: product.slug,
            title: product.title,
            price: unitPrices[idx]!,
            image: product.images?.[0]?.url || "",
            shopId: product.Shop?.id || "",
            quantity: item.quantity,
            cuttingType,
            pieceSize,
            selectedSize,
            comboId: combo.id,
          },
          user,
          selectedAddress,
          "Mobile App",
        );
      });
      toast.success(`${combo.title} added to cart!`);
      onClose();
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50" />
      </TouchableWithoutFeedback>

      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          maxHeight: SCREEN_HEIGHT * 0.8,
        }}
      >
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
          <View style={{ width: 44, height: 5, borderRadius: 99, backgroundColor: "#D1D5DB" }} />
        </View>

        <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
          <Text className="text-lg font-poppins-semibold text-foreground" numberOfLines={1}>
            {combo?.title || "Combo"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator color="#5A2C96" />
          </View>
        ) : combo ? (
          <>
            <ScrollView className="px-5 py-4" style={{ maxHeight: SCREEN_HEIGHT * 0.55 }}>
              {combo.description && (
                <Text className="text-sm text-muted-foreground font-poppins mb-3">{combo.description}</Text>
              )}
              {combo.items.map((item, idx) => {
                const product = item.product;
                const needsCutting = !item.cuttingType && (product?.cuttingTypes?.length ?? 0) > 0;
                const needsPieceSize = !item.pieceSize && (product?.pieceSizes?.length ?? 0) > 0;
                return (
                  <View key={`${item.productId}-${idx}`} className="flex-row gap-3 border border-border rounded-xl p-3 mb-3">
                    <View className="w-14 h-14 rounded-lg bg-muted items-center justify-center overflow-hidden">
                      {product?.images?.[0]?.url ? (
                        <Image source={{ uri: cloudinaryThumbnail(product.images[0].url, 112) }} style={{ width: 56, height: 56 }} resizeMode="cover" />
                      ) : (
                        <Ionicons name="fish-outline" size={22} color="#94A3B8" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-poppins-semibold text-foreground mb-1" numberOfLines={1}>
                        {product?.title || "Unavailable"}
                        {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                      </Text>
                      {item.cuttingType && (
                        <Text className="text-sm text-muted-foreground font-poppins mb-1">Cutting: {item.cuttingType}</Text>
                      )}
                      {needsCutting && product?.cuttingTypes && (
                        <InlineDropdown
                          label="cutting type"
                          value={selections[idx]?.cuttingType || ""}
                          options={product.cuttingTypes}
                          onSelect={(v) => setSelections((prev) => ({ ...prev, [idx]: { ...prev[idx], cuttingType: v } }))}
                        />
                      )}
                      {item.pieceSize && (
                        <Text className="text-sm text-muted-foreground font-poppins mb-1">Size: {item.pieceSize}</Text>
                      )}
                      {comboItemWeightLabel(item, product) && (
                        <Text className="text-sm text-muted-foreground font-poppins mb-1">
                          Weight: {comboItemWeightLabel(item, product)}
                        </Text>
                      )}
                      {needsPieceSize && product?.pieceSizes && (
                        <InlineDropdown
                          label="piece size"
                          value={selections[idx]?.pieceSize || ""}
                          options={product.pieceSizes}
                          onSelect={(v) => setSelections((prev) => ({ ...prev, [idx]: { ...prev[idx], pieceSize: v } }))}
                        />
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View className="px-5 pt-3 border-t border-border" style={{ paddingBottom: insets.bottom + 8 }}>
              <View className="flex-row items-center justify-between bg-primary/5 rounded-xl px-4 py-3 mb-3">
                <View>
                  <Text className="text-sm text-muted-foreground font-poppins" style={{ textDecorationLine: "line-through" }}>
                    ₹{combo.regularTotal.toFixed(0)}
                  </Text>
                  <Text className="text-xl font-poppins-bold text-foreground">₹{combo.comboPrice.toFixed(0)}</Text>
                </View>
                {discountPct > 0 && (
                  <View className="bg-offer-green/10 px-2.5 py-1 rounded-full">
                    <Text className="text-sm font-poppins-semibold text-offer-green">{discountPct}% off</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                className="bg-offer-green rounded-2xl py-4 items-center"
                onPress={handleAdd}
                disabled={adding}
                activeOpacity={0.85}
              >
                <Text className="text-white font-poppins-semibold text-lg">
                  {adding ? "Adding..." : `Add Combo to Cart · ₹${combo.comboPrice.toFixed(0)}`}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}
      </View>
    </Modal>
  );
}
