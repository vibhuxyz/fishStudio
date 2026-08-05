import axiosInstance from "@/utils/axiosInstance";
import { normalizeSlug } from "@repo/slug";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

// Best-effort icon for categories that have no image configured yet.
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
  categoryImages: Record<string, string>;
}

export default function CategoryRow() {
  const { data } = useQuery({
    queryKey: ["storefront-categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories?activeOnly=true");
      return res.data as CategoriesResponse;
    },
    staleTime: 1000 * 60 * 10,
  });

  const categories = data?.categories ?? [];
  const categoryImages = data?.categoryImages ?? {};

  if (categories.length === 0) return null;

  return (
    <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "flex-start" }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 12, gap: 18 }}
        style={{ flex: 1 }}
      >
        {categories.map((cat) => {
          const image = categoryImages[cat];
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.7}
              style={{ alignItems: "center", width: 64 }}
              onPress={() =>
                router.push({ pathname: "/(routes)/category/[slug]", params: { slug: normalizeSlug(cat) } })
              }
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "#F3EEFB",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={iconForCategory(cat)}
                    size={28}
                    color="#5A2C96"
                  />
                )}
              </View>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "Inter-Medium",
                  fontSize: 12,
                  color: "#1A1C1C",
                  marginTop: 6,
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sits outside the scroller so it stays put once the row is scrolled */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ alignItems: "center", width: 64, marginRight: 16 }}
        onPress={() => router.push("/(routes)/products")}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#F3EEFB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="grid-outline" size={24} color="#5A2C96" />
        </View>
        <Text
          style={{
            fontFamily: "Inter-Medium",
            fontSize: 12,
            color: "#1A1C1C",
            marginTop: 6,
          }}
        >
          More
        </Text>
      </TouchableOpacity>
    </View>
  );
}
