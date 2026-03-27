"use client";
import { useQuery } from "@tanstack/react-query";
import { useAddressStore } from "@/lib/address-store";
import { frontendEnv } from "@/lib/env";
import type { StorefrontBanner } from "@/lib/storefront";

export function useBanners() {
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );

  const storeId = selectedLocation?.storeId;
  const pincode = selectedLocation?.pincode || selectedAddress?.pincode;

  const query = useQuery({
    queryKey: ["storefront", "banners", storeId, pincode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (storeId) params.set("storeId", storeId);
      if (pincode) params.set("pincode", pincode);
      const qs = params.toString();
      const url = `${frontendEnv.apiUrl}/product/api/get-banners${qs ? `?${qs}` : ""}`;
      const res = await fetch(url, { next: { revalidate: 600 } } as RequestInit);
      if (!res.ok) throw new Error("Failed to fetch banners");
      const data = await res.json();
      return Array.isArray(data.banners)
        ? data.banners.filter((b: StorefrontBanner) => b.isActive)
        : [];
    },
    staleTime: 1000 * 60 * 10,
  });

  return {
    ...query,
    banners: (query.data || []) as StorefrontBanner[],
  };
}
