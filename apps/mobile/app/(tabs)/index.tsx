import ShopCard from "@/components/cards/shop.card";
import BannerCarousel from "@/components/home/banner-carousel";
import Header from "@/components/home/header";
import ProductSection from "@/components/home/products";
import ProductSkeleton from "@/components/skelton/product.skelton";
import ShopSkeleton from "@/components/skelton/shop.skelton";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Index() {
  const { user } = useUser();

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

  const fetchProducts = async () => {
    const response = await axiosInstance.get("/product/api/get-all-products", {
      params: {
        page: 1,
        limit: 10,
      },
    });
    return response.data.products;
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // Fetch recommended products for the user
  const { data: recommendedProducts, isLoading: recommendedLoading } = useQuery(
    {
      queryKey: ["recommended-products", user?.id],
      queryFn: async () => {
        if (!user) return [];
        const response = await axiosInstance.get(
          "/recommendation/api/get-recommendation-products"
        );
        return response.data.recommendations || [];
      },
      enabled: !!user, // Only fetch if user is logged in
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    }
  );

  const { data: shops, isLoading: shopLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 2,
  });

  const onShopPress = (shop: any) => {
    router.push({
      pathname: "/(routes)/shop/[id]",
      params: {
        id: shop.id,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle={"dark-content"} backgroundColor={"#fff"} />
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        {categoriesData?.categories && categoriesData.categories.length > 0 && (
          <View className="py-4 border-b border-border">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
              {categoriesData.categories.map((name) => (
                <TouchableOpacity
                  key={name}
                  className="items-center mr-6"
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/(routes)/category/[slug]",
                      params: { slug: name },
                    })
                  }
                >
                  <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-2 overflow-hidden">
                    {categoriesData.categoryImages?.[name] ? (
                      <Image
                        source={{ uri: categoriesData.categoryImages[name] }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <MaterialCommunityIcons name="fish" size={28} color="#6C3CE1" />
                    )}
                  </View>
                  <Text className="text-xs font-poppins-medium text-muted-foreground text-center" numberOfLines={2} style={{ maxWidth: 64 }}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <BannerCarousel />

        {/* Fresh Arrival Section */}
        <View className="py-6">
          <View className="px-4 mb-4">
            <Text className="text-xs font-poppins-semibold text-primary uppercase tracking-wider text-center mb-2">
              FRESH ARRIVAL
            </Text>
            <Text
              className="text-2xl text-foreground text-center"
              style={{
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              Live-Cut. Fresh. Packed For You.
            </Text>
          </View>

          {isLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
              {[0, 1, 2, 3].map((i: any) => (
                <ProductSkeleton key={i} />
              ))}
            </ScrollView>
          ) : (
            <ProductSection title="" products={products} hideTitle={true} />
          )}
        </View>

        {/* Customer Favorites Section */}
        {user && (
          <>
            {recommendedLoading ? (
              <View className="py-6">
                <View className="px-4 mb-4">
                  <Text className="text-xs font-poppins-semibold text-primary uppercase tracking-wider text-center mb-2">
                    CUSTOMER FAVORITES
                  </Text>
                  <Text
                    className="text-2xl text-foreground text-center"
                    style={{
                      fontFamily: "Poppins-Bold",
                      fontWeight: Platform.OS === "android" ? "700" : "normal",
                    }}
                  >
                    Quick Delivery FAV
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                  <ProductSkeleton />
                  <ProductSkeleton />
                  <ProductSkeleton />
                </ScrollView>
              </View>
            ) : (
              recommendedProducts &&
              recommendedProducts.length > 0 && (
                <View className="py-6">
                  <View className="px-4 mb-4">
                    <Text className="text-xs font-poppins-semibold text-primary uppercase tracking-wider text-center mb-2">
                      CUSTOMER FAVORITES
                    </Text>
                    <Text
                      className="text-2xl text-foreground text-center"
                      style={{
                        fontFamily: "Poppins-Bold",
                        fontWeight: Platform.OS === "android" ? "700" : "normal",
                      }}
                    >
                      Quick Delivery FAV
                    </Text>
                  </View>
                  <ProductSection
                    title=""
                    products={recommendedProducts}
                    hideTitle={true}
                  />
                </View>
              )
            )}
          </>
        )}

        {/* Top Shops section */}
        <View className="px-4 py-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="text-2xl text-foreground"
              style={{
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              Top Shops
            </Text>
            <TouchableOpacity className="flex-row items-center bg-primary/10 px-3 py-2 rounded-full">
              <Text className="text-primary font-poppins-semibold mr-1 text-sm">
                See All
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#6C3CE1" />
            </TouchableOpacity>
          </View>

          {shopLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ShopSkeleton />
              <ShopSkeleton />
              <ShopSkeleton />
            </ScrollView>
          ) : (
            shops?.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {shops?.map((shop: any) => (
                  <ShopCard
                    key={shop?.id}
                    shop={shop}
                    onPress={() => onShopPress(shop)}
                  />
                ))}
              </ScrollView>
            )
          )}
        </View>

        {/* Flash Sale */}
        <View className="py-6">
          <View className="px-4 mb-4">
            <Text className="text-xs font-poppins-semibold text-primary uppercase tracking-wider text-center mb-2">
              FLASH SALE
            </Text>
            <Text
              className="text-2xl text-foreground text-center"
              style={{
                fontFamily: "Poppins-Bold",
                fontWeight: Platform.OS === "android" ? "700" : "normal",
              }}
            >
              Grab Before It's Gone
            </Text>
          </View>
          <ProductSection
            title=""
            products={products}
            hideTitle={true}
            isFlashSale={true}
          />
        </View>

        <View className="h-14" />
      </ScrollView>
    </SafeAreaView>
  );
}
