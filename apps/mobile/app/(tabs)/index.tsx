import ActiveOrderWidget from "@/components/home/active-order-widget";
import BannerCarousel from "@/components/home/banner-carousel";
import BestSellersCombos from "@/components/home/best-sellers-combos";
import CategoryRow from "@/components/home/category-row";
import AddToCartModal from "@/components/home/add-to-cart-modal";
import { useComboBanner } from "@/components/home/combo-card";
import Header from "@/components/home/header";
import ProductSection from "@/components/home/products";
import SectionCarousel from "@/components/home/section-carousel";
import TrustStrip from "@/components/home/trust-strip";
import ProductSkeleton from "@/components/skelton/product.skelton";
import { fetchForYou, fetchRecentlyViewed } from "@/actions/activity";
import { useAddressStore } from "@/lib/address-store";
import type { Product } from "@/types/product";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProductListingPage {
  products: Product[];
  pagination?: { page: number; hasMore?: boolean };
}

export default function Index() {
  const { selectedLocation, locationVersion } = useAddressStore();

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
    queryFn: async ({ pageParam = 1 }): Promise<ProductListingPage> => {
      const res = await axiosInstance.get("/product/api/get-all-products", {
        params: { page: pageParam, limit: 20, ...locationParams },
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? (lastPage.pagination.page ?? 1) + 1 : undefined,
    staleTime: 1000 * 60 * 5,
  });

  const products = infiniteData?.pages.flatMap((p) => p.products) ?? [];

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
  const sections: { key: string; title: string; products: Product[] }[] =
    sectionsData?.sections ?? [];
  const getSection = (key: string) => sections.find((s) => s.key === key);
  const freshArrivals = getSection("fresh-arrivals");
  const bestSellers = getSection("best-sellers");
  const combos = getSection("combos");
  const seasonal = getSection("seasonal");

  // Personalised rails
  const { data: recentlyViewed = [] } = useQuery({
    queryKey: ["recently-viewed", locationParams.storeId, locationParams.pincode, locationVersion],
    queryFn: () => fetchRecentlyViewed(locationParams),
    staleTime: 1000 * 60 * 2,
  });
  const { data: forYou = [] } = useQuery({
    queryKey: ["for-you", locationParams.storeId, locationParams.pincode, locationVersion],
    queryFn: () => fetchForYou(locationParams),
    staleTime: 1000 * 60 * 5,
  });

  // Combo artwork is uploaded from admin as a "combo" banner.
  const { data: comboBanner = null } = useComboBanner();
  const [cartProduct, setCartProduct] = useState<Product | null>(null);

  const openSection = (key: string) =>
    router.push({ pathname: "/(routes)/section/[key]", params: { key } });

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    // Infinite scroll: trigger when within 300px of bottom
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
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
        <ActiveOrderWidget />
      </View>

      <AddToCartModal
        product={cartProduct}
        visible={!!cartProduct}
        onClose={() => setCartProduct(null)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ backgroundColor: "#F4F4F4" }}
      >
        {/* Hero banner — the artwork carries its own headline and CTA */}
        <BannerCarousel />

        {/* Service promises */}
        <TrustStrip />

        {/* Category shortcuts */}
        <CategoryRow />

        {/* Fresh Arrivals */}
        {freshArrivals && (
          <SectionCarousel
            title={freshArrivals.title}
            products={freshArrivals.products}
            onSeeAll={() => openSection(freshArrivals.key)}
          />
        )}

        {/* Best Sellers sits beside the combo offer, per the comp */}
        <BestSellersCombos
          bestSellers={bestSellers?.products ?? []}
          comboBanner={comboBanner}
          comboProduct={combos?.products?.[0]}
          onViewAllBestSellers={() => openSection("best-sellers")}
          onViewAllCombos={() => openSection("combos")}
          onAddToCart={setCartProduct}
        />

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

        {/* Recently viewed rail */}
        <SectionCarousel
          title="Recently Viewed"
          products={recentlyViewed}
          onSeeAll={() => openSection("recently-viewed")}
        />

        {/* Seasonal Specials */}
        {seasonal && (
          <SectionCarousel
            title={seasonal.title}
            products={seasonal.products}
            onSeeAll={() => openSection(seasonal.key)}
          />
        )}

        {/* Recommended Products (content-based recommendations) */}
        <SectionCarousel
          title="Recommended Products"
          products={forYou}
          onSeeAll={() => openSection("for-you")}
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
