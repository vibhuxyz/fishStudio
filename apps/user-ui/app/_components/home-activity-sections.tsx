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

// Renders the home product rows in the exact Screen-4 order:
//   Fresh Arrivals → Best Sellers → Combos → Recently Viewed
//   → Seasonal Specials → Recommended Products
// Curated rows come from the homepage-sections endpoint; "Recently Viewed" and
// "Recommended Products" are personalised (auth cookie / device id), so this is
// a client component.
export function HomeActivitySections() {
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );

  const params = {
    storeId: selectedLocation?.storeId,
    pincode: selectedLocation?.pincode || selectedAddress?.pincode,
    city: selectedLocation?.city || selectedAddress?.city,
  };
  const locationKey = `${params.storeId ?? ""}|${params.pincode ?? ""}`;

  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["home-sections", locationKey],
    queryFn: () => fetchHomepageSections(params),
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentlyViewed = [] } = useQuery({
    queryKey: ["recently-viewed", locationKey],
    queryFn: () => fetchRecentlyViewed(params),
    staleTime: 1000 * 60 * 2,
  });

  const { data: forYou = [] } = useQuery({
    queryKey: ["for-you", locationKey],
    queryFn: () => fetchForYou(params),
    staleTime: 1000 * 60 * 5,
  });

  const byKey = (key: string): HomeSection | undefined =>
    sections.find((s) => s.key === key);

  const renderSection = (
    key: string,
    fallbackTitle: string,
    subtitle?: string,
  ) => {
    const section = byKey(key);
    if (!section && !sectionsLoading) return null;
    return (
      <ProductCarouselSection
        title={section?.title ?? fallbackTitle}
        subtitle={subtitle}
        products={section?.products ?? []}
        variant="compact"
        isLoading={sectionsLoading}
        viewAllHref="/search"
      />
    );
  };

  return (
    <>
      {renderSection("fresh-arrivals", "Fresh Arrivals", "Just in, freshly stocked")}
      {renderSection("best-sellers", "Best Sellers", "Customer favourites")}
      {/* Real combo bundles take this slot; if a store hasn't created one yet,
          fall back to the older tag/category-based "Combos" row. */}
      <RealCombosSection fallback={renderSection("combos", "Combos", "Bundled & better value")} />

      {recentlyViewed.length > 0 && (
        <ProductCarouselSection
          title="Recently Viewed"
          subtitle="Pick up where you left off"
          products={recentlyViewed}
          variant="compact"
          viewAllHref="/search"
        />
      )}

      {renderSection("seasonal", "Seasonal Specials", "Limited-time seasonal picks")}

      {forYou.length > 0 && (
        <ProductCarouselSection
          title="Recommended Products"
          subtitle="Recommended based on your interest"
          products={forYou}
          variant="compact"
          viewAllHref="/search"
        />
      )}
    </>
  );
}
