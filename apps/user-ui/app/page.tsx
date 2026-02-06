import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { OfferCarousel } from "@/components/sections/offer-carousel";
import { ProductCarouselSection } from "@/components/sections/product-carousel-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { allProducts, displayBestsellers, displayFavorites } from "@/lib/data";

export default function Page() {
  const ourProducts = allProducts.slice(0, 8);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection />
        <OfferCarousel />

        <ProductCarouselSection
          title="Live-Cut. Fresh. Packed For You."
          subtitle="Our Products"
          products={ourProducts}
          priorityImages
          variant="compact"
        />

        <ProductCarouselSection
          title="Quick Delivery"
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
