"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCarouselSection } from "@/components/sections/product-carousel-section";
import { useAddressStore } from "@/lib/address-store";
import {
  fetchForYou,
  fetchHomepageSections,
  fetchRecentlyViewed,
  type HomeSection,
} from "@/lib/activity";
import { RealCombosSection } from "./real-combos-section";
import { LazySection } from "./lazy-section";
import { HomeProductSectionSkeleton } from "./home-skeleton";

// Renders the home product rows in the exact Screen-4 order:
//   Fresh Arrivals → Best Sellers → Combos → Recently Viewed
//   → Seasonal Specials → Recommended Products
// Curated rows come from the homepage-sections endpoint; "Recently Viewed" and
// "Recommended Products" are personalised (auth cookie / device id), so this is
// a client component.
//
// Each row is its own component behind a LazySection, so a row's fetch only
// starts once the reader has scrolled near it. Fresh Arrivals and Best Sellers
// sit inside the first viewport and therefore still load immediately.
export function HomeActivitySections() {
  return (
    <>
      <CuratedRail
        sectionKey="fresh-arrivals"
        fallbackTitle="Fresh Arrivals"
        subtitle="Just in, freshly stocked"
      />
      <CuratedRail
        sectionKey="best-sellers"
        fallbackTitle="Best Sellers"
        subtitle="Customer favourites"
      />

      {/* Real combo bundles take this slot; if a store hasn't created one yet,
          fall back to the older tag/category-based "Combos" row. */}
      <LazySection fallback={<HomeProductSectionSkeleton />}>
        <RealCombosSection
          fallback={
            <CuratedRail
              sectionKey="combos"
              fallbackTitle="Combos"
              subtitle="Bundled & better value"
              eager
            />
          }
        />
      </LazySection>

      <LazySection fallback={<HomeProductSectionSkeleton />}>
        <RecentlyViewedRail />
      </LazySection>

      <CuratedRail
        sectionKey="seasonal"
        fallbackTitle="Seasonal Specials"
        subtitle="Limited-time seasonal picks"
      />

      <LazySection fallback={<HomeProductSectionSkeleton />}>
        <RecommendedRail />
      </LazySection>
    </>
  );
}

// Every homepage query is scoped to the store the customer is buying from. A
// customer may not have picked a store explicitly this session, only a
// pincode/city from an address, so fall back through both.
function useHomeLocationParams() {
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );

  const params = {
    storeId: selectedLocation?.storeId,
    pincode: selectedLocation?.pincode || selectedAddress?.pincode,
    city: selectedLocation?.city || selectedAddress?.city,
  };

  return { params, locationKey: `${params.storeId ?? ""}|${params.pincode ?? ""}` };
}

interface CuratedRailProps {
  sectionKey: string;
  fallbackTitle: string;
  subtitle?: string;
  /** Skip the visibility gate — for a rail already rendered inside one. */
  eager?: boolean;
}

// All curated rails share one homepage-sections response; React Query dedupes
// them by key, so mounting them at different times still costs a single request.
function CuratedRail({ sectionKey, fallbackTitle, subtitle, eager }: CuratedRailProps) {
  const rail = <CuratedRailContent sectionKey={sectionKey} fallbackTitle={fallbackTitle} subtitle={subtitle} />;

  if (eager) return rail;

  return <LazySection fallback={<HomeProductSectionSkeleton />}>{rail}</LazySection>;
}

function CuratedRailContent({
  sectionKey,
  fallbackTitle,
  subtitle,
}: Omit<CuratedRailProps, "eager">) {
  const { params, locationKey } = useHomeLocationParams();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["home-sections", locationKey],
    queryFn: () => fetchHomepageSections(params),
    staleTime: 1000 * 60 * 5,
  });

  const section: HomeSection | undefined = sections.find((s) => s.key === sectionKey);
  if (!section && !isLoading) return null;

  return (
    <ProductCarouselSection
      title={section?.title ?? fallbackTitle}
      subtitle={subtitle}
      products={section?.products ?? []}
      variant="compact"
      isLoading={isLoading}
      viewAllHref="/search"
    />
  );
}

function RecentlyViewedRail() {
  const { params, locationKey } = useHomeLocationParams();

  const { data: recentlyViewed = [], isLoading } = useQuery({
    queryKey: ["recently-viewed", locationKey],
    queryFn: () => fetchRecentlyViewed(params),
    staleTime: 1000 * 60 * 2,
  });

  if (!isLoading && recentlyViewed.length === 0) return null;

  return (
    <ProductCarouselSection
      title="Recently Viewed"
      subtitle="Pick up where you left off"
      products={recentlyViewed}
      variant="compact"
      isLoading={isLoading}
      viewAllHref="/search"
    />
  );
}

function RecommendedRail() {
  const { params, locationKey } = useHomeLocationParams();

  const { data: forYou = [], isLoading } = useQuery({
    queryKey: ["for-you", locationKey],
    queryFn: () => fetchForYou(params),
    staleTime: 1000 * 60 * 5,
  });

  if (!isLoading && forYou.length === 0) return null;

  return (
    <ProductCarouselSection
      title="Recommended Products"
      subtitle="Recommended based on your interest"
      products={forYou}
      variant="compact"
      isLoading={isLoading}
      viewAllHref="/search"
    />
  );
}
