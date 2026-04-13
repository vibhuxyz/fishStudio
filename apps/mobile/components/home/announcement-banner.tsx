import { useAddressStore } from "@/lib/address-store";
import axiosInstance from "@/utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

interface AnnouncementBanner {
  id: string;
  title: string;
  subtitle?: string;
  price?: number;
  imageUrl?: string;
  isActive: boolean;
}

export default function AnnouncementBanner() {
  const { selectedLocation, selectedAddressId, addresses } = useAddressStore();
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const city = selectedLocation?.city || selectedAddress?.city;
  const storeId = selectedLocation?.storeId || undefined;
  const pincode = selectedLocation?.pincode || selectedAddress?.pincode;

  const hasLocation = !!(city || storeId || pincode);

  const { data: banners = [] } = useQuery<AnnouncementBanner[]>({
    queryKey: ["announcement-banners", city, storeId, pincode],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (city) params.city = city;
      if (storeId) params.storeId = storeId;
      const res = await axiosInstance.get("/product/api/get-announcement-banners", { params });
      const data = res.data;
      return Array.isArray(data.banners)
        ? data.banners.filter((b: AnnouncementBanner) => b.isActive)
        : [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: hasLocation,
    retry: false,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setCurrentIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[currentIndex];

  return (
    <View style={{ backgroundColor: "#1E1B4B" }}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 8,
        }}
      >
        <Ionicons name="megaphone-outline" size={14} color="#FCD34D" />
        <Text
          numberOfLines={1}
          style={{ color: "#FCD34D", fontFamily: "Poppins-Bold", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {banner.title}
        </Text>
        {banner.subtitle ? (
          <Text numberOfLines={1} style={{ color: "#C4B5FD", fontFamily: "Poppins-Medium", fontSize: 11 }}>
            {banner.subtitle}
          </Text>
        ) : null}
        {banner.price ? (
          <Text style={{ color: "#fff", fontFamily: "Poppins-Bold", fontSize: 11 }}>
            ₹{banner.price}
          </Text>
        ) : null}
      </Animated.View>

      {/* Dot indicators */}
      {banners.length > 1 && (
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, paddingBottom: 4 }}>
          {banners.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentIndex(i)}
              style={{
                height: 2,
                borderRadius: 2,
                backgroundColor: i === currentIndex ? "#FCD34D" : "#4C1D95",
                width: i === currentIndex ? 16 : 6,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
