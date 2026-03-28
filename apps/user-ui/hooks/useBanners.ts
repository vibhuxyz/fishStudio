"use client";
import { useQuery } from "@tanstack/react-query";
import { useAddressStore } from "@/lib/address-store";
import {
  fetchStorefrontBanners,
  type StorefrontBanner,
} from "@/lib/storefront";

export function useBanners(initialData?: StorefrontBanner[]) {
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );

  const storeId = selectedLocation?.storeId;
  const pincode = selectedLocation?.pincode || selectedAddress?.pincode;

  const query = useQuery({
    queryKey: ["storefront", "banners", storeId, pincode],
    queryFn: () => fetchStorefrontBanners({ storeId, pincode }),
    staleTime: 1000 * 60 * 10,
    initialData: !storeId && !pincode ? initialData : undefined,
  });

  return {
    ...query,
    banners: (query.data || []) as StorefrontBanner[],
  };
}
