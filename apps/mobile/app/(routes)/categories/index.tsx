import Header from "@/components/home/header";
import axiosInstance from "@/utils/axiosInstance";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { normalizeSlug } from "@repo/shared/slug";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
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

// Same fallback used by the home category row, kept in sync so a category
// without an image looks the same on both screens.
const iconForCategory = (name: string) => {
  const key = name.toLowerCase();
  if (key.includes("chicken")) return "food-drumstick";
  if (key.includes("mutton") || key.includes("lamb")) return "food-steak";
  if (key.includes("prawn") || key.includes("shrimp") || key.includes("seafood") || key.includes("crab"))
    return "fish";
  if (key.includes("ready")) return "pot-steam";
  if (key.includes("combo")) return "food-variant";
  return "fish";
};

interface CategoriesResponse {
  categories: string[];
  subCategories: Record<string, string[]>;
  categoryImages: Record<string, string>;
}

export default function AllCategoriesScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["storefront-categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories?activeOnly=true");
      return res.data as CategoriesResponse;
    },
    staleTime: Infinity,
  });

  const categories = data?.categories ?? [];
  const subCategories = data?.subCategories ?? {};
  const categoryImages = data?.categoryImages ?? {};

  const goToCategory = (category: string, subCategory?: string) => {
    router.push({
      pathname: "/(routes)/category/[slug]",
      params: {
        slug: normalizeSlug(category),
        ...(subCategory ? { subCategory } : {}),
      },
    });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-5 pb-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="flex-row items-center mb-3"
          >
            <Ionicons name="arrow-back" size={18} color="#374151" />
            <Text className="ml-2 text-sm text-gray-700 font-poppins-medium">Back to Home</Text>
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontWeight: Platform.OS === "android" ? "700" : "normal",
            }}
            className="text-[32px] text-gray-900 leading-tight"
          >
            All Categories
          </Text>
          <Text className="text-sm text-gray-500 font-poppins-medium mt-1">
            Browse every category and jump straight to what you need.
          </Text>
        </View>

        {isLoading ? (
          <View className="px-4 pt-4">
            {[0, 1, 2].map((i) => (
              <View key={i} className="h-24 bg-gray-100 rounded-2xl mb-3" />
            ))}
          </View>
        ) : (
          <View className="px-4 pt-4">
            {categories.map((category) => {
              const image = categoryImages[category];
              const subs = subCategories[category] ?? [];
              return (
                <View
                  key={category}
                  className="bg-white rounded-2xl border border-gray-100 mb-3 p-4"
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-row items-center"
                    onPress={() => goToCategory(category)}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#F3EEFB",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {image ? (
                        <Image
                          source={{ uri: cloudinaryThumbnail(image, 96) }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <MaterialCommunityIcons name={iconForCategory(category)} size={24} color="#5A2C96" />
                      )}
                    </View>
                    <Text
                      style={{
                        fontFamily: "Inter-Bold",
                        fontWeight: Platform.OS === "android" ? "700" : "normal",
                      }}
                      className="flex-1 text-base text-gray-900 ml-3"
                    >
                      {category}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </TouchableOpacity>

                  {subs.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ marginTop: 12, paddingLeft: 60 }}
                    >
                      {subs.map((sub) => (
                        <TouchableOpacity
                          key={sub}
                          activeOpacity={0.8}
                          className="bg-gray-100 rounded-full px-3 py-1.5 mr-2"
                          onPress={() => goToCategory(category, sub)}
                        >
                          <Text className="text-xs text-gray-700 font-poppins-medium">{sub}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              );
            })}

            {categories.length === 0 && (
              <View className="items-center justify-center py-24">
                <Ionicons name="grid-outline" size={64} color="#9CA3AF" />
                <Text className="text-lg font-poppins-bold text-gray-700 mt-4">No categories yet</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
