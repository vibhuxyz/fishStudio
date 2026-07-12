import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Banner {
  id: string;
  imageUrl: string;
  fileId: string;
  isActive: boolean;
  sellerId: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = SCREEN_WIDTH * 0.62;
const CARD_WIDTH = SCREEN_WIDTH - 32;

async function fetchBanners(): Promise<Banner[]> {
  const { data } = await axiosInstance.get("/product/api/get-banners");
  return Array.isArray(data.banners)
    ? data.banners.filter((b: Banner) => b.isActive)
    : [];
}

// Fallback banner shown when no banners are returned from the API
const FALLBACK_BANNER: Banner = {
  id: "fallback",
  imageUrl:
    "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&h=500&fit=crop",
  fileId: "",
  isActive: true,
  sellerId: "",
  title: "Delivered\nSuper fresh",
  ctaText: "Place your order",
};

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: fetchedBanners = [], isLoading } = useQuery({
    queryKey: ["storefront-banners"],
    queryFn: fetchBanners,
    staleTime: 1000 * 60 * 10,
  });

  const banners = fetchedBanners.length > 0 ? fetchedBanners : [FALLBACK_BANNER];
  const total = banners.length;

  const scrollTo = useCallback((index: number) => {
    scrollRef.current?.scrollTo({ x: index * CARD_WIDTH, animated: true });
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    scrollTo((current + 1) % total);
  }, [current, total, scrollTo]);

  useEffect(() => {
    if (total <= 1) return;
    autoPlayRef.current = setInterval(next, 4000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [next, total]);

  const handleScrollEnd = (e: any) => {
    setCurrent(Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH));
  };

  if (isLoading) {
    return (
      <View
        className="mx-4 my-3 rounded-3xl bg-muted overflow-hidden"
        style={{ height: BANNER_HEIGHT }}
      />
    );
  }

  return (
    <View className="mx-4 my-3">
      <View className="rounded-3xl overflow-hidden" style={{ height: BANNER_HEIGHT }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          decelerationRate="fast"
        >
          {banners.map((banner, i) => (
            <View key={banner.id} style={{ width: CARD_WIDTH, height: BANNER_HEIGHT }}>
              {/* Background image */}
              <Image
                source={{ uri: banner.imageUrl }}
                style={{ width: "100%", height: "100%", position: "absolute" }}
                resizeMode="cover"
              />

              {/* Dark gradient overlay on top ~60% */}
              <LinearGradient
                colors={["rgba(48,8,97,0.85)", "rgba(48,8,97,0.6)", "transparent"]}
                style={{ position: "absolute", left: 0, right: 0, top: 0, height: "65%" }}
              />

              {/* Text content */}
              <View style={{ position: "absolute", top: 24, left: 20, right: 20 }}>
                <Text
                  style={{
                    fontFamily: "Inter-Bold",
                    fontSize: 32,
                    color: "#FFFFFF",
                    lineHeight: 38,
                    letterSpacing: -0.5,
                  }}
                >
                  {banner.title || "Delivered\nSuper fresh"}
                </Text>
              </View>

              {/* Place your order button */}
              <View
                style={{
                  position: "absolute",
                  bottom: 36,
                  left: 0,
                  right: 0,
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.92)",
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 50,
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 5,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter-SemiBold",
                      fontSize: 15,
                      color: "#1A1C1C",
                      marginRight: 8,
                    }}
                  >
                    {banner.ctaText || "Place your order"}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#1A1C1C" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Dot indicators */}
        {total > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {banners.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => scrollTo(i)}>
                <View
                  style={{
                    width: i === current ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    borderWidth: 1.5,
                    borderColor: "rgba(255,255,255,0.8)",
                    backgroundColor: i === current ? "rgba(255,255,255,0.9)" : "transparent",
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
