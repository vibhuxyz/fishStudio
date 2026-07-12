import BannerCarousel from "@/components/home/banner-carousel";
import CategoryRow from "@/components/home/category-row";
import Header from "@/components/home/header";
import ProductSection from "@/components/home/products";
import SectionCarousel from "@/components/home/section-carousel";
import ProductSkeleton from "@/components/skelton/product.skelton";
import { fetchForYou, fetchRecentlyViewed } from "@/actions/activity";
import { useAddressStore } from "@/lib/address-store";
import { useUIStore } from "@/store/ui-store";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { selectedLocation, locationVersion } = useAddressStore();
  const { setTabBarHidden } = useUIStore();
  const lastScrollY = useRef(0);

  const locationParams = selectedLocation?.storeId
    ? { storeId: selectedLocation.storeId, pincode: selectedLocation.pincode, city: selectedLocation.city }
    : selectedLocation?.pincode
    ? { pincode: selectedLocation.pincode, city: selectedLocation.city }
    : {};

  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["products-infinite", locationParams.storeId, locationParams.pincode, locationVersion],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosInstance.get("/product/api/get-all-products", {
        params: { page: pageParam, limit: 20, ...locationParams },
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) =>
      lastPage.pagination?.hasMore ? lastPage.pagination.page + 1 : undefined,
    staleTime: 1000 * 60 * 5,
  });

  const products = infiniteData?.pages.flatMap((p: any) => p.products) ?? [];

  // Home sections (Fresh Today / Best Seller / Trending / New Arrival)
  const { data: sectionsData } = useQuery({
    queryKey: ["home-sections", locationParams.storeId, locationParams.pincode, locationVersion],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-homepage-sections", {
        params: { ...locationParams },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
  const sections: { key: string; title: string; products: any[] }[] =
    sectionsData?.sections ?? [];
  const getSection = (key: string) => sections.find((s) => s.key === key);
  const freshArrivals = getSection("fresh-arrivals");
  const bestSellers = getSection("best-sellers");
  const combos = getSection("combos");
  const seasonal = getSection("seasonal");

  // Personalised rails
  const { data: recentlyViewed = [] } = useQuery({
    queryKey: ["recently-viewed", locationParams.storeId, locationParams.pincode, locationVersion],
    queryFn: () => fetchRecentlyViewed(locationParams as any),
    staleTime: 1000 * 60 * 2,
  });
  const { data: forYou = [] } = useQuery({
    queryKey: ["for-you", locationParams.storeId, locationParams.pincode, locationVersion],
    queryFn: () => fetchForYou(locationParams as any),
    staleTime: 1000 * 60 * 5,
  });

  const handleScroll = (e: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const currentY = contentOffset.y;
    const diff = currentY - lastScrollY.current;
    if (diff > 8 && currentY > 60) setTabBarHidden(true);
    else if (diff < -8) setTabBarHidden(false);
    lastScrollY.current = currentY;
    // Infinite scroll: trigger when within 300px of bottom
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - currentY;
    if (distanceFromBottom < 300 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#F4F4F4" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header is sticky above the scroll */}
      <View style={{ backgroundColor: "#FFFFFF" }}>
        <Header />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ backgroundColor: "#F4F4F4" }}
      >
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Category shortcuts */}
        <CategoryRow />

        {/* Tagline + WhatsApp CTA */}
        <View
          className="px-4 py-5"
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter-Bold",
                fontSize: 22,
                color: "#300861",
                lineHeight: 30,
                letterSpacing: -0.3,
              }}
            >
              {"Live-Cut. Fresh.\nPacked For You."}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://wa.me/919999999999")}
            activeOpacity={0.8}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "#25D366",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#25D366",
              shadowOpacity: 0.4,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
              marginLeft: 12,
            }}
          >
            <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Fresh Arrivals */}
        {freshArrivals && (
          <SectionCarousel
            title={freshArrivals.title}
            products={freshArrivals.products}
            onSeeAll={() => router.push("/(routes)/products" as any)}
          />
        )}

        {/* Best Sellers */}
        {bestSellers && (
          <SectionCarousel
            title={bestSellers.title}
            products={bestSellers.products}
            onSeeAll={() => router.push("/(routes)/products" as any)}
          />
        )}

        {/* Combos */}
        {combos && (
          <SectionCarousel
            title={combos.title}
            products={combos.products}
            onSeeAll={() => router.push("/(routes)/products" as any)}
          />
        )}

        {/* Recently viewed rail */}
        <SectionCarousel
          title="Recently Viewed"
          products={recentlyViewed}
          onSeeAll={() => router.push("/(routes)/products" as any)}
        />

        {/* Seasonal Specials */}
        {seasonal && (
          <SectionCarousel
            title={seasonal.title}
            products={seasonal.products}
            onSeeAll={() => router.push("/(routes)/products" as any)}
          />
        )}

        {/* Recommended Products (content-based recommendations) */}
        <SectionCarousel
          title="Recommended Products"
          products={forYou}
          onSeeAll={() => router.push("/(routes)/products" as any)}
        />

        {/* All products heading */}
        {!isLoading && products.length > 0 && (
          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontSize: 18,
              color: "#1C1C1C",
              paddingHorizontal: 16,
              marginBottom: 12,
              letterSpacing: -0.3,
            }}
          >
            All Products
          </Text>
        )}

        {/* Products 2-column grid */}
        {isLoading ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 16 }}>
            {[0, 1, 2, 3].map((i) => <ProductSkeleton key={i} />)}
          </View>
        ) : (
          <ProductSection
            products={products}
            hideTitle={true}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
          />
        )}

        {/* Load more spinner */}
        {isFetchingNextPage && (
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <ActivityIndicator color="#5A2C96" size="small" />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
