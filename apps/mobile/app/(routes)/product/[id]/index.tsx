import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import { useAddressStore } from "@/lib/address-store";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useGlobalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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

// Fallback cutting types if product doesn't specify them
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

// Simple inline dropdown component
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
  const [selectedCuttingType, setSelectedCuttingType] = useState("");
  const [selectedPieceSize, setSelectedPieceSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { selectedLocation, locationVersion } = useAddressStore();
  const locationParams = selectedLocation?.storeId
    ? `storeId=${selectedLocation.storeId}&pincode=${selectedLocation.pincode}&city=${selectedLocation.city}`
    : selectedLocation?.pincode
    ? `pincode=${selectedLocation.pincode}&city=${selectedLocation.city}`
    : "";

  // Fetch product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["product", id, locationParams, locationVersion],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/product/api/get-product/${id}${locationParams ? `?${locationParams}` : ""}`
      );
      return response.data.product;
    },
  });

  // Set default cutting type & piece size when product loads
  useEffect(() => {
    if (product) {
      const cuttingOpts: string[] =
        product.cuttingOptions ||
        product.cutting_options ||
        DEFAULT_CUTTING_TYPES;
      if (cuttingOpts.length > 0 && !selectedCuttingType) {
        setSelectedCuttingType(cuttingOpts[0]);
      }
      const sizeOpts: string[] = product.pieceSizes || product.piece_sizes || [];
      if (sizeOpts.length > 0 && !selectedPieceSize) {
        setSelectedPieceSize(sizeOpts[0]);
      }
    }
  }, [product]);

  // Related products — use get-all-products with category filter (avoids 404)
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
      // Exclude the current product
      return (res.data.products || []).filter((p: any) => p.id !== product.id);
    },
    enabled: !!product?.category,
  });

  const cuttingOptions: string[] =
    product?.cuttingOptions || product?.cutting_options || DEFAULT_CUTTING_TYPES;
  const pieceSizes: string[] = product?.pieceSizes || product?.piece_sizes || [];
  const weightLoss =
    product?.weightLoss ||
    WEIGHT_LOSS_MAP[selectedCuttingType] ||
    "5% - 10%";

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

  const handleAddToCart = () => {
    if (!user) { toast.error("Please login to add items to cart"); return; }
    if (!product) return;
    addToCart(
      {
        id: product.id, slug: product.slug, title: product.title,
        price: product.sale_price || product.regular_price,
        image: product.images?.[0]?.url || "", shopId: product.Shop?.id || "",
        quantity, cuttingType: selectedCuttingType || undefined,
        pieceSize: selectedPieceSize || undefined,
      },
      user, null, "Mobile App"
    );
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!user) { toast.error("Please login to purchase"); return; }
    if (!product) return;
    addToCart(
      {
        id: product.id, slug: product.slug, title: product.title,
        price: product.sale_price || product.regular_price,
        image: product.images?.[0]?.url || "", shopId: product.Shop?.id || "",
        quantity, cuttingType: selectedCuttingType || undefined,
        pieceSize: selectedPieceSize || undefined,
      },
      user, null, "Mobile App"
    );
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
        {/* Main image */}
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
          {/* Prev / Next */}
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

        {/* Thumbnails */}
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
    const currentPrice = product?.sale_price || product?.regular_price || 0;
    const ratingCount = product?.reviews?.length || product?.ratingCount || 5;
    const ratingValue = product?.rating || 5;
    // Web shows price per-kg; mobile mirrors that when we have weight info.
    const weightGrams = product?.sizePricing?.find?.(
      (s: any) => s.size === selectedPieceSize,
    )?.weightGrams;
    const totalGrams = weightGrams ? weightGrams * quantity : null;

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
            {(product?.subCategory || product?.category || "FRESH WATER").toUpperCase()}
          </Text>
          <Ionicons name="chevron-forward" size={11} color="#9CA3AF" style={{ marginHorizontal: 4 }} />
          <Text
            className="text-[11px] text-primary font-poppins-bold tracking-wider flex-1"
            numberOfLines={1}
          >
            {(product?.title || "").toUpperCase()}
          </Text>
        </View>

        {/* Category label */}
        <Text className="text-xs text-gray-500 font-poppins-semibold uppercase tracking-widest mb-1">
          {(product?.category || "").toUpperCase()}
        </Text>

        {/* Title — purple/primary */}
        <Text
          className="text-[26px] text-primary mb-3 leading-tight"
          style={{
            fontFamily: "Poppins-Bold",
            fontWeight: Platform.OS === "android" ? "700" : "normal",
          }}
        >
          {product?.title}
        </Text>

        {/* Description */}
        <Text className="text-gray-600 font-poppins-medium text-sm leading-6 mb-4">
          {product?.description || product?.short_description || ""}
        </Text>

        {/* Product Code | Weight Loss — split left/right */}
        <View className="flex-row items-center justify-between mb-3">
          {product?.sku ? (
            <Text className="text-sm text-gray-600 font-poppins-medium">
              Product Code:{" "}
              <Text className="text-gray-900 font-poppins-semibold">{product.sku}</Text>
            </Text>
          ) : <View />}
          {weightLoss ? (
            <Text className="text-sm text-gray-600 font-poppins-medium">
              Weight Loss:{" "}
              <Text className="text-gray-900 font-poppins-semibold">{weightLoss} kg</Text>
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

        {/* Price — /kg format */}
        <View className="flex-row items-baseline mb-5">
          <Text
            className="text-[28px] text-primary"
            style={{
              fontFamily: "Poppins-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
          >
            ₹{Number(currentPrice).toFixed(0)}
          </Text>
          <Text className="text-base text-gray-500 font-poppins-medium ml-1">/kg</Text>
          {product?.sale_price &&
            product?.regular_price &&
            product.regular_price > product.sale_price && (
              <Text className="text-base text-gray-400 line-through font-poppins-medium ml-3">
                ₹{Number(product.regular_price).toFixed(0)}/kg
              </Text>
            )}
        </View>

        {/* Dropdowns */}
        <Dropdown
          label="Cutting Type"
          value={selectedCuttingType}
          options={cuttingOptions}
          onSelect={setSelectedCuttingType}
        />
        {pieceSizes.length > 0 && (
          <Dropdown
            label="Piece Size"
            value={selectedPieceSize}
            options={pieceSizes}
            onSelect={setSelectedPieceSize}
          />
        )}

        {/* Weight loss info — purple-tinted info banner */}
        <View className="bg-primary/5 rounded-2xl px-4 py-3 mb-5 flex-row items-start">
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#6C3CE1"
            style={{ marginTop: 1 }}
          />
          <Text className="text-gray-700 font-poppins-medium ml-2 flex-1 text-sm leading-5">
            Processing weight loss:{" "}
            <Text className="text-gray-900 font-poppins-bold">{weightLoss} kg</Text>. Varies
            based on cutting type selected.
          </Text>
        </View>

        {/* Quantity & Total */}
        <View className="flex-row items-center justify-between pt-3">
          <View className="flex-row items-center">
            <View className="flex-row items-center border border-gray-200 rounded-xl px-1 py-1 bg-white">
              <TouchableOpacity
                onPress={() => quantity > 1 && setQuantity((q) => q - 1)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="remove" size={18} color="#1F2937" />
              </TouchableOpacity>
              <Text
                className="mx-2 text-base text-gray-900"
                style={{
                  fontFamily: "Poppins-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
              >
                {totalGrams
                  ? totalGrams >= 1000
                    ? `${(totalGrams / 1000).toFixed(totalGrams % 1000 === 0 ? 0 : 2)} kg`
                    : `${totalGrams} gm`
                  : `${quantity} unit${quantity > 1 ? "s" : ""}`}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="add" size={18} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-500 font-poppins-medium ml-2">
              ₹{Number(currentPrice).toFixed(0)}/kg
            </Text>
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
              Rs.{" "}
              {totalGrams
                ? ((Number(currentPrice) * totalGrams) / 1000).toFixed(2)
                : (Number(currentPrice) * quantity).toFixed(2)}
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
          MORE FROM {product?.category || "FRESH WATER"}
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
                  {/* Image */}
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

                  {/* Info */}
                  <View className="p-3">
                    <Text className="font-poppins-semibold text-foreground text-sm mb-1" numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text className="text-muted-foreground font-poppins text-xs mb-1" numberOfLines={2}>
                      {item.description || item.short_description || ""}
                    </Text>
                    {(item.weight || item.serves) && (
                      <Text className="text-muted-foreground font-poppins text-xs mb-2">
                        {item.weight ? `${item.weight}` : ""}
                        {item.weight && item.serves ? " | " : ""}
                        {item.serves ? `Serves ${item.serves}` : ""}
                      </Text>
                    )}

                    {/* Price row */}
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

                    {/* Delivery time + Add button */}
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

      {/* Slim header with back + title + share + cart */}
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

      {/* Bottom bar — mint "Add to cart" + purple "Buy Now" like web */}
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
