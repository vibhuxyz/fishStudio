import useUser from "@/hooks/useUser";
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

interface Props {
  product: any;
  visible: boolean;
  onClose: () => void;
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
      setSelectedSize(product.sizes?.[0] || "");
      setSelectedCutting(product.cuttingTypes?.[0] || "");
      setSelectedPieceSize(product.pieceSizes?.[0] || "");
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

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasCuttingTypes = product.cuttingTypes && product.cuttingTypes.length > 0;
  const hasPieceSizes = product.pieceSizes && product.pieceSizes.length > 0;
  const hasDiscount = resolvedPrice.regular > resolvedPrice.sale && resolvedPrice.regular > 0;

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
        style={{ maxHeight: SCREEN_HEIGHT * 0.85 }}
      >
        {/* Handle */}
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 bg-gray-300 rounded-full" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        >
          {/* Product info row */}
          <View className="flex-row gap-4 mb-5">
            <Image
              source={{
                uri:
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
              }}
              className="w-24 h-24 rounded-2xl bg-gray-100"
              resizeMode="cover"
            />
            <View className="flex-1 justify-center">
              <Text
                className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1"
              >
                {product.subCategory || product.category || ""}
              </Text>
              <Text
                className="text-base text-gray-900 leading-5 mb-2"
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
                  className="text-xl text-primary"
                  style={{
                    fontFamily: "Poppins-Bold",
                    fontWeight: Platform.OS === "android" ? "700" : "normal",
                  }}
                >
                  ₹{resolvedPrice.sale}
                </Text>
                {hasDiscount && (
                  <Text className="text-sm text-gray-400 line-through">
                    ₹{resolvedPrice.regular}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Out of stock warning */}
          {isOutOfStock && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-600 text-sm font-semibold text-center">
                This item is currently out of stock
              </Text>
            </View>
          )}

          {/* Cutting Type */}
          {hasCuttingTypes && (
            <View className="mb-4">
              <Text className="text-xs font-semibold text-gray-700 mb-2">
                Cutting Type
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {product.cuttingTypes.map((type: string) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setSelectedCutting(type)}
                      className={`px-4 py-2 rounded-full border ${
                        selectedCutting === type
                          ? "bg-primary border-primary"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selectedCutting === type ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Piece Size */}
          {hasPieceSizes && (
            <View className="mb-4">
              <Text className="text-xs font-semibold text-gray-700 mb-2">
                Piece Size
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {product.pieceSizes.map((size: string) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedPieceSize(size)}
                      className={`px-4 py-2 rounded-full border ${
                        selectedPieceSize === size
                          ? "bg-primary border-primary"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selectedPieceSize === size ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Fish/Pack Size */}
          {hasSizes && (
            <View className="mb-4">
              <Text className="text-xs font-semibold text-gray-700 mb-2">
                Fish / Pack Size
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {product.sizes.map((size: string) => {
                    const priceEntry = product.sizePricing?.[size];
                    const sizePrice = priceEntry?.salePrice ?? priceEntry?.price;
                    return (
                      <TouchableOpacity
                        key={size}
                        onPress={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-full border ${
                          selectedSize === size
                            ? "bg-primary border-primary"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            selectedSize === size ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {size}
                          {sizePrice ? ` — ₹${sizePrice}` : ""}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Qty stepper + Total */}
          <View className="flex-row items-center justify-between border-t border-gray-100 pt-4 mt-2">
            <View className="flex-row items-center border border-gray-200 rounded-full px-2 py-1">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="remove" size={18} color="#374151" />
              </TouchableOpacity>
              <Text className="min-w-[32px] text-center text-sm font-bold text-gray-900">
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
              <Text className="text-xs text-gray-500">Total Payable</Text>
              <Text
                className="text-xl text-gray-900"
                style={{
                  fontFamily: "Poppins-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
              >
                ₹{totalPayable.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View className="flex-row gap-3 mt-5">
            <TouchableOpacity
              className={`flex-1 h-12 rounded-2xl items-center justify-center ${
                isOutOfStock ? "bg-gray-200" : "bg-accent"
              }`}
              onPress={() => handleAddToCart(false)}
              disabled={isOutOfStock}
            >
              <Text
                className={`text-sm font-semibold ${
                  isOutOfStock ? "text-gray-400" : "text-accent-foreground"
                }`}
                style={{ fontFamily: "Poppins-SemiBold" }}
              >
                Add to Cart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 h-12 rounded-2xl items-center justify-center ${
                isOutOfStock ? "bg-gray-200" : "bg-primary"
              }`}
              onPress={() => handleAddToCart(true)}
              disabled={isOutOfStock}
            >
              <Text
                className={`text-sm font-semibold ${
                  isOutOfStock ? "text-gray-400" : "text-white"
                }`}
                style={{ fontFamily: "Poppins-SemiBold" }}
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
