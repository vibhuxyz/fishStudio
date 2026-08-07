import { colors } from "@/constants/theme";
import axiosInstance from "@/utils/axiosInstance";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = colors.primary;

interface MyReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  product?: { id: string; title: string; images?: { url: string }[] };
}

export default function MyReviewsScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-my-reviews");
      return res.data.reviews as MyReview[];
    },
  });

  const reviews = data ?? [];

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.secondaryBg }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F3F3" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 18, color: colors.textPrimary }}>My Reviews</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={PRIMARY} />
        </View>
      ) : reviews.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Ionicons name="star-outline" size={48} color="#CBD5E1" />
          <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 15, color: colors.textPrimary, marginTop: 14 }}>
            No reviews yet
          </Text>
          <Text style={{ fontFamily: "Inter-Regular", fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 4 }}>
            Reviews you leave on your orders will show up here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {reviews.map((review) => (
            <View
              key={review.id}
              style={{ flexDirection: "row", backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 12 }}
            >
              <Image
                source={{ uri: cloudinaryThumbnail(review.product?.images?.[0]?.url, 104) || "https://via.placeholder.com/56" }}
                style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: colors.secondaryBg }}
                resizeMode="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 14, color: colors.textPrimary }} numberOfLines={1}>
                  {review.product?.title || "Product"}
                </Text>
                <View style={{ flexDirection: "row", marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= review.rating ? "star" : "star-outline"}
                      size={13}
                      color="#F59E0B"
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
                {review.comment ? (
                  <Text style={{ fontFamily: "Inter-Regular", fontSize: 12.5, color: colors.textMuted, marginTop: 6, lineHeight: 17 }}>
                    {review.comment}
                  </Text>
                ) : null}
                <Text style={{ fontFamily: "Inter-Regular", fontSize: 10.5, color: "#A1A1AA", marginTop: 6 }}>
                  {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
