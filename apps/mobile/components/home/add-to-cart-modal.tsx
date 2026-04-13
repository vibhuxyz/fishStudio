import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { toast } from "@/utils/toast";
import { router } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const DEFAULT_CUTTING_TYPES = [
  "Whole-Cleaned",
  "Whole-UnCleaned",
  "Skinless & Boneless",
  "Curry Cut",
  "Steak Cut",
  "Fillet",
];

const WEIGHT_LOSS_MAP: Record<string, string> = {
  "Whole-Cleaned": "15% - 20%",
  "Whole-UnCleaned": "5% - 10%",
  "Skinless & Boneless": "40% - 50%",
  "Curry Cut": "25% - 30%",
  "Steak Cut": "20% - 25%",
  Fillet: "45% - 55%",
};

interface Props {
  product: any;
  visible: boolean;
  onClose: () => void;
}

// Inline accordion dropdown (safe inside a Modal — no nested Modal)
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
    <View className="mb-4">
      <Text className="text-xs font-poppins-semibold text-foreground uppercase tracking-wide mb-2">
        {label}
      </Text>

      {/* Trigger row */}
      <TouchableOpacity
        className="flex-row items-center justify-between border border-border rounded-xl px-4 py-3 bg-white"
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text className="text-foreground font-poppins text-base flex-1 mr-2">
          {value || `Select ${label}`}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={17}
          color="#64748B"
        />
      </TouchableOpacity>

      {/* Options list (inline) */}
      {open && (
        <View className="mt-1 border border-border rounded-xl bg-white overflow-hidden">
          {options.map((opt, i) => (
            <TouchableOpacity
              key={opt}
              className={`flex-row items-center justify-between px-4 py-3 ${
                i < options.length - 1 ? "border-b border-border/50" : ""
              } ${opt === value ? "bg-primary/5" : ""}`}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                className={`font-poppins text-sm flex-1 mr-2 ${
                  opt === value
                    ? "text-primary font-poppins-semibold"
                    : "text-foreground"
                }`}
              >
                {opt}
              </Text>
              {opt === value && (
                <Ionicons name="checkmark" size={17} color="#6C3CE1" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function AddToCartModal({ product, visible, onClose }: Props) {
  const { user } = useUser();
  const { addToCart } = useStore();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedCutting, setSelectedCutting] = useState<string>("");
  const [selectedPieceSize, setSelectedPieceSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (visible && product) {
      const cuttingOpts =
        product.cuttingTypes ||
        product.cuttingOptions ||
        product.cutting_options ||
        DEFAULT_CUTTING_TYPES;
      setSelectedCutting(cuttingOpts[0] || "");

      const sizeOpts =
        product.pieceSizes || product.piece_sizes || [];
      setSelectedPieceSize(sizeOpts[0] || "");

      setSelectedSize(product.sizes?.[0] || "");
      setQuantity(1);
    }
  }, [visible, product]);

  const resolvedPrice = useMemo(() => {
    if (!product) return { sale: 0, regular: 0 };
    if (selectedSize && product.sizePricing) {
      const entry = product.sizePricing[selectedSize];
      if (entry) {
        return {
          sale: entry.salePrice ?? entry.price ?? product.sale_price ?? product.regular_price,
          regular: entry.regularPrice ?? entry.price ?? product.regular_price,
        };
      }
    }
    return {
      sale: product.sale_price ?? product.regular_price ?? 0,
      regular: product.regular_price ?? 0,
    };
  }, [product, selectedSize]);

  const totalPayable = useMemo(
    () => parseFloat((resolvedPrice.sale * quantity).toFixed(2)),
    [resolvedPrice.sale, quantity]
  );

  const isOutOfStock = product?.stock === 0;
  const hasDiscount =
    resolvedPrice.regular > resolvedPrice.sale && resolvedPrice.regular > 0;
  const discountPct = hasDiscount
    ? Math.round(
        ((resolvedPrice.regular - resolvedPrice.sale) / resolvedPrice.regular) * 100
      )
    : 0;

  // Cutting options: use product data or fallback
  const cuttingOptions: string[] =
    product?.cuttingTypes ||
    product?.cuttingOptions ||
    product?.cutting_options ||
    DEFAULT_CUTTING_TYPES;

  const pieceSizes: string[] =
    product?.pieceSizes || product?.piece_sizes || [];

  const hasSizes = product?.sizes && product.sizes.length > 0;
  const weightLoss =
    product?.weightLoss ||
    WEIGHT_LOSS_MAP[selectedCutting] ||
    "5% - 10%";

  const handleAddToCart = (buyNow = false) => {
    if (!product) return;
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: resolvedPrice.sale,
        image: product.images?.[0]?.url || "",
        shopId: product.Shop?.id || "",
        quantity,
      },
      user,
      null,
      "Mobile App"
    );
    onClose();
    if (buyNow) {
      router.push("/(tabs)/cart");
    } else {
      toast.success(`${product.title} added to cart`);
    }
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50" />
      </TouchableWithoutFeedback>

      <View
        className="bg-white rounded-t-3xl"
        style={{ maxHeight: SCREEN_HEIGHT * 0.9 }}
      >
        {/* Handle bar */}
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 bg-gray-300 rounded-full" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
          <Text className="text-base font-poppins-semibold text-foreground">
            Customize & Add
          </Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Product info row ── */}
          <View className="flex-row gap-4 mb-5">
            <Image
              source={{
                uri: product.images?.[0]?.url || "",
              }}
              className="w-24 h-24 rounded-2xl bg-muted"
              resizeMode="cover"
            />
            <View className="flex-1 justify-center">
              <Text className="text-[10px] font-poppins-bold uppercase tracking-widest text-primary mb-1">
                {product.subCategory || product.category || ""}
              </Text>
              <Text
                className="text-base text-foreground leading-5 mb-2"
                style={{
                  fontFamily: "Poppins-SemiBold",
                  fontWeight: Platform.OS === "android" ? "600" : "normal",
                }}
                numberOfLines={2}
              >
                {product.title}
              </Text>
              <View className="flex-row items-baseline gap-2">
                <Text
                  className="text-lg text-primary"
                  style={{
                    fontFamily: "Poppins-Bold",
                    fontWeight: Platform.OS === "android" ? "700" : "normal",
                  }}
                >
                  Rs. {Number(resolvedPrice.sale).toFixed(2)}
                </Text>
                {hasDiscount && (
                  <>
                    <Text className="text-sm text-muted-foreground line-through">
                      Rs. {Number(resolvedPrice.regular).toFixed(2)}
                    </Text>
                    <View className="bg-offer-green/10 px-2 py-0.5 rounded-full">
                      <Text className="text-offer-green text-xs font-poppins-semibold">
                        {discountPct}% off
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* ── Out of stock ── */}
          {isOutOfStock && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-600 text-sm font-poppins-semibold text-center">
                This item is currently out of stock
              </Text>
            </View>
          )}

          {/* ── Cutting Type Dropdown ── */}
          <InlineDropdown
            label="Cutting Type"
            value={selectedCutting}
            options={cuttingOptions}
            onSelect={setSelectedCutting}
          />

          {/* ── Piece Size Dropdown ── */}
          {pieceSizes.length > 0 && (
            <InlineDropdown
              label="Piece Size"
              value={selectedPieceSize}
              options={pieceSizes}
              onSelect={setSelectedPieceSize}
            />
          )}

          {/* ── Fish / Pack Size Dropdown ── */}
          {hasSizes && (
            <InlineDropdown
              label="Fish / Pack Size"
              value={selectedSize}
              options={product.sizes.map((s: string) => {
                const entry = product.sizePricing?.[s];
                const p = entry?.salePrice ?? entry?.price;
                return p ? `${s} — Rs. ${p}` : s;
              })}
              onSelect={(v) => {
                // strip the " — Rs. X" part if present
                setSelectedSize(v.split(" — ")[0]);
              }}
            />
          )}

          {/* ── Weight loss info box ── */}
          <View className="bg-muted rounded-xl px-4 py-3 mb-5 flex-row items-start border border-border">
            <Ionicons
              name="information-circle-outline"
              size={17}
              color="#64748B"
              style={{ marginTop: 1 }}
            />
            <Text className="text-muted-foreground font-poppins ml-2 flex-1 text-xs leading-5">
              Processing weight loss:{" "}
              <Text className="text-foreground font-poppins-semibold">
                {weightLoss} kg.
              </Text>{" "}
              Varies based on cutting type selected.
            </Text>
          </View>

          {/* ── Qty stepper + Total ── */}
          <View className="flex-row items-center justify-between border-t border-border pt-4 mb-5">
            <View className="flex-row items-center border border-border rounded-full px-3 py-1.5 bg-white">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="remove" size={18} color="#374151" />
              </TouchableOpacity>
              <Text className="min-w-[28px] text-center font-poppins-semibold text-foreground text-sm">
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                disabled={isOutOfStock}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={isOutOfStock ? "#9CA3AF" : "#374151"}
                />
              </TouchableOpacity>
            </View>

            <View className="items-end">
              <Text className="text-xs text-muted-foreground font-poppins">
                Total Payable
              </Text>
              <Text
                className="text-xl text-foreground"
                style={{
                  fontFamily: "Poppins-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
              >
                Rs. {totalPayable.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* ── CTA Buttons ── */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 h-13 py-4 rounded-2xl items-center justify-center ${
                isOutOfStock ? "bg-muted" : "bg-accent"
              }`}
              onPress={() => handleAddToCart(false)}
              disabled={isOutOfStock}
              activeOpacity={0.85}
            >
              <Text
                className={`text-sm font-poppins-semibold ${
                  isOutOfStock ? "text-muted-foreground" : "text-white"
                }`}
              >
                Add to Cart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 h-13 py-4 rounded-2xl items-center justify-center ${
                isOutOfStock ? "bg-muted" : "bg-primary"
              }`}
              onPress={() => handleAddToCart(true)}
              disabled={isOutOfStock}
              activeOpacity={0.85}
            >
              <Text
                className={`text-sm font-poppins-semibold ${
                  isOutOfStock ? "text-muted-foreground" : "text-white"
                }`}
              >
                Buy Now
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
