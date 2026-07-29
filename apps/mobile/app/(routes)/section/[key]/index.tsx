import ProductCard from "@/components/cards/product.card";
import ProductSkeleton from "@/components/skelton/product.skelton";
import AddToCartModal from "@/components/home/add-to-cart-modal";
import { fetchForYou, fetchRecentlyViewed } from "@/actions/activity";
import { useAddressStore } from "@/lib/address-store";
import type { Product } from "@/types/product";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// The personalised rails come from the activity endpoints rather than the
// section rules, so they're routed here by key but fetched differently.
const ACTIVITY_SECTIONS: Record<string, { title: string; fetch: typeof fetchForYou }> = {
  "recently-viewed": { title: "Recently Viewed", fetch: fetchRecentlyViewed },
  "for-you": { title: "Recommended Products", fetch: fetchForYou },
};

const FALLBACK_TITLES: Record<string, string> = {
  "fresh-arrivals": "Fresh Arrivals",
  "best-sellers": "Best Sellers",
  combos: "Combos",
  seasonal: "Seasonal Specials",
};

export default function SectionScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const sectionKey = key ?? "";
  const { selectedLocation, getSelectedAddress, locationVersion } = useAddressStore();
  const [cartProduct, setCartProduct] = useState<Product | null>(null);

  const selectedAddress = getSelectedAddress();
  const locationParams: { storeId?: string; pincode?: string; city?: string } =
    selectedLocation?.storeId
      ? {
          storeId: selectedLocation.storeId,
          pincode: selectedLocation.pincode,
          city: selectedLocation.city,
        }
      : selectedLocation?.pincode
        ? { pincode: selectedLocation.pincode, city: selectedLocation.city }
        : selectedAddress?.pincode
          ? { pincode: selectedAddress.pincode, city: selectedAddress.city }
          : {};

  const activitySection = ACTIVITY_SECTIONS[sectionKey];

  const { data, isLoading } = useQuery({
    queryKey: [
      "section-products",
      sectionKey,
      locationParams.storeId,
      locationParams.pincode,
      locationVersion,
    ],
    queryFn: async (): Promise<{ title?: string; products: Product[] }> => {
      if (activitySection) {
        return { products: await activitySection.fetch(locationParams) };
      }
      const res = await axiosInstance.get("/product/api/get-section-products", {
        params: { key: sectionKey, limit: 50, ...locationParams },
      });
      return { title: res.data?.title, products: res.data?.products ?? [] };
    },
    enabled: !!sectionKey,
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.products ?? [];
  const title =
    activitySection?.title ?? data?.title ?? FALLBACK_TITLES[sectionKey] ?? "Products";

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#F4F4F4" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AddToCartModal
        product={cartProduct}
        visible={!!cartProduct}
        onClose={() => setCartProduct(null)}
      />

      <FlatList
        data={isLoading ? [] : products}
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
            <ProductCard
              product={item}
              cardWidth="100%"
              noRightMargin
              onAddToCart={setCartProduct}
            />
          </View>
        )}
        ListHeaderComponent={
          <View className="px-4 pt-5 pb-5 bg-white">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center mb-3"
            >
              <Ionicons name="arrow-back" size={18} color="#374151" />
              <Text className="ml-2 text-sm text-gray-700 font-poppins-medium">
                Back
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: "Inter-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
              className="text-[32px] text-gray-900 leading-tight"
            >
              {title}
            </Text>
            {!isLoading && (
              <Text className="text-sm text-gray-500 font-poppins-medium mt-1 leading-5">
                {products.length} product{products.length !== 1 ? "s" : ""} available.
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: 16,
                gap: 16,
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </View>
          ) : (
            <View className="items-center px-8 py-20">
              <Ionicons name="fish-outline" size={44} color="#C7C7CC" />
              <Text className="text-base text-gray-900 font-poppins-semibold mt-4">
                Nothing here yet
              </Text>
              <Text className="text-sm text-gray-500 font-poppins-medium mt-1 text-center leading-5">
                {activitySection
                  ? "Browse a few products and they will show up here."
                  : "This section has no products for your location right now."}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
