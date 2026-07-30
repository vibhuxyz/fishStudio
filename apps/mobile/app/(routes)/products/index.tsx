import ProductCard from "@/components/cards/product.card";
import ProductSkeleton from "@/components/skelton/product.skelton";
import { useAddressStore } from "@/lib/address-store";
import type { Product } from "@/types/product";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  GestureResponderEvent,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_PRICE = 5000;

interface FilterState {
  priceRange: [number, number];
  category: string | null;
}

export default function ProductsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, MAX_PRICE],
    category: null,
  });
  const { getSelectedAddress, selectedLocation } = useAddressStore();
  const selectedAddress = getSelectedAddress();

  const itemsPerPage = 20;

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: categoriesData } = useQuery({
    queryKey: ["storefront-categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data as { categories: string[] };
    },
    staleTime: 1000 * 60 * 10,
  });
  const categories = categoriesData?.categories ?? [];

  const locationParams = selectedLocation?.storeId
    ? { storeId: selectedLocation.storeId, pincode: selectedLocation.pincode, city: selectedLocation.city }
    : selectedAddress?.pincode
      ? { pincode: selectedAddress.pincode, city: selectedAddress.city }
      : {};

  // Fetch products with filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      "products",
      currentPage,
      filters,
      debouncedSearchQuery,
      locationParams.storeId,
      locationParams.pincode,
    ],
    queryFn: async () => {
      if (debouncedSearchQuery.trim()) {
        const searchResponse = await axiosInstance.get("/product/api/search", {
          params: { q: debouncedSearchQuery.trim(), limit: itemsPerPage },
        });
        return {
          products: searchResponse.data.hits || [],
          pagination: {
            total: searchResponse.data.estimatedTotalHits || 0,
            page: 1,
            totalPages: 1,
          },
        };
      }

      const response = await axiosInstance.get("/product/api/get-all-products", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          category: filters.category || undefined,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          ...locationParams,
        },
      });
      return response.data;
    },
  });

  const products = productsData?.products || [];
  const totalPages = Math.ceil(
    (productsData?.pagination?.total || 0) / itemsPerPage
  );

  const updatePriceRange = (min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [min, max],
    }));
    setCurrentPage(1);
  };

  // Slider functions
  const handleSliderPress = (event: GestureResponderEvent) => {
    if (sliderWidth === 0) return;

    const { locationX } = event.nativeEvent;
    const percentage = locationX / sliderWidth;
    const newValue = Math.round(percentage * MAX_PRICE);

    // Determine which handle to move based on which side of the current range the tap is
    const currentMin = filters.priceRange[0];
    const currentMax = filters.priceRange[1];
    const currentRange = currentMax - currentMin;
    const midPoint = currentMin + currentRange / 2;

    if (newValue <= midPoint) {
      // Move min handle
      const clampedValue = Math.max(0, Math.min(newValue, currentMax - 50));
      updatePriceRange(clampedValue, currentMax);
    } else {
      // Move max handle
      const clampedValue = Math.max(currentMin + 50, Math.min(newValue, MAX_PRICE));
      updatePriceRange(currentMin, clampedValue);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? null : category,
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, MAX_PRICE],
      category: null,
    });
    setCurrentPage(1);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={{ width: "48.5%", marginBottom: 16 }}>
      <ProductCard product={item} cardWidth="100%" noRightMargin />
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <Text className="text-xl font-poppins-bold text-gray-900">
            Filters
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Price Range */}
          <View className="mb-6">
            <Text className="text-lg font-poppins-semibold text-gray-900 mb-3">
              Price Range
            </Text>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600">₹{filters.priceRange[0]}</Text>
              <Text className="text-gray-600">₹{filters.priceRange[1]}</Text>
            </View>

            {/* Interactive Price Range Slider */}
            <View
              className="relative"
              onLayout={(event) =>
                setSliderWidth(event.nativeEvent.layout.width)
              }
            >
              <View className="bg-gray-200 h-2 rounded-full">
                <View
                  className="bg-primary h-2 rounded-full absolute"
                  style={{
                    left: `${(filters.priceRange[0] / MAX_PRICE) * 100}%`,
                    width: `${
                      ((filters.priceRange[1] - filters.priceRange[0]) / MAX_PRICE) *
                      100
                    }%`,
                  }}
                />
              </View>

              {/* Min Price Handle */}
              <TouchableOpacity
                className="absolute w-6 h-6 bg-primary rounded-full -top-2 items-center justify-center"
                style={{
                  left: `${(filters.priceRange[0] / MAX_PRICE) * 100}%`,
                  marginLeft: -12,
                }}
                onPress={() => {
                  const newMin = Math.max(0, filters.priceRange[0] - 100);
                  updatePriceRange(newMin, filters.priceRange[1]);
                }}
              >
                <View className="w-2 h-2 bg-white rounded-full" />
              </TouchableOpacity>

              {/* Max Price Handle */}
              <TouchableOpacity
                className="absolute w-6 h-6 bg-primary rounded-full -top-2 items-center justify-center"
                style={{
                  left: `${(filters.priceRange[1] / MAX_PRICE) * 100}%`,
                  marginLeft: -12,
                }}
                onPress={() => {
                  const newMax = Math.min(MAX_PRICE, filters.priceRange[1] + 100);
                  updatePriceRange(filters.priceRange[0], newMax);
                }}
              >
                <View className="w-2 h-2 bg-white rounded-full" />
              </TouchableOpacity>

              {/* Slider Track Touch Area */}
              <TouchableOpacity
                className="absolute inset-0"
                onPress={handleSliderPress}
                activeOpacity={0.8}
              />
            </View>

            {/* Quick Price Presets */}
            <View className="flex-row flex-wrap mt-4 gap-2">
              {[
                { label: "Under ₹200", range: [0, 200] },
                { label: "₹200-₹500", range: [200, 500] },
                { label: "₹500-₹1000", range: [500, 1000] },
                { label: "₹1000+", range: [1000, MAX_PRICE] },
              ].map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  className={`px-3 py-2 rounded-full border ${
                    filters.priceRange[0] === preset.range[0] &&
                    filters.priceRange[1] === preset.range[1]
                      ? "bg-primary border-primary"
                      : "border-gray-300"
                  }`}
                  onPress={() =>
                    updatePriceRange(preset.range[0], preset.range[1])
                  }
                >
                  <Text
                    className={`text-sm font-poppins-medium ${
                      filters.priceRange[0] === preset.range[0] &&
                      filters.priceRange[1] === preset.range[1]
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View className="mb-6">
            <Text className="text-lg font-poppins-semibold text-gray-900 mb-3">
              Category
            </Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className="flex-row items-center py-2"
                onPress={() => toggleCategory(category)}
              >
                <View
                  className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                    filters.category === category
                      ? "bg-primary border-primary"
                      : "border-gray-300"
                  }`}
                >
                  {filters.category === category && (
                    <Ionicons name="checkmark" size={12} color="white" />
                  )}
                </View>
                <Text className="font-poppins-medium text-gray-700">
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Filter Actions */}
        <View className="p-4 border-t border-gray-100 flex-row gap-3">
          <TouchableOpacity
            className="flex-1 py-3 border border-gray-300 rounded-xl"
            onPress={clearAllFilters}
          >
            <Text className="text-center font-poppins-semibold text-gray-700">
              Clear All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 bg-primary rounded-xl"
            onPress={() => setShowFilters(false)}
          >
            <Text className="text-center font-poppins-semibold text-white">
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <View className="flex-row items-center justify-center py-4">
        {currentPage > 1 && (
          <TouchableOpacity
            className="w-10 h-10 rounded-full border border-gray-300 items-center justify-center mr-2"
            onPress={() => setCurrentPage(currentPage - 1)}
          >
            <Ionicons name="chevron-back" size={16} color="#6B7280" />
          </TouchableOpacity>
        )}

        {pages.map((page) => (
          <TouchableOpacity
            key={page}
            className={`w-10 h-10 rounded-full items-center justify-center mx-1 ${
              page === currentPage ? "bg-primary" : "border border-gray-300"
            }`}
            onPress={() => setCurrentPage(page)}
          >
            <Text
              className={`font-poppins-semibold ${
                page === currentPage ? "text-white" : "text-gray-700"
              }`}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        {currentPage < totalPages && (
          <TouchableOpacity
            className="w-10 h-10 rounded-full border border-gray-300 items-center justify-center ml-2"
            onPress={() => setCurrentPage(currentPage + 1)}
          >
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 pt-14 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-poppins-bold text-gray-900">
            All Products
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <Ionicons name="filter" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            placeholder="Search for fish, meat, and more..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            className="flex-1 ml-3 font-poppins-medium text-gray-900"
          />
        </View>
        {/* Breadcrumb */}
        <Text className="text-sm text-gray-500 font-poppins-medium mt-2">
          Home • All Products
        </Text>
      </View>

      {/* Products List */}
      {isLoading ? (
        <View className="flex-1 bg-gray-50">
          <View className="flex-row flex-wrap justify-between px-4 py-4">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <ProductSkeleton key={item} />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          className="bg-gray-50"
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
          }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews
          ListFooterComponent={renderPagination}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="search-outline" size={64} color="#9CA3AF" />
              <Text className="text-xl font-poppins-bold text-gray-900 mt-4">
                No products found
              </Text>
              <Text className="text-gray-500 text-center font-poppins-medium mt-2">
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      )}

      {renderFilterModal()}
    </SafeAreaView>
  );
}
