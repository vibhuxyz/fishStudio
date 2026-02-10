import type { BackendProduct, Product } from "@repo/types";

export const transformProduct = (bp: BackendProduct): Product => {
  return {
    id: bp.id,
    name: bp.title,
    slug: bp.slug,
    description: bp.short_description,

    // Main image fallback
    image: bp.images?.[0]?.url || "/placeholder.svg",

    // ✅ THIS IS THE CRITICAL FIX
    // Map ALL backend images to the frontend array
    images: bp.images?.map((img) => img.url) || [],

    price: bp.sale_price,
    originalPrice:
      bp.regular_price > bp.sale_price ? bp.regular_price : undefined,

    // Size Logic
    weight: bp.sizes?.[0] || "1kg",
    sizes: bp.sizes || [],

    rating: bp.ratings || 0,
    totalSold: bp.totalSold || 0,
    subCategory: bp.subCategory,
    category: bp.category,
    stock: bp.stock,

    // Dropdowns
    cuttingTypes: bp.cuttingTypes || [],
    pieceSizes: bp.pieceSizes || [],
    processingWeightLoss: bp.processingWeightLoss,

    isBestseller: (bp.totalSold || 0) > 50,
    isFavorite: Array.isArray(bp.favorites) && bp.favorites.length > 0,
  };
};
