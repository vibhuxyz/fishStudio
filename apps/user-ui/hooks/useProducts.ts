"use client";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStorefrontProducts,
  storefrontKeys,
} from "@/lib/storefront";

import { useAddressStore } from "@/lib/address-store";

export function useProducts() {
  const { selectedLocation } = useAddressStore();
  const storeId = selectedLocation?.storeId;
  const pincode = selectedLocation?.pincode;

  const query = useQuery({
    queryKey: storefrontKeys.products(storeId || pincode),
    queryFn: () => fetchStorefrontProducts(storeId, pincode),
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

  // Helper functions exposed directly from the hook
  const getProductsByCategory = (category: string) =>
    allProducts.filter((p) => p.category === category);

  return {
    ...query,
    allProducts,
    bestsellerProducts,
    favoriteProducts,
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
