import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

interface Banner {
  id: string;
  imageUrl: string;
  fileId: string;
  isActive: boolean;
  sellerId: string;
  bannerType?: string;
  title?: string;
  subtitle?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = SCREEN_WIDTH * 0.42; // ~3:1 ratio matching web's 33%

async function fetchBanners(): Promise<Banner[]> {
  const { data } = await axiosInstance.get("/product/api/get-banners");
  return Array.isArray(data.banners)
    ? data.banners.filter((b: Banner) => b.isActive)
    : [];
}

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["storefront-banners"],
    queryFn: fetchBanners,
    staleTime: 1000 * 60 * 10, // 10 min — matches web's revalidate: 600
  });

  const total = banners.length;

  const scrollTo = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
      setCurrent(index);
    },
    []
  );

  const next = useCallback(() => {
    if (total === 0) return;
    const nextIndex = (current + 1) % total;
    scrollTo(nextIndex);
  }, [current, total, scrollTo]);

  // Auto-advance every 4 seconds — same as web
  useEffect(() => {
    if (total <= 1) return;
    autoPlayRef.current = setInterval(next, 4000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [next, total]);

  const handleScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrent(index);
  };

  // Skeleton
  if (isLoading) {
    return (
      <View
        className="mx-4 my-3 rounded-2xl bg-muted overflow-hidden"
        style={{ height: BANNER_HEIGHT }}
      />
    );
  }

  // No active banners — show nothing (same as web)
  if (total === 0) return null;

  return (
    <View className="mx-4 my-3">
      <View
        className="rounded-2xl overflow-hidden"
        style={{ height: BANNER_HEIGHT }}
      >
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
            <TouchableOpacity
              key={banner.id}
              activeOpacity={0.95}
              style={{ width: SCREEN_WIDTH - 32, height: BANNER_HEIGHT }}
            >
              <Image
                source={{ uri: banner.imageUrl }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dot indicators */}
        {total > 1 && (
          <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
            {banners.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => scrollTo(i)}>
                <View
                  className={`h-2 rounded-full bg-white ${
                    i === current ? "w-6 opacity-100" : "w-2 opacity-50"
                  }`}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
