import ProductCard from "@/components/cards/product.card";
import ProductSkeleton from "@/components/skelton/product.skelton";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
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
        `/product/api/get-filtered-products?categories=${encodeURIComponent(categoryName)}&limit=50`,
      );
      return res.data;
    },
    enabled: !!categoryName,
  });

  const allProducts: any[] = productsData?.products ?? [];

  const subCategories = useMemo(() => {
    if (!categoriesData) return [];
    const key = Object.keys(categoriesData.subCategories).find(
      (k) => k.toLowerCase() === categoryName.toLowerCase(),
    );
    const apiSubs = key ? categoriesData.subCategories[key] : [];
    const productSubs = allProducts
      .map((p) => p.subCategory)
      .filter((s): s is string => Boolean(s));
    return Array.from(new Set([...apiSubs, ...productSubs]));
  }, [categoriesData, categoryName, allProducts]);

  const displayedProducts = useMemo(() => {
    if (!activeSubCategory) return allProducts;
    return allProducts.filter((p) => p.subCategory === activeSubCategory);
  }, [allProducts, activeSubCategory]);

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Slim nav header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/cart")}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="bag-handle-outline" size={18} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={isLoading ? [] : displayedProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width: "48.5%", marginBottom: 12 }}>
            <ProductCard product={item} />
          </View>
        )}
        ListHeaderComponent={
          <View>
            {/* Back to Home link + Title */}
            <View className="px-4 pt-5 pb-2 bg-white">
              <TouchableOpacity
                onPress={() => router.push("/(tabs)")}
                className="flex-row items-center mb-3"
              >
                <Ionicons name="arrow-back" size={18} color="#374151" />
                <Text className="ml-2 text-sm text-gray-700 font-poppins-medium">
                  Back to Home
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  fontWeight: Platform.OS === "android" ? "700" : "normal",
                }}
                className="text-[32px] text-gray-900 leading-tight"
              >
                {categoryName}
              </Text>
              <Text className="text-sm text-gray-500 font-poppins-medium mt-1 leading-5">
                Browse our fresh selection of {categoryName.toLowerCase()} products.{" "}
                {allProducts.length} product{allProducts.length !== 1 ? "s" : ""} available.
              </Text>
            </View>

            {/* Subcategories card */}
            {subCategories.length > 0 && (
              <View className="mx-3 mt-4 bg-white rounded-2xl border border-gray-100 p-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="filter-outline" size={16} color="#1F2937" />
                  <Text
                    style={{
                      fontFamily: "Poppins-Bold",
                      fontWeight: Platform.OS === "android" ? "700" : "normal",
                    }}
                    className="text-base text-gray-900 ml-2"
                  >
                    Subcategories
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Chip
                    label="All"
                    count={allProducts.length}
                    active={activeSubCategory === null}
                    onPress={() => setActiveSubCategory(null)}
                  />
                  {subCategories.map((sub) => {
                    const count = allProducts.filter(
                      (p) => p.subCategory === sub,
                    ).length;
                    return (
                      <Chip
                        key={sub}
                        label={sub}
                        count={count}
                        active={activeSubCategory === sub}
                        onPress={() => setActiveSubCategory(sub)}
                      />
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Showing count */}
            {!isLoading && (
              <View className="px-4 pt-4 pb-2">
                <Text className="text-sm text-gray-600 font-poppins-medium">
                  Showing{" "}
                  <Text
                    style={{
                      fontFamily: "Poppins-Bold",
                      fontWeight: Platform.OS === "android" ? "700" : "normal",
                    }}
                    className="text-gray-900"
                  >
                    {displayedProducts.length}
                  </Text>{" "}
                  product{displayedProducts.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-row flex-wrap justify-between px-3 pt-2">
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ width: "48.5%", marginBottom: 12 }}>
                  <ProductSkeleton width={190} />
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-24">
              <Ionicons name="fish-outline" size={64} color="#9CA3AF" />
              <Text className="text-lg font-poppins-bold text-gray-700 mt-4">
                No products found
              </Text>
              <Text className="text-sm text-gray-400 text-center mt-1 font-poppins-medium">
                Check back soon for products in this category.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

function Chip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
        active ? "bg-primary" : "bg-gray-100"
      }`}
    >
      <Text
        style={{
          fontFamily: active ? "Poppins-Bold" : "Poppins-Medium",
          fontWeight: Platform.OS === "android" ? (active ? "700" : "500") : "normal",
        }}
        className={`text-sm ${active ? "text-white" : "text-gray-700"}`}
      >
        {label}
      </Text>
      <View
        className={`ml-2 px-2 py-0.5 rounded-full ${
          active ? "bg-white/25" : "bg-white"
        }`}
      >
        <Text
          className={`text-[10px] font-poppins-bold ${
            active ? "text-white" : "text-gray-600"
          }`}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
