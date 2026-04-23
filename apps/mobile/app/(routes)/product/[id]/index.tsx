import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import { useAddressStore } from "@/lib/address-store";
import axiosInstance from "@/utils/axiosInstance";
import { resolveProductSizePricing } from "@/utils/pricing";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useGlobalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "@/utils/toast";

const { width } = Dimensions.get("window");

const PER_KG_STEP = 50;
const PER_KG_MIN = 50;
const PER_KG_DEFAULT = 250;

// Inline bottom-sheet dropdown (mobile-native Modal)
function Dropdown({
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
      <Text className="text-base font-poppins-semibold text-foreground mb-2">
        {label}
      </Text>
      <TouchableOpacity
        className="flex-row items-center justify-between border border-border rounded-xl px-4 py-3 bg-white"
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text className="text-foreground font-poppins text-base flex-1 mr-2">
          {value || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View className="bg-white rounded-t-3xl pb-8">
            <View className="px-6 py-4 border-b border-border flex-row items-center justify-between">
              <Text className="text-lg font-poppins-semibold text-foreground">
                {label}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                className={`px-6 py-4 flex-row items-center justify-between border-b border-border/50 ${
                  opt === value ? "bg-primary/5" : ""
                }`}
                onPress={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-poppins text-base ${
                    opt === value ? "text-primary font-poppins-semibold" : "text-foreground"
                  }`}
                >
                  {opt}
                </Text>
                {opt === value && (
                  <Ionicons name="checkmark" size={20} color="#6C3CE1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useGlobalSearchParams();
  const { user } = useUser();
  const { wishlist, addToWishlist, removeFromWishlist, addToCart } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { selectedLocation, locationVersion } = useAddressStore();
  const locationParams = selectedLocation?.storeId
    ? `storeId=${selectedLocation.storeId}&pincode=${selectedLocation.pincode}&city=${selectedLocation.city}`
    : selectedLocation?.pincode
    ? `pincode=${selectedLocation.pincode}&city=${selectedLocation.city}`
    : "";

  // Fetch product details (same endpoint as user-ui's fetchStorefrontProductBySlug)
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["product", id, locationParams, locationVersion],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/product/api/get-product/${id}${locationParams ? `?${locationParams}` : ""}`
      );
      return response.data.product;
    },
  });

  // Selection state — mirrors user-ui's ProductDetailClient
  const [selectedCutting, setSelectedCutting] = useState<string>("");
  const [selectedPieceSize, setSelectedPieceSize] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedWeightGrams, setSelectedWeightGrams] = useState<number>(0);
  const [perKgWeightGrams, setPerKgWeightGrams] = useState(PER_KG_DEFAULT);

  // Reset selections whenever the product changes
  useEffect(() => {
    if (!product) return;
    setSelectedCutting(product.cuttingTypes?.[0] || "");
    setSelectedPieceSize(product.pieceSizes?.[0] || "");
    setSelectedSize(product.weight || product.sizes?.[0] || "");
  }, [product]);

  const { normalizedPricing, selected } = useMemo(
    () => resolveProductSizePricing(product ?? {}, selectedSize),
    [product, selectedSize],
  );

  const isWeightAdjustable = selected.weightGrams > 0;
  const isPerKgMode =
    (product?.sizes?.length ?? 0) === 0 &&
    ((product?.cuttingTypes?.length ?? 0) > 0 ||
      (product?.pieceSizes?.length ?? 0) > 0);
  const basePricePerKg = isPerKgMode ? selected.salePrice : null;

  useEffect(() => {
    setSelectedWeightGrams(selected.weightGrams || 0);
  }, [selected.size, selected.weightGrams]);

  // Per-kg rate + size multiplier derivation (mirrors web exactly)
  const perKgPricing = useMemo(() => {
    if (!isPerKgMode || !basePricePerKg) return null;
    const cuttingPricing = product?.cuttingTypePricing as
      | Array<{ cuttingType: string; salePrice: number }>
      | null
      | undefined;
    const piecePricing = product?.pieceSizePricing as
      | Array<{ pieceSize: string; salePrice: number }>
      | null
      | undefined;

    const cuttingCharge =
      cuttingPricing?.find((c) => c.cuttingType === selectedCutting)?.salePrice ?? 0;
    const rawMultiplier =
      piecePricing?.find((p) => p.pieceSize === selectedPieceSize)?.salePrice ?? 1.0;
    // Clamp multiplier to 0.5–3.0 — treat out-of-range as stale/bad data
    const sizeMultiplier =
      rawMultiplier > 0 && rawMultiplier <= 3 ? rawMultiplier : 1.0;
    const ratePerKg = basePricePerKg + cuttingCharge;

    return { cuttingCharge, sizeMultiplier, ratePerKg };
  }, [isPerKgMode, basePricePerKg, selectedCutting, selectedPieceSize, product]);

  const computedSalePrice = useMemo(() => {
    if (isPerKgMode && basePricePerKg && perKgPricing) {
      return parseFloat(
        ((perKgPricing.ratePerKg / 1000) *
          perKgWeightGrams *
          perKgPricing.sizeMultiplier).toFixed(2),
      );
    }
    if (!isWeightAdjustable || selectedWeightGrams <= 0) {
      return parseFloat((selected.salePrice || 0).toFixed(2));
    }
    const pricePerGram = selected.salePrice / selected.weightGrams;
    return parseFloat((pricePerGram * selectedWeightGrams).toFixed(2));
  }, [
    isPerKgMode,
    basePricePerKg,
    perKgPricing,
    perKgWeightGrams,
    isWeightAdjustable,
    selected.salePrice,
    selected.weightGrams,
    selectedWeightGrams,
  ]);

  const computedRegularPrice = useMemo(() => {
    if (isPerKgMode) return computedSalePrice;
    if (!isWeightAdjustable || selectedWeightGrams <= 0) {
      return parseFloat((selected.regularPrice || 0).toFixed(2));
    }
    const pricePerGram = selected.regularPrice / selected.weightGrams;
    return parseFloat((pricePerGram * selectedWeightGrams).toFixed(2));
  }, [
    isPerKgMode,
    computedSalePrice,
    isWeightAdjustable,
    selected.regularPrice,
    selected.weightGrams,
    selectedWeightGrams,
  ]);

  const totalPayable = computedSalePrice;
  const activeWeightGrams = isPerKgMode ? perKgWeightGrams : selectedWeightGrams;
  const weightDisplay =
    isPerKgMode || (isWeightAdjustable && selectedWeightGrams > 0)
      ? activeWeightGrams >= 1000
        ? `${parseFloat((activeWeightGrams / 1000).toFixed(2))} kg`
        : `${activeWeightGrams} gm`
      : selected.size;

  // Related products — use get-all-products with category filter
  const { data: relatedProducts, isLoading: relatedLoading } = useQuery({
    queryKey: ["related-products", product?.category, id],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-all-products", {
        params: {
          category: product.category,
          limit: 8,
          page: 1,
          ...(locationParams
            ? Object.fromEntries(new URLSearchParams(locationParams))
            : {}),
        },
      });
      return (res.data.products || []).filter((p: any) => p.id !== product.id);
    },
    enabled: !!product?.category,
  });

  const isWishlisted = product ? wishlist.some((i) => i.id === product.id) : false;

  const handleWishlistToggle = () => {
    if (!user) { toast.error("Please login to add items to wishlist"); return; }
    if (!product) return;
    if (isWishlisted) {
      removeFromWishlist(product.id, user, null, "Mobile App");
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(
        { id: product.id, slug: product.slug, title: product.title, price: product.sale_price || product.regular_price, image: product.images?.[0]?.url || "", shopId: product.Shop?.id || "" },
        user, null, "Mobile App"
      );
      toast.success("Added to wishlist");
    }
  };

  const buildBreakdown = () =>
    isPerKgMode && perKgPricing
      ? {
          baseRatePerKg: selected.salePrice,
          cuttingCharge: perKgPricing.cuttingCharge,
          sizeMultiplier: perKgPricing.sizeMultiplier,
          weightGrams: perKgWeightGrams,
          effectiveRatePerKg: perKgPricing.ratePerKg,
        }
      : undefined;

  const addCurrentToCart = () => {
    if (!product) return;
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: computedSalePrice,
        image: product.images?.[0]?.url || "",
        shopId: product.Shop?.id || "",
        quantity: 1,
        cuttingType: selectedCutting || undefined,
        pieceSize: selectedPieceSize || undefined,
        priceBreakdown: buildBreakdown(),
      },
      user, null, "Mobile App"
    );
  };

  const handleAddToCart = () => {
    if (!user) { toast.error("Please login to add items to cart"); return; }
    if (!product) return;
    addCurrentToCart();
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!user) { toast.error("Please login to purchase"); return; }
    if (!product) return;
    addCurrentToCart();
    router.push("/(tabs)/cart");
  };

  // ─── Image Gallery ────────────────────────────────────────────────────────
  const renderImageGallery = () => {
    const images = product?.images || [];
    const discountPct = product?.sale_price
      ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
      : 0;

    const mainUri =
      images.length > 0
        ? images[selectedImageIndex]?.url || images[selectedImageIndex]
        : null;

    return (
      <View className="mb-4">
        <View className="relative">
          <Image
            source={mainUri ? { uri: mainUri } : require("@/assets/images/icon.png")}
            style={{ width, height: width * 0.85 }}
            resizeMode="cover"
          />
          {discountPct > 0 && (
            <View className="absolute top-4 left-4 bg-offer-green px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-poppins-bold">{discountPct}% OFF</Text>
            </View>
          )}
          {images.length > 1 && (
            <>
              <TouchableOpacity
                className="absolute left-3 bg-white/90 rounded-full w-9 h-9 items-center justify-center shadow"
                style={{ top: width * 0.85 / 2 - 18 }}
                onPress={() => setSelectedImageIndex((p) => (p - 1 + images.length) % images.length)}
              >
                <Ionicons name="chevron-back" size={18} color="#1E293B" />
              </TouchableOpacity>
              <TouchableOpacity
                className="absolute right-3 bg-white/90 rounded-full w-9 h-9 items-center justify-center shadow"
                style={{ top: width * 0.85 / 2 - 18 }}
                onPress={() => setSelectedImageIndex((p) => (p + 1) % images.length)}
              >
                <Ionicons name="chevron-forward" size={18} color="#1E293B" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {images.length > 1 && (
          <View className="flex-row px-4 pt-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((img: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedImageIndex(i)}
                  className={`mr-3 rounded-xl overflow-hidden ${
                    i === selectedImageIndex ? "border-2 border-primary" : "border border-border"
                  }`}
                >
                  <Image
                    source={{ uri: img?.url || img }}
                    style={{ width: 64, height: 64 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // ─── Product Info ─────────────────────────────────────────────────────────
  const renderProductInfo = () => {
    const ratingCount = product?.reviews?.length || product?.ratingCount || 5;
    const ratingValue = product?.rating || 5;
    const hasCuttingTypes = (product?.cuttingTypes?.length ?? 0) > 0;
    const hasPieceSizes = (product?.pieceSizes?.length ?? 0) > 0;
    const hasSizes = (product?.sizes?.length ?? 0) > 0;

    return (
      <View className="px-4 mb-2">
        {/* Breadcrumb */}
        <View className="flex-row items-center flex-wrap mb-3">
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <Text className="text-[11px] text-gray-500 font-poppins-semibold tracking-wider">
              HOME
            </Text>
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={11} color="#9CA3AF" style={{ marginHorizontal: 4 }} />
          <Text className="text-[11px] text-gray-500 font-poppins-semibold tracking-wider">
            {(product?.subCategory || product?.category || "").toUpperCase()}
          </Text>
          <Ionicons name="chevron-forward" size={11} color="#9CA3AF" style={{ marginHorizontal: 4 }} />
          <Text
            className="text-[11px] text-primary font-poppins-bold tracking-wider flex-1"
            numberOfLines={1}
          >
            {(product?.title || "").toUpperCase()}
          </Text>
        </View>

        <Text className="text-xs text-gray-500 font-poppins-semibold uppercase tracking-widest mb-1">
          {(product?.category || "").toUpperCase()}
        </Text>

        <Text
          className="text-[26px] text-primary mb-3 leading-tight"
          style={{
            fontFamily: "Poppins-Bold",
            fontWeight: Platform.OS === "android" ? "700" : "normal",
          }}
        >
          {product?.title}
        </Text>

        <Text className="text-gray-600 font-poppins-medium text-sm leading-6 mb-4">
          {product?.short_description || product?.description || ""}
        </Text>

        {/* Product Code | Weight Loss */}
        <View className="flex-row items-center justify-between mb-3">
          {product?.sku ? (
            <Text className="text-sm text-gray-600 font-poppins-medium">
              Product Code:{" "}
              <Text className="text-gray-900 font-poppins-semibold">{product.sku}</Text>
            </Text>
          ) : <View />}
          {product?.processingWeightLoss ? (
            <Text className="text-sm text-gray-600 font-poppins-medium">
              Weight Loss:{" "}
              <Text className="text-gray-900 font-poppins-semibold">
                {product.processingWeightLoss}
              </Text>
            </Text>
          ) : null}
        </View>

        {/* Star Rating */}
        <View className="flex-row items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={18}
              color={i < Math.round(ratingValue) ? "#F59E0B" : "#E5E7EB"}
              style={{ marginRight: 2 }}
            />
          ))}
          <Text className="text-green-600 font-poppins-medium text-sm ml-2">
            ({ratingCount} rating)
          </Text>
        </View>

        {/* Price headline */}
        <View className="flex-row items-baseline flex-wrap mb-5">
          {isPerKgMode ? (
            <>
              <Text
                className="text-[28px] text-primary"
                style={{
                  fontFamily: "Poppins-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
              >
                ₹{Number(selected.salePrice).toFixed(0)}
              </Text>
              <Text className="text-base text-gray-500 font-poppins-medium ml-1">
                /kg
              </Text>
              {selected.regularPrice > selected.salePrice && (
                <Text className="text-base text-gray-400 line-through font-poppins-medium ml-3">
                  ₹{Number(selected.regularPrice).toFixed(0)}/kg
                </Text>
              )}
              {perKgPricing && perKgPricing.cuttingCharge > 0 && (
                <Text className="text-xs text-amber-600 font-poppins-medium ml-2">
                  +₹{perKgPricing.cuttingCharge}/kg cutting
                </Text>
              )}
            </>
          ) : (
            <>
              <Text className="text-sm text-gray-600 font-poppins-medium mr-1">
                Price:
              </Text>
              <Text
                className="text-[28px] text-primary"
                style={{
                  fontFamily: "Poppins-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
              >
                Rs. {computedSalePrice.toFixed(2)}
              </Text>
              {computedRegularPrice > computedSalePrice && (
                <Text className="text-base text-gray-400 line-through font-poppins-medium ml-3">
                  Rs. {computedRegularPrice.toFixed(2)}
                </Text>
              )}
              {isWeightAdjustable && selectedWeightGrams > 0 && (
                <Text className="text-sm text-gray-500 font-poppins-medium ml-1">
                  {" "}/ {weightDisplay}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Dropdowns — only render if backend provides the options */}
        {hasCuttingTypes && (
          <Dropdown
            label="Cutting Type"
            value={selectedCutting}
            options={product.cuttingTypes}
            onSelect={setSelectedCutting}
          />
        )}
        {hasPieceSizes && (
          <Dropdown
            label="Piece Size"
            value={selectedPieceSize}
            options={product.pieceSizes}
            onSelect={setSelectedPieceSize}
          />
        )}
        {hasSizes && (
          <Dropdown
            label="Fish / Pack Size"
            value={selectedSize}
            options={normalizedPricing.map((e) => e.size)}
            onSelect={setSelectedSize}
          />
        )}

        {/* Processing weight loss info — only when backend provides it */}
        {product?.processingWeightLoss && (
          <View className="bg-primary/5 rounded-2xl px-4 py-3 mb-5 flex-row items-start">
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#6C3CE1"
              style={{ marginTop: 1 }}
            />
            <Text className="text-gray-700 font-poppins-medium ml-2 flex-1 text-sm leading-5">
              Processing weight loss:{" "}
              <Text className="text-gray-900 font-poppins-bold">
                {product.processingWeightLoss}
              </Text>
              . Varies based on cutting type selected.
            </Text>
          </View>
        )}

        {/* Weight stepper / size pill + Total Payable */}
        <View className="flex-row items-center justify-between pt-3">
          <View className="flex-row items-center">
            {isPerKgMode ? (
              <>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-1 py-1 bg-white">
                  <TouchableOpacity
                    onPress={() =>
                      setPerKgWeightGrams(
                        Math.max(PER_KG_MIN, perKgWeightGrams - PER_KG_STEP),
                      )
                    }
                    disabled={perKgWeightGrams <= PER_KG_MIN}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={perKgWeightGrams <= PER_KG_MIN ? "#9CA3AF" : "#1F2937"}
                    />
                  </TouchableOpacity>
                  <Text
                    className="mx-2 text-base text-gray-900 min-w-[64px] text-center"
                    style={{
                      fontFamily: "Poppins-Bold",
                      fontWeight: Platform.OS === "android" ? "700" : "normal",
                    }}
                  >
                    {weightDisplay}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setPerKgWeightGrams(perKgWeightGrams + PER_KG_STEP)}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Ionicons name="add" size={18} color="#1F2937" />
                  </TouchableOpacity>
                </View>
                {perKgPricing && (
                  <Text className="text-xs text-gray-500 font-poppins-medium ml-2">
                    {perKgPricing.cuttingCharge > 0 ? (
                      <>
                        ₹{selected.salePrice}/kg
                        <Text className="text-amber-600"> +₹{perKgPricing.cuttingCharge} cut</Text>
                        <Text className="text-gray-900 font-poppins-semibold"> = ₹{perKgPricing.ratePerKg.toFixed(0)}/kg</Text>
                      </>
                    ) : (
                      <Text className="text-gray-900 font-poppins-semibold">
                        ₹{perKgPricing.ratePerKg.toFixed(0)}/kg
                      </Text>
                    )}
                  </Text>
                )}
              </>
            ) : isWeightAdjustable ? (
              <View className="flex-row items-center border border-gray-200 rounded-xl px-1 py-1 bg-white">
                <TouchableOpacity
                  onPress={() =>
                    setSelectedWeightGrams(Math.max(50, selectedWeightGrams - 50))
                  }
                  className="w-8 h-8 items-center justify-center"
                >
                  <Ionicons name="remove" size={18} color="#1F2937" />
                </TouchableOpacity>
                <Text
                  className="mx-2 text-base text-gray-900 min-w-[64px] text-center"
                  style={{
                    fontFamily: "Poppins-Bold",
                    fontWeight: Platform.OS === "android" ? "700" : "normal",
                  }}
                >
                  {weightDisplay}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedWeightGrams(selectedWeightGrams + 50)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Ionicons name="add" size={18} color="#1F2937" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="rounded-full border border-gray-200 px-4 py-2 bg-white">
                <Text
                  className="text-sm text-gray-900"
                  style={{
                    fontFamily: "Poppins-SemiBold",
                    fontWeight: Platform.OS === "android" ? "600" : "normal",
                  }}
                >
                  {selected.size}
                </Text>
              </View>
            )}
          </View>

          <View className="items-end">
            <Text className="text-xs text-gray-500 font-poppins-medium">Total Payable</Text>
            <Text
              className="text-2xl text-gray-900"
              style={{
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              Rs. {totalPayable.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // ─── Related Products ─────────────────────────────────────────────────────
  const renderRelatedProducts = () => {
    if (!relatedLoading && (!relatedProducts || relatedProducts.length === 0)) {
      return null;
    }

    return (
      <View className="pt-6 pb-4">
        <Text className="text-xs font-poppins-semibold text-primary uppercase tracking-wider text-center mb-1">
          MORE FROM {product?.category || ""}
        </Text>
        <Text
          className="text-2xl text-foreground text-center mb-5 px-4"
          style={{ fontFamily: "Poppins-Bold", fontWeight: Platform.OS === "android" ? "700" : "normal" }}
        >
          You May Also Like
        </Text>

        {relatedLoading ? (
          <View className="items-center py-8">
            <Text className="text-muted-foreground font-poppins">Loading...</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {relatedProducts!.map((item: any) => {
              const itemPrice = item.sale_price || item.regular_price || 0;
              const originalPrice = item.regular_price || 0;
              const discountPct =
                item.sale_price && originalPrice
                  ? Math.round(((originalPrice - item.sale_price) / originalPrice) * 100)
                  : 0;
              const deliveryTime =
                item.deliveryTimeMinutes ||
                selectedLocation?.deliveryTimeMinutes ||
                45;
              const itemImage = item.images?.[0]?.url || item.images?.[0];

              return (
                <TouchableOpacity
                  key={item.id}
                  style={{ width: 180 }}
                  className="mr-4 bg-white rounded-2xl border border-border overflow-hidden"
                  onPress={() =>
                    router.push({ pathname: "/(routes)/product/[id]", params: { id: item.slug || item.id } })
                  }
                  activeOpacity={0.85}
                >
                  <View className="relative">
                    {itemImage ? (
                      <Image
                        source={{ uri: itemImage }}
                        style={{ width: 180, height: 160 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ width: 180, height: 160 }} className="bg-muted items-center justify-center">
                        <Ionicons name="fish-outline" size={40} color="#94A3B8" />
                      </View>
                    )}
                    {discountPct > 0 && (
                      <View className="absolute top-2 left-2 bg-offer-green px-2 py-0.5 rounded-full">
                        <Text className="text-white text-xs font-poppins-bold">{discountPct}% off</Text>
                      </View>
                    )}
                  </View>

                  <View className="p-3">
                    <Text className="font-poppins-semibold text-foreground text-sm mb-1" numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text className="text-muted-foreground font-poppins text-xs mb-1" numberOfLines={2}>
                      {item.short_description || item.description || ""}
                    </Text>
                    {(item.weight || item.serves) && (
                      <Text className="text-muted-foreground font-poppins text-xs mb-2">
                        {item.weight ? `${item.weight}` : ""}
                        {item.weight && item.serves ? " | " : ""}
                        {item.serves ? `Serves ${item.serves}` : ""}
                      </Text>
                    )}

                    <View className="flex-row items-center mb-2">
                      <Text className="text-base font-poppins-bold text-foreground">
                        ₹{itemPrice}
                      </Text>
                      {discountPct > 0 && (
                        <Text className="text-xs text-muted-foreground line-through ml-2">
                          ₹{originalPrice}
                        </Text>
                      )}
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={12} color="#F59E0B" />
                        <Text className="text-xs text-muted-foreground font-poppins ml-1">
                          {deliveryTime} mins
                        </Text>
                      </View>
                      <TouchableOpacity
                        className="bg-accent px-3 py-1.5 rounded-lg"
                        onPress={() => {
                          if (!user) { toast.error("Please login"); return; }
                          addToCart(
                            { id: item.id, slug: item.slug, title: item.title, price: itemPrice, image: itemImage || "", shopId: item.Shop?.id || "", quantity: 1 },
                            user, null, "Mobile App"
                          );
                          toast.success("Added!");
                        }}
                        activeOpacity={0.8}
                      >
                        <Text className="text-white font-poppins-semibold text-xs">Add +</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (productLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View className="w-16 h-16 bg-primary rounded-full items-center justify-center">
          <Ionicons name="fish-outline" size={32} color="white" />
        </View>
        <Text className="text-muted-foreground font-poppins-medium mt-4">
          Loading product details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-4">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-foreground font-poppins-bold text-xl mt-4">Product Not Found</Text>
        <TouchableOpacity className="mt-6 bg-primary px-6 py-3 rounded-xl" onPress={() => router.back()}>
          <Text className="text-white font-poppins-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => handleShare(product)}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2"
          >
            <Ionicons name="share-outline" size={18} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleWishlistToggle}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2"
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={18}
              color={isWishlisted ? "#EF4444" : "#1F2937"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/cart")}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="bag-handle-outline" size={18} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderProductInfo()}
        {renderRelatedProducts()}
        <View className="h-24" />
      </ScrollView>

      <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 py-4 rounded-2xl mr-3"
          style={{ backgroundColor: "#5EEAD4" }}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Text
            className="text-center text-white text-base"
            style={{
              fontFamily: "Poppins-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
          >
            Add to cart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-primary py-4 rounded-2xl"
          onPress={handleBuyNow}
          activeOpacity={0.85}
        >
          <Text
            className="text-center text-white text-base"
            style={{
              fontFamily: "Poppins-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
          >
            Buy Now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const handleShare = async (product: any) => {
  try {
    await Share.share({
      title: product.title,
      message: `🐟 ${product.title}\n\n💰 Price: Rs. ${product.sale_price || product.regular_price}\n\nFresh from Fish Studio!`,
    });
  } catch {}
};
