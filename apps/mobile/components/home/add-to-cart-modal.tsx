import useUser from "@/hooks/useUser";
import {
  normalizeSizePricing,
  resolvePrice,
} from "@/utils/pricing";
import { useStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
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

const PER_KG_STEP = 50;
const PER_KG_MIN = 50;
const PER_KG_DEFAULT = 250;

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

  const [selectedCutting, setSelectedCutting] = useState<string>("");
  const [selectedPieceSize, setSelectedPieceSize] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [perKgWeightGrams, setPerKgWeightGrams] = useState(PER_KG_DEFAULT);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (visible && product) {
      setSelectedCutting(product.cuttingTypes?.[0] || "");
      setSelectedPieceSize(product.pieceSizes?.[0] || "");
      setSelectedSize(product.weight || product.sizes?.[0] || "");
      setQuantity(1);
      setPerKgWeightGrams(PER_KG_DEFAULT);
      setSelectedImageIndex(0);
    }
  }, [visible, product]);

  const hasSizes = (product?.sizes?.length ?? 0) > 0;
  const hasCuttingTypes = (product?.cuttingTypes?.length ?? 0) > 0;
  const hasPieceSizes = (product?.pieceSizes?.length ?? 0) > 0;

  const normalizedSizePricing = useMemo(() => {
    if (!product) return [];
    const salePrice = product.sale_price ?? 0;
    const regularPrice = product.regular_price ?? salePrice;
    return normalizeSizePricing(
      product.sizePricing,
      product.sizes || [],
      salePrice,
      regularPrice,
    );
  }, [product]);

  const resolved = useMemo(() => {
    if (!product) return { salePrice: 0, regularPrice: 0, unit: "" };
    return resolvePrice(product, selectedSize);
  }, [product, selectedSize]);

  // Per-kg mode: product has cutting/piece-size attributes but no size tiers
  const isPerKgMode =
    !!product &&
    (!product.sizes || product.sizes.length === 0) &&
    ((product.cuttingTypes?.length ?? 0) > 0 ||
      (product.pieceSizes?.length ?? 0) > 0);
  const basePricePerKg = isPerKgMode ? (product?.sale_price ?? 0) : null;

  const perKgPricing = useMemo(() => {
    if (!isPerKgMode || !basePricePerKg || !product) return null;
    const cuttingPricing = product.cuttingTypePricing as
      | Array<{ cuttingType: string; salePrice: number }>
      | null
      | undefined;
    const piecePricing = product.pieceSizePricing as
      | Array<{ pieceSize: string; salePrice: number }>
      | null
      | undefined;
    const cuttingCharge =
      cuttingPricing?.find((c) => c.cuttingType === selectedCutting)?.salePrice ?? 0;
    const rawMultiplier =
      piecePricing?.find((p) => p.pieceSize === selectedPieceSize)?.salePrice ?? 1.0;
    const sizeMultiplier =
      rawMultiplier > 0 && rawMultiplier <= 3 ? rawMultiplier : 1.0;
    const ratePerKg = basePricePerKg + cuttingCharge;
    return { cuttingCharge, sizeMultiplier, ratePerKg };
  }, [isPerKgMode, basePricePerKg, selectedCutting, selectedPieceSize, product]);

  const weightDisplay = isPerKgMode
    ? perKgWeightGrams >= 1000
      ? `${parseFloat((perKgWeightGrams / 1000).toFixed(2))} kg`
      : `${perKgWeightGrams} gm`
    : "";

  const totalPayable = useMemo(() => {
    if (isPerKgMode && perKgPricing) {
      return parseFloat(
        ((perKgPricing.ratePerKg / 1000) *
          perKgWeightGrams *
          perKgPricing.sizeMultiplier).toFixed(2),
      );
    }
    return parseFloat((resolved.salePrice * quantity).toFixed(2));
  }, [isPerKgMode, perKgPricing, perKgWeightGrams, resolved.salePrice, quantity]);

  const isOutOfStock = product?.stock === 0;
  const hasDiscount =
    resolved.regularPrice > resolved.salePrice && resolved.regularPrice > 0;
  const discountPct = hasDiscount
    ? Math.round(
        ((resolved.regularPrice - resolved.salePrice) / resolved.regularPrice) * 100,
      )
    : 0;

  const handleAddToCart = (buyNow = false) => {
    if (!product) return;
    const breakdown =
      isPerKgMode && perKgPricing
        ? {
            baseRatePerKg: basePricePerKg ?? product.sale_price ?? 0,
            cuttingCharge: perKgPricing.cuttingCharge,
            sizeMultiplier: perKgPricing.sizeMultiplier,
            weightGrams: perKgWeightGrams,
            effectiveRatePerKg: perKgPricing.ratePerKg,
          }
        : undefined;

    addToCart(
      {
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: isPerKgMode ? totalPayable : resolved.salePrice,
        image: product.images?.[selectedImageIndex]?.url || product.images?.[0]?.url || "",
        shopId: product.Shop?.id || "",
        quantity: isPerKgMode ? 1 : quantity,
        cuttingType: selectedCutting || undefined,
        pieceSize: selectedPieceSize || undefined,
        priceBreakdown: breakdown,
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

  const images = product.images || [];
  const currentImage = images[selectedImageIndex]?.url || images[0]?.url || "";

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
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 bg-gray-300 rounded-full" />
        </View>

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
            <View className="relative">
              <Image
                source={{ uri: currentImage }}
                className="w-24 h-24 rounded-2xl bg-muted"
                resizeMode="cover"
              />
              {discountPct > 0 && (
                <View className="absolute top-1 left-1 bg-offer-green px-1.5 py-0.5 rounded-full">
                  <Text className="text-white text-[9px] font-poppins-bold">
                    {discountPct}% OFF
                  </Text>
                </View>
              )}
            </View>
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
              <View className="flex-row items-baseline gap-2 flex-wrap">
                {isPerKgMode ? (
                  <>
                    <Text
                      className="text-lg text-primary"
                      style={{
                        fontFamily: "Poppins-Bold",
                        fontWeight: Platform.OS === "android" ? "700" : "normal",
                      }}
                    >
                      ₹{Number(product.sale_price).toFixed(0)}
                    </Text>
                    <Text className="text-sm text-muted-foreground font-poppins">/kg</Text>
                    {product.regular_price > product.sale_price && (
                      <Text className="text-sm text-muted-foreground line-through">
                        ₹{Number(product.regular_price).toFixed(0)}/kg
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text
                      className="text-lg text-primary"
                      style={{
                        fontFamily: "Poppins-Bold",
                        fontWeight: Platform.OS === "android" ? "700" : "normal",
                      }}
                    >
                      Rs. {Number(resolved.salePrice).toFixed(2)}
                    </Text>
                    {hasDiscount && (
                      <Text className="text-sm text-muted-foreground line-through">
                        Rs. {Number(resolved.regularPrice).toFixed(2)}
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Thumbnails */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {images.map((img: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedImageIndex(i)}
                  className={`mr-2 rounded-xl overflow-hidden ${
                    i === selectedImageIndex ? "border-2 border-primary" : "border border-border"
                  }`}
                >
                  <Image
                    source={{ uri: img?.url || img }}
                    style={{ width: 56, height: 56 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Short description */}
          {(product.short_description || product.description) && (
            <Text
              className="text-muted-foreground font-poppins text-sm leading-5 mb-4"
              numberOfLines={3}
            >
              {product.short_description || product.description}
            </Text>
          )}

          {/* ── Out of stock ── */}
          {isOutOfStock && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-600 text-sm font-poppins-semibold text-center">
                This item is currently out of stock
              </Text>
            </View>
          )}

          {/* ── Cutting Type (only if backend provides) ── */}
          {hasCuttingTypes && (
            <InlineDropdown
              label="Cutting Type"
              value={selectedCutting}
              options={product.cuttingTypes}
              onSelect={setSelectedCutting}
            />
          )}

          {/* ── Piece Size (only if backend provides) ── */}
          {hasPieceSizes && (
            <InlineDropdown
              label="Piece Size"
              value={selectedPieceSize}
              options={product.pieceSizes}
              onSelect={setSelectedPieceSize}
            />
          )}

          {/* ── Fish / Pack Size (only if backend provides) ── */}
          {hasSizes && (
            <InlineDropdown
              label="Fish / Pack Size"
              value={selectedSize}
              options={normalizedSizePricing.map((e) => {
                return e.salePrice > 0 ? `${e.size} — Rs. ${e.salePrice}` : e.size;
              })}
              onSelect={(v) => setSelectedSize(v.split(" — ")[0])}
            />
          )}

          {/* ── Weight loss info (only if backend provides) ── */}
          {product.processingWeightLoss && (
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
                  {product.processingWeightLoss}.
                </Text>{" "}
                Varies based on cutting type selected.
              </Text>
            </View>
          )}

          {/* ── Stepper + Total ── */}
          <View className="flex-row items-center justify-between border-t border-border pt-4 mb-5">
            <View className="flex-row items-center">
              <View className="flex-row items-center border border-border rounded-full px-3 py-1.5 bg-white">
                <TouchableOpacity
                  onPress={() => {
                    if (isPerKgMode) {
                      setPerKgWeightGrams((w) => Math.max(PER_KG_MIN, w - PER_KG_STEP));
                    } else {
                      setQuantity(Math.max(1, quantity - 1));
                    }
                  }}
                  disabled={isPerKgMode && perKgWeightGrams <= PER_KG_MIN}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={isPerKgMode && perKgWeightGrams <= PER_KG_MIN ? "#9CA3AF" : "#374151"}
                  />
                </TouchableOpacity>
                <Text className="min-w-[56px] text-center font-poppins-semibold text-foreground text-sm">
                  {isPerKgMode ? weightDisplay : quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (isPerKgMode) {
                      setPerKgWeightGrams((w) => w + PER_KG_STEP);
                    } else {
                      setQuantity(quantity + 1);
                    }
                  }}
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
              {isPerKgMode && perKgPricing && (
                <Text className="text-[11px] text-muted-foreground font-poppins ml-2">
                  {perKgPricing.cuttingCharge > 0 ? (
                    <>
                      ₹{product.sale_price}/kg
                      <Text className="text-amber-600"> +₹{perKgPricing.cuttingCharge}</Text>
                      <Text className="text-foreground font-poppins-semibold"> = ₹{perKgPricing.ratePerKg.toFixed(0)}/kg</Text>
                    </>
                  ) : (
                    <Text className="text-foreground font-poppins-semibold">
                      ₹{perKgPricing.ratePerKg.toFixed(0)}/kg
                    </Text>
                  )}
                </Text>
              )}
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
