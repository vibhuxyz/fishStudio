"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchStorefrontProductListing,
  type StorefrontProductListingParams,
  storefrontKeys,
} from "@/lib/storefront";
import { useAddressStore } from "@/lib/address-store";

interface UseInfiniteProductsOptions {
  scope?: StorefrontProductListingParams["scope"];
  category?: string;
  subCategory?: string;
  limit?: number;
  sortBy?: StorefrontProductListingParams["sortBy"];
  onSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasVariants?: boolean;
  enabled?: boolean;
}

export function useInfiniteProducts(options: UseInfiniteProductsOptions = {}) {
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );

  const storeId = selectedLocation?.storeId;
  const pincode = selectedLocation?.pincode || selectedAddress?.pincode;
  const city = selectedLocation?.city || selectedAddress?.city;

  const baseParams: StorefrontProductListingParams = {
    storeId,
    pincode,
    city,
    category: options.category,
    subCategory: options.subCategory,
    scope: options.scope,
    limit: options.limit ?? 20,
    sortBy: options.sortBy,
    onSale: options.onSale,
    minPrice: options.minPrice,
    maxPrice: options.maxPrice,
    hasVariants: options.hasVariants,
  };

  const query = useInfiniteQuery({
    queryKey: [
      ...storefrontKeys.productListing({ ...baseParams, page: 0 }),
      "infinite",
    ],
    queryFn: ({ pageParam }) =>
      fetchStorefrontProductListing({ ...baseParams, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore
        ? (lastPage.pagination.nextCursor ?? undefined)
        : undefined,
    staleTime: 1000 * 60 * 5,
    enabled: options.enabled !== false,
  });

  const allProducts = query.data?.pages.flatMap((p) => p.products) ?? [];
  const store = query.data?.pages[0]?.store;
  const pagination = query.data?.pages[query.data.pages.length - 1]?.pagination;
  // A whole-category facet, identical on every page — take it from the first.
  const subCategoryCounts = query.data?.pages[0]?.subCategoryCounts;
  const categoryTotal = query.data?.pages[0]?.categoryTotal;

  return {
    ...query,
    allProducts,
    store,
    pagination,
    subCategoryCounts,
    categoryTotal,
  };
}
