"use client";

import { Component, type ReactNode } from "react";
import { OfferCarousel } from "@/components/sections/offer-carousel";
import { ProductCarouselSection } from "@/components/sections/product-carousel-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { useProducts } from "@/hooks/useProducts";

// ---- Section-level Error Boundary ----------------------------------------
interface SectionErrorBoundaryState {
  hasError: boolean;
  label: string;
}
class SectionErrorBoundary extends Component<
  { children: ReactNode; label: string },
  SectionErrorBoundaryState
> {
  constructor(props: { children: ReactNode; label: string }) {
    super(props);
    this.state = { hasError: false, label: props.label };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <section className="w-full px-4 py-4 md:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-center rounded-2xl bg-muted/60 py-8">
            <p className="text-sm font-medium text-muted-foreground">
              {this.props.label} not available right now
            </p>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

// ---- Banner fallback card (shown when banners fail to load) ---------------
function BannerFallbackCard() {
  return (
    <section className="w-full px-4 py-4 md:px-6">
      <div className="relative mx-auto flex max-w-7xl items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 py-14">
        <p className="text-base font-semibold tracking-wide text-muted-foreground">
          Banner
        </p>
      </div>
    </section>
  );
}

// ---- Products section with its own error handling -------------------------
function ProductSections() {
  const { allProducts, displayBestsellers, displayFavorites, isLoading, isError } =
    useProducts();

  if (isError) {
    return (
      <>
        {(["Our Products", "Customer Favorites", "Bestsellers"] as const).map(
          (label) => (
            <section key={label} className="px-4 py-10">
              <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-center rounded-2xl bg-muted/60 py-12">
                  <p className="text-sm font-medium text-muted-foreground">
                    {label} not available right now
                  </p>
                </div>
              </div>
            </section>
          )
        )}
      </>
    );
  }

  const ourProducts = allProducts.slice(0, 8);

  return (
    <>
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
    </>
  );
}

// ---- Page -----------------------------------------------------------------
export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">

        <SectionErrorBoundary label="Banner">
          <OfferCarouselWithFallback />
        </SectionErrorBoundary>

        <ProductSections />

        <SectionErrorBoundary label="Testimonials">
          <TestimonialsSection />
        </SectionErrorBoundary>
      </main>
    </div>
  );
}

// Wrap OfferCarousel so a banner-fetch failure shows a placeholder card
function OfferCarouselWithFallback() {
  return (
    <SectionErrorBoundary label="Banner">
      <OfferCarousel />
    </SectionErrorBoundary>
  );
}
