"use client";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStorefrontProducts,
  storefrontKeys,
} from "@/lib/storefront";

import { useAddressStore } from "@/lib/address-store";

export function useProducts() {
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddressId = useAddressStore((s) => s.selectedAddressId);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );

  // Use selectedLocation first, fall back to selected address pincode
  const storeId = selectedLocation?.storeId;
  const pincode = selectedLocation?.pincode || selectedAddress?.pincode;
  const city = selectedLocation?.city || selectedAddress?.city;
 
  const query = useQuery({
    queryKey: storefrontKeys.products(storeId, pincode, city),
    queryFn: () => fetchStorefrontProducts(storeId, pincode, city),
    staleTime: 1000 * 60 * 5,
  });

  const rawProducts = query.data || [];
  // Deduplicate products by ID to prevent duplicate key errors in UI components
  const allProducts = Array.from(
    new Map(rawProducts.map((p) => [p.id, p])).values(),
  );

  // Derive categories on the fly
  const bestsellerProducts = allProducts
    .filter((p) => p.isBestseller)
    .sort((a, b) => b.totalSold - a.totalSold) // Sort by highest sales
    .slice(0, 8);

  const favoriteProducts = allProducts.filter((p) => p.isFavorite).slice(0, 8);

  // 3. Random Category Section (Rotates every 2 hours)
  const categories = Array.from(new Set(allProducts.map((p) => p.category)));
  const twoHourSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 2));
  const randomCategoryIndex = twoHourSeed % (categories.length || 1);
  const randomCategory = categories[randomCategoryIndex] || "";
  const randomCategoryProducts = allProducts
    .filter((p) => p.category === randomCategory)
    .slice(0, 8);

  // Helper functions exposed directly from the hook
  const getProductsByCategory = (category: string) =>
    allProducts.filter((p) => p.category === category);

  return {
    ...query,
    allProducts,
    bestsellerProducts,
    favoriteProducts,
    randomCategory,
    randomCategoryProducts,
    getProductsByCategory,
    // Fallback logic: If no bestsellers, just show top products
    displayBestsellers:
      bestsellerProducts.length >= 4
        ? bestsellerProducts
        : allProducts.slice(0, 8),
    displayFavorites:
      favoriteProducts.length >= 4
        ? favoriteProducts
        : allProducts.slice(4, 12),
  };
}
