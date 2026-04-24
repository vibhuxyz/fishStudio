import ProductCard from "@/components/cards/product.card";
import Header from "@/components/home/header";
import ProductSkeleton from "@/components/skelton/product.skelton";
import { useAddressStore } from "@/lib/address-store";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const normalizeSlug = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[&\s\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const titleizeSlug = (str: string) =>
  str
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

interface CategoryBanner {
  id: string;
  imageUrl: string;
  isActive: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CATEGORY_BANNER_WIDTH = SCREEN_WIDTH - 32;
const CATEGORY_BANNER_HEIGHT = CATEGORY_BANNER_WIDTH * (9 / 21);

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const rawCategory = decodeURIComponent(slug ?? "");
  const { selectedLocation, getSelectedAddress, locationVersion } = useAddressStore();
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const selectedAddress = getSelectedAddress();

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

  const resolvedCategory = useMemo(() => {
    if (!categoriesData?.categories) return null;
    return (
      categoriesData.categories.find(
        (cat) => normalizeSlug(cat) === normalizeSlug(rawCategory),
      ) ?? null
    );
  }, [categoriesData?.categories, rawCategory]);

  const categoryName = resolvedCategory ?? titleizeSlug(rawCategory);
  const categoryForFetch = resolvedCategory ?? rawCategory;
  const locationParams: { storeId?: string; pincode?: string; city?: string } = selectedLocation?.storeId
    ? {
        storeId: selectedLocation.storeId,
        pincode: selectedLocation.pincode,
        city: selectedLocation.city,
      }
    : selectedLocation?.pincode
      ? {
          pincode: selectedLocation.pincode,
          city: selectedLocation.city,
        }
      : selectedAddress?.pincode
        ? {
            pincode: selectedAddress.pincode,
            city: selectedAddress.city,
        }
        : {};

  const { data: categoryBanners = [] } = useQuery({
    queryKey: [
      "category-banners",
      categoryForFetch,
      locationParams.storeId,
      locationParams.pincode,
    ],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-banners", {
        params: {
          category: categoryForFetch,
          storeId: locationParams.storeId,
          pincode: locationParams.pincode,
        },
      });
      return Array.isArray(res.data.banners)
        ? res.data.banners.filter((banner: CategoryBanner) => banner.isActive)
        : [];
    },
    enabled: !!categoryForFetch,
    staleTime: 1000 * 60 * 5,
  });

  const scrollToBanner = useCallback((index: number) => {
    bannerScrollRef.current?.scrollTo({
      x: index * CATEGORY_BANNER_WIDTH,
      animated: true,
    });
    setCurrentBanner(index);
  }, []);

  useEffect(() => {
    if (categoryBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => {
        const next = (prev + 1) % categoryBanners.length;
        bannerScrollRef.current?.scrollTo({
          x: next * CATEGORY_BANNER_WIDTH,
          animated: true,
        });
        return next;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [categoryBanners.length]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      "category-products",
      categoryForFetch,
      locationParams.storeId,
      locationParams.pincode,
      locationVersion,
    ],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-all-products", {
        params: {
          category: categoryForFetch,
          scope: "category",
          page: 1,
          limit: 50,
          ...locationParams,
        },
      });
      return res.data;
    },
    enabled: !!categoryForFetch,
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
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header />

      <FlatList
        data={isLoading ? [] : displayedProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
        renderItem={({ item }) => (
          <View style={{ width: "48.5%", marginBottom: 12 }}>
            <ProductCard product={item} cardWidth="100%" noRightMargin />
          </View>
        )}
        ListHeaderComponent={
          <View>
            {/* Back to Home link + Title */}
            <View className="px-4 pt-5 pb-5 bg-white border-t border-gray-100">
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

            {categoryBanners.length > 0 ? (
              <View className="px-4 pt-4">
                <View
                  className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-100"
                  style={{ height: CATEGORY_BANNER_HEIGHT }}
                >
                  <ScrollView
                    ref={bannerScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    onMomentumScrollEnd={(event) => {
                      const index = Math.round(
                        event.nativeEvent.contentOffset.x / CATEGORY_BANNER_WIDTH,
                      );
                      setCurrentBanner(index);
                    }}
                  >
                    {categoryBanners.map((banner: CategoryBanner) => (
                      <Image
                        key={banner.id}
                        source={{ uri: banner.imageUrl }}
                        style={{
                          width: CATEGORY_BANNER_WIDTH,
                          height: CATEGORY_BANNER_HEIGHT,
                        }}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>

                  {categoryBanners.length > 1 && (
                    <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
                      {categoryBanners.map((_: CategoryBanner, index: number) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => scrollToBanner(index)}
                          activeOpacity={0.8}
                        >
                          <View
                            className={`h-2 rounded-full bg-white ${
                              index === currentBanner
                                ? "w-6 opacity-100"
                                : "w-2 opacity-50"
                            }`}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ) : null}

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
