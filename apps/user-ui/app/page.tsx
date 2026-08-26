import { Suspense } from "react";

export const dynamic = "force-dynamic";
import { HeroBanners } from "./_components/hero-banners";
import { HomeActivitySections } from "./_components/home-activity-sections";
import { AllProductsSection } from "./_components/all-products-section";
import { HomeBannerSkeleton } from "./_components/home-skeleton";
import nextDynamic from "next/dynamic";

// Dynamically import non-critical sections
const TestimonialsSection = nextDynamic(
  () => import("@/components/sections/testimonials-section").then(mod => mod.TestimonialsSection),
  {
    ssr: true,
    loading: () => <div className="h-96 animate-pulse bg-muted/20" />
  }
);

export default async function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* pb on mobile leaves room for the fixed bottom navigation */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* 1. Hero banner */}
        <Suspense fallback={<HomeBannerSkeleton />}>
          <HeroBanners />
        </Suspense>

        {/* 2–7. Fresh Arrivals · Best Sellers · Combos · Recently Viewed ·
                 Seasonal Specials · Recommended Products */}
        <div className="flex flex-col gap-0 md:gap-4">
          <HomeActivitySections />
        </div>

        {/* 8. All Products — infinite scroll */}
        <AllProductsSection />

        {/* Social proof */}
        <TestimonialsSection />
      </main>
    </div>
  );
}
