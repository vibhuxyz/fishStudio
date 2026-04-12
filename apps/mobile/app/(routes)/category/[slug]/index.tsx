import ProductCard from "@/components/cards/product.card";
import ProductSkeleton from "@/components/skelton/product.skelton";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const categoryName = decodeURIComponent(slug ?? "");
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ["storefront-categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data as {
        categories: string[];
        subCategories: Record<string, string[]>;
        categoryImages: Record<string, string>;
      };
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["category-products", categoryName],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?categories=${encodeURIComponent(categoryName)}&limit=50`
      );
      return res.data;
    },
    enabled: !!categoryName,
  });

  const allProducts: any[] = productsData?.products ?? [];

  // Subcategories from API for this category
  const subCategories = useMemo(() => {
    if (!categoriesData) return [];
    // Try exact key, then lowercased key
    const key = Object.keys(categoriesData.subCategories).find(
      (k) => k.toLowerCase() === categoryName.toLowerCase()
    );
    const apiSubs = key ? categoriesData.subCategories[key] : [];
    // Also collect from products
    const productSubs = allProducts
      .map((p) => p.subCategory)
      .filter((s): s is string => Boolean(s));
    return Array.from(new Set([...apiSubs, ...productSubs]));
  }, [categoriesData, categoryName, allProducts]);

  const displayedProducts = useMemo(() => {
    if (!activeSubCategory) return allProducts;
    return allProducts.filter((p) => p.subCategory === activeSubCategory);
  }, [allProducts, activeSubCategory]);

  const renderProduct = ({ item }: { item: any }) => (
    <ProductCard product={item} />
  );

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-poppins-bold text-gray-900" numberOfLines={1}>
            {categoryName}
          </Text>
          <Text className="text-xs text-gray-400 font-poppins-medium">
            {allProducts.length} products
          </Text>
        </View>
      </View>

      {/* Subcategory pills */}
      {subCategories.length > 0 && (
        <View className="border-b border-gray-100">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
          >
            <TouchableOpacity
              onPress={() => setActiveSubCategory(null)}
              className={`px-4 py-2 rounded-full border ${
                activeSubCategory === null
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  activeSubCategory === null ? "text-white" : "text-gray-700"
                }`}
              >
                All ({allProducts.length})
              </Text>
            </TouchableOpacity>
            {subCategories.map((sub) => {
              const count = allProducts.filter((p) => p.subCategory === sub).length;
              return (
                <TouchableOpacity
                  key={sub}
                  onPress={() => setActiveSubCategory(sub)}
                  className={`px-4 py-2 rounded-full border ${
                    activeSubCategory === sub
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      activeSubCategory === sub ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {sub} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Products grid */}
      {isLoading ? (
        <View className="flex-row flex-wrap justify-between px-4 py-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ProductSkeleton key={i} width={190} />
          ))}
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <Ionicons name="fish-outline" size={64} color="#9CA3AF" />
              <Text className="text-lg font-poppins-bold text-gray-700 mt-4">
                No products found
              </Text>
              <Text className="text-sm text-gray-400 text-center mt-1 font-poppins-medium">
                Check back soon for products in this category.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
