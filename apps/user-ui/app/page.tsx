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

  if (isError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <p className="text-red-500">Failed to load products.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const ourProducts = allProducts.slice(0, 8);

  return (
    <div className="flex min-h-screen flex-col">
      {/*<SiteHeader />*/}

      <main className="flex-1">
        {/*<HeroSection />*/}
        <OfferCarousel />

        <ProductCarouselSection
          title="Live-Cut. Fresh. Packed For You."
          subtitle="Our Products"
          products={ourProducts}
          priorityImages
          variant="compact"
          isLoading={isLoading}
        />

        <ProductCarouselSection
          title="Quick Delivery FAV"
          subtitle="Customer Favorites"
          products={displayFavorites}
          variant="compact"
          isLoading={isLoading}
        />

        <ProductCarouselSection
          title="Live-Cut. Fresh. Packed For You."
          subtitle="Bestsellers"
          products={displayBestsellers}
          variant="full"
          isLoading={isLoading}
        />

        <TestimonialsSection />
      </main>

      {/*<SiteFooter />*/}
    </div>
  );
}
