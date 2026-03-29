import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";

export function HomeBannerSkeleton() {
  return (
    <section className="w-full px-2 py-2 sm:px-4 sm:py-4 md:px-6">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-muted animate-pulse"
        style={{ paddingBottom: "33.33%" }}
      />
    </section>
  );
}

export function HomeProductSectionSkeleton() {
  return (
    <section className="px-3 py-6 sm:px-4 sm:py-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden px-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[200px] flex-shrink-0 md:w-[240px]">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <HomeBannerSkeleton />
      <HomeProductSectionSkeleton />
      <HomeProductSectionSkeleton />
    </div>
  );
}
