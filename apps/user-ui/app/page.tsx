"use client";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { OfferCarousel } from "@/components/sections/offer-carousel";
import { ProductCarouselSection } from "@/components/sections/product-carousel-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";

import { useProducts } from "@/hooks/useProducts";

export default function Page() {
  const {
    allProducts,
    displayBestsellers,
    displayFavorites,
    isLoading,
    isError,
  } = useProducts();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        {/*<Loader2 className="h-8 w-8 animate-spin text-primary" />*/}
        Data is Loading
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load products.
      </div>
    );
  }

  const ourProducts = allProducts.slice(0, 8);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection />
        {/*<OfferCarousel />*/}

        <ProductCarouselSection
          title="Live-Cut. Fresh. Packed For You."
          subtitle="Our Products"
          products={ourProducts}
          priorityImages
          variant="compact"
        />

        <ProductCarouselSection
          title="Quick Delivery FAV"
          subtitle="Customer Favorites"
          products={displayFavorites}
          variant="compact"
        />

        <ProductCarouselSection
          title="Live-Cut. Fresh. Packed For You."
          subtitle="Bestsellers"
          products={displayBestsellers}
          variant="full"
        />

        <TestimonialsSection />
      </main>

      <SiteFooter />
    </div>
  );
}
