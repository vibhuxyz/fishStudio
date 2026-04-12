import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useGlobalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "@/utils/toast";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useGlobalSearchParams();
  const { user } = useUser();
  const { wishlist, addToWishlist, removeFromWishlist, addToCart } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedCuttingType, setSelectedCuttingType] = useState("Whole-Cleaned");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Cutting types for fish products
  const cuttingTypes = [
    "Whole-Cleaned",
    "Whole-UnCleaned",
    "Skinless & Boneless",
    "Curry Cut",
    "Steak Cut",
    "Fillet",
  ];

  // Weight loss percentage based on cutting type
  const weightLossMap: Record<string, string> = {
    "Whole-Cleaned": "15% - 20%",
    "Whole-UnCleaned": "5% - 10%",
    "Skinless & Boneless": "40% - 50%",
    "Curry Cut": "25% - 30%",
    "Steak Cut": "20% - 25%",
    "Fillet": "45% - 55%",
  };

  const currentWeightLoss = weightLossMap[selectedCuttingType] || "15% - 20%";

  // fetch the product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/product/api/get-product/${id}`
      );
      return response.data.product;
    },
  });

  // Fetch related products
  const { data: relatedProducts, isLoading: relatedLoading } = useQuery({
    queryKey: ["related-products", id],
    queryFn: async () => {
      try {
        // Build query string manually since URLSearchParams isn't available in React Native
        const queryParams = [
          "priceRange=0,1000", // Default price range
          "page=1",
          "limit=5",
        ].join("&");

        const response = await axiosInstance.get(
          `/product/api/get-filtered-products?${queryParams}`
        );
        return response.data.products || [];
      } catch (error) {
        console.error("Failed to fetch related products", error);
        return [];
      }
    },
    enabled: !!product,
  });

  // Fetch product reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["product-reviews", id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/product/api/get-product-reviews/${id}`
      );
      return response.data.reviews || [];
    },
    enabled: !!product,
  });

  // Check if product is in wishlist
  const isWishlisted = product
    ? wishlist.some((item) => item.id === product.id)
    : false;

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    if (!product) return;

    if (isWishlisted) {
      removeFromWishlist(product.id, user, null, "Mobile App");
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(
        {
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: product.sale_price || product.regular_price,
          image: product.images?.[0]?.url || "",
          shopId: product.Shop?.id || "",
        },
        user,
        null,
        "Mobile App"
      );
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    if (!product) return;

    addToCart(
      {
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: product.sale_price || product.regular_price,
        image: product.images?.[0]?.url || "",
        shopId: product.Shop?.id || "",
        quantity,
      },
      user,
      null,
      "Mobile App"
    );
    router.push("/(tabs)/cart");
  };

  // Handle buy now
  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login to purchase");
      return;
    }

    if (!product) return;

    // Add to cart first
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: product.sale_price || product.regular_price,
        image: product.images?.[0]?.url || "",
        shopId: product.Shop?.id || "",
        quantity,
      },
      user,
      null,
      "Mobile App"
    );

    // Navigate to cart
    router.push("/(tabs)/cart");
  };

  const renderImageGallery = () => {
    if (!product?.images || product.images.length === 0) {
      return (
        <View className="mb-6">
          <View className="relative">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center",
              }}
              style={{ width, height: width }}
              className="bg-muted"
              resizeMode="cover"
            />
          </View>
        </View>
      );
    }

    const discountPercentage = product.sale_price
      ? Math.round(
          ((product.regular_price - product.sale_price) /
            product.regular_price) *
            100
        )
      : 0;

    return (
      <View className="mb-6">
        {/* Main Image */}
        <View className="relative">
          <Image
            source={{ uri: product.images[selectedImageIndex]?.url || product.images[selectedImageIndex] }}
            style={{ width, height: width }}
            className="bg-muted"
            resizeMode="cover"
          />
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <View className="absolute top-4 left-4 bg-offer-green px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-poppins-bold">
                {discountPercentage}% OFF
              </Text>
            </View>
          )}
          {/* Navigation Arrows */}
          {product.images.length > 1 && (
            <>
              <TouchableOpacity
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                onPress={() =>
                  setSelectedImageIndex(
                    (prev) => (prev - 1 + product.images.length) % product.images.length
                  )
                }
              >
                <Ionicons name="chevron-back" size={20} color="#1E293B" />
              </TouchableOpacity>
              <TouchableOpacity
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                onPress={() =>
                  setSelectedImageIndex(
                    (prev) => (prev + 1) % product.images.length
                  )
                }
              >
                <Ionicons name="chevron-forward" size={20} color="#1E293B" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Thumbnails */}
        {product.images.length > 1 && (
          <View className="flex-row px-4 py-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {product.images.map((image: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  className={`mr-3 rounded-xl overflow-hidden ${
                    index === selectedImageIndex ? "border-2 border-primary" : "border border-border"
                  }`}
                >
                  <Image
                    source={{ uri: image.url || image }}
                    className="w-16 h-16"
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

  const renderProdcutInfo = () => {
    const discountPercentage = product?.sale_price
      ? Math.round(
          ((product.regular_price - product.sale_price) / product.regular_price) * 100
        )
      : 0;

    const currentPrice = product?.sale_price || product?.regular_price || 0;

    return (
      <View className="px-4 mb-6">
        {/* Breadcrumb */}
        <View className="flex-row items-center mb-3">
          <Text className="text-xs text-muted-foreground font-poppins-medium">
            HOME
          </Text>
          <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
          <Text className="text-xs text-muted-foreground font-poppins-medium">
            {product?.category || "SEA FISH"}
          </Text>
          <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
          <Text className="text-xs text-primary font-poppins-semibold">
            {product?.title?.split(" ")[0] || "PRODUCT"}
          </Text>
        </View>

        {/* Category Label */}
        <Text className="text-xs text-muted-foreground font-poppins-semibold uppercase tracking-wider mb-1">
          {product?.category || "POMFRET"}
        </Text>

        {/* Product Title */}
        <Text className="text-2xl font-poppins-bold text-primary mb-3">
          {product?.title || "Loading..."}
        </Text>

        {/* Description */}
        <Text className="text-muted-foreground font-poppins leading-6 mb-4">
          {product?.description || product?.short_description || "Fresh product"}
        </Text>

        {/* Product Code & Weight Loss */}
        <View className="flex-row justify-between mb-4">
          <View>
            <Text className="text-muted-foreground font-poppins text-sm">
              Product Code:{" "}
              <Text className="text-foreground font-poppins-semibold">
                {product?.sku || product?.id?.slice(0, 6).toUpperCase()}
              </Text>
            </Text>
          </View>
          <View>
            <Text className="text-muted-foreground font-poppins text-sm">
              Weight Loss:{" "}
              <Text className="text-foreground font-poppins-semibold">
                {currentWeightLoss} kg
              </Text>
            </Text>
          </View>
        </View>

        {/* Ratings */}
        <View className="flex-row items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={18}
              color={i < Math.floor(product?.rating || 4.5) ? "#FCD34D" : "#E5E7EB"}
            />
          ))}
          <Text className="text-muted-foreground font-poppins ml-2">
            ({product?.reviews?.length || 5} rating)
          </Text>
        </View>

        {/* Price */}
        <View className="flex-row items-center mb-6">
          <Text className="text-2xl font-poppins-bold text-primary mr-3">
            ₹{currentPrice}
          </Text>
          {product?.sale_price && product?.regular_price && (
            <Text className="text-lg text-muted-foreground line-through">
              ₹{product.regular_price}
            </Text>
          )}
        </View>

        {/* Cutting Type Selector */}
        <View className="mb-4">
          <Text className="text-base font-poppins-semibold text-foreground mb-3">
            Cutting Type
          </Text>
          <View className="relative">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {cuttingTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedCuttingType(type)}
                  className={`mr-3 px-4 py-3 rounded-xl border ${
                    selectedCuttingType === type
                      ? "bg-primary border-primary"
                      : "bg-white border-border"
                  }`}
                >
                  <Text
                    className={`font-poppins-medium ${
                      selectedCuttingType === type ? "text-white" : "text-foreground"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Weight Loss Info Box */}
        <View className="bg-muted rounded-xl p-4 mb-6 border border-border">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#64748B" className="mt-0.5" />
            <Text className="text-muted-foreground font-poppins ml-2 flex-1 leading-6">
              Processing weight loss:{" "}
              <Text className="text-foreground font-poppins-semibold">
                {currentWeightLoss} kg.
              </Text>{" "}
              Varies based on cutting type selected.
            </Text>
          </View>
        </View>

        {/* Quantity & Total */}
        <View className="flex-row items-center justify-between mb-6 pt-4 border-t border-border">
          {/* Quantity Selector */}
          <View className="flex-row items-center bg-white border border-border rounded-full px-4 py-3">
            <TouchableOpacity
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="remove" size={20} color="#64748B" />
            </TouchableOpacity>
            <Text className="mx-6 text-lg font-poppins-semibold text-foreground">
              {quantity} unit{quantity > 1 ? "s" : ""}
            </Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="add" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Total Payable */}
          <View className="items-end">
            <Text className="text-sm text-muted-foreground font-poppins mb-1">
              Total Payable
            </Text>
            <Text className="text-2xl font-poppins-bold text-foreground">
              ₹{(currentPrice * quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderVariantSelector = () => {
    if (!product) return null;

    return (
      <View className="px-4 mb-6">
        {/* Size Selector */}
        {product.sizes && product.sizes.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-poppins-medium text-gray-900 mb-3">
              Size
            </Text>
            <View className="flex-row flex-wrap">
              {product.sizes.map((size: string) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  className={`mr-3 mb-2 px-4 py-2 rounded-lg border ${
                    selectedSize === size
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selectedSize === size ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Color Selector */}
        {product.colors && product.colors.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-poppins-medium text-gray-900 mb-3">
              Color
            </Text>
            <View className="flex-row flex-wrap">
              {product.colors.map((color: string) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className={`mr-3 mb-2 w-12 h-12 rounded-full border-2 items-center justify-center ${
                    selectedColor === color
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                  style={{
                    backgroundColor: color.toLowerCase(),
                  }}
                >
                  {selectedColor === color && (
                    <View className="w-6 h-6 bg-white rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="#2563EB" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quantity Selector */}
        <View>
          <Text className="text-lg font-poppins-medium text-gray-900 mb-3">
            Quantity
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center"
            >
              <Ionicons name="remove" size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text className="mx-4 text-lg font-medium text-gray-900">
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center"
            >
              <Ionicons name="add" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View className="px-4 mb-6">
      {/* Tab Headers */}
      <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
        {["description", "specifications", "reviews"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === tab ? "bg-white" : ""
            }`}
          >
            <Text
              className={`text-center font-medium capitalize ${
                activeTab === tab ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === "description" && (
        <View>
          {product?.detailed_description ? (
            <RenderHtml
              contentWidth={width}
              source={{ html: product.detailed_description }}
            />
          ) : (
            <Text className="text-gray-700 leading-6">
              No description available
            </Text>
          )}
        </View>
      )}

      {activeTab === "specifications" && (
        <View>
          <View className="space-y-4">
            {/* Sizes */}
            {product?.sizes && product.sizes.length > 0 && (
              <View className="bg-gray-50 p-4 rounded-xl">
                <Text className="text-lg font-poppins-medium text-gray-900 mb-3">
                  Available Sizes
                </Text>
                <View className="flex-row flex-wrap">
                  {product.sizes.map((size: string) => (
                    <View
                      key={size}
                      className="bg-white px-3 py-2 rounded-lg mr-2 mb-2 border border-gray-200"
                    >
                      <Text className="text-gray-700 font-medium">{size}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Colors */}
            {product?.colors && product.colors.length > 0 && (
              <View className="bg-gray-50 p-4 rounded-xl">
                <Text className="text-lg font-poppins-medium text-gray-900 mb-3">
                  Available Colors
                </Text>
                <View className="flex-row flex-wrap">
                  {product.colors.map((color: string) => (
                    <View
                      key={color}
                      className="flex-row items-center mr-3 mb-2"
                    >
                      <View
                        className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                      <Text className="text-gray-700 font-medium capitalize">
                        {color}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Custom Specifications */}
            {product?.custom_specifications &&
              Object.keys(product.custom_specifications).length > 0 && (
                <View className="bg-gray-50 p-4 rounded-xl">
                  <Text className="text-lg font-poppins-medium text-gray-900 mb-3">
                    Product Specifications
                  </Text>
                  <View className="space-y-2">
                    {Object.entries(product.custom_specifications).map(
                      ([key, value]) => (
                        <View
                          key={key}
                          className="flex-row justify-between py-2 border-b border-gray-200"
                        >
                          <Text className="text-gray-600 font-medium capitalize">
                            {key.replace(/_/g, " ")}
                          </Text>
                          <Text className="text-gray-900 text-right flex-1 ml-4">
                            {value as string}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                </View>
              )}

            {/* Other dynamic specifications */}
            {product?.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <View className="bg-gray-50 p-4 rounded-xl">
                  <Text className="text-lg font-poppins-medium text-gray-900 mb-3">
                    Additional Details
                  </Text>
                  <View className="space-y-2">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <View
                          key={key}
                          className="flex-row justify-between py-2 border-b border-gray-200"
                        >
                          <Text className="text-gray-600 font-medium capitalize">
                            {key.replace(/_/g, " ")}
                          </Text>
                          <Text className="text-gray-900 text-right flex-1 ml-4">
                            {value as string}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                </View>
              )}

            {/* Show message if no specifications available */}
            {(!product?.sizes || product.sizes.length === 0) &&
              (!product?.colors || product.colors.length === 0) &&
              (!product?.custom_specifications ||
                Object.keys(product.custom_specifications).length === 0) &&
              (!product?.specifications ||
                Object.keys(product.specifications).length === 0) && (
                <View className="items-center py-8">
                  <Text className="text-gray-500">
                    No specifications available
                  </Text>
                </View>
              )}
          </View>
        </View>
      )}

      {activeTab === "reviews" && (
        <View>
          {reviewsLoading ? (
            <View className="items-center py-8">
              <Text className="text-gray-500">Loading reviews...</Text>
            </View>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review: any) => (
              <View key={review.id} className="mb-4 p-4 bg-gray-50 rounded-xl">
                <View className="flex-row items-center mb-2">
                  <Image
                    source={{
                      uri:
                        review.user?.avatar ||
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                    }}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {review.user?.name || "Anonymous"}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="flex-row mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name="star"
                            size={12}
                            color={i < review.rating ? "#FCD34D" : "#E5E7EB"}
                          />
                        ))}
                      </View>
                      <Text className="text-sm text-gray-500">
                        {review.createdAt}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-gray-700 mb-2">{review.comment}</Text>
                <TouchableOpacity className="flex-row items-center">
                  <Ionicons
                    name="thumbs-up-outline"
                    size={14}
                    color="#6B7280"
                  />
                  <Text className="text-sm text-gray-500 ml-1">
                    Helpful ({review.helpful || 0})
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View className="items-center py-8">
              <Text className="text-gray-500">No reviews yet</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderRelatedProducts = () => (
    <View className="px-4 mb-6">
      <Text className="text-xs font-poppins-semibold text-primary uppercase tracking-wider text-center mb-2">
        MORE FROM {product?.category || "SEA FISH"}
      </Text>
      <Text className="text-2xl font-poppins-bold text-foreground text-center mb-4">
        You May Also Like
      </Text>
      {relatedLoading ? (
        <View className="items-center py-8">
          <Text className="text-muted-foreground">Loading related products...</Text>
        </View>
      ) : relatedProducts && relatedProducts.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {relatedProducts.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              className="mr-4 w-48"
              onPress={() =>
                router.push({
                  pathname: "/(routes)/product/[id]",
                  params: {
                    id: item.slug || item.id,
                  },
                })
              }
            >
              <Image
                source={{
                  uri:
                    item.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center",
                }}
                className="w-full h-48 bg-muted rounded-2xl mb-2"
                resizeMode="cover"
              />
              <Text
                className="font-poppins-semibold text-foreground mb-1"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-poppins-bold text-primary">
                  ₹{item.sale_price}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={12} color="#FCD34D" />
                  <Text className="text-sm text-muted-foreground ml-1">
                    {item.ratings || 4.5}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View className="items-center py-8">
          <Text className="text-muted-foreground">No related products available</Text>
        </View>
      )}
    </View>
  );

  // Loading state
  if (productLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="flex-1 justify-center items-center">
          <View className="w-16 h-16 bg-primary rounded-full items-center justify-center">
            <Ionicons name="cube" size={32} color="white" />
          </View>
          <Text className="text-muted-foreground font-poppins-medium mt-4">
            Loading product details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-foreground font-poppins-bold text-xl mt-4">
            Product Not Found
          </Text>
          <Text className="text-muted-foreground text-center mt-2">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </Text>
          <TouchableOpacity
            className="mt-6 bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-white font-poppins-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentPrice = product?.sale_price || product?.regular_price || 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle={"dark-content"} backgroundColor={"#fff"} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-muted rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-lg font-poppins-medium text-foreground">
          Product Details
        </Text>
        <TouchableOpacity
          onPress={() => handleShare(product)}
          className="w-10 h-10 bg-muted rounded-full items-center justify-center"
        >
          <Ionicons name="share-outline" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderProdcutInfo()}
        {renderTabs()}
        {renderRelatedProducts()}
        <View className="h-20" />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="flex-row items-center px-4 py-4 bg-white border-t border-border">
        <TouchableOpacity
          className="flex-1 bg-accent py-4 rounded-xl mr-3"
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Text className="text-center text-white font-poppins-semibold text-lg">
            Add to cart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-primary py-4 rounded-xl"
          onPress={handleBuyNow}
          activeOpacity={0.8}
        >
          <Text className="text-center text-white font-poppins-semibold text-lg">
            Buy Now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Share functionality
const handleShare = async (product: any) => {
  try {
    const shareOptions = {
      title: `Check out this amazing product: ${product.title || product.name}`,
      message: `🛍️ ${product.title || product.name}\n\n💰 Price: $${
        product.sale_price || product.regular_price
      }${
        product.sale_price && product.regular_price
          ? ` (was $${product.regular_price})`
          : ""
      }\n⭐ Rating: ${product.rating || 4.5}/5 (${
        product.reviews?.length || 0
      } reviews)\n🏪 Shop: ${product.shop?.name || "Official Store"}\n\n${
        product.description || "Amazing product!"
      }\n\nGet it now! 🔥`,
      url: `https://yourapp.com/product/${product.id}`, // Replace with your actual app URL
    };

    const result = await Share.share(shareOptions);

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Shared via activity type
        console.log("Shared via:", result.activityType);
      } else {
        // Shared successfully
        console.log("Product shared successfully");
      }
    } else if (result.action === Share.dismissedAction) {
      // Share dialog was dismissed
      console.log("Share dialog dismissed");
    }
  } catch (error) {
    console.error("Share error:", error);
  }
};
