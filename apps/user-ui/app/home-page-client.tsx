"use client";

import { Component, type ReactNode } from "react";
import { OfferCarousel } from "@/components/sections/offer-carousel";
import { ProductCarouselSection } from "@/components/sections/product-carousel-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { useProducts } from "@/hooks/useProducts";
import type {
  StorefrontBanner,
  StorefrontProductListingResponse,
} from "@/lib/storefront";

interface HomePageClientProps {
  initialBanners: StorefrontBanner[];
  initialProductListing?: StorefrontProductListingResponse;
}

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

function ProductSections({
  initialProductListing,
}: {
  initialProductListing?: StorefrontProductListingResponse;
}) {
  const {
    allProducts,
    displayBestsellers,
    displayFavorites,
    randomCategory,
    randomCategoryProducts,
    isLoading,
    isError,
  } = useProducts({
    initialData: initialProductListing,
    scope: "homepage",
    limit: initialProductListing?.pagination.limit ?? 32,
  });

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
          ),
        )}
      </>
    );
  }

  const ourProducts = allProducts.slice(0, 8);

  return (
    <>
      <ProductCarouselSection
        title="Live-Cut. Fresh. Packed For You."
        subtitle="Customer Favorite Product"
        products={ourProducts}
        priorityImages
        variant="compact"
        isLoading={isLoading}
        viewAllHref="/search"
      />
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

export function HomePageClient({
  initialBanners,
  initialProductListing,
}: HomePageClientProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <SectionErrorBoundary label="Banner">
          <OfferCarousel initialBanners={initialBanners} />
        </SectionErrorBoundary>

        <ProductSections initialProductListing={initialProductListing} />

        <SectionErrorBoundary label="Testimonials">
          <TestimonialsSection />
        </SectionErrorBoundary>
      </main>
    </div>
  );
}
