"use client";
import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStorefrontProductListing,
  type StorefrontProductListingParams,
  type StorefrontProductListingResponse,
  storefrontKeys,
} from "@/lib/storefront";

import { useAddressStore } from "@/lib/address-store";

interface UseProductsOptions {
  initialData?: StorefrontProductListingResponse;
  scope?: StorefrontProductListingParams["scope"];
  category?: string;
  subCategory?: string;
  limit?: number;
  page?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddressId = useAddressStore((s) => s.selectedAddressId);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );

  // Use selectedLocation first, fall back to selected address pincode
  const storeId = selectedLocation?.storeId;
  const pincode = selectedLocation?.pincode || selectedAddress?.pincode;
  const city = selectedLocation?.city || selectedAddress?.city;

  const listingParams: StorefrontProductListingParams = {
    storeId,
    pincode,
    city,
    category: options.category,
    subCategory: options.subCategory,
    scope: options.scope,
    limit: options.limit,
    page: options.page,
  };

  const query = useQuery({
    queryKey:
      options.category ||
      options.subCategory ||
      options.scope ||
      options.limit ||
      options.page
        ? storefrontKeys.productListing(listingParams)
        : storefrontKeys.products(storeId, pincode, city),
    queryFn: () => fetchStorefrontProductListing(listingParams),
    staleTime: 1000 * 60 * 5,
    initialData:
      !storeId && !pincode && !city ? options.initialData : undefined,
  });

  const rawProducts = query.data?.products || [];

  // Deduplicate + derive all computed lists in a single memo
  const {
    allProducts,
    bestsellerProducts,
    favoriteProducts,
    randomCategory,
    randomCategoryProducts,
  } = useMemo(() => {
    const deduped = Array.from(
      new Map(rawProducts.map((p) => [p.id, p])).values(),
    );

    const bestsellers = deduped
      .filter((p) => p.isBestseller)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 8);

    const favorites = deduped.filter((p) => p.isFavorite).slice(0, 8);

    const categories = Array.from(new Set(deduped.map((p) => p.category)));
    const twoHourSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 2));
    const randomCatIndex = twoHourSeed % (categories.length || 1);
    const randCat = categories[randomCatIndex] || "";
    const randCatProducts = deduped
      .filter((p) => p.category === randCat)
      .slice(0, 8);

    return {
      allProducts: deduped,
      bestsellerProducts: bestsellers,
      favoriteProducts: favorites,
      randomCategory: randCat,
      randomCategoryProducts: randCatProducts,
    };
  }, [rawProducts]);

  const getProductsByCategory = useCallback(
    (category: string) => allProducts.filter((p) => p.category === category),
    [allProducts],
  );

  return {
    ...query,
    listing: query.data,
    pagination: query.data?.pagination,
    store: query.data?.store,
    isServiceable: query.data?.isServiceable ?? true,
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
