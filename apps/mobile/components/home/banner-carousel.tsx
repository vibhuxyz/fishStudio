import { colors, radii, spacing } from "@/constants/theme";
import axiosInstance from "@/utils/axiosInstance";
import { cloudinaryThumbnail } from "@/utils/cloudinary";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from "react-native";

export interface Banner {
  id: string;
  imageUrl: string;
  fileId: string;
  isActive: boolean;
  sellerId: string;
  category?: string | null;
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - spacing[4] * 2;
// The comps ship the headline, copy and CTA baked into the artwork, so the card
// is sized to the source image rather than to any text we'd draw over it. Kept
// to the comp's ratio so the category row still lands above the fold.
const BANNER_HEIGHT = CARD_WIDTH * 0.38;

async function fetchBanners(): Promise<Banner[]> {
  const { data } = await axiosInstance.get("/product/api/get-banners");
  return Array.isArray(data.banners)
    ? data.banners.filter((banner: Banner) => banner.isActive)
    : [];
}

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["storefront-banners"],
    queryFn: fetchBanners,
    staleTime: 1000 * 60 * 10,
  });

  const total = banners.length;

  const scrollTo = useCallback((index: number) => {
    scrollRef.current?.scrollTo({ x: index * CARD_WIDTH, animated: true });
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setCurrent((previous) => {
        const next = (previous + 1) % total;
        scrollRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [total]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCurrent(Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH));
  };

  if (isLoading || total === 0) {
    return (
      <View
        style={{
          height: BANNER_HEIGHT,
          marginHorizontal: spacing[4],
          marginTop: spacing[3],
          marginBottom: spacing[4],
          borderRadius: radii.sm,
          backgroundColor: colors.surfaceAlt,
        }}
      />
    );
  }

  return (
    <View style={{ marginTop: spacing[3], marginBottom: spacing[4] }}>
      <View
        style={{
          height: BANNER_HEIGHT,
          marginHorizontal: spacing[4],
          borderRadius: radii.sm,
          overflow: "hidden",
        }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          decelerationRate="fast"
        >
          {banners.map((banner) => (
            <Pressable
              key={banner.id}
              onPress={() =>
                router.push(
                  banner.category
                    ? {
                        pathname: "/(routes)/category/[slug]",
                        params: { slug: banner.category },
                      }
                    : "/(routes)/products",
                )
              }
              style={{ width: CARD_WIDTH, height: BANNER_HEIGHT }}
            >
              <Image
                source={{ uri: cloudinaryThumbnail(banner.imageUrl, Math.round(CARD_WIDTH * 2)) }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
                accessibilityLabel={banner.title || "Offer banner"}
              />
            </Pressable>
          ))}
        </ScrollView>

        {total > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: spacing[3],
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              gap: spacing[1] + 2,
            }}
          >
            {banners.map((banner, index) => (
              <Pressable
                key={banner.id}
                onPress={() => scrollTo(index)}
                hitSlop={8}
              >
                <View
                  style={{
                    width: spacing[2],
                    height: spacing[2],
                    borderRadius: spacing[1],
                    backgroundColor:
                      index === current ? colors.brandMark : colors.onPanelMuted,
                  }}
                />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
