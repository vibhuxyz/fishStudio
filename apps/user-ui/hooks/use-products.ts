"use client";

import { useQuery } from "@tanstack/react-query";
import {
  allProducts,
  displayBestsellers,
  displayFavorites,
  getProductsByCategory,
  getProductsBySubCategory,
  siteConfig,
  categorySlugMap,
} from "@/lib/data";
import type { Product } from "@/lib/types";

/** Fetch all products (client-side from static data) */
export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => allProducts,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Fetch products by category slug */
export function useCategoryProducts(slug: string) {
  const categoryName = categorySlugMap[slug] || "";
  return useQuery<Product[]>({
    queryKey: ["products", "category", slug],
    queryFn: () => getProductsByCategory(categoryName),
    enabled: !!categoryName,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Fetch products by subcategory name */
export function useSubCategoryProducts(subCategory: string | null) {
  return useQuery<Product[]>({
    queryKey: ["products", "subcategory", subCategory],
    queryFn: () => (subCategory ? getProductsBySubCategory(subCategory) : []),
    enabled: !!subCategory,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Fetch bestseller products */
export function useBestsellers() {
  return useQuery<Product[]>({
    queryKey: ["products", "bestsellers"],
    queryFn: () => displayBestsellers,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Fetch favorite products */
export function useFavorites() {
  return useQuery<Product[]>({
    queryKey: ["products", "favorites"],
    queryFn: () => displayFavorites,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Get a single product by slug */
export function useProduct(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return useQuery<Product | undefined>({
    queryKey: ["product", slug],
    queryFn: () =>
      allProducts.find(
        (p) => p.name.toLowerCase().replace(/[\s/]+/g, "-") === decodedSlug
      ),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Get site configuration */
export function useSiteConfig() {
  return useQuery({
    queryKey: ["siteConfig"],
    queryFn: () => siteConfig,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
