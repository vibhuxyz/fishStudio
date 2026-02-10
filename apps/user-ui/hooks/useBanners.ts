"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";

// Types based on your API response
interface Banner {
  id: string;
  imageUrl: string;
  fileId: string;
  isActive: boolean;
  sellerId: string;
}

interface BannersResponse {
  success: boolean;
  banners: Banner[];
}

export function useBanners() {
  const query = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await axiosInstance.get<BannersResponse>(
        "/product/api/get-banners",
      );

      // Filter only active banners
      return res.data.banners.filter((banner) => banner.isActive) || [];
    },
    staleTime: 1000 * 60 * 10, // Banners don't change often, 10 mins is safe
  });

  return {
    ...query,
    banners: query.data || [],
  };
}
