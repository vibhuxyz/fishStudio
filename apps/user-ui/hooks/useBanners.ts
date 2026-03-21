"use client";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStorefrontBanners,
  storefrontKeys,
} from "@/lib/storefront";

export function useBanners() {
  const query = useQuery({
    queryKey: storefrontKeys.banners,
    queryFn: fetchStorefrontBanners,
    staleTime: 1000 * 60 * 10,
  });

  return {
    ...query,
    banners: query.data || [],
  };
}
