"use client";

import { ProductCarouselSection } from "@/components/sections/product-carousel-section";
import { useProducts } from "@/hooks/useProducts";
import type { StorefrontProductListingResponse } from "@/lib/storefront";

export function ProductSectionsPrimary({
  initialProductListing,
}: {
  initialProductListing?: StorefrontProductListingResponse;
}) {
  const { allProducts, isLoading, isError } = useProducts({
    initialData: initialProductListing,
    scope: "homepage",
    limit: 8,
  });

  if (isError) return null;

  return (
    <ProductCarouselSection
      title="Live-Cut. Fresh. Packed For You."
      subtitle="Fresh Arrival"
      products={allProducts.slice(0, 8)}
      priorityImages
      variant="compact"
      isLoading={isLoading}
      viewAllHref="/search"
    />
  );
}

export function ProductSectionsSecondary({
  initialProductListing,
}: {
  initialProductListing?: StorefrontProductListingResponse;
}) {
  const {
    displayBestsellers,
    displayFavorites,
    randomCategory,
    randomCategoryProducts,
    isLoading,
    isError,
  } = useProducts({
    initialData: initialProductListing,
    scope: "homepage",
    // We already have the first 8, but for the complex derivative logic 
    // (Bestsellers, Favorites) we need the broader dataset
    limit: 32, 
  });

  if (isError) return null;

  return (
    <>
      <ProductCarouselSection
        title="Quick Delivery FAV"
        subtitle="Customer Favorites"
        products={displayFavorites}
        variant="compact"
        isLoading={isLoading}
        viewAllHref="/search"
      />
      <ProductCarouselSection
        title="Live-Cut. Fresh. Packed For You."
        subtitle="Bestsellers"
        products={displayBestsellers}
        variant="full"
        isLoading={isLoading}
        viewAllHref="/search"
      />

      {randomCategory && randomCategoryProducts.length > 0 && (
        <ProductCarouselSection
          title={`Best of ${randomCategory}`}
          subtitle="Explore More"
          products={randomCategoryProducts}
          variant="compact"
          isLoading={isLoading}
          viewAllHref={`/category/${randomCategory.toLowerCase()}`}
        />
      )}
    </>
  );
}
