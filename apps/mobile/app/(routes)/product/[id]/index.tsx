import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import { useBottomBarStore } from "@/store/bottom-bar-store";
import { useAddressStore } from "@/lib/address-store";
import { trackProductView } from "@/actions/activity";
import axiosInstance from "@/utils/axiosInstance";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { computePerKgSalePrice, resolvePerKgPricing, resolveProductSizePricing } from "@/utils/pricing";
import { ProductBadges } from "@/components/home/badge";
import AddToCartModal from "@/components/home/add-to-cart-modal";
import FloatingCartBar from "@/components/shared/floating-cart-bar";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useGlobalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
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

// Pill-style single-select row — replaces the bottom-sheet Dropdown for
// on-screen choices like cleaning type / weight (matches the product mock).
function PillSelector({
  label,
  value,
  options,
  onSelect,
  renderCaption,
  learnMore,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  renderCaption?: (option: string) => string | undefined;
  learnMore?: boolean;
}) {
  if (!options || options.length === 0) return null;
  return (
    <View className="mb-5">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-poppins-semibold text-foreground">
          {label}
        </Text>
        {learnMore && (
          <View className="flex-row items-center">
            <Text className="text-xs text-primary font-poppins-medium mr-1">
              Learn more
            </Text>
            <Ionicons name="information-circle-outline" size={14} color="#5A2C96" />
          </View>
        )}
      </View>
      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        {options.map((opt) => {
          const active = opt === value;
          const caption = renderCaption?.(opt);
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onSelect(opt)}
              activeOpacity={0.8}
              style={{
                minWidth: 78,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 14,
                borderWidth: active ? 1.5 : 1,
                borderColor: active ? "#5A2C96" : "#E5E7EB",
                backgroundColor: active ? "#F3EEFB" : "#FFFFFF",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: active ? "Inter-Bold" : "Inter-SemiBold",
                  fontSize: 13,
                  color: active ? "#5A2C96" : "#1A1C1C",
                }}
              >
                {opt}
              </Text>
              {caption ? (
                <Text
                  style={{
                    fontFamily: "Inter-Regular",
                    fontSize: 11,
                    color: active ? "#5A2C96" : "#898B8A",
                    marginTop: 1,
                  }}
                >
                  {caption}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const PER_KG_STEP = 50;
const PER_KG_MIN = 50;
const PER_KG_DEFAULT = 250;

export default function ProductDetailScreen() {
  const { id } = useGlobalSearchParams();
  const { user } = useUser();
  const { wishlist, addToWishlist, removeFromWishlist, addToCart } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const imageScrollRef = useRef<ScrollView>(null);
  // Collapses the nutrition stats + cooking tips under "Read more" so the
  // Product Information block doesn't dump everything on screen at once.
  const [showFullInfo, setShowFullInfo] = useState(false);

  const { selectedLocation, locationVersion, getSelectedAddress } = useAddressStore();
  const selectedAddress = getSelectedAddress();
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

  // Record the view for recently-viewed + recommendations (fire-and-forget).
  useEffect(() => {
    if (product?.id) trackProductView(product.id);
  }, [product?.id]);

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
    setRemovedBundleIds(new Set());
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
    return resolvePerKgPricing(
      basePricePerKg,
      product?.cuttingTypePricing,
      product?.pieceSizePricing,
      selectedCutting,
      selectedPieceSize,
    );
  }, [isPerKgMode, basePricePerKg, selectedCutting, selectedPieceSize, product]);

  const computedSalePrice = useMemo(() => {
    if (isPerKgMode && basePricePerKg && perKgPricing) {
      return computePerKgSalePrice(perKgPricing, perKgWeightGrams);
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

  // Related products — get-product already computes up to 4 of these
  // server-side (storefront.controller.ts), so reuse that instead of firing
  // a second get-all-products round trip for the same category.
  const relatedProducts = useMemo(
    () => (product?.relatedProducts ?? []).filter((p: any) => p.id !== product?.id),
    [product],
  );
  const relatedLoading = productLoading;

  // "Add all to cart" / "You May Also Like" both add OTHER products, which
  // may have their own cutting type / piece size / weight variants — those
  // need the same picker the main product's own "Add to Cart" button uses,
  // not a direct add with hardcoded defaults. Queue lets "Add all" walk the
  // bundle one variant-picker at a time instead of only prompting for one.
  const [quickAddProduct, setQuickAddProduct] = useState<any | null>(null);
  const [bundleQueue, setBundleQueue] = useState<any[]>([]);

  // Lets the shopper drop items out of "Frequently Bought Together" before
  // adding the rest — ids here are excluded from the bundle total and cart add.
  const [removedBundleIds, setRemovedBundleIds] = useState<Set<string>>(new Set());

  const handleQuickAddClose = () => {
    if (bundleQueue.length > 0) {
      const [next, ...rest] = bundleQueue;
      setBundleQueue(rest);
      setQuickAddProduct(next);
    } else {
      setQuickAddProduct(null);
    }
  };

  // Tells FloatingCartBar how tall this page's own bottom bar is, so it can
  // sit above it instead of overlapping the price/Add to Cart bar. Reset on
  // unmount so leaving this screen doesn't leave other screens offset.
  const setBottomBarHeight = useBottomBarStore((s) => s.setHeight);
  useEffect(() => {
    return () => setBottomBarHeight(0);
  }, [setBottomBarHeight]);

  // Average rating still feeds the star badge in the product summary below —
  // the Reviews list/write-a-review UI itself was removed.
  const { data: reviewsData } = useQuery({
    queryKey: ["product-reviews", product?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/product/api/get-product-reviews/${product.id}`,
        { params: { limit: 5 } },
      );
      return res.data as {
        reviews: any[];
        totalReviews: number;
        averageRating: number | null;
      };
    },
    enabled: !!product?.id,
  });

  const isWishlisted = product ? wishlist.some((i) => i.id === product.id) : false;

  const handleWishlistToggle = () => {
    if (!user) { toast.error("Please login to add items to wishlist"); return; }
    if (!product) return;
    if (isWishlisted) {
      removeFromWishlist(product.id, user, selectedAddress, "Mobile App");
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(
        { id: product.id, slug: product.slug, title: product.title, price: product.sale_price || product.regular_price, image: product.images?.[0]?.url || "", shopId: product.Shop?.id || "" },
        user, selectedAddress, "Mobile App"
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
        regularPrice: computedRegularPrice > computedSalePrice ? computedRegularPrice : undefined,
        badges: product.badges,
        image: product.images?.[0]?.url || "",
        shopId: product.Shop?.id || "",
        quantity: 1,
        cuttingType: selectedCutting || undefined,
        pieceSize: selectedPieceSize || undefined,
        selectedSize: selectedSize || undefined,
        priceBreakdown: buildBreakdown(),
      },
      user, selectedAddress, "Mobile App"
    );
  };

  const handleAddToCart = () => {
    if (!user) { toast.error("Please login to add items to cart"); return; }
    if (!product) return;
    addCurrentToCart();
    toast.success("Added to cart!");
  };

  // ─── Image Gallery ────────────────────────────────────────────────────────
  const renderImageGallery = () => {
    const images = product?.images || [];
    const discountPct = product?.sale_price
      ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
      : 0;

    // Snaps selectedImageIndex to whichever page the user's swipe actually
    // landed on, so the counter badge and chevrons stay in sync with a
    // finger-driven scroll, not just the button taps.
    const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setSelectedImageIndex(index);
    };

    const goToImage = (index: number) => {
      setSelectedImageIndex(index);
      imageScrollRef.current?.scrollTo({ x: index * width, animated: true });
    };

    return (
      <View className="mb-4">
        <View className="relative">
          <ScrollView
            ref={imageScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
          >
            {(images.length > 0 ? images : [null]).map((img: { url?: string } | string | null, i: number) => {
              const uri = img ? (typeof img === "string" ? img : img.url) : null;
              return (
                <Image
                  key={i}
                  source={
                    uri
                      ? { uri: cloudinaryThumbnail(uri, 800) }
                      : require("@/assets/images/icon.png")
                  }
                  style={{ width, height: width * 0.85 }}
                  resizeMode="cover"
                />
              );
            })}
          </ScrollView>
          {/* Freshness / handling badges — computed by the storefront API from tags */}
          <ProductBadges badges={product?.badges} max={3} />

          {discountPct > 0 && (
            <View className="absolute top-4 right-4 bg-offer-green px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-poppins-bold">{discountPct}% OFF</Text>
            </View>
          )}

          {images.length > 1 && (
            <View
              className="absolute bg-black/60 px-2.5 py-1 rounded-full"
              style={{ bottom: 12, right: 12 }}
            >
              <Text className="text-white text-xs font-poppins-semibold">
                {selectedImageIndex + 1}/{images.length}
              </Text>
            </View>
          )}

          {images.length > 1 && (
            <>
              <TouchableOpacity
                className="absolute left-3 bg-white/90 rounded-full w-9 h-9 items-center justify-center shadow"
                style={{ top: width * 0.85 / 2 - 18 }}
                onPress={() => goToImage((selectedImageIndex - 1 + images.length) % images.length)}
              >
                <Ionicons name="chevron-back" size={18} color="#1E293B" />
              </TouchableOpacity>
              <TouchableOpacity
                className="absolute right-3 bg-white/90 rounded-full w-9 h-9 items-center justify-center shadow"
                style={{ top: width * 0.85 / 2 - 18 }}
                onPress={() => goToImage((selectedImageIndex + 1) % images.length)}
              >
                <Ionicons name="chevron-forward" size={18} color="#1E293B" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  // ─── Product Info ─────────────────────────────────────────────────────────
  const renderProductInfo = () => {
    const ratingCount = reviewsData?.totalReviews ?? 0;
    const ratingValue = reviewsData?.averageRating ?? product?.rating ?? product?.ratings ?? 5;
    const hasCuttingTypes = (product?.cuttingTypes?.length ?? 0) > 0;
    const hasPieceSizes = (product?.pieceSizes?.length ?? 0) > 0;
    const hasSizes = (product?.sizes?.length ?? 0) > 0;
    const ordersLabel =
      product?.totalSold >= 1000
        ? `${(product.totalSold / 1000).toFixed(product.totalSold >= 10000 ? 0 : 1)}K+ orders`
        : product?.totalSold > 0
          ? `${product.totalSold}+ orders`
          : null;

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
            fontFamily: "Inter-Bold",
            fontWeight: Platform.OS === "android" ? "700" : "normal",
          }}
        >
          {product?.title}
        </Text>

        {/* Source • Origin */}
        {(product?.source || product?.origin) && (
          <Text className="text-gray-500 font-poppins-medium text-sm mb-2">
            {[product?.source, product?.origin].filter(Boolean).join(" • ")}
          </Text>
        )}

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
          <Text className="text-gray-900 font-poppins-bold text-sm mr-1">
            {Number(ratingValue).toFixed(1)}
          </Text>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={16}
              color={i < Math.round(ratingValue) ? "#F59E0B" : "#E5E7EB"}
              style={{ marginRight: 1 }}
            />
          ))}
          {ratingCount > 0 && (
            <Text className="text-gray-500 font-poppins-medium text-sm ml-2">
              ({ratingCount})
            </Text>
          )}
          {ordersLabel && (
            <Text className="text-gray-500 font-poppins-medium text-sm ml-2">
              • {ordersLabel}
            </Text>
          )}
        </View>

        {/* Price headline */}
        <View className="flex-row items-baseline flex-wrap mb-1">
          {isPerKgMode ? (
            <>
              <Text
                className="text-[28px] text-primary"
                style={{
                  fontFamily: "Inter-Bold",
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
                  fontFamily: "Inter-Bold",
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
        <Text className="text-xs text-gray-400 font-poppins-medium mb-4">
          Inclusive of all taxes
        </Text>

        {/* Temperature-controlled delivery strip */}
        <View
          className="flex-row items-center bg-primary/5 rounded-2xl px-4 py-3 mb-5"
        >
          <Ionicons name="thermometer-outline" size={18} color="#5A2C96" />
          <Text className="text-gray-700 font-poppins-medium text-xs ml-2 flex-1">
            Temperature controlled delivery • 0-4°C fresh chain
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#5A2C96" />
        </View>

        {/* Cleaning type / piece size / weight — pill selectors */}
        {hasCuttingTypes && (
          <PillSelector
            label="Select Cleaning Type"
            value={selectedCutting}
            options={product.cuttingTypes}
            onSelect={setSelectedCutting}
            learnMore
          />
        )}
        {hasPieceSizes && (
          <PillSelector
            label="Select Piece Size"
            value={selectedPieceSize}
            options={product.pieceSizes}
            onSelect={setSelectedPieceSize}
          />
        )}
        {hasSizes && (
          <PillSelector
            label="Select Weight"
            value={selectedSize}
            options={normalizedPricing.map((e) => e.size)}
            onSelect={setSelectedSize}
            renderCaption={(opt) => {
              const entry = normalizedPricing.find((e) => e.size === opt);
              return entry ? `₹${Number(entry.salePrice).toFixed(0)}` : undefined;
            }}
          />
        )}

        {/* Processing weight loss info — only when backend provides it */}
        {product?.processingWeightLoss && (
          <View className="bg-primary/5 rounded-2xl px-4 py-3 mb-5 flex-row items-start">
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#5A2C96"
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
        <Text className="text-base font-poppins-semibold text-foreground mb-2 pt-1">
          Quantity
        </Text>
        <View className="flex-row items-center justify-between">
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
                      fontFamily: "Inter-Bold",
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
                    fontFamily: "Inter-Bold",
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
                    fontFamily: "Inter-SemiBold",
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
                fontFamily: "Inter-Bold",
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

  // ─── Product Information / What makes it great / Cooking tips ─────────────
  const renderProductInformation = () => {
    const infoRows = [
      { label: "Type", value: product?.subCategory },
      { label: "Source", value: product?.source },
      { label: "Origin", value: product?.origin },
      { label: "Shelf Life", value: product?.shelfLife },
      { label: "Storage", value: product?.storageInstructions },
    ].filter((row) => row.value);

    const nutrition = [
      { icon: "barbell-outline" as const, label: "Protein", value: product?.nutritionProtein },
      { icon: "water-outline" as const, label: "Omega 3", value: product?.nutritionOmega3 },
      { icon: "flame-outline" as const, label: "Calories", value: product?.nutritionCalories },
    ].filter((n) => n.value);

    const highlight = product?.highlightDescription || product?.short_description;
    const hasCookingTips = Array.isArray(product?.cookingTips) && product.cookingTips.length > 0;
    const hasMoreToShow = nutrition.length > 0 || hasCookingTips;

    if (infoRows.length === 0 && !highlight && !hasCookingTips) return null;

    return (
      <View className="px-4 py-5 border-t border-gray-100">
        <View className="flex-row" style={{ gap: 16 }}>
          {infoRows.length > 0 && (
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-poppins-bold text-foreground mb-2">
                Product Information
              </Text>
              {infoRows.map((row) => (
                <View key={row.label} className="flex-row justify-between mb-1.5">
                  <Text className="text-gray-500 font-poppins text-xs">{row.label}</Text>
                  <Text
                    className="text-gray-900 font-poppins-medium text-xs text-right ml-2 flex-1"
                    numberOfLines={2}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {(highlight || nutrition.length > 0) && (
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-poppins-bold text-foreground mb-2">
                What makes it great?
              </Text>
              {highlight && (
                <Text
                  className="text-gray-600 font-poppins text-xs leading-5 mb-3"
                  numberOfLines={showFullInfo ? undefined : 2}
                >
                  {highlight}
                </Text>
              )}
              {showFullInfo && nutrition.length > 0 && (
                <View className="flex-row" style={{ gap: 10 }}>
                  {nutrition.map((n) => (
                    <View key={n.label} style={{ alignItems: "center" }}>
                      <Ionicons name={n.icon} size={16} color="#5A2C96" />
                      <Text className="text-gray-900 font-poppins-bold text-[11px] mt-1">
                        {n.value}
                      </Text>
                      <Text className="text-gray-400 font-poppins text-[9px]">{n.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {showFullInfo && hasCookingTips && (
          <View className="mt-4">
            <Text className="text-sm font-poppins-bold text-foreground mb-2">
              Cooking Tips
            </Text>
            {product.cookingTips.map((tip: string, i: number) => (
              <View key={i} className="flex-row items-start mb-1.5">
                <Text className="text-primary font-poppins-bold text-xs mr-2">•</Text>
                <Text className="text-gray-600 font-poppins text-xs leading-5 flex-1">
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        )}

        {hasMoreToShow && (
          <TouchableOpacity
            onPress={() => setShowFullInfo((v) => !v)}
            className="flex-row items-center mt-3"
            activeOpacity={0.7}
          >
            <Text className="text-primary font-poppins-semibold text-xs mr-1">
              {showFullInfo ? "Show less" : "Read more"}
            </Text>
            <Ionicons
              name={showFullInfo ? "chevron-up" : "chevron-down"}
              size={14}
              color="#5A2C96"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ─── Frequently Bought Together ────────────────────────────────────────────
  const renderFrequentlyBoughtTogether = () => {
    const bundleItems = (relatedProducts ?? []).slice(0, 2);
    if (!product || bundleItems.length === 0) return null;

    const allItems = [product, ...bundleItems];
    const selectedItems = allItems.filter((item) => !removedBundleIds.has(item.id));

    const bundleTotal = selectedItems.reduce(
      (sum: number, item: any) => sum + (item.sale_price || item.regular_price || 0),
      0,
    );

    return (
      <View className="px-4 py-5 border-t border-gray-100">
        <Text className="text-base font-poppins-bold text-foreground mb-4">
          Frequently Bought Together
        </Text>
        <View className="flex-row items-center flex-wrap">
          {allItems.map((item, index) => {
            const itemImage = item.images?.[0]?.url || item.images?.[0];
            const isRemoved = removedBundleIds.has(item.id);
            return (
            <React.Fragment key={item.id}>
              <View style={{ alignItems: "center", width: 72 }}>
                <View style={{ width: 60, height: 60 }}>
                  <View
                    className="rounded-xl overflow-hidden border border-gray-200 bg-muted items-center justify-center"
                    style={{ width: 60, height: 60, opacity: isRemoved ? 0.4 : 1 }}
                  >
                    {itemImage ? (
                      <Image
                        source={{ uri: cloudinaryThumbnail(itemImage, 120) }}
                        style={{ width: 60, height: 60 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="fish-outline" size={22} color="#94A3B8" />
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setRemovedBundleIds((prev) => {
                        const next = new Set(prev);
                        if (isRemoved) {
                          next.delete(item.id);
                        } else {
                          next.add(item.id);
                        }
                        return next;
                      })
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ position: "absolute", top: -6, right: -6 }}
                  >
                    <Ionicons
                      name={isRemoved ? "add-circle" : "close-circle"}
                      size={18}
                      color={isRemoved ? "#22C55E" : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                </View>
                <Text className={`font-poppins-bold text-[11px] mt-1 ${isRemoved ? "text-gray-400" : "text-gray-900"}`}>
                  ₹{item.sale_price || item.regular_price}
                </Text>
              </View>
              {index < allItems.length - 1 && (
                <Ionicons name="add" size={16} color="#9CA3AF" style={{ marginHorizontal: 4 }} />
              )}
            </React.Fragment>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between mt-4 bg-primary/5 rounded-2xl px-4 py-3">
          <Text className="text-gray-700 font-poppins-medium text-sm">
            Total: <Text className="text-gray-900 font-poppins-bold">₹{bundleTotal.toFixed(0)}</Text>
          </Text>
          <TouchableOpacity
            disabled={selectedItems.length === 0}
            onPress={() => {
              if (!user) { toast.error("Please login to add items to cart"); return; }
              // The current product already has its own variant selector on
              // this page, so addCurrentToCart() covers it directly. The
              // other bundle items don't — queue them through the same
              // picker modal the rest of the app uses for "Add".
              const selectedBundleItems = bundleItems.filter((item: any) => !removedBundleIds.has(item.id));
              if (!removedBundleIds.has(product.id)) {
                addCurrentToCart();
              }
              const [first, ...rest] = selectedBundleItems;
              if (first) {
                setBundleQueue(rest);
                setQuickAddProduct(first);
              }
            }}
            className={`rounded-xl px-4 py-2.5 ${selectedItems.length === 0 ? "bg-gray-300" : "bg-primary"}`}
            activeOpacity={0.85}
          >
            <Text className="text-white font-poppins-semibold text-xs">
              Add all {selectedItems.length} to cart
            </Text>
          </TouchableOpacity>
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
          style={{ fontFamily: "Inter-Bold", fontWeight: Platform.OS === "android" ? "700" : "normal" }}
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
                        source={{ uri: cloudinaryThumbnail(itemImage, 360) }}
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
                          setQuickAddProduct(item);
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
        {renderFrequentlyBoughtTogether()}
        {renderProductInformation()}
        {renderRelatedProducts()}
        <View className="h-24" />
      </ScrollView>

      {/* Bottom fixed bar — price + single Add to Cart action */}
      <View
        className="flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-100"
        onLayout={(e) => setBottomBarHeight(e.nativeEvent.layout.height)}
      >
        <View>
          <Text
            className="text-primary text-xl"
            style={{
              fontFamily: "Inter-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
          >
            Rs. {totalPayable.toFixed(2)}
          </Text>
          <Text className="text-gray-500 font-poppins-medium text-xs">
            {weightDisplay}
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center bg-primary rounded-2xl px-8 py-4"
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Ionicons name="cart-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text
            className="text-center text-white text-base"
            style={{
              fontFamily: "Inter-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
          >
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>

      <AddToCartModal
        product={quickAddProduct}
        visible={!!quickAddProduct}
        onClose={handleQuickAddClose}
      />
      <FloatingCartBar />
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
