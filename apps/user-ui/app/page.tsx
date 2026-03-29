import { Suspense } from "react";
import { HeroBanners } from "./_components/hero-banners";
import { HomeProductsPrimary, HomeProductsSecondary } from "./_components/product-showcase";
import { HomeBannerSkeleton, HomeProductSectionSkeleton } from "./_components/home-skeleton";
import nextDynamic from "next/dynamic";

// Dynamically import non-critical sections
const TestimonialsSection = nextDynamic(
  () => import("@/components/sections/testimonials-section").then(mod => mod.TestimonialsSection),
  { 
    ssr: true,
    loading: () => <div className="h-96 animate-pulse bg-muted/20" /> 
  }
);

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* 1. Hero Banners - Streamed Instantly */}
        <Suspense fallback={<HomeBannerSkeleton />}>
          <HeroBanners />
        </Suspense>

        <div className="flex flex-col gap-0 md:gap-4">
          {/* 2. Primary Showcase - Topmost Carousel (8 items) */}
          <Suspense fallback={<HomeProductSectionSkeleton />}>
            <HomeProductsPrimary />
          </Suspense>

          {/* 3. Secondary Showcase - The rest of the carousels (32 items total pool) */}
          <Suspense fallback={<HomeProductSectionSkeleton />}>
            <HomeProductsSecondary />
          </Suspense>
        </div>

        {/* 4. Social Proof / Testimonials - Dynamically Loaded */}
        <TestimonialsSection />
      </main>
    </div>
  );
}
