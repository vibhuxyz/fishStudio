"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import type { BackendProduct, Product } from "@repo/types";

interface ProductsResponse {
  success: boolean;
  products: BackendProduct[];
}

// Helper to transform Backend Data -> Frontend Data
export const transformProduct = (bp: BackendProduct): Product => {
  return {
    id: bp.id,
    name: bp.title,
    slug: bp.slug,
    description: bp.short_description,

    // Main image
    image: bp.images?.[0]?.url || "/placeholder.svg",

    // ✅ ADD THIS LINE HERE TOO (Crucial for Detail Page)
    images: bp.images?.map((img) => img.url) || [],

    price: bp.sale_price,
    originalPrice:
      bp.regular_price > bp.sale_price ? bp.regular_price : undefined,

    // ... rest of your fields (sizes, cuttingTypes, etc.)
    weight: bp.sizes?.[0] || "1kg",
    sizes: bp.sizes || [],
    rating: bp.ratings || 0,
    totalSold: bp.totalSold || 0,
    subCategory: bp.subCategory,
    category: bp.category,
    stock: bp.stock,
    cuttingTypes: bp.cuttingTypes || [],
    pieceSizes: bp.pieceSizes || [],
    processingWeightLoss: bp.processingWeightLoss,
    isBestseller: (bp.totalSold || 0) > 50,
    isFavorite: Array.isArray(bp.favorites) && bp.favorites.length > 0,
  };
};

export function useProducts() {
  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get<ProductsResponse>(
        "/product/api/get-all-products",
      );

      if (!res.data.products) return [];

      // Transform raw backend data to UI friendly data
      return res.data.products.map(transformProduct);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const allProducts = query.data || [];

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
